"""Fast-model interface. Jev is a JUDGE only: snapshot text in, typed JevDecision out.

I could not verify Jev's real API from this environment (no network, no docs). So:
 - `JevClient` is the contract; `HeuristicJev` is a deterministic stand-in for tests/paper runs.
 - `HttpJev` is an UNVERIFIED adapter: endpoint, auth and payload shape are assumptions
   you must check against the real docs before use.
"""
from __future__ import annotations
import json
import urllib.request
from typing import Protocol

from .schema import JevDecision


class JevClient(Protocol):
    def decide(self, snapshot_text: str) -> JevDecision: ...


class HeuristicJev:
    """Stand-in: leans on order-book imbalance + short momentum. NOT a real edge."""

    def decide(self, snapshot_text: str) -> JevDecision:
        s = json.loads(snapshot_text)
        rv, imb, mom = s["rv_bps"], s["imb"], s["ret10_bps"]
        regime = "crisis" if rv > 25 else "high_vol" if rv > 10 else \
                 "trending" if abs(mom) > 8 else "mean_reverting"
        score = 0.6 * imb + 0.4 * max(-1, min(1, mom / 20))
        direction = "long" if score > 0.15 else "short" if score < -0.15 else "neutral"
        conf = min(0.95, 0.5 + abs(score) * 0.6)
        quality = 3 if abs(score) > 0.6 else 2 if abs(score) > 0.35 else 1 if abs(score) > 0.15 else 0
        return JevDecision(
            regime=regime, direction=direction, direction_confidence=round(conf, 3),
            toxic_flow=s["spread_bps"] > 8, setup_quality=quality,
            risk_state="reduce" if s["dd"] > 0.10 else "near_limit" if s["dd"] > 0.07 else "safe",
        )


class HttpJev:
    """UNVERIFIED adapter. Constrain output to the JevDecision schema; reject anything else."""

    def __init__(self, url: str, api_key: str, timeout: float = 2.0):
        self.url, self.api_key, self.timeout = url, api_key, timeout

    def decide(self, snapshot_text: str) -> JevDecision:
        body = json.dumps({"input": snapshot_text, "schema": "JevDecision/v1"}).encode()
        req = urllib.request.Request(self.url, body, {
            "Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=self.timeout) as r:
            return JevDecision.from_dict(json.loads(r.read()))  # validates; raises on junk
