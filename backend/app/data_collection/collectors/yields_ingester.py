"""
Processing Yields Ingester (Dataset D08)
========================================
Ingests the scientific recovery rates into PostgreSQL.
"""
import pandas as pd
import logging
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def ingest_yields():
    logger.info("Reading D08 Processing Yield Data...")
    file_path = os.path.join(os.getcwd(), 'data', 'raw', 'd08_processing_yields.csv')
    
    try:
        df = pd.read_csv(file_path)
        
        load_dotenv()
        db_url = os.getenv("DATABASE_URL")
        
        if db_url and not df.empty:
            engine = create_engine(db_url)
            df.to_sql("processing_yields", engine, if_exists="replace", index=False)
            logger.info(f"Successfully pushed {len(df)} scientific recovery metrics to PostgreSQL.")
            return df
            
    except Exception as e:
        logger.error(f"Failed to ingest yields: {e}")

if __name__ == "__main__":
    df = ingest_yields()
    if df is not None:
        print("\n--- Nagpur Mandarin Scientific Processing Yields ---")
        print(df[['component', 'average_recovery_pct', 'notes']])
