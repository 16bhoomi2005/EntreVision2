"""
Export Data Ingester (Dataset D02 / D03)
========================================
Ingests APEDA export destinations into PostgreSQL.
"""
import pandas as pd
import logging
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def ingest_exports():
    logger.info("Reading D02 Export Destinations Data...")
    file_path = os.path.join(os.getcwd(), 'data', 'raw', 'd02_export_destinations.csv')
    
    try:
        df = pd.read_csv(file_path)
        
        load_dotenv()
        db_url = os.getenv("DATABASE_URL")
        
        if db_url and not df.empty:
            engine = create_engine(db_url)
            df.to_sql("export_destinations", engine, if_exists="replace", index=False)
            logger.info(f"Successfully pushed export data for {len(df)} countries to PostgreSQL.")
            return df
            
    except Exception as e:
        logger.error(f"Failed to ingest export data: {e}")

if __name__ == "__main__":
    df = ingest_exports()
    if df is not None:
        print("\n--- Nagpur Mandarin Global Export Destinations (APEDA) ---")
        print(df[['destination_country', 'transport_mode', 'primary_season']])
