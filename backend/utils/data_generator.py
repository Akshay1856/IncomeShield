"""
Generate 6 months of realistic historical data for training AI agents
Creates users, policies, claims, triggers, and experiences
"""
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any
import uuid


class HistoricalDataGenerator:
    """Generates realistic historical data for AI training"""
    
    def __init__(self):
        self.cities = [
            'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai',
            'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat'
        ]
        
        self.first_names = [
            'Rahul', 'Priya', 'Amit', 'Sneha', 'Vijay', 'Anjali', 'Rajesh', 'Pooja',
            'Arun', 'Divya', 'Suresh', 'Kavita', 'Manoj', 'Nisha', 'Ravi', 'Swati'
        ]
        
        self.last_names = [
            'Sharma', 'Patel', 'Kumar', 'Singh', 'Reddy', 'Nair', 'Joshi', 'Gupta',
            'Iyer', 'Desai', 'Mehta', 'Agarwal', 'Rao', 'Verma', 'Shah', 'Khan'
        ]
        
        self.base_date = datetime.utcnow() - timedelta(days=180)  # 6 months ago
    
    def generate_users(self, count: int = 500) -> List[Dict[str, Any]]:
        """Generate user profiles"""
        users = []
        
        for i in range(count):
            join_date = self.base_date + timedelta(days=random.randint(0, 150))
            
            user = {
                'user_id': f'USR_{str(uuid.uuid4())[:8]}',
                'name': f"{random.choice(self.first_names)} {random.choice(self.last_names)}",
                'email': f'user{i}@example.com',
                'phone': f'+91{random.randint(7000000000, 9999999999)}',
                'city': random.choice(self.cities),
                'work_type': random.choice(['full-time', 'full-time', 'full-time', 'part-time']),  # 75% full-time
                'platform': random.choice(['Zomato', 'Swiggy', 'Both']),
                'avg_daily_earnings': random.randint(400, 800),
                'preferred_hours': random.choice(['9 AM - 9 PM', '10 AM - 10 PM', '11 AM - 11 PM']),
                'joined_date': join_date,
                'is_active': True,
                'created_at': join_date
            }
            
            users.append(user)
        
        return users
    
    def generate_policies(self, users: List[Dict], weeks: int = 24) -> List[Dict[str, Any]]:
        """Generate weekly policies for users"""
        policies = []
        
        for user in users:
            user_start = user['joined_date']
            weeks_active = min(weeks, int((datetime.utcnow() - user_start).days / 7))
            
            # Some users churn
            churn_probability = 0.15
            churned = False
            churn_week = random.randint(4, weeks_active) if random.random() < churn_probability else None
            
            for week_num in range(weeks_active):
                if churned:
                    break
                
                if churn_week and week_num >= churn_week:
                    churned = True
                    user['is_active'] = False
                    break
                
                week_start = user_start + timedelta(weeks=week_num)
                week_end = week_start + timedelta(days=6)
                
                # Calculate premium (varies by city, work type)
                base_premium = 50
                city_multiplier = {
                    'Mumbai': 1.6, 'Delhi': 1.5, 'Chennai': 1.4, 'Kolkata': 1.4,
                    'Bengaluru': 1.2, 'Hyderabad': 1.15, 'Pune': 1.15,
                    'Ahmedabad': 1.3, 'Jaipur': 1.25, 'Surat': 1.35
                }.get(user['city'], 1.2)
                
                work_multiplier = 1.0 if user['work_type'] == 'full-time' else 0.7
                
                # Add some variation
                premium = round(base_premium * city_multiplier * work_multiplier * random.uniform(0.9, 1.1), 2)
                
                policy = {
                    'policy_id': f'POL_{week_start.strftime("%Y%m%d")}_{user["user_id"][-6:]}',
                    'user_id': user['user_id'],
                    'week_start': week_start,
                    'week_end': week_end,
                    'status': 'expired' if week_end < datetime.utcnow() else 'active',
                    'premium': premium,
                    'coverage_amount': 2500,
                    'city': user['city'],
                    'work_type': user['work_type'],
                    'platform': user['platform'],
                    'created_at': week_start
                }
                
                policies.append(policy)
        
        return policies
    
    def generate_weather_events(self, days: int = 180) -> List[Dict[str, Any]]:
        """Generate weather/trigger events"""
        events = []
        
        for day in range(days):
            date = self.base_date + timedelta(days=day)
            
            # Random events (some days have multiple events in different cities)
            num_events = random.choices([0, 0, 0, 1, 1, 2], weights=[40, 30, 20, 6, 3, 1])[0]
            
            for _ in range(num_events):
                event_type = random.choices(
                    ['rainfall', 'heatwave', 'aqi', 'platform_downtime'],
                    weights=[40, 30, 25, 5]
                )[0]
                
                city = random.choice(self.cities)
                
                # Generate realistic values
                if event_type == 'rainfall':
                    value = random.randint(35, 85)
                    threshold = 40
                    unit = 'mm/hr'
                elif event_type == 'heatwave':
                    value = random.randint(41, 49)
                    threshold = 43
                    unit = '°C'
                elif event_type == 'aqi':
                    value = random.randint(280, 480)
                    threshold = 300
                    unit = 'AQI'
                else:  # platform_downtime
                    value = random.randint(60, 180)
                    threshold = 60
                    unit = 'minutes'
                    city = 'Pan India'
                
                triggered = value >= threshold
                
                event = {
                    'event_id': f'EVT_{str(uuid.uuid4())[:8]}',
                    'type': event_type,
                    'value': value,
                    'threshold': threshold,
                    'unit': unit,
                    'city': city,
                    'triggered': triggered,
                    'timestamp': date + timedelta(hours=random.randint(8, 20)),
                    'duration_minutes': random.randint(60, 240) if triggered else 0,
                    'severity': (value - threshold) / threshold if triggered else 0
                }
                
                events.append(event)
        
        return events
    
    def generate_claims(
        self,
        policies: List[Dict],
        weather_events: List[Dict],
        users: List[Dict]
    ) -> List[Dict[str, Any]]:
        """Generate claims based on triggers and policies"""
        claims = []
        user_map = {u['user_id']: u for u in users}
        
        # Group policies by week
        for event in weather_events:
            if not event['triggered']:
                continue
            
            event_date = event['timestamp']
            event_city = event['city']
            
            # Find policies active during this event
            affected_policies = [
                p for p in policies
                if p['week_start'] <= event_date <= p['week_end']
                and (event_city == 'Pan India' or p['city'] == event_city)
            ]
            
            # Not all affected users will claim
            claim_rate = 0.4 if event['severity'] > 0.5 else 0.25
            policies_claiming = random.sample(
                affected_policies,
                k=min(len(affected_policies), int(len(affected_policies) * claim_rate))
            )
            
            for policy in policies_claiming:
                user = user_map.get(policy['user_id'])
                if not user:
                    continue
                
                # Calculate lost hours and payout
                lost_hours = random.randint(2, 6)
                avg_hourly_earnings = user['avg_daily_earnings'] / 12
                
                # Payout is roughly 75-85% of estimated loss
                estimated_loss = lost_hours * avg_hourly_earnings
                payout_percentage = random.uniform(0.75, 0.85)
                payout = round(estimated_loss * payout_percentage, 2)
                
                # Cap payout
                payout = min(payout, policy['coverage_amount'])
                payout = max(payout, 100)  # Minimum payout
                
                # Some claims are fraudulent
                is_fraud = random.random() < 0.03  # 3% fraud rate
                
                # Fraud detection (catches some fraud, misses some)
                if is_fraud:
                    detected_fraud = random.random() < 0.65  # 65% detection rate
                else:
                    detected_fraud = random.random() < 0.02  # 2% false positive rate
                
                status = 'flagged' if detected_fraud else random.choices(
                    ['paid', 'paid', 'paid', 'approved', 'pending'],
                    weights=[60, 20, 10, 7, 3]
                )[0]
                
                # User satisfaction
                if status == 'paid':
                    satisfaction_base = 0.8
                    if payout >= estimated_loss * 0.8:
                        satisfaction = random.uniform(0.8, 1.0)
                    elif payout >= estimated_loss * 0.6:
                        satisfaction = random.uniform(0.6, 0.8)
                    else:
                        satisfaction = random.uniform(0.4, 0.6)
                else:
                    satisfaction = random.uniform(0.3, 0.6)
                
                claim = {
                    'claim_id': f'CLM_{str(uuid.uuid4())[:8]}',
                    'user_id': policy['user_id'],
                    'policy_id': policy['policy_id'],
                    'trigger_event_id': event['event_id'],
                    'trigger_type': event['type'],
                    'trigger_value': f"{event['value']} {event['unit']}",
                    'lost_hours': lost_hours,
                    'estimated_loss': round(estimated_loss, 2),
                    'payout_amount': payout if status == 'paid' else 0,
                    'status': status,
                    'is_fraud': is_fraud,
                    'fraud_detected': detected_fraud,
                    'user_satisfaction': round(satisfaction, 2),
                    'timestamp': event_date + timedelta(minutes=random.randint(30, 120)),
                    'processed_at': event_date + timedelta(hours=random.randint(1, 4)) if status == 'paid' else None,
                    'city': policy['city'],
                    'created_at': event_date
                }
                
                claims.append(claim)
        
        return claims
    
    def generate_experiences(
        self,
        users: List[Dict],
        policies: List[Dict],
        claims: List[Dict],
        weather_events: List[Dict]
    ) -> Dict[str, List[Dict]]:
        """Generate experience data for each AI agent"""
        experiences = {
            'risk_pricing': [],
            'fraud_detection': [],
            'payout_optimization': [],
            'trigger_optimization': [],
            'retention': []
        }
        
        user_map = {u['user_id']: u for u in users}
        
        # Risk Pricing Experiences
        user_policies = {}
        for policy in policies:
            uid = policy['user_id']
            if uid not in user_policies:
                user_policies[uid] = []
            user_policies[uid].append(policy)
        
        for user_id, user_pols in user_policies.items():
            user = user_map.get(user_id)
            if not user:
                continue
            
            user_claims = [c for c in claims if c['user_id'] == user_id]
            
            # Calculate statistics
            total_premium = sum(p['premium'] for p in user_pols)
            total_payout = sum(c['payout_amount'] for c in user_claims if c['status'] == 'paid')
            claim_frequency = len(user_claims) / max(len(user_pols), 1)
            
            churned = not user['is_active']
            
            for i, policy in enumerate(user_pols):
                month = policy['week_start'].month
                
                exp = {
                    'agent_type': 'risk_pricing',
                    'input_data': {
                        'city': policy['city'],
                        'weather_risk': random.uniform(0.3, 0.9),
                        'claim_frequency': claim_frequency,
                        'avg_earnings': user['avg_daily_earnings'] * 7,
                        'month': month,
                        'work_type': policy['work_type'],
                        'platform': policy['platform'],
                        'churn_risk': 0.3 if i < len(user_pols) / 2 else 0.5
                    },
                    'outcome': {
                        'actual_premium': policy['premium'],
                        'churned': churned and i == len(user_pols) - 1,
                        'total_payout': total_payout / max(len(user_pols), 1)
                    },
                    'timestamp': policy['week_start']
                }
                experiences['risk_pricing'].append(exp)
        
        # Fraud Detection Experiences
        for claim in claims:
            user = user_map.get(claim['user_id'])
            if not user:
                continue
            
            user_claims_count = len([c for c in claims if c['user_id'] == claim['user_id']])
            
            exp = {
                'agent_type': 'fraud_detection',
                'input_data': {
                    'claim_amount': claim['payout_amount'],
                    'time_since_last_claim': random.uniform(24, 336),  # hours
                    'location_consistency': random.uniform(0.5, 1.0) if not claim['is_fraud'] else random.uniform(0.1, 0.6),
                    'claim_frequency': user_claims_count / 6,  # per month
                    'movement_speed': random.uniform(15, 35) if not claim['is_fraud'] else random.uniform(50, 120),
                    'trigger_correlation': random.uniform(0.8, 1.0) if not claim['is_fraud'] else random.uniform(0.3, 0.7),
                    'claim_hour': claim['timestamp'].hour,
                    'account_age_days': (claim['timestamp'] - user['joined_date']).days,
                    'pattern_similarity': random.uniform(0.0, 0.2) if not claim['is_fraud'] else random.uniform(0.4, 0.9),
                    'gps_accuracy': random.uniform(5, 15) if not claim['is_fraud'] else random.uniform(20, 80),
                    'duplicate_score': random.uniform(0.0, 0.1) if not claim['is_fraud'] else random.uniform(0.3, 0.8)
                },
                'outcome': {
                    'was_fraud': claim['is_fraud'],
                    'detected': claim['fraud_detected']
                },
                'timestamp': claim['timestamp']
            }
            experiences['fraud_detection'].append(exp)
        
        # Payout Optimization Experiences
        for claim in claims:
            user = user_map.get(claim['user_id'])
            if not user:
                continue
            
            exp = {
                'agent_type': 'payout_optimization',
                'input_data': {
                    'lost_hours': claim['lost_hours'],
                    'hour': claim['timestamp'].hour,
                    'day_of_week': claim['timestamp'].weekday(),
                    'avg_hourly_earnings': user['avg_daily_earnings'] / 12,
                    'demand_zone': random.choice(['high', 'medium', 'low']),
                    'trigger_severity': random.uniform(0.3, 1.0),
                    'city': claim['city'],
                    'platform': user['platform'],
                    'work_type': user['work_type'],
                    'month': claim['timestamp'].month
                },
                'outcome': {
                    'actual_payout': claim['payout_amount'],
                    'actual_loss': claim['estimated_loss'],
                    'user_satisfaction': claim['user_satisfaction']
                },
                'timestamp': claim['timestamp']
            }
            experiences['payout_optimization'].append(exp)
        
        # Trigger Optimization Experiences
        for event in weather_events:
            # Create experiences for trigger evaluation
            exp = {
                'agent_type': 'trigger_optimization',
                'input_data': {
                    'city': event['city'] if event['city'] != 'Pan India' else random.choice(self.cities),
                    'historical_disruption_freq': random.uniform(0.3, 0.8),
                    'month': event['timestamp'].month,
                    'trigger_type': event['type'],
                    'current_threshold': event['threshold'],
                    'false_positive_rate': random.uniform(0.05, 0.2),
                    'false_negative_rate': random.uniform(0.05, 0.2),
                    'avg_actual_value_at_disruption': event['value'] if event['triggered'] else random.uniform(30, event['threshold'])
                },
                'outcome': {
                    'current_threshold': event['threshold'],
                    'triggered': event['triggered'],
                    'actual_disruption': event['triggered'] and random.random() < 0.85,  # Some false triggers
                    'actual_value': event['value']
                },
                'timestamp': event['timestamp']
            }
            experiences['trigger_optimization'].append(exp)
        
        # Retention Experiences
        for user_id, user_pols in user_policies.items():
            user = user_map.get(user_id)
            if not user:
                continue
            
            user_claims = [c for c in claims if c['user_id'] == user_id]
            paid_claims = [c for c in user_claims if c['status'] == 'paid']
            
            total_premium = sum(p['premium'] for p in user_pols)
            total_payout = sum(c['payout_amount'] for c in paid_claims)
            
            avg_satisfaction = np.mean([c['user_satisfaction'] for c in user_claims]) if user_claims else 0.7
            
            exp = {
                'agent_type': 'retention',
                'input_data': {
                    'tenure_weeks': len(user_pols),
                    'claim_satisfaction': avg_satisfaction,
                    'premium': total_premium / max(len(user_pols), 1),
                    'weekly_earnings': user['avg_daily_earnings'] * 7,
                    'claim_frequency': len(user_claims) / max(len(user_pols), 1),
                    'claims_approved_ratio': len(paid_claims) / max(len(user_claims), 1) if user_claims else 1.0,
                    'app_opens_per_week': random.randint(3, 15),
                    'days_since_last_interaction': random.randint(0, 30),
                    'total_payout_received': total_payout,
                    'total_premium_paid': total_premium,
                    'support_interactions': random.randint(0, 3),
                    'renewal_streak': len(user_pols),
                    'referrals': random.randint(0, 2)
                },
                'outcome': {
                    'churned': not user['is_active']
                },
                'timestamp': user_pols[-1]['week_end'] if user_pols else user['joined_date']
            }
            experiences['retention'].append(exp)
        
        return experiences
    
    def generate_all(self) -> Dict[str, Any]:
        """Generate complete historical dataset"""
        print("🔄 Generating historical data...")
        
        print("  - Generating 500 users...")
        users = self.generate_users(500)
        
        print("  - Generating 24 weeks of policies...")
        policies = self.generate_policies(users, weeks=24)
        
        print("  - Generating 180 days of weather events...")
        weather_events = self.generate_weather_events(days=180)
        
        print("  - Generating claims based on triggers...")
        claims = self.generate_claims(policies, weather_events, users)
        
        print("  - Generating AI training experiences...")
        experiences = self.generate_experiences(users, policies, claims, weather_events)
        
        print("✅ Historical data generation complete!")
        print(f"   Users: {len(users)}")
        print(f"   Policies: {len(policies)}")
        print(f"   Weather Events: {len(weather_events)}")
        print(f"   Claims: {len(claims)}")
        print(f"   Experiences: {sum(len(v) for v in experiences.values())}")
        
        return {
            'users': users,
            'policies': policies,
            'weather_events': weather_events,
            'claims': claims,
            'experiences': experiences
        }


# Utility for numpy usage
import numpy as np
