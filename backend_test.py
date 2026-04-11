#!/usr/bin/env python3
"""
IncomeShield AI Agent Platform Backend API Tests
Tests all AI prediction endpoints and system functionality
"""

import requests
import json
import sys
from typing import Dict, Any

# Backend URL from frontend .env
BACKEND_URL = "https://hindsight-income.preview.emergentagent.com/api"

class IncomeShieldAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
    
    def make_request(self, method: str, endpoint: str, data: Dict[str, Any] = None) -> tuple:
        """Make HTTP request and return (success, response_data, error)"""
        try:
            url = f"{self.base_url}{endpoint}"
            
            if method.upper() == "GET":
                response = requests.get(url, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, timeout=30)
            else:
                return False, None, f"Unsupported method: {method}"
            
            if response.status_code == 200:
                return True, response.json(), None
            else:
                return False, None, f"HTTP {response.status_code}: {response.text}"
                
        except requests.exceptions.RequestException as e:
            return False, None, f"Request error: {str(e)}"
        except json.JSONDecodeError as e:
            return False, None, f"JSON decode error: {str(e)}"
        except Exception as e:
            return False, None, f"Unexpected error: {str(e)}"
    
    def test_health_endpoints(self):
        """Test health and info endpoints"""
        print("\n🔍 Testing Health & Info Endpoints...")
        
        # Test root endpoint
        success, data, error = self.make_request("GET", "/")
        if success:
            expected_fields = ["message", "version", "agents"]
            if all(field in data for field in expected_fields):
                if data.get("version") == "2.0.0" and len(data.get("agents", {})) == 5:
                    self.log_test("GET /api/ - Platform info", True, 
                                f"Version: {data['version']}, Agents: {len(data['agents'])}")
                else:
                    self.log_test("GET /api/ - Platform info", False, 
                                f"Unexpected version or agent count: {data}")
            else:
                self.log_test("GET /api/ - Platform info", False, 
                            f"Missing fields: {expected_fields}")
        else:
            self.log_test("GET /api/ - Platform info", False, error)
        
        # Test health endpoint
        success, data, error = self.make_request("GET", "/health")
        if success:
            expected_fields = ["status", "database", "ai_agents"]
            if all(field in data for field in expected_fields):
                if data.get("status") == "healthy":
                    self.log_test("GET /api/health - Health check", True, 
                                f"Status: {data['status']}, DB: {data.get('database')}")
                else:
                    self.log_test("GET /api/health - Health check", False, 
                                f"Unhealthy status: {data}")
            else:
                self.log_test("GET /api/health - Health check", False, 
                            f"Missing fields: {expected_fields}")
        else:
            self.log_test("GET /api/health - Health check", False, error)
    
    def test_ai_prediction_endpoints(self):
        """Test all AI prediction endpoints with sample data"""
        print("\n🤖 Testing AI Prediction Endpoints...")
        
        # Test premium prediction
        premium_data = {
            "city": "Mumbai",
            "work_type": "full-time",
            "platform": "Zomato",
            "claim_frequency": 1.0,
            "avg_earnings": 5000,
            "month": 7
        }
        
        success, data, error = self.make_request("POST", "/ai/predict/premium", premium_data)
        if success:
            if "premium" in data and "explanation" in data:
                premium = data["premium"]
                if isinstance(premium, (int, float)) and 40 <= premium <= 150:
                    self.log_test("POST /ai/predict/premium", True, 
                                f"Premium: ₹{premium}, Explanation provided")
                else:
                    self.log_test("POST /ai/predict/premium", False, 
                                f"Premium out of range (₹40-150): ₹{premium}")
            else:
                self.log_test("POST /ai/predict/premium", False, 
                            f"Missing premium or explanation: {data}")
        else:
            self.log_test("POST /ai/predict/premium", False, error)
        
        # Test fraud detection
        fraud_data = {
            "claim_amount": 600,
            "movement_speed": 85,
            "location_consistency": 0.3,
            "trigger_correlation": 0.5
        }
        
        success, data, error = self.make_request("POST", "/ai/predict/fraud", fraud_data)
        if success:
            required_fields = ["fraud_probability", "risk_level", "action", "explanation"]
            if all(field in data for field in required_fields):
                fraud_prob = data["fraud_probability"]
                if isinstance(fraud_prob, (int, float)) and 0 <= fraud_prob <= 1:
                    action = data["action"]
                    if action in ["approve", "review", "block"]:
                        self.log_test("POST /ai/predict/fraud", True, 
                                    f"Fraud prob: {fraud_prob:.3f}, Action: {action}")
                    else:
                        self.log_test("POST /ai/predict/fraud", False, 
                                    f"Invalid action: {action}")
                else:
                    self.log_test("POST /ai/predict/fraud", False, 
                                f"Invalid fraud probability: {fraud_prob}")
            else:
                self.log_test("POST /ai/predict/fraud", False, 
                            f"Missing fields: {required_fields}")
        else:
            self.log_test("POST /ai/predict/fraud", False, error)
        
        # Test payout optimization
        payout_data = {
            "lost_hours": 4,
            "city": "Delhi",
            "avg_hourly_earnings": 180,
            "demand_zone": "high"
        }
        
        success, data, error = self.make_request("POST", "/ai/predict/payout", payout_data)
        if success:
            if "payout" in data and "explanation" in data:
                payout = data["payout"]
                if isinstance(payout, (int, float)) and payout > 0:
                    self.log_test("POST /ai/predict/payout", True, 
                                f"Payout: ₹{payout}, Explanation provided")
                else:
                    self.log_test("POST /ai/predict/payout", False, 
                                f"Invalid payout amount: {payout}")
            else:
                self.log_test("POST /ai/predict/payout", False, 
                            f"Missing payout or explanation: {data}")
        else:
            self.log_test("POST /ai/predict/payout", False, error)
        
        # Test trigger threshold optimization
        trigger_data = {
            "trigger_type": "rainfall",
            "city": "Mumbai",
            "current_threshold": 40
        }
        
        success, data, error = self.make_request("POST", "/ai/predict/trigger-threshold", trigger_data)
        if success:
            if "optimal_threshold" in data and "explanation" in data:
                threshold = data["optimal_threshold"]
                if isinstance(threshold, (int, float)) and threshold > 0:
                    self.log_test("POST /ai/predict/trigger-threshold", True, 
                                f"Optimal threshold: {threshold}, Explanation provided")
                else:
                    self.log_test("POST /ai/predict/trigger-threshold", False, 
                                f"Invalid threshold: {threshold}")
            else:
                self.log_test("POST /ai/predict/trigger-threshold", False, 
                            f"Missing optimal_threshold or explanation: {data}")
        else:
            self.log_test("POST /ai/predict/trigger-threshold", False, error)
        
        # Test retention prediction
        retention_data = {
            "tenure_weeks": 12,
            "claim_satisfaction": 0.6,
            "premium": 80,
            "weekly_earnings": 5000
        }
        
        success, data, error = self.make_request("POST", "/ai/predict/retention", retention_data)
        if success:
            if "churn_probability" in data and "explanation" in data:
                churn_prob = data["churn_probability"]
                if isinstance(churn_prob, (int, float)) and 0 <= churn_prob <= 1:
                    recommendations = data.get("recommendations", [])
                    self.log_test("POST /ai/predict/retention", True, 
                                f"Churn prob: {churn_prob:.3f}, Recommendations: {len(recommendations)}")
                else:
                    self.log_test("POST /ai/predict/retention", False, 
                                f"Invalid churn probability: {churn_prob}")
            else:
                self.log_test("POST /ai/predict/retention", False, 
                            f"Missing churn_probability or explanation: {data}")
        else:
            self.log_test("POST /ai/predict/retention", False, error)
    
    def test_ai_system_endpoints(self):
        """Test AI system information endpoints"""
        print("\n📊 Testing AI System Endpoints...")
        
        # Test statistics endpoint
        success, data, error = self.make_request("GET", "/ai/statistics")
        if success:
            expected_fields = ["total_experiences", "total_learning_cycles"]
            if all(field in data for field in expected_fields):
                total_exp = data["total_experiences"]
                if isinstance(total_exp, int) and total_exp > 0:
                    self.log_test("GET /ai/statistics", True, 
                                f"Total experiences: {total_exp}, Learning cycles: {data.get('total_learning_cycles', 0)}")
                else:
                    self.log_test("GET /ai/statistics", False, 
                                f"Invalid experience count: {total_exp}")
            else:
                self.log_test("GET /ai/statistics", False, 
                            f"Missing fields: {expected_fields}")
        else:
            self.log_test("GET /ai/statistics", False, error)
        
        # Test models endpoint
        success, data, error = self.make_request("GET", "/ai/models")
        if success:
            if "current_performance" in data:
                performance = data["current_performance"]
                expected_agents = ["risk_pricing", "fraud_detection", "payout_optimization", 
                                 "trigger_optimization", "retention_engagement"]
                
                if all(agent in performance for agent in expected_agents):
                    # Check if models are trained (not returning default values)
                    trained_count = 0
                    for agent, metrics in performance.items():
                        if isinstance(metrics, dict) and metrics.get("trained", False):
                            trained_count += 1
                    
                    self.log_test("GET /ai/models", True, 
                                f"All 5 agents present, {trained_count} trained")
                else:
                    self.log_test("GET /ai/models", False, 
                                f"Missing agents in performance data")
            else:
                self.log_test("GET /ai/models", False, 
                            f"Missing current_performance: {data}")
        else:
            self.log_test("GET /ai/models", False, error)
        
        # Test learning history endpoint
        success, data, error = self.make_request("GET", "/ai/learning-history?limit=5")
        if success:
            if "learning_history" in data:
                history = data["learning_history"]
                if isinstance(history, list):
                    self.log_test("GET /ai/learning-history", True, 
                                f"Learning history retrieved: {len(history)} cycles")
                else:
                    self.log_test("GET /ai/learning-history", False, 
                                f"Invalid learning history format: {type(history)}")
            else:
                self.log_test("GET /ai/learning-history", False, 
                            f"Missing learning_history: {data}")
        else:
            self.log_test("GET /ai/learning-history", False, error)
    
    def test_model_validation(self):
        """Test that models are properly loaded and not returning fallback values"""
        print("\n🔬 Testing Model Validation...")
        
        # Test multiple predictions to ensure models are working
        test_cases = [
            {
                "endpoint": "/ai/predict/premium",
                "data": {"city": "Mumbai", "work_type": "full-time", "platform": "Zomato", 
                        "claim_frequency": 1.0, "avg_earnings": 5000, "month": 7}
            },
            {
                "endpoint": "/ai/predict/premium", 
                "data": {"city": "Delhi", "work_type": "part-time", "platform": "Swiggy", 
                        "claim_frequency": 0.5, "avg_earnings": 3000, "month": 12}
            }
        ]
        
        predictions = []
        for i, test_case in enumerate(test_cases):
            success, data, error = self.make_request("POST", test_case["endpoint"], test_case["data"])
            if success and "premium" in data:
                predictions.append(data["premium"])
            else:
                self.log_test(f"Model validation test {i+1}", False, 
                            f"Failed to get prediction: {error}")
                return
        
        # Check if predictions are different (indicating real model, not hardcoded values)
        if len(set(predictions)) > 1:
            self.log_test("Model validation - Different predictions", True, 
                        f"Predictions vary: {predictions}")
        else:
            self.log_test("Model validation - Different predictions", False, 
                        f"All predictions identical (possible fallback): {predictions}")
    
    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting IncomeShield AI Agent Platform Backend Tests")
        print(f"🔗 Testing against: {self.base_url}")
        
        self.test_health_endpoints()
        self.test_ai_prediction_endpoints()
        self.test_ai_system_endpoints()
        self.test_model_validation()
        
        # Summary
        print("\n" + "="*60)
        print("📋 TEST SUMMARY")
        print("="*60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"✅ Passed: {passed}/{total}")
        print(f"❌ Failed: {total - passed}/{total}")
        
        if total - passed > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   ❌ {result['test']}: {result['details']}")
        
        print(f"\n🎯 Success Rate: {(passed/total)*100:.1f}%")
        
        return passed == total

if __name__ == "__main__":
    tester = IncomeShieldAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)