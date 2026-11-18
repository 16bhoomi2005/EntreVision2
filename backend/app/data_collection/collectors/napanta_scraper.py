"""
NaPanta Cold Storage Scraper
============================
Scrapes the NaPanta directory for Nagpur cold storages.
"""
import requests
from bs4 import BeautifulSoup
import pandas as pd
from pathlib import Path
import re
import logging

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def scrape_napanta_cold_storages():
    url = "https://www.napanta.com/cold-storage/maharashtra/nagpur/"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    logger.info(f"Fetching data from {url}")
    response = requests.get(url, headers=headers)
    
    if response.status_code != 200:
        logger.error(f"Failed to fetch page. Status: {response.status_code}")
        return
        
    soup = BeautifulSoup(response.text, 'html.parser')
    
    storages = []
    
    # In many Next.js/React directories, list items are in standard structural tags
    # Let's look for common card structures or list elements.
    # Often, the name is in an h2 or h3. 
    # Since we don't know the exact class, we'll look for blocks of text that look like addresses or capacities.
    
    # Method 1: Check if there's a table
    tables = soup.find_all('table')
    if tables:
        df = pd.read_html(str(tables[0]))[0]
        # Clean up dataframe if it exists
        df['Source'] = 'NaPanta'
        storages_df = df
    else:
        # Method 2: Look for repetitive card structures (divs with h2/h3)
        # We will extract all text blocks and try to group them
        # Let's do a more generic approach: finding all headers and their next siblings
        items = []
        for header in soup.find_all(['h2', 'h3']):
            name = header.get_text(strip=True)
            if len(name) < 5 or "Cold Storage" not in name:
                continue
            
            # Find the parent container to get text details like Address, Capacity
            parent = header.find_parent('div')
            details = parent.get_text(separator=' | ', strip=True) if parent else ""
            
            # Try to extract capacity if mentioned (e.g., 5000 MT)
            cap_match = re.search(r'(\d+[\d,]*)\s*(MT|Metric Tonnes|Tonnes|Tons)', details, re.IGNORECASE)
            capacity = cap_match.group(0) if cap_match else "Unknown"
            
            items.append({
                "Facility_Name": name,
                "Details_Raw": details,
                "Estimated_Capacity": capacity,
                "Location": "Nagpur, Maharashtra",
                "Source": "NaPanta"
            })
            
        storages_df = pd.DataFrame(items)

    # Fallback if no structured tags found: Extract via regex from raw text
    if storages_df.empty:
        text = soup.get_text(separator='\n')
        # Look for lines containing "Cold Storage"
        lines = [line.strip() for line in text.split('\n') if 'cold storage' in line.lower() and len(line.strip()) > 5]
        # Deduplicate
        lines = list(set(lines))
        storages_df = pd.DataFrame([{"Facility_Name": line, "Location": "Nagpur, Maharashtra", "Source": "NaPanta"} for line in lines])

    if not storages_df.empty:
        base_dir = Path(__file__).resolve().parent.parent.parent.parent.parent
        out_dir = base_dir / "data" / "proccessed"
        out_dir.mkdir(parents=True, exist_ok=True)
        
        out_path = out_dir / "cold_storages_directory.csv"
        storages_df.to_csv(out_path, index=False)
        logger.info(f"Successfully scraped {len(storages_df)} records to {out_path.name}")
    else:
        logger.warning("No cold storages found on the page.")

if __name__ == "__main__":
    scrape_napanta_cold_storages()
