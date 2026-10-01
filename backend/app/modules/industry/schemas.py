from typing import Optional, List
from pydantic import BaseModel, Field


# ---------------------------------------------
# Business Opportunity Schemas
# ---------------------------------------------

class BusinessOpportunityBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    investment_level: Optional[str] = None
    technology_level: Optional[str] = None
    target_market: Optional[str] = None
    location_relevance: Optional[str] = None
    status: Optional[str] = "candidate"
    source: Optional[str] = None
    source_url: Optional[str] = None


class BusinessOpportunityCreate(BusinessOpportunityBase):
    industry_id: int


class BusinessOpportunityResponse(BusinessOpportunityBase):
    id: int
    industry_id: int

    class Config:
        from_attributes = True


# ---------------------------------------------
# Industry Schemas
# ---------------------------------------------

class IndustryBase(BaseModel):
    name: str
    description: Optional[str] = None
    region: Optional[str] = None
    is_active: Optional[bool] = True


class IndustryCreate(IndustryBase):
    pass


class IndustryResponse(IndustryBase):
    id: int
    business_opportunities: List[BusinessOpportunityResponse] = Field(
        default_factory=list
    )

    class Config:
        from_attributes = True
