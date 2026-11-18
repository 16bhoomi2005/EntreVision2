"""
Processed-Product Benchmarks Ingester (Dataset D04)
===================================================
Ingests the market research CSV into the PostgreSQL database.
"""
import pandas as pd
import logging
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def ingest_benchmarks():
    logger.info("Reading D04 Processed Product Benchmarks...")
    file_path = os.path.join(os.getcwd(), 'data', 'raw', 'd04_processed_benchmarks.csv')
    
    try:
        df = pd.read_csv(file_path)
        
        load_dotenv()
        db_url = os.getenv("DATABASE_URL")
        
        if db_url and not df.empty:
            engine = create_engine(db_url)
            df.to_sql("processed_product_benchmarks", engine, if_exists="replace", index=False)
            logger.info(f"Successfully pushed {len(df)} market benchmarks to PostgreSQL.")
            return df
            
    except Exception as e:
        logger.error(f"Failed to ingest benchmarks: {e}")

if __name__ == "__main__":
    df = ingest_benchmarks()
    if df is not None:
        print("\n--- Live Wholesale Product Benchmarks (India) ---")
        print(df)
