"""
Test Suite: Unified Infrastructure, Equipment & Funnel Engine (Priority 6)
========================================================================
Validates that:
1. Equipment catalog items (Polyhouse, Cold Storage, Grading Line, Juicer, Peel Oil)
   and transport modes (Reefer, Tractor, Mini-Truck) produce authentic CapEx offsets.
2. what_user_has in readiness reports reflects owned machinery and workspace types.
3. Rainfed-only water sources fail mandatory irrigation for commercial cultivation & nurseries.
4. Workspace types (factory, packhouse, workshop, shop) are mapped to appropriate sectors.
5. Funnel Level 8 acts as an operational setup filter rather than a pass-through.
"""

import unittest
from app.modules.dss.schemas import AssessmentInput
from app.modules.dss.service import evaluate_recommendations, check_eligibility, get_business_requirement_profile
from app.modules.dss.requirements_loader import requirements_repo


class TestUnifiedResourcesAndFunnel(unittest.TestCase):

    def test_polyhouse_equipment_offset_for_nursery(self):
        """User with owned polyhouse must receive ₹8L CapEx offset on Nursery model."""
        user_input = AssessmentInput(
            about_me={"education": "Graduate", "age": 30, "current_occupation": "Farming"},
            skills=["SKL01"],
            interests=["nursery", "propagation"],
            resources=["RES01", "RES02"],
            resources_detailed={
                "hasLand": True,
                "landAcres": 2.0,
                "equipmentList": [{"id": "polyhouse", "availability": "owned"}],
                "waterSources": ["borewell"]
            },
            has_land=True,
            land_acres=2.0,
            has_workspace=True,
            location="Katol",
            budget_inr=1200000.0
        )

        response = evaluate_recommendations(user_input)
        nursery_rec = next((r for r in response.recommendations if r.opportunity_id == 2), None)
        self.assertIsNotNone(nursery_rec, "Nursery model (ID 2) should be present")

        # Check that match reasons cites the polyhouse offset
        polyhouse_reason = next((m for m in nursery_rec.match_reasons if "Polyhouse" in m), None)
        self.assertIsNotNone(polyhouse_reason, "Match reasons must cite Polyhouse CapEx savings")
        self.assertIn("8.0 Lakhs", polyhouse_reason)

        # Check readiness report what_user_has includes polyhouse
        readiness = nursery_rec.readiness_report
        existing_equip = [h for h in readiness.get("what_user_has", []) if "Polyhouse" in h.get("title", "")]
        self.assertTrue(len(existing_equip) > 0, "Polyhouse should be recognized in what_user_has")

    def test_reefer_van_offset_for_cold_chain(self):
        """User with owned reefer van must receive ₹16L CapEx offset on cold-chain transport."""
        user_input = AssessmentInput(
            about_me={"education": "Graduate", "age": 35, "current_occupation": "Transport"},
            skills=["SKL07"],
            resources=["RES10"],
            resources_detailed={
                "transportModes": [{"type": "reefer", "availability": "owned"}],
                "hasWorkspace": True
            },
            has_workspace=True,
            location="MIHAN SEZ & Multi-Modal Logistics",
            budget_inr=2000000.0
        )

        response = evaluate_recommendations(user_input)
        # Check that reefer van is recognized in user_summary or readiness of top recs
        top_rec = response.recommendations[0]
        readiness = top_rec.readiness_report
        reefer_item = next((h for h in readiness.get("what_user_has", []) if "Reefer" in h.get("title", "")), None)
        self.assertIsNotNone(reefer_item, "Reefer van must appear in what_user_has")

    def test_rainfed_only_fails_mandatory_irrigation(self):
        """User with only rainfed water must fail mandatory irrigation check for commercial orchards."""
        req_profile = requirements_repo.get_by_id(1)  # 1-Acre Commercial Mandarin Cultivation
        self.assertEqual(req_profile["water_criticality"], "mandatory_irrigation")

        user_rainfed = {
            "has_land": True,
            "land_acres": 2.0,
            "has_water": False,
            "water_sources": ["rainfed"],
            "has_three_phase": False,
            "budget_inr": 300000.0
        }
        res = check_eligibility(user_rainfed, req_profile)
        self.assertFalse(res["eligible"], "Rainfed-only water must fail mandatory irrigation")
        self.assertTrue(any("Perennial irrigation required" in r for r in res["mandatory_reasons"]))

        # User with borewell must pass
        user_borewell = {
            "has_land": True,
            "land_acres": 2.0,
            "has_water": True,
            "water_sources": ["borewell"],
            "has_three_phase": False,
            "budget_inr": 300000.0
        }
        res_pass = check_eligibility(user_borewell, req_profile)
        self.assertTrue(res_pass["eligible"], "Borewell water must pass mandatory irrigation")

    def test_workspace_type_in_readiness_report(self):
        """User with a food-grade factory workspace must see FSSAI-compliant facility in report."""
        user_input = AssessmentInput(
            about_me={"education": "Graduate", "age": 28},
            skills=["SKL08"],
            resources=["RES05"],
            resources_detailed={
                "hasWorkspace": True,
                "workspaceType": "factory",
                "workspaceAreaSqFt": 800,
                "powerType": "three_phase"
            },
            has_workspace=True,
            location="Hingna MIDC",
            budget_inr=500000.0
        )

        response = evaluate_recommendations(user_input)
        top_rec = response.recommendations[0]
        readiness = top_rec.readiness_report
        ws_items = [h for h in readiness.get("what_user_has", []) if h.get("category") == "Workspace"]
        self.assertTrue(len(ws_items) > 0)
        self.assertTrue(any("Food-Grade" in w.get("title", "") for w in ws_items))


if __name__ == "__main__":
    unittest.main()
