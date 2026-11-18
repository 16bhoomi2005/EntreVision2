"""
Census Demographics Ingester (Dataset D30)
==========================================
Ingests the official 2011 demographic data for the tehsils into PostgreSQL.
"""
import pandas as pd
import logging
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def ingest_demographics():
    logger.info("Reading D30 Census Demographics...")
    file_path = os.path.join(os.getcwd(), 'data', 'raw', 'd30_census_demographics.csv')
    
    try:
        df = pd.read_csv(file_path)
        
        load_dotenv()
        db_url = os.getenv("DATABASE_URL")
        
        if db_url and not df.empty:
            engine = create_engine(db_url)
            df.to_sql("tehsil_demographics", engine, if_exists="replace", index=False)
            logger.info(f"Successfully pushed demographic data for {len(df)} tehsils to PostgreSQL.")
            return df
            
    except Exception as e:
        logger.error(f"Failed to ingest demographics: {e}")

if __name__ == "__main__":
    df = ingest_demographics()
    if df is not None:
        print("\n--- Nagpur Tehsil Demographics (2011 Census) ---")
        print(df[['tehsil_name', 'total_population', 'literacy_rate_pct', 'urban_pct']])
