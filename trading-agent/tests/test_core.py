import json
import pytest
from tradingagent.agent import Agent
from tradingagent.escalation import needs_escalation
from tradingagent.jev import HeuristicJev
from tradingagent.policy import decide, kelly_fraction, passes_gate
from tradingagent.review import MIN_SAMPLES, brier, propose, review
from tradingagent.risk import RiskLimits, RiskManager
from tradingagent.schema import GateConfig, JevDecision
from tradingagent.sim import synthetic_books
from tradingagent.state import Book, CausalityError, StateEngine, approx_tokens, render

CFG = GateConfig()


def jd(**kw):
    base = dict(regime="trending", direction="long", direction_confidence=0.9,
                toxic_flow=False, setup_quality=3, risk_state="safe")
    base.update(kw)
    return JevDecision(**base)


def book(t, bid=100.0, ask=100.02):
    return Book(t, ((bid, 2), (bid - .01, 2)), ((ask, 1), (ask + .01, 1)))


# ---- schema ----
def test_schema_rejects_bad_values():
    for bad in (dict(regime="x"), dict(direction="up"), dict(setup_quality=4),
                dict(direction_confidence=1.2), dict(risk_state="ok"), dict(toxic_flow=1)):
        with pytest.raises(ValueError):
            jd(**bad)


def test_config_bounds_and_quarter_kelly_cap():
    with pytest.raises(ValueError):
        GateConfig(kelly_fraction=0.5)
    with pytest.raises(ValueError):
        GateConfig(min_confidence=0.5)


# ---- state engine ----
def test_state_rejects_future_stale_and_out_of_order():
    e = StateEngine()
    with pytest.raises(CausalityError):
        e.update(book(10), now=9, inventory_frac=0, drawdown=0)
    e.update(book(10), now=10.1, inventory_frac=0, drawdown=0)
    with pytest.raises(CausalityError):
        e.update(book(10), now=10.2, inventory_frac=0, drawdown=0)
    with pytest.raises(CausalityError):
        e.update(book(11), now=100, inventory_frac=0, drawdown=0)


def test_snapshot_values_and_budget():
    e = StateEngine()
    s = e.update(book(1), 1.1, 0.1, 0.02)
    assert s["mid"] == 100.01 and s["inv"] == 0.1 and s["dd"] == 0.02
    assert s["imb"] == pytest.approx((4 - 2) / (4 + 2), abs=1e-3)
    assert approx_tokens(render(s)) < 400


# ---- policy ----
def test_gate_each_condition():
    assert passes_gate(jd(), CFG)[0]
    assert not passes_gate(jd(setup_quality=1), CFG)[0]
    assert not passes_gate(jd(direction_confidence=0.80), CFG)[0]   # must be strictly above
    assert not passes_gate(jd(risk_state="near_limit"), CFG)[0]
    assert not passes_gate(jd(toxic_flow=True), CFG)[0]
    assert not passes_gate(jd(regime="crisis"), CFG)[0]


def test_kelly_is_quarter_and_zero_when_costs_eat_edge():
    p = 0.9
    b, cost_r = CFG.reward_risk, CFG.cost_bps / CFG.stop_bps
    full = (p * b - (1 - p) - cost_r) / b
    assert kelly_fraction(p, CFG) == pytest.approx(0.25 * full)
    assert kelly_fraction(0.5, CFG) == 0.0
    assert decide(jd(direction_confidence=0.95), CFG).fraction > 0
    assert decide(jd(direction_confidence=0.95, direction="short"), CFG).side == -1


# ---- risk ----
def test_risk_clamps_position_and_per_trade_risk():
    r = RiskManager(RiskLimits(), 10_000, 0)
    v = r.check(1, 0.5, 40, 10_000, 0, 1)
    assert v.allowed and v.notional == pytest.approx(2_500)          # 25% cap, not 0.5/0.004
    v2 = r.check(1, 0.5, 40, 10_000, 2_500, 2)
    assert not v2.allowed and v2.reason == "at_position_cap"


