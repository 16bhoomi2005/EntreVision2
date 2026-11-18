"""
Unit Tests for Opportunity Requirements Repository & Eligibility Data Source
===========================================================================
Validates:
1. All 30 agribusiness models have structured requirement records in opportunity_requirements.csv.
2. Proper type conversion (booleans, floats, skill lists).
3. Eligibility checking uses structured requirements rather than Python hardcoded dictionaries.
4. Adding or querying an unknown opportunity logs an explicit warning rather than silently guessing.
"""

import unittest
from pathlib import Path
from app.modules.dss.requirements_loader import OpportunityRequirementsRepository, requirements_repo
from app.modules.dss.service import get_business_requirement_profile, check_eligibility


class TestOpportunityRequirements(unittest.TestCase):

    def test_repository_loads_all_opportunities(self):
        """Verify that all 30 business models are successfully loaded from CSV."""
        self.assertGreaterEqual(len(requirements_repo._requirements_by_id), 30)
        
        # Verify Opportunity 1: Commercial Mandarin Cultivation
        opp1 = requirements_repo.get_by_id(1)
        self.assertIsNotNone(opp1)
        self.assertTrue(opp1["requires_land"])
        self.assertEqual(opp1["min_land_acres"], 1.0)
        self.assertTrue(opp1["requires_water"])
        self.assertEqual(opp1["water_criticality"], "mandatory_irrigation")
        self.assertIn("SKL01", opp1["mandatory_skills"])

        # Verify Opportunity 7: Trichoderma Unit (requires 3-phase industrial electricity)
        opp7 = requirements_repo.get_by_id(7)
        self.assertIsNotNone(opp7)
        self.assertFalse(opp7["requires_land"])
        self.assertTrue(opp7["requires_workspace"])
        self.assertEqual(opp7["electricity_type"], "three_phase_industrial")
        self.assertIn("SKL12", opp7["mandatory_skills"])

    def test_type_casting_integrity(self):
        """Ensure all fields in the CSV are properly type-cast and not raw strings."""
        for opp_id, prof in requirements_repo._requirements_by_id.items():
            self.assertIsInstance(prof["opportunity_id"], int)
            self.assertIsInstance(prof["requires_land"], bool)
            self.assertIsInstance(prof["min_land_acres"], float)
            self.assertIsInstance(prof["allows_leased_land"], bool)
            self.assertIsInstance(prof["requires_workspace"], bool)
            self.assertIsInstance(prof["requires_water"], bool)
            self.assertIsInstance(prof["mandatory_skills"], list)
            self.assertIsInstance(prof["preferred_skills"], list)

    def test_get_business_requirement_profile_integration(self):
        """Verify that service.get_business_requirement_profile delegates to data repository."""
        prof = get_business_requirement_profile(opp_id=2, opp_name="Disease-Free Certified Citrus Nursery", bench={"capex": 2000000.0})
        self.assertTrue(prof["requires_land"])
        self.assertEqual(prof["min_land_acres"], 0.5)
        self.assertEqual(prof["capex"], 2000000.0)

    def test_unconfigured_opportunity_warning(self):
        """Verify that an unknown opportunity triggers a fallback with explicit flag."""
        prof = requirements_repo.get_requirement_profile(opp_id=999, opp_name="Experimental Hydroponic Orange")
        self.assertTrue(prof.get("is_unconfigured_fallback"))
        self.assertEqual(prof["opportunity_id"], 999)

    def test_check_eligibility_with_data_loaded_profile(self):
        """Verify that check_eligibility correctly gates a user based on CSV data."""
        # Opportunity 1 requires 1.0 acre of land
        req1 = requirements_repo.get_by_id(1)
        
        # User with 0 acres should be marked ineligible
        user_no_land = {"has_land": False, "land_acres": 0.0, "has_water": True, "has_three_phase": False}
        res_fail = check_eligibility(user_no_land, req1)
        self.assertFalse(res_fail["eligible"])
        self.assertTrue(any("Insufficient land" in reason for reason in res_fail["mandatory_reasons"]))

        # User with 1.5 acres and water should pass
        user_with_land = {"has_land": True, "land_acres": 1.5, "has_water": True, "water_sources": ["borewell"]}
        res_pass = check_eligibility(user_with_land, req1)
        self.assertTrue(res_pass["eligible"])


if __name__ == "__main__":
    unittest.main()
