"""
Collector for D02: Historical Mandi Prices from ACROP
Access Method: Web Scraping
Format: HTML → CSV
Source: acrop.app
"""
import logging
from typing import Dict, Any, List
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import requests
from bs4 import BeautifulSoup
import pandas as pd

from app.data_collection.base_collector import BaseCollector

logger = logging.getLogger(__name__)


class AcropCollector(BaseCollector):
    """Collector for historical mandi prices from ACROP"""
    
    def __init__(self, db: Session, district: str = "nagpur", commodity: str = "orange"):
        super().__init__(db, "D02")
        self.district = district.lower()
        self.commodity = commodity.lower()
        self.base_url = f"https://acrop.app/prices/{self.commodity}/maharashtra/{self.district}"
    
    def collect(self) -> Dict[str, Any]:
        """Collect historical prices from ACROP"""
        self.log_info(f"Starting ACROP collection for {self.commodity} in {self.district}")
        
        try:
            # Fetch the page
            response = requests.get(self.base_url, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })
            response.raise_for_status()
            
            self.log_info(f"Fetched page: {self.base_url}")
            
            # Parse HTML
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract price history table
            parsed_data = self.parse(soup)
            
            # Store data
            if parsed_data:
                self.store(parsed_data)
            else:
                self.log_error("No data parsed from ACROP page")
            
            self.log_info("ACROP collection completed")
            
        except Exception as e:
            self.log_error(f"Collection failed: {str(e)}")
            import traceback
            traceback.print_exc()
        
        return self.get_summary()
    
    def parse(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Parse price history from HTML"""
        self.log_info("Parsing ACROP HTML")
        
        parsed = []
        
        # Try to find the price history table
        # The table is typically in a section with price history data
        tables = soup.find_all('table')
        
        for table in tables:
            rows = table.find_all('tr')
            if len(rows) > 1:  # Has header + data rows
                headers = [th.get_text(strip=True) for th in rows[0].find_all(['th', 'td'])]
                
                for row in rows[1:]:
                    cells = row.find_all(['td', 'th'])
                    if len(cells) >= 2:
                        row_data = {}
                        for i, cell in enumerate(cells):
                            if i < len(headers):
                                row_data[headers[i]] = cell.get_text(strip=True)
                        
                        # Extract date and price
                        if 'Price Date' in row_data:
                            try:
                                record = {
                                    'date': row_data.get('Price Date', ''),
                                    'median_price': self.extract_price(row_data.get('Median mandi price', '')),
                                    'mandis_in_median': row_data.get('Mandis in Median', ''),
                                    'total_arrival': self.extract_quantity(row_data.get('Total Arrival Quantity', '')),
                                    'district': self.district,
                                    'commodity': self.commodity,
                                    'source': 'acrop.app',
                                    'collected_at': datetime.utcnow().isoformat()
                                }
                                
                                if record['date']:
                                    parsed.append(record)
                                    self.records_processed += 1
                            except Exception as e:
                                self.log_error(f"Error parsing row: {str(e)}")
        
        self.log_info(f"Parsed {len(parsed)} records from ACROP")
        return parsed
    
    def store(self, parsed_data: List[Dict[str, Any]]) -> bool:
        """Store parsed data in database"""
        self.log_info("Storing ACROP data")
        
        # TODO: Create AcropPrice model and implement storage
        # For now, save to CSV
        import pandas as pd
        from pathlib import Path
        
        df = pd.DataFrame(parsed_data)
        output_path = Path(__file__).parent.parent.parent.parent.parent / "data" / "raw" / "orange" / "acrop_30day_history.csv"
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        df.to_csv(output_path, index=False)
        self.log_info(f"Saved {len(df)} records to {output_path}")
        
        self.records_inserted = len(df)
        return True
    
    def extract_price(self, price_str: str) -> float:
        """Extract price from string like '₹3,625/quintal'"""
        if not price_str:
            return None
        try:
            # Remove ₹, commas, and /quintal
            cleaned = price_str.replace('₹', '').replace(',', '').replace('/quintal', '').strip()
            return float(cleaned)
        except:
            return None
    
    def extract_quantity(self, qty_str: str) -> float:
        """Extract quantity from string like '11.5 tonnes · 2 mandis'"""
        if not qty_str:
            return None
        try:
            # Extract the number before "tonnes"
            parts = qty_str.split('tonnes')
            if parts:
                cleaned = parts[0].strip()
                return float(cleaned)
        except:
            return None


def manual_collect():
    """Manual collection function for testing"""
    import sys
    sys.path.insert(0, r'c:\Users\Bhoomi Vaishya\EntreVision2\backend')
    
    from app.database.connection import SessionLocal
    
    db = SessionLocal()
    collector = AcropCollector(db, district="nagpur", commodity="orange")
    result = collector.collect()
    
    print("\nCollection Result:")
    print(result)
    
    db.close()


if __name__ == "__main__":
    manual_collect()
