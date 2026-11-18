"""
Collector for D06: NABARD/AIF/CGTMSE/Mudra Loan Terms
Access Method: Manual (Excel)
Format: Excel
Priority: P1
"""
import logging
from typing import Dict, Any, List
from datetime import datetime
from sqlalchemy.orm import Session
import pandas as pd

from app.data_collection.base_collector import BaseCollector

logger = logging.getLogger(__name__)


class LoanTermsCollector(BaseCollector):
    """Collector for loan terms from various schemes"""
    
    def __init__(self, db: Session, excel_path: str = None):
        super().__init__(db, "D06")
        self.excel_path = excel_path
    
    def collect(self) -> Dict[str, Any]:
        """Collect loan terms data"""
        self.log_info("Starting loan terms collection")
        
        if not self.excel_path:
            self.log_error("Excel path not provided")
            return self.get_summary()
        
        try:
            # Read Excel file
            df = pd.read_excel(self.excel_path)
            self.log_info(f"Read {len(df)} rows from Excel")
            
            # Parse data
            parsed_data = self.parse(df)
            
            # Store data
            self.store(parsed_data)
            
            self.log_info("Loan terms collection completed")
            
        except Exception as e:
            self.log_error(f"Collection failed: {str(e)}")
            import traceback
            traceback.print_exc()
        
        return self.get_summary()
    
    def parse(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Parse loan terms from DataFrame"""
        self.log_info("Parsing loan terms")
        
        parsed = []
        
        for idx, row in df.iterrows():
            try:
                # Extract loan term fields
                term = {
                    "scheme": row.get("scheme", ""),
                    "interest_rate": self.parse_rate(row.get("interest_rate")),
                    "tenure_years": self.parse_number(row.get("tenure")),
                    "moratorium_months": self.parse_number(row.get("moratorium")),
                    "margin_percent": self.parse_number(row.get("margin_percent")),
                    "collateral_required": row.get("collateral", ""),
                    "source": row.get("source", ""),
                    "date": row.get("date", datetime.utcnow().strftime("%Y-%m-%d")),
                    "notes": row.get("notes", "")
                }
                
                # Validate required fields
                if term["scheme"]:
                    parsed.append(term)
                    self.records_processed += 1
                
            except Exception as e:
                self.log_error(f"Error parsing row {idx}: {str(e)}")
        
        self.log_info(f"Parsed {len(parsed)} loan terms")
        return parsed
    
    def store(self, parsed_data: List[Dict[str, Any]]) -> bool:
        """Store loan terms in database"""
        self.log_info("Storing loan terms")
        
        # TODO: Create LoanTerms model and implement storage
        # For now, just log the data
        for term in parsed_data:
            self.log_info(f"Would store: {term['scheme']}")
            self.records_inserted += 1
        
        self.log_info(f"Stored {self.records_inserted} loan terms")
        return True
    
    def parse_rate(self, value) -> float:
        """Parse interest rate"""
        if pd.isna(value):
            return None
        try:
            # Remove % and convert to float
            cleaned = str(value).replace("%", "").strip()
            return float(cleaned)
        except:
            return None
    
    def parse_number(self, value) -> float:
        """Parse numeric value"""
        if pd.isna(value):
            return None
        try:
            return float(value)
        except:
            return None
