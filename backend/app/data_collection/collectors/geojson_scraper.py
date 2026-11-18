"""
Nagpur GeoJSON Scraper
======================
Fetches the GeoJSON boundaries for the 14 Tehsils in Nagpur District 
using the OpenStreetMap (Overpass) API.
"""
import requests
import json
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def fetch_nagpur_tehsils_geojson():
    # Overpass QL to get administrative boundaries for Nagpur's tehsils (admin_level 6)
    # Since direct out:geojson from Overpass is possible but complex for relations,
    # we use an alternative OSM to GeoJSON API like osm-boundaries.com or
    # we can use the raw OSM Nominatim API to get the polygon.
    
    logger.info("Starting geospatial extraction for Nagpur tehsils...")
    
    # List of the 14 Tehsils in Nagpur
    tehsils = [
        "Nagpur Rural", "Nagpur Urban", "Hingna", "Kamptee", "Katol",
        "Narkhed", "Saoner", "Kalmeshwar", "Ramtek", "Mouda",
        "Parseoni", "Umred", "Kuhi", "Bhiwapur"
    ]
    
    features = []
    headers = {
        'User-Agent': 'EntreVision-Data-Collector/1.0'
    }
    
    for tehsil in tehsils:
        # Query Nominatim API for the GeoJSON of each Tehsil
        # We append 'Nagpur, Maharashtra' to ensure correct resolution
        query = f"{tehsil} tehsil, Nagpur, Maharashtra"
        if tehsil == "Nagpur Urban" or tehsil == "Nagpur Rural":
            query = f"{tehsil}, Nagpur, Maharashtra"
            
        url = f"https://nominatim.openstreetmap.org/search?q={query}&format=geojson&polygon_geojson=1&limit=1"
        
        try:
            logger.info(f"Querying boundaries for: {tehsil}")
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("features"):
                    # Extract the first matching feature and add our own metadata
                    feature = data["features"][0]
                    feature["properties"] = {
                        "tehsil_name": tehsil,
                        "district": "Nagpur",
                        "state": "Maharashtra"
                    }
                    features.append(feature)
                else:
                    logger.warning(f"No boundary found for {tehsil}")
            else:
                logger.error(f"API Error for {tehsil}: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Request failed for {tehsil}: {e}")
            
    # Compile into a single FeatureCollection
    if features:
        geojson = {
            "type": "FeatureCollection",
            "features": features
        }
        
        base_dir = Path(__file__).resolve().parent.parent.parent.parent.parent
        out_dir = base_dir / "data" / "proccessed"
        out_dir.mkdir(parents=True, exist_ok=True)
        
        out_path = out_dir / "nagpur_tehsils_boundaries.geojson"
        
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(geojson, f, ensure_ascii=False, indent=2)
            
        logger.info(f"Successfully saved GeoJSON with {len(features)} tehsils to {out_path.name}")
    else:
        logger.error("Failed to compile GeoJSON - no features extracted.")

if __name__ == "__main__":
    fetch_nagpur_tehsils_geojson()
