"""
Unit tests for EntreVision Financial Engine (M3)
================================================
Verifies:
1. Accurate Project Cost and Means of Finance separation (Project Cost = Equity + Initial Bank Loan).
2. Proper Subsidy isolation (not subtracted upfront on Day 0 from loan sanction).
3. Standard Banking EMI and Reducing Balance Amortization.
4. Category-specific financial profiles producing distinctly different statements.
"""

import pytest
from app.modules.dss.financial_engine import (
    FinancialEngine,
    calculate_monthly_emi,
    resolve_financial_profile,
    calculate_exact_npv,
    calculate_exact_irr,
    calculate_bank_credit_grade
)


def test_sample_20_lakh_project_with_2_lakh_promoter_contribution():
    """
    Step 8 Verification Requirement:
    Sample Project Cost: Rs 20 Lakhs
    Promoter Contribution: Rs 2 Lakhs (10%)
    Verify:
    - Initial financing requirement is Rs 18 Lakhs.
    - Potential subsidy is shown separately (Rs 7 Lakhs under PMFME, 35%).
    - Subsidy is NOT subtracted upfront on Day 0 from the bank loan.
    - Repayment schedule reduces outstanding principal correctly.
    """
    engine = FinancialEngine()
    result = engine.calculate_project_finance(
        project_name="Citrus Juice & RTS Beverage Unit",
        base_capex=2000000.0,
        user_budget=200000.0,
        category="beverage processing",
        loan_interest_rate=8.5,
        loan_tenure_years=5
    )

    mof = result["means_of_finance"]
    sub = result["subsidy_details"]
    repay = result["loan_repayment"]
    sched = repay["amortization_schedule"]

    # 1. Total Project Cost
    assert result["total_project_cost"] == 2000000.0

    # 2. Promoter Contribution
    assert mof["promoter_contribution"] == 200000.0
    assert mof["promoter_contribution_pct"] == 10.0

    # 3. Initial Bank Financing Requirement (Must be 18 Lakhs, NOT 11 or 13 Lakhs!)
    assert mof["initial_bank_financing_required"] == 1800000.0
    assert mof["initial_bank_financing_pct"] == 90.0

    # 4. Potential Subsidy Shown Separately
    assert mof["estimated_subsidy"] == 700000.0  # 35% of 20L
    assert sub["is_deducted_from_initial_loan"] is False
    assert sub["estimated_amount"] == 700000.0
    assert "PMFME" in sub["scheme_name"]

    # 5. Loan Principal & EMI
    assert repay["loan_principal"] == 1800000.0
    # Expected EMI formula check: P=1800000, r=0.085/12, n=60 -> ~Rs 36,937 / month
    assert 36500 <= repay["monthly_emi"] <= 37500

    # 6. Repayment Schedule reduces outstanding balance systematically
    assert len(sched) == 5
    assert sched[0]["opening_balance"] == 1800000.0
    assert sched[4]["closing_balance"] == 0.0

    # Total principal paid over 5 years must sum to exactly initial loan (within 1 rupee rounding)
    total_principal_paid = sum(y["principal_paid"] for y in sched)
    assert abs(total_principal_paid - 1800000.0) < 5.0


def test_category_differentiation_juice_vs_nursery_vs_cold_storage():
    """
    Different business categories MUST produce distinctly different financial statements:
    - Juice: High raw material (~52%), moderate power (~9%).
    - Cold Storage: Very high electricity (~42%), low raw materials (~6%).
    - Nursery: High skilled labour (~40%), low raw materials (~18%).
    """
    engine = FinancialEngine()
    cost = 2500000.0

    juice_res = engine.calculate_project_finance("Citrus RTS Juice Processing", cost, category="juice")
    cold_res = engine.calculate_project_finance("Solar Farm-Gate Cold Storage", cost, category="cold storage")
    nursery_res = engine.calculate_project_finance("Disease-Free Citrus Nursery", cost, category="nursery")

    # Operating cost structures must be distinct
    j_ratios = juice_res["operating_cost_structure"]
    c_ratios = cold_res["operating_cost_structure"]
    n_ratios = nursery_res["operating_cost_structure"]

    # Juice raw material > Cold storage raw material
    assert j_ratios["raw_material"] > c_ratios["raw_material"]
    assert j_ratios["raw_material"] >= 0.40
    assert c_ratios["raw_material"] <= 0.10

    # Cold storage electricity > Juice electricity
    assert c_ratios["electricity"] > j_ratios["electricity"]
    assert c_ratios["electricity"] >= 0.35

    # Nursery labour > Juice labour
    assert n_ratios["labour"] > j_ratios["labour"]
    assert n_ratios["labour"] >= 0.30

    # Year 1 Projections must also reflect these distinct expense profiles
    j_y1 = juice_res["projections_5_year"][0]
    c_y1 = cold_res["projections_5_year"][0]
    n_y1 = nursery_res["projections_5_year"][0]

    assert j_y1["raw_materials"] > c_y1["raw_materials"]
    assert c_y1["electricity_utilities"] > j_y1["electricity_utilities"]
    assert n_y1["labour_wages"] > j_y1["labour_wages"]


def test_standard_emi_formula():
    """Test reducing balance EMI calculation mathematically."""
    # Test 10 Lakhs at 10% for 1 year
    emi = calculate_monthly_emi(1000000.0, 10.0, 1)
    # Expected: ~87,916
    assert 87000 <= emi <= 88500

    # Zero loan
    assert calculate_monthly_emi(0.0, 8.5, 5) == 0.0


