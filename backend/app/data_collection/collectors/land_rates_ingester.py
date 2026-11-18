"""
Land Rates Ingester (Dataset D35)
=================================
Ingests MIDC land rates into PostgreSQL.
"""
import pandas as pd
import logging
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def ingest_rates():
    logger.info("Reading D35 Land Rates Data...")
    file_path = os.path.join(os.getcwd(), 'data', 'raw', 'd35_land_rates.csv')
    
    try:
        df = pd.read_csv(file_path)
        
        load_dotenv()
        db_url = os.getenv("DATABASE_URL")
        
        if db_url and not df.empty:
            engine = create_engine(db_url)
            df.to_sql("land_rates", engine, if_exists="replace", index=False)
            logger.info(f"Successfully pushed land rates for {len(df)} MIDC zones to PostgreSQL.")
            return df
            
    except Exception as e:
        logger.error(f"Failed to ingest land rates: {e}")

if __name__ == "__main__":
    df = ingest_rates()
    if df is not None:
        print("\n--- Nagpur District MIDC Industrial Land Rates ---")
        print(df[['zone_name', 'rate_per_sqm_inr']])
