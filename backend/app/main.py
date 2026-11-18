from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.database.connection import engine
from app.database.base import Base
from app.modules.industry.models import Industry, BusinessOpportunity
from app.modules.auth.models import User, UserAssessment, UserVenture
from app.database.models_scheme import GovernmentScheme
from app.database.models_document import UserDocument
from app.modules.auth.seed_users import seed_auth_users
from app.modules.industry.routes import router as industry_router
from app.modules.dss.routes import router as dss_router
from app.modules.mandi.routes import router as mandi_router
from app.modules.mandi.models import MandiPrice
from app.scheduler.config import start_scheduler, shutdown_scheduler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    logger.warning(f"Could not connect to database or initialize tables on startup: {e}")


app = FastAPI(
    title="EntreVision API",
    description="Location-Aware Decision Support System for Nagpur Orange Ecosystem",
    version="2.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include modules routers
from app.modules.api_routes import router as frontend_api_router

app.include_router(industry_router)
app.include_router(dss_router)
app.include_router(mandi_router)
app.include_router(frontend_api_router)

# Direct alias for Phase 10 /documents/upload
from fastapi import UploadFile, File, Form, Depends
from sqlalchemy.orm import Session
from app.modules.api_routes import upload_document as api_upload_document, get_db

@app.post("/documents/upload")
async def root_upload_document(
    file: UploadFile = File(...),
    user_id: str = Form(None),
    category: str = Form("other"),
    title: str = Form(None),
    db: Session = Depends(get_db)
):
    return await api_upload_document(file=file, user_id=user_id, category=category, title=title, db=db)


@app.get("/")
def root():
    return {
        "message": "Welcome to EntreVision API - Nagpur Orange Decision Support System",
        "version": "2.0.0"
    }


@app.get("/test-db")
def test_database():
    try:
        with engine.connect() as connection:
            return {
                "status": "success",
                "message": "Database connected successfully!"
            }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


@app.on_event("startup")
def startup_event():
    logger.info("Starting up application...")
    try:
        seed_auth_users()
        start_scheduler()
        logger.info("Application startup complete")
    except Exception as e:
        logger.error(f"Failed to start scheduler or seed users: {str(e)}")


@app.on_event("shutdown")
def shutdown_event():
    logger.info("Shutting down application...")
    shutdown_scheduler()
    logger.info("Application shutdown complete")