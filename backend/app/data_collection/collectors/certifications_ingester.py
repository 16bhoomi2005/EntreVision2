"""
Licensing Costs Ingester (Dataset D34)
======================================
Ingests FSSAI and APEDA fees into PostgreSQL.
"""
import pandas as pd
import logging
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def ingest_licenses():
    logger.info("Reading D34 Licensing Data...")
    file_path = os.path.join(os.getcwd(), 'data', 'raw', 'd34_certifications.csv')
    
    try:
        df = pd.read_csv(file_path)
        
        load_dotenv()
        db_url = os.getenv("DATABASE_URL")
        
        if db_url and not df.empty:
            engine = create_engine(db_url)
            df.to_sql("certification_costs", engine, if_exists="replace", index=False)
            logger.info(f"Successfully pushed licensing fees for {len(df)} certificates to PostgreSQL.")
            return df
            
    except Exception as e:
        logger.error(f"Failed to ingest licensing data: {e}")

if __name__ == "__main__":
    df = ingest_licenses()
    if df is not None:
        print("\n--- Mandatory Food Processing & Export Licenses (India) ---")
        print(df[['license_name', 'government_fee_inr', 'validity_period_years']])
