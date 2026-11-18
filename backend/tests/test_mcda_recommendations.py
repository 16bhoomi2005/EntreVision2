import pytest
from app.modules.dss import schemas, service

def test_mcda_user1_high_capital_and_land():
    """User 1: Sufficient capital, 5 acres land, all utilities"""
    u1 = schemas.AssessmentInput(
        budget_inr=2000000,
        has_land=True,
        land_acres=5.0,
        location="Katol",
        resources=["RES01", "RES02", "RES06"],
        skills=["SKL01", "SKL08"]
    )
    res = service.evaluate_recommendations(u1)
    assert len(res.recommendations) > 0
    top = res.recommendations[0]
    assert top.status == "Eligible"
    assert top.is_eligible is True
    assert top.suitability_score >= 85
    assert "capital_fit" in top.mcda_breakdown
    assert "infrastructure_fit" in top.mcda_breakdown

def test_mcda_user2_zero_land():
    """User 2: High capital, 0 acres land. No land-dependent business should be eligible in top ranks."""
    u2 = schemas.AssessmentInput(
        budget_inr=2000000,
        has_land=False,
        land_acres=0.0,
        location="Katol",
        resources=["RES06"],
        skills=["SKL08"]
    )
    res = service.evaluate_recommendations(u2)
    assert len(res.recommendations) > 0
    for rec in res.recommendations:
        assert rec.status == "Eligible"
        assert rec.is_eligible is True
        # Land-dependent ventures must NOT be ranked in top eligible
        assert "Cultivation" not in rec.name
        assert "Agri-Tourism" not in rec.name

def test_mcda_user3_low_capital():
    """User 3: Low capital (₹50k), 3 acres land. Heavy CapEx industrial plants must be excluded."""
    u3 = schemas.AssessmentInput(
        budget_inr=50000,
        has_land=True,
        land_acres=3.0,
        location="Katol",
        resources=["RES01", "RES02"],
        skills=["SKL01"]
    )
    res = service.evaluate_recommendations(u3)
    assert len(res.recommendations) > 0
    for rec in res.recommendations:
        assert rec.status == "Eligible"
        # Mega CapEx projects (> ₹1 Crore) must NOT be eligible for ₹50k equity
        assert "Pectin" not in rec.name
        assert "Optical Sorting" not in rec.name
        assert "Frozen Citrus Pulp" not in rec.name


def test_mcda_confidence_removal_and_breakdown_consistency():
    """
    Phase 4 Verification:
    - Artificial confidence percentage (e.g. 91.5%) removed.
    - MCDA factor score breakdown returned consistently:
      feasibility_score, capital_fit, infrastructure_fit, land_fit, skill_fit, market_fit, score_type: "MCDA"
    """
    u = schemas.AssessmentInput(
        budget_inr=500000,
        has_land=True,
        land_acres=2.0,
        location="Katol",
        resources=["RES01", "RES02", "RES06"],
        skills=["SKL01", "SKL08"]
    )
    res = service.evaluate_recommendations(u)
    assert len(res.recommendations) > 0
    top = res.recommendations[0]

    # 1. No fake confidence field
    rec_dict = top.dict()
    assert "ml_viability_confidence" not in rec_dict

    # 2. Consistent MCDA factor breakdown
    breakdown = top.mcda_breakdown
    assert breakdown is not None
    assert "feasibility_score" in breakdown
    assert "capital_fit" in breakdown
    assert "infrastructure_fit" in breakdown
    assert "land_fit" in breakdown
    assert "skill_fit" in breakdown
    assert "market_fit" in breakdown
    assert breakdown["score_type"] == "MCDA"

    # 3. Factor scores normalized to 0-100
    for factor in ["feasibility_score", "capital_fit", "infrastructure_fit", "land_fit", "skill_fit", "market_fit"]:
        val = breakdown[factor]
        assert isinstance(val, (int, float))
        assert 0 <= val <= 100

    # 4. Consistency between top-level score and MCDA feasibility score
    assert top.feasibility_score == top.suitability_score
    assert breakdown["feasibility_score"] == top.suitability_score

