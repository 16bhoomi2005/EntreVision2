from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import engine
from app.database.base import Base
from app.modules.industry.models import Industry, BusinessOpportunity
from app.modules.industry.routes import router as industry_router
from app.modules.dss.routes import router as dss_router


Base.metadata.create_all(bind=engine)


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
app.include_router(industry_router)
app.include_router(dss_router)


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