def test_kill_switch_on_drawdown_is_sticky_until_manual_reset():
    r = RiskManager(RiskLimits(), 10_000, 0)
    assert r.check(1, 0.01, 40, 10_000, 0, 1).allowed
    r.mark(8_400, 2)                         # -16%
    assert r.killed and r.kill_reason == "max_drawdown"
    assert not r.check(1, 0.01, 40, 10_000, 0, 3).allowed   # even if equity "recovers"
    r.reset()
    assert not r.killed


def test_daily_loss_limit_and_day_roll():
    r = RiskManager(RiskLimits(), 10_000, 0)
    r.mark(9_690, 10)                        # -3.1% same day
    assert r.killed and r.kill_reason == "max_daily_loss"
    r2 = RiskManager(RiskLimits(), 10_000, 0)
    r2.mark(9_900, 86_400 + 5)               # new day: baseline resets to 9,900
    r2.mark(9_700, 86_400 + 6)               # -2.0% of 9,900 -> ok
    assert not r2.killed


def test_rate_limit():
    r = RiskManager(RiskLimits(max_orders_per_min=2, max_position_frac=1.0), 10_000, 0)
    assert r.check(1, 0.001, 40, 10_000, 0, 1).allowed
    assert r.check(1, 0.001, 40, 10_000, 0, 2).allowed
    assert r.check(1, 0.001, 40, 10_000, 0, 3).reason == "rate_limit"


# ---- escalation ----
def test_escalation_triggers():
    assert needs_escalation(jd(direction_confidence=0.55), CFG, "trending") == "low_confidence"
    assert needs_escalation(jd(regime="crisis"), CFG, "trending") == "regime_flip_to_crisis"
    assert needs_escalation(jd(direction_confidence=0.7), CFG, "trending") is None


class Scripted:
    def __init__(self, ds): self.ds, self.i = ds, 0
    def decide(self, _):
        d = self.ds[min(self.i, len(self.ds) - 1)]; self.i += 1; return d


def run(jev, n=60, **kw):
    bs = list(synthetic_books(n, **kw))
    a = Agent(jev, CFG, RiskLimits(), 10_000, bs[0].ts_event)
    for b in bs:
        a.on_book(b, b.ts_event + .1)
    return a


def test_crisis_flattens_open_position_and_failsafe_without_reviewer():
    a = run(Scripted([jd()] * 5 + [jd(regime="crisis")] * 3), n=8)
    assert any(r["action"] == "trade" for r in a.log)
    assert a.log[5]["action"] == "flatten" and a.broker.qty == 0


def test_low_confidence_holds():
    a = run(Scripted([jd(direction_confidence=0.5)]), n=5)
    assert all(r["action"] == "hold" for r in a.log) and not a.broker.fills


def test_kill_switch_stops_new_orders_in_loop():
    a = run(HeuristicJev(), n=300, crash_at=50, vol_bps=6)
    if a.risk.killed:
        k = next(i for i, r in enumerate(a.log) if r["why"].startswith("killed"))
        assert all(r["action"] != "trade" for r in a.log[k:]) and a.broker.qty == 0


def test_no_future_leak_labels_only_after_horizon():
    a = run(HeuristicJev(), n=40)
    assert a.log[-1]["fwd_bps"] is None            # last decisions can't be labelled yet
    assert a.log[0]["fwd_bps"] is not None


# ---- review ----
def test_brier_and_no_proposal_on_small_sample():
    a = run(HeuristicJev(), n=200)
    rep = review(a.log)
    assert rep["labelled_calls"] < MIN_SAMPLES or rep["brier"] is not None
    new, why = propose(CFG, {**rep, "labelled_calls": 10})
    assert new is None and "no change" in why


def test_proposal_stays_in_bounds_and_only_when_overconfident():
    cal = [{"bin": "0.8-0.9", "n": 300, "mean_pred": 0.85, "hit_rate": 0.60}]
    new, _ = propose(CFG, {"labelled_calls": 300, "calibration": cal})
    assert new and new.min_confidence == 0.82 and new.version == 2
    assert new.kelly_fraction == CFG.kelly_fraction
    ok = [{"bin": "0.8-0.9", "n": 300, "mean_pred": 0.85, "hit_rate": 0.84}]
    assert propose(CFG, {"labelled_calls": 300, "calibration": ok})[0] is None
    assert brier([(1.0, 1, None), (0.0, 1, None)]) == 0.5
