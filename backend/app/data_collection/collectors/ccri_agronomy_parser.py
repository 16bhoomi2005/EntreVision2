"""
CCRI Agronomy & Post-Harvest Parser
===================================
Extracts P1 agronomic data (Bahar calendar, post-harvest losses, yields)
from raw ICAR-CCRI research text files.
"""
import re
import csv
import logging
from pathlib import Path
from datetime import datetime

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def parse_ccri_data():
    base_dir = Path(__file__).resolve().parent.parent.parent.parent.parent
    data_dir = base_dir / "data"
    raw_dir = data_dir / "raw" / "orange"
    out_dir = data_dir / "proccessed"
    out_dir.mkdir(parents=True, exist_ok=True)
    
    # Files to read
    ccri_notes = raw_dir / "ccri" / "notes.txt"
    agronomy_notes = raw_dir / "research" / "citrus_varieties_agronomy_hectare_economics.txt"
    
    combined_text = ""
    if ccri_notes.exists():
        combined_text += ccri_notes.read_text(encoding="utf-8", errors="replace") + "\n"
    if agronomy_notes.exists():
        combined_text += agronomy_notes.read_text(encoding="utf-8", errors="replace") + "\n"
        
    if not combined_text:
        logger.warning("Could not find raw CCRI/Agronomy text files.")
        return

    # 1. Bahar Season Calendar
    bahar_data = []
    # Attempting to extract Bahar info if present in text, otherwise we structure the standard Nagpur mandarin bahars mentioned in CCRI literature.
    # We will use regex to find mentions of Ambe, Mrig, Hasta bahar flowering and harvesting.
    bahars = ["Ambia", "Mrig", "Hasta"]
    for b in bahars:
        # Look for a block of text near the bahar name
        match = re.search(fr'{b}\s*Bahar.*?flowering.*?([A-Za-z]+(?:\-[A-Za-z]+)?).*?harvest.*?([A-Za-z]+(?:\-[A-Za-z]+)?)', combined_text, re.IGNORECASE | re.DOTALL)
        if match:
            bahar_data.append({
                "Bahar_Name": b,
                "Flowering_Month": match.group(1).strip(),
                "Harvest_Window": match.group(2).strip(),
                "Source": "CCRI Notes"
            })
    
    # If regex fails due to unstructured text, we fallback to extracting sentences containing the keywords for the LLM to process later.
    if not bahar_data:
        logger.info("Using semantic sentence extraction for Bahar calendar...")
        sentences = combined_text.split('.')
        for s in sentences:
            if 'bahar' in s.lower() and ('flower' in s.lower() or 'harvest' in s.lower()):
                bahar_data.append({"Raw_Extracted_Rule": s.strip(), "Source": "CCRI Notes"})
                
    if bahar_data:
        pd_path = out_dir / "bahar_calendar.csv"
        with open(pd_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=bahar_data[0].keys())
            writer.writeheader()
            writer.writerows(bahar_data)
        logger.info(f"Saved {len(bahar_data)} Bahar season records.")

    # 2. Post-Harvest Loss and Recovery Rates
    ph_data = []
    ph_matches = re.finditer(r'post[- ]harvest loss.*?(\d{1,2}(?:\.\d+)?)\s*%', combined_text, re.IGNORECASE)
    for m in ph_matches:
        ph_data.append({"Parameter": "Post-Harvest Loss", "Value_Percent": m.group(1), "Context": m.group(0)})
        
    juice_matches = re.finditer(r'juice recovery.*?(\d{1,2}(?:\.\d+)?)\s*%', combined_text, re.IGNORECASE)
    for m in juice_matches:
        ph_data.append({"Parameter": "Juice Recovery", "Value_Percent": m.group(1), "Context": m.group(0)})
        
    if ph_data:
        ph_path = out_dir / "post_harvest_rates.csv"
        with open(ph_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=ph_data[0].keys())
            writer.writeheader()
            writer.writerows(ph_data)
        logger.info(f"Saved {len(ph_data)} Post-Harvest parameters.")
    else:
        logger.warning("No explicit post-harvest loss/recovery percentages found via regex.")

if __name__ == "__main__":
    parse_ccri_data()
