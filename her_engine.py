"""
Hindsight-style experience replay for IncomeShield agent heads.
Uses PyTorch to regress multi-head corrections from relabeled targets.
"""
from __future__ import annotations

import json
import math
import random
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Any

import numpy as np
import torch
import torch.nn as nn

DATA_DIR = Path(__file__).resolve().parent / "data"
EXPERIENCES_PATH = DATA_DIR / "experiences.json"
STATE_PATH = DATA_DIR / "agent_state.json"
MODEL_PATH = DATA_DIR / "policy_net.pt"

EVENT_TYPES = ("pricing", "trigger", "fraud", "payout", "retention")
CITIES = (
    "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Pune",
)


def _ensure_data_dir() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def city_index(city: str) -> float:
    try:
        return CITIES.index(city) / max(len(CITIES) - 1, 1)
    except ValueError:
        return 0.5


def event_type_one_hot(et: str) -> list[float]:
    return [1.0 if et == e else 0.0 for e in EVENT_TYPES]


def experience_to_features(exp: dict[str, Any]) -> np.ndarray:
    """32-dim feature vector for the policy network."""
    inp = exp.get("inputs") or {}
    dec = exp.get("decision") or {}
    out = exp.get("outcome") or {}
    v = [0.0] * 32
    et = exp.get("event_type", "pricing")
    oh = event_type_one_hot(et)
    v[0:5] = oh
    v[5] = city_index(str(inp.get("city", "Mumbai")))
    v[6] = float(inp.get("claim_frequency_30d", 0)) / 10.0
    v[7] = float(inp.get("avg_rain_mm", 0)) / 100.0
    v[8] = float(inp.get("heat_index", 35)) / 50.0
    v[9] = float(inp.get("traffic_index", 0.5))
    v[10] = float(inp.get("earnings_volatility", 0.3))
    v[11] = float(inp.get("prev_payout_ratio", 0.2))
    v[12] = float(inp.get("season_summer", 0))
    v[13] = float(inp.get("season_monsoon", 0))
    v[14] = float(dec.get("premium_weekly", 79)) / 150.0
    v[15] = float(dec.get("rain_threshold_mm", 40)) / 80.0
    v[16] = float(dec.get("heat_threshold_c", 43)) / 50.0
    v[17] = float(dec.get("fraud_score", 0.2))
    v[18] = float(dec.get("payout_offered", 500)) / 2000.0
    v[19] = 1.0 if out.get("user_churned") else 0.0
    v[20] = 1.0 if out.get("false_trigger") else 0.0
    v[21] = 1.0 if out.get("missed_trigger") else 0.0
    v[22] = 1.0 if out.get("fraud_missed") else 0.0
    v[23] = 1.0 if out.get("false_fraud_flag") else 0.0
    v[24] = float(out.get("loss_ratio", 0.35))
    v[25] = float(out.get("renewed", 1))
    v[26] = float(out.get("ideal_payout_delta", 0)) / 500.0
    v[27] = float(exp.get("financial_result_inr", 0)) / 5000.0
    v[28] = 1.0 if exp.get("decision_was_good") else 0.0
    v[29] = float(inp.get("hour_of_day", 14)) / 24.0
    v[30] = float(inp.get("demand_zone_score", 0.6))
    v[31] = float(inp.get("gps_anomaly_score", 0.0))
    return np.clip(np.array(v, dtype=np.float32), -3.0, 3.0)


def compute_hindsight_targets(exp: dict[str, Any]) -> np.ndarray:
    """
    Five targets: premium_delta, rain_thresh_delta, heat_thresh_delta,
    fraud_strictness_delta, payout_fairness_scale_delta
    All in roughly [-1, 1] for stable training.
    """
    out = exp.get("outcome") or {}
    dec = exp.get("decision") or {}
    good = bool(exp.get("decision_was_good"))
    t = np.zeros(5, dtype=np.float32)

    if good:
        return t

    # Pricing / retention: churn -> lower premium; high loss ratio -> raise premium
    if out.get("user_churned"):
        t[0] = -0.12
    if float(out.get("loss_ratio", 0)) > 0.45:
        t[0] += 0.08
    if out.get("missed_trigger"):
        t[1] = -0.06
    if out.get("false_trigger"):
        t[1] += 0.05
    if out.get("missed_trigger") and exp.get("event_type") == "trigger":
        t[2] = -0.04
    if out.get("false_trigger") and exp.get("event_type") == "trigger":
        t[2] += 0.03
    if out.get("fraud_missed"):
        t[3] += 0.1
    if out.get("false_fraud_flag"):
        t[3] -= 0.08
    ideal_delta = float(out.get("ideal_payout_delta", 0))
    if abs(ideal_delta) > 1:
        t[4] = np.clip(ideal_delta / 800.0, -0.15, 0.15)
    if float(out.get("renewed", 1)) < 0.5:
        t[0] -= 0.05
    return np.clip(t, -0.25, 0.25)


