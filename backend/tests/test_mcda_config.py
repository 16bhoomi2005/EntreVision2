"""
Test Suite: Configurable MCDA Scoring Engine (Priority 5)
=========================================================
Validates that:
1. Primary MCDA weights sum strictly to 1.0000.
2. Infrastructure sub-weights sum strictly to 1.0000.
3. Weighted sum math matches decision-theoretic expectations.
4. Sensitivity test: changing weights shifts opportunity scores predictably.
5. Integration: API response returns active_weights transparency record.
"""

import unittest
from app.modules.dss.mcda_config import MCDA_CONFIG, MCDAWeights, InfrastructureSubWeights, MCDAScoringConfig
from app.modules.dss.schemas import AssessmentInput
from app.modules.dss.service import evaluate_recommendations


class TestMCDAConfig(unittest.TestCase):

    def test_default_weights_sum_to_one(self):
        """Ensure standard MCDA and infrastructure sub-weights sum to 1.0000."""
        self.assertTrue(MCDA_CONFIG.weights.validate(), "Default MCDA weights do not sum to 1.0000")
        self.assertTrue(MCDA_CONFIG.infra_weights.validate(), "Default infrastructure sub-weights do not sum to 1.0000")

    def test_compute_mcda_score_math(self):
        """Ensure weighted sum formula produces accurate integer rounded output."""
        # Test baseline: 100 on all criteria -> 100
        score_100 = MCDA_CONFIG.compute_mcda_score(100, 100, 100, 100, 100, 100)
        self.assertEqual(score_100, 100)

        # Test baseline: 50 on all criteria -> 50
        score_50 = MCDA_CONFIG.compute_mcda_score(50, 50, 50, 50, 50, 50)
        self.assertEqual(score_50, 50)

        # Test specific combination:
        # capital=80 (0.25=20), infra=60 (0.20=12), market=90 (0.20=18),
        # skills=40 (0.15=6), resources=50 (0.10=5), loc=90 (0.10=9)
        # Sum = 20 + 12 + 18 + 6 + 5 + 9 = 70
        calc_score = MCDA_CONFIG.compute_mcda_score(80, 60, 90, 40, 50, 90)
        self.assertEqual(calc_score, 70)

    def test_infrastructure_sub_score_math(self):
        """Ensure land (0.45) + power (0.30) + water (0.25) computes correctly."""
        # land=100 (45), power=100 (30), water=40 (10) -> 85
        infra_score = MCDA_CONFIG.compute_infrastructure_score(100, 100, 40)
        self.assertEqual(infra_score, 85)

    def test_sensitivity_analysis_custom_weights(self):
        """Verify that a capital-heavy configuration penalizes capital-deficient users."""
        standard_cfg = MCDA_CONFIG
        capital_heavy_weights = MCDAWeights(capital=0.50, infrastructure=0.10, market=0.10, skills=0.10, resources=0.10, location=0.10)
        self.assertTrue(capital_heavy_weights.validate())

        custom_cfg = MCDAScoringConfig(weights=capital_heavy_weights)

        # High skill, low capital user (capital=30, skill=90, others=70)
        std_score = standard_cfg.compute_mcda_score(30, 70, 70, 90, 70, 70)
        heavy_score = custom_cfg.compute_mcda_score(30, 70, 70, 90, 70, 70)

        # Under capital-heavy weights, the score must be substantially lower
        self.assertLess(heavy_score, std_score)

    def test_recommendation_integration_includes_active_weights(self):
        """Verify that evaluate_recommendations() outputs the active weights in mcda_breakdown."""
        user_input = AssessmentInput(
            about_me={"education": "Graduate", "age": 30, "current_occupation": "Service", "goal": "Agribusiness"},
            skills=["SKL01"],
            resources=["RES01"],
            has_land=True,
            land_acres=2.0,
            has_workspace=True,
            location="Katol",
            budget_inr=300000.0,
            needs_funding=True
        )

        response = evaluate_recommendations(user_input)
        self.assertTrue(len(response.recommendations) > 0)

        rec = response.recommendations[0]
        mcda = rec.mcda_breakdown
        self.assertIn("active_weights", mcda)
        self.assertEqual(mcda["active_weights"]["capital"], 0.25)
        self.assertEqual(mcda["active_weights"]["infrastructure"], 0.20)
        self.assertEqual(mcda["active_weights"]["market"], 0.20)


if __name__ == "__main__":
    unittest.main()
