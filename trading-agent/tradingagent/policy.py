"""Policy in code: gate + fractional-Kelly sizing. Jev's output is an input, never an authority."""
from __future__ import annotations
from dataclasses import dataclass

from .schema import GateConfig, JevDecision


@dataclass(frozen=True)
class Intent:
    side: int          # +1 long, -1 short
    fraction: float    # Kelly fraction of equity to RISK (loss at stop); risk layer clamps it
    reason: str


def passes_gate(d: JevDecision, cfg: GateConfig) -> tuple[bool, str]:
    if d.direction == "neutral":
        return False, "neutral"
    if d.regime == "crisis":
        return False, "crisis"
    if d.toxic_flow:
        return False, "toxic_flow"
    if d.setup_quality < cfg.min_setup_quality:
        return False, "low_quality"
    if d.direction_confidence <= cfg.min_confidence:
        return False, "low_confidence"
    if d.risk_state != "safe":
        return False, f"risk_{d.risk_state}"
    return True, "ok"


def kelly_fraction(p: float, cfg: GateConfig) -> float:
    """Fractional Kelly net of costs. Returns 0 when expected edge after costs <= 0."""
    b = cfg.reward_risk
    cost_r = cfg.cost_bps / cfg.stop_bps           # costs expressed in units of risk
    edge = p * b - (1 - p) - cost_r                # expected R per trade, net
    if edge <= 0:
        return 0.0
    full = edge / b
    return full * cfg.kelly_fraction  # quarter Kelly at most (enforced in GateConfig)


def decide(d: JevDecision, cfg: GateConfig) -> Intent | None:
    ok, why = passes_gate(d, cfg)
    if not ok:
        return None
    f = kelly_fraction(d.direction_confidence, cfg)
    if f <= 0:
        return None
    return Intent(side=1 if d.direction == "long" else -1, fraction=f, reason="gate_ok")