class PolicyNet(nn.Module):
    def __init__(self, in_dim: int = 32, hidden: int = 64, out_dim: int = 5):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_dim, hidden),
            nn.ReLU(),
            nn.Linear(hidden, hidden),
            nn.ReLU(),
            nn.Linear(hidden, out_dim),
            nn.Tanh(),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x) * 0.25


@dataclass
class AgentState:
    learning_cycles: int = 0
    last_loss: float = 0.0
    premium_bias: float = 0.0
    rain_threshold_offset: float = 0.0
    heat_threshold_offset: float = 0.0
    fraud_strictness: float = 0.0
    payout_fairness_bias: float = 0.0
    model_version: int = 1
    recent_insights: list[str] = field(default_factory=list)

    def apply_deltas(self, deltas: np.ndarray) -> None:
        d = deltas.astype(np.float64)
        self.premium_bias += float(d[0]) * 5.0
        self.rain_threshold_offset += float(d[1]) * 8.0
        self.heat_threshold_offset += float(d[2]) * 2.0
        self.fraud_strictness += float(d[3]) * 0.15
        self.payout_fairness_bias += float(d[4]) * 40.0
        self.premium_bias = float(np.clip(self.premium_bias, -25, 25))
        self.rain_threshold_offset = float(np.clip(self.rain_threshold_offset, -15, 15))
        self.heat_threshold_offset = float(np.clip(self.heat_threshold_offset, -5, 5))
        self.fraud_strictness = float(np.clip(self.fraud_strictness, -0.5, 0.5))
        self.payout_fairness_bias = float(np.clip(self.payout_fairness_bias, -120, 120))

    def to_public_dict(self) -> dict[str, Any]:
        return {
            "learning_cycles": self.learning_cycles,
            "last_loss": round(self.last_loss, 6),
            "premium_bias": round(self.premium_bias, 4),
            "rain_threshold_offset": round(self.rain_threshold_offset, 4),
            "heat_threshold_offset": round(self.heat_threshold_offset, 4),
            "fraud_strictness": round(self.fraud_strictness, 4),
            "payout_fairness_bias": round(self.payout_fairness_bias, 4),
            "model_version": self.model_version,
            "recent_insights": self.recent_insights[-12:],
        }


