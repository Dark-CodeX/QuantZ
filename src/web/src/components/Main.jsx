import { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import '../css/root.css';
import '../css/Main.css';
import { LiveButton } from "./LiveUI";
import { FlowCanvas, getId } from './FlowCanvas';
import { SaveStrategyJSON } from './Helper';
import CandlestickChart from './CandlestickChart';

const INDICATORS = ["SMA", "EMA", "WMA", "VWMA", "MACD", "RSI", "BollingerBands", "ATR"];
const OPERATORS = ["Equals To (=)", "Not Equals To (≠)", "Less Than (<)", "More Than (>)", "Less Than or Equals To (≤)", "More Than or Equals To (≥)"];
const ACTIONS = ["Buy", "Sell"]
const CONTROL_NODES = ["Start", "End"];

export default function Main({ CSVData }) {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [selectedPage, setSelectedPage] = useState("graph"); // graph, chart, backtest, ml_model
    const [indicatorLines, setIndicatorLines] = useState([]);

    const handleDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="main-container">
            {/* Left Panel */}
            <aside className="left-panel" id="left-panel">
                <details className="panel-section">
                    <summary>Indicators</summary>
                    <div className="items">
                        {INDICATORS.map((ind) => (
                            <div
                                key={ind}
                                className="draggable-item"
                                draggable
                                onDragStart={(e) => handleDragStart(e, ind)}
                            >
                                {ind}
                            </div>
                        ))}
                    </div>
                </details>

                <details className="panel-section">
                    <summary>Operators</summary>
                    <div className="items">
                        {OPERATORS.map((op) => (
                            <div
                                key={op}
                                className="draggable-item"
                                draggable
                                onDragStart={(e) => handleDragStart(e, op)}
                            >
                                {op}
                            </div>
                        ))}
                    </div>
                </details>

                <details className="panel-section">
                    <summary>Actions</summary>
                    <div className="items">
                        {ACTIONS.map((ind) => (
                            <div
                                key={ind}
                                className="draggable-item"
                                draggable
                                onDragStart={(e) => handleDragStart(e, ind)}
                            >
                                {ind}
                            </div>
                        ))}
                    </div>
                </details>

                <details className="panel-section" open>
                    <summary>Control</summary>
                    <div className="items">
                        {CONTROL_NODES.map((ind) => (
                            <div
                                key={ind}
                                className="draggable-item"
                                draggable
                                onDragStart={(e) => handleDragStart(e, ind)}
                            >
                                {ind}
                            </div>
                        ))}
                    </div>
                </details>
            </aside>

            {/* Main Canvas */}
            <main className="main-area">
                {/* Operation Panel */}
                <div className="operation-panel">
                    <LiveButton><span style={{ color: "green" }}>&#9654;</span> Run</LiveButton>
                    <LiveButton className="selected-button" id="graph" onClick={(e) => { document.getElementById(selectedPage).classList.remove("selected-button"); e.target.classList.add("selected-button"); setSelectedPage("graph"); document.getElementById("left-panel").classList.remove("collapsed"); }}>Graph</LiveButton>
                    <LiveButton id="chart" onClick={(e) => { document.getElementById(selectedPage).classList.remove("selected-button"); e.target.classList.add("selected-button"); setSelectedPage("chart"); document.getElementById("left-panel").classList.add("collapsed");  }}>Chart</LiveButton>
                    <LiveButton id="backtest" onClick={(e) => { document.getElementById(selectedPage).classList.remove("selected-button"); e.target.classList.add("selected-button"); setSelectedPage("backtest"); document.getElementById("left-panel").classList.add("collapsed");  }}>Backtest</LiveButton>
                    <LiveButton id="ml_model" onClick={(e) => { document.getElementById(selectedPage).classList.remove("selected-button"); e.target.classList.add("selected-button"); setSelectedPage("ml_model"); document.getElementById("left-panel").classList.add("collapsed");  }}>Create ML Model</LiveButton>
                    <LiveButton onClick={() => {
                        const data = JSON.stringify(SaveStrategyJSON(nodes, edges), null, 1);
                        const element = document.createElement("a");
                        element.href = "data:application/json;charset=utf-8," + encodeURIComponent(data);
                        element.download = `strategy_${getId()}.json`;
                        element.click();
                        element.remove();
                    }}>Save Strategy</LiveButton>
                    <LiveButton onClick={() => {
                        setNodes([]);
                        setEdges([]);
                    }}>Clear Strategy</LiveButton>
                </div>
                {
                    selectedPage === "graph" &&
                    <ReactFlowProvider>
                        <FlowCanvas nodes={nodes} edges={edges} setNodes={setNodes} setEdges={setEdges}
                            indicatorsList={INDICATORS} operatorsList={OPERATORS} actionsList={ACTIONS} controlList={CONTROL_NODES} setIndicatorLines={setIndicatorLines} />
                    </ReactFlowProvider>
                }
                {
                    selectedPage === "chart" && <CandlestickChart data={CSVData} lines={indicatorLines} />
                }
            </main >
        </div >
    );
}
