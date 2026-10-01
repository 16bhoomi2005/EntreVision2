from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import SessionLocal
from app.modules.dss import schemas, service

router = APIRouter(prefix="/api", tags=["DSS Engine & Assessments"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/skills", response_model=List[schemas.SkillItem])
def get_skills():
    return service.get_all_skills()


@router.get("/resources", response_model=List[schemas.ResourceItem])
def get_resources():
    return service.get_all_resources()


@router.get("/locations", response_model=List[schemas.LocationItem])
def get_locations():
    return service.get_all_locations()


@router.post("/recommendations", response_model=schemas.RecommendationResponse)
def generate_recommendations(
    user_input: schemas.AssessmentInput,
    db: Session = Depends(get_db)
):
    try:
        return service.evaluate_recommendations(user_input, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error computing recommendations: {str(e)}")


@router.post("/financial-plan", response_model=schemas.FinancialPlanResponse)
def get_financial_plan(
    plan_req: schemas.FinancialPlanRequest,
    db: Session = Depends(get_db)
):
    try:
        return service.generate_financial_plan(plan_req, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error computing financial plan: {str(e)}")
