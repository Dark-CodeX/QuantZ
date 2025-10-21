import { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
    Controls,
    addEdge,
    useReactFlow,
    applyNodeChanges,
    applyEdgeChanges,
    Background,
} from 'reactflow';
import '../css/root.css';
import '../css/FlowCanvas.css';
import 'reactflow/dist/style.css';
import { LiveButton, LiveSelect, LiveSingleText } from "./LiveUI";
import { SendToBackend } from "./Helper"
import ErrorBox from './ErrorBox';

const getId = () => crypto.randomUUID();

function FlowCanvas({ nodes, edges, setNodes, setEdges, indicatorsList, indicatorsSelectOptions, operatorsList, actionsList, controlList, setIndicatorLines }) {
    const [selectedNode, setSelectedNode] = useState(null);
    const [nodeInputValue, setNodeInputValue] = useState("");
    const [errorMessage, setErrorMessage] = useState([]);
    const rfInstance = useReactFlow();

    useEffect(() => {
        if (!errorMessage.length) return;
        const timer = setTimeout(() => {
            setErrorMessage((prev) => prev.slice(1)); // remove first message immutably
        }, 1500);
        return () => clearTimeout(timer);
    }, [errorMessage]);

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

            const position = rfInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const kind = Object.keys(indicatorsList).includes(type) ? "indicator" : operatorsList.includes(type) ? "operator" : actionsList.includes(type) ? "action" : "control";

            // Dynamic field initialization for indicators
            let data = { label: type, kind };
            if (kind === "indicator") {
                Object.entries(indicatorsList[type]).map(([k, v]) => (data[k] = ""))
            }

            const newNode = {
                id: getId(),
                type: "default",
                position,
                data,
                className: kind === "indicator" ? "node-indicator" : kind === "operator" ? "node-operator" : kind === "action" ? "node-action" : type === "Start" ? "node-control_start" : "node-control_end",
            };

            setNodes((nds) => nds.concat(newNode));
            setSelectedNode(newNode);
            setNodeInputValue("");
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
        setNodes((nds) =>
            nds.map((n) =>
                n.id === selectedNode.id ? { ...n, data: { ...n.data, [key]: v } } : n
            )
        );
        setSelectedNode((prevNode) => ({
            ...prevNode,
            data: { ...prevNode.data, [key]: v },
        }));
    };

    function stringifyParams(obj) {
        return Object.entries(obj)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
    }

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
            {errorMessage && (
                <ErrorBox msg={errorMessage} setErrorMessage={setErrorMessage} />
            )}

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
                                <LiveButton onClick={() => handleSettingChange("value", nodeInputValue)} >Submit</LiveButton>
                                <LiveButton onClick={() => setSelectedNode(null)} >Close</LiveButton>
                            </div>
                        </div>
                    )}

                    {selectedNode.data.kind === "indicator" && (
                        <div>
                            {Object.entries(indicatorsList[selectedNode.data.label]).map(([param, val]) => (
                                <div key={param} style={{ marginBottom: "8px" }}>
                                    <label style={{ display: "block", marginBottom: "4px" }}>{param}:</label>
                                    {val === "Number" && <LiveSingleText
                                        value={selectedNode.data[param] || ""}
                                        placeholder={param}
                                        onChange={(e) =>
                                            handleSettingChange(param, e.target.value)
                                        }
                                    />}
                                    {val === "Select" && <LiveSelect
                                        value={selectedNode.data[param] || ""}
                                        options={indicatorsSelectOptions[selectedNode.data.label]}
                                        onChange={(e) =>
                                            handleSettingChange(param, e.target.value)
                                        }
                                    />}
                                </div>
                            ))}

                            <div style={{ display: "flex", flexDirection: "row", gap: "8px" }}>
                                <LiveButton
                                    onClick={() => {
                                        const params = {};
                                        Object.entries(indicatorsList[selectedNode.data.label]).map(([param, v]) => {
                                            if (v === "Number")
                                                params[param.toLowerCase()] = parseFloat(
                                                    selectedNode.data[param]
                                                );
                                            else
                                                params[param.toLowerCase()] = selectedNode.data[param]
                                        });
                                        SendToBackend(
                                            JSON.stringify(params, null, 1),
                                            `/indicators/${selectedNode.data.label}`,
                                            "application/json")
                                            .then((res) => {
                                                if (res.status === 400) {
                                                    setErrorMessage((prev) => [...prev, res.body]);
                                                } else {
                                                    const parsedArray = JSON.parse(
                                                        res.body.replace(/\bnan\b/g, "null")
                                                    );
                                                    setIndicatorLines((prevLines) => ({
                                                        ...prevLines,
                                                        [selectedNode.id]: {
                                                            l:
                                                                selectedNode.data.label +
                                                                " [" + stringifyParams(params) + "]",
                                                            a: parsedArray,
                                                        },
                                                    }));
                                                }
                                            })
                                            .catch((err) =>
                                                setErrorMessage((prev) => [...prev, err.toString()])
                                            );
                                    }}
                                >
                                    Submit
                                </LiveButton>

                                <LiveButton onClick={() => setSelectedNode(null)}>Close</LiveButton>
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

export { FlowCanvas, getId };