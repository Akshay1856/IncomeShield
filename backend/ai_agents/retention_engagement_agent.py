"""
Retention & Engagement Agent - Improves user retention
Learns which actions increase renewals and user satisfaction
"""
from typing import Dict, Any, List
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from .base_agent import BaseAgent


class RetentionEngagementAgent(BaseAgent):
    """Agent that learns to improve user retention"""
    
    def __init__(self):
        super().__init__("retention_engagement_agent")
        if self.model is None:
            self.model = RandomForestClassifier(
                n_estimators=100,
                random_state=42,
                max_depth=10,
                class_weight='balanced'
            )
    
    def preprocess_input(self, data: Dict[str, Any]) -> np.ndarray:
        """
        Features for churn prediction and retention
        """
        # User tenure (weeks)
        tenure_weeks = min(data.get('tenure_weeks', 4) / 52, 2.0)  # Normalize to ~1 year
        
        # Claim satisfaction (0-1)
        claim_satisfaction = data.get('claim_satisfaction', 0.7)
        
        # Premium affordability (ratio of premium to earnings)
        premium = data.get('premium', 70)
        weekly_earnings = data.get('weekly_earnings', 5000)
        affordability = 1.0 - min(premium / weekly_earnings, 0.5) * 2  # Lower is better
        
        # Claim frequency (claims per month)
        claim_frequency = min(data.get('claim_frequency', 1) / 4, 2.0)
        
        # Claims approved ratio
        claims_approved_ratio = data.get('claims_approved_ratio', 0.9)
        
        # App engagement (opens per week)
        app_engagement = min(data.get('app_opens_per_week', 7) / 14, 2.0)
        
        # Days since last interaction
        days_since_last_interaction = min(data.get('days_since_last_interaction', 3) / 30, 2.0)
        
        # Payout vs premium ratio (value perception)
        total_payout = data.get('total_payout_received', 0)
        total_premium_paid = data.get('total_premium_paid', 280)
        value_ratio = min(total_payout / max(total_premium_paid, 1), 3.0)
        
        # Support interactions
        support_interactions = min(data.get('support_interactions', 0) / 5, 2.0)
        
        # Renewal streak
        renewal_streak = min(data.get('renewal_streak', 2) / 10, 2.0)
        
        # Has recommended to others
        has_referred = 1.0 if data.get('referrals', 0) > 0 else 0.0
        
        features = np.array([
            tenure_weeks,
            claim_satisfaction,
            affordability,
            claim_frequency,
            claims_approved_ratio,
            app_engagement,
            days_since_last_interaction,
            value_ratio,
            support_interactions,
            renewal_streak,
            has_referred
        ])
        
        return features.reshape(1, -1)
    
    def predict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict churn probability and recommend actions"""
        if self.model is None or not hasattr(self.model, 'predict_proba'):
            return self._rule_based_retention(data)
        
        features = self.preprocess_input(data)
        features_scaled = self.scaler.transform(features)
        
        churn_prob = self.model.predict_proba(features_scaled)[0][1]
        will_churn = churn_prob > 0.5
        
        # Risk level
        if churn_prob > 0.7:
            risk_level = 'critical'
        elif churn_prob > 0.5:
            risk_level = 'high'
        elif churn_prob > 0.3:
            risk_level = 'medium'
        else:
            risk_level = 'low'
        
        # Recommend actions based on risk factors
        recommendations = self._generate_recommendations(data, churn_prob)
        
        return {
            'will_churn': bool(will_churn),
            'churn_probability': round(float(churn_prob), 4),
            'risk_level': risk_level,
            'recommendations': recommendations
        }
    
    def _generate_recommendations(self, data: Dict[str, Any], churn_prob: float) -> List[str]:
        """Generate personalized retention recommendations"""
        recommendations = []
        
        # Low satisfaction
        if data.get('claim_satisfaction', 1.0) < 0.6:
            recommendations.append({
                'action': 'improve_claim_experience',
                'message': 'Send personalized message explaining claims process',
                'priority': 'high'
            })
        
        # High premium vs earnings
        premium = data.get('premium', 70)
        earnings = data.get('weekly_earnings', 5000)
        if premium / earnings > 0.02:  # More than 2% of earnings
            recommendations.append({
                'action': 'offer_discount',
                'message': f'Offer 15% discount on next renewal (premium too high)',
                'priority': 'high'
            })
        
        # Low engagement
        if data.get('app_opens_per_week', 7) < 3:
            recommendations.append({
                'action': 'engagement_reminder',
                'message': 'Send push notification about coverage status',
                'priority': 'medium'
            })
        
        # Poor value perception
        total_payout = data.get('total_payout_received', 0)
        total_premium = data.get('total_premium_paid', 280)
        if total_payout < total_premium * 0.3 and data.get('tenure_weeks', 4) > 8:
            recommendations.append({
                'action': 'show_value',
                'message': 'Highlight protection benefits and risk mitigation',
                'priority': 'medium'
            })
        
        # High churn risk
        if churn_prob > 0.7:
            recommendations.append({
                'action': 'retention_call',
                'message': 'Personal call from support team',
                'priority': 'critical'
            })
        
        # Inactivity
        if data.get('days_since_last_interaction', 3) > 14:
            recommendations.append({
                'action': 'win_back_campaign',
                'message': 'Send special offer to re-engage',
                'priority': 'high'
            })
        
        return recommendations[:3]  # Top 3 recommendations
    
    def _rule_based_retention(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback rule-based retention prediction"""
        risk_score = 0.0
        
        # Low satisfaction
        if data.get('claim_satisfaction', 1.0) < 0.5:
            risk_score += 0.3
        
        # High premium
        premium = data.get('premium', 70)
        earnings = data.get('weekly_earnings', 5000)
        if premium / earnings > 0.025:
            risk_score += 0.25
        
        # Low engagement
        if data.get('app_opens_per_week', 7) < 2:
            risk_score += 0.2
        
        # Inactivity
        if data.get('days_since_last_interaction', 3) > 21:
            risk_score += 0.25
        
        risk_score = min(risk_score, 1.0)
        
        recommendations = self._generate_recommendations(data, risk_score)
        
        return {
            'will_churn': risk_score > 0.5,
            'churn_probability': round(risk_score, 4),
            'risk_level': 'high' if risk_score > 0.6 else 'medium' if risk_score > 0.3 else 'low',
            'recommendations': recommendations
        }
    
    def train(self, experiences: List[Dict[str, Any]]) -> Dict[str, float]:
        """Train retention prediction model"""
        if len(experiences) < 20:
            return {'error': 'Need at least 20 experiences to train', 'samples': len(experiences)}
        
        X = []
        y = []
        
        for exp in experiences:
            features = self.preprocess_input(exp['input_data'])
            X.append(features.flatten())
            
            # Label: did user churn?
            churned = exp.get('churned', False)
            y.append(1 if churned else 0)
        
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
        
        # Confusion matrix
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
            'churn_rate': round(np.mean(y), 4),
            'samples_trained': len(experiences),
            'timestamp': np.datetime64('now').astype(str)
        }
        
        self.training_history.append({'metrics': metrics, 'timestamp': metrics['timestamp']})
        self.save_model()
        
        return metrics
    
    def calculate_reward(self, experience: Dict[str, Any]) -> float:
        """Reward for successful retention"""
        predicted_churn = experience.get('predicted_churn', False)
        actual_churn = experience.get('churned', False)
        intervention_taken = experience.get('intervention_taken', False)
        
        # Successfully prevented churn
        if predicted_churn and intervention_taken and not actual_churn:
            return 500  # Saved a customer
        
        # Correctly identified low risk
        if not predicted_churn and not actual_churn:
            return 10
        
        # Failed to prevent churn
        if predicted_churn and actual_churn:
            return -100
        
        # Unnecessary intervention
        if predicted_churn and intervention_taken and actual_churn:
            return -50
        
        # Missed churn risk
        if not predicted_churn and actual_churn:
            return -300
        
        return 0
    
    def _generate_explanation(self, data: Dict[str, Any], prediction: Any) -> str:
        """Explain retention prediction"""
        churn_prob = prediction.get('churn_probability', 0)
        risk_level = prediction.get('risk_level', 'low')
        recommendations = prediction.get('recommendations', [])
        
        explanation = f"Retention Risk: {risk_level.upper()} ({churn_prob*100:.1f}%)\n\n"
        
        # Key risk factors
        factors = []
        
        satisfaction = data.get('claim_satisfaction', 1.0)
        if satisfaction < 0.6:
            factors.append(f"⚠️ Low claim satisfaction ({satisfaction*100:.0f}%)")
        
        premium = data.get('premium', 70)
        earnings = data.get('weekly_earnings', 5000)
        if premium / earnings > 0.02:
            factors.append(f"⚠️ Premium high relative to earnings ({premium/earnings*100:.1f}%)")
        
        engagement = data.get('app_opens_per_week', 7)
        if engagement < 3:
            factors.append(f"⚠️ Low app engagement ({engagement} opens/week)")
        
        days_inactive = data.get('days_since_last_interaction', 3)
        if days_inactive > 14:
            factors.append(f"⚠️ Inactive for {days_inactive} days")
        
        if factors:
            explanation += "Risk factors:\n" + "\n".join(factors) + "\n\n"
        
        if recommendations:
            explanation += "Recommended actions:\n"
            for i, rec in enumerate(recommendations, 1):
                explanation += f"{i}. {rec.get('message', '')}\n"
        
        return explanation
