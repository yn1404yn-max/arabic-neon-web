"""Synthetic order-book generator for tests and smoke runs. NOT market data, NOT evidence of edge."""
from __future__ import annotations
import math
import random

from .state import Book


def synthetic_books(n: int, seed: int = 7, start_t: float = 1_700_000_000.0, px0: float = 60_000.0,
                    vol_bps: float = 3.0, crash_at: int | None = None):
    rng = random.Random(seed)
    px, t = px0, start_t
    for i in range(n):
        t += 1.0
        shock = rng.gauss(0, vol_bps / 1e4)
        if crash_at is not None and i >= crash_at:
            shock -= 0.002
        px *= math.exp(shock)
        half = px * 0.00005
        bids = tuple((px - half - k * px * 0.00005, rng.uniform(1, 5)) for k in range(5))
        asks = tuple((px + half + k * px * 0.00005, rng.uniform(1, 5)) for k in range(5))
        yield Book(t, bids, asks)
