"""
Distance & Logistics Calculator (Dataset D18)
=============================================
Uses the Open Source Routing Machine (OSRM) API to dynamically calculate 
the real driving distance (km) and travel time (minutes) between 
Nagpur's tehsils and the major APMC Mandis.
"""
import requests
import pandas as pd
import logging
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv
import time

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def get_driving_distance(lon1, lat1, lon2, lat2):
    """Hits the OSRM public API to get driving distance and time."""
    url = f"http://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=false"
    try:
        res = requests.get(url, timeout=10)
        res.raise_for_status()
        data = res.json()
        if data.get("code") == "Ok":
            route = data["routes"][0]
            distance_km = route["distance"] / 1000.0
            duration_min = route["duration"] / 60.0
            return distance_km, duration_min
    except Exception as e:
        logger.error(f"OSRM API Error: {e}")
    return None, None

def build_logistics_dataset():
    # Load coordinates from our database or existing CSVs
    # For demonstration, we will use known approximate coordinates of Nagpur tehsils
    tehsils = [
        {"tehsil_id": "T01", "name": "Nagpur Urban", "lat": 21.1458, "lon": 79.0882},
        {"tehsil_id": "T02", "name": "Katol", "lat": 21.2725, "lon": 78.5866},
        {"tehsil_id": "T03", "name": "Narkhed", "lat": 21.4633, "lon": 78.5222},
        {"tehsil_id": "T04", "name": "Kalmeshwar", "lat": 21.2333, "lon": 78.9167},
    ]
    
    mandis = [
        {"site_id": "M01", "name": "Kalamna APMC", "lat": 21.1611, "lon": 79.1369},
        {"site_id": "M02", "name": "Katol APMC", "lat": 21.2750, "lon": 78.5900},
    ]
    
    results = []
    
    logger.info("Calculating logistics matrix via OSRM...")
    for t in tehsils:
        for m in mandis:
            logger.info(f"Routing: {t['name']} -> {m['name']}")
            dist_km, dur_min = get_driving_distance(t["lon"], t["lat"], m["lon"], m["lat"])
            
            if dist_km is not None:
                results.append({
                    "from_tehsil_id": t["tehsil_id"],
                    "to_site_id": m["site_id"],
                    "distance_km": round(dist_km, 2),
                    "travel_minutes": round(dur_min, 1)
                })
            
            # Sleep to respect public API rate limits
            time.sleep(1.5)
            
    df = pd.DataFrame(results)
    
    # Save to PostgreSQL
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    if db_url and not df.empty:
        try:
            engine = create_engine(db_url)
            df.to_sql("distances", engine, if_exists="replace", index=False)
            logger.info(f"Successfully saved {len(df)} logistics routes to PostgreSQL.")
        except Exception as e:
            logger.error(f"DB Error: {e}")
            
    return df

if __name__ == "__main__":
    df = build_logistics_dataset()
    print("\n--- Logistics Distance Matrix (Sample) ---")
    print(df)
