"""
Final Datasets Ingester (D29, D31, D32)
=======================================
Ingests Global Market Size and Local Labour Wages into PostgreSQL.
"""
import pandas as pd
import logging
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def ingest_final_data():
    logger.info("Reading D29 and D31/D32 Data...")
    
    try:
        df_demand = pd.read_csv(os.path.join(os.getcwd(), 'data', 'raw', 'd31_d32_global_demand.csv'))
        df_wages = pd.read_csv(os.path.join(os.getcwd(), 'data', 'raw', 'd29_labour_wages.csv'))
        
        load_dotenv()
        db_url = os.getenv("DATABASE_URL")
        
        if db_url:
            engine = create_engine(db_url)
            df_demand.to_sql("global_demand", engine, if_exists="replace", index=False)
            df_wages.to_sql("labour_wages", engine, if_exists="replace", index=False)
            
            logger.info("Successfully pushed Global Demand and Labour Wages to PostgreSQL.")
            return df_demand, df_wages
            
    except Exception as e:
        logger.error(f"Failed to ingest final data: {e}")

if __name__ == "__main__":
    df_demand, df_wages = ingest_final_data()
    print("\n--- GLOBAL DEMAND (CAGR) ---")
    print(df_demand[['product_category', 'global_market_size_usd_billion', 'cagr_pct']])
    
    print("\n--- MAHARASHTRA MINIMUM WAGES (Monthly INR) ---")
    print(df_wages[['worker_type', 'zone_i_monthly_inr', 'zone_iii_monthly_inr']])
