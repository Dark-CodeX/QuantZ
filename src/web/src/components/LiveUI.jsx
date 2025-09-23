import { useState } from "react";
import "../css/root.css";

const LiveButton = ({ onClick, children, className = "" }) => {
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
        color: "var(--fg)"
    };

    return (
        <button
            style={baseStyles}
            className={className}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={onClick}
        >
            {children}
        </button>
    );
};

const LiveSingleText = ({ type = "text", value = "", onChange, placeholder = "", onClick, children, className = "" }) => {
    const [hover, setHover] = useState(false);

    const baseStyles = {
        background: hover ? "var(--panel)" : "var(--surface)",
        borderRadius: "var(--radius)",
        padding: "5px",
        boxShadow: hover
            ? "0 4px 12px rgba(10, 132, 255, 0.15)"
            : "var(--shadow)",
        border: `2px solid ${hover ? "var(--primary)" : "var(--border)"}`,
        transition: "all 0.2s ease",
        cursor: "pointer",
        color: "var(--fg)"
    };

    return (
        <input
            style={baseStyles}
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            className={className}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={onClick}
        >
            {children}
        </input>
    );
};

export { LiveButton, LiveSingleText };
