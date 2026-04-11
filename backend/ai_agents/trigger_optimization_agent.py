"""
Trigger Optimization Agent - Learns optimal trigger thresholds
Adapts trigger thresholds to reduce false positives/negatives
"""
from typing import Dict, Any, List
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from .base_agent import BaseAgent


class TriggerOptimizationAgent(BaseAgent):
    """Agent that learns optimal trigger thresholds per city/condition"""
    
    def __init__(self):
        super().__init__("trigger_optimization_agent")
        if self.model is None:
            # We'll have multiple models for different trigger types
            self.model = {
                'rainfall': GradientBoostingRegressor(n_estimators=50, max_depth=5, random_state=42),
                'temperature': GradientBoostingRegressor(n_estimators=50, max_depth=5, random_state=42),
                'aqi': GradientBoostingRegressor(n_estimators=50, max_depth=5, random_state=42)
            }
    
    def preprocess_input(self, data: Dict[str, Any]) -> np.ndarray:
        """
        Features for trigger threshold optimization
        """
        # City risk profile
        city_risk_map = {
            'Mumbai': 0.95, 'Delhi': 0.90, 'Chennai': 0.85, 'Kolkata': 0.82,
            'Bengaluru': 0.70, 'default': 0.75
        }
        city = data.get('city', 'Mumbai')
        city_risk = city_risk_map.get(city, city_risk_map['default'])
        
        # Historical disruption frequency in area
        historical_freq = data.get('historical_disruption_freq', 0.5)
        
        # Season (monsoon vs other)
        month = data.get('month', 6)
        is_monsoon = 1.0 if month in [6, 7, 8, 9] else 0.0
        
        # Trigger type specific features
        trigger_type = data.get('trigger_type', 'rainfall')
        
        # Current threshold
        current_threshold = data.get('current_threshold', 40)
        
        # False positive rate (triggers without actual disruption)
        false_positive_rate = data.get('false_positive_rate', 0.1)
        
        # False negative rate (disruptions without trigger)
        false_negative_rate = data.get('false_negative_rate', 0.1)
        
        # Average actual value when disruption occurs
        avg_actual_value = data.get('avg_actual_value_at_disruption', 50)
        
        features = np.array([
            city_risk,
            historical_freq,
            is_monsoon,
            current_threshold / 100,  # Normalize
            false_positive_rate,
            false_negative_rate,
            avg_actual_value / 100
        ])
        
        return features.reshape(1, -1)
    
    def predict(self, data: Dict[str, Any]) -> Dict[str, float]:
        """Predict optimal threshold for a trigger type"""
        trigger_type = data.get('trigger_type', 'rainfall')
        
        if not hasattr(self.model, 'get') or trigger_type not in self.model:
            return self._default_thresholds(data)
        
        model = self.model[trigger_type]
        if not hasattr(model, 'predict'):
            return self._default_thresholds(data)
        
        features = self.preprocess_input(data)
        features_scaled = self.scaler.transform(features)
        optimal_threshold = model.predict(features_scaled)[0]
        
        # Ensure threshold is in reasonable range based on type
        threshold_ranges = {
            'rainfall': (20, 80),  # mm/hr
            'temperature': (38, 50),  # °C
            'aqi': (200, 450)  # AQI
        }
        
        min_val, max_val = threshold_ranges.get(trigger_type, (20, 100))
        optimal_threshold = max(min_val, min(max_val, optimal_threshold))
        
        return {
            'trigger_type': trigger_type,
            'optimal_threshold': round(optimal_threshold, 2),
            'current_threshold': data.get('current_threshold', 40)
        }
    
    def _default_thresholds(self, data: Dict[str, Any]) -> Dict[str, float]:
        """Default thresholds before training"""
        trigger_type = data.get('trigger_type', 'rainfall')
        city = data.get('city', 'Mumbai')
        
        # Base thresholds
        base_thresholds = {
            'rainfall': 40,
            'temperature': 43,
            'aqi': 300
        }
        
        # City adjustments (high-risk cities have lower thresholds)
        city_adjustment_map = {
            'Mumbai': 0.85,
            'Delhi': 0.90,
            'Chennai': 0.88,
            'default': 0.95
        }
        
        adjustment = city_adjustment_map.get(city, city_adjustment_map['default'])
        optimal = base_thresholds.get(trigger_type, 40) * adjustment
        
        return {
            'trigger_type': trigger_type,
            'optimal_threshold': round(optimal, 2),
            'current_threshold': data.get('current_threshold', optimal)
        }
    
    def train(self, experiences: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Train trigger optimization models"""
        if len(experiences) < 15:
            return {'error': 'Need at least 15 experiences to train', 'samples': len(experiences)}
        
        # Group experiences by trigger type
        by_type = {}
        for exp in experiences:
            trigger_type = exp['input_data'].get('trigger_type', 'rainfall')
            if trigger_type not in by_type:
                by_type[trigger_type] = []
            by_type[trigger_type].append(exp)
        
        all_metrics = {}
        
        # Train model for each trigger type
        for trigger_type, type_experiences in by_type.items():
            if len(type_experiences) < 5:
                continue  # Not enough data for this type
            
            X = []
            y = []
            
            for exp in type_experiences:
                features = self.preprocess_input(exp['input_data'])
                X.append(features.flatten())
                
                # Target: optimal threshold based on outcome
                optimal_threshold = self._calculate_optimal_threshold(exp)
                y.append(optimal_threshold)
            
            X = np.array(X)
            y = np.array(y)
            
            # Scale features
            X_scaled = self.scaler.fit_transform(X)
            
            # Train
            if trigger_type not in self.model:
                self.model[trigger_type] = GradientBoostingRegressor(
                    n_estimators=50, max_depth=5, random_state=42
                )
            
            model = self.model[trigger_type]
            
            if len(X) >= 10:
                X_train, X_test, y_train, y_test = train_test_split(
                    X_scaled, y, test_size=0.2, random_state=42
                )
                model.fit(X_train, y_train)
                test_score = model.score(X_test, y_test)
                y_pred = model.predict(X_test)
                mae = np.mean(np.abs(y_test - y_pred))
            else:
                model.fit(X_scaled, y)
                test_score = model.score(X_scaled, y)
                mae = 0
            
            all_metrics[trigger_type] = {
                'test_r2': round(test_score, 4),
                'mae': round(mae, 2),
                'samples': len(type_experiences)
            }
        
        timestamp = np.datetime64('now').astype(str)
        metrics = {
            'trigger_types': all_metrics,
            'total_samples': len(experiences),
            'timestamp': timestamp
        }
        
        self.training_history.append({'metrics': metrics, 'timestamp': timestamp})
        self.save_model()
        
        return metrics
    
    def _calculate_optimal_threshold(self, experience: Dict[str, Any]) -> float:
        """Calculate optimal threshold using hindsight"""
        current_threshold = experience.get('current_threshold', 40)
        triggered = experience.get('triggered', False)
        actual_disruption = experience.get('actual_disruption', False)
        actual_value = experience.get('actual_value', 45)
        
        # False positive: triggered but no disruption
        if triggered and not actual_disruption:
            # Threshold was too low, increase it
            return current_threshold * 1.15
        
        # False negative: disruption but didn't trigger
        if not triggered and actual_disruption:
            # Threshold was too high, decrease it
            return actual_value * 0.9
        
        # Correct trigger
        if triggered and actual_disruption:
            # Good threshold, keep it close to actual value
            return actual_value * 0.95
        
        # Correctly didn't trigger
        return current_threshold
    
    def calculate_reward(self, experience: Dict[str, Any]) -> float:
        """Reward for correct trigger decisions"""
        triggered = experience.get('triggered', False)
        actual_disruption = experience.get('actual_disruption', False)
        
        if triggered and actual_disruption:
            return 100  # Correct trigger
        elif not triggered and not actual_disruption:
            return 10  # Correct non-trigger
        elif triggered and not actual_disruption:
            return -50  # False positive (paid unnecessarily)
        else:  # not triggered but actual disruption
            return -200  # False negative (user suffered without compensation)
    
    def _generate_explanation(self, data: Dict[str, Any], prediction: Any) -> str:
        """Explain threshold recommendation"""
        trigger_type = prediction.get('trigger_type', 'rainfall')
        optimal = prediction.get('optimal_threshold', 40)
        current = prediction.get('current_threshold', 40)
        city = data.get('city', 'Unknown')
        
        change = optimal - current
        change_pct = (change / current * 100) if current > 0 else 0
        
        explanation = f"Trigger Optimization for {trigger_type.upper()} in {city}\n\n"
        explanation += f"Current threshold: {current}\n"
        explanation += f"Recommended threshold: {optimal}\n"
        
        if abs(change_pct) < 5:
            explanation += f"\n✅ Current threshold is optimal"
        elif change > 0:
            explanation += f"\n⬆️ Increase by {change:.1f} ({change_pct:+.1f}%)\n"
            explanation += "Reason: Too many false triggers detected"
        else:
            explanation += f"\n⬇️ Decrease by {abs(change):.1f} ({change_pct:+.1f}%)\n"
            explanation += "Reason: Missing actual disruptions"
        
        return explanation
