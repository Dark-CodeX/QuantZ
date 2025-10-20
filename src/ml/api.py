from io import StringIO
from flask import Flask, request, jsonify
import pandas as pd
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
            {'\$': ''}, regex=True), errors='coerce')
    df['volume'] = pd.to_numeric(df['volume'], errors='coerce')
    df = df.iloc[::-1].reset_index(drop=True)
    global_df = df
    return jsonify(df.to_dict(orient='records'))


app = Flask(__name__)


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
    if global_df is None or "close" not in global_df:
        return "No data loaded. Upload CSV first.", 400

    data = request.get_json(force=True)
    period = data.get("period")
    if indicator == "SMA":
        return str(qz.SMA(global_df["close"], period))
    elif indicator == "EMA":
        return str(qz.EMA(global_df["close"], period))
    elif indicator == "RSI":
        return str(qz.RSI(global_df["close"], period))
    elif indicator == "ATR":
        return str(qz.ATR(global_df["high"], global_df["low"], global_df["close"], period))
    return "Unknown indicator", 400


if __name__ == '__main__':
    app.run(port=9080)
