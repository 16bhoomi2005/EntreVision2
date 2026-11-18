"""
Test Suite: Opportunity-Specific Machinery Mapping (Priority 4)
==============================================================
Validates that machinery recommendations are derived from structured data
(opportunity_requirements.csv) rather than keyword string heuristics in Python.
"""

import unittest
from app.modules.dss.requirements_loader import OpportunityRequirementsRepository, requirements_repo
from app.modules.dss.schemas import AssessmentInput
from app.modules.dss.service import evaluate_recommendations


class TestMachineryMapping(unittest.TestCase):
    def setUp(self):
        self.repo = OpportunityRequirementsRepository()

    def test_all_30_opportunities_have_machinery_items(self):
        """Verify that every single one of the 30 business models has specific machinery items."""
        for opp_id in range(1, 31):
            profile = self.repo.get_requirement_profile(opp_id)
            self.assertIsNotNone(profile, f"Opportunity {opp_id} missing profile")
            items = profile.get("machinery_items", [])
            self.assertTrue(len(items) >= 2, f"Opportunity {opp_id} ({profile.get('opportunity_name')}) has < 2 machinery items: {items}")
            for item in items:
                self.assertIsInstance(item, str)
                self.assertTrue(len(item.strip()) > 0)

    def test_specific_technical_machinery_assignments(self):
        """Verify that specific opportunities have accurate, non-generic machinery records."""
        # ID 13: Spray-Dried Mandarin Juice Powder
        id13 = self.repo.get_requirement_profile(13)
        items13 = " ".join(id13.get("machinery_items", []))
        self.assertIn("Spray Dryer", items13)
        self.assertNotIn("Juice Extractor", items13)

        # ID 21: CFB Box Manufacturing
        id21 = self.repo.get_requirement_profile(21)
        items21 = " ".join(id21.get("machinery_items", []))
        self.assertIn("Corrugation Line", items21)

        # ID 27: Raw Honey & Migratory Apiary
        id27 = self.repo.get_requirement_profile(27)
        items27 = " ".join(id27.get("machinery_items", []))
        self.assertIn("Beehive", items27)
        self.assertIn("Honey Extractor", items27)

        # ID 24: Reefer Container Fleet
        id24 = self.repo.get_requirement_profile(24)
        items24 = " ".join(id24.get("machinery_items", []))
        self.assertIn("Refrigerated Truck", items24)

        # ID 29: Vermicompost Unit
        id29 = self.repo.get_requirement_profile(29)
        items29 = " ".join(id29.get("machinery_items", []))
        self.assertIn("HDPE Vermibeds", items29)

    def test_recommend_readiness_report_uses_configured_machinery(self):
        """Verify that evaluate_recommendations() produces readiness reports referencing each model's actual equipment."""
        user_input = AssessmentInput(
            about_me={"education": "Graduate", "age": 30, "current_occupation": "Service", "goal": "Agribusiness"},
            skills=["SKL08", "SKL10"],
            resources=["RES05", "RES06"],
            has_land=False,
            land_acres=0.0,
            has_workspace=True,
            location="Nagpur",
            budget_inr=500000.0,
            needs_funding=True,
            funding_preference="subsidy_and_loan"
        )

        response = evaluate_recommendations(user_input)
        self.assertTrue(len(response.recommendations) > 0)

        # For every recommended opportunity in top 5, verify machinery matches its CSV record
        for rec in response.recommendations:
            req_profile = self.repo.get_requirement_profile(rec.opportunity_id)
            expected_machinery = req_profile["machinery_items"]
            self.assertTrue(len(expected_machinery) >= 2)

            readiness = rec.readiness_report
            self.assertIsNotNone(readiness)

            machinery_gaps = [g for g in readiness.get("what_user_lacks", []) if g.get("category") == "Machinery"]
            self.assertTrue(len(machinery_gaps) > 0)
            required_text = machinery_gaps[0].get("required", "")
            # The readiness report includes the first machinery item
            self.assertIn(expected_machinery[0], required_text)

            # Equipment quotation action plan should also cite the specific first machine
            next_steps = readiness.get("recommended_next_steps", [])
            equip_step = next((s for s in next_steps if "Equipment Quotations" in s.get("title", "")), None)
            self.assertIsNotNone(equip_step)
            self.assertIn(expected_machinery[0], equip_step.get("action", ""))


if __name__ == "__main__":
    unittest.main()
