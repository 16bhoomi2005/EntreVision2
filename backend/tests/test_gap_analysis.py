import pytest
from app.modules.dss.service import (
    BUSINESS_REQUIREMENT_PROFILES,
    build_readiness_report,
    evaluate_recommendations,
)
from app.modules.dss.schemas import AssessmentInput, FinancialBreakdown


def test_business_requirement_profiles_structure():
    """Verify that requirement profiles are defined with mandatory operational dimensions."""
    assert len(BUSINESS_REQUIREMENT_PROFILES) >= 15
    for b_id, prof in BUSINESS_REQUIREMENT_PROFILES.items():
        assert "min_equity_ratio" in prof
        assert "requires_land" in prof
        assert "requires_water" in prof
        assert "electricity_type" in prof
        assert "training" in prof


def test_readiness_report_all_five_sections():
    """Verify that build_readiness_report produces all 5 required readiness sections."""
    user_input = AssessmentInput(
        budget=500000.0,
        land_acres=0.0,
        has_land=False,
        has_water=False,
        has_power=True,
        has_three_phase=False,
        skills=["Agro-Trading"],
        resources=[],
        location="Katol",
    )

    class DummyOpp:
        id = 12
        name = "Not-From-Concentrate (NFC) Cold-Pressed Fresh Orange Juice"
        category = "Food Processing"

    fin_breakdown = FinancialBreakdown(
        total_project_cost=2000000.0,
        fixed_capital_investment=1800000.0,
        working_capital_loan=150000.0,
        farmer_equity_required=400000.0,
        subsidy_amount=700000.0,
        bank_loan_required=900000.0,
        subsidy_percentage="35%",
        user_budget=300000.0,
        funding_gap=100000.0,
        budget_status="Moderate Shortfall",
        eligible_scheme="PMFME",
        project_cost_breakdown={
            "plant_and_machinery": 1200000.0,
            "civil_works_and_shed": 350000.0,
            "electrification": 150000.0,
            "installation_and_contingency": 100000.0,
            "working_capital_margin": 50000.0,
        },
        working_capital_details={
            "operating_cycle_days": 42.0,
            "daily_opex": 12000.0,
            "total_working_capital_required": 200000.0,
            "bank_finance_cc_limit": 150000.0,
            "promoter_margin_amount": 50000.0,
        },
    )

    req_profile = BUSINESS_REQUIREMENT_PROFILES.get(12)
    bench = {"training": req_profile["training"]}
    top_scheme = {"nodal_agency": "MoFPI", "scheme_name": "PMFME"}

    rep = build_readiness_report(
        user_input=user_input,
        opp=DummyOpp(),
        actual_capex=2000000.0,
        user_budget=300000.0,  # Below required equity 400000 -> 100000 gap
        fin_breakdown=fin_breakdown,
        req_profile=req_profile,
        bench=bench,
        top_scheme=top_scheme,
        user_location="Katol",
        skills_map={"SKL08": "Citrus Juice Extraction"},
        resources_map={},
        matched_skl_ids=[],
        missing_skl_ids=["SKL08"],
        matched_res_ids=[],
        missing_res_ids=[],
        is_eligible=True,
        status_str="Acquirable Gaps Present",
        mandatory_reasons=[],
        acquirable_gaps=["Needs 3-Phase Power"],
        gap_items=[],
        mcda_breakdown={"capital_fit": 75, "feasibility_score": 78},
        land_acres=0.0,
        has_land=False,
        has_water=False,
        has_power=True,
        has_three_phase=False,
        has_workspace=False,
        has_fssai=False,
        has_udyam=False,
        has_712=False,
        owned_tractor=False,
        owned_truck=False,
        willingness="willing_to_learn",
        s_edu=0.8,
        s_situation=0.8,
        skill_fit=60,
        capital_fit=75,
    )

    # Step 5 verification: 5 required sections must exist
    assert "what_user_has" in rep, "Missing what_user_has section"
    assert "what_user_lacks" in rep, "Missing what_user_lacks section"
    assert "what_can_be_arranged" in rep, "Missing what_can_be_arranged section"
    assert "estimated_additional_investment" in rep, "Missing estimated_additional_investment section"
    assert "recommended_next_steps" in rep, "Missing recommended_next_steps section"

    # Section 1: What the user has
    what_has = rep["what_user_has"]
    assert len(what_has) >= 1
    has_cap = any(item["category"] == "Capital" for item in what_has)
    assert has_cap

    # Section 2: What the user lacks
    what_lacks = rep["what_user_lacks"]
    categories_lacking = [item["category"] for item in what_lacks]
    assert "Capital" in categories_lacking, "Capital equity shortfall should be identified"
    assert "Power" in categories_lacking, "3-phase power gap should be identified"
    assert "Skills" in categories_lacking, "Missing technical skill should be identified"

    # Section 3: What can be arranged
    bridges = rep["what_can_be_arranged"]
    assert len(bridges) >= 3
    bridge_items = [b["item"] for b in bridges]
    assert any("Bank Term Loan" in b for b in bridge_items)
    assert any("Government Capital Subsidy" in b for b in bridge_items)
    assert any("ICAR-CCRI" in b for b in bridge_items)

    # Section 4: Estimated additional investment
    addl = rep["estimated_additional_investment"]
    assert addl["required_promoter_equity"] == 400000.0
    assert addl["available_capital"] == 300000.0
    assert addl["promoter_equity_gap"] == 100000.0
    assert addl["total_additional_funds_needed"] > 100000.0  # includes statutory/training
    assert addl["subsidy_coverage_amount"] == 700000.0
    assert addl["bank_loan_coverage_amount"] == 900000.0

    # Section 5: Recommended next steps
    steps = rep["recommended_next_steps"]
    assert len(steps) >= 4
    step_actions = [s["action"] for s in steps]
    assert any("proforma" in a.lower() or "quotation" in a.lower() or "invoice" in a.lower() for a in step_actions)
    assert any("bank" in a.lower() for a in step_actions)
    assert any("training" in a.lower() for a in step_actions)


