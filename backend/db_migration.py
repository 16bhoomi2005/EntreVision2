"""
Database Migration Script (Option 3)
====================================
Migrates all parsed P1 CSV datasets from Pandas DataFrames into 
the PostgreSQL database (entrevision_db).
"""
import pandas as pd
import logging
from sqlalchemy import create_engine
from app.modules.dss.data_loader import DataManager
import os
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def migrate_data():
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        logger.error("No DATABASE_URL found in .env")
        return
        
    engine = create_engine(db_url)
    
    logger.info("Connecting to PostgreSQL Database...")
    try:
        # Test connection
        with engine.connect() as conn:
            pass
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        return
        
    # Load all CSVs
    dm = DataManager()
    datasets = dm.load_all()
    
    if not datasets:
        logger.warning("No datasets found to migrate.")
        return
        
    # Mapping of Dataset name -> Target PostgreSQL table name
    table_mappings = {
        "opportunities": "opportunities",
        "skills": "skills",
        "locations": "locations",
        "pmfme_rules": "pmfme_rules",
        "midh_norms": "midh_norms",
        "schemes": "schemes",
        "scheme_rules": "scheme_eligibility_rules",
        "licences": "licences_and_registrations",
        "training_institutions": "training_institutions",
        "benchmark_rates": "benchmark_interest_rates",
        "reference_dprs": "reference_dprs",
        "equipment_quotes": "equipment_quotes",
        "mandi_history": "mandi_prices_history",
        "rag_chunks": "rag_knowledge_base"
    }
    
    # We also need to load the dynamically created datasets (RAG chunks, midc, apmc)
    # The DataManager doesn't natively load midc/apmc yet, so let's load them manually
    base_dir = dm.base_dir
    extra_files = {
        "midc_locations": base_dir / "midc_locations.csv",
        "apmc_locations": base_dir / "apmc_locations.csv",
        "rag_chunks": base_dir / "rag_knowledge_base_chunks.csv",
        "tehsil_citrus_area": base_dir / "tehsil_citrus_area.csv",
        "synthetic_personas": base_dir / "synthetic_personas.csv"
    }
    
    for table_name, filepath in extra_files.items():
        if filepath.exists():
            datasets[table_name] = pd.read_csv(filepath)
            table_mappings[table_name] = table_name
            
    # Iterate and push to Postgres
    for dataset_name, df in datasets.items():
        if df.empty:
            continue
            
        target_table = table_mappings.get(dataset_name, dataset_name.lower())
        logger.info(f"Migrating {dataset_name} ({len(df)} rows) to table '{target_table}'...")
        
        try:
            # We use if_exists='replace' for this initial bulk migration
            df.to_sql(target_table, engine, if_exists='replace', index=False)
            logger.info(f"Successfully migrated {target_table}")
        except Exception as e:
            logger.error(f"Failed to migrate {dataset_name}: {e}")

if __name__ == "__main__":
    migrate_data()
