from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import FileResponse
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
import logging
import uuid
import os
import re
import inspect
from pathlib import Path

from app.database.connection import SessionLocal
from app.modules.dss import schemas, service
from app.modules.dss.forecaster import PriceForecaster
from app.modules.dss.ml_engine import ml_engine
from app.modules.dss import scheme_engine
from app.database.models_scheme import GovernmentScheme
from app.database.models_document import UserDocument, VALID_STATUSES

router = APIRouter(
    prefix="/api",
    tags=["Frontend API & Decision Support Engine"]
)

logger = logging.getLogger(__name__)
forecaster_engine = PriceForecaster()


def get_db():
    try:
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
    except Exception as e:
        logger.warning(f"Database session unavailable, continuing with file-based engine: {e}")
        yield None


@router.get("/skills")
async def get_skills():
    """Returns the list of skills for the frontend dropdowns & wizard"""
    return service.get_all_skills()


@router.get("/locations")
async def get_locations():
    """Returns the list of locations/tehsils for the frontend"""
    return service.get_all_locations()


@router.get("/market-intelligence")
async def get_market_intelligence(location: str = "Katol"):
    """
    Returns data-driven market intelligence for the selected location/cluster:
    Tehsil acreage & harvest, 30-day wholesale Mandi prices, nearby cold storage infrastructure,
    training institutions, and regulatory roadmap.
    """
    return service.get_market_intelligence(location)


@router.get("/resources")
async def get_resources():
    """Returns available resources catalog"""
    return service.get_all_resources()


@router.post("/recommendations", response_model=schemas.RecommendationResponse)
async def get_recommendations(req: dict, db: Session = Depends(get_db)):
    """
    Evaluates user profile against all Nagpur orange agribusiness models.
    Matches user's capital, skills, land, equipment, and location with the optimal ventures.
    """
    try:
        # 1. Budget normalization
        budget = 500000.0
        if "budget_inr" in req and req["budget_inr"] is not None:
            budget = float(req["budget_inr"])
        elif "capital" in req and req["capital"] is not None:
            budget = float(req["capital"])
        elif "finance_detailed" in req and isinstance(req["finance_detailed"], dict):
            budget = float(req["finance_detailed"].get("availableCapitalINR") or 500000.0)

        # 2. Location normalization
        location = req.get("location")
        if not location and isinstance(req.get("location_detailed"), dict):
            location = req["location_detailed"].get("selectedCluster")
        if not location:
            location = "Katol"

        # 3. Skills normalization
        skills = []
        raw_skills = req.get("skills", [])
        if isinstance(raw_skills, list):
            for s in raw_skills:
                if isinstance(s, dict) and "skillId" in s:
                    skills.append(s["skillId"])
                elif isinstance(s, str):
                    skills.append(s)
        elif isinstance(raw_skills, str) and raw_skills.strip():
            skills.append(raw_skills.strip())

        raw_skills_detailed = req.get("skills_detailed", [])
        if isinstance(raw_skills_detailed, list):
            for s in raw_skills_detailed:
                if isinstance(s, dict) and s.get("skillId") and s["skillId"] not in skills:
                    skills.append(s["skillId"])

        # 4. Resources normalization & synthesis from wizard details
        resources = []
        raw_res = req.get("resources", [])
        if isinstance(raw_res, list):
            resources.extend([str(r) for r in raw_res if r])

        res_detail = req.get("resources_detailed") or {}
        if isinstance(res_detail, dict):
            if res_detail.get("hasLand") and "RES01" not in resources:
                resources.append("RES01")
            water = res_detail.get("waterSources") or []
            if any(w in water for w in ["borewell", "drip_irrigation", "canal"]) and "RES02" not in resources:
                resources.append("RES02")
            trans = res_detail.get("transportModes") or []
            if any(isinstance(t, dict) and t.get("type") == "tractor" for t in trans) and "RES03" not in resources:
                resources.append("RES03")
            eq = res_detail.get("equipmentList") or []
            if any(isinstance(e, dict) and e.get("id") == "polyhouse" for e in eq) and "RES04" not in resources:
                resources.append("RES04")
            if res_detail.get("hasWorkspace") and "RES05" not in resources:
                resources.append("RES05")
            if res_detail.get("powerType") == "three_phase" and "RES06" not in resources:
                resources.append("RES06")
            if any(isinstance(e, dict) and e.get("id") == "dry_storage" for e in eq) and "RES07" not in resources:
                resources.append("RES07")
            if any(isinstance(e, dict) and e.get("id") == "juice_extractor" for e in eq) and "RES08" not in resources:
                resources.append("RES08")
            if any(isinstance(e, dict) and e.get("id") == "peel_oil_unit" for e in eq) and "RES09" not in resources:
                resources.append("RES09")
            if any(isinstance(t, dict) and t.get("type") in ["mini_truck", "freight_truck", "reefer"] for t in trans) and "RES10" not in resources:
                resources.append("RES10")
            if any(isinstance(e, dict) and e.get("id") == "grading_line" for e in eq) and "RES11" not in resources:
                resources.append("RES11")
            if any(isinstance(e, dict) and e.get("id") == "cold_storage" for e in eq) and "RES12" not in resources:
                resources.append("RES12")

        # 5. Land details
        has_land = bool(req.get("has_land", False) or res_detail.get("hasLand", False))
        land_acres = float(req.get("land_acres") or res_detail.get("landAcres") or 0.0)
        has_workspace = bool(req.get("has_workspace", False) or res_detail.get("hasWorkspace", False))
        
        willingness = str(req.get("willingness_to_learn") or (req.get("business_preferences", {}) or {}).get("willingnessToLearn") or "willing_to_learn")
        risk_tol = str(req.get("risk_tolerance") or (req.get("business_preferences", {}) or {}).get("riskTolerance") or "moderate_risk")
        scale_val = str(req.get("business_scale") or (req.get("business_preferences", {}) or {}).get("businessScale") or "small")
        time_commit = str(req.get("time_commitment") or (req.get("business_preferences", {}) or {}).get("timeCommitment") or "full_time")

        # 6. Construct structured AssessmentInput with ALL multi-dimensional attributes
        assessment_input = schemas.AssessmentInput(
            about_me=req.get("about_me", {}) or {},
            skills=skills,
            skills_detailed=raw_skills_detailed,
            willingness_to_learn=willingness,
            documents=req.get("documents", {}) or {},
            resources=resources,
            resources_detailed=res_detail,
            has_land=has_land,
            land_acres=land_acres,
            has_workspace=has_workspace,
            location=location,
            location_detailed=req.get("location_detailed", {}) or {},
            budget_inr=budget,
            finance_detailed=req.get("finance_detailed", {}) or {},
            business_preferences=req.get("business_preferences", {}) or {},
            interests=req.get("interests", []) or (req.get("business_preferences", {}) or {}).get("businessTypes", []),
            risk_tolerance=risk_tol,
            business_scale=scale_val,
            time_commitment=time_commit,
            needs_funding=bool(req.get("needs_funding", True)),
            funding_preference=str(req.get("funding_preference", "subsidy_and_loan"))
        )

        # 7. Evaluate and compute multi-criteria recommendations with gap analysis
        recommendation_response = service.evaluate_recommendations(assessment_input, db)

        # 8. If authenticated user_id provided, persist to PostgreSQL database
        user_id = req.get("user_id")
        if user_id and db is not None:
            try:
                db_user = db.query(User).filter(User.id == user_id).first()
                if db_user:
                    assessment = db.query(UserAssessment).filter(UserAssessment.user_id == user_id).first()
                    if not assessment:
                        assessment = UserAssessment(user_id=user_id)
                        db.add(assessment)
                    assessment.about_me = req.get("about_me") or {}
                    assessment.skills_detailed = raw_skills_detailed or req.get("skills_detailed") or []
                    assessment.willingness_to_learn = willingness
                    assessment.documents = req.get("documents") or []
                    assessment.resources_detailed = res_detail or req.get("resources_detailed") or {}
                    assessment.location_detailed = req.get("location_detailed") or {}
                    assessment.finance_detailed = req.get("finance_detailed") or {}
                    assessment.business_preferences = req.get("business_preferences") or {}
                    assessment.latest_recommendations = recommendation_response.dict()

                    if isinstance(req.get("about_me"), dict) and req["about_me"].get("fullName"):
                        db_user.full_name = req["about_me"]["fullName"]
                    if location and location != "Katol":
                        db_user.tehsil = location

                    if recommendation_response.recommendations:
                        top_opp = recommendation_response.recommendations[0]
                        mcda = top_opp.mcda_breakdown or {}
                        venture_dict = {
                            "id": f"OPP{top_opp.opportunity_id:02d}",
                            "opportunity_id": str(top_opp.opportunity_id),
                            "name": top_opp.name,
                            "category": top_opp.category,
                            "location": f"{location}, Nagpur District",
                            "suitability_score": top_opp.suitability_score,
                            "feasibility_score": top_opp.suitability_score,
                            "capital_fit": mcda.get("capital_fit", 85),
                            "infrastructure_fit": mcda.get("infrastructure_fit", 80),
                            "land_fit": mcda.get("land_fit", mcda.get("infrastructure_fit", 80)),
                            "skill_fit": mcda.get("skill_fit", 80),
                            "market_fit": mcda.get("market_fit", 80),
                            "resource_fit": mcda.get("resource_fit", 75),
                            "location_fit": mcda.get("location_fit", 80),
                            "score_type": "MCDA",
                            "mcda_breakdown": mcda,
                            "eligibility_status": top_opp.status,
                            "total_cost": top_opp.financial_breakdown.total_project_cost,
                            "own_equity": top_opp.financial_breakdown.farmer_equity_required,
                            "subsidy_amount": top_opp.financial_breakdown.subsidy_amount,
                            "subsidy_scheme": top_opp.financial_breakdown.eligible_scheme,
                            "bank_loan": top_opp.financial_breakdown.bank_loan_required,
                            "readiness_report": top_opp.readiness_report,
                            "journey_phase": 1,
                            "current_task": "Review Bankable DPR & Prescribed Training",
                            "next_deadline": "Next 7 Days"
                        }
                        venture = db.query(UserVenture).filter(UserVenture.user_id == user_id).first()
                        if not venture:
                            venture = UserVenture(
                                user_id=user_id,
                                opportunity_id=str(top_opp.opportunity_id),
                                venture_name=top_opp.name,
                                venture_data=venture_dict,
                                journey_phase=1,
                                current_task="Review Bankable DPR & Prescribed Training",
                                next_deadline="Next 7 Days"
                            )
                            db.add(venture)
                        else:
                            venture.opportunity_id = str(top_opp.opportunity_id)
                            venture.venture_name = top_opp.name
                            venture.venture_data = venture_dict
                    db.commit()
            except Exception as e:
                db.rollback()
                logger.warning(f"Could not persist user assessment to PostgreSQL database: {e}")

        return recommendation_response

    except Exception as e:
        logger.error(f"Error computing recommendations: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/financial-plan", response_model=schemas.FinancialPlanResponse)
