# WHAT COULD I BE WRONG ABOUT?

Ordered by how much money it could cost.

1. **There is no demonstrated edge.** `HeuristicJev` is a stand-in; the smoke run uses synthetic random-walk
   books. Equity ≈ flat is the *expected* result there. Nothing here shows the strategy makes money.
2. **Jev is unverified.** I could not confirm it exists as described, its latency ("81 ms"), its calibration, or its API.
   `HttpJev` is an assumption. A model that outputs 0.9 confidence but is right 55% of the time makes the Kelly sizer
   *overbet*. Paper-trade first and check the calibration table before trusting any probability.
3. **Costs and slippage.** `cost_bps=12` is an ESTIMATE. Short-horizon microstructure edges are usually smaller than
   real fees + spread + latency. The Kelly sizer zeroes trades whose net edge is ≤ 0, but only if that estimate is honest.
4. **Kelly on a mis-specified p is dangerous.** Quarter Kelly limits it; the per-trade risk cap (1%) and position cap
   (25%) are what actually protect you. Don't raise them to "see more PnL".
5. **Gap risk beats stops.** Stops are simulated at book prices; real crashes gap, halt, and widen spreads. The 15% drawdown
   kill switch can be overshot before it trips.
6. **Self-improvement can overfit.** The nightly loop is proposal-only, one notch, bounded, sample-gated (≥200 labelled
   calls). Even so, "improve on yesterday" on noisy data is curve-fitting; require walk-forward on unseen days.
7. **Labels are approximate.** Review labels use fixed-horizon forward mid returns, not the actual exit rules or costs.
8. **Not covered:** exchange outages, API key custody, clock drift, partial fills, funding payments, tax, reconnect/replay
   of the feed, multi-asset correlation. All needed before live.
9. **Fundamental "asymmetric setups" were not researched** (no data access). The research doc is a template only.
10. **Organic vs incentive-driven edge / priced-in catalyst / value accrual:** unanswerable until real data is collected.

Bias of this build: it prefers a system that survives (paper only, fail-safe defaults, human-gated changes)
over one that looks profitable.
