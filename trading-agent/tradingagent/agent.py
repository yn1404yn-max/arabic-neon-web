"""The live loop: state -> Jev -> (escalate?) -> policy -> risk -> paper broker, logging everything.

Every decision is logged (traded or not) and later labelled with the realised forward return,
so the nightly review can score calibration on misses as well as fills.
"""
from __future__ import annotations
import json
from dataclasses import dataclass
from pathlib import Path

from .broker import PaperBroker
from .escalation import FLATTEN, PROCEED, DeepReviewer, FailSafeReviewer, needs_escalation
from .jev import JevClient
from .policy import decide
from .risk import RiskLimits, RiskManager
from .schema import GateConfig
from .state import Book, StateEngine, render


@dataclass
class _Pending:
    idx: int
    due_bar: int
    mid: float


class Agent:
    def __init__(self, jev: JevClient, cfg: GateConfig, limits: RiskLimits, cash: float,
                 start_t: float, log_path: str | Path | None = None,
                 reviewer: DeepReviewer | None = None, horizon_bars: int = 10):
        self.jev, self.cfg = jev, cfg
        self.engine = StateEngine()
        self.broker = PaperBroker(cash=cash)
        self.risk = RiskManager(limits, cash, start_t)
        self.reviewer = reviewer or FailSafeReviewer()
        self.horizon = horizon_bars
        self.log: list[dict] = []
        self.log_path = Path(log_path) if log_path else None
        self._pending: list[_Pending] = []
        self._bar = 0
        self._prev_regime: str | None = None
        self._stop = self._target = None
        self._bars_held = 0

    # -- helpers --
    def _flatten(self, book: Book, t: float, why: str) -> None:
        n = self.broker.notional((book.bids[0][0] + book.asks[0][0]) / 2)
        if abs(n) > 0:
            self.broker.trade_notional(-n, book.bids[0][0], book.asks[0][0], t)
            self._stop = self._target = None
            self._bars_held = 0

    def _exits(self, book: Book, t: float) -> None:
        if self.broker.qty == 0 or self._stop is None:
            return
        bid, ask = book.bids[0][0], book.asks[0][0]
        px = bid if self.broker.qty > 0 else ask   # price we could exit at
        long = self.broker.qty > 0
        hit = (long and (px <= self._stop or px >= self._target)) or \
              (not long and (px >= self._stop or px <= self._target))
        self._bars_held += 1
        if hit or self._bars_held >= self.cfg.max_hold_bars:
            self._flatten(book, t, "exit")

    def _label(self, mid: float) -> None:
        due = [p for p in self._pending if p.due_bar <= self._bar]
        self._pending = [p for p in self._pending if p.due_bar > self._bar]
        for p in due:
            self.log[p.idx]["fwd_bps"] = round((mid / p.mid - 1) * 1e4, 3)

    # -- main entry --
    def on_book(self, book: Book, now: float) -> dict:
        self._bar += 1
        bid, ask = book.bids[0][0], book.asks[0][0]
        mid = (bid + ask) / 2
        eq = self.broker.equity(mid)
        self.risk.mark(eq, now)
        if self.risk.killed:                       # kill switch: flatten and stand down
            self._flatten(book, now, "killed")
        snap = self.engine.update(book, now, self.broker.notional(mid) / eq if eq > 0 else 0.0,
                                  self.risk.drawdown(eq))
        self._label(mid)
        self._exits(book, now)
        text = render(snap)

        rec = {"bar": self._bar, "t": book.ts_event, "mid": mid, "snap": snap,
               "action": "none", "why": "", "fwd_bps": None}
        if self.risk.killed:
            rec.update(action="none", why=f"killed:{self.risk.kill_reason}")
            return self._record(rec)

        d = self.jev.decide(text)
        rec["jev"] = d.to_dict()
        esc = needs_escalation(d, self.cfg, self._prev_regime)
        self._prev_regime = d.regime
        if esc:
            verdict = self.reviewer.review(text, d, esc)
            rec["escalated"] = {"why": esc, "verdict": verdict}
            if verdict == FLATTEN:
                self._flatten(book, now, esc)
                rec.update(action="flatten", why=esc)
                return self._record(rec)
            if verdict != PROCEED:
                rec.update(action="hold", why=f"escalated:{esc}")
                return self._record(rec)

        intent = decide(d, self.cfg)
        if intent is None:
            rec.update(action="skip", why="gate")
            return self._record(rec)
        v = self.risk.check(intent.side, intent.fraction, self.cfg.stop_bps, eq,
                            self.broker.notional(mid), now)
        if not v.allowed:
            rec.update(action="blocked", why=v.reason)
            return self._record(rec)
        fill = self.broker.trade_notional(v.notional, bid, ask, now)
        if fill:
            s = self.cfg.stop_bps / 1e4
            e = fill.price
            self._stop = e * (1 - intent.side * s)
            self._target = e * (1 + intent.side * s * self.cfg.reward_risk)
            self._bars_held = 0
            rec.update(action="trade", why="ok", side=intent.side, qty=fill.qty, px=fill.price)
        return self._record(rec)

    def _record(self, rec: dict) -> dict:
        self.log.append(rec)
        self._pending.append(_Pending(len(self.log) - 1, self._bar + self.horizon, rec["mid"]))
        return rec

    def dump(self) -> None:
        if self.log_path:
            self.log_path.parent.mkdir(parents=True, exist_ok=True)
            with self.log_path.open("w") as f:
                for r in self.log:
                    f.write(json.dumps(r) + "\n")
