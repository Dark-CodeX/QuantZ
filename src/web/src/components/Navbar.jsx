import { useState, useEffect } from "react";
import { LiveButton, LiveSingleText } from "./LiveUI"
import '../css/root.css';
import "../css/Navbar.css"

export default function Navbar() {
    const [now, setNow] = useState(new Date());
    const [themeLight, setThemeLight] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isHomePage, setIsHomePage] = useState(false);

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        changeTheme();
        return () => clearInterval(id);
    }, []);

    function changeTheme() {
        const r = document.querySelector(':root');

        setThemeLight(prev => {
            const newThemeLight = !prev;

            if (newThemeLight) {
                // light theme
                r.style.setProperty('--bg', '#f3f7fb');
                r.style.setProperty('--surface', '#ffffff');
                r.style.setProperty('--panel', '#f0f6ff');
                r.style.setProperty('--fg', '#1e1e1e');
                r.style.setProperty('--muted', '#6e6e6e');
                r.style.setProperty('--primary', '#0a84ff');
                r.style.setProperty('--primary-dark', '#0078d4');
                r.style.setProperty('--border', '#c8d6f0');
                r.style.setProperty('--radius', '6px');
                r.style.setProperty('--shadow', '0 2px 6px rgba(10, 132, 255, 0.08)');
            } else {
                // dark theme
                r.style.setProperty('--bg', '#1e1e1e');
                r.style.setProperty('--surface', '#252526');
                r.style.setProperty('--panel', '#2d2d30');
                r.style.setProperty('--fg', '#d4d4d4');
                r.style.setProperty('--muted', '#a0a0a0');
                r.style.setProperty('--primary', '#0a84ff');
                r.style.setProperty('--primary-dark', '#005a9e');
                r.style.setProperty('--border', '#3c3c3c');
                r.style.setProperty('--radius', '6px');
                r.style.setProperty('--shadow', '0 2px 6px rgba(0, 0, 0, 0.6)');
            }

            return newThemeLight;
        });

    }

    return (
        <header className="topbar">
            {!isHomePage &&
                <LiveButton className="back-button"><svg fill="var(--fg)" width="30px" height="30px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M1.293,12.707a1,1,0,0,1,0-1.414l6-6A1,1,0,0,1,8.707,6.707L4.414,11H22a1,1,0,0,1,0,2H4.414l4.293,4.293a1,1,0,0,1-1.414,1.414Z" /></svg></LiveButton>
            }
            <div className="brand">
                <span className="logo">QZ</span>
                <span>
                    <div className="title">QuantZ</div>
                    <div className="sub">Welcome, User</div>
                </span>
            </div>
            <div className="topbar-center"><LiveSingleText className="search-bar" placeholder="Search" type="search" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value) }}></LiveSingleText></div>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px"
            }}>
                <div onClick={changeTheme}><p style={{ fontSize: "16px", fontWeight: "bolder", cursor: "pointer", color: "red", userSelect: "none" }}>{(themeLight === true ? "☾" : "𖤓")}</p></div>
                <time style={{ color: "var(--muted)" }}>{now.toLocaleString("en-IN", {
                    dateStyle: "full",
                    timeStyle: "long",
                })}</time>
            </div>
        </header >
    )
}