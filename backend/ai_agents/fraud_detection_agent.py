"""
Fraud Detection Agent - Identifies suspicious claim patterns
Uses ML to detect GPS spoofing, duplicate claims, and abuse patterns
"""
from typing import Dict, Any, List
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from .base_agent import BaseAgent


class FraudDetectionAgent(BaseAgent):
    """Agent that detects fraudulent claims"""
    
    def __init__(self):
        super().__init__("fraud_detection_agent")
        if self.model is None:
            self.model = RandomForestClassifier(
                n_estimators=100, 
                random_state=42, 
                max_depth=10,
                class_weight='balanced'  # Handle imbalanced fraud data
            )
    
    def preprocess_input(self, data: Dict[str, Any]) -> np.ndarray:
        """
        Convert claim data into fraud detection features
        Features: claim_amount, time_since_last_claim, location_consistency,
                  claim_frequency, movement_speed, trigger_correlation, etc.
        """
        # Claim amount (normalized)
        claim_amount = min(data.get('claim_amount', 500) / 1000, 2.0)
        
        # Time since last claim (hours)
        time_since_last = min(data.get('time_since_last_claim', 168) / 168, 2.0)  # 168 = 1 week
        
        # Location consistency (0-1, how consistent with work area)
        location_consistency = data.get('location_consistency', 0.8)
        
        # Claim frequency (claims per month)
        claim_frequency = min(data.get('claim_frequency', 1) / 5, 2.0)
        
        # Movement speed (km/h) - unrealistic speeds indicate GPS spoofing
        movement_speed = min(data.get('movement_speed', 20) / 100, 2.0)
        
        # Trigger correlation (does claim match actual weather trigger?)
        trigger_correlation = data.get('trigger_correlation', 0.9)
        
        # Time of day (night claims more suspicious)
        hour = data.get('claim_hour', 12)
        time_of_day = 1.0 if 6 <= hour <= 22 else 0.3
        
        # Account age (days)
        account_age = min(data.get('account_age_days', 30) / 365, 2.0)
        
        # Pattern similarity with known fraud (0-1)
        pattern_similarity = data.get('pattern_similarity', 0.1)
        
        # GPS accuracy (meters) - poor accuracy is suspicious
        gps_accuracy = min(data.get('gps_accuracy', 10) / 100, 1.0)
        
        # Duplicate claim check (same location/time as others)
        duplicate_score = data.get('duplicate_score', 0.0)
        
        features = np.array([
            claim_amount,
            time_since_last,
            location_consistency,
            claim_frequency,
            movement_speed,
            trigger_correlation,
            time_of_day,
            account_age,
            pattern_similarity,
            gps_accuracy,
            duplicate_score
        ])
        
        return features.reshape(1, -1)
    
    def predict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict fraud probability and risk level"""
        if self.model is None or not hasattr(self.model, 'predict_proba'):
            # Default rule-based detection if model not trained
            return self._rule_based_detection(data)
        
        features = self.preprocess_input(data)
        features_scaled = self.scaler.transform(features)
        
        fraud_prob = self.model.predict_proba(features_scaled)[0][1]  # Probability of fraud
        is_fraud = fraud_prob > 0.5
        
        # Risk levels
        if fraud_prob > 0.8:
            risk_level = 'critical'
        elif fraud_prob > 0.5:
            risk_level = 'high'
        elif fraud_prob > 0.3:
            risk_level = 'medium'
        else:
            risk_level = 'low'
        
        return {
            'is_fraud': bool(is_fraud),
            'fraud_probability': round(float(fraud_prob), 4),
            'risk_level': risk_level,
            'action': 'block' if fraud_prob > 0.8 else 'review' if fraud_prob > 0.5 else 'approve'
        }
    
    def _rule_based_detection(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback rule-based fraud detection"""
        score = 0.0
        
        # High claim frequency
        if data.get('claim_frequency', 0) > 4:
            score += 0.3
        
        # Low location consistency
        if data.get('location_consistency', 1.0) < 0.5:
            score += 0.25
        
        # Unrealistic movement speed
        if data.get('movement_speed', 0) > 80:
            score += 0.3
        
        # Low trigger correlation
        if data.get('trigger_correlation', 1.0) < 0.6:
            score += 0.2
        
        # High duplicate score
        if data.get('duplicate_score', 0) > 0.5:
            score += 0.4
        
        score = min(score, 1.0)
        
        return {
            'is_fraud': score > 0.5,
            'fraud_probability': round(score, 4),
            'risk_level': 'high' if score > 0.7 else 'medium' if score > 0.4 else 'low',
            'action': 'block' if score > 0.7 else 'review' if score > 0.4 else 'approve'
        }
    
    def train(self, experiences: List[Dict[str, Any]]) -> Dict[str, float]:
        """Train fraud detection model"""
        if len(experiences) < 20:
            return {'error': 'Need at least 20 experiences to train', 'samples': len(experiences)}
        
        X = []
        y = []
        
        for exp in experiences:
            features = self.preprocess_input(exp['input_data'])
            X.append(features.flatten())
            
            # Label: was it actually fraud?
            is_fraud = exp.get('was_fraud', False)
            y.append(1 if is_fraud else 0)
        
        X = np.array(X)
        y = np.array(y)
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Train model
        self.model.fit(X_train, y_train)
        
        # Calculate metrics
        train_score = self.model.score(X_train, y_train)
        test_score = self.model.score(X_test, y_test)
        
        # Predictions
        y_pred = self.model.predict(X_test)
        y_pred_proba = self.model.predict_proba(X_test)[:, 1]
        
        # Confusion matrix elements
        tp = np.sum((y_test == 1) & (y_pred == 1))
        tn = np.sum((y_test == 0) & (y_pred == 0))
        fp = np.sum((y_test == 0) & (y_pred == 1))
        fn = np.sum((y_test == 1) & (y_pred == 0))
        
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        
        metrics = {
            'train_accuracy': round(train_score, 4),
            'test_accuracy': round(test_score, 4),
            'precision': round(precision, 4),
            'recall': round(recall, 4),
            'f1_score': round(f1, 4),
            'true_positives': int(tp),
            'true_negatives': int(tn),
            'false_positives': int(fp),
            'false_negatives': int(fn),
            'samples_trained': len(experiences),
            'fraud_cases': int(np.sum(y)),
            'timestamp': np.datetime64('now').astype(str)
        }
        
        self.training_history.append({'metrics': metrics, 'timestamp': metrics['timestamp']})
        self.save_model()
        
        return metrics
    
    def calculate_reward(self, experience: Dict[str, Any]) -> float:
        """
        Reward for correct fraud detection
        +100 for catching fraud, -500 for missing fraud, -50 for false positive
        """
        predicted_fraud = experience.get('predicted_fraud', False)
        actual_fraud = experience.get('was_fraud', False)
        
        if actual_fraud and predicted_fraud:
            return 100  # Caught fraud
        elif actual_fraud and not predicted_fraud:
            return -500  # Missed fraud (very bad)
        elif not actual_fraud and predicted_fraud:
            return -50  # False alarm (annoyed legitimate user)
        else:
            return 10  # Correctly approved legitimate claim
    
    def _generate_explanation(self, data: Dict[str, Any], prediction: Any) -> str:
        """Explain fraud detection decision"""
        fraud_prob = prediction.get('fraud_probability', 0)
        risk_level = prediction.get('risk_level', 'low')
        
        explanation = f"Fraud Risk: {risk_level.upper()} ({fraud_prob*100:.1f}%)\n\n"
        
        # Key factors
        factors = []
        
        claim_freq = data.get('claim_frequency', 0)
        if claim_freq > 3:
            factors.append(f"⚠️ High claim frequency ({claim_freq}/month)")
        
        loc_consistency = data.get('location_consistency', 1.0)
        if loc_consistency < 0.6:
            factors.append(f"⚠️ Inconsistent location pattern ({loc_consistency*100:.0f}%)")
        
        speed = data.get('movement_speed', 0)
        if speed > 60:
            factors.append(f"⚠️ Unrealistic movement speed ({speed} km/h)")
        
        trigger_corr = data.get('trigger_correlation', 1.0)
        if trigger_corr < 0.7:
            factors.append(f"⚠️ Low trigger correlation ({trigger_corr*100:.0f}%)")
        
        dup_score = data.get('duplicate_score', 0)
        if dup_score > 0.3:
            factors.append(f"⚠️ Similar to other claims ({dup_score*100:.0f}%)")
        
        if factors:
            explanation += "Risk factors:\n" + "\n".join(factors)
        else:
            explanation += "✅ All checks passed. Claim appears legitimate."
        
        return explanation
