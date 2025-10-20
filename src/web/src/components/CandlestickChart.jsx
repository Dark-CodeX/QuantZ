import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import "../css/root.css"

export default function CandlestickChart({ data, lines }) {
    // Expect data = [{date, open, high, low, close}, ...]
    // Expect lines = [{ "SMA": [null, null, ...] }, { "EMA": [...] }]

    const { dates, opens, highs, lows, closes, hoverText } = useMemo(() => {
        const d = { dates: [], opens: [], highs: [], lows: [], closes: [], hoverText: [] };
        for (const point of data) {
            const date = new Date(point.date);
            d.dates.push(date);
            d.opens.push(point.open);
            d.highs.push(point.high);
            d.lows.push(point.low);
            d.closes.push(point.close);

            // Create custom hover text for each data point
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            d.hoverText.push(
                `<b>${formattedDate}</b><br>` +
                `Open: $${point.open.toFixed(2)}<br>` +
                `High: $${point.high.toFixed(2)}<br>` +
                `Low: $${point.low.toFixed(2)}<br>` +
                `Close: $${point.close.toFixed(2)}`
            );
        }
        return d;
    }, [data]);

    const colors = [
        '#FF1493',  // Deep Pink (magenta family)
        '#00FFFF',  // Cyan (bright blue-green)
        '#FFD700',  // Gold (yellow)
        '#8A2BE2',  // Blue Violet (purple)
        '#FF4500',  // Orange Red
        '#00FA9A',  // Medium Spring Green
        '#FF69B4',  // Hot Pink
        '#1E90FF',  // Dodger Blue
        '#FFFF00',  // Pure Yellow
        '#FF00FF',  // Magenta
        '#00CED1',  // Dark Turquoise
        '#FFA500',  // Orange
        '#9370DB',  // Medium Purple
        '#32CD32',  // Lime Green
        '#FF1493',  // Deep Pink
        '#00BFFF',  // Deep Sky Blue
        '#FFD700',  // Gold
        '#DA70D6',  // Orchid
        '#FF6347',  // Tomato
        '#40E0D0',  // Turquoise
        '#ADFF2F',  // Green Yellow
        '#FF00FF',  // Fuchsia
        '#1E90FF',  // Dodger Blue
        '#FF8C00',  // Dark Orange
        '#BA55D3',  // Medium Orchid
        '#00FF7F',  // Spring Green
        '#FF69B4',  // Hot Pink
        '#4169E1',  // Royal Blue
        '#FFFF54',  // Laser Lemon
        '#FF1493',  // Deep Pink
    ];


    // Create line traces from indicator lines
    const lineTraces = useMemo(() => {
        if (!lines || lines.length === 0) return [];

        return lines.map((lineObj, index) => {
            const indicatorName = Object.keys(lineObj)[0];
            const values = lineObj[indicatorName];

            return {
                type: 'scatter',
                mode: 'lines',
                name: indicatorName,
                x: dates,
                y: values,
                line: {
                    width: 2,
                    color: colors[index % colors.length],
                },
                hovertemplate: `<b>${indicatorName}</b><br>%{y:.2f}<extra></extra>`,
            };
        });
    }, [lines, dates]);

    return (
        <Plot
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
                ...lineTraces  // Spread the line traces here
            ]}
            layout={{
                margin: { t: 30, r: 20, l: 60, b: 40 },
                dragmode: 'pan',
                hovermode: 'x',
                showlegend: true,
                legend: {
                    orientation: 'h',
                    x: 0,
                    xanchor: "left",
                    yanchor: "top",
                    y: 1,
                    font: { size: 11, color: '#708090' }
                },
                xaxis: {
                    type: 'date',
                    showgrid: false,
                    tickformat: '%b %d %y',
                    tickangle: -45,
                    tickfont: { color: "#708090", weight: "bold", size: 10 },
                    rangeslider: { visible: false },
                    fixedrange: false,
                    showspikes: true,
                    spikemode: 'across',
                    spikesnap: 'cursor',
                    spikecolor: "#708090",
                    spikethickness: -2,
                    spikedash: "longdash",
                },
                yaxis: {
                    showgrid: true,
                    gridcolor: 'rgba(112, 128, 144,0.1)',
                    tickfont: { color: "#708090", weight: "bold", size: 11 },
                    fixedrange: false,
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
