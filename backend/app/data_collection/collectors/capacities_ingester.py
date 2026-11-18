"""
Commercial Capacities Ingester (Datasets D14 & D15)
===================================================
Ingests the Mandi and MIDC capacities into PostgreSQL.
"""
import pandas as pd
import logging
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def ingest_capacities():
    logger.info("Reading D14/D15 Capacities Data...")
    file_path = os.path.join(os.getcwd(), 'data', 'raw', 'd14_d15_capacities.csv')
    
    try:
        df = pd.read_csv(file_path)
        
        load_dotenv()
        db_url = os.getenv("DATABASE_URL")
        
        if db_url and not df.empty:
            engine = create_engine(db_url)
            df.to_sql("commercial_capacities", engine, if_exists="replace", index=False)
            logger.info(f"Successfully pushed {len(df)} commercial zone capacities to PostgreSQL.")
            return df
            
    except Exception as e:
        logger.error(f"Failed to ingest capacities: {e}")

if __name__ == "__main__":
    df = ingest_capacities()
    if df is not None:
        print("\n--- Nagpur APMC & MIDC Capacities ---")
        print(df[['facility_name', 'type', 'daily_capacity_mt', 'total_area_acres']])
