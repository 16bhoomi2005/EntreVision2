"""
Enterprise Business Model Engine
================================
Ingests 30 advanced business models with full financial profiles into PostgreSQL.
"""
import pandas as pd
import logging
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def ingest_business_models():
    logger.info("Initializing Enterprise Opportunity Ranker Database...")
    file_path = os.path.join(os.getcwd(), 'data', 'raw', 'enterprise_business_models.csv')
    
    try:
        df = pd.read_csv(file_path)
        
        # Calculate a quick 'ROI Months' heuristic (CapEx / (Monthly OpEx * Margin/100))
        # This is a highly simplified proxy just to show the AI how to rank them
        # We assume Revenue = OpEx / (1 - Margin)
        # Monthly Profit = Revenue * Margin = (OpEx / (1-Margin)) * Margin
        def calculate_roi_months(row):
            margin_dec = row['margin_pct'] / 100.0
            if margin_dec >= 1.0 or margin_dec <= 0:
                return 999
            monthly_revenue = row['est_opex_monthly_inr'] / (1.0 - margin_dec)
            monthly_profit = monthly_revenue * margin_dec
            
            if monthly_profit <= 0:
                return 999
            return round(row['est_capex_inr'] / monthly_profit, 1)

        df['est_roi_months'] = df.apply(calculate_roi_months, axis=1)
        
        load_dotenv()
        db_url = os.getenv("DATABASE_URL")
        
        if db_url and not df.empty:
            engine = create_engine(db_url)
            df.to_sql("business_models", engine, if_exists="replace", index=False)
            logger.info(f"Successfully pushed {len(df)} financial models to PostgreSQL.")
            return df
            
    except Exception as e:
        logger.error(f"Failed to ingest business models: {e}")

if __name__ == "__main__":
    df = ingest_business_models()
    if df is not None:
        print("\n--- TOP 5 HIGHEST MARGIN BUSINESS MODELS ---")
        top_margins = df.sort_values(by='margin_pct', ascending=False).head(5)
        print(top_margins[['model_name', 'category', 'margin_pct', 'est_capex_inr']])
        
        print("\n--- TOP 5 FASTEST ROI BUSINESS MODELS ---")
        fastest_roi = df.sort_values(by='est_roi_months', ascending=True).head(5)
        print(fastest_roi[['model_name', 'est_roi_months', 'est_capex_inr']])
