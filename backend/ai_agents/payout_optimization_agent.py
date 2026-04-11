"""
Payout Optimization Agent - Calculates fair payout amounts
Learns to estimate income loss and provide appropriate compensation
"""
from typing import Dict, Any, List
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from .base_agent import BaseAgent


class PayoutOptimizationAgent(BaseAgent):
    """Agent that learns optimal payout amounts"""
    
    def __init__(self):
        super().__init__("payout_optimization_agent")
        if self.model is None:
            self.model = GradientBoostingRegressor(
                n_estimators=100,
                random_state=42,
                max_depth=6,
                learning_rate=0.1
            )
    
    def preprocess_input(self, data: Dict[str, Any]) -> np.ndarray:
        """
        Convert claim data into payout prediction features
        Features: lost_hours, time_of_day, day_of_week, historical_earnings,
                  demand_zone, trigger_severity, city, platform
        """
        # Lost hours (0-12 typical)
        lost_hours = min(data.get('lost_hours', 3), 12)
        
        # Time of day (peak hours = higher earnings)
        hour = data.get('hour', 12)
        time_of_day_multiplier = 1.5 if 11 <= hour <= 14 or 18 <= hour <= 21 else 1.0
        
        # Day of week (weekend = higher earnings)
        day_of_week = data.get('day_of_week', 3)  # 0=Monday, 6=Sunday
        day_multiplier = 1.3 if day_of_week >= 5 else 1.0
        
        # Historical hourly earnings
        avg_hourly_earnings = data.get('avg_hourly_earnings', 150)
        
        # Demand zone (high demand areas = higher earnings)
        demand_zone_map = {'high': 1.3, 'medium': 1.0, 'low': 0.7}
        demand_zone = demand_zone_map.get(data.get('demand_zone', 'medium'), 1.0)
        
        # Trigger severity (more severe = likely more loss)
        trigger_severity = data.get('trigger_severity', 0.5)  # 0-1 scale
        
        # City (different earning potentials)
        city_map = {
            'Mumbai': 1.2, 'Delhi': 1.15, 'Bengaluru': 1.1, 'Hyderabad': 1.0,
            'Chennai': 1.05, 'default': 1.0
        }
        city_multiplier = city_map.get(data.get('city', 'Mumbai'), city_map['default'])
        
        # Platform
        platform_map = {'Zomato': 1.1, 'Swiggy': 1.0, 'Both': 1.15}
        platform_multiplier = platform_map.get(data.get('platform', 'Zomato'), 1.0)
        
        # Work type
        work_type_mult = 1.2 if data.get('work_type', 'full-time') == 'full-time' else 0.8
        
        # Season (monsoon/summer = different patterns)
        month = data.get('month', 6)
        seasonal_mult = 1.1 if month in [6, 7, 8] else 1.0
        
        features = np.array([
            lost_hours,
            time_of_day_multiplier,
            day_multiplier,
            avg_hourly_earnings / 200,  # Normalize
            demand_zone,
            trigger_severity,
            city_multiplier,
            platform_multiplier,
            work_type_mult,
            seasonal_mult
        ])
        
        return features.reshape(1, -1)
    
    def predict(self, data: Dict[str, Any]) -> float:
        """Predict fair payout amount"""
        if self.model is None or not hasattr(self.model, 'predict'):
            # Default payout calculation
            return self._default_payout(data)
        
        features = self.preprocess_input(data)
        features_scaled = self.scaler.transform(features)
        payout = self.model.predict(features_scaled)[0]
        
        # Ensure payout is in reasonable range (₹100 - ₹2000)
        return max(100, min(2000, round(payout, 2)))
    
    def _default_payout(self, data: Dict[str, Any]) -> float:
        """Fallback payout calculation"""
        lost_hours = data.get('lost_hours', 3)
        avg_hourly = data.get('avg_hourly_earnings', 150)
        
        # Simple formula: 80% of estimated loss
        base_payout = lost_hours * avg_hourly * 0.8
        
        return round(max(100, min(2000, base_payout)), 2)
    
    def train(self, experiences: List[Dict[str, Any]]) -> Dict[str, float]:
        """Train payout prediction model"""
        if len(experiences) < 10:
            return {'error': 'Need at least 10 experiences to train', 'samples': len(experiences)}
        
        X = []
        y = []
        
        for exp in experiences:
            features = self.preprocess_input(exp['input_data'])
            X.append(features.flatten())
            
            # Target: ideal payout (learned from feedback)
            ideal_payout = self._calculate_ideal_payout(exp)
            y.append(ideal_payout)
        
        X = np.array(X)
        y = np.array(y)
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42
        )
        
        # Train model
        self.model.fit(X_train, y_train)
        
        # Calculate metrics
        train_score = self.model.score(X_train, y_train)
        test_score = self.model.score(X_test, y_test)
        
        # Predictions
        y_pred = self.model.predict(X_test)
        mae = np.mean(np.abs(y_test - y_pred))
        rmse = np.sqrt(np.mean((y_test - y_pred) ** 2))
        
        # Payout accuracy (within ±10%)
        accuracy_threshold = 0.1
        accurate_predictions = np.sum(np.abs(y_test - y_pred) / y_test < accuracy_threshold)
        payout_accuracy = accurate_predictions / len(y_test)
        
        metrics = {
            'train_r2': round(train_score, 4),
            'test_r2': round(test_score, 4),
            'mae': round(mae, 2),
            'rmse': round(rmse, 2),
            'payout_accuracy': round(payout_accuracy, 4),
            'samples_trained': len(experiences),
            'timestamp': np.datetime64('now').astype(str)
        }
        
        self.training_history.append({'metrics': metrics, 'timestamp': metrics['timestamp']})
        self.save_model()
        
        return metrics
    
    def _calculate_ideal_payout(self, experience: Dict[str, Any]) -> float:
        """Calculate ideal payout using hindsight"""
        actual_payout = experience.get('actual_payout', 500)
        user_satisfaction = experience.get('user_satisfaction', 0.7)  # 0-1 scale
        actual_loss = experience.get('actual_loss', 600)
        
        # If user was very unsatisfied, payout was too low
        if user_satisfaction < 0.4:
            return min(actual_payout * 1.3, actual_loss * 0.9)
        
        # If payout was much higher than actual loss, reduce
        if actual_payout > actual_loss * 1.2:
            return actual_loss * 0.85
        
        # If satisfaction was high, payout was good
        if user_satisfaction > 0.8:
            return actual_payout
        
        # Otherwise, aim for ~80% of actual loss
        return actual_loss * 0.8
    
    def calculate_reward(self, experience: Dict[str, Any]) -> float:
        """Reward based on user satisfaction and fairness"""
        predicted_payout = experience.get('predicted_payout', 500)
        actual_loss = experience.get('actual_loss', 600)
        user_satisfaction = experience.get('user_satisfaction', 0.7)
        
        # Fairness score (how close to actual loss)
        fairness = 1.0 - abs(predicted_payout - actual_loss) / actual_loss
        fairness_reward = fairness * 100
        
        # Satisfaction reward
        satisfaction_reward = user_satisfaction * 100
        
        return fairness_reward + satisfaction_reward
    
    def _generate_explanation(self, data: Dict[str, Any], prediction: Any) -> str:
        """Explain payout calculation"""
        lost_hours = data.get('lost_hours', 3)
        avg_hourly = data.get('avg_hourly_earnings', 150)
        demand_zone = data.get('demand_zone', 'medium')
        
        explanation = f"Payout of ₹{prediction} calculated based on:\n"
        explanation += f"• Lost hours: {lost_hours} hours\n"
        explanation += f"• Your avg hourly earnings: ₹{avg_hourly}/hr\n"
        explanation += f"• Demand zone: {demand_zone}\n"
        explanation += f"• Time of day and day of week\n"
        explanation += f"• Trigger severity\n"
        explanation += f"\nEstimated loss: ₹{lost_hours * avg_hourly}\n"
        explanation += f"Compensation: ~{(prediction/(lost_hours * avg_hourly)*100):.0f}% of estimated loss"
        
        return explanation
