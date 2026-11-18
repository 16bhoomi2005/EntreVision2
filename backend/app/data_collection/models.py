from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from datetime import datetime

from app.database.base import Base


class DataCollectionTask(Base):
    """Track data collection tasks and their status"""
    __tablename__ = "data_collection_tasks"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(String(50), unique=True, nullable=False)  # e.g., D01, D02
    category = Column(String(100), nullable=False)
    dataset_name = Column(String(255), nullable=False)
    access_method = Column(String(50), nullable=False)  # API, Download, Manual, Web Scraping
    format = Column(String(50))  # JSON, CSV, Excel, PDF
    priority = Column(String(10))  # P1, P2, P3
    difficulty = Column(String(50))  # Easy, Medium, Hard
    update_frequency = Column(String(50))  # Daily, Weekly, Monthly, etc.
    status = Column(String(50), default="Not started")  # Not started, In progress, Completed, Failed
    last_run = Column(DateTime)
    last_success = Column(DateTime)
    error_message = Column(Text)
    records_collected = Column(Integer, default=0)
    collector_path = Column(String(255))  # Path to the collector script
    notes = Column(Text)
