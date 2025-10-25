import { useState } from "react";
import "../css/root.css";

const LiveButton = ({ onClick, children, className = "", id = "" }) => {
    const [hover, setHover] = useState(false);

    const baseStyles = {
        background: hover ? "var(--panel)" : "var(--surface)",
        borderRadius: "var(--radius)",
        padding: "5px",
        boxShadow: hover
            ? "0 4px 12px rgba(10, 132, 255, 0.15)"
            : "var(--shadow)",
        textAlign: "center",
        border: `2px solid ${hover ? "var(--primary)" : "var(--border)"}`,
        transition: "all 0.2s ease",
        cursor: "pointer",
        color: "var(--fg)",
        fontFamily: "var(--font)",
        fontSize: "14px",
    };

    return (
        <button
            style={baseStyles}
            className={className}
            id={id}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={onClick}
        >
            {children}
        </button>
    );
};

const LiveSingleText = ({ type = "text", placeholder = "", onClick, className = "", id = "", value = "", onChange }) => {
    const [hover, setHover] = useState(false);

    const baseStyles = {
        background: hover ? "var(--panel)" : "var(--surface)",
        borderRadius: "var(--radius)",
        boxShadow: hover
            ? "0 4px 12px rgba(10, 132, 255, 0.15)"
            : "var(--shadow)",
        border: `2px solid ${hover ? "var(--primary)" : "var(--border)"}`,
        transition: "all 0.2s ease",
        cursor: "text",
        color: "var(--fg)",
        outline: "none",
        fontFamily: "var(--font)",
        fontSize: "16px",
        fontWeight: "500",
        padding: "10px 15px 10px 15px"
    };

    return (
        <input
            style={baseStyles}
            type={type}
            placeholder={placeholder}
            className={className}
            id={id}
            value={value}
            onChange={onChange}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={onClick}
        />
    );
};

const LiveSelect = ({ className = "", id = "", value, options, onChange, onClick }) => {
    const [hover, setHover] = useState(false);

    const baseStyles = {
        background: hover ? "var(--panel)" : "var(--surface)",
        borderRadius: "var(--radius)",
        boxShadow: hover
            ? "0 4px 12px rgba(10, 132, 255, 0.15)"
            : "var(--shadow)",
        border: `2px solid ${hover ? "var(--primary)" : "var(--border)"}`,
        transition: "all 0.2s ease",
        cursor: "text",
        color: "var(--fg)",
        outline: "none",
        fontFamily: "var(--font)",
        fontSize: "16px",
        fontWeight: "500",
        padding: "10px 15px 10px 15px"
    };

    return (
        <select
            onChange={onChange}
            onClick={onClick}
            className={className}
            id={id}
            value={value}
            style={baseStyles}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}>
            {options && options.map((i) => {
                return (
                    <option key={i} value={i}>{i}</option>
                );
            })}
        </select>
    );
};

const LiveDateInput = ({ value = "", onChange, className = "", id = "", onClick
}) => {
    const [hover, setHover] = useState(false);

    const baseStyles = {
        background: hover ? "var(--panel)" : "var(--surface)",
        borderRadius: "var(--radius)",
        boxShadow: hover
            ? "0 4px 12px rgba(10, 132, 255, 0.15)"
            : "var(--shadow)",
        border: `2px solid ${hover ? "var(--primary)" : "var(--border)"}`,
        transition: "all 0.2s ease",
        cursor: "text",
        color: "var(--fg)",
        outline: "none",
        fontFamily: "var(--font)",
        fontSize: "16px",
        fontWeight: "500",
        padding: "10px 15px",
    };

    return (
        <input
            type="date"
            value={value}
            onChange={onChange}
            onClick={onClick}
            className={className}
            id={id}
            style={baseStyles}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        />
    );
};

export { LiveButton, LiveSingleText, LiveSelect, LiveDateInput };
