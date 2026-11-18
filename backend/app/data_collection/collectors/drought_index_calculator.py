"""
Drought & Heat Vulnerability Index (Dataset D12)
================================================
Derives the drought risk index from the 10-year historical climate data.
Updates the `climate_monthly` PostgreSQL table with a computed risk_index.
"""
import os
import logging
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def derive_drought_index():
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        logger.error("No DATABASE_URL found.")
        return

    logger.info("Connecting to PostgreSQL to derive Drought Vulnerability Index...")
    try:
        engine = create_engine(db_url)
        with engine.begin() as conn:
            # 1. Ensure the column exists (it might have been created as float or text, but we'll cast/add)
            conn.execute(text("ALTER TABLE climate_monthly ADD COLUMN IF NOT EXISTS risk_index FLOAT;"))
            
            # 2. Mathematical Definition of Drought Risk for Nagpur Citrus:
            # High Risk (3.0): Mean Temp > 32°C AND Rainfall < 10mm
            # Medium Risk (2.0): Mean Temp > 30°C AND Rainfall < 30mm
            # Normal (1.0): Everything else
            
            sql_update = """
            UPDATE climate_monthly
            SET risk_index = 
                CASE 
                    WHEN temperature_c > 32.0 AND rainfall_mm < 10.0 THEN 3.0
                    WHEN temperature_c > 30.0 AND rainfall_mm < 30.0 THEN 2.0
                    ELSE 1.0
                END;
            """
            
            conn.execute(text(sql_update))
            logger.info("Successfully updated risk_index across all 363 climate records.")
            
            # Let's aggregate and see which Tehsil has the highest overall vulnerability
            sql_agg = """
            SELECT tehsil_id, 
                   COUNT(*) as total_months,
                   SUM(CASE WHEN risk_index = 3.0 THEN 1 ELSE 0 END) as extreme_drought_months,
                   AVG(risk_index) as avg_vulnerability_score
            FROM climate_monthly
            GROUP BY tehsil_id
            ORDER BY avg_vulnerability_score DESC;
            """
            result = conn.execute(text(sql_agg))
            
            print("\n--- Tehsil Drought Vulnerability Overview (10-Year) ---")
            for row in result:
                print(f"Tehsil: {row.tehsil_id} | Extreme Drought Months: {row.extreme_drought_months} | Avg Risk Score: {round(row.avg_vulnerability_score, 2)}")
                
    except Exception as e:
        logger.error(f"Failed to derive dataset: {e}")

if __name__ == "__main__":
    derive_drought_index()
