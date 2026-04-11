"""
Base AI Agent class for IncomeShield
All agents inherit from this base class
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime
import numpy as np
from sklearn.preprocessing import StandardScaler
import joblib
import os


class BaseAgent(ABC):
    """Base class for all AI agents in the system"""
    
    def __init__(self, agent_name: str, model_path: str = None):
        self.agent_name = agent_name
        self.model_path = model_path or f"/app/backend/models/{agent_name}.joblib"
        self.model = None
        self.scaler = StandardScaler()
        self.training_history = []
        self.version = "1.0.0"
        
        # Create models directory if it doesn't exist
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        
        # Load model if exists
        self.load_model()
    
    @abstractmethod
    def preprocess_input(self, data: Dict[str, Any]) -> np.ndarray:
        """Preprocess input data into features"""
        pass
    
    @abstractmethod
    def predict(self, data: Dict[str, Any]) -> Any:
        """Make a prediction"""
        pass
    
    @abstractmethod
    def train(self, experiences: List[Dict[str, Any]]) -> Dict[str, float]:
        """Train the model on experiences"""
        pass
    
    @abstractmethod
    def calculate_reward(self, experience: Dict[str, Any]) -> float:
        """Calculate reward from an experience"""
        pass
    
    def save_model(self):
        """Save model to disk"""
        if self.model is not None:
            model_data = {
                'model': self.model,
                'scaler': self.scaler,
                'version': self.version,
                'training_history': self.training_history,
                'agent_name': self.agent_name,
                'last_updated': datetime.utcnow().isoformat()
            }
            joblib.dump(model_data, self.model_path)
            print(f"✅ Model saved: {self.model_path}")
    
    def load_model(self):
        """Load model from disk"""
        if os.path.exists(self.model_path):
            try:
                model_data = joblib.load(self.model_path)
                self.model = model_data['model']
                self.scaler = model_data['scaler']
                self.version = model_data.get('version', '1.0.0')
                self.training_history = model_data.get('training_history', [])
                print(f"✅ Model loaded: {self.model_path}")
            except Exception as e:
                print(f"⚠️ Could not load model: {e}")
                self.model = None
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get model performance metrics"""
        if not self.training_history:
            return {
                'agent_name': self.agent_name,
                'version': self.version,
                'trained': False,
                'metrics': {}
            }
        
        latest = self.training_history[-1] if self.training_history else {}
        return {
            'agent_name': self.agent_name,
            'version': self.version,
            'trained': self.model is not None,
            'last_training': latest.get('timestamp'),
            'metrics': latest.get('metrics', {}),
            'training_count': len(self.training_history)
        }
    
    def explain_decision(self, data: Dict[str, Any], prediction: Any) -> Dict[str, Any]:
        """Explain why the agent made a specific decision"""
        return {
            'agent': self.agent_name,
            'prediction': prediction,
            'input_summary': self._summarize_input(data),
            'explanation': self._generate_explanation(data, prediction)
        }
    
    def _summarize_input(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a summary of input data"""
        return {k: v for k, v in data.items() if not isinstance(v, (list, dict))}
    
    @abstractmethod
    def _generate_explanation(self, data: Dict[str, Any], prediction: Any) -> str:
        """Generate human-readable explanation"""
        pass
