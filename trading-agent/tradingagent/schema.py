"""Typed Jev decision schema + versioned, bounded gate config.

Jev only JUDGES. Every threshold, size and side effect lives in code.
"""
from __future__ import annotations
import json
from dataclasses import dataclass, asdict
from pathlib import Path

REGIMES = ("trending", "mean_reverting", "high_vol", "crisis")
DIRECTIONS = ("long", "short", "neutral")
RISK_STATES = ("safe", "near_limit", "reduce")


@dataclass(frozen=True)
class JevDecision:
    regime: str
    direction: str
    direction_confidence: float  # P(direction is right), calibrated, in [0,1]
    toxic_flow: bool
    setup_quality: int           # 0..3
    risk_state: str

    def __post_init__(self):
        if self.regime not in REGIMES:
            raise ValueError(f"bad regime {self.regime!r}")
        if self.direction not in DIRECTIONS:
            raise ValueError(f"bad direction {self.direction!r}")
        if self.risk_state not in RISK_STATES:
            raise ValueError(f"bad risk_state {self.risk_state!r}")
        if not isinstance(self.toxic_flow, bool):
            raise ValueError("toxic_flow must be bool")
        if not (isinstance(self.setup_quality, int) and 0 <= self.setup_quality <= 3):
            raise ValueError("setup_quality must be int 0..3")
        if not (0.0 <= self.direction_confidence <= 1.0):
            raise ValueError("direction_confidence must be in [0,1]")

    @classmethod
    def from_dict(cls, d: dict) -> "JevDecision":
        return cls(
            regime=d["regime"], direction=d["direction"],
            direction_confidence=float(d["direction_confidence"]),
            toxic_flow=d["toxic_flow"], setup_quality=int(d["setup_quality"]),
            risk_state=d["risk_state"],
        )

    def to_dict(self) -> dict:
        return asdict(self)


# Bounds the nightly loop may move gate thresholds within. Risk limits are NOT here:
# the review loop can never touch them.
TUNABLE_BOUNDS = {
    "min_setup_quality": (2, 3),
    "min_confidence": (0.75, 0.95),
    "escalate_below_confidence": (0.50, 0.70),
}


@dataclass(frozen=True)
class GateConfig:
    version: int = 1
    min_setup_quality: int = 2
    min_confidence: float = 0.80
    escalate_below_confidence: float = 0.60
    kelly_fraction: float = 0.25      # hard cap: quarter Kelly
    reward_risk: float = 1.5          # target / stop
    stop_bps: float = 40.0
    max_hold_bars: int = 30
    cost_bps: float = 12.0            # round-trip fee+slippage estimate (ESTIMATE)

    def __post_init__(self):
        for k, (lo, hi) in TUNABLE_BOUNDS.items():
            v = getattr(self, k)
            if not lo <= v <= hi:
                raise ValueError(f"{k}={v} outside bounds [{lo},{hi}]")
        if not 0 < self.kelly_fraction <= 0.25:
            raise ValueError("kelly_fraction must be in (0, 0.25]")

    @classmethod
    def load(cls, path: str | Path) -> "GateConfig":
        return cls(**json.loads(Path(path).read_text()))

    def save(self, path: str | Path) -> None:
        Path(path).write_text(json.dumps(asdict(self), indent=2) + "\n")