class HERLearningEngine:
    def __init__(self) -> None:
        _ensure_data_dir()
        self.device = torch.device("cpu")
        self.net = PolicyNet().to(self.device)
        self.opt = torch.optim.Adam(self.net.parameters(), lr=1e-3)
        self.experiences: list[dict[str, Any]] = []
        self.state = AgentState()
        self._load()

    def _load(self) -> None:
        if STATE_PATH.exists():
            try:
                raw = json.loads(STATE_PATH.read_text(encoding="utf-8"))
                self.state = AgentState(
                    learning_cycles=raw.get("learning_cycles", 0),
                    last_loss=raw.get("last_loss", 0.0),
                    premium_bias=raw.get("premium_bias", 0.0),
                    rain_threshold_offset=raw.get("rain_threshold_offset", 0.0),
                    heat_threshold_offset=raw.get("heat_threshold_offset", 0.0),
                    fraud_strictness=raw.get("fraud_strictness", 0.0),
                    payout_fairness_bias=raw.get("payout_fairness_bias", 0.0),
                    model_version=raw.get("model_version", 1),
                    recent_insights=list(raw.get("recent_insights", [])),
                )
            except (json.JSONDecodeError, OSError):
                pass
        if EXPERIENCES_PATH.exists():
            try:
                self.experiences = json.loads(EXPERIENCES_PATH.read_text(encoding="utf-8"))
            except (json.JSONDecodeError, OSError):
                self.experiences = []
        if MODEL_PATH.exists():
            try:
                self.net.load_state_dict(torch.load(MODEL_PATH, map_location=self.device, weights_only=True))
            except (OSError, RuntimeError, ValueError):
                pass

    def _save(self) -> None:
        _ensure_data_dir()
        STATE_PATH.write_text(
            json.dumps(asdict(self.state), indent=2),
            encoding="utf-8",
        )
        EXPERIENCES_PATH.write_text(
            json.dumps(self.experiences, indent=2),
            encoding="utf-8",
        )

    def add_experience(self, exp: dict[str, Any]) -> dict[str, Any]:
        if "id" not in exp:
            exp["id"] = f"exp_{len(self.experiences)}_{random.randint(1000, 9999)}"
        self.experiences.append(exp)
        self._save()
        return exp

    def seed_if_empty(self) -> int:
        if self.experiences:
            return 0
        seeds = _default_seed_experiences()
        self.experiences.extend(seeds)
        self._save()
        return len(seeds)

    def run_learning_cycle(self, batch_size: int = 32, epochs: int = 8) -> dict[str, Any]:
        if len(self.experiences) < 4:
            self.seed_if_empty()
        if len(self.experiences) < 2:
            return {"ok": False, "message": "Not enough experiences", "state": self.state.to_public_dict()}

        # HER: duplicate batch with hindsight targets for failed transitions
        xs: list[np.ndarray] = []
        ys: list[np.ndarray] = []
        for exp in self.experiences:
            x = experience_to_features(exp)
            y = compute_hindsight_targets(exp)
            xs.append(x)
            ys.append(y)
            if not exp.get("decision_was_good", True):
                alt = dict(exp)
                alt["outcome"] = dict(exp.get("outcome") or {})
                alt["decision_was_good"] = True
                xs.append(experience_to_features(alt))
                ys.append(np.zeros(5, dtype=np.float32))

        X = torch.tensor(np.stack(xs), dtype=torch.float32, device=self.device)
        Y = torch.tensor(np.stack(ys), dtype=torch.float32, device=self.device)

        n = X.shape[0]
        total_loss = 0.0
        steps = 0
        for _ in range(epochs):
            idx = torch.randperm(n, device=self.device)[: min(batch_size, n)]
            xb, yb = X[idx], Y[idx]
            self.opt.zero_grad()
            pred = self.net(xb)
            loss = nn.functional.mse_loss(pred, yb)
            loss.backward()
            self.opt.step()
            total_loss += float(loss.item())
            steps += 1

        avg_loss = total_loss / max(steps, 1)
        with torch.no_grad():
            mean_pred = self.net(X).mean(dim=0).cpu().numpy()
        self.state.apply_deltas(mean_pred)
        self.state.last_loss = avg_loss
        self.state.learning_cycles += 1
        self.state.model_version += 1

        insights = _insights_from_batch(self.experiences[-20:], mean_pred)
        self.state.recent_insights.extend(insights)
        self.state.recent_insights = self.state.recent_insights[-20:]

        self._save()
        try:
            torch.save(self.net.state_dict(), MODEL_PATH)
        except OSError:
            pass
        return {
            "ok": True,
            "loss": avg_loss,
            "hindsight_replays": len(xs) - len(self.experiences),
            "state": self.state.to_public_dict(),
            "mean_correction": mean_pred.tolist(),
        }

    def suggest_premium(self, base_premium: float, city: str, **kwargs: Any) -> dict[str, Any]:
        synthetic = {
            "event_type": "pricing",
            "inputs": {"city": city, **kwargs},
            "decision": {"premium_weekly": base_premium},
            "outcome": {},
            "decision_was_good": True,
        }
        x = torch.tensor(
            experience_to_features(synthetic)[None, :],
            dtype=torch.float32,
            device=self.device,
        )
        with torch.no_grad():
            delta = float(self.net(x)[0, 0].cpu().item())
        adjusted = base_premium + self.state.premium_bias + delta * 8.0
        adjusted = max(29.0, min(150.0, adjusted))
        return {
            "base_premium": base_premium,
            "personalized_premium": round(adjusted, 2),
            "premium_bias_state": self.state.premium_bias,
            "explainer": (
                f"Base ₹{base_premium:.0f} adjusted by learned bias {self.state.premium_bias:+.1f} "
                f"and local model delta {delta * 8:+.1f} for {city}."
            ),
        }

    def trigger_thresholds(self, city: str) -> dict[str, Any]:
        rain = 40.0 + self.state.rain_threshold_offset
        heat = 43.0 + self.state.heat_threshold_offset
        return {
            "city": city,
            "rain_mm": round(max(20.0, min(70.0, rain)), 1),
            "heat_c": round(max(38.0, min(48.0, heat)), 1),
            "explainer": "Thresholds shift from replayed misses and false triggers.",
        }

    def fraud_adjusted_score(self, raw_score: float) -> float:
        s = raw_score + self.state.fraud_strictness
        return float(np.clip(s, 0.0, 1.0))

    def payout_adjustment(self, offered: float) -> float:
        return max(0.0, offered + self.state.payout_fairness_bias * 0.02)


