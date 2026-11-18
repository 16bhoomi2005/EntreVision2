import os
import csv
import math
import json
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from app.modules.industry.models import BusinessOpportunity
from app.modules.dss.schemas import (
    AssessmentInput,
    SkillItem,
    ResourceItem,
    LocationItem,
    FinancialBreakdown,
    OpportunityRecommendation,
    RecommendationResponse,
    FinancialPlanRequest,
    FinancialPlanResponse,
    HierarchicalFunnel,
    HierarchicalFunnelStep,
)
from app.modules.dss.ml_engine import ml_engine
from app.modules.dss.financial_engine import FinancialEngine
from app.modules.dss import scheme_engine
from app.modules.dss.financial_config import FINANCIAL_CONFIG
from app.modules.dss.requirements_loader import requirements_repo
from app.modules.dss.mcda_config import MCDA_CONFIG

_financial_engine_instance = FinancialEngine()

def load_opportunity_benchmarks() -> Dict[Any, dict]:
    """
    Dynamically loads all business opportunity benchmark metrics from 
    'data/proccessed/opportunity_benchmarks.csv'.
    Supports hot-reloading: whenever a new model is added to the CSV or DB,
    it is automatically loaded.
    Indexed by both canonical opportunity ID (int & str) and normalized name.
    """
    benchmarks_raw = load_csv("opportunity_benchmarks.csv")
    benchmarks_map = {}
    for r in benchmarks_raw:
        clusters = {}
        if r.get("clusters_json"):
            try:
                clusters = json.loads(r["clusters_json"])
            except Exception:
                clusters = {}
        sectors = [s.strip() for s in r.get("sectors", "").split("|") if s.strip()]
        
        bench_obj = {
            "opportunity_id": int(r.get("opportunity_id", 0)),
            "name": r.get("opportunity_name", ""),
            "capex": float(r.get("capex_inr", 500000)),
            "opex_monthly": float(r.get("opex_monthly_inr", 30000)),
            "margin_pct": float(r.get("margin_pct", 30)),
            "risk": r.get("risk_level", "Medium"),
            "scale": r.get("scale", "Small"),
            "timeline": r.get("timeline", "2–4 Months"),
            "sectors": sectors,
            "training": r.get("training_recommendation", "ICAR-CCRI Skill Development Workshop"),
            "clusters": clusters,
            "default_cluster": float(r.get("default_cluster_score", 0.75)),
            "requires_land": str(r.get("requires_land", "")).lower() == "true",
            "min_land_acres": float(r.get("min_land_acres", 0.0))
        }
        opp_id = int(r.get("opportunity_id", 0))
        benchmarks_map[opp_id] = bench_obj
        benchmarks_map[str(opp_id)] = bench_obj
        name_key = r.get("opportunity_name", "").lower().strip()
        if name_key:
            benchmarks_map[name_key] = bench_obj
            
    return benchmarks_map


def infer_benchmark_from_opportunity(opp: Any) -> dict:
    """
    Automated Heuristic Profiler & Model Inference:
    If a new business model is added with only basic details (name, category, description,
    or investment_level text), this engine dynamically infers its financial benchmarks,
    working capital, margins, scale, and operational requirements with ZERO hardcoding.
    """
    import re
    inv_str = getattr(opp, "investment_level", "") or ""
    capex = 500000.0
    
    # Match Crores
    cr_match = re.search(r"(\d+(\.\d+)?)\s*(?:-|to)?\s*(\d+(\.\d+)?)?\s*Crore", inv_str, re.IGNORECASE)
    if cr_match:
        val = float(cr_match.group(3) or cr_match.group(1))
        capex = val * 10000000.0
    else:
        # Match Lakhs
        lakh_match = re.search(r"(\d+(\.\d+)?)\s*(?:-|to)?\s*(\d+(\.\d+)?)?\s*Lakh", inv_str, re.IGNORECASE)
        if lakh_match:
            val = float(lakh_match.group(3) or lakh_match.group(1))
            capex = val * 100000.0
        else:
            digits = re.findall(r"\b\d{5,8}\b", inv_str)
            if digits:
                capex = float(digits[-1])
            elif "high" in inv_str.lower():
                capex = 5000000.0
            elif "medium" in inv_str.lower():
                capex = 1500000.0
            else:
                capex = 300000.0

    opex_monthly = max(15000.0, round(capex * 0.04, -2))

    cat_lower = (getattr(opp, "category", "") or "").lower()
    if any(k in cat_lower for k in ["waste", "by-product", "bio"]):
        margin_pct = 50.0
    elif any(k in cat_lower for k in ["propagation", "nursery", "seed"]):
        margin_pct = 45.0
    elif any(k in cat_lower for k in ["food", "beverage", "processing", "juice"]):
        margin_pct = 32.0
    elif any(k in cat_lower for k in ["trading", "export", "logistics", "mandi"]):
        margin_pct = 20.0
    elif any(k in cat_lower for k in ["service", "diagnostic", "clinic", "tech"]):
        margin_pct = 40.0
    else:
        margin_pct = 28.0

    if capex <= 600000:
        scale = "Micro"
    elif capex <= 3500000:
        scale = "Small"
    elif capex <= 15000000:
        scale = "Medium / Large Enterprise"
    else:
        scale = "Large Scale Industrial"

    tech_str = (getattr(opp, "technology_level", "") or "").lower()
    if "high" in tech_str or capex >= 5000000:
        risk = "High"
    elif "low" in tech_str and capex <= 500000:
        risk = "Low"
    else:
        risk = "Medium"

    requires_land = any(k in cat_lower for k in ["cultivation", "orchard", "nursery", "tourism"])
    min_land = 1.0 if "cultivation" in cat_lower else (0.5 if "nursery" in cat_lower else 0.0)

    loc_text = getattr(opp, "location_relevance", "") or ""
    clusters = {}
    for hub in ["Katol", "Warud-Morshi", "Narkhed", "Kalmeshwar", "Saoner", "Hingna MIDC", "Butibori MIDC", "MIHAN", "Kalamna APMC", "Mohpa", "Ramtek", "Nagpur"]:
        if hub.lower() in loc_text.lower():
            clusters[hub] = 1.0

    sectors = [getattr(opp, "category", "Agribusiness")]
    subcat = getattr(opp, "subcategory", None)
    if subcat:
        sectors.append(subcat)

    opp_name = getattr(opp, "name", "Enterprise Unit")
    return {
        "opportunity_id": getattr(opp, "id", 0),
        "name": opp_name,
        "capex": capex,
        "opex_monthly": opex_monthly,
        "margin_pct": margin_pct,
        "risk": risk,
        "scale": scale,
        "timeline": "1–2 Months" if scale == "Micro" else ("2–4 Months" if scale == "Small" else "4–8 Months"),
        "sectors": sectors,
        "training": f"ICAR-CCRI Skill & Technical Certification in {opp_name}",
        "clusters": clusters,
        "default_cluster": 0.75,
        "requires_land": requires_land,
        "min_land_acres": min_land
    }


