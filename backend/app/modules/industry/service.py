from sqlalchemy.orm import Session
from typing import List, Optional

from app.modules.industry.models import Industry, BusinessOpportunity
from app.modules.industry.schemas import IndustryCreate, BusinessOpportunityCreate


# ---------------------------------------------
# Industry Service Functions
# ---------------------------------------------

def get_industries(db: Session) -> List[Industry]:
    return db.query(Industry).filter(Industry.is_active == True).all()


def get_industry_by_id(db: Session, industry_id: int) -> Optional[Industry]:
    return db.query(Industry).filter(Industry.id == industry_id).first()


def get_industry_by_name(db: Session, name: str) -> Optional[Industry]:
    return db.query(Industry).filter(Industry.name.ilike(name)).first()


def create_industry(db: Session, industry_data: IndustryCreate) -> Industry:
    db_industry = Industry(**industry_data.model_dump())
    db.add(db_industry)
    db.commit()
    db.refresh(db_industry)
    return db_industry


# ---------------------------------------------
# Business Opportunity Service Functions
# ---------------------------------------------

def get_opportunities_by_industry(db: Session, industry_id: int) -> List[BusinessOpportunity]:
    return db.query(BusinessOpportunity).filter(
        BusinessOpportunity.industry_id == industry_id
    ).all()


def get_opportunity_by_id(db: Session, opportunity_id: int) -> Optional[BusinessOpportunity]:
    return db.query(BusinessOpportunity).filter(BusinessOpportunity.id == opportunity_id).first()


def create_business_opportunity(
    db: Session,
    opp_data: BusinessOpportunityCreate
) -> BusinessOpportunity:
    db_opp = BusinessOpportunity(**opp_data.model_dump())
    db.add(db_opp)
    db.commit()
    db.refresh(db_opp)
    return db_opp
