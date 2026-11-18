"""
Power Tariffs Ingester (Dataset D19)
====================================
Ingests the structured MSEDCL tariff data into PostgreSQL.
"""
import pandas as pd
import logging
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def ingest_tariffs():
    logger.info("Reading D19 Power Tariffs...")
    file_path = os.path.join(os.getcwd(), 'data', 'raw', 'd19_power_tariffs.csv')
    
    try:
        df = pd.read_csv(file_path)
        
        load_dotenv()
        db_url = os.getenv("DATABASE_URL")
        
        if db_url and not df.empty:
            engine = create_engine(db_url)
            df.to_sql("power_tariffs", engine, if_exists="replace", index=False)
            logger.info(f"Successfully pushed {len(df)} MSEDCL tariff structures to PostgreSQL.")
            return df
            
    except Exception as e:
        logger.error(f"Failed to ingest tariffs: {e}")

if __name__ == "__main__":
    df = ingest_tariffs()
    if df is not None:
        print("\n--- MSEDCL Power Tariffs (Maharashtra) ---")
        print(df)
