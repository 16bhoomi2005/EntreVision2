"""
DSS Data Loader
===============
Loads all processed datasets (P1) into Pandas DataFrames for the ML models.
This acts as the bridge between the data collection pipeline and the ML Engine.
"""
import pandas as pd
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class DataManager:
    def __init__(self):
        self.base_dir = Path(__file__).resolve().parent.parent.parent.parent.parent / "data" / "proccessed"
        self.data = {}
        
    def load_all(self):
        """Loads all available processed datasets into memory."""
        logger.info("Loading processed datasets for ML Engine...")
        
        # Mapping of dataset names to their filenames
        files = {
            "pmfme_rules": "pmfme_rules_parsed.csv",
            "midh_norms": "midh_norms_parsed.csv",
            "equipment_quotes": "parsed_equipment_quotes.csv",
            "reference_dprs": "reference_dprs.csv",
            "opportunities": "opportunities.csv",
            "schemes": "schemes.csv",
            "scheme_rules": "scheme_eligibility_rules.csv",
            "skills": "skills.csv",
            "locations": "locations.csv",
            "licences": "licences_and_registrations.csv",
            "training_institutions": "training_institutions.csv",
            "benchmark_rates": "benchmark_interest_rates.csv"
        }
        
        for name, filename in files.items():
            filepath = self.base_dir / filename
            if filepath.exists():
                try:
                    self.data[name] = pd.read_csv(filepath)
                    logger.info(f"Loaded '{name}': {len(self.data[name])} records")
                except Exception as e:
                    logger.error(f"Failed to load {filename}: {e}")
            else:
                logger.warning(f"File not found: {filename}")
                
        # Also load the raw historical mandi prices (since it's in the raw folder for now)
        mandi_path = self.base_dir.parent / "raw" / "orange" / "acrop_30day_history.csv"
        if mandi_path.exists():
            self.data["mandi_history"] = pd.read_csv(mandi_path)
            logger.info(f"Loaded 'mandi_history': {len(self.data['mandi_history'])} records")
            
        return self.data
        
    def get_dataset(self, name: str) -> pd.DataFrame:
        """Retrieve a specific dataset by name."""
        return self.data.get(name, pd.DataFrame())

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    dm = DataManager()
    dm.load_all()
