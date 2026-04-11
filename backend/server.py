from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime

# Import AI agents
from ai_agents.risk_pricing_agent import RiskPricingAgent
from ai_agents.fraud_detection_agent import FraudDetectionAgent
from ai_agents.payout_optimization_agent import PayoutOptimizationAgent
from ai_agents.trigger_optimization_agent import TriggerOptimizationAgent
from ai_agents.retention_engagement_agent import RetentionEngagementAgent
from ai_agents.hindsight_memory import HindsightMemorySystem

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize Hindsight Memory System
hindsight_system = HindsightMemorySystem(db)

# Initialize AI Agents
risk_pricing_agent = RiskPricingAgent()
fraud_detection_agent = FraudDetectionAgent()
payout_optimization_agent = PayoutOptimizationAgent()
trigger_optimization_agent = TriggerOptimizationAgent()
retention_engagement_agent = RetentionEngagementAgent()

# Create the main app without a prefix
app = FastAPI(title="IncomeShield AI Agent Platform", version="2.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ==================== Helper Functions ====================

def convert_objectid_to_str(obj):
    """Convert MongoDB ObjectId to string for JSON serialization"""
    if isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, dict):
        return {key: convert_objectid_to_str(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_objectid_to_str(item) for item in obj]
    else:
        return obj


# ==================== Pydantic Models ====================

class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class RiskPricingRequest(BaseModel):
    city: str
    work_type: str = "full-time"
    platform: str = "Zomato"
    claim_frequency: float = 0.5
    avg_earnings: float = 5000
    month: int = 6

class FraudDetectionRequest(BaseModel):
    claim_amount: float
    time_since_last_claim: float = 168
    location_consistency: float = 0.8
    claim_frequency: float = 1.0
    movement_speed: float = 25
    trigger_correlation: float = 0.9
    claim_hour: int = 12
    account_age_days: int = 30
    pattern_similarity: float = 0.1
    gps_accuracy: float = 10
    duplicate_score: float = 0.0

class PayoutOptimizationRequest(BaseModel):
    lost_hours: int
    hour: int = 12
    day_of_week: int = 3
    avg_hourly_earnings: float = 150
    demand_zone: str = "medium"
    trigger_severity: float = 0.7
    city: str = "Mumbai"
    platform: str = "Zomato"
    work_type: str = "full-time"
    month: int = 6

class TriggerOptimizationRequest(BaseModel):
    trigger_type: str  # rainfall, temperature, aqi
    city: str = "Mumbai"
    current_threshold: float = 40
    false_positive_rate: float = 0.1
    false_negative_rate: float = 0.1
    month: int = 6

class RetentionPredictionRequest(BaseModel):
    tenure_weeks: int
    claim_satisfaction: float = 0.7
    premium: float = 70
    weekly_earnings: float = 5000
    claim_frequency: float = 1.0
    claims_approved_ratio: float = 0.9
    app_opens_per_week: int = 7
    days_since_last_interaction: int = 3
    total_payout_received: float = 500
    total_premium_paid: float = 280

class ExperienceCreate(BaseModel):
    agent_type: str
    input_data: Dict[str, Any]
    outcome: Dict[str, Any]

class LearningCycleRequest(BaseModel):
    agent_names: Optional[List[str]] = None


# ==================== Health Check Routes ====================

@api_router.get("/")
async def root():
    return {
        "message": "IncomeShield AI Agent Platform",
        "version": "2.0.0",
        "agents": {
            "risk_pricing": "active",
            "fraud_detection": "active",
            "payout_optimization": "active",
            "trigger_optimization": "active",
            "retention_engagement": "active"
        }
    }

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "ai_agents": "loaded"
    }


# ==================== AI Agent Prediction Routes ====================

@api_router.post("/ai/predict/premium")
async def predict_premium(request: RiskPricingRequest):
    """Predict optimal weekly premium using AI"""
    try:
        prediction = risk_pricing_agent.predict(request.dict())
        explanation = risk_pricing_agent.explain_decision(request.dict(), prediction)
        
        return {
            "premium": prediction,
            "explanation": explanation
        }
    except Exception as e:
        logger.error(f"Premium prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/ai/predict/fraud")
async def predict_fraud(request: FraudDetectionRequest):
    """Detect fraud probability using AI"""
    try:
        prediction = fraud_detection_agent.predict(request.dict())
        explanation = fraud_detection_agent.explain_decision(request.dict(), prediction)
        
        return {
            **prediction,
            "explanation": explanation
        }
    except Exception as e:
        logger.error(f"Fraud detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/ai/predict/payout")
async def predict_payout(request: PayoutOptimizationRequest):
    """Predict optimal payout amount using AI"""
    try:
        prediction = payout_optimization_agent.predict(request.dict())
        explanation = payout_optimization_agent.explain_decision(request.dict(), prediction)
        
        return {
            "payout": prediction,
            "explanation": explanation
        }
    except Exception as e:
        logger.error(f"Payout prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/ai/predict/trigger-threshold")
