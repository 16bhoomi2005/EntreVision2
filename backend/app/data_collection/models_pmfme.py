"""
Models for PMFME Guidelines and Eligibility Rules
"""
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Boolean
from datetime import datetime

from app.database.base import Base


class Pmferule(Base):
    """PMFME eligibility rules extracted from guidelines"""
    __tablename__ = "pmfe_rules"

    id = Column(Integer, primary_key=True, index=True)
    rule_id = Column(String(50), unique=True, nullable=False)  # e.g., R001
    category = Column(String(100))  # e.g., "Subsidy Cap", "Margin Money", "Unit Cost"
    condition = Column(Text, nullable=False)  # e.g., "Project cost up to Rs 10 lakh"
    threshold = Column(String(100))  # e.g., "Rs 10 lakh", "35%"
    outcome = Column(Text)  # e.g., "Subsidy 35% capped at Rs 10 lakh"
    clause_number = Column(String(50))  # e.g., "4.2.1"
    component = Column(String(100))  # e.g., "Cold Storage", "Pack House"
    subsidy_percent = Column(Float)  # e.g., 35.0
    subsidy_cap = Column(Float)  # e.g., 1000000.0 (in Rs)
    margin_money_percent = Column(Float)  # e.g., 10.0
    odapplicable = Column(Boolean, default=False)  # ODOP applicable
    notes = Column(Text)
    source_document = Column(String(255))  # PDF filename
    source_url = Column(String(500))
    extracted_at = Column(DateTime, default=datetime.utcnow)
