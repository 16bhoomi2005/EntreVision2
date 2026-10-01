from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class AssessmentInput(BaseModel):
    interests: List[str] = Field(default_factory=list)       # e.g. ["Agriculture", "Food Processing"]
    skills: List[str] = Field(default_factory=list)          # e.g. ["SKL01", "SKL02"]
    resources: List[str] = Field(default_factory=list)       # e.g. ["RES01", "RES02"]
    location: str                                            # e.g. "Katol"
    budget_inr: float                                        # e.g. 300000
    has_land: bool = False
    land_acres: float = 0.0
    needs_funding: bool = True
    funding_preference: str = "subsidy_and_loan"             # "self", "subsidy_and_loan", "loan_only"


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
    overall_match: float
    suitability_score: int
    
    match_reasons: List[str]
    matched_skills: List[str]
    missing_skills: List[str]
    matched_resources: List[str]
    missing_resources: List[str]
    financial_breakdown: FinancialBreakdown
    nearby_infrastructure: List[str]


class RecommendationResponse(BaseModel):
    user_summary: Dict[str, Any]
    recommendations: List[OpportunityRecommendation]


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
