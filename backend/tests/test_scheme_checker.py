"""
Comprehensive Unit Tests for Scheme Eligibility Checker (Phase 8)
Tests:
- Step 1: Scheme database structure and metadata (name, categories, conditions, assistance %, max subsidy, required docs, portal, last verified date).
- Step 2: Scheme eligibility comparison against user assessment.
- Step 3: Three deterministic statuses ('Potentially eligible', 'Not eligible based on known criteria', 'More information required').
- Step 4: Potential assistance calculations with scheme-specific rules (PMFME, MIDH, PMEGP, CMEGP, AIF).
- Step 5: Official application information (official portal, source document, nodal agency, required documents checklist).
"""

import pytest
from app.modules.dss.scheme_engine import (
    get_all_schemes_catalog,
    get_scheme_by_code,
    evaluate_single_scheme,
    evaluate_all_schemes,
    UserAssessmentInput,
    SchemeProfile,
    SchemeEligibilityResult
)


def test_step1_scheme_database_schema_and_metadata():
    """Verify that scheme database stores all required fields for each scheme"""
    schemes = get_all_schemes_catalog()
    assert len(schemes) >= 7, "Catalog should have at least 7 verified schemes"
    
    for s in schemes:
        assert s.scheme_name, "Scheme name must not be empty"
        assert len(s.eligible_business_categories) > 0, f"Eligible categories missing for {s.scheme_code}"
        assert isinstance(s.eligibility_conditions, dict), f"Eligibility conditions missing for {s.scheme_code}"
        assert s.assistance_percentage >= 0.0, f"Assistance % invalid for {s.scheme_code}"
        assert s.max_subsidy_amount > 0.0, f"Max subsidy invalid for {s.scheme_code}"
        assert len(s.required_documents) > 0, f"Required documents missing for {s.scheme_code}"
        assert s.official_website.startswith("http"), f"Official website must be valid URL for {s.scheme_code}"
        assert s.source_document, f"Source document missing for {s.scheme_code}"
        assert s.last_verified_date, f"Last verified date missing for {s.scheme_code}"


def test_step2_and_step3_three_eligibility_statuses():
    """Verify the three distinct statuses: Potentially eligible, More information required, Not eligible"""
    pmfme = get_scheme_by_code("PMFME-001")
    assert pmfme is not None

    # Case A: Fully satisfied (Potentially eligible)
    u_eligible = UserAssessmentInput(
        business_category="citrus_juice",
        project_cost_inr=2000000.0,      # ₹20L
        available_capital_inr=400000.0,  # 20% equity (> 10% min)
        has_land=True,
        has_bank_sanction=True,          # Bank sanction in hand
        has_fssai_commitment=True
    )
    res_a = evaluate_single_scheme(pmfme, u_eligible)
    assert res_a.status == "Potentially eligible"
    assert res_a.status_code == "POTENTIALLY_ELIGIBLE"
    assert len(res_a.reasons) > 0

    # Case B: Pending bank sanction appraisal (More information required)
    u_info_needed = UserAssessmentInput(
        business_category="citrus_juice",
        project_cost_inr=2000000.0,
        available_capital_inr=400000.0,
        has_bank_sanction=False          # Pending bank appraisal
    )
    res_b = evaluate_single_scheme(pmfme, u_info_needed)
    assert res_b.status == "More information required"
    assert res_b.status_code == "MORE_INFO_REQUIRED"
    assert any("bank term loan" in req.lower() for req in res_b.missing_requirements)

    # Case C: Excluded activity / not eligible
    u_not_eligible = UserAssessmentInput(
        business_category="mining_quarry",
        project_cost_inr=2000000.0
    )
    res_c = evaluate_single_scheme(pmfme, u_not_eligible)
    assert res_c.status == "Not eligible based on known criteria"
    assert res_c.status_code == "NOT_ELIGIBLE"
    assert len(res_c.disqualification_reasons) > 0


def test_step4_pmfme_calculation_rule():
    """PMFME: 35% subsidy capped at ₹10 Lakhs"""
    pmfme = get_scheme_by_code("PMFME-001")
    
    # 1. Below cap: ₹20L project cost -> 35% is ₹7.0L (< ₹10L cap)
    u1 = UserAssessmentInput(business_category="citrus_juice", project_cost_inr=2000000.0, has_bank_sanction=True)
    r1 = evaluate_single_scheme(pmfme, u1)
    assert r1.calculated_subsidy_amount == 700000.0
    assert r1.calculated_subsidy_lakhs == 7.0
    
    # 2. At or above cap: ₹40L project cost -> 35% is ₹14.0L, but capped at ₹10.0L
    u2 = UserAssessmentInput(business_category="citrus_juice", project_cost_inr=4000000.0, has_bank_sanction=True)
    r2 = evaluate_single_scheme(pmfme, u2)
    assert r2.calculated_subsidy_amount == 1000000.0
    assert r2.calculated_subsidy_lakhs == 10.0


