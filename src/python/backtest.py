import pandas as pd
import numpy as np
import json
import quantzlib as qz


def evaluate_operator(lhs, operator_label, rhs):
    try:
        lhs_val = float(lhs)
        rhs_val = float(rhs)
    except Exception:
        return False

    mapping = {
        "More Than or Equals To (≥)": lambda a, b: a >= b,
        ">=": lambda a, b: a >= b,
        "Less Than or Equals To (≤)": lambda a, b: a <= b,
        "<=": lambda a, b: a <= b,
        "Equals (=)": lambda a, b: a == b,
        "==": lambda a, b: a == b,
        "Not Equals (≠)": lambda a, b: a != b,
        "≠": lambda a, b: a != b,
        "More Than (>)": lambda a, b: a > b,
        ">": lambda a, b: a > b,
        "Less Than (<)": lambda a, b: a < b,
        "<": lambda a, b: a < b,
    }

    op = mapping.get(operator_label)
    if not op:
        return False
    return op(lhs_val, rhs_val)


class DAGStrategy:
    def __init__(self, dag_json, df):
        self.nodes = {n['id']: n for n in dag_json["nodes"]}
        self.edges = dag_json["edges"]
        self.df = df.copy()
        # adjacency list
        self.adj = {n["id"]: [] for n in dag_json["nodes"]}
        for edge in self.edges:
            self.adj[edge['src']].append(edge["dest"])

    def _precalc_indicators(self):
        for node_id, node in self.nodes.items():
            if node["data"].get("kind") == "indicator":
                label = node["data"]["label"]
                if label == "RSI":
                    period = int(node["data"].get("Period"))
                    price_col = node["data"].get("Price").lower()
                    col_name = f"{label}_{period}_{price_col}_{node_id}"

                    self.df[col_name] = qz.RSI(self.df[price_col], period)
                    node["temp_col"] = col_name
                elif label == "SMA":
                    period = int(node["data"].get("Period"))
                    price_col = node["data"].get("Price").lower()
                    col_name = f"{label}_{period}_{price_col}_{node_id}"

                    self.df[col_name] = qz.SMA(self.df[price_col], period)
                    node["temp_col"] = col_name
                elif label == "EMA":
                    period = int(node["data"].get("Period"))
                    price_col = node["data"].get("Price").lower()
                    col_name = f"{label}_{period}_{price_col}_{node_id}"

                    self.df[col_name] = qz.EMA(self.df[price_col], period)
                    node["temp_col"] = col_name
                elif label == "ATR":
                    period = int(node["data"].get("Period"))
                    price_col = node["data"].get("Price").lower()
                    col_name = f"{label}_{period}_{price_col}_{node_id}"

                    self.df[col_name] = qz.ATR(
                        self.df["high"], self.df["low"], self.df[price_col], period)
                    node["temp_col"] = col_name
                elif label == "MACD":
                    fast = int(node["data"].get("Fast"))
                    slow = int(node["data"].get("Slow"))
                    price_col = node["data"].get("Price").lower()
                    col_name = f"{label}_{fast}_{slow}_{price_col}_{node_id}"

                    self.df[col_name] = qz.MACD(self.df[price_col], fast, slow)
                    node["temp_col"] = col_name
                elif label == "VWMA":
                    period = int(node["data"].get("Period"))
                    price_col = node["data"].get("Price").lower()
                    col_name = f"{label}_{period}_{price_col}_{node_id}"

                    self.df[col_name] = qz.VWMA(
                        self.df[price_col], self.df["volume"], period)
                    node["temp_col"] = col_name
                elif label == "BollingerBands":
                    period = int(node["data"].get("Period"))
                    mulp = float(node["data"].get("Multiplier"))
                    price_col = node["data"].get("Price").lower()
                    col_name = f"{label}_{period}_{price_col}_{node_id}"

                    self.df[col_name] = qz.BollingerBands(
                        self.df[price_col], period, mulp)
                    node["temp_col"] = col_name
                elif label == "Momentum":
                    period = int(node["data"].get("Period"))
                    price_col = node["data"].get("Price").lower()
                    col_name = f"{label}_{period}_{price_col}_{node_id}"

                    self.df[col_name] = qz.Momentum(self.df[price_col], period)
                    node["temp_col"] = col_name
                elif label == "WMA":
                    period = int(node["data"].get("Period"))
                    price_col = node["data"].get("Price").lower()
                    weights = node["data"].get("Weights").lower()
                    col_name = f"{label}_{period}_{price_col}_{weights}_{node_id}"

                    self.df[col_name] = qz.WMA(
                        self.df[price_col], weights, period)
                    node["temp_col"] = col_name

    def get_signal(self, current_row_index):
        """Traverse DAG from Start and return 'Buy' or 'Sell' or None.

        The traversal is depth-first but we only fire an action node if the input boolean reaching it is True.
        """
        start_node = next((n for n in self.nodes.values()
                          if n["data"]["label"] == "Start"), None)
        if not start_node:
            return None

        stack = [(start_node, None)]

        while stack:
            curr_node, input_val = stack.pop()
            node_type = curr_node["data"].get("kind")
            node_id = curr_node["id"]
            output_val = input_val

            if node_type == "indicator":
                col = curr_node.get("temp_col")
                if col is None or col not in self.df.columns:
                    output_val = None
                else:
                    output_val = self.df.at[current_row_index, col]

            elif node_type == "operator":
                threshold = curr_node["data"].get("value")
                label = curr_node["data"].get("label")
                output_val = evaluate_operator(input_val, label, threshold)

            elif node_type == "logic":
                label = curr_node["data"].get("label")
                # Only pass forward when the logic node matches the boolean input
                if (label == "TRUE" and input_val is True) or (label == "FALSE" and input_val is False):
                    output_val = True
                else:
                    # do not propagate to children
                    continue

            elif node_type == "action":
                # Only trigger action if the input boolean is True
                if output_val is True:
                    return curr_node["data"].get("label")
                else:
                    continue

            # control nodes fall through (no value change)
            children_ids = self.adj.get(node_id, [])
            for child_id in children_ids:
                # push child with the current output_val
                stack.append((self.nodes[child_id], output_val))

        return None


