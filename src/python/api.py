from io import StringIO
from flask import Flask, request, jsonify
import pandas as pd
from flask_cors import CORS
import quantzlib as qz

global_df = None  # better to use None


def CleanCSV(data):
    global global_df
    df = pd.read_csv(StringIO(data))
    df.rename(columns={
        'Date': 'date',
        'Close': 'close',
        'Close/Last': 'close',
        'Open': 'open',
        'High': 'high',
        'Low': 'low',
        'Volume': 'volume'
    }, inplace=True)
    df['date'] = pd.to_datetime(
        df['date'], format='%m/%d/%Y').dt.strftime('%Y-%m-%d')
    for col in ['close', 'open', 'high', 'low']:
        df[col] = pd.to_numeric(df[col].replace(
            {r'\$': ''}, regex=True), errors='coerce')
    df['volume'] = pd.to_numeric(df['volume'], errors='coerce')
    df = df.iloc[::-1].reset_index(drop=True)
    global_df = df
    return jsonify(df.to_dict(orient='records'))


app = Flask(__name__)
CORS(
    app,
    supports_credentials=True,
    resources={r"/*": {"origins": ["https://quantz-dxgw.onrender.com"]}}
)


@app.route("/upload/<type>", methods=["POST"])
def upload(type):
    if type == "csv":
        file = request.files.get("file")
        if file:
            content = file.read().decode("utf-8")
            return CleanCSV(content)
    return "No file received or unknown type", 400


@app.route("/indicators/<indicator>", methods=["POST"])
def indicators(indicator):
    global global_df
    if global_df is None:
        return "Error: no historical data loaded, upload CSV first", 400

    data = request.get_json(force=True)
    if indicator == "SMA":
        period = data.get("period")
        price = data.get("price").lower()
        return str(qz.SMA(global_df[price], period))
    elif indicator == "EMA":
        period = data.get("period")
        price = data.get("price").lower()
        return str(qz.EMA(global_df[price], period))
    elif indicator == "RSI":
        period = data.get("period")
        price = data.get("price").lower()
        return str(qz.RSI(global_df[price], period))
    elif indicator == "ATR":
        period = data.get("period")
        price = data.get("price").lower()
        return str(qz.ATR(global_df["high"], global_df["low"], global_df[price], period))
    elif indicator == "MACD":
        fast = data.get("fast")
        slow = data.get("slow")
        price = data.get("price").lower()
        return str(qz.MACD(global_df[price], fast, slow))
    elif indicator == "VWMA":
        period = data.get("period")
        price = data.get("price").lower()
        return str(qz.VWMA(global_df[price], global_df["volume"], period))
    elif indicator == "BollingerBands":
        period = data.get("period")
        multiplier = data.get("multiplier")
        price = data.get("price").lower()
        return str(qz.BollingerBands(global_df[price], period, multiplier))
    elif indicator == "WMA":
        period = data.get("period")
        w = data.get("weights").lower()
        price = data.get("price").lower()
        if w == "linear":
            weights = [i for i in range(1, period + 1)]
        elif w == "normalized linear":
            weights = [i/period for i in range(1, period + 1)]
        elif w == "harmonic":
            weights = [1/i for i in range(1, period + 1)]
        elif w == "triangular":
            mid = (period + 1) // 2
            if period % 2 == 0:
                weights = list(range(1, mid + 1)) + list(range(mid, 0, -1))
            else:
                weights = list(range(1, mid + 1)) + list(range(mid - 1, 0, -1))
        elif w == "quadratic":
            weights = [i**2 for i in range(1, period + 1)]
        elif w == "cubic":
            weights = [i**3 for i in range(1, period + 1)]
        elif w == "root":
            weights = [i**0.5 for i in range(1, period + 1)]
        else:
            return f"Error: unknown WMA weight type '{w}'", 400
        return str(qz.WMA(global_df[price], weights, period))
    return f"Error: unknown indicator '{indicator}'", 400


@app.route("/backtest", methods=["POST"])
def backtest():
    data = request.get_json(force=True)
    
    return ""

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
