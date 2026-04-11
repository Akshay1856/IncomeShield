#!/usr/bin/env python3
"""
Additional validation tests for specific requirements
"""

import requests
import json

BACKEND_URL = "https://hindsight-income.preview.emergentagent.com/api"

def test_specific_requirements():
    """Test the exact requirements from the review request"""
    print("🔍 Testing Specific Requirements from Review Request...")
    
    # Test 1: Health endpoint should show 5 active agents
    print("\n1. Testing health endpoint for 5 active agents...")
    response = requests.get(f"{BACKEND_URL}/")
    if response.status_code == 200:
        data = response.json()
        agents = data.get("agents", {})
        if len(agents) == 5 and all(status == "active" for status in agents.values()):
            print("✅ PASS: 5 active agents confirmed")
            print(f"   Agents: {list(agents.keys())}")
        else:
            print(f"❌ FAIL: Expected 5 active agents, got {agents}")
    
    # Test 2: Premium prediction with exact sample data
    print("\n2. Testing premium prediction with exact sample data...")
    premium_data = {
        "city": "Mumbai",
        "work_type": "full-time", 
        "platform": "Zomato",
        "claim_frequency": 1.0,
        "avg_earnings": 5000,
        "month": 7
    }
    response = requests.post(f"{BACKEND_URL}/ai/predict/premium", json=premium_data)
    if response.status_code == 200:
        data = response.json()
        premium = data.get("premium")
        explanation = data.get("explanation")
        if 40 <= premium <= 150 and explanation:
            print(f"✅ PASS: Premium ₹{premium} in range (₹40-150), explanation provided")
        else:
            print(f"❌ FAIL: Premium ₹{premium} out of range or missing explanation")
    
    # Test 3: Fraud detection with exact sample data
    print("\n3. Testing fraud detection with exact sample data...")
    fraud_data = {
        "claim_amount": 600,
        "movement_speed": 85,
        "location_consistency": 0.3,
        "trigger_correlation": 0.5
    }
    response = requests.post(f"{BACKEND_URL}/ai/predict/fraud", json=fraud_data)
    if response.status_code == 200:
        data = response.json()
        fraud_prob = data.get("fraud_probability")
        risk_level = data.get("risk_level")
        action = data.get("action")
        if 0 <= fraud_prob <= 1 and action in ["approve", "review", "block"]:
            print(f"✅ PASS: Fraud prob {fraud_prob:.3f}, risk {risk_level}, action {action}")
        else:
            print(f"❌ FAIL: Invalid fraud detection response: {data}")
    
    # Test 4: Statistics should show 8264 experiences
    print("\n4. Testing statistics for 8264 experiences...")
    response = requests.get(f"{BACKEND_URL}/ai/statistics")
    if response.status_code == 200:
        data = response.json()
        total_exp = data.get("total_experiences")
        learning_cycles = data.get("total_learning_cycles")
        if total_exp == 8264:
            print(f"✅ PASS: Exactly 8264 experiences found, {learning_cycles} learning cycles")
        else:
            print(f"❌ FAIL: Expected 8264 experiences, got {total_exp}")
    
    # Test 5: Models should show all 5 agents as trained
    print("\n5. Testing that all models are trained...")
    response = requests.get(f"{BACKEND_URL}/ai/models")
    if response.status_code == 200:
        data = response.json()
        performance = data.get("current_performance", {})
        trained_agents = []
        for agent, metrics in performance.items():
            if isinstance(metrics, dict) and metrics.get("trained", False):
                trained_agents.append(agent)
        
        if len(trained_agents) == 5:
            print(f"✅ PASS: All 5 agents trained: {trained_agents}")
        else:
            print(f"❌ FAIL: Only {len(trained_agents)} agents trained: {trained_agents}")
    
    # Test 6: Verify models directory exists
    print("\n6. Checking models directory...")
    import os
    models_dir = "/app/backend/models"
    if os.path.exists(models_dir):
        model_files = [f for f in os.listdir(models_dir) if f.endswith('.joblib')]
        if len(model_files) == 5:
            print(f"✅ PASS: 5 model files found in {models_dir}")
            print(f"   Files: {model_files}")
        else:
            print(f"❌ FAIL: Expected 5 model files, found {len(model_files)}")
    else:
        print(f"❌ FAIL: Models directory not found: {models_dir}")

if __name__ == "__main__":
    test_specific_requirements()