def test_exact_npv_and_irr_calculations():
    """Verify exact discounted cash flow NPV and numerical IRR solving."""
    capex = 2000000.0
    cfs = [650000.0, 780000.0, 890000.0, 980000.0, 1050000.0]

    npv = calculate_exact_npv(capex, cfs, 0.10)
    irr = calculate_exact_irr(capex, cfs)

    # Hand-checked benchmarks:
    # PV of cash flows at 10% is ~Rs 32.25 Lakhs, minus Rs 20 Lakhs = ~Rs 12.25 Lakhs
    assert 1200000.0 <= npv <= 1250000.0
    # IRR is approximately 29.8%
    assert 29.0 <= irr <= 30.5

    # Check that financial engine produces dynamic non-hardcoded values
    engine = FinancialEngine()
    res = engine.calculate_project_finance("Citrus RTS Juice Processing", capex)
    metrics = res["financial_metrics"]
    assert metrics["irr_pct"] > 0
    assert "credit_rating" in metrics
    assert "credit_grade" in metrics["credit_rating"]


def test_credit_grading_scorecard():
    """Test credit grading thresholds for high vs moderate vs zero debt."""
    # Zero loan
    g0 = calculate_bank_credit_grade(avg_dscr=9.99, bep_percentage=30, equity_percentage=100, irr_pct=35, loan=0)
    assert "Grade A++" in g0["credit_grade"]

    # High safety: DSCR 2.2, BEP 32%, Equity 30%, IRR 28% -> Grade AAA
    g1 = calculate_bank_credit_grade(avg_dscr=2.2, bep_percentage=32, equity_percentage=30, irr_pct=28, loan=1000000)
    assert "Grade AAA" in g1["credit_grade"]

    # Stressed safety: DSCR 1.05, BEP 68%, Equity 10%, IRR 11% -> Grade C
    g2 = calculate_bank_credit_grade(avg_dscr=1.05, bep_percentage=68, equity_percentage=10, irr_pct=11, loan=1800000)
    assert "Grade C" in g2["credit_grade"]


def test_working_capital_calculation_and_operating_cycle():
    """
    Phase 3 Verification:
    Verify working capital calculation following Tandon/Nayak committee norms:
    - WC = Inventory (RM + Pkg + FG) + Receivables + Cash - Payables
    - Separates Fixed asset investment (CapEx) from Initial working capital
    - Explains how much is needed to establish the unit vs operate it.
    """
    engine = FinancialEngine()
    result = engine.calculate_project_finance(
        project_name="Citrus Juice & RTS Beverage Unit",
        base_capex=2000000.0,
        user_budget=200000.0,
        category="beverage processing",
    )

    # 1. Check funding distinction
    assert result["fixed_asset_investment"] == 2000000.0
    assert result["initial_working_capital"] > 0.0
    assert abs(result["total_project_funding"] - (result["fixed_asset_investment"] + result["initial_working_capital"])) < 0.01

    # 2. Check funding categories table
    categories = {c["category"]: c["amount"] for c in result["funding_categories"]}
    assert "Fixed asset investment" in categories
    assert "Initial working capital" in categories
    assert "Total project funding" in categories
    assert categories["Fixed asset investment"] == 2000000.0
    assert abs(categories["Total project funding"] - (categories["Fixed asset investment"] + categories["Initial working capital"])) < 0.01

    # 3. Check working capital components and formula
    wc = result["working_capital_analysis"]
    comp = wc["working_capital_components"]
    
    # Inventory sum
    expected_inventory = comp["raw_material_inventory"] + comp["packaging_inventory"] + comp["finished_goods_inventory"]
    assert abs(comp["total_inventory"] - expected_inventory) < 1.0

    # WC = Inventory + Receivables + Cash - Payables
    expected_nwc = (comp["total_inventory"] + comp["receivables"] + comp["cash_buffer"]) - comp["payables_creditors"]
    assert abs(comp["net_working_capital"] - expected_nwc) < 1.0
    assert result["initial_working_capital"] == comp["net_working_capital"]

    # 4. Check Operating Cycle Days
    cycle = wc["cycle_days"]
    expected_cycle_days = cycle["raw_material_days"] + cycle["finished_goods_days"] + cycle["receivable_days"] - cycle["supplier_credit_days"]
    assert wc["operating_cycle_days"] == expected_cycle_days

    # 5. Check Financing Split (Nayak Committee: 75% Bank Cash Credit, 25% Promoter Margin)
    fin_struct = wc["financing_structure"]
    assert fin_struct["bank_share_pct"] == 75.0
    assert fin_struct["promoter_share_pct"] == 25.0
    assert abs(fin_struct["bank_cash_credit_limit"] + fin_struct["promoter_margin_money"] - comp["net_working_capital"]) < 2.0


def test_working_capital_custom_cycle_days():
    """Verify that user-provided cycle days dynamically modify the working capital requirement."""
    engine = FinancialEngine()
    base_capex = 2000000.0

    res_default = engine.calculate_project_finance("Citrus RTS Juice", base_capex, category="juice")
    res_shorter = engine.calculate_project_finance(
        "Citrus RTS Juice",
        base_capex,
        category="juice",
        raw_material_days=10,
        receivable_days=15,
        payable_days=30
    )

    # Shorter receivables and longer supplier credit must reduce Net Working Capital requirement
    wc_default = res_default["initial_working_capital"]
    wc_shorter = res_shorter["initial_working_capital"]
    assert wc_shorter < wc_default


