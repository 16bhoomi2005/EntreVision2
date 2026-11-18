"""
OpenStreetMap Facilities Scraper (P1)
=====================================
Dynamically fetches the exact coordinates and locations of MIDC Industrial Estates
and APMC Mandis across Nagpur district using the Overpass API.
"""
import requests
import json
import csv
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def fetch_overpass_data(query: str, dataset_name: str) -> list:
    url = "https://overpass.kumi.systems/api/interpreter" # Alternate faster endpoint
    headers = {'User-Agent': 'EntreVision-Data-Collector/1.0'}
    
    logger.info(f"Querying OpenStreetMap for {dataset_name}...")
    try:
        response = requests.post(url, data={'data': query}, headers=headers, timeout=60)
        response.raise_for_status()
        data = response.json()
        
        facilities = []
        for element in data.get('elements', []):
            name = element.get('tags', {}).get('name', 'Unnamed Facility')
            
            # Determine coordinates whether it's a node (point) or way (polygon center)
            lat = element.get('lat') or (element.get('center', {}).get('lat'))
            lon = element.get('lon') or (element.get('center', {}).get('lon'))
            
            if lat and lon and name != 'Unnamed Facility':
                facilities.append({
                    "Facility_Name": name,
                    "Latitude": lat,
                    "Longitude": lon,
                    "Type": dataset_name,
                    "Source": "OpenStreetMap"
                })
                
        # Deduplicate by name
        unique_facilities = {f['Facility_Name']: f for f in facilities}.values()
        return list(unique_facilities)
        
    except Exception as e:
        logger.error(f"Failed to fetch {dataset_name}: {e}")
        return []

def run_scrapers():
    base_dir = Path(__file__).resolve().parent.parent.parent.parent.parent
    out_dir = base_dir / "data" / "proccessed"
    out_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. Query for MIDC / Industrial Areas in Nagpur District
    midc_query = """
    [out:json][timeout:25];
    area["name"="Nagpur"]["admin_level"="5"]->.searchArea;
    (
      nwr["landuse"="industrial"]["name"~"MIDC|Industrial",i](area.searchArea);
      nwr["name"~"MIDC|Industrial Estate",i](area.searchArea);
    );
    out center;
    """
    
    midc_data = fetch_overpass_data(midc_query, "MIDC Industrial Area")
    if midc_data:
        midc_path = out_dir / "midc_locations.csv"
        with open(midc_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=midc_data[0].keys())
            writer.writeheader()
            writer.writerows(midc_data)
        logger.info(f"Saved {len(midc_data)} MIDC locations to {midc_path.name}")
        
    # 2. Query for APMC / Mandi locations in Nagpur District
    apmc_query = """
    [out:json][timeout:25];
    area["name"="Nagpur"]["admin_level"="5"]->.searchArea;
    (
      nwr["amenity"="marketplace"]["name"~"APMC|Mandi|Market",i](area.searchArea);
      nwr["name"~"APMC|Mandi|Market Yard",i](area.searchArea);
    );
    out center;
    """
    
    apmc_data = fetch_overpass_data(apmc_query, "APMC Market Yard")
    if apmc_data:
        apmc_path = out_dir / "apmc_locations.csv"
        with open(apmc_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=apmc_data[0].keys())
            writer.writeheader()
            writer.writerows(apmc_data)
        logger.info(f"Saved {len(apmc_data)} APMC locations to {apmc_path.name}")

if __name__ == "__main__":
    run_scrapers()
