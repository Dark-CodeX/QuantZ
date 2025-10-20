import React, { useMemo, useRef, useEffect } from 'react';
import Plot from 'react-plotly.js';
import "../css/root.css";

export default function CandlestickChart({ data, indicatorLines }) {
    // Predefine formatter (avoid expensive per-iteration locale parsing)
    const dateFormatter = useMemo(() =>
        new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }), []
    );

    const plotRef = useRef();

    useEffect(() => {
        if (plotRef.current && plotRef.current.el) {
            // Force Plotly to resize once mounted
            window.requestAnimationFrame(() => {
                Plotly.Plots.resize(plotRef.current.el);
            });
        }
    }, []); // only on mount

    // Extract arrays once
    const { dates, opens, highs, lows, closes, volumes, hoverText } = useMemo(() => {
        const len = data.length;
        const dates = new Array(len);
        const opens = new Array(len);
        const highs = new Array(len);
        const lows = new Array(len);
        const closes = new Array(len);
        const volumes = new Array(len);
        const hoverText = new Array(len);

        for (let i = 0; i < len; i++) {
            const { date, open, high, low, close, volume } = data[i];
            const d = new Date(date);
            dates[i] = d;
            opens[i] = open;
            highs[i] = high;
            lows[i] = low;
            closes[i] = close;
            volumes[i] = volume;

            hoverText[i] =
                `<b>${dateFormatter.format(d)}</b><br>` +
                `Open: $${open.toFixed(2)}<br>` +
                `High: $${high.toFixed(2)}<br>` +
                `Low: $${low.toFixed(2)}<br>` +
                `Close: $${close.toFixed(2)}<br>` +
                `Volume: ${volume.toLocaleString()}`;
        }

        return { dates, opens, highs, lows, closes, volumes, hoverText };
    }, [data, dateFormatter]);

    // Consistent vibrant colors
    const colors = useMemo(() => [
        '#FF8C00', '#1E90FF', '#8A2BE2', '#00CED1', '#FFD700', '#FF1493', '#9400D3', '#00BFFF', '#FF4500',
        '#40E0D0', '#DAA520', '#8B008B', '#20B2AA', '#FF69B4', '#4169E1', '#FF6347', '#48D1CC', '#9932CC',
        '#FF8C69', '#4682B4', '#D2691E', '#7B68EE', '#00FA9A', '#FF00FF', '#1C86EE', '#DA70D6', '#00CED1',
        '#FF7F50', '#6A5ACD', '#B0C4DE'
    ], []);



    // Generate overlay indicator lines
    const lineTraces = useMemo(() => {
        if (!indicatorLines || Object.keys(indicatorLines).length === 0) return [];

        return Object.entries(indicatorLines).map(([id, lineData], i) => ({
            type: 'scatter',
            mode: 'lines',
            name: lineData.l,
            x: dates,
            y: lineData.a,
            line: {
                width: 2,
                color: colors[i % colors.length],
            },
            hovertemplate: `<b>${lineData.l}</b><br>%{y:.2f}<extra></extra>`,
        }));
    }, [indicatorLines, dates, colors]);

    const volumeColors = useMemo(() =>
        closes.map((c, i) => (c > opens[i] ? '#00c853' : '#d32f2f'))
        , [closes, opens]);


    return (
        <Plot
            ref={plotRef}
            data={[
                {
                    type: 'candlestick',
                    x: dates,
                    open: opens,
                    high: highs,
                    low: lows,
                    close: closes,
                    increasing: { line: { color: '#00c853' }, fillcolor: '#00c853' },
                    decreasing: { line: { color: '#d32f2f' }, fillcolor: '#d32f2f' },
                    text: hoverText,
                    hoverinfo: 'text',
                },
                ...lineTraces,
                {
                    type: 'bar',
                    x: dates,
                    y: volumes,
                    name: 'Volume',
                    marker: { color: volumeColors },
                    yaxis: 'y2',
                    opacity: 0.6,
                    hovertemplate: `<b>%{x}</b><br>Volume: %{y}<extra></extra>`,
                }
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
                },
                yaxis: {
                    domain: [0.25, 1],
                    showgrid: true,
                    gridcolor: 'rgba(112, 128, 144,0.1)',
                    tickfont: { color: "#708090", weight: "bold", size: 11 },
                    showspikes: true,
                    spikemode: 'across+marker',
                    spikesnap: 'cursor',
                    spikecolor: '#708090',
                    spikethickness: -2,
                    spikedash: "longdash",
                },
                yaxis2: {
                    domain: [0, 0.2],
                    showgrid: true,
                    gridcolor: 'rgba(112, 128, 144,0.1)',
                    tickfont: { color: "#708090", weight: "bold", size: 11 },
                    showspikes: true,
                    spikemode: 'across+marker',
                    spikesnap: 'cursor',
                    spikecolor: '#708090',
                    spikethickness: -2,
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