def _insights_from_batch(recent: list[dict[str, Any]], mean_correction: np.ndarray) -> list[str]:
    out: list[str] = []
    bad = [e for e in recent if not e.get("decision_was_good")]
    if bad:
        et = bad[-1].get("event_type", "?")
        out.append(f"Last suboptimal event: {et} — applied hindsight relabeling.")
    if mean_correction[0] < -0.02:
        out.append("Pricing head: leaning slightly cheaper after churn signals.")
    elif mean_correction[0] > 0.02:
        out.append("Pricing head: nudging premiums up after loss-ratio stress.")
    if abs(mean_correction[1]) > 0.02:
        out.append("Rain trigger: regional threshold updated from replay.")
    if abs(mean_correction[3]) > 0.02:
        out.append("Fraud head: strictness adjusted from false positive/negative mix.")
    if not out:
        out.append("Cycle complete: policy network consolidated small corrections.")
    return out


def _default_seed_experiences() -> list[dict[str, Any]]:
    return [
        {
            "id": "seed_p1",
            "event_type": "pricing",
            "inputs": {
                "city": "Mumbai",
                "claim_frequency_30d": 2,
                "avg_rain_mm": 45,
                "heat_index": 34,
                "traffic_index": 0.72,
                "earnings_volatility": 0.35,
                "prev_payout_ratio": 0.25,
                "season_monsoon": 1,
            },
            "decision": {"premium_weekly": 95},
            "outcome": {"user_churned": True, "loss_ratio": 0.28, "renewed": 0},
            "decision_was_good": False,
            "financial_result_inr": -120,
        },
        {
            "id": "seed_p2",
            "event_type": "pricing",
            "inputs": {
                "city": "Delhi",
                "claim_frequency_30d": 5,
                "avg_rain_mm": 8,
                "heat_index": 44,
                "traffic_index": 0.55,
                "earnings_volatility": 0.4,
                "prev_payout_ratio": 0.55,
                "season_summer": 1,
            },
            "decision": {"premium_weekly": 52},
            "outcome": {"user_churned": False, "loss_ratio": 0.62, "renewed": 1},
            "decision_was_good": False,
            "financial_result_inr": -800,
        },
        {
            "id": "seed_t1",
            "event_type": "trigger",
            "inputs": {"city": "Bengaluru", "avg_rain_mm": 38},
            "decision": {"rain_threshold_mm": 40, "heat_threshold_c": 43},
            "outcome": {"missed_trigger": True, "false_trigger": False},
            "decision_was_good": False,
            "financial_result_inr": -400,
        },
        {
            "id": "seed_t2",
            "event_type": "trigger",
            "inputs": {"city": "Chennai"},
            "decision": {"rain_threshold_mm": 30},
            "outcome": {"missed_trigger": False, "false_trigger": True},
            "decision_was_good": False,
            "financial_result_inr": -250,
        },
        {
            "id": "seed_f1",
            "event_type": "fraud",
            "inputs": {"city": "Hyderabad", "gps_anomaly_score": 0.15},
            "decision": {"fraud_score": 0.22},
            "outcome": {"fraud_missed": True, "false_fraud_flag": False},
            "decision_was_good": False,
            "financial_result_inr": -900,
        },
        {
            "id": "seed_f2",
            "event_type": "fraud",
            "inputs": {"city": "Pune", "gps_anomaly_score": 0.05},
            "decision": {"fraud_score": 0.85},
            "outcome": {"fraud_missed": False, "false_fraud_flag": True},
            "decision_was_good": False,
            "financial_result_inr": -80,
        },
        {
            "id": "seed_pay1",
            "event_type": "payout",
            "inputs": {"city": "Kolkata", "hour_of_day": 19, "demand_zone_score": 0.8},
            "decision": {"payout_offered": 420},
            "outcome": {"ideal_payout_delta": 180},
            "decision_was_good": False,
            "financial_result_inr": 50,
        },
        {
            "id": "seed_ret1",
            "event_type": "retention",
            "inputs": {"city": "Mumbai"},
            "decision": {"premium_weekly": 88},
            "outcome": {"renewed": 0, "user_churned": True},
            "decision_was_good": False,
            "financial_result_inr": -200,
        },
        {
            "id": "seed_ok1",
            "event_type": "payout",
            "inputs": {"city": "Delhi"},
            "decision": {"payout_offered": 500},
            "outcome": {"ideal_payout_delta": 0},
            "decision_was_good": True,
            "financial_result_inr": 120,
        },
        {
            "id": "seed_ok2",
            "event_type": "pricing",
            "inputs": {"city": "Bengaluru"},
            "decision": {"premium_weekly": 72},
            "outcome": {"loss_ratio": 0.32, "renewed": 1},
            "decision_was_good": True,
            "financial_result_inr": 300,
        },
    ]


engine = HERLearningEngine()