async def predict_trigger_threshold(request: TriggerOptimizationRequest):
    """Optimize trigger threshold using AI"""
    try:
        prediction = trigger_optimization_agent.predict(request.dict())
        explanation = trigger_optimization_agent.explain_decision(request.dict(), prediction)
        
        return {
            **prediction,
            "explanation": explanation
        }
    except Exception as e:
        logger.error(f"Trigger optimization error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/ai/predict/retention")
async def predict_retention(request: RetentionPredictionRequest):
    """Predict churn probability and get retention recommendations"""
    try:
        prediction = retention_engagement_agent.predict(request.dict())
        explanation = retention_engagement_agent.explain_decision(request.dict(), prediction)
        
        return {
            **prediction,
            "explanation": explanation
        }
    except Exception as e:
        logger.error(f"Retention prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Experience & Learning Routes ====================

@api_router.post("/ai/experience")
async def create_experience(experience: ExperienceCreate):
    """Store a new experience for learning"""
    try:
        exp_id = await hindsight_system.store_experience(experience.dict())
        return {"experience_id": exp_id, "status": "stored"}
    except Exception as e:
        logger.error(f"Experience storage error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/ai/learn")
async def trigger_learning_cycle(
    request: LearningCycleRequest,
    background_tasks: BackgroundTasks
):
    """Trigger a hindsight-based learning cycle"""
    try:
        # Run learning cycle in background
        background_tasks.add_task(
            run_learning_cycle_task,
            request.agent_names
        )
        return {
            "status": "learning_cycle_started",
            "message": "AI agents are learning from past experiences. This may take a few minutes."
        }
    except Exception as e:
        logger.error(f"Learning cycle error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def run_learning_cycle_task(agent_names: Optional[List[str]]):
    """Background task for learning cycle"""
    try:
        result = await hindsight_system.run_learning_cycle(agent_names)
        logger.info(f"Learning cycle completed: {result}")
    except Exception as e:
        logger.error(f"Learning cycle task error: {e}")

@api_router.get("/ai/learning-history")
async def get_learning_history(limit: int = 10):
    """Get recent learning cycles"""
    try:
        history = await hindsight_system.get_learning_history(limit)
        
        # Convert ObjectIds to strings
        history = convert_objectid_to_str(history)
        
        return {"learning_history": history}
    except Exception as e:
        logger.error(f"Learning history error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Model Performance Routes ====================

@api_router.get("/ai/models")
async def get_all_models():
    """Get all AI model metadata and performance"""
    try:
        models = await hindsight_system.get_model_metadata()
        
        # Convert ObjectIds to strings
        models = convert_objectid_to_str(models)
        
        # Add current performance from agents
        model_performance = {
            "risk_pricing": risk_pricing_agent.get_performance_metrics(),
            "fraud_detection": fraud_detection_agent.get_performance_metrics(),
            "payout_optimization": payout_optimization_agent.get_performance_metrics(),
            "trigger_optimization": trigger_optimization_agent.get_performance_metrics(),
            "retention_engagement": retention_engagement_agent.get_performance_metrics()
        }
        
        return {
            "models": models,
            "current_performance": model_performance
        }
    except Exception as e:
        logger.error(f"Model metadata error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/ai/models/{agent_name}")
async def get_model_details(agent_name: str):
    """Get specific model details"""
    try:
        models = await hindsight_system.get_model_metadata(agent_name)
        
        # Convert ObjectIds to strings
        models = convert_objectid_to_str(models)
        
        return {"model": models[0] if models else None}
    except Exception as e:
        logger.error(f"Model details error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/ai/statistics")
async def get_system_statistics():
    """Get overall AI system statistics"""
    try:
        stats = await hindsight_system.get_statistics()
        return stats
    except Exception as e:
        logger.error(f"Statistics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Data Generation Routes ====================

@api_router.post("/admin/generate-historical-data")
async def generate_historical_data():
    """Generate 6 months of historical data for training"""
    try:
        from utils.data_generator import HistoricalDataGenerator
        
        generator = HistoricalDataGenerator()
        data = generator.generate_all()
        
        # Store data in database
        if data['users']:
            await db.users.insert_many(data['users'])
        if data['policies']:
            await db.policies.insert_many(data['policies'])
        if data['weather_events']:
            await db.weather_events.insert_many(data['weather_events'])
        if data['claims']:
            await db.claims.insert_many(data['claims'])
        
        # Store experiences
        for agent_type, experiences in data['experiences'].items():
            if experiences:
                await db.experiences.insert_many(experiences)
        
        return {
            "status": "success",
            "message": "Historical data generated and stored",
            "summary": {
                "users": len(data['users']),
                "policies": len(data['policies']),
                "weather_events": len(data['weather_events']),
                "claims": len(data['claims']),
                "experiences": {k: len(v) for k, v in data['experiences'].items()}
            }
        }
    except Exception as e:
        logger.error(f"Data generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Legacy Routes ====================

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 IncomeShield AI Agent Platform started")
    logger.info("✅ All AI agents loaded and ready")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    logger.info("👋 Database connection closed")
