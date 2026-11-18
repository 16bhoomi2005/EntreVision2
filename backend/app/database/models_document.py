import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database.base import Base


VALID_STATUSES = [
    "Uploaded",
    "Pending review",
    "Verified by reviewer",
    "Rejected",
]


class UserDocument(Base):
    __tablename__ = "user_documents"

    id = Column(String(64), primary_key=True, default=lambda: uuid.uuid4().hex, index=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    category = Column(String(100), default="other", nullable=False)  # certificate, experience, license, land_712, other
    title = Column(String(255), nullable=True)
    
    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False, unique=True, index=True)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(100), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    
    verification_status = Column(String(50), default="Uploaded", nullable=False)
    rejection_reason = Column(String(500), nullable=True)
    reviewer_notes = Column(String(500), nullable=True)
    
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "category": self.category,
            "title": self.title or self.original_filename,
            "original_filename": self.original_filename,
            "stored_filename": self.stored_filename,
            "file_type": self.file_type,
            "file_size_bytes": self.file_size_bytes,
            "file_size_formatted": f"{self.file_size_bytes / 1024:.1f} KB" if self.file_size_bytes < 1048576 else f"{self.file_size_bytes / 1048576:.2f} MB",
            "verification_status": self.verification_status,
            "rejection_reason": self.rejection_reason,
            "reviewer_notes": self.reviewer_notes,
            "upload_date": self.upload_date.isoformat() if self.upload_date else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
