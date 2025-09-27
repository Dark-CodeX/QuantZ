function SaveStrategyJSON(_nodes, _edges) {
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
export { SaveStrategyJSON };