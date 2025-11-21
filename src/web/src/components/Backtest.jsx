import { useState, useMemo } from "react";
import "../css/root.css";
import "../css/Backtest.css";
import Plot from "react-plotly.js";
import {
    LiveButton,
    LiveSingleText,
    LiveDateInput,
} from "./LiveUI";
import { SaveStrategyJSON, SendToBackend, ValidateInput } from './Helper';

/**
 * Backtest component with improved, realistic sample data generator
 * - GBM price series with occasional regime shocks
 * - MA crossover trade generation
 * - Position size interpreted as % of capital per trade
 * - Commission applied as fraction (e.g. 0.001)
 * - Theming: reads CSS variables from :root and applies them to Plotly & table
 */

const Backtest = ({ nodes, edges, setErrorMessage }) => {
    // Inputs
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [capital, setCapital] = useState("");
    const [positionSize, setPositionSize] = useState("");
    const [commission, setCommission] = useState("");

    // Outputs
    const [equityDates, setEquityDates] = useState([]);
    const [equityValues, setEquityValues] = useState([]);
    const [drawdowns, setDrawdowns] = useState([]);
    const [trades, setTrades] = useState([]);
    const [metrics, setMetrics] = useState(null);

    // read theme colors from CSS variables (fallback values included)
    const theme = useMemo(() => {
        if (typeof window === "undefined") {
            return {
                primary: "#0a84ff",
                primaryDark: "#0078d4",
                panel: "#f0f6ff",
                surface: "#ffffff",
                fg: "#1e1e1e",
                muted: "#6e6e6e",
                border: "#c8d6f0",
            };
        }
        const s = getComputedStyle(document.documentElement);
        const pick = (name, fallback) => (s.getPropertyValue(name) || fallback).trim() || fallback;
        return {
            primary: pick("--primary", "#0a84ff"),
            primaryDark: pick("--primary-dark", "#0078d4"),
            panel: pick("--panel", "#f0f6ff"),
            surface: pick("--surface", "#ffffff"),
            fg: pick("--fg", "#1e1e1e"),
            muted: pick("--muted", "#6e6e6e"),
            border: pick("--border", "#c8d6f0"),
        };
    }, []);

    // deterministic LCG for repeatability
    function makeRNG(seed) {
        let s = (seed >>> 0) || 1;
        return () => {
            s = (1664525 * s + 1013904223) >>> 0;
            return s / 0xffffffff;
        };
    }

    // return array of Date objects inclusive
    function daterange(start, end) {
        const arr = [];
        const dt = new Date(start);
        while (dt <= end) {
            arr.push(new Date(dt));
            dt.setDate(dt.getDate() + 1);
        }
        return arr;
    }

    // simple moving average
    function sma(arr, idx, period) {
        if (idx - period + 1 < 0) return null;
        let s = 0;
        for (let i = idx - period + 1; i <= idx; ++i) s += arr[i];
        return s / period;
    }

    // compute metrics from equity series and trade list
    function computeMetrics(equityArr, dailyRets, tradeList) {
        if (!equityArr.length) return null;
        const initial = equityArr[0];
        const final = equityArr[equityArr.length - 1];
        const totalReturn = (final / initial - 1) * 100;

        const years = Math.max(equityArr.length / 252, 1 / 252);
        const cagr = (Math.pow(final / initial, 1 / years) - 1) * 100;

        // max drawdown
        let peak = equityArr[0];
        let maxDD = 0;
        for (let v of equityArr) {
            if (v > peak) peak = v;
            const dd = (v - peak) / peak;
            if (dd < maxDD) maxDD = dd;
        }

        // Sharpe from daily returns
        const mean = dailyRets.reduce((a, b) => a + b, 0) / Math.max(dailyRets.length, 1);
        const variance = dailyRets.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / Math.max(dailyRets.length - 1, 1);
        const std = Math.sqrt(Math.max(variance, 1e-12));
        const sharpe = std > 0 ? (mean / std) * Math.sqrt(252) : 0;

        const wins = tradeList.filter(t => t.pnl > 0).length;
        const winRate = tradeList.length ? (wins / tradeList.length) * 100 : 0;

        return {
            initial: Number(initial.toFixed(2)),
            final: Number(final.toFixed(2)),
            totalReturnPct: Number(totalReturn.toFixed(2)),
            cagrPct: Number(cagr.toFixed(2)),
            maxDrawdownPct: Number((maxDD * 100).toFixed(2)),
            sharpe: Number(sharpe.toFixed(3)),
            winRatePct: Number(winRate.toFixed(2)),
            trades: tradeList.length,
        };
    }

    /**
     * Realistic sample backtest generator
     * - Prices via Geometric Brownian Motion (annual mu & sigma), daily dt = 1/252
     * - Occasional regime shocks (volatility bursts)
     * - Trades: short/long SMA crossover (short=5, long=20)
     * - Position size: percent of capital to allocate per trade (e.g., 10 => 10%)
     * - Commission: fraction applied to traded value (e.g., 0.001)
     */
    function generateRealisticBacktest(d1, d2, initCapital, posSizePct, comm) {
        const dates = daterange(d1, d2);
        if (dates.length < 5) {
            // trivial fallback: small time-range -> simple flat series
            const dstr = dates.map(d => d.toISOString().slice(0, 10));
            return {
                dates: dstr,
                equity: Array(dates.length).fill(initCapital),
                drawdowns: Array(dates.length).fill(0),
                trades: [],
                metrics: computeMetrics(Array(dates.length).fill(initCapital), Array(dates.length).fill(0), []),
            };
        }

        const seed = (d1.getTime() ^ d2.getTime() ^ Math.round(initCapital)) >>> 0;
        const rng = makeRNG(seed);

        // GBM params (annualized)
        let mu = 0.08; // drift 8% annually baseline
        let sigma = 0.18; // volatility 18% annually baseline
        const dt = 1 / 252;

        // create price series starting at 100
        const prices = [100];
        // Add small regime switches
        let regimeTimer = 0;
        for (let i = 1; i < dates.length; ++i) {
            if (regimeTimer <= 0 && rng() < 0.03) {
                // flip to a new regime for next 5-20 days
                regimeTimer = 5 + Math.floor(rng() * 15);
                // adjust mu and sigma slightly
                mu = 0.04 + rng() * 0.12; // 4% to 16%
                sigma = 0.12 + rng() * 0.28; // 12% to 40%
            }
            regimeTimer = Math.max(0, regimeTimer - 1);
            // normal GBM increment with a bit of skew
            const z = Math.sqrt(dt) * ( (rng() - 0.5) * 2 ); // standard-like
            const ret = (mu - 0.5 * sigma * sigma) * dt + sigma * z;
            // occasional jump
            const jump = rng() < 0.01 ? (rng() - 0.5) * 0.25 : 0; // 1% chance jump up to +/-12.5%
            const newPrice = Math.max(0.01, prices[i - 1] * Math.exp(ret + jump));
            prices.push(newPrice);
        }

        // generate equity series by applying returns and simulated trades
        const equity = [initCapital];
        const dailyRets = [];
        for (let i = 1; i < prices.length; ++i) {
            dailyRets.push((prices[i] / prices[i - 1]) - 1);
        }

        // generate MA crossover trades
        const tradesLocal = [];
        let position = 0; // 0 = flat, 1 = long
        let entryIdx = null;
        let entryPrice = 0;
        let tradeId = 1;

        // We will track cash + position for precise equity
        let cash = initCapital;
        let heldShares = 0;

        for (let i = 0; i < prices.length; ++i) {
            // compute equity mark-to-market each day
            const mark = cash + heldShares * prices[i];
            if (i > 0) equity.push(mark);

            // compute moving averages for signals (use simple SMA)
            const s = sma(prices, i, 5);
            const l = sma(prices, i, 20);
            const prevS = i - 1 >= 0 ? sma(prices, i - 1, 5) : null;
            const prevL = i - 1 >= 0 ? sma(prices, i - 1, 20) : null;

            // signal: enter long when short crosses above long; exit when short crosses below
            const wantLong = s != null && l != null && s > l;
            const prevWantLong = prevS != null && prevL != null && prevS > prevL;

            // enter
            if (!position && wantLong && i < prices.length - 1) {
                position = 1;
                entryIdx = i;
                entryPrice = prices[i];
                // determine shares using posSizePct of current combined equity (cash + positions)
                const alloc = (posSizePct / 100) * (cash + heldShares * prices[i]);
                const shares = Math.max(1, Math.floor(alloc / entryPrice));
                heldShares += shares;
                const tradeValue = shares * entryPrice;
                const fee = comm * tradeValue;
                cash -= tradeValue + fee;
                tradesLocal.push({
                    id: tradeId++,
                    entryDate: dates[i].toISOString().slice(0, 10),
                    entryPrice: Number(entryPrice.toFixed(2)),
                    size: shares,
                    side: "LONG",
                    exitDate: null,
                    exitPrice: null,
                    pnl: null,
                    pnlPct: null,
                    fees: fee
                });
            }

            // exit
            if (position && !wantLong) {
                // close most recent long (simple FIFO)
                position = 0;
                const exitPrice = prices[i];
                // find last open trade without exit
                for (let j = tradesLocal.length - 1; j >= 0; --j) {
                    if (tradesLocal[j].exitDate == null) {
                        const shares = tradesLocal[j].size;
                        const tradeValue = shares * exitPrice;
                        const fee = comm * tradeValue;
                        // update cash and heldShares
                        cash += tradeValue - fee;
                        heldShares -= shares;
                        const gross = (exitPrice - tradesLocal[j].entryPrice) * shares;
                        const net = gross - tradesLocal[j].fees - fee;
                        tradesLocal[j].exitDate = dates[i].toISOString().slice(0, 10);
                        tradesLocal[j].exitPrice = Number(exitPrice.toFixed(2));
                        tradesLocal[j].pnl = Number(net.toFixed(2));
                        tradesLocal[j].pnlPct = Number(((net / initCapital) * 100).toFixed(3));
                        tradesLocal[j].fees += fee;
                        break;
                    }
                }
            }
        }

        // if any trades remain open, close at last price
        const lastPrice = prices[prices.length - 1];
        for (let j = 0; j < tradesLocal.length; ++j) {
            if (tradesLocal[j].exitDate == null) {
                const shares = tradesLocal[j].size;
                const tradeValue = shares * lastPrice;
                const fee = comm * tradeValue;
                cash += tradeValue - fee;
                const gross = (lastPrice - tradesLocal[j].entryPrice) * shares;
                const net = gross - tradesLocal[j].fees - fee;
                tradesLocal[j].exitDate = dates[dates.length - 1].toISOString().slice(0, 10);
                tradesLocal[j].exitPrice = Number(lastPrice.toFixed(2));
                tradesLocal[j].pnl = Number(net.toFixed(2));
                tradesLocal[j].pnlPct = Number(((net / initCapital) * 100).toFixed(3));
                tradesLocal[j].fees += fee;
            }
        }

        // build final equity array mark-to-market (cash + position value) using daily prices
        const equityFinal = [];
        for (let i = 0; i < prices.length; ++i) {
            // compute outstanding positions at day i from tradesLocal (very approximate)
            // Instead of reconstructing FIFO positions exactly, compute net shares held by tracking trade events
            let netShares = 0;
            for (let t of tradesLocal) {
                const entryIdx = dates.findIndex(d => d.toISOString().slice(0, 10) === t.entryDate);
                const exitIdx = dates.findIndex(d => d.toISOString().slice(0, 10) === t.exitDate);
                if (entryIdx <= i && i <= exitIdx) netShares += t.size;
            }
            // compute cash by simulating trade cash flows up to day i
            let cashFlow = initCapital;
            for (let t of tradesLocal) {
                const entryIdx = dates.findIndex(d => d.toISOString().slice(0, 10) === t.entryDate);
                if (entryIdx <= i) {
                    cashFlow -= t.entryPrice * t.size;
                    cashFlow -= t.fees ? 0 : 0; // fees accounted at exit for simplicity
                }
                const exitIdx = dates.findIndex(d => d.toISOString().slice(0, 10) === t.exitDate);
                if (exitIdx !== -1 && exitIdx <= i) {
                    cashFlow += t.exitPrice * t.size;
                    cashFlow -= t.fees || 0;
                }
            }
            const mark = cashFlow + netShares * prices[i];
            equityFinal.push(Number(mark.toFixed(2)));
        }

        // drawdowns (percent)
        let peak = -Infinity;
        const dd = equityFinal.map(v => {
            if (v > peak) peak = v;
            return Number(((v - peak) / peak * 100).toFixed(3));
        });

        const metricsObj = computeMetrics(equityFinal, dailyRets, tradesLocal);

        return {
            dates: dates.map(d => d.toISOString().slice(0, 10)),
            equity: equityFinal,
            drawdowns: dd,
            trades: tradesLocal,
            metrics: metricsObj,
        };
    }

    function handle_run() {
        // validation block (kept your logic)
        {
            let validation = ValidateInput(capital, "float", "Capital");
            if (validation.r === false) {
                setErrorMessage((prev) => [...prev, validation.m]);
                return;
            }
            validation = ValidateInput(positionSize, "float", "Position Size")
            if (validation.r === false) {
                setErrorMessage((prev) => [...prev, validation.m]);
                return;
            }
            validation = ValidateInput(commission, "float", "Commission")
            if (validation.r === false) {
                setErrorMessage((prev) => [...prev, validation.m]);
                return;
            }
            const d1 = new Date(startDate);
            const d2 = new Date(endDate);
            if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
                setErrorMessage((prev) => [...prev, "Error: Invalid date format."]);
                return;
            }
            if (d1.getTime() > d2.getTime()) {
                setErrorMessage((prev) => [...prev, "Error: Start date cannot be after end date."]);
                return;
            }
            if (d1.getTime() === d2.getTime()) {
                setErrorMessage((prev) => [...prev, "Error: Start date and end date cannot be the same."]);
                return;
            }
        }

        // preserve SaveStrategyJSON call
        let data = JSON.stringify(SaveStrategyJSON(nodes, edges, { startDate: startDate, endDate: endDate, capital: capital, positionSize: positionSize, commission: commission }), null, 1);

        // generate sample realistic backtest
        try {
            const d1 = new Date(startDate);
            const d2 = new Date(endDate);
            const initCapital = parseFloat(capital) || 100000;
            const posSize = parseFloat(positionSize) || 10; // percent
            const comm = parseFloat(commission) || 0.001;

            const sample = generateRealisticBacktest(d1, d2, initCapital, posSize, comm);

            setEquityDates(sample.dates);
            setEquityValues(sample.equity);
            setDrawdowns(sample.drawdowns);
            setTrades(sample.trades);
            setMetrics(sample.metrics);

            // backend call left commented as per original
            // SendToBackend(JSON.stringify(data, null, 1), "/backtest", "application/json")
            //   .then(...)
            //   .catch(...)
        } catch (err) {
            setErrorMessage((prev) => [...prev, err.toString()]);
        }
    }

    // UI
    return (
        <div className="backtest-container" style={{ color: theme.fg }}>
            {/* Left Panel */}
            <div className="backtest-input" style={{ background: theme.surface, border: `1px solid ${theme.border}`, boxShadow: "var(--shadow)" }}>
                <div className="input-group">
                    <div className="date-row">
                        <div className="date-field">
                            <label>Start Date:</label>
                            <LiveDateInput
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="date-field">
                            <label>End Date:</label>
                            <LiveDateInput
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="input-group">
                    <label>Initial Capital:</label>
                    <LiveSingleText
                        value={capital}
                        onChange={(e) => setCapital(e.target.value)}
                        placeholder="e.g. 100000"
                    />
                </div>

                <div className="input-group">
                    <label>Position Size (% of capital):</label>
                    <LiveSingleText
                        value={positionSize}
                        onChange={(e) => setPositionSize(e.target.value)}
                        placeholder="e.g. 10"
                    />
                </div>

                <div className="input-group">
                    <label>Commission (fraction):</label>
                    <LiveSingleText
                        value={commission}
                        onChange={(e) => setCommission(e.target.value)}
                        placeholder="e.g. 0.001"
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "row", gap: "8px" }}>
                    <LiveButton className="spread-button" onClick={handle_run}>
                        <span style={{ color: theme.primary, fontWeight: "bold" }}>&#9654;</span>
                        <b> Run</b>
                    </LiveButton>
                    <LiveButton
                        className="spread-button"
                        onClick={() => {
                            setStartDate("");
                            setEndDate("");
                            setCapital("");
                            setPositionSize("");
                            setCommission("");
                            setEquityDates([]);
                            setEquityValues([]);
                            setDrawdowns([]);
                            setTrades([]);
                            setMetrics(null);
                        }}
                    >
                        Clear
                    </LiveButton>
                </div>
            </div>

            {/* Right Panel */}
            <div className="backtest-output" style={{ background: theme.panel, border: `1px solid ${theme.border}` }}>
                <h3 style={{ color: theme.fg }}>Results</h3>

                {/* Equity Curve */}
                <div className="backtest-chart-placeholder" style={{ minHeight: 340 }}>
                    {equityDates.length > 0 ? (
                        <Plot
                            data={[
                                {
                                    x: equityDates,
                                    y: equityValues,
                                    type: "scatter",
                                    mode: "lines",
                                    name: "Equity",
                                    line: { color: theme.primaryDark, width: 2 },
                                    hovertemplate: "%{x}<br>Equity: %{y:$,.2f}<extra></extra>"
                                },
                                // trades as markers colored by pnl sign
                                {
                                    x: trades.map(t => t.exitDate),
                                    y: trades.map(t => {
                                        const idx = equityDates.indexOf(t.exitDate);
                                        return idx >= 0 ? equityValues[idx] : null;
                                    }),
                                    mode: "markers",
                                    name: "Trades",
                                    marker: {
                                        size: 8,
                                        color: trades.map(t => (t.pnl >= 0 ? "#16a34a" : "#ef4444")),
                                        symbol: trades.map(t => (t.pnl >= 0 ? "triangle-up" : "triangle-down"))
                                    },
                                    text: trades.map(t => `#${t.id} ${t.side} PnL ${t.pnl}`),
                                    hoverinfo: "text"
                                },
                                // drawdown trace (area on right axis)
                                {
                                    x: equityDates,
                                    y: drawdowns,
                                    type: "scatter",
                                    mode: "lines",
                                    name: "Drawdown (%)",
                                    yaxis: "y2",
                                    line: { color: theme.muted, width: 1 },
                                    hovertemplate: "%{x}<br>Drawdown: %{y:.2f}%<extra></extra>"
                                }
                            ]}
                            layout={{
                                margin: { t: 30, r: 40, l: 50, b: 40 },
                                height: 360,
                                legend: { orientation: "h", y: -0.2 },
                                yaxis: { title: "Equity", tickprefix: "" },
                                yaxis2: {
                                    title: "Drawdown (%)",
                                    overlaying: "y",
                                    side: "right",
                                    tickformat: ".1f"
                                },
                                paper_bgcolor: theme.panel,
                                plot_bgcolor: theme.surface,
                                font: { color: theme.fg },
                                xaxis: { rangeslider: { visible: true } }
                            }}
                            config={{ responsive: true, displayModeBar: false }}
                        />
                    ) : (
                        <div style={{ padding: 20, color: theme.muted }}>[Chart will appear here]</div>
                    )}
                </div>

                {/* Metrics */}
                <div className="backtest-stats-placeholder" style={{ marginTop: 12 }}>
                    {metrics ? (
                        <div className="metrics-grid" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                            {[
                                ["Initial", metrics.initial],
                                ["Final", metrics.final],
                                ["Total Return", `${metrics.totalReturnPct}%`],
                                ["CAGR", `${metrics.cagrPct}%`],
                                ["Max Drawdown", `${metrics.maxDrawdownPct}%`],
                                ["Sharpe", metrics.sharpe],
                                ["Win Rate", `${metrics.winRatePct}%`],
                                ["Trades", metrics.trades],
                            ].map(([k, v]) => (
                                <div key={k} className="metric-card" style={{
                                    background: theme.surface,
                                    border: `1px solid ${theme.border}`,
                                    padding: 10,
                                    borderRadius: 8,
                                    minWidth: 110
                                }}>
                                    <div style={{ fontSize: 12, color: theme.muted }}>{k}</div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: theme.fg }}>{v}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: 12, color: theme.muted }}>[Performance stats here]</div>
                    )}
                </div>

                {/* Trade Log */}
                <div style={{ marginTop: 16 }}>
                    <h4 style={{ color: theme.fg }}>Trade Log</h4>
                    {trades.length > 0 ? (
                        <div style={{
                            maxHeight: 240,
                            overflow: "auto",
                            border: `1px solid ${theme.border}`,
                            borderRadius: 8,
                            background: theme.surface
                        }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead style={{ position: "sticky", top: 0, background: theme.panel }}>
                                    <tr>
                                        <th style={{ textAlign: "left", padding: 8, fontSize: 12, color: theme.muted }}>ID</th>
                                        <th style={{ textAlign: "left", padding: 8, fontSize: 12, color: theme.muted }}>Entry</th>
                                        <th style={{ textAlign: "left", padding: 8, fontSize: 12, color: theme.muted }}>Exit</th>
                                        <th style={{ textAlign: "left", padding: 8, fontSize: 12, color: theme.muted }}>Side</th>
                                        <th style={{ textAlign: "right", padding: 8, fontSize: 12, color: theme.muted }}>EntryPx</th>
                                        <th style={{ textAlign: "right", padding: 8, fontSize: 12, color: theme.muted }}>ExitPx</th>
                                        <th style={{ textAlign: "right", padding: 8, fontSize: 12, color: theme.muted }}>Size</th>
                                        <th style={{ textAlign: "right", padding: 8, fontSize: 12, color: theme.muted }}>P&L</th>
                                        <th style={{ textAlign: "right", padding: 8, fontSize: 12, color: theme.muted }}>P&L %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trades.map(t => (
                                        <tr key={t.id} style={{ borderTop: `1px solid ${theme.border}` }}>
                                            <td style={{ padding: 8 }}>{t.id}</td>
                                            <td style={{ padding: 8 }}>{t.entryDate}</td>
                                            <td style={{ padding: 8 }}>{t.exitDate}</td>
                                            <td style={{ padding: 8 }}>{t.side}</td>
                                            <td style={{ padding: 8, textAlign: "right" }}>{t.entryPrice}</td>
                                            <td style={{ padding: 8, textAlign: "right" }}>{t.exitPrice}</td>
                                            <td style={{ padding: 8, textAlign: "right" }}>{t.size}</td>
                                            <td style={{ padding: 8, textAlign: "right", color: t.pnl >= 0 ? "#16a34a" : "#ef4444" }}>{t.pnl}</td>
                                            <td style={{ padding: 8, textAlign: "right" }}>{t.pnlPct}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ padding: 12, color: theme.muted }}>No trades (run to generate a sample backtest).</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Backtest;
