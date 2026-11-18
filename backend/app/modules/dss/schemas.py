from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class AssessmentInput(BaseModel):
    # Step 1: About You
    about_me: Dict[str, Any] = Field(default_factory=dict)

    # Step 2: Skills
    skills: List[str] = Field(default_factory=list)          # e.g. ["SKL01", "SKL06"]
    skills_detailed: List[Dict[str, Any]] = Field(default_factory=list)
    willingness_to_learn: str = "willing_to_learn"

    # Step 3: Documents & Proof
    documents: Dict[str, Any] = Field(default_factory=dict)

    # Step 4: Resources & Existing Setup
    resources: List[str] = Field(default_factory=list)       # e.g. ["RES01", "RES02"]
    resources_detailed: Dict[str, Any] = Field(default_factory=dict)
    has_land: bool = False
    land_acres: float = 0.0
    has_workspace: bool = False

    # Step 5: Location
    location: str = "Katol"
    location_detailed: Dict[str, Any] = Field(default_factory=dict)

    # Step 6: Financial Capacity & Debt
    budget_inr: float = 300000.0
    finance_detailed: Dict[str, Any] = Field(default_factory=dict)
    needs_funding: bool = True
    funding_preference: str = "subsidy_and_loan"

    # Step 7: Preferences & Goals
    business_preferences: Dict[str, Any] = Field(default_factory=dict)
    interests: List[str] = Field(default_factory=list)
    risk_tolerance: str = "moderate_risk"
    business_scale: str = "small"
    time_commitment: str = "full_time"


class SkillItem(BaseModel):
    skill_id: str
    category_group: str
    user_label: str
    internal_name: str
    description: str


class ResourceItem(BaseModel):
    resource_id: str
    category_group: str
    user_label: str
    internal_name: str
    description: str


class LocationItem(BaseModel):
    location_id: str
    location_name: str
    location_type: str
    district: str
    key_advantages: str
    supported_sectors: str


class FinancialBreakdown(BaseModel):
    total_project_cost: float
    eligible_scheme: str
    subsidy_amount: float
    subsidy_percentage: str
    farmer_equity_required: float
    bank_loan_required: float
    user_budget: float
    funding_gap: float
    budget_status: str
    fixed_asset_investment: Optional[float] = None
    initial_working_capital: Optional[float] = None
    total_project_funding: Optional[float] = None
    working_capital_details: Optional[Dict[str, Any]] = None
    financing_assumptions: Optional[Dict[str, Any]] = None
    disclaimer: Optional[str] = None


class OpportunityRecommendation(BaseModel):
    opportunity_id: int
    name: str
    category: str
    subcategory: str
    investment_level: str
    technology_level: str
    target_market: str
    location_relevance: str
    status: str
    source: str
    source_url: str
    description: str
    
    # Granular Match Scores (0.0 to 1.0) and overall score (0 to 100%)
    skill_match: float
    resource_match: float
    location_match: float
    financial_match: float = 0.8
    intent_match: float = 0.8
    overall_match: float
    suitability_score: int
    
    # Dynamic Decision Engine Analytics
    skill_match_pct: int = 80
    est_capex_formatted: str = "₹5,00,000"
    est_margin: str = "25–35% Net"
    setup_timeline: str = "2–4 Months"
    training_recommendation: str = "Short CCRI / KVK certification recommended"
    risk_level: str = "Medium"
    scale: str = "Small"

    # 5-Vector Radar Scores for SVG Visualization (0 to 100 each)
    radar_scores: Dict[str, int] = Field(default_factory=dict)
    
    match_reasons: List[str]
    matched_skills: List[str]
    missing_skills: List[str]
    matched_resources: List[str]
    missing_resources: List[str]
    financial_breakdown: FinancialBreakdown
    nearby_infrastructure: List[str]
    is_eligible: bool = True
    eligibility_status: str = "Eligible"
    raw_suitability_score: Optional[int] = None
    mcda_breakdown: Dict[str, Any] = Field(default_factory=dict)
    feasibility_score: Optional[int] = None
    score_type: str = "MCDA"
    ml_prediction: Optional[Dict[str, Any]] = None
    gap_analysis: Optional[Dict[str, Any]] = None
    readiness_report: Optional[Dict[str, Any]] = None
    cluster_persona: Optional[str] = None
    cluster_match: Optional[bool] = None
    scheme_eligibility: Optional[Dict[str, Any]] = None


class HierarchicalFunnelStep(BaseModel):
    level: int
    name: str
    criterion: str
    passed_count: int
    dropped_count: int
    status: str  # "PASSED" | "BOTTLENECK"
    passed_sample: List[str] = []


class HierarchicalFunnel(BaseModel):
    total_initial_businesses: int
    strict_matches_count: int
    has_strict_match: bool
    bottleneck_level: Optional[int] = None
    bottleneck_name: Optional[str] = None
    bottleneck_message: Optional[str] = None
    steps: List[HierarchicalFunnelStep] = []
    strict_matching_opportunities: List[str] = []


class RecommendationResponse(BaseModel):
    user_summary: Dict[str, Any]
    recommendations: List[OpportunityRecommendation]
    ml_model_summary: Optional[Dict[str, Any]] = None
    hierarchical_funnel: Optional[HierarchicalFunnel] = None



class FinancialPlanRequest(BaseModel):
    opportunity_id: int
    user_budget: float
    location: str = "Nagpur"


class FinancialPlanResponse(BaseModel):
    opportunity_name: str
    category: str
    total_project_cost: float
    user_contribution: float
    funding_gap: float
    scheme_name: str
    scheme_subsidy_amount: float
    subsidy_percentage: str
    bank_loan_amount: float
    eligibility_criteria: List[str]
    action_steps: List[str]
    fixed_asset_investment: Optional[float] = None
    initial_working_capital: Optional[float] = None
    total_project_funding: Optional[float] = None
    working_capital_details: Optional[Dict[str, Any]] = None


class CreateOpportunityRequest(BaseModel):
    name: str
    category: str
    subcategory: Optional[str] = None
    capex_inr: float
    opex_monthly_inr: Optional[float] = None
    margin_pct: Optional[float] = None
    risk_level: Optional[str] = "Medium"
    scale: Optional[str] = "Small"
    timeline: Optional[str] = "2–4 Months"
    required_skills: Optional[List[str]] = Field(default_factory=lambda: ["SKL01"])
    required_resources: Optional[List[str]] = Field(default_factory=lambda: ["RES05"])
    preferred_locations: Optional[List[str]] = Field(default_factory=lambda: ["Katol", "Warud-Morshi"])
    training_recommendation: Optional[str] = None
    description: Optional[str] = ""
    source: Optional[str] = "User Custom Opportunity"
    source_url: Optional[str] = ""


class CreateOpportunityResponse(BaseModel):
    success: bool
    message: str
    opportunity_id: int
    opportunity_name: str
    category: str
    capex_inr: float
    margin_pct: float
    scale: str

