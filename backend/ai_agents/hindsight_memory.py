"""
Hindsight Experience Replay System
Stores experiences, relabels them with hindsight, and triggers retraining
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import numpy as np
from motor.motor_asyncio import AsyncIOMotorClient
import os


class HindsightMemorySystem:
    """Manages experience storage and hindsight-based learning"""
    
    def __init__(self, db):
        self.db = db
        self.experiences_collection = db.experiences
        self.learning_cycles_collection = db.learning_cycles
        self.ai_models_collection = db.ai_models
    
    async def store_experience(self, experience: Dict[str, Any]) -> str:
        """Store a new experience"""
        experience['created_at'] = datetime.utcnow()
        experience['used_for_training'] = False
        
        result = await self.experiences_collection.insert_one(experience)
        return str(result.inserted_id)
    
    async def get_experiences(
        self, 
        agent_type: Optional[str] = None,
        limit: int = 1000,
        only_unused: bool = False
    ) -> List[Dict[str, Any]]:
        """Retrieve experiences for training"""
        query = {}
        
        if agent_type:
            query['agent_type'] = agent_type
        
        if only_unused:
            query['used_for_training'] = False
        
        experiences = await self.experiences_collection.find(query).limit(limit).to_list(limit)
        return experiences
    
    async def mark_experiences_used(self, experience_ids: List[str]):
        """Mark experiences as used for training"""
        await self.experiences_collection.update_many(
            {'_id': {'$in': experience_ids}},
            {'$set': {'used_for_training': True, 'last_used_at': datetime.utcnow()}}
        )
    
    async def apply_hindsight_relabeling(
        self,
        experiences: List[Dict[str, Any]],
        agent_type: str
    ) -> List[Dict[str, Any]]:
        """
        Apply hindsight to relabel experiences
        This is the core of Hindsight Experience Replay
        """
        relabeled = []
        
        for exp in experiences:
            # Original experience
            relabeled.append(exp)
            
            # Create hindsight versions based on agent type
            if agent_type == 'risk_pricing':
                # If user churned, create version with lower premium
                if exp.get('outcome', {}).get('churned', False):
                    hindsight_exp = exp.copy()
                    hindsight_exp['input_data'] = exp['input_data'].copy()
                    hindsight_exp['is_hindsight'] = True
                    hindsight_exp['hindsight_goal'] = 'prevent_churn'
                    relabeled.append(hindsight_exp)
            
            elif agent_type == 'fraud_detection':
                # If fraud was missed, learn from it
                outcome = exp.get('outcome', {})
                if outcome.get('was_fraud', False) and not outcome.get('detected', False):
                    hindsight_exp = exp.copy()
                    hindsight_exp['is_hindsight'] = True
                    hindsight_exp['hindsight_goal'] = 'catch_fraud'
                    relabeled.append(hindsight_exp)
            
            elif agent_type == 'payout_optimization':
                # If user was very unsatisfied, learn better payout
                if exp.get('outcome', {}).get('user_satisfaction', 1.0) < 0.4:
                    hindsight_exp = exp.copy()
                    hindsight_exp['is_hindsight'] = True
                    hindsight_exp['hindsight_goal'] = 'improve_satisfaction'
                    relabeled.append(hindsight_exp)
            
            elif agent_type == 'trigger_optimization':
                # If false positive or false negative, learn better threshold
                outcome = exp.get('outcome', {})
                triggered = outcome.get('triggered', False)
                actual_disruption = outcome.get('actual_disruption', False)
                
                if triggered != actual_disruption:  # Mismatch
                    hindsight_exp = exp.copy()
                    hindsight_exp['is_hindsight'] = True
                    hindsight_exp['hindsight_goal'] = 'correct_threshold'
                    relabeled.append(hindsight_exp)
            
            elif agent_type == 'retention':
                # If churn occurred, learn prevention
                if exp.get('outcome', {}).get('churned', False):
                    hindsight_exp = exp.copy()
                    hindsight_exp['is_hindsight'] = True
                    hindsight_exp['hindsight_goal'] = 'retain_user'
                    relabeled.append(hindsight_exp)
        
        return relabeled
    
    async def run_learning_cycle(self, agent_names: List[str] = None) -> Dict[str, Any]:
        """
        Run a complete learning cycle with hindsight
        This is the main "learning from mistakes" function
        """
        from .risk_pricing_agent import RiskPricingAgent
        from .fraud_detection_agent import FraudDetectionAgent
        from .payout_optimization_agent import PayoutOptimizationAgent
        from .trigger_optimization_agent import TriggerOptimizationAgent
        from .retention_engagement_agent import RetentionEngagementAgent
        
        if agent_names is None:
            agent_names = ['risk_pricing', 'fraud_detection', 'payout_optimization', 
                          'trigger_optimization', 'retention']
        
        agent_map = {
            'risk_pricing': RiskPricingAgent(),
            'fraud_detection': FraudDetectionAgent(),
            'payout_optimization': PayoutOptimizationAgent(),
            'trigger_optimization': TriggerOptimizationAgent(),
            'retention': RetentionEngagementAgent()
        }
        
        cycle_results = {
            'cycle_id': str(datetime.utcnow().timestamp()),
            'started_at': datetime.utcnow(),
            'agents_trained': {},
            'total_experiences_used': 0
        }
        
        for agent_name in agent_names:
            if agent_name not in agent_map:
                continue
            
            agent = agent_map[agent_name]
            
            # Get experiences for this agent
            experiences = await self.get_experiences(agent_type=agent_name, limit=1000)
            
            if len(experiences) < 10:
                cycle_results['agents_trained'][agent_name] = {
                    'status': 'skipped',
                    'reason': f'Not enough experiences ({len(experiences)})'
                }
                continue
            
            # Apply hindsight relabeling
            relabeled_experiences = await self.apply_hindsight_relabeling(experiences, agent_name)
            
            # Prepare data for training
            training_data = []
            for exp in relabeled_experiences:
                training_data.append({
                    'input_data': exp.get('input_data', {}),
                    **exp.get('outcome', {})
                })
            
            # Train the agent
            try:
                metrics = agent.train(training_data)
                cycle_results['agents_trained'][agent_name] = {
                    'status': 'success',
                    'metrics': metrics,
                    'experiences_used': len(relabeled_experiences)
                }
                cycle_results['total_experiences_used'] += len(experiences)
                
                # Save model metadata
                await self.save_model_metadata(agent_name, metrics, agent.version)
            
            except Exception as e:
                cycle_results['agents_trained'][agent_name] = {
                    'status': 'failed',
                    'error': str(e)
                }
        
        cycle_results['completed_at'] = datetime.utcnow()
        cycle_results['duration_seconds'] = (
            cycle_results['completed_at'] - cycle_results['started_at']
        ).total_seconds()
        
        # Store learning cycle record
        await self.learning_cycles_collection.insert_one(cycle_results)
        
        return cycle_results
    
    async def save_model_metadata(self, agent_name: str, metrics: Dict, version: str):
        """Save model training metadata"""
        await self.ai_models_collection.update_one(
            {'agent_name': agent_name},
            {
                '$set': {
                    'agent_name': agent_name,
                    'version': version,
                    'last_trained': datetime.utcnow(),
                    'latest_metrics': metrics
                },
                '$push': {
                    'training_history': {
                        'timestamp': datetime.utcnow(),
                        'metrics': metrics
                    }
                }
            },
            upsert=True
        )
    
    async def get_model_metadata(self, agent_name: str = None) -> List[Dict[str, Any]]:
        """Get model metadata"""
        query = {}
        if agent_name:
            query['agent_name'] = agent_name
        
        models = await self.ai_models_collection.find(query).to_list(100)
        return models
    
    async def get_learning_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent learning cycles"""
        cycles = await self.learning_cycles_collection.find().sort(
            'started_at', -1
        ).limit(limit).to_list(limit)
        return cycles
    
    async def get_statistics(self) -> Dict[str, Any]:
        """Get overall system statistics"""
        total_experiences = await self.experiences_collection.count_documents({})
        total_cycles = await self.learning_cycles_collection.count_documents({})
        
        # Experiences by agent type
        pipeline = [
            {'$group': {'_id': '$agent_type', 'count': {'$sum': 1}}}
        ]
        by_agent = await self.experiences_collection.aggregate(pipeline).to_list(100)
        
        return {
            'total_experiences': total_experiences,
            'total_learning_cycles': total_cycles,
            'experiences_by_agent': {item['_id']: item['count'] for item in by_agent}
        }
