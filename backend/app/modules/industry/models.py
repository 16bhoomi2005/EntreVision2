from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.database.base import Base


class Industry(Base):
    __tablename__ = "industry"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text)
    region = Column(String(100))
    is_active = Column(Boolean, default=True)

    business_opportunities = relationship(
        "BusinessOpportunity",
        back_populates="industry"
    )


class BusinessOpportunity(Base):
    __tablename__ = "business_opportunity"

    id = Column(Integer, primary_key=True, index=True)

    industry_id = Column(
        Integer,
        ForeignKey("industry.id"),
        nullable=False
    )

    name = Column(String(255), nullable=False)
    description = Column(Text)

    category = Column(String(150))
    subcategory = Column(String(150))

    investment_level = Column(String(150))
    technology_level = Column(String(150))

    target_market = Column(String(500))
    location_relevance = Column(String(500))

    status = Column(String(50), default="candidate")

    source = Column(String(500))
    source_url = Column(String(1000))

    industry = relationship(
        "Industry",
        back_populates="business_opportunities"
    )