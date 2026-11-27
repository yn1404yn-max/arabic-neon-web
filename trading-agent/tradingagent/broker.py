"""Paper broker: single asset, market orders, spread + slippage + fee. No real money, ever."""
from __future__ import annotations
from dataclasses import dataclass, field


@dataclass
class Fill:
    t: float
    qty: float       # signed, base units
    price: float
    fee: float


@dataclass
class PaperBroker:
    cash: float
    fee_bps: float = 5.0
    slippage_bps: float = 2.0
    qty: float = 0.0
    avg_entry: float = 0.0
    fills: list[Fill] = field(default_factory=list)

    def equity(self, mid: float) -> float:
        return self.cash + self.qty * mid

    def notional(self, mid: float) -> float:
        return self.qty * mid

    def trade_notional(self, delta_notional: float, bid: float, ask: float, t: float) -> Fill | None:
        mid = (bid + ask) / 2
        if mid <= 0 or abs(delta_notional) < 1e-9:
            return None
        qty = delta_notional / mid
        slip = self.slippage_bps / 1e4
        px = ask * (1 + slip) if qty > 0 else bid * (1 - slip)
        fee = abs(qty) * px * self.fee_bps / 1e4
        new_qty = self.qty + qty
        if self.qty == 0 or (self.qty > 0) == (qty > 0):
            tot = abs(self.qty) + abs(qty)
            self.avg_entry = (self.avg_entry * abs(self.qty) + px * abs(qty)) / tot
        elif abs(new_qty) < 1e-12 or (new_qty > 0) != (self.qty > 0):
            self.avg_entry = px if abs(new_qty) > 1e-12 else 0.0
        self.cash -= qty * px + fee
        self.qty = new_qty if abs(new_qty) > 1e-12 else 0.0
        f = Fill(t, qty, px, fee)
        self.fills.append(f)
        return f
