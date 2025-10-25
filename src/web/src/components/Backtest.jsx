import { useState } from "react";
import "../css/root.css";
import "../css/Backtest.css";
import {
  LiveButton,
  LiveSelect,
  LiveSingleText,
  LiveDateInput,
} from "./LiveUI";

const Backtest = () => {
  // State variables
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [capital, setCapital] = useState("");
  const [positionSize, setPositionSize] = useState("");
  const [commission, setCommission] = useState("");

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
          <LiveButton className="spread-button">
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
