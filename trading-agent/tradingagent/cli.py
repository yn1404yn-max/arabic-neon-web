"""python -m tradingagent.cli smoke|review  -- paper mode only."""
from __future__ import annotations
import sys
from pathlib import Path

from .agent import Agent
from .jev import HeuristicJev
from .review import load, review, write_proposal
from .risk import RiskLimits
from .schema import GateConfig
from .sim import synthetic_books

ROOT = Path(__file__).resolve().parent.parent


def smoke(n: int = 2000) -> None:
    cfg = GateConfig.load(ROOT / "config" / "gate_v1.json")
    books = list(synthetic_books(n))
    a = Agent(HeuristicJev(), cfg, RiskLimits(), 10_000.0, books[0].ts_event,
              log_path=ROOT / "logs" / "smoke.jsonl")
    for b in books:
        a.on_book(b, now=b.ts_event + 0.1)
    a.dump()
    mid = (books[-1].bids[0][0] + books[-1].asks[0][0]) / 2
    print(f"bars={n} fills={len(a.broker.fills)} equity={a.broker.equity(mid):.2f} "
          f"killed={a.risk.killed} (synthetic data: this says nothing about real edge)")


def nightly(log: str) -> None:
    cfg = GateConfig.load(ROOT / "config" / "gate_v1.json")
    p = write_proposal(cfg, review(load(log)), ROOT / "config" / "proposed")
    print("proposal written:", p, "(needs human approval)")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "smoke"
    smoke() if cmd == "smoke" else nightly(sys.argv[2])
