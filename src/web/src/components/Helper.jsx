function SaveStrategyJSON(_nodes, _edges, backtest = null) {
    const processedNodes = _nodes.map((node) => {
        return {
            id: node.id,
            data: node.data,
            position: node.position
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
        edges: processedEdges,
        backtest: backtest
    };
}

const BASE_URL = "https://quantz-ccrv.onrender.com";

const SendToBackend = async (data, endPoint, content_type, setErrorMessage) => {
    try {
        const response = await fetch(`${BASE_URL}${endPoint}`, {
            method: 'POST',
            headers: data instanceof FormData ? {} : { 'Content-Type': content_type },
            body: data
        });

        const body = await response.text();
        return { status: response.status, body: body };
    } catch (error) {
        setErrorMessage((prev) => [...prev, error.toString()]);
        return { status: 0, body: null };
    }
};

/**
 * Validates if `s` is of type `_type`.
 * @param {*} s String that has to be validated against rules.
 * @param {*} _type Specifies the rules.
 * @param {*} label Specifies the label of the input.
 */
function ValidateInput(s, _type, label) {
    s = s.trim();
    if (s === null || s === "") {
        return {
            r: false, m: `Error: Input for ${label} is either null or empty.`
        }
    }
    if (_type === "number") {
        if (/^[-+]?\d+$/.test(s) === true) {
            return {
                r: true, m: null
            };
        } else {
            return {
                r: false, m: `Error: In ${label}, ${s} is not a valid integer.`
            };
        }
    }
    else if (_type == "float") {
        if ((/^[-+]?\d*\.\d+$/.test(s) || /^[-+]?\d+$/.test(s)) === true) {
            return {
                r: true, m: null
            };
        }
        else {
            return {
                r: false, m: `Error: In ${label}, ${s} is not a valid number.`
            };
        }
    }
}

export { SaveStrategyJSON, SendToBackend, ValidateInput };