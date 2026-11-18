from sqlalchemy import Column, Integer, String, Float, DateTime, Index
from datetime import datetime

from app.database.base import Base


class MandiPrice(Base):
    __tablename__ = "mandi_prices"

    id = Column(Integer, primary_key=True, index=True)
    price_date = Column(String(50), nullable=False)  # Arrival date from API
    state = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    market = Column(String(200), nullable=False)
    commodity = Column(String(200), nullable=False)
    variety = Column(String(200), nullable=True)
    grade = Column(String(100), nullable=True)
    min_price = Column(Float, nullable=True)
    max_price = Column(Float, nullable=True)
    modal_price = Column(Float, nullable=True)
    fetched_at = Column(DateTime, default=datetime.utcnow)

    # Composite unique constraint to prevent duplicates
    __table_args__ = (
        Index('idx_mandi_unique', 'price_date', 'market', 'commodity', 'variety', unique=True),
    )