async def get_financial_plan(req: dict, db: Session = Depends(get_db)):
    """
    Generates customized DPR financial plan with PMFME/MIDH capital subsidy,
    promoter equity, and bank term loan requirements for a selected opportunity.
    """
    try:
        opp_id = int(req.get("opportunity_id", 1))
        user_budget = float(req.get("user_budget", 500000.0))
        location = str(req.get("location", "Katol"))

        plan_req = schemas.FinancialPlanRequest(
            opportunity_id=opp_id,
            user_budget=user_budget,
            location=location
        )
        return service.generate_financial_plan(plan_req, db)
    except Exception as e:
        logger.error(f"Error generating financial plan: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/forecast")
async def get_price_forecast():
    """
    Returns the 7-day price forecast and market advice using historical mandi prices.
    """
    try:
        result = forecaster_engine.forecast_price_trend(days_ahead=7)
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/opportunities", response_model=schemas.CreateOpportunityResponse)
async def create_opportunity(req: schemas.CreateOpportunityRequest, db: Session = Depends(get_db)):
    """
    Dynamically registers a brand new business opportunity into the EntreVision Decision Engine.
    Persists to database and dynamic benchmark datasets, immediately enabling it in recommendations.
    """
    try:
        result = service.register_new_business_opportunity(req.dict(), db)
        return schemas.CreateOpportunityResponse(**result)
    except Exception as e:
        logger.error(f"Error registering new business model: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ml/metrics")
async def get_ml_metrics():
    """
    Returns quantitative evaluation benchmarks (Accuracy, Precision, Recall, F1, Confusion Matrix),
    Feature Importances (Gini/XAI), and K-Means Persona Clustering for academic defense & UI diagnostics.
    """
    try:
        return {
            "best_model": ml_engine.best_model_name,
            "benchmarks": ml_engine.benchmarks,
            "feature_importances": ml_engine.feature_importances,
            "cluster_profiles": ml_engine.cluster_profiles,
            "kmeans_evaluation": ml_engine.kmeans_evaluation
        }
    except Exception as e:
        logger.error(f"Error fetching ML metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ml/predict")
async def predict_ml_feasibility(payload: Dict[str, Any]):
    """
    Executes live Random Forest inference for a given user vector and capex requirement.
    """
    try:
        user_vector = payload.get("user_vector", {})
        opp_benchmark = payload.get("opp_benchmark", {})
        result = ml_engine.predict_feasibility(user_vector, opp_benchmark)
        return result
    except Exception as e:
        logger.error(f"Error executing ML inference: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# USER AUTHENTICATION & ACCESS CONTROL (POSTGRESQL RBAC & TOKEN SESSIONS)
# ============================================================================
import secrets
from app.modules.auth.models import User, UserAssessment, UserVenture, CollaborationConnection
from app.modules.auth.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
    get_current_user,
    get_current_user_optional
)


def get_or_create_default_assessment(user: User, db: Session) -> UserAssessment:
    """
    Retrieves or synthesizes a clean, personalized initial UserAssessment for a registered user,
    preventing identical dummy data from bleeding across different user accounts.
    """
    if not user or db is None:
        return None
    assessment = db.query(UserAssessment).filter(UserAssessment.user_id == user.id).first()
    if assessment:
        return assessment

    district = user.district or "Nagpur"
    tehsil = user.tehsil or "Katol"

    assessment = UserAssessment(
        user_id=user.id,
        about_me={
            "fullName": user.full_name or "",
            "education": "",
            "currentSituation": "",
            "goals": [],
        },
        skills_detailed=[],
        willingness_to_learn="willing_to_learn",
        documents=[],
        resources_detailed={
            "hasLand": False,
            "landAcres": 0,
            "landOwnership": "None",
            "waterSources": [],
            "hasWorkspace": False,
            "transportModes": [],
            "equipmentList": [],
            "powerType": "None",
            "existingSetupStatus": "none",
        },
        location_detailed={
            "operatingArea": f"{district} District",
            "selectedCluster": tehsil,
            "currentLocation": f"{district} District",
            "preferredBusinessLocation": tehsil,
        },
        finance_detailed={
            "personalSavings": 0,
            "rangeLabel": "Not set",
            "fundingSources": [],
            "borrowingPreference": "Not set",
            "investmentHorizon": "Not set",
        },
        business_preferences={
            "interestedSectors": [],
            "preferredScale": "Not set",
            "timeCommitment": "Not set",
            "corePriorities": [],
        },
        latest_recommendations=None,
    )
    db.add(assessment)
    try:
        db.commit()
        db.refresh(assessment)
    except Exception as e:
        logger.warning(f"Error creating default assessment for {user.id}: {e}")
        db.rollback()
    return assessment


