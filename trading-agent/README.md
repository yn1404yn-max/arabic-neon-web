# trading-agent (paper trading only)

Deterministic state engine + risk layer + pluggable fast judge (Jev) + pluggable deep reviewer. **No live-money code exists.**

    python -m pytest -q                      # 17 tests
    python -m tradingagent.cli smoke         # synthetic-data run (proves plumbing, not edge)
    python -m tradingagent.cli review logs/smoke.jsonl   # nightly review -> config/proposed/ (human approval)

See `docs/` for research template, six-phase plan, and "WHAT COULD I BE WRONG ABOUT?".
