# Market research — STATUS: NOT YET POPULATED (no live data in the build environment)

Build date: 2026-11-27. The build sandbox had no outbound access to market-data sources
(CoinGecko, DefiLlama, exchanges all unreachable). **This file contains no market figures on purpose.**
Inventing a regime call, TVL, unlock schedule or "asymmetric setup" would be fabrication, and a
fabricated thesis is the most dangerous input this system could have.

## How to populate (on a machine with network)
1. `python research/collect.py` → `research/data/<date>.json` (timestamped, failures recorded).
2. Ask the deep model (Opus) to fill the template below **using only numbers present in that file or in
   primary sources it cites with URL + date**. Anything else must be tagged `[ESTIMATE]` or `[SPECULATION]`.

## Regime checklist (fill from data; one line each, with source + date)
BTC trend · ETH trend · BTC dominance · stablecoin supply change (liquidity) · funding · open interest ·
macro calendar · narrative rotation → **regime verdict** (trending / mean_reverting / high_vol / crisis).

## Per-candidate template (5–10 candidates; drop any you cannot fill from primary sources)
| Field | Content | Source + date |
|---|---|---|
| Token / protocol | | |
| Supply, FDV/MCap, unlock schedule next 90d | | |
| Revenue, fees, TVL, active users (trend) | | |
| Holder concentration | | |
| **Does value accrue to the token?** (fee switch, buyback, burn, staking yield source) | | |
| Confirmed catalyst (dated, primary source) | | |
| Speculative catalyst (labelled) | | |
| **Bear case** (write this first) | | |
| **Invalidation**: the specific evidence that kills the thesis | | |
| Priced in? (what would the market have to believe today) | | |
| Organic vs incentive-driven activity? | | |

## Reality check on "asymmetric setups"
The live agent trades *order-book microstructure on short horizons* (see `tradingagent/`). Fundamental theses
(valuation vs revenue/unlocks) operate on days–months and are a **different strategy**. Do not feed one into the
other: use research only to choose *which instruments* are allowed and to cap exposure, never to override gates.