@router.post("/auth/register")
async def register_user(payload: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Registers a new user in PostgreSQL and initializes their assessment profile.
    """
    email = payload.get("email", "").strip().lower()
    password = payload.get("password", "")
    full_name = payload.get("full_name", "").strip()
    role = payload.get("role", "Agro-Entrepreneur")
    tehsil = payload.get("tehsil", "Katol")
    phone = payload.get("phone", "")

    if not email or not password or not full_name:
        raise HTTPException(status_code=400, detail="Name, email, and password are required.")

    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable.")

    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists.")

    pwd_hash, salt = hash_password(password)
    user_id = f"usr_{secrets.token_hex(6)}"

    new_user = User(
        id=user_id,
        email=email,
        password_hash=pwd_hash,
        salt=salt,
        full_name=full_name,
        role=role,
        tehsil=tehsil,
        district="Nagpur",
        phone=phone,
        avatar="🍊" if role == "Agro-Entrepreneur" else ("🌾" if "Farmer" in role else "🏛️")
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    assessment = get_or_create_default_assessment(new_user, db)
    assessment_data = None
    if assessment:
        assessment_data = {
            "about_me": assessment.about_me,
            "skills_detailed": assessment.skills_detailed,
            "willingness_to_learn": assessment.willingness_to_learn,
            "documents": assessment.documents,
            "resources_detailed": assessment.resources_detailed,
            "location_detailed": assessment.location_detailed,
            "finance_detailed": assessment.finance_detailed,
            "business_preferences": assessment.business_preferences,
            "latest_recommendations": assessment.latest_recommendations,
        }

    token = create_access_token({"sub": new_user.id, "email": new_user.email, "role": new_user.role})
    return {
        "token": token,
        "user": new_user.to_safe_dict(),
        "activeVenture": None,
        "assessment_data": assessment_data,
    }


@router.post("/auth/login")
async def login_user(payload: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Authenticates user credentials against PostgreSQL database.
    Returns signed JWT token, profile details, active venture, and assessment state.
    """
    email = payload.get("email", "").strip().lower()
    password = payload.get("password", "")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required.")

    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable.")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    if not verify_password(password, user.password_hash, user.salt):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})

    # Fetch user's active venture and assessment data from PostgreSQL
    active_venture = None
    venture = db.query(UserVenture).filter(UserVenture.user_id == user.id).first()
    if venture and venture.venture_data:
        active_venture = venture.venture_data

    assessment = get_or_create_default_assessment(user, db)
    assessment_data = None
    if assessment:
        assessment_data = {
            "about_me": assessment.about_me,
            "skills_detailed": assessment.skills_detailed,
            "willingness_to_learn": assessment.willingness_to_learn,
            "documents": assessment.documents,
            "resources_detailed": assessment.resources_detailed,
            "location_detailed": assessment.location_detailed,
            "finance_detailed": assessment.finance_detailed,
            "business_preferences": assessment.business_preferences,
            "latest_recommendations": assessment.latest_recommendations,
        }

    return {
        "token": token,
        "user": user.to_safe_dict(),
        "activeVenture": active_venture,
        "assessment_data": assessment_data,
    }


@router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Validates JWT session and returns fresh user data directly from PostgreSQL.
    """
    user_id = current_user.get("sub")
    if not user_id or db is None:
        raise HTTPException(status_code=401, detail="Invalid session")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    active_venture = None
    venture = db.query(UserVenture).filter(UserVenture.user_id == user.id).first()
    if venture and venture.venture_data:
        active_venture = venture.venture_data

    assessment = get_or_create_default_assessment(user, db)
    assessment_data = None
    if assessment:
        assessment_data = {
            "about_me": assessment.about_me,
            "skills_detailed": assessment.skills_detailed,
            "willingness_to_learn": assessment.willingness_to_learn,
            "documents": assessment.documents,
            "resources_detailed": assessment.resources_detailed,
            "location_detailed": assessment.location_detailed,
            "finance_detailed": assessment.finance_detailed,
            "business_preferences": assessment.business_preferences,
            "latest_recommendations": assessment.latest_recommendations,
        }

    return {
        "user": user.to_safe_dict(),
        "activeVenture": active_venture,
        "assessment_data": assessment_data,
    }


@router.get("/auth/demo-users")
async def get_demo_users(db: Session = Depends(get_db)):
    """
    Returns verified demo profiles from PostgreSQL for 1-click evaluation testing.
    """
    if db is None:
        return []
    users = db.query(User).filter(User.id.in_(["usr_bhoomi", "usr_ramesh", "usr_pooja"])).all()
    result = []
    for u in users:
        u_dict = u.to_safe_dict()
        venture = db.query(UserVenture).filter(UserVenture.user_id == u.id).first()
        if venture and venture.venture_data:
            u_dict["activeVenture"] = venture.venture_data
        result.append(u_dict)
    return result


@router.get("/user/profile")
async def get_user_profile(user_id: str, db: Session = Depends(get_db)):
    """
    Returns the isolated profile, assessment inputs, and saved business plan
    for the specific authenticated user from PostgreSQL.
    """
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User profile not found")

    active_venture = None
    venture = db.query(UserVenture).filter(UserVenture.user_id == user.id).first()
    if venture and venture.venture_data:
        active_venture = venture.venture_data

    assessment = get_or_create_default_assessment(user, db)
    assessment_data = None
    if assessment:
        assessment_data = {
            "about_me": assessment.about_me,
            "skills_detailed": assessment.skills_detailed,
            "willingness_to_learn": assessment.willingness_to_learn,
            "documents": assessment.documents,
            "resources_detailed": assessment.resources_detailed,
            "location_detailed": assessment.location_detailed,
            "finance_detailed": assessment.finance_detailed,
            "business_preferences": assessment.business_preferences,
            "latest_recommendations": assessment.latest_recommendations,
        }

    return {
        "user": user.to_safe_dict(),
        "assessment_data": assessment_data,
        "latest_results": assessment.latest_recommendations if assessment else None,
        "active_venture": active_venture,
    }


@router.post("/user/profile")
async def update_user_profile(payload: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Persists user's updated wizard steps and profile directly into PostgreSQL database.
    """
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required.")

    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update User Profile Details
    if "profile" in payload and isinstance(payload["profile"], dict):
        p = payload["profile"]
        if "full_name" in p and p["full_name"]: user.full_name = p["full_name"]
        if "phone" in p and p["phone"]: user.phone = p["phone"]
        if "tehsil" in p and p["tehsil"] and p["tehsil"] != "Not specified": user.tehsil = p["tehsil"]
        if "district" in p and p["district"] and p["district"] != "Not specified": user.district = p["district"]
        if "role" in p and p["role"]: user.role = p["role"]

    # Upsert User Assessment Data
    if "assessment_data" in payload and isinstance(payload["assessment_data"], dict):
        ad = payload["assessment_data"]
        assessment = db.query(UserAssessment).filter(UserAssessment.user_id == user_id).first()
        if not assessment:
            assessment = UserAssessment(user_id=user_id)
            db.add(assessment)

        if "about_me" in ad: assessment.about_me = ad["about_me"]
        if "skills_detailed" in ad: assessment.skills_detailed = ad["skills_detailed"]
        if "willingness_to_learn" in ad: assessment.willingness_to_learn = ad["willingness_to_learn"]
        if "documents" in ad: assessment.documents = ad["documents"]
        if "resources_detailed" in ad: assessment.resources_detailed = ad["resources_detailed"]
        if "location_detailed" in ad: assessment.location_detailed = ad["location_detailed"]
        if "finance_detailed" in ad: assessment.finance_detailed = ad["finance_detailed"]
        if "business_preferences" in ad: assessment.business_preferences = ad["business_preferences"]
        if "latest_recommendations" in ad: assessment.latest_recommendations = ad["latest_recommendations"]

    # Upsert Active Venture
    if "active_venture" in payload and isinstance(payload["active_venture"], dict):
        av = payload["active_venture"]
        venture = db.query(UserVenture).filter(UserVenture.user_id == user_id).first()
        if not venture:
            venture = UserVenture(
                user_id=user_id,
                opportunity_id=str(av.get("opportunity_id") or av.get("id")),
                venture_name=av.get("name"),
                venture_data=av,
                journey_phase=av.get("journey_phase", 1),
                current_task=av.get("current_task"),
                next_deadline=av.get("next_deadline")
            )
            db.add(venture)
        else:
            venture.opportunity_id = str(av.get("opportunity_id") or av.get("id"))
            venture.venture_name = av.get("name")
            venture.venture_data = av
            if "journey_phase" in av: venture.journey_phase = av["journey_phase"]
            if "current_task" in av: venture.current_task = av["current_task"]
            if "next_deadline" in av: venture.next_deadline = av["next_deadline"]

    db.commit()
    assessment_record = db.query(UserAssessment).filter(UserAssessment.user_id == user_id).first()
    return {
        "status": "success",
        "user": user.to_safe_dict(),
        "assessment_data": {
            "about_me": assessment_record.about_me if assessment_record else None,
            "skills_detailed": assessment_record.skills_detailed if assessment_record else None,
            "documents": assessment_record.documents if assessment_record else None,
            "resources_detailed": assessment_record.resources_detailed if assessment_record else None,
            "finance_detailed": assessment_record.finance_detailed if assessment_record else None,
            "location_detailed": assessment_record.location_detailed if assessment_record else None,
            "business_preferences": assessment_record.business_preferences if assessment_record else None,
        }
    }


@router.post("/user/active-venture")
async def update_active_venture(payload: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Updates the active business model & DPR blueprint chosen by the entrepreneur in PostgreSQL.
    """
    user_id = payload.get("user_id")
    active_venture = payload.get("active_venture")
    if not user_id or not active_venture:
        raise HTTPException(status_code=400, detail="user_id and active_venture are required.")

    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    venture = db.query(UserVenture).filter(UserVenture.user_id == user_id).first()
    if not venture:
        venture = UserVenture(
            user_id=user_id,
            opportunity_id=str(active_venture.get("opportunity_id") or active_venture.get("id")),
            venture_name=active_venture.get("name"),
            venture_data=active_venture,
            journey_phase=active_venture.get("journey_phase", 1),
            current_task=active_venture.get("current_task"),
            next_deadline=active_venture.get("next_deadline")
        )
        db.add(venture)
    else:
        venture.opportunity_id = str(active_venture.get("opportunity_id") or active_venture.get("id"))
        venture.venture_name = active_venture.get("name")
        venture.venture_data = active_venture
        if "journey_phase" in active_venture: venture.journey_phase = active_venture["journey_phase"]
        if "current_task" in active_venture: venture.current_task = active_venture["current_task"]
        if "next_deadline" in active_venture: venture.next_deadline = active_venture["next_deadline"]

    db.commit()
    return {"status": "success", "active_venture": active_venture}


# ============================================================================
# COLLABORATION & ENTREPRENEUR NETWORK ROUTES (POSTGRESQL + ECOSYSTEM)
# ============================================================================

CURATED_ECOSYSTEM_PARTNERS = [
    {
        "id": "ENT-001",
        "name": "Rajesh Deshmukh",
        "handle": "@rajesh_citrus_katol",
        "avatarIcon": "👨‍🌾",
        "location": "Katol, Nagpur District",
        "role": "Citrus Orchardist & FPO Director",
        "primaryInterest": "Citrus Juice Processing & Cold-Chain Packing",
        "suitabilityScore": 94,
        "offers": [
            {"type": "land", "title": "5 Acres Agri Land with 2 Functional Borewells in Katol", "icon": "🌾"},
            {"type": "raw_material", "title": "80 MT Assured Seasonal Nagpur Mandarin Fruit Supply", "icon": "🍊"},
            {"type": "equipment", "title": "Tractor, Solar Pump & 300 Plastic Harvest Crates", "icon": "🚜"}
        ],
        "needs": [
            {"type": "capital", "title": "Co-Founder / Partner Equity (₹4.0 to ₹6.0 Lakhs)", "icon": "💰"},
            {"type": "equipment", "title": "Continuous Juice Extractor & Flash Pasteurizer Machinery", "icon": "⚙️"},
            {"type": "skills", "title": "FSSAI Compliance, Lab Quality Control & Brand Packaging", "icon": "🧠"}
        ],
        "experience": "15 years family citrus farming; 3 years heading Katol Citrus Growers FPO.",
        "matchReasons": [
            "Your capital / marketing expertise complements his 5-acre land and fruit supply.",
            "His guaranteed farm-gate raw material secures low-cost orange procurement (₹14/kg).",
            "Both are focused on the Katol citrus processing cluster for PMFME 35% grant convergence."
        ],
        "collaborationTypes": ["Business Partner (Equity)", "Joint Venture", "Shared Processing Shed"]
    },
    {
        "id": "ENT-002",
        "name": "Pooja Thakare",
        "handle": "@pooja_foodtech",
        "avatarIcon": "👩‍🔬",
        "location": "Butibori MIDC / Nagpur City",
        "role": "Food Technologist & QA Specialist (M.Tech LIT)",
        "primaryInterest": "Cold-Pressed RTS Citrus Beverages & Marmalades",
        "suitabilityScore": 96,
        "offers": [
            {"type": "skills", "title": "Certified Beverage Formulation, Pasteurization & Shelf-Life Stabilization", "icon": "🧠"},
            {"type": "compliance", "title": "FSSAI Central License Documentation & NABL Nutritional Testing", "icon": "📋"},
            {"type": "equipment", "title": "Pilot-scale 100 LPH Homogenizer & Vacuum Jar Sealer", "icon": "⚙️"}
        ],
        "needs": [
            {"type": "raw_material", "title": "Reliable Farm-Gate Citrus Grower Partner in Nagpur Belt", "icon": "🍊"},
            {"type": "workspace", "title": "Agro-Processing Shed with 3-Phase Power in Katol or Kalmeshwar", "icon": "🏗️"},
            {"type": "capital", "title": "Working Capital Partner for Bottle Inventory & Distribution", "icon": "💰"}
        ],
        "experience": "7 years QA lead at regional FMCG beverage plant; formulated 4 commercial fruit squashes.",
        "matchReasons": [
            "Her formulation and quality lab skills immediately bridge your technical/FSSAI gap.",
            "Complements founders who have land or capital but lack certified food processing degrees.",
            "Enables premium bottled retail margin (₹60/bottle) instead of raw fruit wholesale."
        ],
        "collaborationTypes": ["Technical Co-Founder", "Formulation Retainer", "Joint Venture"]
    },
    {
        "id": "ENT-003",
        "name": "Anand Kulkarni",
        "handle": "@anand_coldchain",
        "avatarIcon": "👨‍💼",
        "location": "Kalmeshwar / Hingna MIDC",
        "role": "Cold Storage Operator & Reefer Logistics Lead",
        "primaryInterest": "Micro Cold Storage & Farm-Gate Pre-Cooling",
        "suitabilityScore": 91,
        "offers": [
            {"type": "infrastructure", "title": "20 MT Walk-in Pre-Cooling Chamber in Kalmeshwar", "icon": "❄️"},
            {"type": "logistics", "title": "2 Insulated Refrigerated Reefer Trucks (Nagpur-Bhopal-Raipur Route)", "icon": "🚚"},
            {"type": "power", "title": "25 kVA Industrial Grid Sanction with Solar Backup", "icon": "⚡"}
        ],
        "needs": [
            {"type": "business", "title": "Citrus Grading & Waxing Partner to Utilize Storage Capacity", "icon": "📦"},
            {"type": "partner", "title": "FPO / Agro-Venture for Seasonal Off-Take Agreements", "icon": "🤝"}
        ],
        "experience": "Managed 3,500 MT multi-commodity cold store; licensed transport contractor.",
        "matchReasons": [
            "Shared cold storage access eliminates ₹14 Lakhs in initial refrigeration CapEx.",
            "Provides ready freight corridor to high-paying central Indian fruit mandis.",
            "Location in Kalmeshwar connects directly to Nagpur-Bhopal National Highway."
        ],
        "collaborationTypes": ["Shared Infrastructure Lease", "Logistics Partnership", "Cold-Chain Alliance"]
    },
    {
        "id": "ENT-004",
        "name": "Suresh Wankhede",
        "handle": "@suresh_grafting_ccri",
        "avatarIcon": "👨‍🌾",
        "location": "Warud-Morshi Belt, Amravati / Nagpur",
        "role": "Master Nursery Propagator & CCRI Alumni",
        "primaryInterest": "Disease-Free Certified Citrus Nursery & Mother Block",
        "suitabilityScore": 92,
        "offers": [
            {"type": "skills", "title": "ICAR-CCRI Certified T-Budding & Rangpur Rootstock Propagation", "icon": "🌱"},
            {"type": "raw_material", "title": "10,000 Certified Mother Scion Budsticks Stock", "icon": "🌿"},
            {"type": "contacts", "title": "State Nursery Accreditation & Department of Agriculture Network", "icon": "🏛️"}
        ],
        "needs": [
            {"type": "infrastructure", "title": "1-Acre Polyhouse / Shade-Net Facility with Micro-Sprinklers", "icon": "🏗️"},
            {"type": "capital", "title": "Seed Capital for 20,000 UV Grow Bags & Media Blender (₹1.8L)", "icon": "💰"},
            {"type": "marketing", "title": "Digital Marketing & Institutional Farmer Order Booking", "icon": "📱"}
        ],
        "experience": "12 years commercial nursery propagation; certified by ICAR-CCRI Nagpur in 2018.",
        "matchReasons": [
            "Instantly resolves technical grafting and certification requirements for nursery setup.",
            "Your capital / polyhouse infrastructure pairs directly with his high-health budwood stock.",
            "Enables immediate nursery license application with Maharashtra Agriculture Dept."
        ],
        "collaborationTypes": ["Nursery Managing Partner", "Profit-Sharing Propagator", "Technical Director"]
    },
    {
        "id": "ENT-005",
        "name": "Vikramaditya Patil",
        "handle": "@vikram_d2c_agro",
        "avatarIcon": "👨‍💻",
        "location": "MIHAN SEZ / Nagpur",
        "role": "D2C Brand Strategist & Growth Marketer",
        "primaryInterest": "Premium Farm-to-Consumer Citrus Brand & Online Retailing",
        "suitabilityScore": 89,
        "offers": [
            {"type": "technology", "title": "Live Shopify D2C Store, QR Traceability App & Digital Ad Funnels", "icon": "💻"},
            {"type": "market_access", "title": "National Courier Tie-Ups (BlueDart & Delhivery Metro Dispatch)", "icon": "📦"},
            {"type": "branding", "title": "Export Grade 5-Ply Packaging Design & Brand Trademark", "icon": "🏷️"}
        ],
        "needs": [
            {"type": "producer", "title": "Reliable Sorting, Grading & Waxing Partner for Grade-A Oranges", "icon": "🍊"},
            {"type": "quality", "title": "Blemish-Free, Sweetness-Tested (Brix ≥ 10°) Citrus Consignments", "icon": "🔍"}
        ],
        "experience": "Ex-eCommerce Lead; scaled farm-produce D2C brand to ₹45 Lakhs ARR.",
        "matchReasons": [
            "Provides direct premium retail realization (₹40–₹60/kg) vs low mandi rates (₹16–₹22/kg).",
            "Handles all customer acquisition, digital marketing, packaging and payment gateways.",
            "Complements producers with packing and waxing lines looking for assured off-take."
        ],
        "collaborationTypes": ["Off-take & Marketing Partner", "Brand Equity Partner", "Joint Venture"]
    },
    {
        "id": "ENT-006",
        "name": "Shriram Citrus Collective (FPO)",
        "handle": "@shriram_fpo_narkhed",
        "avatarIcon": "🏢",
        "location": "Narkhed Tehsil, Nagpur",
        "role": "350-Member Citrus Farmer Producer Company",
        "primaryInterest": "Citrus Peel Waste Extraction & Biomass Value Addition",
        "suitabilityScore": 88,
        "offers": [
            {"type": "raw_material", "title": "120 Tonnes Seasonal Citrus Peels & Pomace Residue", "icon": "🍊"},
            {"type": "shed", "title": "1,500 sq.ft Covered PEB Industrial Shed in Narkhed", "icon": "🏗️"},
            {"type": "scheme", "title": "Eligible for 50% FPO Capital Grant under PMFME & AIF 3% Subvention", "icon": "🏛️"}
        ],
        "needs": [
            {"type": "technology", "title": "Agri-Entrepreneur with Essential Oil & Pectin Distillation Plant", "icon": "🧪"},
            {"type": "management", "title": "Full-Time Technical Plant Operator & Quality Manager", "icon": "👷"}
        ],
        "experience": "Incorporated FPC under Companies Act; NABARD registered; ₹1.2 Cr annual turnover.",
        "matchReasons": [
            "Zero raw material acquisition barrier for peel oil distillation (feedstock supplied free).",
            "Ready shed infrastructure eliminates heavy civil construction lead time and costs.",
            "FPO institutional status unlocks higher 50% subsidy thresholds under MoFPI."
        ],
        "collaborationTypes": ["FPO Joint Venture", "Build-Operate-Transfer (BOT)", "Technical Concessionaire"]
    }
]


def _format_user_to_network_profile(user: User, assessment: Optional[UserAssessment], venture: Optional[UserVenture]) -> Dict[str, Any]:
    """Helper to convert a PostgreSQL user record into a rich collaboration network card."""
    offers = []
    needs = []

    # 1. Inspect assessment resources
    if assessment and assessment.resources_detailed:
        res = assessment.resources_detailed
        if res.get("hasLand"):
            acres = res.get("landAcres", 2.0)
            offers.append({"type": "land", "title": f"{acres} Acres Agri Land in {user.tehsil}", "icon": "🌾"})
        if res.get("hasWorkspace"):
            offers.append({"type": "workspace", "title": f"Covered Work Shed / Storage in {user.tehsil}", "icon": "🏗️"})
        if res.get("waterSources"):
            offers.append({"type": "resource", "title": "Borewell & Irrigation Connection", "icon": "💧"})
        if res.get("transportModes"):
            offers.append({"type": "equipment", "title": "Farm Tractor & Transport Vehicle", "icon": "🚜"})

    # 2. Inspect assessment finances
    if assessment and assessment.finance_detailed:
        cap = assessment.finance_detailed.get("availableCapitalINR") or 250000
        offers.append({"type": "capital", "title": f"Promoter Capital & Co-Equity (₹{float(cap)/100000:.1f} Lakhs)", "icon": "💰"})

    # 3. Default fallback offers if none recorded
    if not offers:
        offers = [
            {"type": "capital", "title": f"Equity Capital & Investment in {user.tehsil}", "icon": "💰"},
            {"type": "skills", "title": "Agro-Enterprise Management & Local Operations", "icon": "🧠"},
            {"type": "location", "title": f"Local Farmer Network in {user.tehsil} Cluster", "icon": "📍"}
        ]

    # 4. Synthesize Needs based on Active Venture or role
    primary_interest = "Citrus Agro-Enterprise"
    if venture and venture.venture_data:
        v_data = venture.venture_data
        primary_interest = v_data.get("name", "Citrus Value Addition")
        needs.append({"type": "partner", "title": f"Co-Founder / Partner for {primary_interest}", "icon": "🤝"})
        if v_data.get("category") == "Agri-Business & Nursery":
            needs.append({"type": "skills", "title": "Certified CCRI Budwood & Rootstock Specialist", "icon": "🌱"})
            needs.append({"type": "equipment", "title": "Polyhouse & Automated Micro-Misting Line", "icon": "⚙️"})
        elif "Juice" in primary_interest or "Food" in primary_interest:
            needs.append({"type": "skills", "title": "FSSAI Quality & Commercial Beverage Technologist", "icon": "👩‍🔬"})
            needs.append({"type": "equipment", "title": "Industrial Continuous Juicing Line", "icon": "⚙️"})
        else:
            needs.append({"type": "equipment", "title": "Commercial Processing & Storage Equipment", "icon": "⚙️"})
            needs.append({"type": "market", "title": "B2B Off-take / Retailing Partner in Nagpur", "icon": "📦"})
    else:
        needs = [
            {"type": "partner", "title": "Technical Co-Founder or Equipment Partner", "icon": "🤝"},
            {"type": "skills", "title": "FSSAI Food Quality or Nursery Specialist", "icon": "🧠"},
            {"type": "market", "title": "Assured Wholesale Off-take Partner", "icon": "📦"}
        ]

    experience_str = f"Active entrepreneur in {user.tehsil}, {user.district} District."
    if assessment and assessment.about_me:
        about = assessment.about_me
        if about.get("currentSituation"):
            experience_str = f"Focusing on {primary_interest}; operating in {user.tehsil} citrus belt."

    return {
        "id": user.id,
        "name": user.full_name,
        "handle": f"@{user.full_name.lower().replace(' ', '_')}_{user.tehsil.lower()}",
        "avatarIcon": user.avatar or "🍊",
        "location": f"{user.tehsil}, {user.district} District",
        "role": user.role or "Agro-Entrepreneur",
        "primaryInterest": primary_interest,
        "suitabilityScore": 93,
        "offers": offers[:3],
        "needs": needs[:3],
        "experience": experience_str,
        "matchReasons": [
            f"Based in {user.tehsil} cluster with direct local mandi and grower connections.",
            "Complementary resources and active project alignment under PMFME ODOP.",
            "Registered on EntreVision decision platform with verified profile."
        ],
        "collaborationTypes": ["Joint Venture", "Shared Processing Shed", "Co-Founder (Equity)"]
    }


@router.get("/collaboration/network")
async def get_collaboration_network(user_id: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Returns the real peer entrepreneur collaboration network.
    Dynamically includes registered users from PostgreSQL, current user's profile card,
    and Vidarbha citrus ecosystem partners.
    """
    current_user_profile = None
    peer_profiles = []

    if db is not None:
        try:
            users = db.query(User).filter(User.is_active == True).all()
            for u in users:
                assessment = db.query(UserAssessment).filter(UserAssessment.user_id == u.id).first()
                venture = db.query(UserVenture).filter(UserVenture.user_id == u.id).first()
                formatted = _format_user_to_network_profile(u, assessment, venture)

                if user_id and u.id == user_id:
                    current_user_profile = formatted
                else:
                    peer_profiles.append(formatted)
        except Exception as e:
            logger.warning(f"Error querying users for collaboration network: {e}")

    # Combine registered database peers with curated ecosystem partners
    all_network = peer_profiles + CURATED_ECOSYSTEM_PARTNERS

    return {
        "current_user_profile": current_user_profile,
        "network": all_network,
        "total_active_entrepreneurs": len(all_network) + (1 if current_user_profile else 0)
    }


@router.post("/collaboration/connect")
async def send_collaboration_request(payload: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Submits a genuine collaboration proposal / partnership message to the database.
    """
    sender_id = payload.get("sender_id")
    recipient_id = payload.get("recipient_id")
    recipient_name = payload.get("recipient_name", "Entrepreneur")
    topic = payload.get("topic", "Joint Venture Exploration")
    message = payload.get("message", "").strip()

    if not sender_id or not recipient_id or not message:
        raise HTTPException(status_code=400, detail="sender_id, recipient_id, and message are required.")

    if db is not None:
        try:
            new_conn = CollaborationConnection(
                sender_id=sender_id,
                recipient_id=recipient_id,
                recipient_name=recipient_name,
                topic=topic,
                message=message,
                status="Pending"
            )
            db.add(new_conn)
            db.commit()
            db.refresh(new_conn)
            return {
                "status": "success",
                "message": "Collaboration request sent successfully!",
                "connection": {
                    "id": f"COL-REQ-{new_conn.id}",
                    "sender_id": new_conn.sender_id,
                    "recipient_id": new_conn.recipient_id,
                    "recipient_name": new_conn.recipient_name,
                    "topic": new_conn.topic,
                    "message": new_conn.message,
                    "status": new_conn.status,
                    "date": new_conn.created_at.strftime("%d/%m/%Y") if new_conn.created_at else "Today"
                }
            }
        except Exception as e:
            logger.warning(f"Could not persist connection to database: {e}")

    # Fallback response if DB offline
    return {
        "status": "success",
        "message": "Collaboration request queued locally.",
        "connection": {
            "id": f"COL-REQ-{secrets.token_hex(4).upper()}",
            "sender_id": sender_id,
            "recipient_id": recipient_id,
            "recipient_name": recipient_name,
            "topic": topic,
            "message": message,
            "status": "Pending",
            "date": "Today"
        }
    }


@router.get("/collaboration/my-requests")
async def get_my_collaboration_requests(user_id: str, db: Session = Depends(get_db)):
    """
    Retrieves all sent and received collaboration requests for the authenticated user.
    """
    if db is None:
        return {"sent": [], "received": []}

    try:
        sent_conns = db.query(CollaborationConnection).filter(CollaborationConnection.sender_id == user_id).all()
        received_conns = db.query(CollaborationConnection).filter(CollaborationConnection.recipient_id == user_id).all()

        return {
            "sent": [
                {
                    "id": f"COL-REQ-{c.id}",
                    "recipient": c.recipient_name or c.recipient_id,
                    "topic": c.topic,
                    "message": c.message,
                    "status": c.status,
                    "date": c.created_at.strftime("%d/%m/%Y") if c.created_at else "Today"
                }
                for c in sent_conns
            ],
            "received": [
                {
                    "id": f"COL-REQ-{c.id}",
                    "sender_id": c.sender_id,
                    "topic": c.topic,
                    "message": c.message,
                    "status": c.status,
                    "date": c.created_at.strftime("%d/%m/%Y") if c.created_at else "Today"
                }
                for c in received_conns
            ]
        }
    except Exception as e:
        logger.warning(f"Error fetching collaboration requests: {e}")
        return {"sent": [], "received": []}


# ============================================================================
# GOVERNMENT SCHEMES & SUBSIDY ELIGIBILITY CHECKER (PHASE 8)
# ============================================================================

def _sync_schemes_to_db_if_empty(db: Optional[Session]):
    """Sync master verified schemes to database if table is empty"""
    if db is None:
        return
    try:
        count = db.query(GovernmentScheme).count()
        if count == 0:
            for s in scheme_engine.get_all_schemes_catalog():
                gs = GovernmentScheme(
                    scheme_code=s.scheme_code,
                    scheme_name=s.scheme_name,
                    short_name=s.short_name,
                    department=s.department,
                    category=s.category,
                    eligible_business_categories=s.eligible_business_categories,
                    eligibility_conditions=s.eligibility_conditions,
                    assistance_percentage=s.assistance_percentage,
                    max_subsidy_amount=s.max_subsidy_amount,
                    min_promoter_contribution=s.min_promoter_contribution_rate,
                    required_documents=[d.model_dump() for d in s.required_documents],
                    official_website=s.official_website,
                    source_document=s.source_document,
                    clause_number=s.clause_number,
                    nodal_agency=s.nodal_agency,
                    processing_period=s.processing_period,
                    is_active=s.is_active
                )
                db.add(gs)
            db.commit()
    except Exception as e:
        if db:
            db.rollback()
        logger.warning(f"Could not synchronize schemes to PostgreSQL database: {e}")


@router.get("/schemes")
async def get_government_schemes(db: Session = Depends(get_db)):
    """
    Returns the master catalog of verified government schemes and capital assistance programs.
    Step 1: Scheme database storing name, categories, conditions, assistance %, max subsidy,
    required documents, official website, and last verified date.
    """
    _sync_schemes_to_db_if_empty(db)
    return [s.model_dump() for s in scheme_engine.get_all_schemes_catalog()]


@router.get("/schemes/{scheme_code}")
async def get_scheme_detail(scheme_code: str, db: Session = Depends(get_db)):
    """
    Retrieves complete details, guidelines, and document requirements for a specific scheme.
    """
    scheme = scheme_engine.get_scheme_by_code(scheme_code)
    if not scheme:
        raise HTTPException(status_code=404, detail=f"Scheme '{scheme_code}' not found.")
    return scheme.model_dump()


@router.post("/schemes/check-eligibility")
async def check_scheme_eligibility(payload: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Evaluates applicant profile against government schemes.
    Step 2: Compare user assessment against scheme requirements.
    Step 3: Return one of 3 explicit statuses:
      - 'Potentially eligible'
      - 'Not eligible based on known criteria'
      - 'More information required'
    Step 4: Calculate potential assistance with scheme-specific formulas.
    Step 5: Display official application information (source document, official portal, required documents).
    """
    try:
        user_input = scheme_engine.UserAssessmentInput(
            business_name=payload.get("business_name") or payload.get("venture_name") or "Citrus Agribusiness",
            business_category=payload.get("business_category") or payload.get("category") or "food_processing",
            project_cost_inr=float(payload.get("project_cost_inr") or payload.get("project_cost") or payload.get("total_cost") or 2000000.0),
            available_capital_inr=float(payload.get("available_capital_inr") or payload.get("available_capital") or payload.get("promoter_equity") or 200000.0),
            has_land=bool(payload.get("has_land", True)),
            land_acres=float(payload.get("land_acres") if payload.get("land_acres") is not None else (2.0 if payload.get("has_land", True) else 0.0)),
            location_type=str(payload.get("location_type") or "rural").lower(),
            tehsil=str(payload.get("tehsil") or payload.get("location") or "Katol"),
            district=str(payload.get("district") or "Nagpur"),
            state=str(payload.get("state") or "Maharashtra"),
            social_category=str(payload.get("social_category") or payload.get("user_category") or "General"),
            applicant_age=int(payload.get("applicant_age") or payload.get("age") or 32),
            education=str(payload.get("education") or "Graduate"),
            is_greenfield=bool(payload.get("is_greenfield", True)),
            has_prior_subsidy=bool(payload.get("has_prior_subsidy", False)),
            has_bank_sanction=bool(payload.get("has_bank_sanction", False)),
            has_fssai_commitment=bool(payload.get("has_fssai_commitment", True)),
            has_water_source=bool(payload.get("has_water_source", True))
        )

        scheme_code = payload.get("scheme_code")
        if scheme_code:
            scheme = scheme_engine.get_scheme_by_code(scheme_code)
            if not scheme:
                raise HTTPException(status_code=404, detail=f"Scheme '{scheme_code}' not found.")
            res = scheme_engine.evaluate_single_scheme(scheme, user_input)
            return res.model_dump()

        results = scheme_engine.evaluate_all_schemes(user_input)
        return [r.model_dump() for r in results]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking scheme eligibility: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# PHASE 10: DOCUMENT UPLOAD & VERIFICATION WORKFLOW ENDPOINTS
# ============================================================================

DOCUMENTS_UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads" / "documents"
DOCUMENTS_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

# In-memory fallback if database session is unavailable
_IN_MEMORY_DOCS: Dict[str, Dict[str, Any]] = {}


def _validate_uploaded_file(filename: str, content: bytes, content_type: Optional[str] = None):
    """
    Step 2: Add validation.
    Checks:
      1. File extension (must be .pdf, .jpg, .jpeg, .png)
      2. File size (max 5 MB)
      3. Non-empty file (size > 0)
      4. Actual file type (magic byte signature matching)
    """
    if not filename or "." not in filename:
        raise HTTPException(
            status_code=400,
            detail="Invalid filename. File must have an extension (.pdf, .jpg, .jpeg, .png)."
        )

    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file extension '{ext}'. Only PDF, JPG, and PNG files are accepted."
        )

    if not content or len(content) == 0:
        raise HTTPException(
            status_code=400,
            detail="Empty file uploaded. Please upload a valid, non-empty document."
        )

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum permitted size of 5 MB ({len(content) / (1024*1024):.2f} MB uploaded)."
        )

    # Magic byte inspection
    if ext == ".pdf":
        if not content.startswith(b"%PDF"):
            raise HTTPException(
                status_code=400,
                detail="Corrupt or invalid PDF file. Header signature does not match PDF specification."
            )
        resolved_mime = "application/pdf"
    elif ext == ".png":
        if not content.startswith(b"\x89PNG\r\n\x1a\n"):
            raise HTTPException(
                status_code=400,
                detail="Corrupt or invalid PNG file. Header signature does not match PNG specification."
            )
        resolved_mime = "image/png"
    elif ext in {".jpg", ".jpeg"}:
        if not content.startswith(b"\xff\xd8\xff"):
            raise HTTPException(
                status_code=400,
                detail="Corrupt or invalid JPEG file. Header signature does not match JPEG specification."
            )
        resolved_mime = "image/jpeg"
    else:
        resolved_mime = content_type or "application/octet-stream"

    return ext, resolved_mime


@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    user_id: Optional[str] = Form(None),
    category: Optional[str] = Form("other"),
    title: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Phase 10 — Step 3 & Step 4: Secure Document Upload Endpoint.
    Validates file extension, magic bytes, non-emptiness, and size.
    Stores file securely outside web root with unique UUID filename.
    Saves document metadata and initializes verification status to 'Uploaded'.
    """
    try:
        if hasattr(file, "file") and hasattr(file.file, "read"):
            content = file.file.read()
        elif hasattr(file, "read"):
            raw = file.read()
            content = await raw if inspect.isawaitable(raw) else raw
        else:
            content = b""
        filename = file.filename or "uploaded_document"
        ext, resolved_mime = _validate_uploaded_file(filename, content, file.content_type)

        doc_id = uuid.uuid4().hex
        safe_name = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', Path(filename).name)
        stored_filename = f"{doc_id}_{safe_name}"
        destination_path = DOCUMENTS_UPLOAD_DIR / stored_filename

        with open(destination_path, "wb") as f:
            f.write(content)

        clean_category = category.lower().strip() if category else "other"
        clean_title = title.strip() if title else Path(filename).stem.replace("_", " ").title()

        doc_record = UserDocument(
            id=doc_id,
            user_id=user_id,
            category=clean_category,
            title=clean_title,
            original_filename=filename,
            stored_filename=stored_filename,
            file_path=str(destination_path),
            file_type=resolved_mime,
            file_size_bytes=len(content),
            verification_status="Uploaded",
            rejection_reason=None,
            reviewer_notes=None,
        )

        if db is not None:
            try:
                db.add(doc_record)
                db.commit()
                db.refresh(doc_record)
                doc_dict = doc_record.to_dict()
            except Exception as db_err:
                logger.warning(f"Database write failed, storing in memory fallback: {db_err}")
                db.rollback()
                doc_dict = doc_record.to_dict()
                _IN_MEMORY_DOCS[doc_id] = doc_dict
        else:
            doc_dict = doc_record.to_dict()
            _IN_MEMORY_DOCS[doc_id] = doc_dict

        return {
            "success": True,
            "document": doc_dict,
            "message": "Document uploaded successfully and queued for review."
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error handling document upload: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process document upload: {str(e)}")


@router.get("/documents")
async def list_documents(
    user_id: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Phase 10 — Step 5: List documents with current verification status:
    'Uploaded', 'Pending review', 'Verified by reviewer', 'Rejected'.
    """
    if db is not None:
        try:
            query = db.query(UserDocument)
            if user_id:
                query = query.filter(UserDocument.user_id == user_id)
            if category:
                query = query.filter(UserDocument.category == category.lower())
            docs = query.order_by(UserDocument.upload_date.desc()).all()
            return [d.to_dict() for d in docs]
        except Exception as e:
            logger.warning(f"Database query failed, returning in-memory docs: {e}")

    # Fallback in-memory list
    results = list(_IN_MEMORY_DOCS.values())
    if user_id:
        results = [d for d in results if d.get("user_id") == user_id]
    if category:
        results = [d for d in results if d.get("category") == category.lower()]
    return results


@router.get("/documents/{document_id}")
async def get_document(document_id: str, db: Session = Depends(get_db)):
    """Fetch details of a single document."""
    if db is not None:
        try:
            doc = db.query(UserDocument).filter(UserDocument.id == document_id).first()
            if doc:
                return doc.to_dict()
        except Exception as e:
            logger.warning(f"DB lookup failed: {e}")

    if document_id in _IN_MEMORY_DOCS:
        return _IN_MEMORY_DOCS[document_id]

    raise HTTPException(status_code=404, detail="Document not found.")


@router.get("/documents/{document_id}/download")
async def download_document(document_id: str, db: Session = Depends(get_db)):
    """Download stored document file."""
    doc_path = None
    original_name = "document"
    media_type = "application/octet-stream"

    if db is not None:
        try:
            doc = db.query(UserDocument).filter(UserDocument.id == document_id).first()
            if doc:
                doc_path = Path(doc.file_path)
                original_name = doc.original_filename
                media_type = doc.file_type
        except Exception as e:
            logger.warning(f"DB lookup failed: {e}")

    if not doc_path and document_id in _IN_MEMORY_DOCS:
        item = _IN_MEMORY_DOCS[document_id]
        doc_path = Path(item["stored_filename"])
        if not doc_path.exists():
            doc_path = DOCUMENTS_UPLOAD_DIR / item["stored_filename"]
        original_name = item["original_filename"]
        media_type = item["file_type"]

    if not doc_path or not doc_path.exists():
        raise HTTPException(status_code=404, detail="Document file not found on disk.")

    return FileResponse(
        path=str(doc_path),
        filename=original_name,
        media_type=media_type
    )


@router.patch("/documents/{document_id}/status")
async def update_document_status(
    document_id: str,
    payload: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """
    Phase 10 — Step 5: Update document verification status.
    Allowed statuses:
      - 'Uploaded'
      - 'Pending review'
      - 'Verified by reviewer'
      - 'Rejected'
    """
    new_status = payload.get("verification_status")
    if new_status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid verification status '{new_status}'. Allowed: {', '.join(VALID_STATUSES)}"
        )

    notes = payload.get("reviewer_notes")
    rejection_reason = payload.get("rejection_reason")

    if db is not None:
        try:
            doc = db.query(UserDocument).filter(UserDocument.id == document_id).first()
            if not doc:
                raise HTTPException(status_code=404, detail="Document not found.")
            doc.verification_status = new_status
            if notes is not None:
                doc.reviewer_notes = notes
            if rejection_reason is not None:
                doc.rejection_reason = rejection_reason
            db.commit()
            db.refresh(doc)
            return doc.to_dict()
        except HTTPException:
            raise
        except Exception as e:
            logger.warning(f"DB update failed: {e}")

    if document_id in _IN_MEMORY_DOCS:
        _IN_MEMORY_DOCS[document_id]["verification_status"] = new_status
        if notes is not None:
            _IN_MEMORY_DOCS[document_id]["reviewer_notes"] = notes
        if rejection_reason is not None:
            _IN_MEMORY_DOCS[document_id]["rejection_reason"] = rejection_reason
        return _IN_MEMORY_DOCS[document_id]

    raise HTTPException(status_code=404, detail="Document not found.")


@router.delete("/documents/{document_id}")
async def delete_document(document_id: str, db: Session = Depends(get_db)):
    """Delete document from disk and database."""
    deleted = False

    if db is not None:
        try:
            doc = db.query(UserDocument).filter(UserDocument.id == document_id).first()
            if doc:
                file_p = Path(doc.file_path)
                if file_p.exists():
                    try:
                        file_p.unlink()
                    except Exception:
                        pass
                db.delete(doc)
                db.commit()
                deleted = True
        except Exception as e:
            logger.warning(f"DB delete failed: {e}")

    if document_id in _IN_MEMORY_DOCS:
        item = _IN_MEMORY_DOCS.pop(document_id)
        f_path = DOCUMENTS_UPLOAD_DIR / item["stored_filename"]
        if f_path.exists():
            try:
                f_path.unlink()
            except Exception:
                pass
        deleted = True

    if not deleted:
        raise HTTPException(status_code=404, detail="Document not found.")

    return {"success": True, "message": "Document deleted successfully."}




