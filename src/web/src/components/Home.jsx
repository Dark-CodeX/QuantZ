import { useRef, useState } from "react";
import "../css/root.css";
import "../css/Home.css";
import { LiveButton, LiveSingleText } from "./LiveUI";
import { SendToBackend } from "./Helper"

function NewWorkbook({ setShowNewWorkbood, setShowMain, setCSVData, setErrorMessage }) {
    const fileRef = useRef(null);
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState("Choose a CSV file");
    const [workbookName, setWorkbookName] = useState("");

    function handleChange(e) {
        const f = e.target.files?.[0];
        if (!f) return;
        setFileName(f.name);
        setFile(f);
        e.target.value = null;
    }

    function onSubmit() {
        if (!file) {
            setErrorMessage((prev) => [...prev, "Error: Upload a CSV file first."])
            return;
        }
        const formData = new FormData();
        formData.append("file", file);

        SendToBackend(formData, "/upload/csv", null, setErrorMessage).then((response) => {
            if (response.status === 200) {
                setCSVData(JSON.parse(response.body));
                setShowMain(true);
            }
            else {
                setErrorMessage((prev) => [...prev, response.body === "" || response.body === null ? `Error: Empty response with code ${response.status}` : response.body]);
            }
        }).catch((err) => {
            setErrorMessage((prev) => [...prev, err.toString()])
        });

    }

    return (
        <div className="new-workbook">
            <h3 style={{ textAlign: "center" }}>New Workbook</h3>
            <div className="input-group">
                <label style={{ fontWeight: "bold" }}>Workbook Name:</label>
                <LiveSingleText placeholder="workbook1.qz" value={workbookName} onChange={(e) => { setWorkbookName(e.target.value) }} />
            </div>

            <div className="input-group">
                <label style={{ fontWeight: "bold" }}>Upload CSV:</label>
                <div className="file-input-wrapper" onClick={() => fileRef.current.click()}>
                    <span>{fileName}</span>
                    <LiveButton>Browse</LiveButton>
                </div>
            </div>

            <div className="workbook-actions-buttons">
                <LiveButton onClick={onSubmit}>Submit</LiveButton>
                <LiveButton onClick={() => { setFileName("Choose a CSV file"); setFile(null); setShowNewWorkbood(false); }}>Cancel</LiveButton>
            </div>

            <input
                type="file"
                ref={fileRef}
                onChange={handleChange}
                accept=".csv,text/csv"
                style={{ display: "none" }}
            />
        </div >
    );
}

export default function Home({ setShowMain, setCSVData, setErrorMessage }) {
    const [workbooks, setWorkbooks] = useState([{ name: "rsi28-sma20.qz", thumbnail: null }, { name: "ema14-atr20.qz", thumbnail: null }, { name: "bb24-wma24.qz", thumbnail: null }]);
    const [showNewWorkbood, setShowNewWorkbood] = useState(false);

    return (
        <div className="app">
            {showNewWorkbood && <NewWorkbook setShowNewWorkbood={setShowNewWorkbood} setShowMain={setShowMain} setCSVData={setCSVData} setErrorMessage={setErrorMessage} />}
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
                        <button className="new" onClick={() => setShowNewWorkbood(true)}>
                            <span className="plus">+</span>
                            <div style={{ fontSize: "18px", fontWeight: "bold" }}>New workbook</div>
                            <small style={{ fontSize: "12px" }}>Upload a CSV</small>
                        </button>

                        {workbooks.map((v, i) => (
                            <div key={i} className="card" onClick={() => {
                                console.log("Opening workbook:", v.name);
                            }}>
                                <div style={{ width: "100%", height: "100px", overflow: "hidden", borderRadius: "8px", marginBottom: "8px" }}>
                                    {v.thumbnail
                                        ? <img src={v.thumbnail} alt={v.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        : <div style={{
                                            width: "100%", height: "100%", background: "var(--border)",
                                            display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.5
                                        }}>
                                            (No Preview)
                                        </div>}
                                </div>

                                <div style={{ fontSize: "14px", fontWeight: "600", wordBreak: "break-all" }}>
                                    {v.name}
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div >
        </div >
    );
}
