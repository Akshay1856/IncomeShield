from __future__ import annotations

from typing import Any, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from her_engine import engine

app = FastAPI(title="IncomeShield AI Agent", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ExperienceIn(BaseModel):
    event_type: str = Field(..., description="pricing|trigger|fraud|payout|retention")
    inputs: dict[str, Any] = Field(default_factory=dict)
    decision: dict[str, Any] = Field(default_factory=dict)
    outcome: dict[str, Any] = Field(default_factory=dict)
    user_response: Optional[str] = None
    fraud_status: Optional[str] = None
    financial_result_inr: float = 0.0
    decision_was_good: bool = True
    id: Optional[str] = None


class LearningCycleBody(BaseModel):
    batch_size: int = 32
    epochs: int = 8


class PremiumBody(BaseModel):
    base_premium: float = 79.0
    city: str = "Mumbai"
    claim_frequency_30d: float = 2.0
    avg_rain_mm: float = 20.0
    heat_index: float = 36.0
    traffic_index: float = 0.6
    earnings_volatility: float = 0.3
    prev_payout_ratio: float = 0.25
    season_summer: float = 0.0
    season_monsoon: float = 0.0


class SimulateClaimBody(BaseModel):
    payout_offered: float
    lost_hours: float = 4.0
    hourly_rate: float = 120.0
    false_trigger: bool = False
    fraud_flag: bool = False


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "incomeshield-ai"}


@app.post("/experiences")
def add_experience(body: ExperienceIn) -> dict[str, Any]:
    d = body.model_dump(exclude_none=True)
    saved = engine.add_experience(d)
    return {"experience": saved, "total": len(engine.experiences)}


@app.get("/experiences")
def list_experiences(limit: int = 100) -> dict[str, Any]:
    items = engine.experiences[-limit:]
    return {"experiences": items, "total": len(engine.experiences)}


@app.post("/learning-cycle")
def learning_cycle(body: LearningCycleBody) -> dict[str, Any]:
    return engine.run_learning_cycle(batch_size=body.batch_size, epochs=body.epochs)


@app.get("/agent-state")
def agent_state() -> dict[str, Any]:
    engine.seed_if_empty()
    return {
        "state": engine.state.to_public_dict(),
        "experience_count": len(engine.experiences),
    }


@app.post("/seed")
def seed() -> dict[str, Any]:
    n = engine.seed_if_empty()
    return {"seeded": n, "total": len(engine.experiences)}


@app.post("/suggest-premium")
def suggest_premium(body: PremiumBody) -> dict[str, Any]:
    return engine.suggest_premium(
        body.base_premium,
        body.city,
        claim_frequency_30d=body.claim_frequency_30d,
        avg_rain_mm=body.avg_rain_mm,
        heat_index=body.heat_index,
        traffic_index=body.traffic_index,
        earnings_volatility=body.earnings_volatility,
        prev_payout_ratio=body.prev_payout_ratio,
        season_summer=body.season_summer,
        season_monsoon=body.season_monsoon,
    )


@app.get("/trigger-thresholds")
def trigger_thresholds(city: str = "Mumbai") -> dict[str, Any]:
    return engine.trigger_thresholds(city)


@app.post("/simulate-claim-outcome")
def simulate_claim_outcome(body: SimulateClaimBody) -> dict[str, Any]:
    ideal = body.lost_hours * body.hourly_rate
    delta = ideal - body.payout_offered
    good = abs(delta) < 80 and not body.false_trigger and not body.fraud_flag
    return {
        "payout_offered": body.payout_offered,
        "ideal_payout": round(ideal, 2),
        "ideal_payout_delta": round(delta, 2),
        "decision_was_good": good,
        "suggested_experience": {
            "event_type": "payout",
            "inputs": {"hour_of_day": 14, "demand_zone_score": 0.65},
            "decision": {"payout_offered": body.payout_offered},
            "outcome": {
                "ideal_payout_delta": delta,
                "false_trigger": body.false_trigger,
            },
            "decision_was_good": good,
            "financial_result_inr": -abs(min(0, delta)),
        },
    }
