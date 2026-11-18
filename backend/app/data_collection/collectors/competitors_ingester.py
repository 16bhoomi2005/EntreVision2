"""
Competitor Data Ingester (Dataset D20)
======================================
Ingests the actual competitor and processing unit data into PostgreSQL.
"""
import pandas as pd
import logging
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def ingest_competitors():
    logger.info("Reading D20 Competitor Data...")
    file_path = os.path.join(os.getcwd(), 'data', 'raw', 'd20_competitors.csv')
    
    try:
        df = pd.read_csv(file_path)
        
        load_dotenv()
        db_url = os.getenv("DATABASE_URL")
        
        if db_url and not df.empty:
            engine = create_engine(db_url)
            df.to_sql("local_competitors", engine, if_exists="replace", index=False)
            logger.info(f"Successfully pushed {len(df)} actual processing competitors to PostgreSQL.")
            return df
            
    except Exception as e:
        logger.error(f"Failed to ingest competitors: {e}")

if __name__ == "__main__":
    df = ingest_competitors()
    if df is not None:
        print("\n--- Nagpur Citrus Processing Units (Actual Competitors) ---")
        print(df[['company_name', 'location', 'scale', 'products']])
