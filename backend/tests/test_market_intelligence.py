"""
Unit Tests for Market Intelligence & Data Transparency
======================================================
Validates:
1. Verified tehsils (Katol, Warud, Kalmeshwar) return authentic empirical census metrics with source citations.
2. Unrecorded / non-commercial locations transparently return 'Data Unavailable' rather than fabricating fake acreage.
3. Mandi market dynamics include specific APMC yard attribution, data source, and observation window.
"""

import unittest
from app.modules.dss.service import get_market_intelligence


class TestMarketIntelligence(unittest.TestCase):

    def test_katol_market_intelligence(self):
        """Katol should return verified empirical census data from the horticulture department."""
        intel = get_market_intelligence("Katol")
        self.assertEqual(intel["location"], "Katol")

        citrus = intel["citrus_production"]
        self.assertEqual(citrus["data_status"], "Empirical Departmental Census")
        self.assertEqual(citrus["district"], "Nagpur")
        self.assertEqual(citrus["tehsil"], "Katol")
        self.assertEqual(citrus["estimated_area_hectares"], 36000.0)
        self.assertEqual(citrus["estimated_production_mt"], 270000.0)
        self.assertIn("Directorate of Horticulture", citrus["source"])

    def test_warud_amravati_corridor_intelligence(self):
        """Warud (Amravati district) should be resolved to its authentic citrus corridor data."""
        intel = get_market_intelligence("Warud")
        self.assertEqual(intel["location"], "Warud")

        citrus = intel["citrus_production"]
        self.assertEqual(citrus["data_status"], "Empirical Departmental Census")
        self.assertEqual(citrus["district"], "Amravati")
        self.assertEqual(citrus["tehsil"], "Warud")
        self.assertEqual(citrus["estimated_area_hectares"], 32000.0)
        self.assertEqual(citrus["estimated_production_mt"], 240000.0)

        # Mandi yard should accurately point to Warud APMC
        mandi = intel["mandi_market_dynamics"]
        self.assertEqual(mandi["market_yard"], "Warud APMC Mandi")

    def test_unrecorded_location_returns_data_unavailable(self):
        """An unrecorded location must NOT silently invent 24,000 hectares of citrus."""
        intel = get_market_intelligence("Pune Urban Hub")
        citrus = intel["citrus_production"]

        self.assertEqual(citrus["data_status"], "Data Unavailable / Non-Commercial Cluster")
        self.assertIsNone(citrus["estimated_area_hectares"])
        self.assertIsNone(citrus["estimated_production_mt"])
        self.assertIsNone(citrus["estimated_yield_mt_per_ha"])
        self.assertIn("No verified commercial citrus acreage", citrus["message"])

    def test_mandi_data_source_transparency(self):
        """Mandi price dynamics must clearly state yard name, source agency, and sample window."""
        intel = get_market_intelligence("Kalmeshwar")
        mandi = intel["mandi_market_dynamics"]

        self.assertEqual(mandi["benchmark_commodity"], "Nagpur Mandarin (Orange)")
        self.assertIn("APMC", mandi["market_yard"])
        self.assertIn("AGMARKNET", mandi["data_source"])
        self.assertEqual(mandi["observation_window"], "30-Day Rolling Sample")
        self.assertGreater(mandi["average_wholesale_price_inr_qtl"], 0)
        self.assertGreater(mandi["price_per_kg"], 0)


if __name__ == "__main__":
    unittest.main()
