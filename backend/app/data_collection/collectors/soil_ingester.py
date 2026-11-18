"""
Soil Quality Ingester (Dataset D17)
===================================
Ingests NBSS&LUP Soil metrics into PostgreSQL.
"""
import pandas as pd
import logging
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def ingest_soil():
    logger.info("Reading D17 Soil Quality Data...")
    file_path = os.path.join(os.getcwd(), 'data', 'raw', 'd17_soil_quality.csv')
    
    try:
        df = pd.read_csv(file_path)
        
        load_dotenv()
        db_url = os.getenv("DATABASE_URL")
        
        if db_url and not df.empty:
            engine = create_engine(db_url)
            df.to_sql("soil_quality", engine, if_exists="replace", index=False)
            logger.info(f"Successfully pushed soil metrics for {len(df)} tehsils to PostgreSQL.")
            return df
            
    except Exception as e:
        logger.error(f"Failed to ingest soil data: {e}")

if __name__ == "__main__":
    df = ingest_soil()
    if df is not None:
        print("\n--- Nagpur District Soil Quality (NBSS&LUP) ---")
        print(df[['tehsil_name', 'primary_soil_type', 'citrus_suitability']])
