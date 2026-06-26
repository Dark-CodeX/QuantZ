# QuantZ

QuantZ is a comprehensive, high-performance platform for quantitative analysis, algorithmic strategy development, and backtesting. It combines a fast C++ computation core with a user-friendly, web-based visual strategy builder, enabling users to design, test, and analyze trading strategies without writing code.

The platform features a drag-and-drop interface where trading logic is constructed using a Directed Acyclic Graph (DAG). Strategies are built by connecting nodes representing technical indicators, logical operators, and trading actions (Buy/Sell).

## Key Features

*   **Visual Strategy Builder:** An intuitive, web-based DAG editor using React Flow to build complex trading strategies by connecting nodes.
*   **High-Performance C++ Core:** Critical mathematical and indicator calculations are implemented in C++ and accelerated using SIMD (AVX/SSE) instructions for maximum performance.
*   **Python/Flask Backend:** A robust Python backend powered by Flask serves the API, manages data with Pandas, and orchestrates the backtesting engine.
*   **Pybind11 Integration:** Seamlessly exposes the high-speed C++ computation functions to the Python environment.
*   **Comprehensive Backtesting:** Run historical simulations on uploaded CSV data. The engine calculates detailed performance metrics, including total return, Sharpe ratio, max drawdown, and win rate, along with a full trade log and equity curve.
*   **Interactive Charting:** Visualize historical price data with interactive candlestick charts powered by Plotly. Overlays for technical indicators generated from the strategy are displayed directly on the chart.
*   **Extensive Indicator Library:** Includes a wide range of common technical indicators:
    *   Simple Moving Average (SMA)
    *   Exponential Moving Average (EMA)
    *   Weighted Moving Average (WMA) with various weighting schemes (Linear, Harmonic, Triangular, etc.)
    *   Volume-Weighted Moving Average (VWMA)
    *   Moving Average Convergence/Divergence (MACD)
    *   Relative Strength Index (RSI)
    *   Bollinger Bands
    *   Average True Range (ATR)
    *   Momentum

## Architecture

QuantZ is built on a multi-tiered architecture designed for performance and usability:

1.  **Core (C++ & SIMD):** At the lowest level, `simd_math` provides SIMD-accelerated mathematical functions, and `indicators` contains the efficient C++ implementations of technical indicators.
2.  **API & Backtesting Layer (Python):** A Flask API serves as the bridge. It handles data processing using Pandas, uses `pybind11` to call the C++ core for fast computations, and runs the `backtest.py` engine to evaluate strategies defined by the DAG.
3.  **Frontend (React):** A modern, responsive user interface built with React, Vite, and React Flow. It provides the visual strategy builder, charting, and backtesting dashboard that communicates with the Python backend via a REST API.

## Technology Stack

*   **Core:** C, C++20, SIMD Intrinsics (AVX, SSE)
*   **Backend:** Python, Flask, Pandas, Pybind11, Gunicorn
*   **Frontend:** React, Vite, React Flow, Plotly.js
*   **Build Tools:** setuptools (Python), GCC/G++, npm

## Installation and Setup

### Prerequisites

*   GCC & G++
*   Python 3.x and Pip
*   Node.js and npm

### 1. Backend Setup

First, clone the repository:
```bash
git clone https://github.com/Dark-CodeX/QuantZ.git
cd QuantZ
```

Install the required Python packages:
```bash
pip install -r src/python/requirements.txt
```

Build the C++ extension module. This compiles the core C/C++ files into a shared library that Python can import.
```bash
cd src
python setup.py build_ext --inplace
```

Move the compiled library into the Python application directory:
```bash
# The exact filename may vary based on your OS and Python version
mv quantzlib.*.so ./python/
```

Finally, run the Flask backend server:
```bash
# From the src/ directory
gunicorn --chdir ./python -w 4 -b 0.0.0.0:10000 api:app
```
The backend will be running on `http://localhost:10000`.

### 2. Frontend Setup

In a new terminal, navigate to the web directory and install the dependencies:
```bash
cd src/web
npm install
```

Run the frontend development server:
```bash
npm run dev
```
The frontend will be accessible at `http://localhost:5173` (or another port specified by Vite).

## Usage

1.  **Launch:** Once both the backend and frontend servers are running, open your web browser to the frontend URL.
2.  **New Workbook:** From the home screen, click "New workbook" to upload a CSV file containing historical market data. The CSV should include columns for `Date`, `Open`, `High`, `Low`, `Close`, and `Volume`.
3.  **Strategy Builder:** You will be taken to the main interface with the "Strategy" tab active.
    *   Drag nodes (Indicators, Operators, Logic, Actions, Control) from the left panel onto the canvas.
    *   Connect the nodes to define the data flow and logic of your strategy. For example: `Start -> SMA -> More Than (>) -> TRUE -> Buy`.
    *   Double-click a node to open its settings panel. Configure parameters like indicator periods or operator values. Submitting indicator settings will automatically plot them on the chart.
4.  **Chart:** Switch to the "Chart" tab to view the candlestick chart of your data, with any configured indicators overlaid.
5.  **Backtest:**
    *   Navigate to the "Backtest" tab.
    *   Set the initial capital, position size, commission/slippage, and date range for the simulation.
    *   Click "Run" to execute the backtest.
6.  **Analyze Results:** The backtest results will be displayed, including:
    *   An interactive equity curve chart.
    *   Key performance metrics.
    *   A detailed table of all trades executed during the simulation.

## License

This project is licensed under the **GNU General Public License v3.0**. See the [LICENSE](LICENSE) file for more details.