"""
Actual Tariff PDF Extractor (Dataset D19 - Verified)
====================================================
Uses PyPDF2 to scan the official 2026 MSEDCL Tariff Order PDF, 
extract the exact mathematical rates, and overwrite the placeholder 
tariffs in PostgreSQL.
"""
import os
import re
import pandas as pd
import logging
import PyPDF2
from sqlalchemy import create_engine
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def extract_actual_tariffs():
    logger.info("Scanning official MSEDCL Tariff PDF...")
    # The file is in C:\Users\Bhoomi Vaishya\EntreVision2\data\
    pdf_path = os.path.join(os.path.dirname(os.getcwd()), 'data', 'Tariff-Order_Case-No.-75-of-2025-dated-25th-March-2026.pdf')
    
    if not os.path.exists(pdf_path):
        logger.error(f"PDF not found at {pdf_path}")
        return None
        
    try:
        with open(pdf_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            num_pages = len(reader.pages)
            
            # The tariff schedules are in Annexure II (the last 30 pages)
            raw_text = ""
            for i in range(max(0, num_pages - 30), num_pages):
                page_text = reader.pages[i].extract_text()
                if page_text:
                    raw_text += page_text + "\n"
                    
            # 1. Extract LT IV(B) Agriculture Metered Pumpsets
            # We look for the line containing "LT IV(B): LT - Agriculture Metered Tariff - Pumpsets"
            # It usually looks like: Pumpsets  Rs/HP/mth  70 2.42 1.60 4.02 
            agri_match = re.search(r'LT IV\(B\):.*?Pumpsets\s+Rs/HP/mth\s+(\d+)\s+([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)', raw_text, re.DOTALL)
            
            # 2. Extract LT V Industry (i): 0 -20 kW
            # Looks like: (i): 0 -20 kW  Rs/conn/mth  650 6.26 1.60 7.86 
            ind_match = re.search(r'LT V: LT - Industry.*?\(i\): 0 -20 kW\s+Rs/conn/mth\s+(\d+)\s+([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)', raw_text, re.DOTALL)
            
            if not agri_match or not ind_match:
                logger.error("Could not parse exact numerical patterns from the PDF text.")
                return None
                
            agri_fixed = float(agri_match.group(1))
            agri_energy = float(agri_match.group(2))
            agri_wheeling = float(agri_match.group(3))
            agri_total_var = float(agri_match.group(4))
            
            ind_fixed = float(ind_match.group(1))
            ind_energy = float(ind_match.group(2))
            ind_wheeling = float(ind_match.group(3))
            ind_total_var = float(ind_match.group(4))
            
            # Build the DataFrame
            data = [
                {
                    "tariff_category": "Agriculture (Metered) - Verified",
                    "connection_type": "LT IV(B)",
                    "fixed_charge_rs_per_kw_month": agri_fixed,
                    "energy_charge_rs_per_kwh": agri_energy,
                    "wheeling_charge_rs": agri_wheeling,
                    "total_variable_charge_rs": agri_total_var,
                    "notes": "Exact data pulled from MSEDCL Case No 75 of 2025 PDF."
                },
                {
                    "tariff_category": "Industry (Small Scale) - Verified",
                    "connection_type": "LT V",
                    "fixed_charge_rs_per_kw_month": ind_fixed,
                    "energy_charge_rs_per_kwh": ind_energy,
                    "wheeling_charge_rs": ind_wheeling,
                    "total_variable_charge_rs": ind_total_var,
                    "notes": "Exact data pulled from MSEDCL Case No 75 of 2025 PDF."
                }
            ]
            
            df = pd.DataFrame(data)
            logger.info("Successfully extracted exact MSEDCL tariff rates from PDF.")
            
            # Push to DB
            load_dotenv()
            db_url = os.getenv("DATABASE_URL")
            if db_url:
                engine = create_engine(db_url)
                df.to_sql("power_tariffs", engine, if_exists="replace", index=False)
                logger.info("Overwrote placeholders with verified PDF data in PostgreSQL.")
                
            return df
            
    except Exception as e:
        logger.error(f"PDF extraction failed: {e}")
        return None

if __name__ == "__main__":
    df = extract_actual_tariffs()
    if df is not None:
        print("\n--- ACTUAL MSEDCL Tariff Rates (From Official 2026 PDF) ---")
        print(df[['tariff_category', 'fixed_charge_rs_per_kw_month', 'total_variable_charge_rs']])
