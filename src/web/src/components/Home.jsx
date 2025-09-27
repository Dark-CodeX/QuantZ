import { useRef } from "react";
import "../css/root.css";
import "../css/Home.css";
import { LiveButton } from "./LiveUI";

export default function Home({ files, setFiles }) {
    const fileRef = useRef(null);

    function pickFile() {
        fileRef.current?.click();
    }

    function handleFile(e) {
        const f = e.target.files?.[0];
        if (!f) return;
        const url = URL.createObjectURL(f);
        setFiles([{ name: f.name, url: url }]);
        e.target.value = null;
    }

    return (
        <div className="app">
            <div className="shell">
                <aside className="side">
                    <div className="quick-access-panel">
                        <p style={{ fontSize: "17px", fontWeight: "bold", textAlign: "center" }}>Quick Access</p>
                        <LiveButton>Documentation</LiveButton>
                        <LiveButton>Tutorials</LiveButton>
                        <LiveButton onClick={() => { window.open("https://www.github.com/Dark-CodeX/QuantZ", '_blank').focus(); }}>Contribute &lt;/&gt;</LiveButton>
                    </div>
                    <div className="settings">
                        <LiveButton>Settings</LiveButton>
                        <LiveButton>Account</LiveButton>
                    </div>
                </aside>

                <main>
                    <div className="grid">
                        <button className="new" onClick={pickFile}>
                            <span className="plus">+</span>
                            <div style={{ fontSize: "18px", fontWeight: "bold" }}>New workbook</div>
                            <small style={{ fontSize: "12px" }}>Upload a CSV</small>
                        </button>

                        {files && files.map((f, i) => (
                            <article key={i} className="card">
                                <h3>{f.name}</h3>
                                <a href={f.url} target="_blank" rel="noreferrer">
                                    Open File
                                </a>
                            </article>
                        ))}
                    </div>
                </main>
            </div>

            <input
                type="file"
                accept=".csv,text/csv"
                ref={fileRef}
                style={{ display: "none" }}
                onChange={handleFile}
            />
        </div>
    );
}
