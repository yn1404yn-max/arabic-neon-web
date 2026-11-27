"""Escalate to the deep reviewer (Opus) when the fast model is unsure or the regime flips.

Escalation can only make the system MORE conservative: its verdict is hold/flatten/proceed,
and `proceed` still has to pass the full gate and risk layer. Default (no reviewer wired)
is hold, so an unwired deep model fails safe.
"""
from __future__ import annotations
from typing import Protocol

from .schema import GateConfig, JevDecision

HOLD, FLATTEN, PROCEED = "hold", "flatten", "proceed"


def needs_escalation(d: JevDecision, cfg: GateConfig, prev_regime: str | None) -> str | None:
    if d.regime == "crisis" and prev_regime != "crisis":
        return "regime_flip_to_crisis"
    if d.regime == "crisis":
        return "crisis"
    if d.direction_confidence < cfg.escalate_below_confidence:
        return "low_confidence"
    return None


class DeepReviewer(Protocol):
    def review(self, snapshot_text: str, decision: JevDecision, why: str) -> str: ...


class FailSafeReviewer:
    """Used until a real Opus-backed reviewer is wired: crisis -> flatten, otherwise hold."""

    def review(self, snapshot_text: str, decision: JevDecision, why: str) -> str:
        return FLATTEN if "crisis" in why else HOLD
