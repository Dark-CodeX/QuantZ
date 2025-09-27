import React, { useState, useCallback } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    Controls,
    addEdge,
    useReactFlow,
    applyNodeChanges,
    applyEdgeChanges,
    Background,
} from 'reactflow';
import '../css/root.css';
import '../css/Main.css';
import 'reactflow/dist/style.css';
import { LiveButton, LiveSingleText } from "./LiveUI";

const INDICATORS = ["SMA", "EMA", "WMA", "VWMA", "MACD", "RSI", "BollingerBands", "ATR"];
const OPERATORS = ["Equals To (=)", "Not Equals To (≠)", "Less Than (<)", "More Than (>)", "Less Than or Equals To (≤)", "More Than or Equals To (≥)"];
const ACTIONS = ["Buy", "Sell"]
const CONTROL_NODES = ["Start", "End"];

const getId = () => crypto.randomUUID();

function FlowCanvas({ nodes, edges, setNodes, setEdges, indicatorsList }) {

    const [selectedNode, setSelectedNode] = useState(null);
    const [nodeInputValue, setNodeInputValue] = useState("");
    const rfInstance = useReactFlow();

    // Node / Edge changes
    const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
    const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

    // Drag & Drop
    const onDrop = useCallback(
        (event) => {
            event.preventDefault();
            const type = event.dataTransfer.getData("application/reactflow");
            if (!type) return;

            const bounds = event.currentTarget.getBoundingClientRect();
            const position = rfInstance.project({
                x: event.clientX - bounds.left,
                y: event.clientY - bounds.top,
            });

            const kind = indicatorsList.includes(type) ? "indicator" : (OPERATORS.includes(type) ? "operator" : (ACTIONS.includes(type) ? "action" : "control"));


            const newNode = {
                id: getId(),
                type: 'default',
                position,
                data: { label: type, kind },
                className: kind === 'indicator' ? 'node-indicator' : (kind === "operator" ? "node-operator" : (kind === "action" ? "node-action" : (type === "Start" ? "node-control_start" : "node-control_end"))),
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [rfInstance, indicatorsList]
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    // Double click node -> open settings
    const onNodeDoubleClick = useCallback((event, node) => {
        setSelectedNode(node);

        if (node.data.kind === "indicator") setNodeInputValue(node.data.period || "");
        if (node.data.kind === "operator") setNodeInputValue(node.data.value || "");
    }, []);

    const handleSettingChange = (key, v) => {
        setNodes((nds) => {
            const newNodes = nds.map((n) =>
                n.id === selectedNode.id ? { ...n, data: { ...n.data, [key]: v } } : n
            );
            setSelectedNode(newNodes.find((n) => n.id === selectedNode.id));
            return newNodes;
        });
    };


    return (
        <div className="flow-area" onDrop={onDrop} onDragOver={onDragOver}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeDoubleClick={onNodeDoubleClick}
                fitView
                style={{ width: '100%', height: '100%' }}
                proOptions={{ hideAttribution: true }}
            >
                <Controls />
                <Background color="var(--fg)" size={0.5} />
            </ReactFlow>

            {/* Settings Panel */}
            {selectedNode && (
                <div className="settings-panel">
                    <h3>Settings: {`${selectedNode.data.label}: ${selectedNode.id}`}</h3>

                    {selectedNode.data.kind === 'operator' && (
                        <div>
                            <label>Value:</label>
                            <LiveSingleText
                                value={nodeInputValue}
                                placeholder="Value"
                                onChange={(e) => setNodeInputValue(e.target.value)}
                            />
                            <div style={{
                                display: "flex",
                                flexDirection: "row",
                                gap: "8px"
                            }}>
                                <LiveButton onClick={() => handleSettingChange(selectedNode.data.kind === "indicator" ? "period" : "value", nodeInputValue)} >Submit</LiveButton>
                                <LiveButton onClick={() => setSelectedNode(null)} >Close</LiveButton>
                            </div>
                        </div>
                    )}

                    {selectedNode.data.kind === 'indicator' && (
                        <div>
                            <label>Period:</label>
                            <LiveSingleText
                                value={nodeInputValue}
                                placeholder="Period"
                                onChange={(e) => setNodeInputValue(e.target.value)}
                            />
                            <div style={{
                                display: "flex",
                                flexDirection: "row",
                                gap: "8px"
                            }}>
                                <LiveButton onClick={() => handleSettingChange(selectedNode.data.kind === "indicator" ? "period" : "value", nodeInputValue)} >Submit</LiveButton>
                                <LiveButton onClick={() => setSelectedNode(null)} >Close</LiveButton>
                            </div>
                        </div>
                    )}

                    {(selectedNode.data.kind === "action" || selectedNode.data.kind === "control") && (
                        <LiveButton onClick={() => setSelectedNode(null)} >Close</LiveButton>
                    )}
                </div>
            )}
        </div>
    );
}

function SaveStrategyJSON({ _nodes, _edges }) {
    const processedNodes = _nodes.map((node) => {
        return {
            id: node.id,
            data: node.data,
            position: node.position,
        };
    });

    const processedEdges = _edges.map((edge => {
        return {
            src: edge.source,
            dest: edge.target
        };
    }));

    return {
        nodes: processedNodes,
        edges: processedEdges
    };
}

export default function Main() {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);

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
                    <LiveButton>Backtest</LiveButton>
                    <LiveButton>Chart</LiveButton>
                    <LiveButton>Create ML Model</LiveButton>
                    <LiveButton onClick={() => {
                        const data = JSON.stringify(SaveStrategyJSON({ _nodes: nodes, _edges: edges }), null, 1);
                        const element = document.createElement("a");
                        element.href = "data:application/json;charset=utf-8," + encodeURIComponent(data);
                        element.download = `strategy_${getId()}.json`;
                        element.click();
                        element.remove();
                    }}>Save Strategy</LiveButton>
                </div>
                <ReactFlowProvider>
                    <FlowCanvas nodes={nodes} edges={edges} setNodes={setNodes} setEdges={setEdges} indicatorsList={INDICATORS} />
                </ReactFlowProvider>
            </main >
        </div >
    );
}
