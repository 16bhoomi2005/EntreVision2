"""
Groundwater Ingester (Dataset D16)
==================================
Ingests CGWB Groundwater metrics into PostgreSQL.
"""
import pandas as pd
import logging
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def ingest_groundwater():
    logger.info("Reading D16 Groundwater Data...")
    file_path = os.path.join(os.getcwd(), 'data', 'raw', 'd16_groundwater_levels.csv')
    
    try:
        df = pd.read_csv(file_path)
        
        load_dotenv()
        db_url = os.getenv("DATABASE_URL")
        
        if db_url and not df.empty:
            engine = create_engine(db_url)
            df.to_sql("groundwater_levels", engine, if_exists="replace", index=False)
            logger.info(f"Successfully pushed CGWB metrics for {len(df)} tehsils to PostgreSQL.")
            return df
            
    except Exception as e:
        logger.error(f"Failed to ingest groundwater: {e}")

if __name__ == "__main__":
    df = ingest_groundwater()
    if df is not None:
        print("\n--- Nagpur District Groundwater Levels (CGWB) ---")
        print(df[['tehsil_name', 'groundwater_status', 'avg_depth_mbgl_pre_monsoon']])
