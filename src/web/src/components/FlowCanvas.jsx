import { useState, useCallback } from 'react';
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
import { LiveButton, LiveSingleText } from "./LiveUI";
import { SendToBackend } from "./Helper"

const getId = () => crypto.randomUUID();

function FlowCanvas({ nodes, edges, setNodes, setEdges, indicatorsList, operatorsList, actionsList, controlList, setIndicatorLines }) {

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

            const position = rfInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const kind = indicatorsList.includes(type) ? "indicator" : (operatorsList.includes(type) ? "operator" : (actionsList.includes(type) ? "action" : "control"));


            const newNode = {
                id: getId(),
                type: 'default',
                position,
                data: { label: type, kind },
                className: kind === 'indicator' ? 'node-indicator' : (kind === "operator" ? "node-operator" : (kind === "action" ? "node-action" : (type === "Start" ? "node-control_start" : "node-control_end"))),
            };

            setNodes((nds) => nds.concat(newNode));
            setSelectedNode(newNode);
            if (kind === "indicator") setNodeInputValue(newNode.data.period || "");
            if (kind === "operator") setNodeInputValue(newNode.data.value || "");
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
            data: { ...prevNode.data, [key]: v }
        }));
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
                                <LiveButton onClick={() => handleSettingChange("value", nodeInputValue)} >Submit</LiveButton>
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
                                <LiveButton onClick={() => {
                                    handleSettingChange("period", nodeInputValue);
                                    if (nodeInputValue !== "")
                                        SendToBackend(
                                            JSON.stringify({ period: parseInt(nodeInputValue, 10) }, null, 1),
                                            `/indicators/${selectedNode.data.label}`,
                                            "application/json")
                                            .then((res) => {
                                                const parsedArray = JSON.parse(res.replace(/nan/g, 'null'));

                                                setIndicatorLines(prevLines => [
                                                    ...prevLines,
                                                    { [selectedNode.data.label + nodeInputValue]: parsedArray }
                                                ])
                                            })
                                            .catch((err) => { console.error(err) })
                                }} >Submit</LiveButton>
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

export { FlowCanvas, getId };