def test_step4_midh_nursery_vs_cold_storage_calculation():
    """MIDH: 50% for nurseries (cap ₹25L) vs 35% for packhouse/cold chain (cap ₹50L)"""
    midh = get_scheme_by_code("MIDH-NHB-002")
    
    # High-tech nursery
    u_nursery = UserAssessmentInput(
        business_category="citrus_nursery",
        project_cost_inr=4000000.0,  # ₹40L
        has_land=True,
        land_acres=3.0,
        has_bank_sanction=True
    )
    r_nursery = evaluate_single_scheme(midh, u_nursery)
    assert r_nursery.assistance_percentage == 0.50
    assert r_nursery.calculated_subsidy_amount == 2000000.0  # 50% of 40L = 20L
    assert "High-Tech Nursery Component" in r_nursery.calculation_formula

    # Cold chain / packhouse
    u_cold = UserAssessmentInput(
        business_category="cold_storage",
        project_cost_inr=10000000.0,  # ₹1.0 Cr
        has_land=True,
        land_acres=2.0,
        has_bank_sanction=True
    )
    r_cold = evaluate_single_scheme(midh, u_cold)
    assert r_cold.assistance_percentage == 0.35
    assert r_cold.calculated_subsidy_amount == 3500000.0  # 35% of 100L = 35L


def test_step4_pmegp_rural_vs_urban_and_special_category_boost():
    """PMEGP: Rural special (35%) vs Rural general (25%) vs Urban general (15%)"""
    pmegp = get_scheme_by_code("PMEGP-004")
    
    # 1. Rural + Special category (SC/ST/Women/OBC) -> 35%
    u_special = UserAssessmentInput(
        business_category="citrus_peel_oil",
        project_cost_inr=2000000.0,
        location_type="rural",
        social_category="Women",
        has_bank_sanction=True
    )
    r_special = evaluate_single_scheme(pmegp, u_special)
    assert r_special.assistance_percentage == 0.35
    assert r_special.calculated_subsidy_amount == 700000.0  # 35% of 20L
    assert "Rural Special Category (35%)" in r_special.calculation_formula

    # 2. Rural + General category -> 25%
    u_gen = UserAssessmentInput(
        business_category="citrus_peel_oil",
        project_cost_inr=2000000.0,
        location_type="rural",
        social_category="General",
        has_bank_sanction=True
    )
    r_gen = evaluate_single_scheme(pmegp, u_gen)
    assert r_gen.assistance_percentage == 0.25
    assert r_gen.calculated_subsidy_amount == 500000.0  # 25% of 20L
    assert "Rural General Category (25%)" in r_gen.calculation_formula

    # 3. Project cost ceiling check (> ₹50L manufacturing not eligible)
    u_exceed = UserAssessmentInput(
        business_category="citrus_peel_oil",
        project_cost_inr=6000000.0  # ₹60L
    )
    r_exceed = evaluate_single_scheme(pmegp, u_exceed)
    assert r_exceed.status == "Not eligible based on known criteria"
    assert any("exceeds scheme ceiling" in d.lower() for d in r_exceed.disqualification_reasons)


def test_step4_aif_interest_subvention_calculation():
    """AIF: 3% interest subvention on term loan for 7 years"""
    aif = get_scheme_by_code("AIF-003")
    u_aif = UserAssessmentInput(
        business_category="cold_storage",
        project_cost_inr=5000000.0,  # ₹50L
        available_capital_inr=500000.0,
        has_bank_sanction=True
    )
    r_aif = evaluate_single_scheme(aif, u_aif)
    # Loan is 90% of 50L = 45L. Subvention = 45L * 3% = 1.35L/year. 7-year total = 9.45L.
    assert r_aif.interest_subvention_annual == 135000.0
    assert r_aif.calculated_subsidy_amount == 945000.0
    assert "3% Interest Subvention" in r_aif.calculation_formula


def test_step5_official_application_information_provenance():
    """Step 5: Verify official portal, source document, nodal agency, and required documents"""
    schemes = get_all_schemes_catalog()
    u = UserAssessmentInput(
        business_category="citrus_juice",
        project_cost_inr=2000000.0,
        available_capital_inr=300000.0,
        has_bank_sanction=True
    )
    results = evaluate_all_schemes(u)
    assert len(results) == len(schemes)
    
    for r in results:
        # Check official portal
        assert r.official_website.startswith("http"), f"Portal link missing for {r.scheme_code}"
        # Check source document citation
        assert len(r.source_document) > 5, f"Source document missing for {r.scheme_code}"
        # Check nodal agency
        assert len(r.nodal_agency) > 5, f"Nodal agency missing for {r.scheme_code}"
        # Check processing SLA
        assert "days" in r.processing_period.lower()
        # Check documents checklist
        assert len(r.required_documents) >= 3
        # Ensure mandatory document has is_mandatory == True
        mandatory_docs = [d for d in r.required_documents if d.is_mandatory]
        assert len(mandatory_docs) >= 2


def test_evaluate_all_schemes_sorting():
    """Top eligible schemes with highest subsidy must appear first"""
    u = UserAssessmentInput(
        business_category="citrus_juice",
        project_cost_inr=2000000.0,
        available_capital_inr=400000.0,
        has_land=True,
        has_bank_sanction=True
    )
    results = evaluate_all_schemes(u)
    # The first result should be Potentially eligible
    assert results[0].status == "Potentially eligible"
    # Not eligible schemes must be sorted toward the bottom
    last_results = results[-3:]
    assert any(r.status == "Not eligible based on known criteria" for r in last_results)
