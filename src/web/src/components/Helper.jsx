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

const SendToBackend = async (data, type) => {
    try {
        const response = await fetch(`http://localhost:9080/upload/${type}`, {
            method: 'POST',
            headers: data instanceof FormData ? {} : { 'Content-Type': 'text/plain' },
            body: data
        });
        return await response.text();
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
};


export { SaveStrategyJSON, SendToBackend };