"""
Unit Tests for Financial Decision-Support Logic & Configuration
==============================================================
Validates:
1. Multi-Attribute Utility Theory (MAUT) Capital Fit scoring curves.
2. Self-funded (no-loan) scenarios where credit-linked subsidy is omitted.
3. Loan-assisted and subsidy-estimated scenarios with explicit disclaimers.
4. Transparent assumption disclosure in financial engine responses.
"""

import unittest
from app.modules.dss.financial_config import FINANCIAL_CONFIG, FinancialScoringConfig
from app.modules.dss.financial_engine import FinancialEngine
from app.modules.dss.service import calculate_financials


class TestFinancialScenarios(unittest.TestCase):

    def test_financial_config_capital_fit_tiers(self):
        """Verify monotonic decay of capital fit utility scores based on D/E ratios."""
        budget = 1000000.0  # Rs 10 Lakhs

        # Tier 1: Self-funded (<= 1.0x) -> 100
        self.assertEqual(FINANCIAL_CONFIG.calculate_capital_fit(capex=800000.0, user_budget=budget), 100)
        self.assertEqual(FINANCIAL_CONFIG.calculate_capital_fit(capex=1000000.0, user_budget=budget), 100)

        # Tier 2: Low Leverage (<= 2.0x) -> 90
        self.assertEqual(FINANCIAL_CONFIG.calculate_capital_fit(capex=1500000.0, user_budget=budget), 90)
        self.assertEqual(FINANCIAL_CONFIG.calculate_capital_fit(capex=2000000.0, user_budget=budget), 90)

        # Tier 3: Moderate Leverage (<= 4.0x) -> 75
        self.assertEqual(FINANCIAL_CONFIG.calculate_capital_fit(capex=3000000.0, user_budget=budget), 75)
        self.assertEqual(FINANCIAL_CONFIG.calculate_capital_fit(capex=4000000.0, user_budget=budget), 75)

        # Tier 4: High Leverage (<= 7.0x) -> 50
        self.assertEqual(FINANCIAL_CONFIG.calculate_capital_fit(capex=5000000.0, user_budget=budget), 50)
        self.assertEqual(FINANCIAL_CONFIG.calculate_capital_fit(capex=7000000.0, user_budget=budget), 50)

        # Tier 5: Extreme Leverage (<= 10.0x) -> 25
        self.assertEqual(FINANCIAL_CONFIG.calculate_capital_fit(capex=8000000.0, user_budget=budget), 25)
        self.assertEqual(FINANCIAL_CONFIG.calculate_capital_fit(capex=10000000.0, user_budget=budget), 25)

        # Beyond 10x: Decays but never drops below minimum floor (5)
        score_15x = FINANCIAL_CONFIG.calculate_capital_fit(capex=15000000.0, user_budget=budget)
        self.assertLess(score_15x, 25)
        self.assertGreaterEqual(score_15x, FINANCIAL_CONFIG.MIN_CAPITAL_SCORE)

        score_100x = FINANCIAL_CONFIG.calculate_capital_fit(capex=100000000.0, user_budget=budget)
        self.assertEqual(score_100x, FINANCIAL_CONFIG.MIN_CAPITAL_SCORE)

    def test_financial_engine_disclaimer_and_assumptions(self):
        """Verify that FinancialEngine returns transparent assumptions and disclaimers."""
        engine = FinancialEngine()
        result = engine.calculate_project_finance(
            project_name="Citrus Juice Processing Unit",
            base_capex=2000000.0,
            user_budget=500000.0,
            category="juice"
        )

        # 1. Means of finance structure
        mof = result["means_of_finance"]
        self.assertEqual(mof["promoter_contribution"], 500000.0)
        self.assertEqual(mof["initial_bank_financing_required"], 1500000.0)
        self.assertGreater(mof["estimated_subsidy"], 0)

        # 2. Subsidy status transparency
        sub = result["subsidy_details"]
        self.assertIn("Subject to Formal SNA Verification", sub["eligibility_status"])
        self.assertFalse(sub["is_deducted_from_initial_loan"])

        # 3. Financing assumptions block
        self.assertIn("financing_assumptions", result)
        assumptions = result["financing_assumptions"]
        self.assertTrue(assumptions["is_illustrative_scenario"])
        self.assertIn("disclaimer", assumptions)
        self.assertTrue(assumptions["statutory_approval_required"])

    def test_self_funded_no_loan_scenario(self):
        """When a user opts for 'no_loan' and has adequate budget, credit-linked subsidy is 0."""
        fin = calculate_financials(
            actual_capex=400000.0,
            user_budget=500000.0,
            category="nursery",
            borrowing_comfort="no_loan"
        )

        self.assertEqual(fin.bank_loan_required, 0.0)
        self.assertEqual(fin.subsidy_amount, 0.0)
        self.assertEqual(fin.farmer_equity_required, 400000.0)
        self.assertIn("Self-Financed", fin.eligible_scheme)
        self.assertIn("Zero Loan Strain", fin.budget_status)
        self.assertIsNotNone(fin.financing_assumptions)
        self.assertEqual(fin.financing_assumptions["debt_requirement"], "None")

    def test_loan_assisted_scenario(self):
        """When a user requires loan/subsidy assistance, calculate credit-linked waterfall."""
        fin = calculate_financials(
            actual_capex=2000000.0,
            user_budget=400000.0,
            category="juice",
            borrowing_comfort="loan_with_subsidy"
        )

        self.assertEqual(fin.total_project_cost, 2000000.0)
        self.assertGreater(fin.bank_loan_required, 0)
        self.assertGreater(fin.subsidy_amount, 0)
        self.assertIsNotNone(fin.disclaimer)
        self.assertIn("illustrative", fin.disclaimer.lower())


if __name__ == "__main__":
    unittest.main()
