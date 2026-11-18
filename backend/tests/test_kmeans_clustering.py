"""
Unit Tests for Phase 7 K-Means Clustering Integration
======================================================
Verifies:
1. Step 1: Identification of 5 clustering features (Capital, Land, Skills, Infrastructure, Resources).
2. Step 2: Normalization using StandardScaler (zero mean, unit variance).
3. Step 3: Evaluation of K-Means across k=2, 3, 4 (inertia & silhouette score).
4. Step 4 & 5: Centroid inspection and descriptive persona naming.
5. Step 6: Integration of K-Means persona into recommendation engine and user_summary.
"""
import pytest
import numpy as np
from app.modules.dss.ml_engine import ml_engine, CLUSTERING_FEATURES
from app.modules.dss.service import evaluate_recommendations
from app.modules.dss.schemas import AssessmentInput


def test_clustering_features_identification():
    """Step 1: Check that clustering features cover Capital, Land, Skills, Infrastructure, Resources."""
    assert len(CLUSTERING_FEATURES) == 5
    assert "capital_lakhs" in CLUSTERING_FEATURES
    assert "land_acres" in CLUSTERING_FEATURES
    assert "skills_score" in CLUSTERING_FEATURES
    assert "infrastructure_score" in CLUSTERING_FEATURES
    assert "equipment_offset_lakhs" in CLUSTERING_FEATURES


def test_standard_scaler_normalization():
    """Step 2: Normalization via StandardScaler."""
    assert ml_engine.clustering_scaler is not None
    # Scaler mean must have 5 dimensions
    assert len(ml_engine.clustering_scaler.mean_) == 5
    # Scaler scale must have positive values
    assert all(ml_engine.clustering_scaler.scale_ > 0)


def test_kmeans_evaluation_k_comparisons():
    """Step 3: Train K-Means and test cluster counts (k=2, 3, 4)."""
    eval_data = ml_engine.kmeans_evaluation
    assert "k_comparisons" in eval_data
    assert len(eval_data["k_comparisons"]) >= 3

    k_values = [item["k"] for item in eval_data["k_comparisons"]]
    assert 2 in k_values
    assert 3 in k_values
    assert 4 in k_values

    # Check that inertia decreases as k increases
    inertias = [item["inertia"] for item in eval_data["k_comparisons"]]
    for i in range(len(inertias) - 1):
        assert inertias[i] > inertias[i + 1]

    # Check silhouette score exists and is positive
    assert eval_data["silhouette_score_k4"] > 0.35


def test_cluster_centroids_and_persona_names():
    """Step 4 & 5: Inspect cluster centroids and verify descriptive persona names."""
    profiles = ml_engine.cluster_profiles
    assert len(profiles) == 4

    persona_names = [p["persona_name"] for p in profiles]
    # Verify that descriptive persona names are assigned, not generic cluster numbers
    assert any("Orchard" in name for name in persona_names)
    assert any("Micro Artisan" in name or "SHG" in name for name in persona_names)
    assert any("Cold-Chain" in name or "Industrial" in name for name in persona_names)
    assert any("Tech-Forward" in name or "Agro-Entrepreneur" in name for name in persona_names)

    # Verify each profile has centroid metrics
    for p in profiles:
        assert "centroid" in p
        cent = p["centroid"]
        assert "avg_capital_lakhs" in cent
        assert "avg_land_acres" in cent
        assert "avg_skills_score" in cent
        assert "avg_equipment_lakhs" in cent
        assert len(p["recommended_sectors"]) > 0


def test_predict_user_cluster_various_personas():
    """Step 6: Assign different user profiles to their matching empirical clusters."""
    # 1. Micro artisan (₹2.5 Lakhs, 0 land, no heavy equipment)
    micro_user = {
        "capital_inr": 250000,
        "land_acres": 0.0,
        "experience_years": 2.0,
        "has_workspace": False,
        "equipment_offset_lakhs": 0.0
    }
    micro_res = ml_engine.predict_user_cluster(micro_user)
    assert "Micro" in micro_res["persona_name"] or "Artisan" in micro_res["persona_name"] or "SHG" in micro_res["persona_name"]
    assert micro_res["cluster_id"] in [1, 2, 3, 4]

    # 2. Large orchard landowner (15 acres land, owned tractor)
    orchard_user = {
        "capital_inr": 2200000,
        "land_acres": 15.0,
        "experience_years": 8.0,
        "has_workspace": True,
        "equipment_offset_lakhs": 7.0
    }
    orchard_res = ml_engine.predict_user_cluster(orchard_user)
    assert "Orchard" in orchard_res["persona_name"] or "Cultivator" in orchard_res["persona_name"]

    # 3. Capitalized commercial investor (₹75 Lakhs, transport fleet)
    investor_user = {
        "capital_inr": 7500000,
        "land_acres": 8.0,
        "experience_years": 10.0,
        "has_workspace": True,
        "equipment_offset_lakhs": 16.0
    }
    investor_res = ml_engine.predict_user_cluster(investor_user)
    assert "Commercial" in investor_res["persona_name"] or "Industrial" in investor_res["persona_name"]


def test_kmeans_integrated_into_recommendations():
    """Step 6: Verify K-Means is integrated into evaluate_recommendations."""
    user_input = AssessmentInput(
        budget_inr=500000.0,
        has_land=True,
        land_acres=4.0,
        has_workspace=True,
        skills=["SKL01"],
        resources=["RES01", "RES02"],
        location="Katol",
        funding_preference="Bank Loan with Government Subsidy"
    )

    response = evaluate_recommendations(user_input)

    # Check user_summary contains assigned persona
    summary = response.user_summary
    assert "assigned_persona" in summary
    assert "cluster_id" in summary
    assert "persona_description" in summary
    assert "primary_policy_leverage" in summary
    assert "cluster_centroid_distance" in summary

    # Check recommendations carry cluster persona
    assert len(response.recommendations) > 0
    top_rec = response.recommendations[0]
    assert top_rec.cluster_persona is not None
    assert isinstance(top_rec.cluster_match, bool)
