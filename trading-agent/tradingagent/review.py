"""Nightly review: read every decision (fills AND misses), score calibration, PROPOSE a new config.

Safety design (the part most likely to hurt you if done carelessly):
 - It only ever writes a *proposal* file. A human approves and promotes it.
 - It can only move thresholds inside schema.TUNABLE_BOUNDS, one notch at a time.
 - It refuses to propose anything below MIN_SAMPLES labelled decisions (noise-fitting guard).
 - Risk limits are not reachable from here.
"""
from __future__ import annotations
import json
from dataclasses import asdict, replace
from pathlib import Path

from .schema import TUNABLE_BOUNDS, GateConfig

MIN_SAMPLES = 200
COST_BPS_DEFAULT = 12.0


def load(path: str | Path) -> list[dict]:
    return [json.loads(l) for l in Path(path).read_text().splitlines() if l.strip()]


def _calls(rows: list[dict]) -> list[tuple[float, int, dict]]:
    """(predicted P(correct), outcome 0/1, row) for every directional call with a label."""
    out = []
    for r in rows:
        j, f = r.get("jev"), r.get("fwd_bps")
        if not j or f is None or j["direction"] == "neutral":
            continue
        sign = 1 if j["direction"] == "long" else -1
        out.append((j["direction_confidence"], int(sign * f > 0), r))
    return out


def brier(calls) -> float | None:
    return sum((p - y) ** 2 for p, y, _ in calls) / len(calls) if calls else None


def calibration(calls, bins=(0.5, 0.6, 0.7, 0.8, 0.9, 1.0001)):
    rows = []
    for lo, hi in zip(bins[:-1], bins[1:]):
        b = [(p, y) for p, y, _ in calls if lo <= p < hi]
        if b:
            rows.append({"bin": f"{lo:.1f}-{min(hi,1):.1f}", "n": len(b),
                         "mean_pred": round(sum(p for p, _ in b) / len(b), 3),
                         "hit_rate": round(sum(y for _, y in b) / len(b), 3)})
    return rows


def review(rows: list[dict]) -> dict:
    calls = _calls(rows)
    fills = [r for r in rows if r.get("action") == "trade"]
    gated = [c for c in calls if c[2].get("action") in ("skip", "hold", "blocked")]
    missed = [c for c in gated if c[1] == 1 and c[0] > 0.8]
    return {
        "decisions": len(rows), "labelled_calls": len(calls), "fills": len(fills),
        "brier": brier(calls), "calibration": calibration(calls),
        "high_conf_misses": len(missed),
        "gate_skip_reasons": _count(r.get("why", "") for r in rows if r.get("action") == "skip"),
        "blocked_reasons": _count(r.get("why", "") for r in rows if r.get("action") == "blocked"),
    }


def _count(it):
    d: dict[str, int] = {}
    for x in it:
        d[x] = d.get(x, 0) + 1
    return d


def propose(cfg: GateConfig, report: dict) -> tuple[GateConfig | None, str]:
    """Return (proposed_cfg or None, rationale). Moves at most one threshold one notch."""
    if report["labelled_calls"] < MIN_SAMPLES:
        return None, f"only {report['labelled_calls']} labelled calls (< {MIN_SAMPLES}); no change"
    top = [b for b in report["calibration"] if b["bin"].startswith(("0.8", "0.9"))]
    if not top:
        return None, "no samples in the >0.8 bins; no change"
    n = sum(b["n"] for b in top)
    pred = sum(b["mean_pred"] * b["n"] for b in top) / n
    hit = sum(b["hit_rate"] * b["n"] for b in top) / n
    lo, hi = TUNABLE_BOUNDS["min_confidence"]
    if pred - hit > 0.05:    # overconfident -> demand more
        new = min(hi, round(cfg.min_confidence + 0.02, 2))
        why = f"overconfident in >0.8 bins (pred {pred:.2f} vs hit {hit:.2f}); raise min_confidence"
    else:
        return None, f"calibration acceptable (pred {pred:.2f} vs hit {hit:.2f}); no change"
    if new == cfg.min_confidence:
        return None, "already at upper bound; stop trading this schema instead and review by hand"
    return replace(cfg, version=cfg.version + 1, min_confidence=new), why


def write_proposal(cfg: GateConfig, report: dict, out_dir: str | Path) -> Path:
    new, why = propose(cfg, report)
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    p = out / f"report_v{cfg.version}.json"
    p.write_text(json.dumps({"report": report, "rationale": why,
                             "proposed": asdict(new) if new else None,
                             "status": "PENDING_HUMAN_APPROVAL"}, indent=2) + "\n")
    return p
