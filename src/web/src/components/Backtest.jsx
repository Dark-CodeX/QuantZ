import { useState } from "react";
import "../css/root.css";
import "../css/Backtest.css";
import {
    LiveButton,
    LiveSingleText,
    LiveDateInput,
} from "./LiveUI";
import { SaveStrategyJSON, SendToBackend, ValidateInput } from './Helper';

const Backtest = ({ nodes, edges, setErrorMessage }) => {
    // State variables
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [capital, setCapital] = useState("");
    const [positionSize, setPositionSize] = useState("");
    const [commission, setCommission] = useState("");

    function handle_run() {
        {
            let validation = ValidateInput(capital, "float", "Capital");
            if (validation.r === false) {
                setErrorMessage((prev) => [...prev, validation.m]);
                return;
            }
            validation = ValidateInput(positionSize, "float", "Position Size")
            if (validation.r === false) {
                setErrorMessage((prev) => [...prev, validation.m]);
                return;
            }
            validation = ValidateInput(commission, "float", "Commission")
            if (validation.r === false) {
                setErrorMessage((prev) => [...prev, validation.m]);
                return;
            }
            const d1 = new Date(startDate);
            const d2 = new Date(endDate);
            if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
                setErrorMessage((prev) => [...prev, "Error: Invalid date format."]);
                return;
            }
            if (d1.getTime() > d2.getTime()) {
                setErrorMessage((prev) => [...prev, "Error: Start date cannot be after end date."]);
                return;
            }
            if (d1.getTime() === d2.getTime()) {
                setErrorMessage((prev) => [...prev, "Error: Start date and end date cannot be the same."]);
                return;
            }
        }

        let data = JSON.stringify(SaveStrategyJSON(nodes, edges, { startDate: startDate, endDate: endDate, capital: capital, positionSize: positionSize, commission: commission }), null, 1);
        // SendToBackend(
        //     JSON.stringify(data, null, 1), "/backtest", "application/json")
        //     .then((res) => {
        //         if (res.status === 400) {
        //             setErrorMessage((prev) => [...prev, res.body]);
        //         } else {
        //             console.log(res.body)
        //         }
        //     })
        //     .catch((err) => { setErrorMessage((prev) => [...prev, err.toString()]) });
    }

    return (
        <div className="backtest-container">
            {/* Left Panel - Inputs */}
            <div className="backtest-input">
                <div className="input-group">
                    <div className="date-row">
                        <div className="date-field">
                            <label>Start Date:</label>
                            <LiveDateInput
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="date-field">
                            <label>End Date:</label>
                            <LiveDateInput
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="input-group">
                    <label>Initial Capital:</label>
                    <LiveSingleText
                        value={capital}
                        onChange={(e) => setCapital(e.target.value)}
                        placeholder="e.g. 100000"
                    />
                </div>

                <div className="input-group">
                    <label>Position Size:</label>
                    <LiveSingleText
                        value={positionSize}
                        onChange={(e) => setPositionSize(e.target.value)}
                        placeholder="e.g. 10"
                    />
                </div>

                <div className="input-group">
                    <label>Commission / Slippage:</label>
                    <LiveSingleText
                        value={commission}
                        onChange={(e) => setCommission(e.target.value)}
                        placeholder="e.g. 0.001"
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "row", gap: "8px" }}>
                    <LiveButton className="spread-button" onClick={handle_run}>
                        <span style={{ color: "green", fontWeight: "bold" }}>&#9654;</span>
                        <b> Run</b>
                    </LiveButton>
                    <LiveButton
                        className="spread-button"
                        onClick={() => {
                            setStartDate("");
                            setEndDate("");
                            setCapital("");
                            setPositionSize("");
                            setCommission("");
                        }}
                    >
                        Clear
                    </LiveButton>
                </div>
            </div>

            {/* Right Panel - Output */}
            <div className="backtest-output">
                <h3>Results</h3>
                <div className="backtest-chart-placeholder">
                    [Chart will appear here]
                </div>
                <div className="backtest-stats-placeholder">
                    [Performance stats here]
                </div>
            </div>
        </div>
    );
};

export default Backtest;
