"""
Opportunity Requirements Repository - EntreVision Decision Support System
========================================================================
Loads business opportunity eligibility requirements, land/water/power
prerequisites, skills, and equipment norms directly from structured data:
'data/proccessed/opportunity_requirements.csv'.

Eliminates hardcoded requirement dictionaries from code and ensures that
adding a new business opportunity only requires adding a row to the CSV.
"""

import csv
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)


class OpportunityRequirementsRepository:
    def __init__(self, csv_path: Optional[Path] = None):
        if csv_path is None:
            base_dir = Path(__file__).resolve().parents[4] / "data" / "proccessed"
            if not base_dir.exists():
                base_dir = Path(__file__).resolve().parents[3] / "data" / "proccessed"
            self.csv_path = base_dir / "opportunity_requirements.csv"
        else:
            self.csv_path = Path(csv_path)

        self._requirements_by_id: Dict[int, Dict[str, Any]] = {}
        self._requirements_by_name: Dict[str, Dict[str, Any]] = {}
        self.load()

    def load(self) -> None:
        """Parses opportunity_requirements.csv and loads into memory with proper type casting."""
        if not self.csv_path.exists():
            logger.warning(f"Requirements file not found at: {self.csv_path}")
            return

        loaded_by_id: Dict[int, Dict[str, Any]] = {}
        loaded_by_name: Dict[str, Dict[str, Any]] = {}

        with open(self.csv_path, mode="r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                if not row or not row.get("opportunity_id"):
                    continue
                try:
                    opp_id = int(str(row["opportunity_id"]).strip())
                    opp_name = str(row.get("opportunity_name", "")).strip()

                    requires_land = str(row.get("requires_land", "false")).lower() in ["true", "1", "yes"]
                    min_land = float(row.get("min_land_acres", 0.0) or 0.0)
                    allows_leased = str(row.get("allows_leased_land", "true")).lower() in ["true", "1", "yes"]

                    requires_workspace = str(row.get("requires_workspace", "false")).lower() in ["true", "1", "yes"]
                    requires_water = str(row.get("requires_water", "false")).lower() in ["true", "1", "yes"]
                    water_criticality = str(row.get("water_criticality", "none")).strip()
                    electricity_type = str(row.get("electricity_type", "basic_single_phase")).strip()

                    mand_skills = [s.strip() for s in str(row.get("mandatory_skills", "")).split(",") if s.strip()]
                    pref_skills = [s.strip() for s in str(row.get("preferred_skills", "")).split(",") if s.strip()]
                    req_skills = [s.strip() for s in str(row.get("required_skills", "")).split(",") if s.strip()]
                    req_resources = [r.strip() for r in str(row.get("required_resources", "")).split(",") if r.strip()]

                    min_inv = float(row.get("min_investment_inr", 0.0) or 0.0)
                    pref_locs = str(row.get("preferred_locations", "")).strip()
                    min_equity = float(row.get("min_equity_ratio", 0.10) or 0.10)
                    training = str(row.get("training", "")).strip()
                    machinery_items = [m.strip() for m in str(row.get("machinery_items", "")).split(";") if m.strip()]

                    profile = {
                        "opportunity_id": opp_id,
                        "opportunity_name": opp_name,
                        "requires_land": requires_land,
                        "min_land_acres": min_land,
                        "allows_leased_land": allows_leased,
                        "requires_workspace": requires_workspace,
                        "requires_water": requires_water,
                        "water_criticality": water_criticality,
                        "electricity_type": electricity_type,
                        "mandatory_skills": mand_skills if mand_skills else req_skills,
                        "preferred_skills": pref_skills,
                        "required_skills": req_skills if req_skills else mand_skills,
                        "required_resources": req_resources,
                        "min_investment_inr": min_inv,
                        "preferred_locations": pref_locs,
                        "min_equity_ratio": min_equity,
                        "training": training,
                        "machinery_items": machinery_items,
                    }

                    loaded_by_id[opp_id] = profile
                    if opp_name:
                        loaded_by_name[opp_name.lower()] = profile

                except Exception as e:
                    logger.error(f"Error parsing requirement row for {row}: {e}")

        self._requirements_by_id = loaded_by_id
        self._requirements_by_name = loaded_by_name
        logger.info(f"Loaded {len(self._requirements_by_id)} opportunity requirement profiles from CSV.")

    def get_by_id(self, opp_id: int) -> Optional[Dict[str, Any]]:
        return self._requirements_by_id.get(opp_id)

    def get_by_name(self, opp_name: str) -> Optional[Dict[str, Any]]:
        return self._requirements_by_name.get(opp_name.lower().strip())

    def get_requirement_profile(self, opp_id: int, opp_name: str = "", bench: Optional[dict] = None) -> Dict[str, Any]:
        """
        Retrieves business requirement profile directly from loaded data.
        If an opportunity is missing from structured data, logs an explicit warning
        and provides safe generic defaults instead of silent keyword guessing.
        """
        bench_dict = bench or {}
        capex = float(bench_dict.get("capex", 500000.0))

        prof = self.get_by_id(opp_id)
        if not prof and opp_name:
            prof = self.get_by_name(opp_name)

        if prof:
            res = prof.copy()
            res["capex"] = capex
            return res

        # Opportunity not found in structured data -> Log explicit warning!
        logger.warning(
            f"Opportunity requirement profile missing from 'opportunity_requirements.csv' "
            f"for Opportunity ID {opp_id} ('{opp_name}'). Using baseline defaults."
        )

        return {
            "opportunity_id": opp_id,
            "opportunity_name": opp_name,
            "requires_land": False,
            "min_land_acres": 0.0,
            "allows_leased_land": True,
            "requires_workspace": True,
            "requires_water": False,
            "water_criticality": "none",
            "electricity_type": "basic_single_phase",
            "mandatory_skills": ["SKL01"],
            "preferred_skills": [],
            "required_skills": ["SKL01"],
            "required_resources": ["RES05"],
            "min_investment_inr": capex,
            "preferred_locations": "Nagpur District",
            "min_equity_ratio": 0.10,
            "training": bench_dict.get("training", "ICAR-CCRI Agribusiness Training"),
            "machinery_items": ["Core Processing Machinery", "Commercial Packaging Line"],
            "capex": capex,
            "is_unconfigured_fallback": True
        }


# Global singleton instance
requirements_repo = OpportunityRequirementsRepository()
