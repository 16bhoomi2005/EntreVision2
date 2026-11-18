from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    salt = Column(String(64), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(100), default="Agro-Entrepreneur")
    tehsil = Column(String(100), default="Katol")
    district = Column(String(100), default="Nagpur")
    phone = Column(String(50), nullable=True)
    avatar = Column(String(50), default="🍊")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    assessment = relationship("UserAssessment", back_populates="user", uselist=False, cascade="all, delete-orphan")
    ventures = relationship("UserVenture", back_populates="user", cascade="all, delete-orphan")

    def to_safe_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "role": self.role,
            "tehsil": self.tehsil,
            "district": self.district,
            "phone": self.phone or "",
            "avatar": self.avatar or "🍊",
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class UserAssessment(Base):
    __tablename__ = "user_assessments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    
    about_me = Column(JSON, nullable=True)
    skills_detailed = Column(JSON, nullable=True)
    willingness_to_learn = Column(String(50), default="willing_to_learn")
    documents = Column(JSON, nullable=True)
    resources_detailed = Column(JSON, nullable=True)
    location_detailed = Column(JSON, nullable=True)
    finance_detailed = Column(JSON, nullable=True)
    business_preferences = Column(JSON, nullable=True)
    latest_recommendations = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="assessment")


class UserVenture(Base):
    __tablename__ = "user_ventures"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    
    opportunity_id = Column(String(50), nullable=True)
    venture_name = Column(String(255), nullable=True)
    venture_data = Column(JSON, nullable=True)
    journey_phase = Column(Integer, default=1)
    current_task = Column(String(255), nullable=True)
    next_deadline = Column(String(100), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="ventures")


class CollaborationConnection(Base):
    __tablename__ = "collaboration_connections"

    id = Column(Integer, primary_key=True, autoincrement=True)
    sender_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    recipient_id = Column(String(64), nullable=False, index=True)
    recipient_name = Column(String(255), nullable=True)
    topic = Column(String(255), nullable=False)
    message = Column(String(1000), nullable=False)
    status = Column(String(50), default="Pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
