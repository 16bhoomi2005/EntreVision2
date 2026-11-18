"""
Collector for D04: PMFME Guidelines and Eligibility Rules
Access Method: Manual (PDF)
Format: PDF → Rules table
"""
import logging
from typing import Dict, Any, List
from datetime import datetime
from sqlalchemy.orm import Session
from pathlib import Path
import re

from app.data_collection.base_collector import BaseCollector

logger = logging.getLogger(__name__)


class PmferuleCollector(BaseCollector):
    """Collector for PMFME guidelines from PDF"""
    
    def __init__(self, db: Session, pdf_path: str = None):
        super().__init__(db, "D04")
        self.pdf_path = pdf_path
    
    def collect(self) -> Dict[str, Any]:
        """Collect PMFME rules from PDF"""
        self.log_info("Starting PMFME guidelines collection")
        
        if not self.pdf_path:
            self.log_error("PDF path not provided")
            return self.get_summary()
        
        pdf_path = Path(self.pdf_path)
        if not pdf_path.exists():
            self.log_error(f"PDF not found: {self.pdf_path}")
            return self.get_summary()
        
        try:
            # Extract text from PDF
            text = self.extract_pdf_text(pdf_path)
            
            # Parse rules from text
            parsed_data = self.parse(text)
            
            # Store rules
            if parsed_data:
                self.store(parsed_data)
            else:
                self.log_error("No rules parsed from PDF")
            
            self.log_info("PMFME collection completed")
            
        except Exception as e:
            self.log_error(f"Collection failed: {str(e)}")
            import traceback
            traceback.print_exc()
        
        return self.get_summary()
    
    def extract_pdf_text(self, pdf_path: Path) -> str:
        """Extract text from PDF using pdfplumber"""
        try:
            import pdfplumber
            
            text = ""
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() + "\n"
            
            self.log_info(f"Extracted {len(text)} characters from PDF")
            return text
            
        except ImportError:
            self.log_error("pdfplumber not installed. Install with: pip install pdfplumber")
            return ""
        except Exception as e:
            self.log_error(f"PDF extraction failed: {str(e)}")
            return ""
    
    def parse(self, text: str) -> List[Dict[str, Any]]:
        """Parse rules from extracted text"""
        self.log_info("Parsing PMFME rules from text")
        
        rules = []
        
        # Pattern matching for subsidy rules
        # Look for patterns like: "35% subsidy capped at Rs 10 lakh"
        subsidy_patterns = [
            r'(\d+)%\s*subsidy\s*(?:capped\s*at\s*Rs\.?\s*([\d.]+)\s*(?:lakh|crore)?)?',
            r'subsidy\s*(?:of\s*)?(\d+)%\s*(?:capped\s*at\s*Rs\.?\s*([\d.]+)\s*(?:lakh|crore)?)?',
        ]
        
        # Pattern for margin money
        margin_patterns = [
            r'margin\s*money\s*(?:of\s*)?(\d+)%',
            r'margin\s*(?:money)?\s*(?:of\s*)?(\d+)%',
        ]
        
        # Split text into lines and process
        lines = text.split('\n')
        current_rule = {}
        rule_counter = 1
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Check for subsidy patterns
            for pattern in subsidy_patterns:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    if current_rule:
                        rules.append(current_rule)
                        rule_counter += 1
                    
                    subsidy_percent = float(match.group(1))
                    subsidy_cap = None
                    if match.group(2):
                        cap_value = float(match.group(2))
                        # Convert lakh to actual number
                        if 'lakh' in line.lower():
                            subsidy_cap = cap_value * 100000
                        elif 'crore' in line.lower():
                            subsidy_cap = cap_value * 10000000
                    
                    current_rule = {
                        'rule_id': f'R{rule_counter:03d}',
                        'category': 'Subsidy',
                        'condition': line,
                        'threshold': f'{subsidy_percent}%',
                        'outcome': f'Subsidy {subsidy_percent}%',
                        'subsidy_percent': subsidy_percent,
                        'subsidy_cap': subsidy_cap,
                        'source_document': Path(self.pdf_path).name
                    }
                    self.records_processed += 1
                    break
            
            # Check for margin money patterns
            for pattern in margin_patterns:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    margin_percent = float(match.group(1))
                    if current_rule:
                        current_rule['margin_money_percent'] = margin_percent
                    else:
                        current_rule = {
                            'rule_id': f'R{rule_counter:03d}',
                            'category': 'Margin Money',
                            'condition': line,
                            'threshold': f'{margin_percent}%',
                            'outcome': f'Margin money {margin_percent}%',
                            'margin_money_percent': margin_percent,
                            'source_document': Path(self.pdf_path).name
                        }
                        self.records_processed += 1
                    break
        
        # Add last rule if exists
        if current_rule:
            rules.append(current_rule)
        
        self.log_info(f"Parsed {len(rules)} rules")
        return rules
    
    def store(self, parsed_data: List[Dict[str, Any]]) -> bool:
        """Store parsed rules in database"""
        self.log_info("Storing PMFME rules")
        
        # TODO: Import Pmferule model and implement storage
        # For now, save to CSV
        import pandas as pd
        from pathlib import Path
        
        df = pd.DataFrame(parsed_data)
        output_path = Path(__file__).parent.parent.parent.parent.parent / "data" / "processed" / "pmfe_rules.csv"
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        df.to_csv(output_path, index=False)
        self.log_info(f"Saved {len(df)} rules to {output_path}")
        
        self.records_inserted = len(df)
        return True


def manual_collect():
    """Manual collection function for testing"""
    import sys
    sys.path.insert(0, r'c:\Users\Bhoomi Vaishya\EntreVision2\backend')
    
    from app.database.connection import SessionLocal
    
    db = SessionLocal()
    pdf_path = r'c:\Users\Bhoomi Vaishya\EntreVision2\data\raw\financial\pmfme_guidelines.pdf'
    
    collector = PmferuleCollector(db, pdf_path=pdf_path)
    result = collector.collect()
    
    print("\nCollection Result:")
    print(result)
    
    db.close()


if __name__ == "__main__":
    manual_collect()