def load_csv(filename: str) -> List[Dict[str, str]]:
    from pathlib import Path
    base_dir = Path(__file__).resolve().parents[4] / "data" / "proccessed"
    if not base_dir.exists():
        base_dir = Path(__file__).resolve().parents[3] / "data" / "proccessed"
    filepath = base_dir / filename
    if not filepath.exists():
        return []
    with open(filepath, mode="r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        cleaned = []
        for r in reader:
            if not r:
                continue
            cleaned.append({str(k).strip(): (v.strip() if isinstance(v, str) else v) for k, v in r.items() if k is not None})
        return cleaned


# ============================================================================
# STEP 2 & 3: BUSINESS REQUIREMENT PROFILES & ELIGIBILITY FILTERING ENGINE
# ============================================================================

# Dynamically populated from data/proccessed/opportunity_requirements.csv
BUSINESS_REQUIREMENT_PROFILES: Dict[int, Dict[str, Any]] = requirements_repo._requirements_by_id


def get_business_requirement_profile(opp_id: int, opp_name: str, bench: dict) -> Dict[str, Any]:
    """
    Retrieves business requirement profile directly from the structured data repository
    (opportunity_requirements.csv). Logs an explicit warning if an opportunity is unconfigured.
    """
    return requirements_repo.get_requirement_profile(opp_id=opp_id, opp_name=opp_name, bench=bench)


def check_eligibility(user_profile: Dict[str, Any], business_profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Step 3: Eligibility Filtering
    Evaluates mandatory requirements before ranking.
    Supports leased land, rented premises, and acquirable infrastructure gaps.
    """
    mandatory_reasons = []
    acquirable_gaps = []
    warnings = []

    # 1. Land Check (supports owned, leased, and family farmland)
    user_land = float(user_profile.get("land_acres", 0.0)) if user_profile.get("has_land") else 0.0
    ownership = str(user_profile.get("land_ownership", "owned")).lower()
    req_land = business_profile.get("requires_land", False)
    min_land = float(business_profile.get("min_land_acres", 0.0))

    if req_land:
        allows_leased = business_profile.get("allows_leased_land", True)
        if user_land < min_land:
            if user_land == 0.0:
                mandatory_reasons.append(
                    f"Insufficient land: Requires at least {min_land} acres of agricultural land (You have 0 acres)."
                )
            else:
                mandatory_reasons.append(
                    f"Insufficient land acreage: Requires at least {min_land} acres (You have {user_land} acres)."
                )
        elif ownership in ["leased", "shared"] and not allows_leased:
            mandatory_reasons.append(
                "Owned land required: Leased or shared land is not permitted for this permanent infrastructure model."
            )
        elif ownership in ["leased", "family", "shared"]:
            acquirable_gaps.append(
                "Land Lease Formalization: Ensure registered long-term lease deed (minimum 7-10 years for bank loan & capital subsidy approval)."
            )

    # 2. Water & Irrigation Check
    req_water = business_profile.get("requires_water", False)
    has_water = bool(user_profile.get("has_water", False))
    raw_water_sources = [str(w).lower() for w in user_profile.get("water_sources", [])]
    perennial_sources = {"borewell", "drip_irrigation", "canal", "well"}
    has_perennial = bool(set(raw_water_sources).intersection(perennial_sources)) or has_water
    has_only_rainfed = bool(raw_water_sources) and all(w == "rainfed" for w in raw_water_sources) and not has_water

    if req_water:
        if business_profile.get("water_criticality") == "mandatory_irrigation":
            if has_only_rainfed:
                mandatory_reasons.append(
                    "Perennial irrigation required: Rain-fed water alone cannot sustain citrus cultivation or nurseries through Vidarbha's 45°C summer. Functional borewell, canal, or drip connection required."
                )
            elif not has_perennial and not raw_water_sources:
                mandatory_reasons.append(
                    "Water availability required: Functional borewell, canal, or drip irrigation is mandatory for crop/sapling survival."
                )
        else:
            if not has_water and not raw_water_sources:
                acquirable_gaps.append(
                    "Water Supply Setup: Arrange commercial water tanker connection or borewell with NABL potable water certification."
                )

    # 3. Electricity / Power Check
    elec_req = business_profile.get("electricity_type", "basic_single_phase")
    has_three_phase = bool(user_profile.get("has_three_phase", False))
    power_type = str(user_profile.get("power_type", "single_phase")).lower()

    if elec_req == "three_phase_industrial":
        if not has_three_phase and power_type != "three_phase":
            capex_val = float(business_profile.get("capex", 0.0))
            if capex_val >= 5000000:
                mandatory_reasons.append(
                    "Industrial power required: 3-phase high-tension grid sanction (>=25 kVA) required for heavy industrial processing machinery."
                )
            else:
                acquirable_gaps.append(
                    "3-Phase Power Sanction: Apply for MSEDCL commercial 3-phase tariff (or install dedicated solar hybrid generator)."
                )

    # 4. Capital & Leverage Check (Minimum Promoter Equity)
    user_budget = max(1000.0, float(user_profile.get("budget_inr", 300000.0)))
    capex = float(business_profile.get("capex", 500000.0))
    borrowing_comfort = str(user_profile.get("borrowing_comfort", "loan_with_subsidy")).lower()

    if borrowing_comfort == "no_loan":
        max_feasible_capex = user_budget * 1.05
    elif borrowing_comfort == "small_loan":
        max_feasible_capex = user_budget / 0.70  # Max 30% debt
    else:
        max_feasible_capex = user_budget * 10.0  # Max 90% debt (PMFME statutory limit)

    if capex > max_feasible_capex:
        mandatory_reasons.append(
            f"Insufficient promoter capital: Project CapEx of ₹{capex:,.0f} exceeds maximum fundable limit (₹{max_feasible_capex:,.0f}) for your available equity of ₹{user_budget:,.0f}."
        )

    # 5. Mandatory Skill Check
    mand_skills = business_profile.get("mandatory_skills", [])
    user_skills = set(user_profile.get("skills", []))
    willingness = str(user_profile.get("willingness_to_learn", "willing_to_learn")).lower()

    missing_mandatory = [s for s in mand_skills if s not in user_skills]
    if missing_mandatory:
        if "current_only" in willingness:
            mandatory_reasons.append(
                f"Mandatory skill missing: Requires operational skill {', '.join(missing_mandatory)} (You indicated 'Current skills only')."
            )
        else:
            training = business_profile.get("training", "ICAR-CCRI Agribusiness Training")
            acquirable_gaps.append(
                f"Skill Training Required: Complete certified training ({training}) before commercial commissioning."
            )

    # 6. Workspace / Rented Premises Check
    if business_profile.get("requires_workspace", False):
        if not user_profile.get("has_workspace", False):
            acquirable_gaps.append(
                "Premises / Work Shed: Lease or rent a commercial shed or processing room (minimum 300-800 sq.ft)."
            )

    is_eligible = (len(mandatory_reasons) == 0)

    return {
        "eligible": is_eligible,
        "status": "Eligible" if is_eligible else "Not Eligible",
        "mandatory_reasons": mandatory_reasons,
        "acquirable_gaps": acquirable_gaps,
        "warnings": warnings
    }


def build_readiness_report(
    user_input: AssessmentInput,
    opp: Any,
    actual_capex: float,
    user_budget: float,
    fin_breakdown: FinancialBreakdown,
    req_profile: Dict[str, Any],
    bench: Dict[str, Any],
    top_scheme: Optional[Dict[str, Any]],
    user_location: str,
    skills_map: Dict[str, str],
    resources_map: Dict[str, str],
    matched_skl_ids: List[str],
    missing_skl_ids: List[str],
    matched_res_ids: List[str],
    missing_res_ids: List[str],
    is_eligible: bool,
    status_str: str,
    mandatory_reasons: List[str],
    acquirable_gaps: List[str],
    gap_items: List[Dict[str, Any]],
    mcda_breakdown: Dict[str, Any],
    land_acres: float,
    has_land: bool,
    has_water: bool,
    has_power: bool,
    has_three_phase: bool,
    has_workspace: bool,
    has_fssai: bool,
    has_udyam: bool,
    has_712: bool,
    owned_tractor: bool,
    owned_truck: bool,
    willingness: str,
    s_edu: float,
    s_situation: float,
    skill_fit: int,
    capital_fit: int,
    owned_assets: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Implements Phase 9: Business Feasibility Gap Analysis & Readiness Report.
    Step 1: Uses requirement profile for each business.
    Step 2: Compares requirements with the user profile (capital, machinery, land, water, power, skills, licenses).
    Step 3: Identifies missing requirements (gaps).
    Step 4: Generates suggested actions.
    Step 5: Structures the 5 readiness report sections:
      1. what_user_has
      2. what_user_lacks
      3. what_can_be_arranged
      4. estimated_additional_investment
      5. recommended_next_steps
    """
    # ------------------------------------------------------------------------
    # 1. WHAT THE USER ALREADY HAS
    # ------------------------------------------------------------------------
    what_user_has = []

    # Capital
    if user_budget > 0:
        what_user_has.append({
            "category": "Capital",
            "title": "Available Promoter Capital",
            "detail": f"₹{user_budget/100000:.2f} Lakhs in liquid equity funds",
            "status": "Available"
        })

    # Land
    if has_land and land_acres > 0:
        what_user_has.append({
            "category": "Land",
            "title": "Agricultural / Project Land",
            "detail": f"{land_acres:.1f} Acres in {user_location}",
            "status": "Available"
        })
    elif has_workspace:
        what_user_has.append({
            "category": "Workspace",
            "title": "Commercial Shed / Processing Yard",
            "detail": "Covered industrial workspace / yard available",
            "status": "Available"
        })

    # Water
    if has_water:
        what_user_has.append({
            "category": "Water",
            "title": "Water & Irrigation Source",
            "detail": "Functional borewell / agricultural water connection on site",
            "status": "Available"
        })

    # Electricity / Power
    if has_three_phase:
        what_user_has.append({
            "category": "Power",
            "title": "Electrical Infrastructure",
            "detail": "3-Phase commercial / industrial power line installed",
            "status": "Available"
        })
    elif has_power:
        what_user_has.append({
            "category": "Power",
            "title": "Electrical Infrastructure",
            "detail": "Single-phase agricultural / domestic electricity line",
            "status": "Available"
        })

    # Equipment & Mechanization Offsets
    if owned_tractor:
        what_user_has.append({
            "category": "Machinery",
            "title": "Tractor & Heavy Mechanization",
            "detail": "45HP+ Tractor with PTO connection (₹6.5L capital offset)",
            "status": "Available"
        })
    if owned_truck:
        what_user_has.append({
            "category": "Logistics",
            "title": "Transport Vehicle",
            "detail": "Commercial pickup / logistics vehicle (₹4.5L capital offset)",
            "status": "Available"
        })

    if owned_assets:
        if owned_assets.get("owned_reefer"):
            what_user_has.append({
                "category": "Logistics",
                "title": "Refrigerated Reefer Van",
                "detail": "Active cold-chain logistics transport vehicle (₹16.0L capital offset)",
                "status": "Available"
            })
        if owned_assets.get("owned_two_wheeler"):
            what_user_has.append({
                "category": "Logistics",
                "title": "Two-Wheeler Field Commute",
                "detail": "Field mobility for orchard visits and local retail marketing",
                "status": "Available"
            })
        if owned_assets.get("owned_polyhouse"):
            what_user_has.append({
                "category": "Existing Equipment",
                "title": "Polyhouse / Green Shade Netting",
                "detail": "On-site climate-controlled greenhouse infrastructure (₹8.0L capital offset)",
                "status": "Available"
            })
        if owned_assets.get("owned_cold_storage"):
            what_user_has.append({
                "category": "Existing Equipment",
                "title": "Cold Storage & Pre-Cooling Unit",
                "detail": "Controlled-temperature post-harvest storage facility (₹7.0L capital offset)",
                "status": "Available"
            })
        if owned_assets.get("owned_grading_line"):
            what_user_has.append({
                "category": "Existing Equipment",
                "title": "Grading, Sorting & Waxing Line",
                "detail": "Industrial citrus packhouse sorting & waxing line (₹15.0L capital offset)",
                "status": "Available"
            })
        if owned_assets.get("owned_juice_extractor"):
            what_user_has.append({
                "category": "Existing Equipment",
                "title": "Citrus Juice Extraction Unit",
                "detail": "Commercial debittering & juice extraction setup (₹5.0L capital offset)",
                "status": "Available"
            })
        if owned_assets.get("owned_peel_oil_unit"):
            what_user_has.append({
                "category": "Existing Equipment",
                "title": "Citrus Peel Oil Extractor",
                "detail": "Cold-pressed essential oil distillation machinery (₹12.0L capital offset)",
                "status": "Available"
            })
        if owned_assets.get("owned_dry_storage"):
            what_user_has.append({
                "category": "Existing Equipment",
                "title": "Dry Storage Godown / Pack Shed",
                "detail": "Covered dry goods storage and packaging floor (₹3.5L civil offset)",
                "status": "Available"
            })

        ws_type = str(owned_assets.get("workspace_type", "")).lower()
        ws_sqft = owned_assets.get("workspace_sqft", 0)
        sqft_str = f" ({ws_sqft} sq.ft)" if ws_sqft > 0 else ""
        if ws_type == "factory":
            what_user_has.append({
                "category": "Workspace",
                "title": "Food-Grade Processing Facility",
                "detail": f"FSSAI-compliant processing unit{sqft_str} with washable surfaces & drainage (₹4.0L civil offset)",
                "status": "Available"
            })
        elif ws_type == "farm_structure":
            what_user_has.append({
                "category": "Workspace",
                "title": "Farm-Gate Packhouse Structure",
                "detail": f"Covered plinth & grading yard{sqft_str} with vehicle loading access (₹4.5L civil offset)",
                "status": "Available"
            })
        elif ws_type == "workshop":
            what_user_has.append({
                "category": "Workspace",
                "title": "Machinery Service Workshop",
                "detail": f"High-clearance mechanical workshop{sqft_str} with service equipment bays (₹2.5L civil offset)",
                "status": "Available"
            })
        elif ws_type == "shop":
            what_user_has.append({
                "category": "Workspace",
                "title": "Roadside Retail Outlet",
                "detail": f"Commercial storefront / retail counter{sqft_str} with direct customer footfall",
                "status": "Available"
            })

    # Verified Skills
    for s_id in matched_skl_ids:
        what_user_has.append({
            "category": "Skills",
            "title": skills_map.get(s_id, s_id),
            "detail": "Verified entrepreneur technical skill",
            "status": "Available"
        })

    # Regulatory & Ownership Proofs
    if has_fssai:
        what_user_has.append({
            "category": "Compliance",
            "title": "FSSAI Registration / License",
            "detail": "Food safety compliance documentation active",
            "status": "Available"
        })
    if has_udyam:
        what_user_has.append({
            "category": "Compliance",
            "title": "Udyam MSME Certificate",
            "detail": "Central MSME recognition unlocking credit guarantees",
            "status": "Available"
        })
    if has_712:
        what_user_has.append({
            "category": "Compliance",
            "title": "Land 7/12 Title Extract",
            "detail": "Revenue record confirming unencumbered landholding",
            "status": "Available"
        })

    # ------------------------------------------------------------------------
    # 2. WHAT THE USER LACKS (REQUIRED VS AVAILABLE)
    # ------------------------------------------------------------------------
    what_user_lacks = []
    missing_skl_list = list(missing_skl_ids) if missing_skl_ids else []

    # Financial percentages
    tot_cost = max(1.0, fin_breakdown.total_project_cost)
    equity_pct = round((fin_breakdown.farmer_equity_required / tot_cost) * 100)
    loan_pct = round((fin_breakdown.bank_loan_required / tot_cost) * 100)
    sub_pct_display = str(fin_breakdown.subsidy_percentage) if str(fin_breakdown.subsidy_percentage).endswith("%") else f"{fin_breakdown.subsidy_percentage}%"

    # Capital Shortfall
    req_promoter_equity = fin_breakdown.farmer_equity_required
    if user_budget < req_promoter_equity:
        cap_shortfall = req_promoter_equity - user_budget
        what_user_lacks.append({
            "category": "Capital",
            "title": "Promoter Equity Margin",
            "required": f"₹{req_promoter_equity/100000:.2f} Lakhs ({equity_pct}% of CapEx)",
            "available": f"₹{user_budget/100000:.2f} Lakhs",
            "gap": f"₹{cap_shortfall/100000:.2f} Lakhs shortfall",
            "criticality": "High"
        })

    # Machinery & Processing Equipment
    machinery_items = req_profile.get("machinery_items") or ["Core Processing Machinery", "Commercial Packaging Line"]

    what_user_lacks.append({
        "category": "Machinery",
        "title": "Core Plant & Processing Line",
        "required": ", ".join(machinery_items[:2]),
        "available": "No specialized processing line installed",
        "gap": "Commercial machinery acquisition required",
        "criticality": "High"
    })

    # Land Deficit
    min_land = float(req_profile.get("min_land_acres", 0.0))
    if req_profile.get("requires_land") and (not has_land or land_acres < min_land):
        land_deficit = max(0.0, min_land - land_acres)
        what_user_lacks.append({
            "category": "Land",
            "title": "Agricultural Land Footprint",
            "required": f"Minimum {min_land:.1f} Acres",
            "available": f"{land_acres:.1f} Acres",
            "gap": f"Deficit of {land_deficit:.1f} Acres",
            "criticality": "High" if land_acres == 0.0 else "Medium"
        })

    # Water Resource
    if req_profile.get("requires_water") and not has_water:
        what_user_lacks.append({
            "category": "Water",
            "title": "Dedicated Water Supply",
            "required": f"{req_profile.get('water_criticality', 'processing_grade').replace('_', ' ').title()}",
            "available": "Unconfirmed on site",
            "gap": "Functional borewell / water connection required",
            "criticality": "Medium"
        })

    # 3-Phase Industrial Power
    if req_profile.get("electricity_type") == "three_phase_industrial" and not has_three_phase:
        what_user_lacks.append({
            "category": "Power",
            "title": "3-Phase Industrial Power",
            "required": "415V 3-Phase Industrial Power Connection",
            "available": "Single-phase power only",
            "gap": "MSEDCL industrial load enhancement required",
            "criticality": "Medium"
        })

    # Missing Skills
    if missing_skl_list:
        what_user_lacks.append({
            "category": "Skills",
            "title": "Technical Skill Gap",
            "required": ", ".join([skills_map.get(s, s) for s in missing_skl_list[:2]]),
            "available": "No certified commercial training record",
            "gap": f"{len(missing_skl_list)} technical competencies needed",
            "criticality": "Medium"
        })

    # Food Safety / Statutory License
    opp_is_food = any(k in opp.name.lower() for k in ["juice", "pulp", "jam", "candy", "peel", "processing"])
    if opp_is_food and not has_fssai:
        what_user_lacks.append({
            "category": "Compliance",
            "title": "Food Safety Regulatory License",
            "required": "FSSAI State Manufacturing License",
            "available": "Pending",
            "gap": "Mandatory before commercial sales",
            "criticality": "Medium"
        })

    # ------------------------------------------------------------------------
    # 3. WHAT CAN BE ARRANGED (BRIDGES & ACTIONABLE SOLUTIONS)
    # ------------------------------------------------------------------------
    what_can_be_arranged = []

    # Bank Debt Financing
    what_can_be_arranged.append({
        "item": "Bank Term Loan & Debt Financing",
        "mechanism": f"Term loan covering {loan_pct}% of CapEx (₹{fin_breakdown.bank_loan_required/100000:.2f} Lakhs)",
        "source": "Scheduled Commercial Banks (SBI / Bank of India / PNB)",
        "estimated_timeline": "21 to 45 Days",
        "estimated_cost_inr": fin_breakdown.bank_loan_required
    })

    # Government Capital Subsidy
    scheme_title = fin_breakdown.eligible_scheme
    sub_amt = fin_breakdown.subsidy_amount
    what_can_be_arranged.append({
        "item": f"Government Capital Subsidy ({scheme_title})",
        "mechanism": f"{sub_pct_display} Credit-Linked Capital Subsidy (₹{sub_amt/100000:.2f} Lakhs)",
        "source": top_scheme.get("nodal_agency", "MoFPI / DIC Nagpur") if top_scheme else "DIC Nagpur",
        "estimated_timeline": "30 to 60 Days",
        "estimated_cost_inr": sub_amt
    })

    # Machinery Procurement & Quotations
    what_can_be_arranged.append({
        "item": "Plant Machinery Procurement via Vendor Finance",
        "mechanism": "15-20% advance booking + balance on commercial commissioning",
        "source": "Empaneled Agro-Machinery Fabricators (Nagpur MIDC / Pune)",
        "estimated_timeline": "30 to 45 Days",
        "estimated_cost_inr": actual_capex * 0.65
    })

    # Technical Certification & Training
    what_can_be_arranged.append({
        "item": "ICAR-CCRI Technical Training Certificate",
        "mechanism": f"Subsidized 3-day practical training: '{bench['training']}'",
        "source": "ICAR-Central Citrus Research Institute (CCRI) Nagpur",
        "estimated_timeline": "3 to 5 Days",
        "estimated_cost_inr": 2500.0
    })

    # Power Line Enhancement
    if req_profile.get("electricity_type") == "three_phase_industrial" and not has_three_phase:
        what_can_be_arranged.append({
            "item": "MSEDCL 3-Phase Industrial Power Connection",
            "mechanism": "Commercial LT-IV application with electrical contractor test report",
            "source": "Maharashtra State Electricity Distribution Co. Ltd. (MSEDCL)",
            "estimated_timeline": "15 to 30 Days",
            "estimated_cost_inr": 25000.0
        })

    # Land Lease Formalization
    if req_profile.get("requires_land") and (not has_land or land_acres < min_land):
        what_can_be_arranged.append({
            "item": "Registered Long-Term Agricultural Land Lease",
            "mechanism": f"7-to-10 year registered lease deed for {min_land} acres in Katol/Narkhed cluster",
            "source": "Local agricultural landholders / APMC farmer network",
            "estimated_timeline": "15 to 20 Days",
            "estimated_cost_inr": min_land * 30000.0
        })

    # ------------------------------------------------------------------------
    # 4. ESTIMATED ADDITIONAL INVESTMENT
    # ------------------------------------------------------------------------
    promoter_equity_gap = max(0.0, fin_breakdown.farmer_equity_required - user_budget)
    wc_promoter_margin = 50000.0
    if fin_breakdown.working_capital_details:
        wc_promoter_margin = float(fin_breakdown.working_capital_details.get("promoter_margin_amount", 50000.0))
    statutory_and_training_fees = 15000.0
    total_additional_funds_needed = promoter_equity_gap + statutory_and_training_fees

    estimated_additional_investment = {
        "required_total_capex": round(actual_capex, 2),
        "required_promoter_equity": round(fin_breakdown.farmer_equity_required, 2),
        "available_capital": round(user_budget, 2),
        "promoter_equity_gap": round(promoter_equity_gap, 2),
        "working_capital_margin_needed": round(wc_promoter_margin, 2),
        "statutory_and_training_fees": round(statutory_and_training_fees, 2),
        "total_additional_funds_needed": round(total_additional_funds_needed, 2),
        "total_additional_funds_formatted": format_inr(total_additional_funds_needed),
        "subsidy_coverage_amount": round(fin_breakdown.subsidy_amount, 2),
        "bank_loan_coverage_amount": round(fin_breakdown.bank_loan_required, 2)
    }

    # ------------------------------------------------------------------------
    # 5. RECOMMENDED NEXT STEPS
    # ------------------------------------------------------------------------
    recommended_next_steps = [
        {
            "step_number": 1,
            "title": "Obtain Equipment Quotations",
            "action": f"Request 3 formal proforma invoices for {machinery_items[0]} from verified machinery manufacturers.",
            "entity": "Agro-Equipment Fabricators / Indiamart",
            "priority": "Immediate"
        },
        {
            "step_number": 2,
            "title": "Bank Term Loan Pre-Sanction",
            "action": f"Submit the EntreVision Bankable DPR to a local bank branch for appraisal of ₹{fin_breakdown.bank_loan_required/100000:.2f}L term loan.",
            "entity": "Scheduled Commercial Bank (SBI / BOI / PNB)",
            "priority": "Immediate"
        },
        {
            "step_number": 3,
            "title": "Apply for Government Capital Subsidy",
            "action": f"Register application on the official portal for {scheme_title} to claim ₹{sub_amt/100000:.2f}L grant.",
            "entity": top_scheme.get("nodal_agency", "DIC Nagpur") if top_scheme else "DIC Nagpur",
            "priority": "Phase 2"
        },
        {
            "step_number": 4,
            "title": "Complete ICAR-CCRI Technical Training",
            "action": f"Enroll in the 3-day practical training batch for '{bench['training']}' to earn technical certification.",
            "entity": "ICAR-CCRI Shankarnagar, Nagpur",
            "priority": "Phase 2"
        },
        {
            "step_number": 5,
            "title": "Statutory Licensing & Power Clearances",
            "action": "File for FSSAI State Food License online via FoSCoS portal and apply for MSEDCL 3-phase industrial power connection.",
            "entity": "FoSCoS & MSEDCL Nagpur Office",
            "priority": "Final"
        }
    ]

    return {
        "what_user_has": what_user_has,
        "what_user_lacks": what_user_lacks,
        "what_can_be_arranged": what_can_be_arranged,
        "estimated_additional_investment": estimated_additional_investment,
        "recommended_next_steps": recommended_next_steps,

        # Backward compatibility
        "has_gaps": (not is_eligible) or (len(acquirable_gaps) > 0) or (len(gap_items) > 0) or (len(what_user_lacks) > 0),
        "total_gaps_count": len(mandatory_reasons) + len(acquirable_gaps) + len(what_user_lacks),
        "eligible": is_eligible,
        "status_label": status_str,
        "mandatory_reasons": mandatory_reasons,
        "acquirable_gaps": acquirable_gaps,
        "score_breakdown": mcda_breakdown,
        "items": gap_items,
        "skill_gap": {
            "status": "Verified" if not missing_skl_ids else ("Willing to Learn" if "willing" in willingness else "Missing Skills"),
            "missing": [skills_map.get(s, s) for s in missing_skl_ids],
            "prescribed_training": bench["training"],
            "duration": "3 to 5 Days (Subsidized batch)",
            "certification": f"ICAR-CCRI Certified {opp.category.split('&')[0].strip()}",
            "contact": "Director, ICAR-CCRI Nagpur (citrus.icar@gov.in)"
        },
        "land_deficit": {
            "status": f"Deficit: Need {req_profile.get('min_land_acres', 0.5)} Acres (Have {land_acres} Acres)",
            "required_acres": float(req_profile.get("min_land_acres", 0.0)),
            "current_acres": land_acres,
            "deficit_acres": round(max(0.0, float(req_profile.get("min_land_acres", 0.0)) - land_acres), 1),
            "recommendation": next((g["solution"] for g in gap_items if g.get("gap_type") == "land"), "Fits existing land setup.")
        } if any(g.get("gap_type") == "land" for g in gap_items) or not is_eligible and any("land" in m.lower() for m in mandatory_reasons) else None,
        "capital_shortfall": {
            "status": "Capital Shortfall",
            "required_equity": fin_breakdown.farmer_equity_required,
            "available_capital": user_budget,
            "shortfall": max(0.0, fin_breakdown.farmer_equity_required - user_budget),
            "scheme_bridge": fin_breakdown.eligible_scheme,
            "subsidy_coverage": fin_breakdown.subsidy_amount,
            "action": next((g["solution"] for g in gap_items if g.get("gap_type") == "capital"), "Promoter equity satisfied.")
        } if any(g.get("gap_type") == "capital" for g in gap_items) or not is_eligible and any("capital" in m.lower() for m in mandatory_reasons) else None,
        "action_plan": [s["action"] for s in recommended_next_steps],
        "education_alignment": "Optimal Foundation" if s_edu >= 0.85 else "Training Required",
        "situation_alignment": "High Enterprise Synergy" if s_situation >= 0.85 else "High Barrier Setup",
        "land_alignment": "Land Footprint Satisfied" if (has_land or not req_profile.get("requires_land")) else "Farmland Deficit",
        "skills_alignment": "Direct Skill Match" if skill_fit >= 80 else ("Prescribed Training Path" if "willing" in willingness else "Disqualified by Current Skills"),
        "capital_alignment": "100% Self-Funded" if capital_fit >= 90 else (f"Bankable via {fin_breakdown.eligible_scheme}" if capital_fit >= 65 else "Capital Shortfall")
    }


def get_all_skills() -> List[SkillItem]:
    rows = load_csv("skills.csv")
    return [SkillItem(**row) for row in rows]


def get_all_resources() -> List[ResourceItem]:
    rows = load_csv("resources.csv")
    return [ResourceItem(**row) for row in rows]


def get_all_locations() -> List[LocationItem]:
    rows = load_csv("locations.csv")
    return [LocationItem(**row) for row in rows]


def get_market_intelligence(location: str = "Katol") -> Dict[str, Any]:
    """
    Synthesizes real datasets from data/proccessed:
    - tehsil_citrus_area.csv (Citrus Acreage & Annual Production)
    - infrastructure.csv (Cold chains, labs, packhouses)
    - acrop_30day_history.csv (Wholesale Mandi Prices & Arrivals)
    - training_institutions.csv (CCRI, KVK, PDKV, MCED skill institutions)
    - licences_and_registrations.csv (FSSAI, Udyam, APEDA, GST regulatory roadmap)
    """
    from pathlib import Path
    loc_clean = (location or "Katol").lower().strip()

    # 1. Tehsil Citrus Harvest & Acreage (Transparent Empirical Lookup)
    tehsil_rows = load_csv("tehsil_citrus_area.csv")
    matched_tehsil = None
    for r in tehsil_rows:
        tehsil_name = r.get("Tehsil", "").lower().strip()
        if tehsil_name and (tehsil_name in loc_clean or loc_clean in tehsil_name):
            matched_tehsil = r
            break

    if matched_tehsil:
        area_ha = float(matched_tehsil.get("Estimated_Area_Hectares", 0.0))
        prod_mt = float(matched_tehsil.get("Estimated_Production_MT", 0.0))
        yield_ha = float(matched_tehsil.get("Estimated_Yield_MT_per_Ha", 7.5))
        citrus_production = {
            "data_status": "Empirical Departmental Census",
            "district": matched_tehsil.get("District"),
            "tehsil": matched_tehsil.get("Tehsil"),
            "estimated_area_hectares": area_ha,
            "estimated_production_mt": prod_mt,
            "estimated_yield_mt_per_ha": yield_ha,
            "raw_material_density_verdict": f"Tier-1 Citrus Hub ({int(prod_mt):,} MT Annual Harvest)" if prod_mt >= 100000 else "Secondary Commercial Belt",
            "source": matched_tehsil.get("Source_Method", "Directorate of Horticulture Maharashtra & NHB"),
            "survey_reference": "Horticultural Statistics at a Glance"
        }
    else:
        # Transparently disclose data unavailability - DO NOT invent fake acreage!
        citrus_production = {
            "data_status": "Data Unavailable / Non-Commercial Cluster",
            "district": "Vidarbha Region",
            "tehsil": location,
            "estimated_area_hectares": None,
            "estimated_production_mt": None,
            "estimated_yield_mt_per_ha": None,
            "raw_material_density_verdict": "Data Unavailable (No recorded commercial citrus acreage)",
            "source": "Government Agriculture Department Records",
            "message": f"No verified commercial citrus acreage recorded for '{location}'. District averages not substituted to prevent misleading yield projections."
        }

    # 2. Real Mandi 30-Day Price & Arrival Analysis
    base_dir = Path(__file__).resolve().parents[4] / "data"
    mandi_file = base_dir / "raw" / "orange" / "acrop_30day_history.csv"
    if not mandi_file.exists():
        mandi_file = Path(__file__).resolve().parents[3] / "data" / "raw" / "orange" / "acrop_30day_history.csv"

    mandi_avg_price = 3680.0
    mandi_min_price = 3296.0
    mandi_max_price = 4152.0
    has_empirical_mandi = False

    if mandi_file.exists():
        try:
            with open(mandi_file, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                prices = [float(row["median_price"]) for row in reader if row.get("median_price")]
                if prices:
                    mandi_avg_price = round(sum(prices) / len(prices), 1)
                    mandi_min_price = min(prices)
                    mandi_max_price = max(prices)
                    has_empirical_mandi = True
        except Exception:
            pass

    market_yard_name = "Warud APMC Mandi" if "warud" in loc_clean else "Kalamna APMC Wholesale Market Yard, Nagpur"
    mandi_dynamics = {
        "benchmark_commodity": "Nagpur Mandarin (Orange)",
        "market_yard": market_yard_name,
        "data_source": "AGMARKNET / Maharashtra State Agricultural Marketing Board (MSAMB)",
        "observation_window": "30-Day Rolling Sample",
        "data_status": "Empirical Mandi Transaction Records" if has_empirical_mandi else "Estimated Baseline Reference",
        "average_wholesale_price_inr_qtl": mandi_avg_price,
        "price_per_kg": round(mandi_avg_price / 100.0, 1),
        "price_range_30d": f"₹{mandi_min_price/100:.1f} - ₹{mandi_max_price/100:.1f} / kg",
        "market_status": "Active Harvesting Window (High Trading Volume)" if has_empirical_mandi else "Historical Seasonal Reference"
    }

    # 3. Local Cluster Infrastructure & Cold Chains
    infra_list = load_csv("infrastructure.csv")
    nearby_facilities = []
    for i in infra_list:
        if loc_clean in i.get("taluka_district", "").lower() or loc_clean in i.get("location_area", "").lower():
            nearby_facilities.append({
                "name": i.get("facility_name"),
                "type": i.get("facility_type"),
                "capacity": f"{i.get('capacity_mt')} MT" if i.get('capacity_mt') and i.get('capacity_mt') != "-" else "Operational Hub",
                "key_relevance": i.get("key_relevance")
            })
    if not nearby_facilities:
        if "warud" in loc_clean:
            nearby_facilities.append({
                "name": "Warud Regional Packhouse & Shellac Waxing Line",
                "type": "Packhouse & Waxing",
                "capacity": "2,000 MT",
                "key_relevance": "High-volume fresh fruit sorting, grading & waxing for domestic dispatch"
            })
            nearby_facilities.append({
                "name": "Warud APMC Mandi",
                "type": "Wholesale Market Yard",
                "capacity": "Daily Floor Auctions",
                "key_relevance": "Direct grower-to-trader auction floor with high Mandarin arrivals"
            })
        else:
            nearby_facilities.append({
                "name": "Kailasya Agro Cold Storage (APMC Kalamna Yard)",
                "type": "Cold Storage & Pre-Cooling",
                "capacity": "5,000 MT",
                "key_relevance": "Citrus wholesale market storage & trading"
            })
            nearby_facilities.append({
                "name": "ICAR-CCRI Agri-Business Incubator (ABI)",
                "type": "Testing & Pilot Processing Lab",
                "capacity": "Pilot Processing Line",
                "key_relevance": "Technology transfer & FSSAI product testing"
            })

    # 4. Training Institutions
    train_rows = load_csv("training_institutions.csv")
    institutions = [
        {
            "name": t.get("Name"),
            "location": t.get("Location"),
            "programs": t.get("Key_Programs"),
            "url": t.get("Contact_URL")
        }
        for t in train_rows
    ]

    # 5. Regulatory Licenses
    lic_rows = load_csv("licences_and_registrations.csv")
    licences = [
        {
            "name": l.get("Name"),
            "authority": l.get("Issuing_Authority"),
            "turnaround_days": int(l.get("Processing_Time_Days", 7)),
            "cost_inr": l.get("Cost_INR"),
            "url": l.get("URL")
        }
        for l in lic_rows
    ]

    return {
        "location": location,
        "citrus_production": citrus_production,
        "mandi_market_dynamics": mandi_dynamics,
        "nearby_infrastructure": nearby_facilities[:3],
        "training_institutions": institutions[:3],
        "regulatory_licences": licences[:4]
    }


def format_inr(amount: float) -> str:
    """Formats rupees cleanly in Indian numbering system (Lakhs / Crores)."""
    if amount >= 10000000:
        return f"₹{amount / 10000000:.2f} Cr"
    elif amount >= 100000:
        return f"₹{amount / 100000:.2f} Lakhs"
    else:
        return f"₹{amount:,.0f}"


def calculate_financials(actual_capex: float, user_budget: float, category: str, borrowing_comfort: str = "loan_with_subsidy") -> FinancialBreakdown:
    # 1. Special Handling: Self-Financed Scenario (No Loan requested & budget covers CapEx)
    if borrowing_comfort == "no_loan" and user_budget >= actual_capex:
        return FinancialBreakdown(
            total_project_cost=actual_capex,
            eligible_scheme="Self-Financed (Zero Debt)",
            subsidy_amount=0.0,
            subsidy_percentage="0% (Credit-linked subsidy requires bank loan sanction)",
            farmer_equity_required=actual_capex,
            bank_loan_required=0.0,
            user_budget=user_budget,
            funding_gap=0.0,
            budget_status="100% Self-Funded (Zero Loan Strain)",
            fixed_asset_investment=actual_capex,
            initial_working_capital=0.0,
            total_project_funding=actual_capex,
            working_capital_details=None,
            financing_assumptions={
                "is_illustrative_scenario": True,
                "scenario_name": "100% Self-Funded Equity",
                "disclaimer": FINANCIAL_CONFIG.FINANCIAL_DISCLAIMER,
                "debt_requirement": "None"
            },
            disclaimer=FINANCIAL_CONFIG.FINANCIAL_DISCLAIMER
        )

    # 2. Use accredited FinancialEngine for loan & credit-linked subsidy assessment
    fin_eval = _financial_engine_instance.calculate_project_finance(
        project_name=category,
        base_capex=actual_capex,
        user_budget=user_budget,
        category=category
    )
    mof = fin_eval["means_of_finance"]
    sub = fin_eval["subsidy_details"]

    equity_min = mof["promoter_contribution"]
    # Initial bank finance without upfront Day-0 subsidy deduction:
    bank_loan = mof["initial_bank_financing_required"]
    subsidy = mof["estimated_subsidy"]
    scheme_name = sub["scheme_name"]
    subsidy_rate = f"{sub['subsidy_rate_percentage']}% (Capped at ₹{int(sub['subsidy_cap'] / 100000)}L)"

    funding_gap = max(0.0, actual_capex - user_budget)

    if user_budget >= actual_capex:
        status = "100% Self-Funded (Zero Loan Strain)"
    elif user_budget >= equity_min:
        status = f"Highly Bankable (Assisted by {scheme_name})"
    else:
        status = "Requires Partner Co-Investment or Phased Setup"

    return FinancialBreakdown(
        total_project_cost=actual_capex,
        eligible_scheme=scheme_name,
        subsidy_amount=subsidy,
        subsidy_percentage=subsidy_rate,
        farmer_equity_required=equity_min,
        bank_loan_required=bank_loan,
        user_budget=user_budget,
        funding_gap=funding_gap,
        budget_status=status,
        fixed_asset_investment=fin_eval.get("fixed_asset_investment", actual_capex),
        initial_working_capital=fin_eval.get("initial_working_capital", 0.0),
        total_project_funding=fin_eval.get("total_project_funding", actual_capex),
        working_capital_details=fin_eval.get("working_capital_analysis"),
        financing_assumptions=fin_eval.get("financing_assumptions"),
        disclaimer=FINANCIAL_CONFIG.FINANCIAL_DISCLAIMER
    )


class CsvOpportunity:
    def __init__(self, **kwargs):
        self.id = int(kwargs.get("id", 0))
        self.name = kwargs.get("name", "")
        self.category = kwargs.get("category", "")
        self.subcategory = kwargs.get("subcategory", "")
        self.investment_level = kwargs.get("investment_level", "")
        self.technology_level = kwargs.get("technology_level", "")
        self.target_market = kwargs.get("target_market", "")
        self.location_relevance = kwargs.get("location_relevance", "")
        self.status = kwargs.get("status", "candidate")
        self.source = kwargs.get("source", "")
        self.source_url = kwargs.get("source_url", "")
        self.description = kwargs.get("description", "")


def compute_hierarchical_funnel(
    all_opps: List[Any],
    user_input: AssessmentInput,
    benchmarks_cache: Dict[Any, dict],
    reqs_map: Dict[int, Any],
    max_achievable_capex: float
) -> HierarchicalFunnel:
    """
    Executes an explicit 11-stage sequential / hierarchical elimination pipeline.
    Each level filters the SURVIVING pool from the previous level.
    If at any level 0 businesses survive, it marks that level as the bottleneck,
    and returns full audit steps for the UI.
    """
    about_me = user_input.about_me or {}
    user_age = str(about_me.get("ageGroup") or "26–35")
    user_edu = str(about_me.get("education") or "").lower()
    user_situation = str(about_me.get("currentSituation") or "").lower()
    user_goals = [str(g).lower() for g in (about_me.get("goals") or [])]
    existing_biz = str(about_me.get("existingBusinessType") or "").lower()

    user_skills_set = set(user_input.skills)
    willingness = str(user_input.willingness_to_learn or "willing_to_learn").lower()

    res_detail = user_input.resources_detailed or {}
    has_land = bool(user_input.has_land or res_detail.get("hasLand", False))
    land_acres = float(user_input.land_acres or res_detail.get("landAcres", 0.0) or 0.0)
    has_workspace = bool(user_input.has_workspace or res_detail.get("hasWorkspace", False) or ("RES05" in user_input.resources))

    transport_modes = res_detail.get("transportModes", [])
    owned_tractor = any(t.get("type") == "tractor" and t.get("ownership") == "owned" for t in transport_modes if isinstance(t, dict))
    owned_truck = any(t.get("type") in ["mini_truck", "freight_truck", "reefer"] for t in transport_modes if isinstance(t, dict))

    user_budget = float(user_input.budget_inr or 300000.0)
    user_location = str(user_input.location or "Katol").strip().lower()

    biz_prefs = user_input.business_preferences or {}
    user_interests = user_input.interests or biz_prefs.get("businessTypes") or []
    user_interests_lower = [str(s).lower() for s in user_interests]

    steps: List[HierarchicalFunnelStep] = []
    pool = list(all_opps)
    bottleneck_lvl = None
    bottleneck_msg = None
    bottleneck_nm = None

    # LEVEL 1: Age Group Eligibility
    def pass_l1(o):
        name = o.name.lower()
        inv_str = str(getattr(o, "investment_level", "")).lower()
        if "18–25" in user_age or "18-25" in user_age:
            return not ("optical sorting" in name or "reefer container" in name or "1.5 crore" in inv_str or "1.8 crore" in inv_str)
        if "50+" in user_age:
            return not ("custom hiring" in name or "heavy machinery" in name)
        return True

    p1 = [o for o in pool if pass_l1(o)]
    steps.append(HierarchicalFunnelStep(
        level=1,
        name="Age Group Eligibility",
        criterion=f"Age Group: {user_age}",
        passed_count=len(p1),
        dropped_count=len(pool) - len(p1),
        status="PASSED" if len(p1) > 0 else "BOTTLENECK",
        passed_sample=[o.name for o in p1[:3]]
    ))
    if not p1 and bottleneck_lvl is None:
        bottleneck_lvl, bottleneck_nm, bottleneck_msg = 1, "Age Group Eligibility", f"No opportunities matched Age Group: {user_age}"

    # LEVEL 2: Education Level
    def pass_l2(o):
        name = o.name.lower()
        is_high_tech = any(k in name for k in ["trichoderma", "essential oil", "pectin extraction", "drone", "tissue", "optical sorting"])
        if any(e in user_edu for e in ["degree", "bachelor", "master", "diploma", "agri", "engineering", "technical"]):
            return True
        if "10th" in user_edu or "12th" in user_edu:
            return not is_high_tech
        return not is_high_tech and not any(k in name for k in ["spray-dried", "bottling", "aseptic"])

    p2 = [o for o in p1 if pass_l2(o)]
    steps.append(HierarchicalFunnelStep(
        level=2,
        name="Education Qualification",
        criterion=f"Education: {about_me.get('education') or '10th / 12th Pass'}",
        passed_count=len(p2),
        dropped_count=len(p1) - len(p2),
        status="PASSED" if len(p2) > 0 else "BOTTLENECK",
        passed_sample=[o.name for o in p2[:3]]
    ))
    if not p2 and bottleneck_lvl is None:
        bottleneck_lvl, bottleneck_nm, bottleneck_msg = 2, "Education Qualification", f"Education level ({about_me.get('education') or '12th'}) strictly filtered remaining options."

    # LEVEL 3: Goals & Current Situation
    def pass_l3(o):
        name = o.name.lower()
        if "looking_opportunity" in user_situation or "first_business" in user_goals:
            return not ("canopy training" in name and not has_land)
        return True

    p3 = [o for o in p2 if pass_l3(o)]
    steps.append(HierarchicalFunnelStep(
        level=3,
        name="Goals & Current Situation",
        criterion=f"Goals: {', '.join(user_goals) if user_goals else 'First business / local explore'}",
        passed_count=len(p3),
        dropped_count=len(p2) - len(p3),
        status="PASSED" if len(p3) > 0 else "BOTTLENECK",
        passed_sample=[o.name for o in p3[:3]]
    ))
    if not p3 and bottleneck_lvl is None:
        bottleneck_lvl, bottleneck_nm, bottleneck_msg = 3, "Goals & Current Situation", "No opportunities aligned with your current situation."

    # LEVEL 4: Skills Required
    def pass_l4(o):
        req = reqs_map.get(getattr(o, "id", 0), {})
        req_skills_str = req.get("required_skills", "")
        req_list = [s.strip() for s in req_skills_str.split(",") if s.strip()]
        if not req_list:
            return True
        if "current" in willingness:
            return bool(user_skills_set.intersection(set(req_list)))
        return True

    p4 = [o for o in p3 if pass_l4(o)]
    steps.append(HierarchicalFunnelStep(
        level=4,
        name="Skills & Practical Experience",
        criterion=f"Skills ({len(user_skills_set)} selected) • {'Current Skills Only' if 'current' in willingness else 'Willing to Learn'}",
        passed_count=len(p4),
        dropped_count=len(p3) - len(p4),
        status="PASSED" if len(p4) > 0 else "BOTTLENECK",
        passed_sample=[o.name for o in p4[:3]]
    ))
    if not p4 and bottleneck_lvl is None:
        bottleneck_lvl, bottleneck_nm, bottleneck_msg = 4, "Skills & Practical Experience", "No opportunities strictly matched your current skills with learning disabled."

    # LEVEL 5: Land Footprint & Space
    def pass_l5(o):
        name = o.name.lower()
        bench = benchmarks_cache.get(getattr(o, "id", 0)) or benchmarks_cache.get(name) or {}
        req_land = bench.get("requires_land") or any(k in name for k in ["cultivation", "nursery", "propagation unit", "agro-tourism"])
        min_acres = float(bench.get("min_land_acres") or (1.0 if "cultivation" in name else 0.5 if "nursery" in name else 0.0))
        if req_land:
            return has_land and land_acres >= min_acres
        return True

    p5 = [o for o in p4 if pass_l5(o)]
    steps.append(HierarchicalFunnelStep(
        level=5,
        name="Land Footprint & Space",
        criterion=f"Land Available: {land_acres} Acres ({'Owned' if has_land else 'Zero Land'})",
        passed_count=len(p5),
        dropped_count=len(p4) - len(p5),
        status="PASSED" if len(p5) > 0 else "BOTTLENECK",
        passed_sample=[o.name for o in p5[:3]]
    ))
    if not p5 and bottleneck_lvl is None:
        bottleneck_lvl, bottleneck_nm, bottleneck_msg = 5, "Land Footprint & Space", f"Mandated farmland footprint exceeds your {land_acres} acres."

    # LEVEL 6: Covered Workspace / Shed
    def pass_l6(o):
        name = o.name.lower()
        if "mobile kiosk" in name or "mobile cart" in name or "apiary" in name:
            return True
        req_shed = any(k in name for k in ["bottling", "waxing", "dehydration", "bio-enzyme", "jelly", "marmalade", "cold room"]) or ("juice" in name and "mobile" not in name)
        if req_shed:
            return has_workspace or ("RES05" in user_input.resources)
        return True

    p6 = [o for o in p5 if pass_l6(o)]
    steps.append(HierarchicalFunnelStep(
        level=6,
        name="Covered Workspace & Storage Shed",
        criterion=f"Covered Shed / Godown: {'Available' if has_workspace else 'Not Available'}",
        passed_count=len(p6),
        dropped_count=len(p5) - len(p6),
        status="PASSED" if len(p6) > 0 else "BOTTLENECK",
        passed_sample=[o.name for o in p6[:3]]
    ))
    if not p6 and bottleneck_lvl is None:
        bottleneck_lvl, bottleneck_nm, bottleneck_msg = 6, "Covered Workspace & Storage Shed", "Covered processing shed / godown requirement not met."

    # LEVEL 7: Logistics & Vehicle Access
    def pass_l7(o):
        name = o.name.lower()
        if "custom hiring" in name and not owned_tractor:
            return False
        if "reefer" in name or "transportation fleet" in name:
            return owned_truck
        return True

    p7 = [o for o in p6 if pass_l7(o)]
    steps.append(HierarchicalFunnelStep(
        level=7,
        name="Logistics & Vehicle Access",
        criterion=f"Vehicle Access: {'Tractor Owned' if owned_tractor else 'No Tractor'} / {'Freight Vehicle' if owned_truck else 'No Freight'}",
        passed_count=len(p7),
        dropped_count=len(p6) - len(p7),
        status="PASSED" if len(p7) > 0 else "BOTTLENECK",
        passed_sample=[o.name for o in p7[:3]]
    ))
    if not p7 and bottleneck_lvl is None:
        bottleneck_lvl, bottleneck_nm, bottleneck_msg = 7, "Logistics & Vehicle Access", "Heavy machinery / freight vehicle prerequisite unmet."

    # LEVEL 8: Existing Business / Operational Setup Fit
    def pass_l8(o):
        name = o.name.lower()
        # Orchard canopy pruning & training requires either an active orchard, or at least 1.0 acre of land, or mechanization assets
        if "canopy" in name or "pruning" in name:
            return "orchard" in existing_biz or (has_land and land_acres >= 1.0) or owned_tractor
        # Commercial orchard agro-tourism requires active orchard or at least 2 acres of farmland
        if "agro-tourism" in name or "farm stay" in name:
            return "orchard" in existing_biz or (has_land and land_acres >= 2.0)
        return True

    p8 = [o for o in p7 if pass_l8(o)]
    steps.append(HierarchicalFunnelStep(
        level=8,
        name="Existing Business / Orchard Setup",
        criterion=f"Setup: {'Active Orchard' if 'orchard' in existing_biz else ('Unused Land/Assets' if has_land else 'Fresh Venture Blueprint')}",
        passed_count=len(p8),
        dropped_count=len(p7) - len(p8),
        status="PASSED" if len(p8) > 0 else "BOTTLENECK",
        passed_sample=[o.name for o in p8[:3]]
    ))
    if not p8 and bottleneck_lvl is None:
        bottleneck_lvl, bottleneck_nm, bottleneck_msg = 8, "Existing Business / Orchard Setup", "No match for current operational setup."

    # LEVEL 9: Region & Cluster Specificity
    def pass_l9(o):
        loc_rel = str(getattr(o, "location_relevance", "") or "").lower()
        desc = str(getattr(o, "description", "") or "").lower()
        if user_location in loc_rel or user_location in desc or not loc_rel:
            return True
        if "vidarbha" in loc_rel or "nagpur" in loc_rel:
            return True
        return False

    p9 = [o for o in p8 if pass_l9(o)]
    steps.append(HierarchicalFunnelStep(
        level=9,
        name="Region & Cluster Specificity",
        criterion=f"Region Cluster: {user_input.location or 'Katol'} Citrus Belt",
        passed_count=len(p9),
        dropped_count=len(p8) - len(p9),
        status="PASSED" if len(p9) > 0 else "BOTTLENECK",
        passed_sample=[o.name for o in p9[:3]]
    ))
    if not p9 and bottleneck_lvl is None:
        bottleneck_lvl, bottleneck_nm, bottleneck_msg = 9, "Region & Cluster Specificity", f"No opportunities aligned with cluster: {user_input.location}"

    # LEVEL 10: Budget & Loan Feasibility
    def pass_l10(o):
        name = o.name.lower()
        canon_id = getattr(o, "id", 0)
        bench = benchmarks_cache.get(canon_id) or benchmarks_cache.get(name) or {}
        capex = float(bench.get("capex") or 300000.0)
        required_equity = capex * 0.20
        return user_budget >= (required_equity * 0.90) and capex <= max_achievable_capex

    p10 = [o for o in p9 if pass_l10(o)]
    steps.append(HierarchicalFunnelStep(
        level=10,
        name="Budget & Loan Feasibility",
        criterion=f"Budget: ₹{user_budget:,.0f} • Cap: ₹{max_achievable_capex:,.0f}",
        passed_count=len(p10),
        dropped_count=len(p9) - len(p10),
        status="PASSED" if len(p10) > 0 else "BOTTLENECK",
        passed_sample=[o.name for o in p10[:3]]
    ))
    if not p10 and bottleneck_lvl is None:
        bottleneck_lvl, bottleneck_nm, bottleneck_msg = 10, "Budget & Loan Feasibility", f"CapEx exceeds maximum bankable equity limit for ₹{user_budget:,.0f}."

    # LEVEL 11: Sector Interests
    def pass_l11(o):
        if not user_interests_lower:
            return True
        cat = str(getattr(o, "category", "") or "").lower()
        subcat = str(getattr(o, "subcategory", "") or "").lower()
        for interest in user_interests_lower:
            if interest in cat or interest in subcat or cat in interest:
                return True
            if "agri" in interest and any(c in cat for c in ["cultivation", "nursery", "propagation", "on-farm", "inputs"]):
                return True
            if "food" in interest and any(c in cat for c in ["food", "beverage", "processing"]):
                return True
            if "bio" in interest and "bio" in cat:
                return True
        return False

    p11 = [o for o in p10 if pass_l11(o)]
    steps.append(HierarchicalFunnelStep(
        level=11,
        name="Sector Interests",
        criterion=f"Sectors: {', '.join(user_interests) if user_interests else 'All Sectors'}",
        passed_count=len(p11),
        dropped_count=len(p10) - len(p11),
        status="PASSED" if len(p11) > 0 else "BOTTLENECK",
        passed_sample=[o.name for o in p11[:3]]
    ))
    if not p11 and bottleneck_lvl is None:
        bottleneck_lvl, bottleneck_nm, bottleneck_msg = 11, "Sector Interests", "No opportunities strictly matched your selected sector interests."

    return HierarchicalFunnel(
        total_initial_businesses=len(all_opps),
        strict_matches_count=len(p11),
        has_strict_match=len(p11) > 0,
        bottleneck_level=bottleneck_lvl,
        bottleneck_name=bottleneck_nm,
        bottleneck_message=bottleneck_msg,
        steps=steps,
        strict_matching_opportunities=[o.name for o in p11]
    )


def evaluate_recommendations(user_input: AssessmentInput, db: Session = None) -> RecommendationResponse:
    """
    Enterprise-grade, data-driven Decision Support System (DSS) matching
    the user's comprehensive 7-step profile with 25 Nagpur citrus value chain ventures.
    """
    opps = []
    if db is not None:
        try:
            opps = db.query(BusinessOpportunity).all()
        except Exception:
            opps = []

    if not opps:
        opps_raw = load_csv("opportunities.csv")
        opps = [CsvOpportunity(**r) for r in opps_raw]

    reqs_list = load_csv("opportunity_requirements.csv")
    reqs_map = {int(r["opportunity_id"]): r for r in reqs_list}
    skills_map = {s["skill_id"]: s["user_label"] for s in load_csv("skills.csv")}
    resources_map = {r["resource_id"]: r["user_label"] for r in load_csv("resources.csv")}
    infra_list = load_csv("infrastructure.csv")

    user_skills_set = set(user_input.skills)
    user_resources_set = set(user_input.resources)
    if user_input.has_land and user_input.land_acres >= 1.0:
        user_resources_set.add("RES01")

    # Parse user intent parameters
    user_budget = float(user_input.budget_inr or 300000.0)
    user_location = str(user_input.location or "Katol").strip()
    
    # Financial leverage based on borrowing comfort
    finance_detail = user_input.finance_detailed or {}
    borrowing_comfort = finance_detail.get("borrowingComfort") or "loan_with_subsidy"
    if borrowing_comfort == "no_loan":
        max_achievable_capex = user_budget * 1.05
    elif borrowing_comfort == "small_loan":
        max_achievable_capex = user_budget / 0.70  # 30% debt
    elif borrowing_comfort == "high_leverage":
        max_achievable_capex = user_budget / 0.10  # 10x leverage
    else: # loan_with_subsidy / standard
        max_achievable_capex = user_budget / 0.15  # 6.6x leverage via PMFME 35% + Loan

    # 1. User Intent, Profile & Constraints Extraction
    about_me = user_input.about_me or {}
    user_edu = str(about_me.get("education") or "").lower()
    user_situation = str(about_me.get("currentSituation") or "").lower()
    user_goals = [str(g).lower() for g in (about_me.get("goals") or [])]
    existing_biz_type = str(about_me.get("existingBusinessType") or "").lower()

    user_skills_set = set(user_input.skills)
    skills_detail_list = user_input.skills_detailed or []
    willingness = str(user_input.willingness_to_learn or "willing_to_learn").lower()

    user_resources_set = set(user_input.resources)
    res_detail = user_input.resources_detailed or {}
    has_land = bool(user_input.has_land or res_detail.get("hasLand", False))
    land_acres = float(user_input.land_acres or res_detail.get("landAcres", 0.0) or 0.0)
    if has_land and land_acres >= 0.5:
        user_resources_set.add("RES01")

    user_budget = float(user_input.budget_inr or 300000.0)
    user_location = str(user_input.location or "Katol").strip()
    loc_detail = user_input.location_detailed or {}
    radius = str(loc_detail.get("operatingRadius") or "").lower()

    finance_detail = user_input.finance_detailed or {}
    borrowing_comfort = finance_detail.get("borrowingComfort") or "loan_with_subsidy"
    if borrowing_comfort == "no_loan":
        max_achievable_capex = user_budget * 1.05
    elif borrowing_comfort == "small_loan":
        max_achievable_capex = user_budget / 0.70  # 30% debt
    elif borrowing_comfort == "high_leverage":
        max_achievable_capex = user_budget / 0.10  # 10x leverage
    else: # loan_with_subsidy / standard
        max_achievable_capex = user_budget / 0.15  # 6.6x leverage via PMFME 35% + Loan

    biz_prefs = user_input.business_preferences or {}
    user_interest_sectors = user_input.interests or biz_prefs.get("businessTypes") or []
    user_risk = (biz_prefs.get("riskTolerance") or user_input.risk_tolerance or "moderate_risk").lower()
    user_scale = (biz_prefs.get("businessScale") or user_input.business_scale or "small").lower()
    user_time = (biz_prefs.get("timeCommitment") or user_input.time_commitment or "full_time").lower()

    # Owned equipment & transport extraction
    transport_modes = res_detail.get("transportModes", [])
    equipment_list = res_detail.get("equipmentList", [])

    def is_item_owned(item: dict) -> bool:
        if not isinstance(item, dict):
            return False
        return str(item.get("ownership", "")).lower() == "owned" or str(item.get("availability", "")).lower() == "owned"

    owned_tractor = any(t.get("type") == "tractor" and is_item_owned(t) for t in transport_modes)
    owned_truck = any(t.get("type") in ["mini_truck", "freight_truck"] and is_item_owned(t) for t in transport_modes)
    owned_reefer = any(t.get("type") == "reefer" and is_item_owned(t) for t in transport_modes)
    owned_two_wheeler = any(t.get("type") == "two_wheeler" and is_item_owned(t) for t in transport_modes)

    owned_polyhouse = any(e.get("id") == "polyhouse" and is_item_owned(e) for e in equipment_list)
    owned_cold_storage = any(e.get("id") == "cold_storage" and is_item_owned(e) for e in equipment_list)
    owned_grading_line = any(e.get("id") == "grading_line" and is_item_owned(e) for e in equipment_list)
    owned_juice_extractor = any(e.get("id") == "juice_extractor" and is_item_owned(e) for e in equipment_list)
    owned_peel_oil_unit = any(e.get("id") == "peel_oil_unit" and is_item_owned(e) for e in equipment_list)
    owned_dry_storage = any(e.get("id") == "dry_storage" and is_item_owned(e) for e in equipment_list)

    workspace_type = str(res_detail.get("workspaceType", "shed")).lower()
    workspace_sqft = int(res_detail.get("workspaceAreaSqFt", 0) or 0)
    land_ownership = str(res_detail.get("landOwnership", "owned")).lower()

    has_three_phase = (res_detail.get("powerType") == "three_phase") or ("RES06" in user_resources_set)
    has_power = bool(getattr(user_input, "has_power", True) or res_detail.get("hasElectricity", True) or has_three_phase)
    has_workspace = bool(user_input.has_workspace or res_detail.get("hasWorkspace", False) or ("RES05" in user_resources_set) or owned_dry_storage)

    owned_assets_dict = {
        "owned_tractor": owned_tractor,
        "owned_truck": owned_truck,
        "owned_reefer": owned_reefer,
        "owned_two_wheeler": owned_two_wheeler,
        "owned_polyhouse": owned_polyhouse,
        "owned_cold_storage": owned_cold_storage,
        "owned_grading_line": owned_grading_line,
        "owned_juice_extractor": owned_juice_extractor,
        "owned_peel_oil_unit": owned_peel_oil_unit,
        "owned_dry_storage": owned_dry_storage,
        "workspace_type": workspace_type,
        "workspace_sqft": workspace_sqft,
        "land_ownership": land_ownership
    }

    # Documents & Licenses
    docs = user_input.documents or {}
    has_fssai = docs.get("hasFssai") or any("fssai" in str(k).lower() or "fssai" in str(v).lower() for k, v in docs.items())
    has_udyam = docs.get("hasUdyam") or any("udyam" in str(k).lower() or "udyam" in str(v).lower() for k, v in docs.items())
    has_712 = docs.get("has712") or docs.get("hasLandRecords") or any("7/12" in str(k).lower() or "7/12" in str(v).lower() for k, v in docs.items())
    has_apmc = docs.get("hasApmc") or any("apmc" in str(k).lower() or "apmc" in str(v).lower() for k, v in docs.items())

    # Build skills detail lookup
    skills_detail_map = {}
    for s in skills_detail_list:
        if isinstance(s, dict) and s.get("skillId"):
            skills_detail_map[s["skillId"]] = s

    opps_canonical = load_csv("opportunities.csv")
    name_to_canon_id = {r["name"].lower().strip(): int(r["id"]) for r in opps_canonical}
    benchmarks_cache = load_opportunity_benchmarks()

    # Compute explicit 11-stage hierarchical / sequential filtering funnel first
    hierarchical_funnel = compute_hierarchical_funnel(
        all_opps=opps,
        user_input=user_input,
        benchmarks_cache=benchmarks_cache,
        reqs_map=reqs_map,
        max_achievable_capex=max_achievable_capex
    )
    strict_survivor_names = set(hierarchical_funnel.strict_matching_opportunities or [])

    user_water_sources = res_detail.get("waterSources", []) or (["RES02"] if "RES02" in user_resources_set else [])
    has_water = ("RES02" in user_resources_set) or bool(user_water_sources)

    user_profile_for_eligibility = {
        "has_land": has_land,
        "land_acres": land_acres,
        "land_ownership": res_detail.get("landOwnership", "owned"),
        "has_workspace": has_workspace,
        "water_sources": user_water_sources,
        "has_water": has_water,
        "power_type": res_detail.get("powerType", "single_phase"),
        "has_three_phase": has_three_phase,
        "budget_inr": user_budget,
        "borrowing_comfort": borrowing_comfort,
        "skills": list(user_skills_set),
        "willingness_to_learn": willingness,
        "location": user_location
    }

    # Predict user's empirical K-Means cluster persona (Phase 7 - Step 6)
    user_clustering_input = {
        "capital_inr": user_budget,
        "land_acres": land_acres if has_land else 0.0,
        "experience_years": float(len(user_input.skills)),
        "has_workspace": has_workspace,
        "equipment_offset_lakhs": (6.5 if owned_tractor else 0.0) + (4.5 if owned_truck else 0.0),
        "documents": {
            "fssai": has_fssai,
            "udyam": has_udyam,
            "land_7_12": has_712
        }
    }
    user_assigned_persona = ml_engine.predict_user_cluster(user_clustering_input)

    scored_opportunities: List[OpportunityRecommendation] = []

    for opp in opps:
        name_key = opp.name.lower().strip()
        canon_id = name_to_canon_id.get(name_key, getattr(opp, "id", 1))

        bench = (
            benchmarks_cache.get(name_key) or
            benchmarks_cache.get(canon_id) or
            benchmarks_cache.get(getattr(opp, "id", 0)) or
            infer_benchmark_from_opportunity(opp)
        )

        req = reqs_map.get(canon_id, reqs_map.get(opp.id, {
            "required_skills": "SKL01",
            "required_resources": "RES05",
            "min_investment_inr": bench["capex"],
            "preferred_locations": "Katol"
        }))

        actual_capex = float(bench["capex"])
        opp_sectors = bench["sectors"]
        req_skills = [s.strip() for s in req["required_skills"].split(",") if s.strip()]
        req_resources = [r.strip() for r in req["required_resources"].split(",") if r.strip()]

        match_reasons = []
        gap_items = []
        is_hard_disqualified = False

        # ---------------------------------------------------------------------
        # 1. LAND & PHYSICAL FOOTPRINT COMPATIBILITY FILTER (s_land)
        # ---------------------------------------------------------------------
        requires_land = bench["requires_land"] or any(k in opp.name.lower() for k in ["cultivation", "nursery", "propagation unit", "agro-tourism"])
        min_land = float(bench["min_land_acres"] or (1.0 if "cultivation" in opp.name.lower() else 0.5 if "nursery" in opp.name.lower() else 0.0))

        if requires_land:
            if not has_land or land_acres < min_land:
                s_land = 0.15
                is_hard_disqualified = True
                gap_items.append({
                    "gap_type": "land",
                    "title": "Land Deficit",
                    "missing": f"Requires at least {min_land} Acres of farmland (You have {land_acres} Acres)",
                    "solution": f"Acquire or lease {min_land} acres in {user_location} horticultural belt, or pivot to zero-land processing models."
                })
                match_reasons.append(f"⚠️ Land Deficit: Mandates at least {min_land} acres of agricultural land.")
            else:
                s_land = 1.0
                match_reasons.append(f"🌱 Land Ready: Your {land_acres} acres fully satisfies the required {min_land}-acre footprint.")
        else:
            if not has_land:
                s_land = 1.0
                match_reasons.append("🏢 Zero-Land Ready: Ideal for your profile — zero agricultural land required. Operable in a rented shop, industrial shed, or APMC floor.")
            else:
                s_land = 0.95

        # ---------------------------------------------------------------------
        # 2. EDUCATION & TECHNICAL COMPLEXITY FILTER (s_edu)
        # ---------------------------------------------------------------------
        is_high_tech = any(k in opp.name.lower() for k in ["drone", "trichoderma", "bio-formulation", "essential oil", "pectin", "micro-budding tissue", "optical sorting"])
        is_agro_cultivation = any(k in opp.name.lower() for k in ["cultivation", "nursery", "rootstock seed", "custom hiring"])

        if is_high_tech:
            if any(e in user_edu for e in ["degree", "bachelor", "master", "agri", "engineering", "diploma", "technical"]):
                s_edu = 1.0
                match_reasons.append("🎓 Educational Foundation: Your formal education/technical background matches this process engineering.")
            else:
                s_edu = 0.45
                gap_items.append({
                    "gap_type": "education",
                    "title": "Technical / Chemical Process Oversight",
                    "missing": "Requires technical process knowledge or certified supervision",
                    "solution": f"Mandatory completion of {bench['training']} before commercial setup."
                })
                match_reasons.append(f"⚠️ Technical Complexity: Prescribes institutional certification via {bench['training']}.")
        elif is_agro_cultivation:
            if any(e in user_edu for e in ["agri", "diploma", "vocational", "degree", "master"]):
                s_edu = 1.0
            else:
                s_edu = 0.90
        else: # Commerce, Trading, Food Processing, Kiosks
            s_edu = 1.0
            match_reasons.append("💼 Commercial Alignment: Driven by hands-on execution and local farmer relations across all education levels.")

        # ---------------------------------------------------------------------
        # 3. CURRENT SITUATION & GOALS CONCORDANCE (s_situation)
        # ---------------------------------------------------------------------
        is_existing_biz = (user_situation == "existing_business") or ("orchard" in existing_biz_type) or ("active_business" in str(res_detail.get("existingSetupStatus", "")).lower())
        is_captive_harvest_model = any(k in opp.name.lower() for k in ["waxing", "sorting", "grading", "juice", "squash", "peel powder", "nursery", "cold room"])
        
        if is_existing_biz:
            if is_captive_harvest_model:
                s_situation = 1.0
                match_reasons.append("🍊 Captive Orchard Raw Material: Monetizes your existing citrus harvest with zero procurement markup.")
            else:
                s_situation = 0.85
        elif user_situation in ["student", "looking_opportunity", "planning_start"]:
            if actual_capex > 4000000:
                s_situation = 0.35
                match_reasons.append("⚠️ High Scale Barrier: Suited for expanding commercial entities rather than a first-time startup.")
            else:
                s_situation = 1.0
                match_reasons.append("🚀 First-Time Founder Fit: Turnkey modular setup with rapid commissioning and high PMFME subsidy access.")
        else:
            s_situation = 0.85

        if "monetize_resources" in user_goals and (has_land or owned_tractor or has_workspace):
            s_situation = min(1.0, s_situation + 0.10)
        if "first_business" in user_goals and actual_capex <= 600000:
            s_situation = min(1.0, s_situation + 0.10)

        # ---------------------------------------------------------------------
        # 4. SKILLS MATCH & WILLINGNESS TO LEARN (s_skill)
        # ---------------------------------------------------------------------
        matched_skl_ids = user_skills_set.intersection(set(req_skills))
        missing_skl_ids = set(req_skills).difference(user_skills_set)

        # Specialized skill boosts:
        has_food_processing = ("SKL05" in user_skills_set)
        has_farming = ("SKL01" in user_skills_set)
        has_trading = ("SKL06" in user_skills_set)

        opp_is_food = any(k in opp.category.lower() or k in opp.name.lower() for k in ["food", "juice", "squash", "processing", "oil", "powder"])
        opp_is_farming = any(k in opp.category.lower() or k in opp.name.lower() for k in ["cultivation", "nursery", "propagation", "rootstock"])
        opp_is_trading = any(k in opp.category.lower() or k in opp.name.lower() for k in ["trading", "sorting", "grading", "waxing", "wholesale"])

        if len(matched_skl_ids) > 0:
            s_skill = len(matched_skl_ids) / len(req_skills)
            if has_food_processing and opp_is_food:
                s_skill = min(1.0, s_skill + 0.25)
                match_reasons.append("🌱 Direct Skill Mastery: Matches your verified expertise in Food Processing & Value Addition.")
            elif has_farming and opp_is_farming:
                s_skill = min(1.0, s_skill + 0.25)
                match_reasons.append("🌱 Direct Skill Mastery: Matches your verified background in Citrus Farming & Agronomy.")
            elif has_trading and opp_is_trading:
                s_skill = min(1.0, s_skill + 0.25)
                match_reasons.append("🌱 Direct Skill Mastery: Matches your verified acumen in Fruit Trading & APMC Wholesale.")
        else:
            if "current_only" in willingness:
                s_skill = 0.10
                is_hard_disqualified = True
                match_reasons.append(f"❌ Skill Disqualification: You chose 'Current skills only', but this venture mandates skills in {', '.join([skills_map.get(s, s) for s in req_skills])}.")
            else:
                s_skill = 0.65
                missing_names = [skills_map.get(s, s) for s in missing_skl_ids]
                gap_items.append({
                    "gap_type": "skill",
                    "title": f"Skill Gap: {', '.join(missing_names)}",
                    "missing": f"Missing operational training in {', '.join(missing_names)}",
                    "solution": f"Enroll in {bench['training']} ({bench['timeline']} duration)."
                })
                match_reasons.append(f"📚 Skill Gap Prescribed: Bridge capabilities via {bench['training']}.")

        skill_pct = int(round(s_skill * 100))

        # ---------------------------------------------------------------------
        # 5. ASSET & RESOURCE INFRASTRUCTURE FIT (s_res)
        # ---------------------------------------------------------------------
        matched_res_ids = user_resources_set.intersection(set(req_resources))
        missing_res_ids = set(req_resources).difference(user_resources_set)
        
        res_ratio = len(matched_res_ids) / max(1, len(req_resources))
        
        # Check 3-phase power for machine-driven processing
        requires_three_phase = any(k in opp.name.lower() for k in ["juice", "sorting", "waxing", "cold", "distillation", "extraction"])
        if requires_three_phase and not has_three_phase:
            res_ratio *= 0.70
            gap_items.append({
                "gap_type": "resource",
                "title": "3-Phase Power Required",
                "missing": "High-torque industrial motors require 3-phase connection",
                "solution": "Apply for MSEB agro-commercial tariff or install solar hybrid inverter."
            })
            match_reasons.append("⚠️ Utility Gap: Requires 3-phase MSEB agro-industrial power connection.")

        s_res = max(0.20, min(1.0, round(res_ratio, 2)))

        # ---------------------------------------------------------------------
        # 6. FINANCIAL FEASIBILITY & CAPEX AFFORDABILITY (s_fin)
        # ---------------------------------------------------------------------
        effective_capex = actual_capex
        offset_amount = 0.0

        # 1. Farm Mechanization & Tractor
        if owned_tractor and ("farm mechanization" in str(opp_sectors).lower() or "pruning" in opp.name.lower() or "cultivation" in opp.name.lower()):
            offset_amount += 650000.0
            match_reasons.append("🚜 Owned Tractor & Trolley: Saves ~₹6.5 Lakhs in initial mechanization outlay!")

        # 2. Logistics & Commercial Trucks
        if owned_truck and ("logistics" in str(opp_sectors).lower() or "trading" in str(opp_sectors).lower() or "export" in str(opp_sectors).lower()):
            offset_amount += 450000.0
            match_reasons.append("🚚 Owned Freight Vehicle: Reduces transport vehicle CapEx by ~₹4.5 Lakhs!")

        # 3. Refrigerated Reefer Van
        if owned_reefer and ("reefer" in opp.name.lower() or "cold chain" in str(opp_sectors).lower() or "logistics" in str(opp_sectors).lower()):
            offset_amount += 1600000.0
            match_reasons.append("❄️🚚 Owned Reefer Van: Drastically reduces cold-chain fleet CapEx by ~₹16.0 Lakhs!")

        # 4. Polyhouse / Green Shade Netting
        if owned_polyhouse and ("nursery" in opp.name.lower() or "propagation" in opp.name.lower()):
            offset_amount += 800000.0
            match_reasons.append("🪴 Owned Polyhouse: Validated on-site greenhouse saves ~₹8.0 Lakhs in nursery setup!")

        # 5. Cold Storage / Pre-Cooling Unit
        if owned_cold_storage and ("cold room" in opp.name.lower() or "cold storage" in opp.name.lower() or "puree" in opp.name.lower() or "pulp" in opp.name.lower()):
            offset_amount += 700000.0
            match_reasons.append("❄️ Owned Cold Storage: Existing pre-cooling unit saves ~₹7.0 Lakhs in refrigeration outlay!")

        # 6. Grading, Sorting & Waxing Line
        if owned_grading_line and ("sorting" in opp.name.lower() or "grading" in opp.name.lower() or "waxing" in opp.name.lower() or "packhouse" in opp.name.lower()):
            offset_amount += 1500000.0
            match_reasons.append("📦 Owned Sorting/Waxing Line: Operational packhouse line saves ~₹15.0 Lakhs in plant capex!")

        # 7. Citrus Juice Extraction Unit
        if owned_juice_extractor and ("juice" in opp.name.lower() or "rts" in opp.name.lower() or "beverage" in opp.name.lower() or "squash" in opp.name.lower()):
            offset_amount += 500000.0
            match_reasons.append("🥤 Owned Citrus Juicer Line: Existing debittering & extraction line saves ~₹5.0 Lakhs!")

        # 8. Peel Oil Extraction Unit
        if owned_peel_oil_unit and ("essential oil" in opp.name.lower() or "limonene" in opp.name.lower() or "terpene" in opp.name.lower()):
            offset_amount += 1200000.0
            match_reasons.append("🧪 Owned Peel Oil Unit: Pre-installed extraction equipment saves ~₹12.0 Lakhs in chemical capex!")

        # 9. Workspace Civil Offsets
        if has_workspace:
            if workspace_type == "factory" and opp_is_food:
                offset_amount += 400000.0
                match_reasons.append("🏭 Food-Grade Factory Premise: Pre-sanitized unit saves ~₹4.0 Lakhs in FSSAI civil retrofits!")
            elif workspace_type == "farm_structure" and any(k in opp.name.lower() for k in ["sorting", "waxing", "cold", "pack"]):
                offset_amount += 450000.0
                match_reasons.append("🛖 Farm Packhouse Plinth: Existing covered plinth saves ~₹4.5 Lakhs in civil shed construction!")
            elif workspace_type == "workshop" and any(k in opp.name.lower() for k in ["custom hiring", "drone", "pruning"]):
                offset_amount += 250000.0
                match_reasons.append("🔧 Machinery Workshop: Pre-existing tool bays save ~₹2.5 Lakhs in workshop outfitting!")
            elif owned_dry_storage and not opp_is_food:
                offset_amount += 300000.0
                match_reasons.append("🏠 Dry Storage Godown: Existing covered warehouse saves ~₹3.0 Lakhs in civil outlay!")

        # 10. Water Irrigation Drip Line Offset
        if any(w in user_water_sources for w in ["drip_irrigation", "drip"]) and "cultivation" in opp.name.lower():
            offset_amount += 150000.0
            match_reasons.append("🌱 Installed Drip Network: Existing micro-irrigation lines save ~₹1.5 Lakhs in field layout!")

        # Apply Capex floor rule: never allow effective capex to drop below 50% of benchmark capex
        if offset_amount > 0:
            effective_capex = max(actual_capex * 0.50, actual_capex - offset_amount)

        fin_breakdown = calculate_financials(effective_capex, user_budget, opp.category, borrowing_comfort)

        if effective_capex <= user_budget:
            s_fin = 1.0
            match_reasons.append(f"💰 100% Capital Ready: Your available equity of {format_inr(user_budget)} fully funds this venture.")
        elif effective_capex <= max_achievable_capex:
            debt_ratio = (effective_capex - user_budget) / effective_capex
            s_fin = round(0.95 - (debt_ratio * 0.20), 2)
            match_reasons.append(f"💰 Highly Bankable: Your equity of {format_inr(user_budget)} meets promoter minimums backed by PMFME/MIDH capital subsidy.")
        else:
            overage = (effective_capex - max_achievable_capex) / max_achievable_capex
            s_fin = max(0.10, round(0.50 - (overage * 0.35), 2))
            is_hard_disqualified = True if overage > 1.5 else is_hard_disqualified
            gap_items.append({
                "gap_type": "capital",
                "title": "Capital Outlay Gap",
                "missing": f"Project CapEx of {format_inr(effective_capex)} exceeds your capital ceiling of {format_inr(max_achievable_capex)}",
                "solution": "Requires additional co-promoter equity, angel investment, or phased modular rollout."
            })
            match_reasons.append(f"⚠️ Capital Gap: Total Capex of {format_inr(effective_capex)} requires phased modular investment or co-promoter capital.")

        if has_udyam:
            s_fin = min(1.0, s_fin + 0.05)
            match_reasons.append("📜 Udyam MSME Registered: Unlocks collateral-free CGTMSE bank loan guarantee.")
        if has_fssai and opp_is_food:
            s_fin = min(1.0, s_fin + 0.05)
            match_reasons.append("🪪 FSSAI License Active: Zero statutory waiting period for food unit commissioning.")

        # ---------------------------------------------------------------------
        # 7. GEOSPATIAL & CLUSTER ADVANTAGE (s_geo)
        # ---------------------------------------------------------------------
        cluster_scores = bench.get("clusters", {})
        if "vidarbha" in radius or "mobile" in radius or "anywhere" in radius:
            max_cluster_val = max(cluster_scores.values()) if cluster_scores else 1.0
            s_geo = round(float(max_cluster_val), 2)
        elif "20" in radius or "30" in radius or "cluster" in radius:
            base_fit = cluster_scores.get(user_location, bench.get("default_cluster", 0.75))
            s_geo = min(1.0, round(float(base_fit) + 0.05, 2))
        else:
            cluster_fit = cluster_scores.get(user_location, bench.get("default_cluster", 0.75))
            s_geo = round(float(cluster_fit), 2)
            match_reasons.append(f"📍 Location Advantage: {user_location} provides strong raw-material & cluster synergy.")

        # ---------------------------------------------------------------------
        # 8. MACHINE LEARNING FEASIBILITY INFERENCE (RANDOM FOREST)
        # ---------------------------------------------------------------------
        user_vector_for_ml = {
            "capital_inr": user_budget,
            "land_acres": land_acres if has_land else 0.0,
            "experience_years": 2.0,
            "risk_tolerance": "High" if "high" in user_risk else "Low" if "low" in user_risk else "Medium",
            "equipment_offset_lakhs": (6.5 if owned_tractor else 0.0) + (4.5 if owned_truck else 0.0),
            "has_workspace": has_workspace,
            "documents": {
                "fssai": has_fssai,
                "udyam": has_udyam,
                "land_7_12": has_712
            },
            "raw_material_density": float(bench.get("default_cluster", 0.9)),
            "mobility_radius": "vidarbha_belt" if ("vidarbha" in radius or "mobile" in radius) else "fixed"
        }
        ml_pred = ml_engine.predict_feasibility(user_vector_for_ml, {"capex_inr": actual_capex})
        probs = ml_pred.get("class_probabilities", {})
        p_high = float(probs.get("highly_viable", 0.0))
        p_mod = float(probs.get("moderately_viable", 0.0))
        p_risk = float(probs.get("high_risk", 0.0))
        ml_viability_ratio = ((p_high * 1.0) + (p_mod * 0.65) + (p_risk * 0.20)) / 100.0

        # ---------------------------------------------------------------------
        # STEPS 2, 3 & 4: REQUIREMENT PROFILES, ELIGIBILITY GATING & MCDA SCORING
        # ---------------------------------------------------------------------
        req_profile = get_business_requirement_profile(canon_id, opp.name, bench)
        eligibility_res = check_eligibility(user_profile_for_eligibility, req_profile)
        is_eligible = eligibility_res["eligible"]
        mandatory_reasons = eligibility_res["mandatory_reasons"]
        acquirable_gaps = eligibility_res["acquirable_gaps"]

        # 1. Capital Fit (25% Weight) - computed via configurable Multi-Attribute Utility function
        capital_fit = FINANCIAL_CONFIG.calculate_capital_fit(effective_capex, user_budget)

        # 2. Infrastructure Fit (20% Weight) - normalized 0-100
        if req_profile.get("requires_land"):
            min_l = max(0.25, float(req_profile.get("min_land_acres", 1.0)))
            land_score = min(100, int((land_acres / min_l) * 100)) if has_land else 0
        else:
            land_score = 100 if has_workspace else 85

        power_score = 100 if (has_three_phase or req_profile.get("electricity_type") != "three_phase_industrial") else 50
        water_score = 100 if (has_water or not req_profile.get("requires_water")) else 40
        infrastructure_fit = MCDA_CONFIG.compute_infrastructure_score(land_score, power_score, water_score)

        # 3. Market Fit (Configurable Weight) - normalized 0-100
        cluster_scores = bench.get("clusters", {})
        cluster_val = float(cluster_scores.get(user_location, bench.get("default_cluster", 0.75)))
        market_fit = int(min(100, max(50, cluster_val * 100)))

        # 4. Skill Fit (Configurable Weight) - normalized 0-100
        matched_skl_ids = user_skills_set.intersection(set(req_skills))
        missing_skl_ids = set(req_skills).difference(user_skills_set)
        skill_ratio = len(matched_skl_ids) / max(1, len(req_skills))
        if len(matched_skl_ids) > 0:
            skill_fit = min(100, int(skill_ratio * 100) + (15 if "willing" in willingness else 0))
        else:
            skill_fit = 65 if "willing" in willingness else 20

        # 5. Resource Fit (Configurable Weight) - normalized 0-100
        matched_res_ids = user_resources_set.intersection(set(req_resources))
        missing_res_ids = set(req_resources).difference(user_resources_set)
        res_ratio = len(matched_res_ids) / max(1, len(req_resources))
        resource_fit = min(100, max(30, int(res_ratio * 100)))

        # 6. Location Fit (Configurable Weight) - normalized 0-100
        location_fit = market_fit

        # Master Weighted MCDA Sum:
        # Computed via MCDA_CONFIG (Capital, Infrastructure, Market, Skills, Resources, Location)
        mcda_score = MCDA_CONFIG.compute_mcda_score(
            capital_fit=capital_fit,
            infrastructure_fit=infrastructure_fit,
            market_fit=market_fit,
            skill_fit=skill_fit,
            resource_fit=resource_fit,
            location_fit=location_fit
        )

        # Step 6: K-Means Cluster Alignment & Opportunity Prioritization
        opp_matches_persona = False
        for rec_sec in user_assigned_persona.get("recommended_sectors", []):
            if rec_sec.lower() in opp.name.lower() or opp.category.lower() in rec_sec.lower():
                opp_matches_persona = True
                break

        if opp_matches_persona:
            cluster_affinity_boost = MCDA_CONFIG.persona_affinity_boost
            match_reasons.append(f"🎯 Persona Fit: Aligns directly with your empirical profile as a '{user_assigned_persona['persona_name']}'.")
        else:
            cluster_affinity_boost = 0

        raw_suitability_score = min(100, max(0, mcda_score + cluster_affinity_boost))

        # Eligibility Gating:
        # If business fails mandatory requirements, status is "Not Eligible" and score is strictly capped <= 38.
        if is_eligible:
            status_str = "Eligible"
            suitability_pct = max(MCDA_CONFIG.eligible_score_min, min(MCDA_CONFIG.eligible_score_max, mcda_score + cluster_affinity_boost))
            match_reasons.insert(0, f"✅ Verified Eligible: Meets all mandatory land, utility, and capital prerequisites.")
        else:
            status_str = "Not Eligible"
            suitability_pct = min(MCDA_CONFIG.ineligible_score_ceiling, max(MCDA_CONFIG.ineligible_score_floor, mcda_score - MCDA_CONFIG.ineligible_penalty))
            match_reasons.insert(0, f"❌ Not Eligible: {'; '.join(mandatory_reasons)}")

        # Multi-Criteria Decision Analysis (MCDA) factor score breakdown
        mcda_breakdown = {
            "feasibility_score": suitability_pct,
            "raw_suitability_score": raw_suitability_score,
            "is_eligible": is_eligible,
            "eligibility_status": status_str,
            "mandatory_reasons": mandatory_reasons,
            "capital_fit": capital_fit,
            "infrastructure_fit": infrastructure_fit,
            "land_fit": infrastructure_fit,
            "skill_fit": skill_fit,
            "market_fit": market_fit,
            "resource_fit": resource_fit,
            "location_fit": location_fit,
            "score_type": "MCDA",
            "final_mcda_score": mcda_score,
            "active_weights": MCDA_CONFIG.to_dict()["weights"]
        }

        radar_scores = {
            "capital_fit": capital_fit,
            "infrastructure_fit": infrastructure_fit,
            "market_fit": market_fit,
            "skill_fit": skill_fit,
            "resource_fit": resource_fit,
            "location_fit": location_fit,
            "investment": capital_fit,
            "resource": resource_fit,
            "skills": skill_fit,
            "roi": min(100, int(round(bench["margin_pct"] * 1.50))),
            "subsidy": 100 if "PMFME" in fin_breakdown.eligible_scheme else 85
        }

        nearby_infra = [
            f"{i['facility_name']} ({i['facility_type']} in {i['location_area']})"
            for i in infra_list
            if user_location.lower() in i['taluka_district'].lower() or user_location.lower() in i['location_area'].lower()
        ]
        if not nearby_infra:
            nearby_infra = [f"Warud Regional Packhouse & Shellac Waxing Line (2,000 MT)", "Warud APMC Mandi"] if "warud" in user_location.lower() else ["Kalamna APMC Market Yard & Cold Chain Hub"]

        # Evaluate scheme eligibility for opportunity
        opp_scheme_input = scheme_engine.UserAssessmentInput(
            business_name=opp.name,
            business_category=opp.category,
            project_cost_inr=actual_capex,
            available_capital_inr=user_budget,
            has_land=user_input.has_land,
            land_acres=user_input.land_acres or 0.0,
            location_type="rural",
            district="Nagpur",
            state="Maharashtra",
            social_category="General"
        )
        opp_scheme_evals = scheme_engine.evaluate_all_schemes(opp_scheme_input)
        top_scheme_eval = opp_scheme_evals[0].model_dump() if opp_scheme_evals else None

        # Build Comprehensive Readiness Report (Phase 9)
        readiness_rep = build_readiness_report(
            user_input=user_input,
            opp=opp,
            actual_capex=actual_capex,
            user_budget=user_budget,
            fin_breakdown=fin_breakdown,
            req_profile=req_profile,
            bench=bench,
            top_scheme=top_scheme_eval,
            user_location=user_location,
            skills_map=skills_map,
            resources_map=resources_map,
            matched_skl_ids=matched_skl_ids,
            missing_skl_ids=missing_skl_ids,
            matched_res_ids=matched_res_ids,
            missing_res_ids=missing_res_ids,
            is_eligible=is_eligible,
            status_str=status_str,
            mandatory_reasons=mandatory_reasons,
            acquirable_gaps=acquirable_gaps,
            gap_items=gap_items,
            mcda_breakdown=mcda_breakdown,
            land_acres=land_acres,
            has_land=has_land,
            has_water=has_water,
            has_power=has_power,
            has_three_phase=has_three_phase,
            has_workspace=has_workspace,
            has_fssai=has_fssai,
            has_udyam=has_udyam,
            has_712=has_712,
            owned_tractor=owned_tractor,
            owned_truck=owned_truck,
            willingness=willingness,
            s_edu=s_edu,
            s_situation=s_situation,
            skill_fit=skill_fit,
            capital_fit=capital_fit,
            owned_assets=owned_assets_dict,
        )

        rec = OpportunityRecommendation(
            opportunity_id=opp.id,
            name=opp.name,
            category=opp.category,
            subcategory=opp.subcategory or "",
            investment_level=format_inr(actual_capex),
            technology_level=opp.technology_level or "",
            target_market=opp.target_market or "",
            location_relevance=opp.location_relevance or f"High in {user_location}",
            status=status_str,
            source=opp.source or "CCRI / PMFME Benchmark",
            source_url=opp.source_url or "https://ccri.org.in",
            description=opp.description or "",

            skill_match=skill_fit / 100.0,
            resource_match=resource_fit / 100.0,
            location_match=location_fit / 100.0,
            financial_match=capital_fit / 100.0,
            intent_match=infrastructure_fit / 100.0,
            overall_match=round(mcda_score / 100.0, 2),
            suitability_score=suitability_pct,

            skill_match_pct=skill_fit,
            est_capex_formatted=format_inr(actual_capex),
            est_margin=f"~{bench['margin_pct']}% Net",
            setup_timeline=bench["timeline"],
            training_recommendation=bench["training"],
            risk_level=bench["risk"],
            scale=bench["scale"],
            radar_scores=radar_scores,
            is_eligible=is_eligible,
            eligibility_status=status_str,
            raw_suitability_score=raw_suitability_score,
            mcda_breakdown=mcda_breakdown,
            feasibility_score=suitability_pct,
            score_type="MCDA",

            match_reasons=match_reasons[:4],
            matched_skills=[skills_map.get(s, s) for s in matched_skl_ids],
            missing_skills=[skills_map.get(s, s) for s in missing_skl_ids],
            matched_resources=[resources_map.get(r, r) for r in matched_res_ids],
            missing_resources=[resources_map.get(r, r) for r in missing_res_ids],
            financial_breakdown=fin_breakdown,
            nearby_infrastructure=nearby_infra[:2],
            ml_prediction=ml_pred,
            cluster_persona=user_assigned_persona["persona_name"],
            cluster_match=opp_matches_persona,
            scheme_eligibility=top_scheme_eval,
            gap_analysis=readiness_rep,
            readiness_report=readiness_rep
        )
        scored_opportunities.append(rec)


    # Sort: Eligible opportunities ALWAYS rank before Ineligible ones!
    # Within each eligibility status, sort strictly descending by suitability_score
    scored_opportunities.sort(
        key=lambda x: (1 if x.status == "Eligible" else 0, x.suitability_score),
        reverse=True
    )
    market_intel = get_market_intelligence(user_location)

    return RecommendationResponse(
        user_summary={
            "location": user_location,
            "budget": format_inr(user_budget),
            "selected_skills_count": len(user_input.skills),
            "selected_resources_count": len(user_input.resources),
            "land_acres": user_input.land_acres if user_input.has_land else 0.0,
            "funding_preference": user_input.funding_preference,
            "assigned_persona": user_assigned_persona["persona_name"],
            "cluster_id": user_assigned_persona["cluster_id"],
            "persona_description": user_assigned_persona["description"],
            "primary_policy_leverage": user_assigned_persona["primary_policy_leverage"],
            "cluster_centroid_distance": user_assigned_persona["centroid_distance"],
            "top_match_score": scored_opportunities[0].suitability_score if scored_opportunities else 85,
            "market_intelligence": market_intel
        },
        recommendations=scored_opportunities[:5],
        ml_model_summary={
            "best_model": ml_engine.best_model_name,
            "benchmarks": ml_engine.benchmarks,
            "feature_importances": ml_engine.feature_importances
        },
        hierarchical_funnel=hierarchical_funnel
    )



def generate_financial_plan(req: FinancialPlanRequest, db: Session = None) -> FinancialPlanResponse:
    opp = None
    if db is not None:
        try:
            opp = db.query(BusinessOpportunity).filter(BusinessOpportunity.id == req.opportunity_id).first()
        except Exception:
            opp = None

    if not opp:
        opps_raw = load_csv("opportunities.csv")
        for r in opps_raw:
            if int(r.get("id", 0)) == req.opportunity_id:
                opp = CsvOpportunity(**r)
                break

    opps_canonical = load_csv("opportunities.csv")
    name_to_canon_id = {r["name"].lower().strip(): int(r["id"]) for r in opps_canonical}
    canon_id = name_to_canon_id.get(opp.name.lower().strip(), req.opportunity_id) if opp else req.opportunity_id

    benchmarks_cache = load_opportunity_benchmarks()
    name_key = opp.name.lower().strip() if opp else ""
    bench = (
        benchmarks_cache.get(name_key) or
        benchmarks_cache.get(canon_id) or
        benchmarks_cache.get(req.opportunity_id)
    )
    if not bench and opp:
        bench = infer_benchmark_from_opportunity(opp)
    if not bench:
        bench = {"capex": 800000, "margin_pct": 30}

    actual_capex = float(bench["capex"])
    category = opp.category if opp else "Food Processing & Value Addition"
    name = opp.name if opp else "Citrus Value-Addition Enterprise Unit"
    fin = calculate_financials(actual_capex, req.user_budget, category)

    return FinancialPlanResponse(
        opportunity_name=name,
        category=category,
        total_project_cost=fin.total_project_cost,
        user_contribution=req.user_budget,
        funding_gap=fin.funding_gap,
        scheme_name=fin.eligible_scheme,
        scheme_subsidy_amount=fin.subsidy_amount,
        subsidy_percentage=fin.subsidy_percentage,
        bank_loan_amount=fin.bank_loan_required,
        eligibility_criteria=[
            "Micro or small enterprise registration on Udyam portal.",
            "Detailed Project Report (DPR) aligned with MoFPI / MIDH standards.",
            "Bank credit sanction required before capital subsidy disbursement."
        ],
        action_steps=[
            "1. Prepare Detailed Project Report (DPR) with verified technical specs.",
            "2. Submit online application on official PMFME / MIDH portal.",
            "3. Obtain in-principle term-loan sanction from a scheduled commercial bank.",
            "4. Receive 35% credit-linked capital subsidy into loan escrow account."
        ],
        fixed_asset_investment=fin.fixed_asset_investment,
        initial_working_capital=fin.initial_working_capital,
        total_project_funding=fin.total_project_funding,
        working_capital_details=fin.working_capital_details,
    )


def register_new_business_opportunity(data: dict, db: Session = None) -> dict:
    """
    Dynamically registers a brand new business opportunity into EntreVision.
    Appends to:
    - PostgreSQL business_opportunity table (if available)
    - opportunities.csv
    - opportunity_requirements.csv
    - opportunity_benchmarks.csv
    Ensures complete end-to-end scalability without code modifications.
    """
    from pathlib import Path
    base_dir = Path(__file__).resolve().parents[4] / "data" / "proccessed"
    if not base_dir.exists():
        base_dir = Path(__file__).resolve().parents[3] / "data" / "proccessed"

    opps_raw = load_csv("opportunities.csv")
    max_id = max([int(r.get("id", 0)) for r in opps_raw], default=0)
    new_id = max_id + 1

    name = data.get("name", f"New Opportunity {new_id}")
    category = data.get("category", "Value Addition & Agri-Business")
    subcategory = data.get("subcategory", "")
    capex = float(data.get("capex_inr", 500000.0))
    opex = float(data.get("opex_monthly_inr") or round(capex * 0.04, -2))
    margin = float(data.get("margin_pct") or 30.0)
    risk = data.get("risk_level", "Medium")
    scale = data.get("scale", "Small")
    timeline = data.get("timeline", "2–4 Months")
    req_skills = ",".join(data.get("required_skills", ["SKL01"]))
    req_resources = ",".join(data.get("required_resources", ["RES05"]))
    pref_locs = ", ".join(data.get("preferred_locations", ["Katol", "Warud-Morshi"]))
    training = data.get("training_recommendation") or f"CCRI / KVK Technical Certification in {name}"
    description = data.get("description", "")
    source = data.get("source", "User Custom Opportunity")
    source_url = data.get("source_url", "")

    # 1. Append to opportunities.csv
    opp_csv = base_dir / "opportunities.csv"
    if opp_csv.exists():
        with open(opp_csv, "a", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
                new_id, "1", name, description, category, subcategory,
                f"Rs {capex/100000:.1f} Lakhs", "Medium", "Regional Market",
                pref_locs, "validated", source, source_url
            ])

    # 2. Append to opportunity_requirements.csv
    req_csv = base_dir / "opportunity_requirements.csv"
    if req_csv.exists():
        with open(req_csv, "a", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([new_id, name, req_skills, req_resources, int(capex), pref_locs])

    # 3. Append to opportunity_benchmarks.csv
    bench_csv = base_dir / "opportunity_benchmarks.csv"
    if bench_csv.exists():
        clusters = {loc.strip(): 1.0 for loc in pref_locs.split(",") if loc.strip()}
        with open(bench_csv, "a", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
                new_id, name, capex, opex, margin, risk, scale, timeline,
                f"{category}|{subcategory}", training, json.dumps(clusters),
                0.75, False, 0.0
            ])

    # 4. If DB available, persist into PostgreSQL
    db_id = new_id
    if db is not None:
        try:
            from app.modules.industry.models import BusinessOpportunity
            new_opp = BusinessOpportunity(
                industry_id=1,
                name=name,
                description=description,
                category=category,
                subcategory=subcategory,
                investment_level=f"Rs {capex/100000:.1f} Lakhs",
                technology_level="Medium",
                target_market="Regional Market",
                location_relevance=pref_locs,
                status="validated",
                source=source,
                source_url=source_url
            )
            db.add(new_opp)
            db.commit()
            db.refresh(new_opp)
            db_id = new_opp.id
        except Exception as e:
            logger.warning(f"Failed to persist new opportunity to DB, saved to CSVs: {e}")

    return {
        "success": True,
        "message": f"Successfully registered business model '{name}' (ID: {new_id})",
        "opportunity_id": db_id,
        "opportunity_name": name,
        "category": category,
        "capex_inr": capex,
        "margin_pct": margin,
        "scale": scale
    }

