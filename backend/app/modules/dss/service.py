import os
import csv
from typing import List, Dict, Any
from sqlalchemy.orm import Session

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
)


def load_csv(filename: str) -> List[Dict[str, str]]:
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "proccessed"))
    filepath = os.path.join(base_dir, filename)
    if not os.path.exists(filepath):
        return []
    with open(filepath, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)


def get_all_skills() -> List[SkillItem]:
    rows = load_csv("skills.csv")
    return [SkillItem(**row) for row in rows]


def get_all_resources() -> List[ResourceItem]:
    rows = load_csv("resources.csv")
    return [ResourceItem(**row) for row in rows]


def get_all_locations() -> List[LocationItem]:
    rows = load_csv("locations.csv")
    return [LocationItem(**row) for row in rows]


def calculate_financials(opp_req: Dict[str, Any], user_budget: float, category: str) -> FinancialBreakdown:
    min_cost = float(opp_req.get("min_investment_inr", 500000))

    # Scheme Logic: PMFME vs NHM/MIDH vs General
    if "Food & Beverage" in category or "Processing" in category:
        scheme_name = "PMFME (One District One Product - Nagpur Orange)"
        subsidy_rate = "35% (Max ₹10 Lakhs)"
        subsidy = min(min_cost * 0.35, 1000000.0)
        equity_min = max(min_cost * 0.10, min_cost - subsidy - (min_cost * 0.55))
        bank_loan = min_cost - subsidy - equity_min
    elif "Cultivation" in category or "Propagation" in category:
        scheme_name = "MIDH / NHM Commercial Horticulture Subsidy"
        subsidy_rate = "50% (Accredited Nurseries) / 35% (Standard)"
        subsidy = min_cost * 0.35
        equity_min = min_cost * 0.50
        bank_loan = min_cost - subsidy - equity_min
    elif "Storage" in category or "Packaging" in category:
        scheme_name = "MIDH Post-Harvest Infrastructure Assistance"
        subsidy_rate = "35% Capital Subsidy"
        subsidy = min_cost * 0.35
        equity_min = min_cost * 0.25
        bank_loan = min_cost - subsidy - equity_min
    else:
        scheme_name = "PMEGP MSME Margin Money Subsidy"
        subsidy_rate = "25% (Rural) / 15% (Urban)"
        subsidy = min_cost * 0.25
        equity_min = min_cost * 0.10
        bank_loan = min_cost - subsidy - equity_min

    funding_gap = max(0.0, min_cost - user_budget)

    if user_budget >= min_cost:
        status = "Sufficient (Self-funded)"
    elif user_budget >= equity_min:
        status = "Highly Bankable (Assisted by Subsidy & Bank Loan)"
    else:
        status = "Requires Additional Partner Capital or Higher Loan"

    return FinancialBreakdown(
        total_project_cost=min_cost,
        eligible_scheme=scheme_name,
        subsidy_amount=subsidy,
        subsidy_percentage=subsidy_rate,
        farmer_equity_required=equity_min,
        bank_loan_required=bank_loan,
        user_budget=user_budget,
        funding_gap=funding_gap,
        budget_status=status
    )


