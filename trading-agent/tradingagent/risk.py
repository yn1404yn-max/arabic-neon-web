"""Hard deterministic risk layer. The model cannot override anything here.

The kill switch is checked before EVERY order. Once tripped it stays tripped until a human
calls `reset()`. Limits are frozen and are not in the tunable set of the nightly loop.
"""
from __future__ import annotations
from dataclasses import dataclass


@dataclass(frozen=True)
class RiskLimits:
    max_drawdown: float = 0.15          # from peak equity
    max_position_frac: float = 0.25     # |notional| / equity
    max_daily_loss: float = 0.03        # from day-start equity
    max_risk_per_trade: float = 0.01    # equity fraction lost if stop hits
    max_orders_per_min: int = 6


@dataclass(frozen=True)
class Verdict:
    allowed: bool
    notional: float   # signed target delta notional after clamping (0 if rejected)
    reason: str


class RiskManager:
    def __init__(self, limits: RiskLimits, start_equity: float, now: float):
        self.limits = limits
        self.peak = start_equity
        self.day_start_equity = start_equity
        self.day = int(now // 86400)
        self.killed = False
        self.kill_reason = ""
        self._order_times: list[float] = []

    # --- kill switch -------------------------------------------------
    def kill(self, reason: str) -> None:
        self.killed, self.kill_reason = True, reason

    def reset(self) -> None:  # human-only
        self.killed, self.kill_reason = False, ""
        self._order_times.clear()

    # --- state -------------------------------------------------------
    def mark(self, equity: float, now: float) -> None:
        day = int(now // 86400)
        if day != self.day:
            self.day, self.day_start_equity = day, equity
        self.peak = max(self.peak, equity)
        if self.drawdown(equity) >= self.limits.max_drawdown:
            self.kill("max_drawdown")
        elif (self.day_start_equity - equity) / self.day_start_equity >= self.limits.max_daily_loss:
            self.kill("max_daily_loss")

    def drawdown(self, equity: float) -> float:
        return max(0.0, (self.peak - equity) / self.peak)

    # --- the gate every order passes --------------------------------
    def check(self, side: int, risk_frac: float, stop_bps: float, equity: float,
              current_notional: float, now: float) -> Verdict:
        self.mark(equity, now)
        if self.killed:
            return Verdict(False, 0.0, f"killed:{self.kill_reason}")
        recent = [t for t in self._order_times if now - t < 60]
        if len(recent) >= self.limits.max_orders_per_min:
            return Verdict(False, 0.0, "rate_limit")
        risk_frac = min(risk_frac, self.limits.max_risk_per_trade)
        desired = side * equity * risk_frac / (stop_bps / 1e4)
        cap = equity * self.limits.max_position_frac
        target = max(-cap, min(cap, current_notional + desired))
        delta = target - current_notional
        if abs(delta) < 1e-9:
            return Verdict(False, 0.0, "at_position_cap")
        self._order_times = recent + [now]
        return Verdict(True, delta, "ok")
