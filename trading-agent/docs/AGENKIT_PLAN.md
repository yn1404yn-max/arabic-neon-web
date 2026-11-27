# Six-phase plan (AgenKit-style gates)

I could not reach agenkit.xyz, so I cannot confirm its install steps or phase names. The phases below follow
the six you listed (spec → architecture → plan → test-first build → review → ship), each with an approval gate.
If AgenKit's real phases differ, map them onto this table; the artifacts and paths stay the same.

| # | Phase | Artifact (exact path) | Gate: operator approves when… |
|---|---|---|---|
| 1 | Spec | `docs/SPEC.md` (this build: the prompt + `docs/RESEARCH.md`) | limits, venues, capital, "paper only" are agreed |
| 2 | Architecture | `docs/ARCHITECTURE.md` (below), `tradingagent/schema.py` | brain/reflex split and hard-limit ownership signed off |
| 3 | Plan | `docs/PLAN.md`, `config/gate_v1.json` | thresholds + risk limits reviewed |
| 4 | Test-first build | `tests/test_core.py` → `tradingagent/{state,policy,risk,escalation,broker,agent}.py` | `pytest` green (17 tests) |
| 5 | Review | paper run ≥ 4 weeks on LIVE books; `config/proposed/report_v*.json` | calibration (Brier, bins) + costs-included PnL acceptable |
| 6 | Ship | live adapter `tradingagent/live_broker.py` (**NOT WRITTEN, deliberately**) | explicit human decision to risk real money |

## Architecture (who owns what)
```
book feed ─► state.py (causal, <400 tok) ─► Jev (judge only) ─► escalation.py ─► policy.py ─► risk.py ─► broker
                                              │ conf<0.60 / crisis ─► deep reviewer (Opus), can only hold/flatten
nightly: logs/*.jsonl ─► review.py (Brier, calibration, misses) ─► config/proposed/ ─► HUMAN approves ─► gate_v{n+1}.json
```
Hard limits (max drawdown 15%, position cap, daily loss, per-trade risk, rate limit, kill switch) live only in
`risk.py` and are not reachable from `review.py`.

## Overnight loop (cron on a machine that has the logs)
`0 3 * * *  cd trading-agent && python -m tradingagent.cli review logs/live.jsonl`  → proposal only.
Promotion = a human copies the proposal to `config/gate_v{n+1}.json` after a walk-forward check on unseen days.
