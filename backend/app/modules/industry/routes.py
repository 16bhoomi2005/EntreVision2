from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import SessionLocal
from app.modules.industry import service, schemas

router = APIRouter(prefix="/industries", tags=["Industries"])


# Dependency to get DB session per request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("", response_model=List[schemas.IndustryResponse])
def read_industries(db: Session = Depends(get_db)):
    return service.get_industries(db)


@router.post("", response_model=schemas.IndustryResponse, status_code=status.HTTP_201_CREATED)
def create_new_industry(industry: schemas.IndustryCreate, db: Session = Depends(get_db)):
    existing = service.get_industry_by_name(db, name=industry.name)
    if existing:
        raise HTTPException(status_code=400, detail="Industry with this name already exists")
    return service.create_industry(db, industry)


@router.get("/{industry_id}", response_model=schemas.IndustryResponse)
def read_industry(industry_id: int, db: Session = Depends(get_db)):
    db_industry = service.get_industry_by_id(db, industry_id=industry_id)
    if not db_industry:
        raise HTTPException(status_code=404, detail="Industry not found")
    return db_industry


@router.get("/{industry_id}/opportunities", response_model=List[schemas.BusinessOpportunityResponse])
def read_industry_opportunities(industry_id: int, db: Session = Depends(get_db)):
    db_industry = service.get_industry_by_id(db, industry_id=industry_id)
    if not db_industry:
        raise HTTPException(status_code=404, detail="Industry not found")
    return service.get_opportunities_by_industry(db, industry_id=industry_id)


@router.get("/{industry_id}/opportunities/{opportunity_id}", response_model=schemas.BusinessOpportunityResponse)
def read_single_opportunity(industry_id: int, opportunity_id: int, db: Session = Depends(get_db)):
    db_opp = service.get_opportunity_by_id(db, opportunity_id=opportunity_id)
    if not db_opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return db_opp


@router.post("/{industry_id}/opportunities", response_model=schemas.BusinessOpportunityResponse, status_code=status.HTTP_201_CREATED)
def create_opportunity_for_industry(
    industry_id: int,
    opp: schemas.BusinessOpportunityBase,
    db: Session = Depends(get_db)
):
    db_industry = service.get_industry_by_id(db, industry_id=industry_id)
    if not db_industry:
        raise HTTPException(status_code=404, detail="Industry not found")
    
    opp_create = schemas.BusinessOpportunityCreate(**opp.model_dump(), industry_id=industry_id)
    return service.create_business_opportunity(db, opp_create)
