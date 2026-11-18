"""
Base collector class for data collection
All specific collectors should inherit from this
"""
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


class BaseCollector(ABC):
    """Abstract base class for data collectors"""
    
    def __init__(self, db: Session, task_id: str):
        self.db = db
        self.task_id = task_id
        self.records_processed = 0
        self.records_inserted = 0
        self.records_updated = 0
        self.errors = []
        self.start_time = datetime.utcnow()
    
    @abstractmethod
    def collect(self) -> Dict[str, Any]:
        """
        Main collection method - must be implemented by subclasses
        Returns a dictionary with collection results
        """
        pass
    
    @abstractmethod
    def parse(self, raw_data: Any) -> Any:
        """
        Parse raw data into structured format
        Must be implemented by subclasses
        """
        pass
    
    @abstractmethod
    def store(self, parsed_data: Any) -> bool:
        """
        Store parsed data in database
        Must be implemented by subclasses
        """
        pass
    
    def log_error(self, message: str):
        """Log an error"""
        logger.error(f"[{self.task_id}] {message}")
        self.errors.append(message)
    
    def log_info(self, message: str):
        """Log info"""
        logger.info(f"[{self.task_id}] {message}")
    
    def get_summary(self) -> Dict[str, Any]:
        """Get collection summary"""
        duration = (datetime.utcnow() - self.start_time).total_seconds()
        return {
            "task_id": self.task_id,
            "success": len(self.errors) == 0,
            "duration_seconds": duration,
            "records_processed": self.records_processed,
            "records_inserted": self.records_inserted,
            "records_updated": self.records_updated,
            "errors": self.errors,
            "message": f"Processed {self.records_processed} records in {duration:.2f}s"
        }
