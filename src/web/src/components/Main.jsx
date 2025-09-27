import { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import '../css/root.css';
import '../css/Main.css';
import { LiveButton } from "./LiveUI";
import { FlowCanvas, getId } from './FlowCanvas';
import CandleCharts from './CandleCharts';
import { SaveStrategyJSON } from './Helper';

const INDICATORS = ["SMA", "EMA", "WMA", "VWMA", "MACD", "RSI", "BollingerBands", "ATR"];
const OPERATORS = ["Equals To (=)", "Not Equals To (≠)", "Less Than (<)", "More Than (>)", "Less Than or Equals To (≤)", "More Than or Equals To (≥)"];
const ACTIONS = ["Buy", "Sell"]
const CONTROL_NODES = ["Start", "End"];

export default function Main({ CSVData }) {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [selectedPage, setSelectedPage] = useState("graph"); // graph, chart, backtest, ml_model

    const handleDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="main-container">
            {/* Left Panel */}
            <aside className="left-panel">
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
                    <LiveButton onClick={() => setSelectedPage("chart")}>Chart</LiveButton>
                    <LiveButton onClick={() => setSelectedPage("backtest")}>Backtest</LiveButton>
                    <LiveButton onClick={() => setSelectedPage("ml_model")}>Create ML Model</LiveButton>
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
                            indicatorsList={INDICATORS} operatorsList={OPERATORS} actionsList={ACTIONS} controlList={CONTROL_NODES} />
                    </ReactFlowProvider>
                }
                {
                    selectedPage === "chart" && <CandleCharts stockData={CSVData} ></CandleCharts>
                }
            </main >
        </div >
    );
}
