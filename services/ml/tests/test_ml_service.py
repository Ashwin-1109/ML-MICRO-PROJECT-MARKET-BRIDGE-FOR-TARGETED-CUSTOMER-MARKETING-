"""
MarketBridge AI — Python ML Service Test Suite
Verifies genuine metric calculation, data ingestion, RFM target construction,
K-Means clustering, Models A/B/C, XGBoost, and model registration.
"""

import pytest
from fastapi.testclient import TestClient
import numpy as np
import os
import sys

# Ensure services/ml is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app, generate_default_cohort

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Model_C (TASC-90)" in data["supported_configs"]
    assert "XGBoost" in data["supported_classifiers"]
    assert data["active_production_model"] is not None

def test_raw_transaction_ingestion_and_rfm_targets():
    raw_txs = [
        {"invoice_id": "inv_1", "customer_id": "c1", "invoice_date": "2025-01-10", "quantity": 2, "unit_price": 50.0},
        {"invoice_id": "inv_2", "customer_id": "c1", "invoice_date": "2025-03-15", "quantity": 1, "unit_price": 100.0},
        {"invoice_id": "inv_3", "customer_id": "c2", "invoice_date": "2025-02-01", "quantity": 1, "unit_price": 40.0},
        {"invoice_id": "inv_4", "customer_id": "c3", "invoice_date": "2025-08-20", "quantity": 3, "unit_price": 30.0},
        {"invoice_id": "inv_5", "customer_id": "c1", "invoice_date": "2025-09-01", "quantity": 1, "unit_price": 200.0},
    ]
    response = client.post("/api/ml/ingest", json={"transactions": raw_txs, "churn_window_days": 90})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["customer_count"] >= 2
    assert "feature_vectors" in data
    v = data["feature_vectors"][0]
    assert "recency" in v
    assert "frequency" in v
    assert "monetary" in v
    assert "target_churn_90" in v
    assert v["target_churn_90"] in (0, 1)

def test_train_model_c_xgboost():
    req = {
        "feature_config": "Model_C",
        "classifier": "XGBoost",
        "k_clusters": 4,
        "random_seed": 42,
    }
    response = client.post("/api/ml/train", json=req)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "metrics" in data
    m = data["metrics"]
    assert 0.0 <= m["accuracy"] <= 1.0
    assert 0.0 <= m["pr_auc"] <= 1.0
    assert 0.0 <= m["roc_auc"] <= 1.0
    assert 0.0 <= m["brier_score"] <= 1.0
    assert "confusion_matrix" in m

def test_benchmark_arena_9_models():
    response = client.post("/api/ml/benchmark", json={"k_clusters": 4, "random_seed": 42})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["leaderboard"]) == 9
    champion = data["champion"]
    assert champion is not None
    assert champion["metrics"]["pr_auc"] > 0.0

def test_single_customer_predict():
    payload = {
        "customer_id": "cust_test_001",
        "recency": 75.0,
        "frequency": 2.0,
        "monetary": 350.0,
        "aov": 175.0,
        "tenure": 200.0,
        "purchase_interval_mean": 80.0,
        "category_diversity": 1.0,
    }
    response = client.post("/api/ml/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["customer_id"] == "cust_test_001"
    assert 0 <= data["risk_score"] <= 100
    assert data["risk_band"] in ["Low", "Medium", "High"]
    assert "assigned_cluster" in data

def test_batch_customer_predict():
    payload = {
        "customers": [
            {
                "customer_id": "cust_vip",
                "recency": 5.0,
                "frequency": 12.0,
                "monetary": 3500.0,
                "aov": 291.0,
                "tenure": 320.0,
                "purchase_interval_mean": 25.0,
                "category_diversity": 4.0,
            },
            {
                "customer_id": "cust_at_risk",
                "recency": 85.0,
                "frequency": 2.0,
                "monetary": 280.0,
                "aov": 140.0,
                "tenure": 240.0,
                "purchase_interval_mean": 85.0,
                "category_diversity": 1.0,
            },
        ]
    }
    response = client.post("/api/ml/predict/batch", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["predictions"]) == 2
    # VIP should have lower churn risk score than the dormant customer
    vip_pred = [p for p in data["predictions"] if p["customerId"] == "cust_vip"][0]
    dormant_pred = [p for p in data["predictions"] if p["customerId"] == "cust_at_risk"][0]
    assert vip_pred["riskScore"] < dormant_pred["riskScore"]

def test_kmeans_elbow_diagnostics():
    response = client.post("/api/ml/clusters/elbow")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["optimal_k"] == 4
    assert len(data["curve"]) >= 4

def test_model_registry_and_promote():
    response = client.get("/api/ml/models")
    assert response.status_code == 200
    models = response.json()["models"]
    assert len(models) >= 1
    first_model_id = models[0]["id"]

    promote_resp = client.post(f"/api/ml/models/{first_model_id}/promote", json={"approved_by": "Test Auditor"})
    assert promote_resp.status_code == 200
    assert promote_resp.json()["active_production_model_id"] == first_model_id
