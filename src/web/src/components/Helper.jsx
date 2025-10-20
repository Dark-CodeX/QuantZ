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

const SendToBackend = async (data, type, content_type) => {
    try {
        const response = await fetch(`http://localhost:9080${type}`, {
            method: 'POST',
            headers: data instanceof FormData ? {} : { 'Content-Type': content_type },
            body: data
        });

        const body = await response.text();

        return {
            status: response.status,
            body: body
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            status: 0,
            body: null
        };
    }
};


export { SaveStrategyJSON, SendToBackend };