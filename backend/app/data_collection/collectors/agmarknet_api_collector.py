"""
Agmarknet API Collector (Dataset D01)
=====================================
Fetches live daily Mandi prices for Citrus (Orange, Mosambi, Lemon) 
in Nagpur from the Indian Government's Open Data API (data.gov.in).
"""
import os
import requests
import pandas as pd
import logging
from datetime import datetime
from dotenv import load_dotenv
from sqlalchemy import create_engine

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

class AgmarknetCollector:
    def __init__(self):
        load_dotenv()
        self.api_key = os.getenv("DATAGOV_API_KEY")
        self.resource_id = os.getenv("DATAGOV_RESOURCE_ID")
        self.db_url = os.getenv("DATABASE_URL")
        
        if not self.api_key or not self.resource_id:
            logger.error("Missing DATAGOV credentials in .env")
            
    def fetch_live_prices(self):
        """Hits the Data.gov.in API to get Nagpur Citrus prices."""
        if not self.api_key:
            return None
            
        logger.info("Connecting to Agmarknet Data.gov.in API...")
        
        # We query for Nagpur district specifically to minimize payload size
        url = f"https://api.data.gov.in/resource/{self.resource_id}"
        params = {
            "api-key": self.api_key,
            "format": "json",
            "filters[district]": "Nagpur",
            "limit": 100
        }
        
        try:
            response = requests.get(url, params=params, timeout=15)
            response.raise_for_status()
            data = response.json()
            
            records = data.get("records", [])
            if not records:
                logger.warning("No records returned from API for Nagpur.")
                return pd.DataFrame()
                
            # Filter specifically for Citrus crops (API might return other crops for Nagpur)
            target_crops = ["Orange", "Mosambi", "Lemon", "Citrus", "Kinnow"]
            citrus_records = [r for r in records if any(c.lower() in str(r.get('commodity', '')).lower() for c in target_crops)]
            
            df = pd.DataFrame(citrus_records)
            logger.info(f"Successfully fetched {len(df)} live citrus price records.")
            return df
            
        except Exception as e:
            logger.error(f"Failed to fetch Agmarknet data: {e}")
            return pd.DataFrame()

    def update_database(self, df: pd.DataFrame):
        """Pushes the new records into the PostgreSQL database."""
        if df.empty or not self.db_url:
            return
            
        try:
            engine = create_engine(self.db_url)
            
            # Format to match our target schema
            clean_df = pd.DataFrame({
                "price_date": pd.to_datetime(df.get("arrival_date", datetime.now().date()), format="%d/%m/%Y", errors="coerce"),
                "state": df.get("state", "Maharashtra"),
                "district": df.get("district", "Nagpur"),
                "market": df.get("market", "Unknown Mandi"),
                "commodity": df.get("commodity", "Orange"),
                "variety": df.get("variety", "Other"),
                "min_price": pd.to_numeric(df.get("min_price", 0), errors="coerce"),
                "max_price": pd.to_numeric(df.get("max_price", 0), errors="coerce"),
                "modal_price": pd.to_numeric(df.get("modal_price", 0), errors="coerce"),
                "source_id": "D01_Agmarknet_Live",
                "fetched_at": datetime.now()
            })
            
            # Append new records to the database (we don't want to replace historical data)
            clean_df.to_sql("mandi_prices", engine, if_exists="append", index=False)
            logger.info(f"Appended {len(clean_df)} new live price records to PostgreSQL.")
            
        except Exception as e:
            logger.error(f"Failed to update database: {e}")

if __name__ == "__main__":
    collector = AgmarknetCollector()
    df = collector.fetch_live_prices()
    if df is not None and not df.empty:
        print("\n--- Live Agmarknet Citrus Prices (Nagpur) ---")
        print(df[['market', 'commodity', 'variety', 'modal_price', 'arrival_date']].head())
        
        collector.update_database(df)