def test_zero_capital_gap_when_budget_exceeds_equity():
    """Verify that promoter_equity_gap is 0 when user budget is sufficient."""
    fin_breakdown = FinancialBreakdown(
        total_project_cost=1000000.0,
        fixed_capital_investment=900000.0,
        working_capital_loan=75000.0,
        farmer_equity_required=150000.0,
        subsidy_amount=350000.0,
        bank_loan_required=500000.0,
        subsidy_percentage="35%",
        user_budget=300000.0,
        funding_gap=0.0,
        budget_status="Budget Sufficient",
        eligible_scheme="PMFME",
        project_cost_breakdown={
            "plant_and_machinery": 600000.0,
            "civil_works_and_shed": 200000.0,
            "electrification": 50000.0,
            "installation_and_contingency": 50000.0,
            "working_capital_margin": 25000.0,
        },
    )

    class DummyOpp:
        id = 14
        name = "Acid Lime Nutri-Jelly & Vitamin-C Fruit Spreads"
        category = "Food Processing"

    req_profile = BUSINESS_REQUIREMENT_PROFILES.get(14)
    rep = build_readiness_report(
        user_input=AssessmentInput(budget=300000.0, land_acres=1.0, has_land=True),
        opp=DummyOpp(),
        actual_capex=1000000.0,
        user_budget=300000.0,  # 3L > 1.5L required equity
        fin_breakdown=fin_breakdown,
        req_profile=req_profile,
        bench={"training": "Standard Processing"},
        top_scheme=None,
        user_location="Nagpur",
        skills_map={},
        resources_map={},
        matched_skl_ids=["SKL08"],
        missing_skl_ids=[],
        matched_res_ids=[],
        missing_res_ids=[],
        is_eligible=True,
        status_str="Ready to Launch",
        mandatory_reasons=[],
        acquirable_gaps=[],
        gap_items=[],
        mcda_breakdown={},
        land_acres=1.0,
        has_land=True,
        has_water=True,
        has_power=True,
        has_three_phase=True,
        has_workspace=True,
        has_fssai=True,
        has_udyam=True,
        has_712=True,
        owned_tractor=False,
        owned_truck=False,
        willingness="skilled",
        s_edu=0.8,
        s_situation=0.8,
        skill_fit=90,
        capital_fit=95,
    )

    addl = rep["estimated_additional_investment"]
    assert addl["promoter_equity_gap"] == 0.0
    # User lacks list should not have capital gap
    assert not any(item["category"] == "Capital" for item in rep["what_user_lacks"])


def test_evaluate_recommendations_attaches_readiness_report():
    """Verify that evaluate_recommendations includes readiness_report in every recommendation."""
    assessment_input = AssessmentInput(
        budget=600000.0,
        land_acres=2.0,
        has_land=True,
        has_water=True,
        has_power=True,
        has_three_phase=True,
        skills=["Citrus Cultivation", "Farm Management"],
        resources=["Irrigation Borewell", "Storage Shed"],
        location="Katol",
        risk_appetite="Medium",
    )

    res = evaluate_recommendations(assessment_input, db=None)
    assert len(res.recommendations) > 0
    top_rec = res.recommendations[0]

    assert top_rec.readiness_report is not None
    rep = top_rec.readiness_report
    assert "what_user_has" in rep
    assert "what_user_lacks" in rep
    assert "what_can_be_arranged" in rep
    assert "estimated_additional_investment" in rep
    assert "recommended_next_steps" in rep