def evaluate_recommendations(user_input: AssessmentInput, db: Session) -> RecommendationResponse:
    opps = db.query(BusinessOpportunity).all()
    reqs_list = load_csv("opportunity_requirements.csv")
    reqs_map = {int(r["opportunity_id"]): r for r in reqs_list}
    skills_map = {s["skill_id"]: s["user_label"] for s in load_csv("skills.csv")}
    resources_map = {r["resource_id"]: r["user_label"] for r in load_csv("resources.csv")}
    infra_list = load_csv("infrastructure.csv")

    scored_opportunities: List[OpportunityRecommendation] = []

    user_skills_set = set(user_input.skills)
    user_resources_set = set(user_input.resources)
    if user_input.has_land and user_input.land_acres >= 1.0:
        user_resources_set.add("RES01")

    for opp in opps:
        req = reqs_map.get(opp.id, {
            "required_skills": "",
            "required_resources": "",
            "min_investment_inr": 500000,
            "preferred_locations": "Nagpur"
        })

        req_skills = [s.strip() for s in req["required_skills"].split(",") if s.strip()]
        req_resources = [r.strip() for r in req["required_resources"].split(",") if r.strip()]
        pref_locations = req["preferred_locations"]
        min_invest = float(req["min_investment_inr"])

        reasons = []

        # 1. Location Match (0.0 to 1.0)
        loc_ratio = 0.5
        if user_input.location.lower() in pref_locations.lower() or "Nagpur" in pref_locations:
            loc_ratio = 1.0
            reasons.append(f"📍 Excellent location match: {user_input.location} is an optimal hub for this business.")
        elif any(loc.strip().lower() in user_input.location.lower() for loc in pref_locations.split(",")):
            loc_ratio = 0.8
            reasons.append(f"📍 Nearby location advantage in {user_input.location}.")
        else:
            reasons.append(f"📍 Location note: Optimal regional hubs include {pref_locations}.")

        # 2. Resource Match (0.0 to 1.0)
        matched_res_ids = user_resources_set.intersection(set(req_resources))
        missing_res_ids = set(req_resources).difference(user_resources_set)
        if len(req_resources) > 0:
            res_ratio = round(len(matched_res_ids) / len(req_resources), 2)
        else:
            res_ratio = 1.0

        if len(matched_res_ids) > 0:
            matched_names = [resources_map.get(r, r) for r in matched_res_ids]
            reasons.append(f"🏢 Resource match: You already possess {', '.join(matched_names)}.")

        # 3. Skill Match (0.0 to 1.0)
        matched_skl_ids = user_skills_set.intersection(set(req_skills))
        missing_skl_ids = set(req_skills).difference(user_skills_set)
        if len(req_skills) > 0:
            skl_ratio = round(len(matched_skl_ids) / len(req_skills), 2)
        else:
            skl_ratio = 1.0

        if len(matched_skl_ids) > 0:
            matched_names = [skills_map.get(s, s) for s in matched_skl_ids]
            reasons.append(f"🌱 Skill alignment: You have direct experience in {', '.join(matched_names)}.")

        # 4. Financial & Budget Feasibility
        fin_breakdown = calculate_financials(req, user_input.budget_inr, opp.category)
        if user_input.budget_inr >= min_invest:
            inv_ratio = 1.0
            reasons.append(f"💰 Capital ready: Your budget of ₹{user_input.budget_inr:,.0f} fully covers project costs.")
        elif user_input.budget_inr >= fin_breakdown.farmer_equity_required:
            inv_ratio = 0.85
            reasons.append(f"💰 Highly Bankable: Your equity of ₹{user_input.budget_inr:,.0f} meets promoter minimums with {fin_breakdown.eligible_scheme}.")
        elif user_input.budget_inr >= (fin_breakdown.farmer_equity_required * 0.5):
            inv_ratio = 0.5
            reasons.append("💰 Partial match: Additional loan or co-promoter capital needed.")
        else:
            inv_ratio = 0.25

        # Weighted Overall Match (0.0 to 1.0)
        # Weights: Location 0.30, Skills 0.25, Resources 0.25, Investment 0.20
        overall_val = round((loc_ratio * 0.30) + (skl_ratio * 0.25) + (res_ratio * 0.25) + (inv_ratio * 0.20), 2)
        suitability_pct = int(min(overall_val * 100, 100))

        # Nearby Infrastructure for location
        nearby_infra = [
            f"{i['facility_name']} ({i['facility_type']} in {i['location_area']})"
            for i in infra_list
            if user_input.location.lower() in i['taluka_district'].lower() or user_input.location.lower() in i['location_area'].lower()
        ]
        if not nearby_infra:
            if infra_list:
                nearby_infra = [f"{infra_list[0]['facility_name']} ({infra_list[0].get('location_area', 'Nagpur')})"]
            else:
                nearby_infra = ["Kalamna APMC Market Yard (Nagpur Central Cold Chain Hub)"]

        rec = OpportunityRecommendation(
            opportunity_id=opp.id,
            name=opp.name,
            category=opp.category,
            subcategory=opp.subcategory or "",
            investment_level=opp.investment_level or "",
            technology_level=opp.technology_level or "",
            target_market=opp.target_market or "",
            location_relevance=opp.location_relevance or "",
            status=opp.status or "candidate",
            source=opp.source or "",
            source_url=opp.source_url or "",
            description=opp.description or "",
            
            skill_match=skl_ratio,
            resource_match=res_ratio,
            location_match=loc_ratio,
            overall_match=overall_val,
            suitability_score=suitability_pct,
            
            match_reasons=reasons,
            matched_skills=[skills_map.get(s, s) for s in matched_skl_ids],
            missing_skills=[skills_map.get(s, s) for s in missing_skl_ids],
            matched_resources=[resources_map.get(r, r) for r in matched_res_ids],
            missing_resources=[resources_map.get(r, r) for r in missing_res_ids],
            financial_breakdown=fin_breakdown,
            nearby_infrastructure=nearby_infra[:2]
        )
        scored_opportunities.append(rec)

    # Sort descending by suitability score
    scored_opportunities.sort(key=lambda x: x.suitability_score, reverse=True)

    return RecommendationResponse(
        user_summary={
            "location": user_input.location,
            "budget": f"₹{user_input.budget_inr:,.0f}",
            "selected_skills_count": len(user_input.skills),
            "selected_resources_count": len(user_input.resources),
            "land_acres": user_input.land_acres if user_input.has_land else 0.0,
            "funding_preference": user_input.funding_preference
        },
        recommendations=scored_opportunities[:5]
    )


def generate_financial_plan(req: FinancialPlanRequest, db: Session) -> FinancialPlanResponse:
    opp = db.query(BusinessOpportunity).filter(BusinessOpportunity.id == req.opportunity_id).first()
    reqs_list = load_csv("opportunity_requirements.csv")
    reqs_map = {int(r["opportunity_id"]): r for r in reqs_list}
    opp_req = reqs_map.get(req.opportunity_id, {"min_investment_inr": 800000})

    category = opp.category if opp else "Food & Beverage"
    name = opp.name if opp else "Agro Enterprise Unit"
    fin = calculate_financials(opp_req, req.user_budget, category)

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
        ]
    )
