import { useState, useEffect } from "react";
import "../css/root.css";
import "../css/Navbar.css";
import { LiveButton, LiveSingleText } from "./LiveUI";

export default function Navbar() {
    const [now, setNow] = useState(new Date());
    const [themeLight, setThemeLight] = useState(false); // false = dark, true = light
    const [searchQuery, setSearchQuery] = useState("");
    const [isHomePage, setIsHomePage] = useState(false);

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        applyTheme(themeLight);
    }, [themeLight]);

    function applyTheme(isLight) {
        const r = document.documentElement;

        if (isLight) {
            // Light theme
            r.style.setProperty("--bg", "#f3f7fb");
            r.style.setProperty("--surface", "#ffffff");
            r.style.setProperty("--panel", "#f0f6ff");
            r.style.setProperty("--fg", "#1e1e1e");
            r.style.setProperty("--muted", "#6e6e6e");
            r.style.setProperty("--primary", "#0a84ff");
            r.style.setProperty("--primary-dark", "#0078d4");
            r.style.setProperty("--border", "#c8d6f0");
            r.style.setProperty("--radius", "6px");
            r.style.setProperty(
                "--shadow",
                "0 2px 6px rgba(10, 132, 255, 0.08)"
            );
        } else {
            // Dark theme
            r.style.setProperty("--bg", "#1e1e1e");
            r.style.setProperty("--surface", "#252526");
            r.style.setProperty("--panel", "#2d2d30");
            r.style.setProperty("--fg", "#d4d4d4");
            r.style.setProperty("--muted", "#a0a0a0");
            r.style.setProperty("--primary", "#0a84ff");
            r.style.setProperty("--primary-dark", "#005a9e");
            r.style.setProperty("--border", "#3c3c3c");
            r.style.setProperty("--radius", "6px");
            r.style.setProperty(
                "--shadow",
                "0 2px 6px rgba(0, 0, 0, 0.6)"
            );
        }
    }

    function changeTheme() {
        setThemeLight(prev => !prev);
    }

    return (
        <header className="topbar">
            {!isHomePage && (
                <LiveButton className="back-button">
                    <svg
                        fill="var(--fg)"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        width="30px"
                        height="30px"
                        viewBox="0 0 495.398 495.398"
                    >
                        <g>
                            <g>
                                <g>
                                    <path d="M487.083,225.514l-75.08-75.08V63.704c0-15.682-12.708-28.391-28.413-28.391c-15.669,0-28.377,12.709-28.377,28.391v29.941L299.31,37.74c-27.639-27.624-75.694-27.575-103.27,0.05L8.312,225.514c-11.082,11.104-11.082,29.071,0,40.158c11.087,11.101,29.089,11.101,40.172,0l187.71-187.729c6.115-6.083,16.893-6.083,22.976-0.018l187.742,187.747c5.567,5.551,12.825,8.312,20.081,8.312c7.271,0,14.541-2.764,20.091-8.312C498.17,254.586,498.17,236.619,487.083,225.5" />
                                    <path d="M257.561,131.836c-5.454-5.451-14.285-5.451-19.723,0L72.712,296.913c-2.607,2.606-4.085,6.164-4.085,9.877v120.401c0,28.253,22.908,51.16,51.16,51.16h81.754v-126.61h92.299v126.61h81.755c28.251,0,51.159-22.907,51.159-51.159V306.79c0-3.713-1.465-7.271-4.085-9.877L257.561,131.836z" />
                                </g>
                            </g>
                        </g>
                    </svg>
                </LiveButton>
            )}

            <div className="brand">
                <div className="logo">
                    <img src="/logo.png" alt="logo" />
                </div>
                <span>
                    <div className="title">QuantZ</div>
                    <div className="sub">Welcome, User</div>
                </span>
            </div>

            <div className="topbar-center">
                <LiveSingleText
                    className="search-bar"
                    placeholder="Search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "15px",
                }}
            >
                <span
                    style={{
                        fontSize: "0.875rem",
                        color: "rgba(230, 50, 50, 0.8)",
                        userSelect: "none",
                        marginRight: "10px",
                    }}
                >
                    NOTE: This is a demo version, you may experience 30-40
                    seconds delay on first run due to inactivity on the server.
                </span>

                <div onClick={changeTheme}>
                    <p
                        style={{
                            fontSize: "16px",
                            fontWeight: "bolder",
                            cursor: "pointer",
                            color: "red",
                            userSelect: "none",
                        }}
                    >
                        {themeLight ? "☾" : "𖤓"}
                    </p>
                </div>

                <time style={{ color: "var(--muted)" }}>
                    {now.toLocaleString("en-IN", {
                        dateStyle: "full",
                        timeStyle: "long",
                    })}
                </time>
            </div>
        </header>
    );
}