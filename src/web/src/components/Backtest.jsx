import React, { useMemo, useRef, useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import "../css/root.css";
import "../css/Backtest.css";
import {
    LiveButton,
    LiveSingleText,
    LiveDateInput,
} from "./LiveUI";
import { SaveStrategyJSON, SendToBackend, ValidateInput } from './Helper';

const EquityChart = ({ equity }) => {

    const plotRef = useRef();

    useEffect(() => {
        if (plotRef.current && plotRef.current.el) {
            // Force Plotly to resize once mounted
            window.requestAnimationFrame(() => {
                Plotly.Plots.resize(plotRef.current.el);
            });
        }
    }, []); // only on mount

    const { equityArr, hoverText } = useMemo(() => {
        const len = equity.length;
        const date = new Array(len);
        const drawdown = new Array(len);
        const equityArr = new Array(len);
        const peak = new Array(len);
        const returns = new Array(len);
        const hoverText = new Array(len);

        for (let i = 0; i < len; i++) {
            date[i] = equity[i].Date;
            drawdown[i] = equity[i].Drawdown;
            equityArr[i] = equity[i].Equity;
            peak[i] = equity[i].Peak;
            returns[i] = equity[i].Returns;

            hoverText[i] =
                `<b>Date: ${date[i]}</b><br>` +
                `Drawdown: ${isNaN(drawdown[i]) ? "N/A" : (drawdown[i] * 100).toFixed(4) + "%"}<br>` +
                `Equity: $${equityArr[i].toFixed(3)}<br>` +
                `Peak: $${peak[i].toFixed(3)}<br>` +
                `Returns: ${isNaN(returns[i]) ? "N/A" : (returns[i] * 100).toFixed(4) + "%"}`;
        }

        return { date, drawdown, equity: equityArr, peak, returns, hoverText };
    }, [equity]);

    const x = equity.map((point, index) => index);
    const y = equity.map((point) => point.Equity);

    return (
        <Plot
            ref={plotRef}
            data={[
                {
                    x: x,
                    y: y,
                    type: "scatter",
                    mode: 'lines+markers',
                    marker: { color: '#1E90FF' },
                    text: hoverText,
                    hoverinfo: 'text',
                },
            ]}
            layout={{
                margin: { t: 30, r: 10, l: 40, b: 40 },
                dragmode: 'pan',
                hovermode: 'x',
                showlegend: true,
                legend: {
                    orientation: 'h',
                    y: 1.05,
                    x: 0,
                    xanchor: 'left',
                    traceorder: 'normal',
                    itemwidth: 50,
                    font: { size: 11, color: '#708090' }
                },
                xaxis: {
                    type: 'date',
                    showgrid: false,
                    tickformat: '%b %d %y',
                    tickangle: -45,
                    tickfont: { color: "#708090", weight: "bold", size: 11 },
                    rangeslider: { visible: false },
                    showspikes: true,
                    spikemode: 'across',
                    spikesnap: 'cursor',
                    spikecolor: "#708090",
                    spikethickness: -2,
                    spikedash: "longdash",
                    title: "Time"
                },
                yaxis: {
                    showgrid: true,
                    gridcolor: 'rgba(112, 128, 144,0.1)',
                    tickfont: { color: "#708090", weight: "bold", size: 11 },
                    showspikes: true,
                    spikemode: 'across+marker',
                    spikesnap: 'cursor',
                    spikecolor: '#708090',
                    spikethickness: -2,
                    title: "Equity",
                    spikedash: "longdash",
                },
                plot_bgcolor: 'transparent',
                paper_bgcolor: 'transparent',
            }}
            config={{
                responsive: true,
                displayModeBar: true,
                scrollZoom: true,
                showTips: false,
                displaylogo: false,
            }}
            style={{ width: '100%', height: '100%' }}
        />
    );
}

const Backtest = ({ nodes, edges, setErrorMessage, startDate, endDate, capital, positionSize, commission, setStartDate, setEndDate, setCapital, setPositionSize, setCommission, setData, data }) => {
    function handle_run() {
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

        let jdata = JSON.stringify(SaveStrategyJSON(nodes, edges, { startDate: startDate, endDate: endDate, capital: capital, positionSize: positionSize, commission: commission }), null, 1);
        SendToBackend(
            JSON.stringify(jdata, null, 1), "/backtest", "application/json")
            .then((res) => {
                if (res.status === 400) {
                    setErrorMessage((prev) => [...prev, res.body]);
                } else {
                    setData(JSON.parse(res.body.replace(/\bNaN\b/g, "null")));
                }
            })
            .catch((err) => { setErrorMessage((prev) => [...prev, err.toString()]) });
    }

    return (
        <div className="backtest-container">
            {/* Left Panel - Inputs */}
            <div className="backtest-input">
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
                    <label>Position Size:</label>
                    <LiveSingleText
                        value={positionSize}
                        onChange={(e) => setPositionSize(e.target.value)}
                        placeholder="e.g. 10"
                    />
                </div>

                <div className="input-group">
                    <label>Commission / Slippage:</label>
                    <LiveSingleText
                        value={commission}
                        onChange={(e) => setCommission(e.target.value)}
                        placeholder="e.g. 0.001"
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "row", gap: "8px" }}>
                    <LiveButton className="spread-button" onClick={handle_run}>
                        <span style={{ color: "green", fontWeight: "bold" }}>&#9654;</span>
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
                            setData(null);
                        }}
                    >
                        Clear
                    </LiveButton>
                </div>
            </div>

            {/* Right Panel - Output */}
            <div className="backtest-output">
                <div className="backtest-equity">
                    {data && data.equity && data.equity.length > 0 ? (
                        <EquityChart equity={data ? data.equity : []} />
                    ) : (
                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100%",
                            width: "100%",
                        }}>
                            <h3>No equity curve to display</h3>
                        </div>
                    )}
                </div>
                {/*
                    "metrics": {
        "Final Equity": 992.63,
        "Max Drawdown (%)": -0.76,
        "Sharpe Ratio": -0.35,
        "Total Return (%)": -0.74,
        "Win Rate (%)": 10.64
    }
                */}
                <div className="backtest-metrics">
                    {data && data.metrics ? (
                        <div style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            gap: "10px",
                        }}>
                            {Object.entries(data.metrics).map(([key, value], index) => (
                                <div key={index} style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    backgroundColor: index % 2 === 0 ? 'rgba(112, 128, 144,0.1)' : 'rgba(112, 128, 144,0.05)',
                                    borderRadius: "var(--radius)",
                                    padding: "8px",
                                    gap: "8px",
                                }}>
                                    <span style={{ fontWeight: "bold", color: "var(--text)" }}>{key}</span>
                                    <span style={{ color: typeof value === "number" && key.includes("Final Equity") ? (value < capital ? '#d32f2f' : '#00c853') : value < 0 ? '#d32f2f' : '#00c853' }}>
                                        {typeof value === "number" ? (isNaN(value) ? "N/A" : (key.includes("Return") || key.includes("Drawdown") || key.includes("Win Rate") ? value.toFixed(3) + "%" : key.includes("Final Equity") ? "$" + value.toFixed(3) : value.toFixed(3))) : value.toString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100%",
                            width: "100%",
                        }}>
                            <h3>No metrics to display</h3>
                        </div>
                    )}
                </div>
                <div className="backtest-trades">
                    {data && data.trades && data.trades.length > 0 ? (<table className="trade-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Balance</th>
                                <th>Commission</th>
                                <th>PnL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data && data.trades && data.trades.map((trade, index) => (
                                <tr key={index}>
                                    <td>{trade.Date}</td>
                                    <td>{trade.Type}</td>
                                    <td>${trade.Price.toFixed(3)}</td>
                                    <td>{trade.Qty.toFixed(6)}</td>
                                    <td>${trade.Balance.toFixed(3)}</td>
                                    <td>${trade.Comm.toFixed(4)}</td>
                                    {trade.PnL === null ? (
                                        <td style={{ color: '#000000' }}>N/A</td>
                                    ) : (
                                        <td style={{ color: trade.PnL >= 0 ? '#00c853' : '#d32f2f' }}>
                                            ${isNaN(trade.PnL) ? "N/A" : trade.PnL.toFixed(3)}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    ) : (
                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100%",
                            width: "100%",
                        }}>
                            <h3>No trade data to display</h3>
                        </div>
                    )} </div>
            </div>
        </div>
    );
};

export default Backtest;