def run_backtest(df, dag_json, initial_capital, allocation_fraction, commission):
    """Run backtest.
    - allocation_fraction: fraction of current equity to allocate on each entry (0.1 -> 10%).
    - commission: fraction of trade value taken as commission.
    """
    strategy = DAGStrategy(dag_json=dag_json, df=df)
    strategy._precalc_indicators()

    commission = float(commission)
    allocation_fraction = float(allocation_fraction)

    cash = float(initial_capital)
    # quantity of shares currently held (start with zero)
    position = 0.0
    entry_price = None
    equity_curve = []
    trade_log = []

    # Iterate using row index to access precomputed indicator columns
    for i, row in df.iterrows():
        curr_price = row["close"]
        # use actual date column if present
        date = row.get("date", None) if "date" in df.columns else row.name

        equity = cash + (position * curr_price)
        equity_curve.append({"Date": date, "Equity": equity})

        signal = strategy.get_signal(i)

        # BUY: only if no open position
        if signal == "Buy" and position == 0:
            max_amt = equity * allocation_fraction
            qty = max_amt / curr_price if curr_price > 0 else 0
            cost = qty * curr_price
            comm_cost = cost * commission

            if cash >= (cost + comm_cost) and qty > 0:
                cash -= (cost + comm_cost)
                position = qty
                entry_price = curr_price
                trade_log.append({
                    'Date': date, 'Type': 'BUY', 'Price': curr_price,
                    'Qty': qty, 'Comm': comm_cost, 'Balance': cash
                })

        # SELL: only if position > 0
        elif signal == 'Sell' and position > 0:
            revenue = position * curr_price
            comm_cost = revenue * commission
            cash += (revenue - comm_cost)

            pnl = (curr_price - entry_price) * position - \
                comm_cost if entry_price is not None else None

            trade_log.append({
                'Date': date, 'Type': 'SELL', 'Price': curr_price,
                'Qty': position, 'Comm': comm_cost, 'Balance': cash, 'PnL': pnl
            })
            position = 0.0
            entry_price = None

    equity_df = pd.DataFrame(equity_curve).set_index('Date')
    trades_df = pd.DataFrame(trade_log)
    return equity_df, trades_df


def calculate_metrics(equity_df, trades_df):
    if equity_df.empty:
        return {}

    initial = equity_df['Equity'].iloc[0]
    final = equity_df['Equity'].iloc[-1]

    total_return = (final - initial) / initial * 100
    equity_df['Returns'] = equity_df['Equity'].pct_change()

    mean_ret = equity_df['Returns'].mean()
    std_ret = equity_df['Returns'].std()
    sharpe = (mean_ret / std_ret) * (252 ** 0.5) if std_ret != 0 else 0

    equity_df['Peak'] = equity_df['Equity'].cummax()
    equity_df['Drawdown'] = (equity_df['Equity'] -
                             equity_df['Peak']) / equity_df['Peak']
    max_dd = equity_df['Drawdown'].min() * 100

    win_rate = 0
    if not trades_df.empty and 'PnL' in trades_df.columns:
        closed_trades = trades_df.dropna(subset=['PnL'])
        wins = len(closed_trades[closed_trades['PnL'] > 0])
        total_trades = len(closed_trades)
        win_rate = (wins / total_trades * 100) if total_trades > 0 else 0

    return {
        "Total Return (%)": round(float(total_return), 2),
        "Sharpe Ratio": round(float(sharpe), 2),
        "Max Drawdown (%)": round(float(max_dd), 2),
        "Win Rate (%)": round(round(win_rate, 2), 2),
        "Final Equity": round(float(final), 2)
    }