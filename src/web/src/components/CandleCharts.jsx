import React, { useRef, useEffect, useState } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import "../css/root.css";
import "../css/CandleCharts.css";
import { LiveButton } from './LiveUI';


export default function CandleCharts({ stockData = [] }) {
    const containerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);
    const crosshairHandlerRef = useRef(null);

    const getCssVar = (name, fallback) =>
        getComputedStyle(document.documentElement).getPropertyValue(name) || fallback;

    const updateChartColors = () => { if (!chartRef.current) return; chartRef.current.applyOptions({ layout: { background: { type: 'solid', color: getCssVar('--surface', '#fff').trim() }, textColor: getCssVar('--fg', '#333').trim(), fontFamily: getCssVar('--font', 'sans-serif').trim(), }, grid: { vertLines: { visible: false }, horzLines: { color: getCssVar('--border', '#c8d6f0').trim() }, }, }); };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;


        const chart = createChart(container, {
            width: container.clientWidth || 300,
            height: container.clientHeight || 200,
            layout: {
                background: { type: 'solid', color: getCssVar('--surface', '#fff').trim() },
                textColor: getCssVar('--fg', '#333').trim(),
                fontFamily: getCssVar('--font', 'sans-serif').trim(),
                attributionLogo: false,
            },
            rightPriceScale: { scaleMargins: { top: 0.1, bottom: 0.2 } },
            timeScale: { timeVisible: true, secondsVisible: false },
            grid: { vertLines: { visible: false }, horzLines: { color: getCssVar('--border', '#c8d6f0').trim() } },
            crosshair: { mode: 1, vertLine: { color: '#aaa', width: 1, style: 3, visible: true }, horzLine: { color: '#aaa', width: 1, style: 3, visible: true } },
        });
        chartRef.current = chart;

        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: true,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });
        seriesRef.current = candleSeries;

        // initial data if present
        if (stockData && stockData.length) {
            candleSeries.setData(stockData);
            chart.timeScale().fitContent();
        }

        const mo = new MutationObserver(updateChartColors); mo.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });


        return () => {
            // cleanup
            mo.disconnect();
            chart.remove();
            chartRef.current = null;
            seriesRef.current = null;
            crosshairHandlerRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    // update data when stockData changes
    useEffect(() => {
        const chart = chartRef.current;
        const series = seriesRef.current;
        if (!chart || !series) return;


        if (stockData && stockData.length) series.setData(stockData);
        else series.setData([]);


        chart.timeScale().fitContent();


        // also refresh colors in case CSS vars changed while mounted
        chart.applyOptions({
            layout: {
                background: { type: 'solid', color: getCssVar('--surface', '#fff').trim() },
                textColor: getCssVar('--fg', '#333').trim(),
                fontFamily: getCssVar('--font', 'sans-serif').trim(),
            },
            grid: { horzLines: { color: getCssVar('--border', '#c8d6f0').trim() } },
        });
    }, [stockData]);


    return (
        <div ref={containerRef} className="candle-chart" />
    );
}