"""
Risk Pricing Agent - Learns optimal premium pricing
Uses historical data to balance churn vs payout profitability
"""
from typing import Dict, Any, List
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from .base_agent import BaseAgent


class RiskPricingAgent(BaseAgent):
    """Agent that learns optimal weekly premiums for users"""
    
    def __init__(self):
        super().__init__("risk_pricing_agent")
        if self.model is None:
            self.model = RandomForestRegressor(n_estimators=100, random_state=42, max_depth=10)
    
    def preprocess_input(self, data: Dict[str, Any]) -> np.ndarray:
        """
        Convert user data into features
        Features: location_risk, weather_risk, claim_frequency, avg_earnings, 
                  seasonal_factor, work_type, platform
        """
        # City risk scores (normalized 0-1)
        city_risk_map = {
            'Mumbai': 0.95, 'Delhi': 0.90, 'Chennai': 0.85, 'Kolkata': 0.82,
            'Bengaluru': 0.70, 'Hyderabad': 0.65, 'Pune': 0.60, 'Ahmedabad': 0.75,
            'Jaipur': 0.68, 'Surat': 0.78, 'default': 0.65
        }
        
        city = data.get('city', 'Mumbai')
        location_risk = city_risk_map.get(city, city_risk_map['default'])
        
        # Weather risk (from historical data)
        weather_risk = data.get('weather_risk', 0.5)
        
        # Claim frequency (claims per month)
        claim_frequency = data.get('claim_frequency', 0.5)
        
        # Average earnings (normalized)
        avg_earnings = min(data.get('avg_earnings', 5000) / 10000, 1.0)
        
        # Seasonal factor (monsoon = high, winter = low)
        month = data.get('month', 6)
        seasonal_factor = 0.9 if month in [6, 7, 8, 9] else 0.5 if month in [11, 12, 1, 2] else 0.7
        
        # Work type (full-time = 1, part-time = 0)
        work_type = 1.0 if data.get('work_type', 'full-time') == 'full-time' else 0.5
        
        # Platform (Zomato=0.8, Swiggy=0.7, Both=1.0)
        platform_map = {'Zomato': 0.8, 'Swiggy': 0.7, 'Both': 1.0}
        platform = platform_map.get(data.get('platform', 'Zomato'), 0.8)
        
        # Previous churn risk
        churn_risk = data.get('churn_risk', 0.3)
        
        features = np.array([
            location_risk,
            weather_risk,
            claim_frequency,
            avg_earnings,
            seasonal_factor,
            work_type,
            platform,
            churn_risk
        ])
        
        return features.reshape(1, -1)
    
    def predict(self, data: Dict[str, Any]) -> float:
        """Predict optimal weekly premium"""
        if self.model is None or not hasattr(self.model, 'predict'):
            # Default pricing if model not trained
            return self._default_pricing(data)
        
        features = self.preprocess_input(data)
        features_scaled = self.scaler.transform(features)
        premium = self.model.predict(features_scaled)[0]
        
        # Ensure premium is in reasonable range (₹40 - ₹150)
        return max(40, min(150, round(premium, 2)))
    
    def _default_pricing(self, data: Dict[str, Any]) -> float:
        """Fallback pricing before model is trained"""
        base = 50
        city_multiplier = {
            'Mumbai': 1.6, 'Delhi': 1.5, 'Chennai': 1.4, 'Kolkata': 1.4,
            'Bengaluru': 1.2, 'default': 1.3
        }
        city = data.get('city', 'Mumbai')
        mult = city_multiplier.get(city, city_multiplier['default'])
        return round(base * mult, 2)
    
    def train(self, experiences: List[Dict[str, Any]]) -> Dict[str, float]:
        """Train model on historical experiences"""
        if len(experiences) < 10:
            return {'error': 'Need at least 10 experiences to train', 'samples': len(experiences)}
        
        # Prepare training data
        X = []
        y = []
        
        for exp in experiences:
            features = self.preprocess_input(exp['input_data'])
            X.append(features.flatten())
            
            # Target: optimal premium (calculated with hindsight)
            optimal_premium = self._calculate_optimal_premium(exp)
            y.append(optimal_premium)
        
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
        
        metrics = {
            'train_r2': round(train_score, 4),
            'test_r2': round(test_score, 4),
            'mae': round(mae, 2),
            'rmse': round(rmse, 2),
            'samples_trained': len(experiences),
            'timestamp': np.datetime64('now').astype(str)
        }
        
        self.training_history.append({'metrics': metrics, 'timestamp': metrics['timestamp']})
        self.save_model()
        
        return metrics
    
    def _calculate_optimal_premium(self, experience: Dict[str, Any]) -> float:
        """Calculate optimal premium using hindsight"""
        actual_premium = experience.get('actual_premium', 70)
        churned = experience.get('churned', False)
        total_payout = experience.get('total_payout', 0)
        
        # If user churned, premium was too high
        if churned:
            return actual_premium * 0.85
        
        # If payout was very high relative to premium, increase premium
        payout_ratio = total_payout / max(actual_premium, 1)
        
        if payout_ratio > 5:  # Loss-making
            return actual_premium * 1.3
        elif payout_ratio > 3:
            return actual_premium * 1.15
        elif payout_ratio < 0.5:  # Very profitable
            return actual_premium * 0.95
        else:
            return actual_premium
    
    def calculate_reward(self, experience: Dict[str, Any]) -> float:
        """Calculate reward: profit - churn_penalty"""
        premium = experience.get('actual_premium', 70)
        payout = experience.get('total_payout', 0)
        churned = experience.get('churned', False)
        
        profit = premium - payout
        churn_penalty = -500 if churned else 0  # High penalty for churn
        
        return profit + churn_penalty
    
    def _generate_explanation(self, data: Dict[str, Any], prediction: Any) -> str:
        """Explain premium calculation"""
        city = data.get('city', 'Unknown')
        claim_freq = data.get('claim_frequency', 0)
        work_type = data.get('work_type', 'full-time')
        
        explanation = f"Premium of ₹{prediction} calculated based on:\n"
        explanation += f"• Location: {city} (risk zone)\n"
        explanation += f"• Historical claims: {claim_freq:.1f} per month\n"
        explanation += f"• Work type: {work_type}\n"
        explanation += "• Seasonal weather patterns\n"
        explanation += "• Optimized to balance coverage and affordability"
        
        return explanation
