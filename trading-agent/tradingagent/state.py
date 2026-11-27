"""Deterministic state engine: order book -> one compact numeric snapshot (<400 tokens).

Causality: a book is only accepted if ts_event <= now and it is newer than the last one.
Everything is computed in code from data already seen; no field can leak the future.
"""
from __future__ import annotations
import json
import math
from collections import deque
from dataclasses import dataclass

MAX_SNAPSHOT_TOKENS = 400


@dataclass(frozen=True)
class Book:
    ts_event: float                      # exchange timestamp (s)
    bids: tuple[tuple[float, float], ...]  # (price, size), best first
    asks: tuple[tuple[float, float], ...]


class CausalityError(ValueError):
    pass


def approx_tokens(text: str) -> int:
    # Conservative: ~3 chars/token for dense numeric JSON.
    return math.ceil(len(text) / 3)


class StateEngine:
    def __init__(self, depth: int = 5, vol_window: int = 60, max_age_s: float = 5.0):
        self.depth, self.max_age_s = depth, max_age_s
        self._mids: deque[float] = deque(maxlen=vol_window + 1)
        self._last_ts = float("-inf")

    def update(self, book: Book, now: float, inventory_frac: float, drawdown: float) -> dict:
        if book.ts_event > now:
            raise CausalityError("book timestamp is in the future")
        if book.ts_event <= self._last_ts:
            raise CausalityError("out-of-order or duplicate book")
        if now - book.ts_event > self.max_age_s:
            raise CausalityError("stale book")
        if not book.bids or not book.asks:
            raise ValueError("empty side")
        bid, ask = book.bids[0][0], book.asks[0][0]
        if bid >= ask:
            raise ValueError("crossed book")
        self._last_ts = book.ts_event
        mid = (bid + ask) / 2
        self._mids.append(mid)

        bq = sum(s for _, s in book.bids[: self.depth])
        aq = sum(s for _, s in book.asks[: self.depth])
        imbalance = (bq - aq) / (bq + aq) if bq + aq > 0 else 0.0
        rets = [math.log(b / a) for a, b in zip(list(self._mids)[:-1], list(self._mids)[1:])]
        if len(rets) >= 2:
            m = sum(rets) / len(rets)
            rv = math.sqrt(sum((r - m) ** 2 for r in rets) / (len(rets) - 1))
        else:
            rv = 0.0
        ret_n = lambda n: (math.log(mid / self._mids[-1 - n]) * 1e4) if len(self._mids) > n else 0.0
        snap = {
            "t": round(book.ts_event, 3),
            "mid": round(mid, 4),
            "spread_bps": round((ask - bid) / mid * 1e4, 3),
            "imb": round(imbalance, 4),
            "rv_bps": round(rv * 1e4, 3),
            "ret1_bps": round(ret_n(1), 3),
            "ret10_bps": round(ret_n(10), 3),
            "inv": round(inventory_frac, 4),
            "dd": round(drawdown, 4),
            "n": len(self._mids),
        }
        return snap


def render(snapshot: dict) -> str:
    text = json.dumps(snapshot, separators=(",", ":"), sort_keys=True)
    if approx_tokens(text) >= MAX_SNAPSHOT_TOKENS:
        raise ValueError("snapshot exceeds token budget")
    return text
