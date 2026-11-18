"""
Nominatim Facilities Scraper
============================
Fetches coordinates for MIDC and APMC in Nagpur using Nominatim Search API
(more stable than Overpass).
"""
import requests
import csv
import logging
from pathlib import Path
import time

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def search_nominatim(query: str, facility_type: str) -> list:
    url = f"https://nominatim.openstreetmap.org/search?q={query}&format=json&limit=15"
    headers = {'User-Agent': 'EntreVision-Data-Collector/1.0'}
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code == 200:
            data = response.json()
            facilities = []
            for item in data:
                facilities.append({
                    "Facility_Name": item.get("display_name", "").split(",")[0],
                    "Latitude": item.get("lat"),
                    "Longitude": item.get("lon"),
                    "Type": facility_type,
                    "Source": "OSM Nominatim API"
                })
            time.sleep(1) # Be nice to API
            return facilities
        else:
            logger.error(f"Error {response.status_code}")
            return []
    except Exception as e:
        logger.error(f"Request failed: {e}")
        return []

def run_scrapers():
    base_dir = Path(__file__).resolve().parent.parent.parent.parent.parent
    out_dir = base_dir / "data" / "proccessed"
    out_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. MIDC
    midc_queries = ["MIDC Butibori Nagpur", "MIDC Hingna Nagpur", "MIDC Kalmeshwar Nagpur", "MIDC Umred Nagpur"]
    midc_data = []
    for q in midc_queries:
        midc_data.extend(search_nominatim(q, "MIDC Industrial Area"))
        
    if midc_data:
        # Deduplicate
        midc_data = list({f['Facility_Name']: f for f in midc_data}.values())
        path = out_dir / "midc_locations.csv"
        with open(path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=midc_data[0].keys())
            writer.writeheader()
            writer.writerows(midc_data)
        logger.info(f"Saved {len(midc_data)} MIDC locations.")

    # 2. APMC
    apmc_queries = ["APMC Kalamna Nagpur", "APMC Katol Nagpur", "APMC Narkhed Nagpur", "APMC APMC Nagpur"]
    apmc_data = []
    for q in apmc_queries:
        apmc_data.extend(search_nominatim(q, "APMC Market Yard"))
        
    if apmc_data:
        apmc_data = list({f['Facility_Name']: f for f in apmc_data}.values())
        path = out_dir / "apmc_locations.csv"
        with open(path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=apmc_data[0].keys())
            writer.writeheader()
            writer.writerows(apmc_data)
        logger.info(f"Saved {len(apmc_data)} APMC locations.")

if __name__ == "__main__":
    run_scrapers()
