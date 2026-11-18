"""
SQLAlchemy ORM Model for Government Schemes in Nagpur / Vidarbha Citrus & Agribusiness Ecosystem
"""
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, Date, JSON
from datetime import date

from app.database.base import Base


class GovernmentScheme(Base):
    """
    Master registry of verified Central and State Government schemes,
    subsidies, and debt-relief interventions.
    """
    __tablename__ = "government_schemes"

    id = Column(Integer, primary_key=True, index=True)
    scheme_code = Column(String(50), unique=True, nullable=False, index=True)  # e.g., PMFME-001
    scheme_name = Column(String(255), nullable=False)
    short_name = Column(String(100), nullable=False)
    department = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)  # e.g., "Capital Subsidy", "Interest Subvention"
    
    # Eligible business categories (stored as JSON array of strings)
    eligible_business_categories = Column(JSON, nullable=False)
    
    # Structured eligibility conditions (min_age, max_project_cost, etc.)
    eligibility_conditions = Column(JSON, nullable=False)
    
    # Financial assistance parameters
    assistance_percentage = Column(Float, nullable=False)  # e.g., 0.35 for 35%
    max_subsidy_amount = Column(Float, nullable=False)     # in INR (e.g., 1000000.0)
    min_promoter_contribution = Column(Float, default=0.10) # e.g. 0.10 for 10%
    
    # Required documents list
    required_documents = Column(JSON, nullable=False)
    
    # Official portal & governance provenance
    official_website = Column(String(500), nullable=False)
    source_document = Column(String(500), nullable=False)  # Official PDF / Circular citation
    clause_number = Column(String(50), nullable=True)
    nodal_agency = Column(String(255), nullable=False)
    processing_period = Column(String(100), nullable=False)
    last_verified_date = Column(Date, default=date.today)
    
    is_active = Column(Boolean, default=True)
