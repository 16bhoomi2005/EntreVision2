"""
Benchmark Interest Rates Scraper (D09)
======================================
Dynamically scrapes current policy rates (Repo Rate) from the official RBI website,
ensuring the system remains data-driven and avoids hardcoding.
"""
import requests
from bs4 import BeautifulSoup
import pandas as pd
from pathlib import Path
from datetime import datetime
import re
import urllib3
import logging

urllib3.disable_warnings()
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def scrape_rbi_rates():
    url = "https://www.rbi.org.in/"
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    logger.info(f"Fetching real-time policy rates from {url}")
    
    try:
        response = requests.get(url, headers=headers, verify=False, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        rates_data = []
        
        # RBI typically keeps policy rates in a table or block with class 'rates' or 'tablebg'
        # We will look for the text "Policy Repo Rate" and find the adjacent percentage
        repo_rate_element = soup.find(text=re.compile(r'Policy\s*Repo\s*Rate', re.IGNORECASE))
        
        if repo_rate_element:
            # Usually the rate is in the next td or span
            parent_td = repo_rate_element.find_parent('td')
            if parent_td:
                next_td = parent_td.find_next_sibling('td')
                if next_td:
                    rate_text = next_td.get_text(strip=True)
                    rate_val = re.search(r'([\d.]+)', rate_text)
                    if rate_val:
                        rates_data.append({
                            "Benchmark": "RBI Repo Rate",
                            "Rate_Percent": float(rate_val.group(1)),
                            "Effective_Date": datetime.now().strftime("%Y-%m-%d"),
                            "Source": url,
                            "Impact": "Base rate for all floating bank loans"
                        })
        
        # Fallback if DOM changed but text is present
        if not rates_data:
            text = soup.get_text(separator=' ')
            match = re.search(r'Policy\s*Repo\s*Rate\s*[:\-]?\s*([\d.]+)\s*%', text, re.IGNORECASE)
            if match:
                rates_data.append({
                    "Benchmark": "RBI Repo Rate",
                    "Rate_Percent": float(match.group(1)),
                    "Effective_Date": datetime.now().strftime("%Y-%m-%d"),
                    "Source": url,
                    "Impact": "Base rate for all floating bank loans"
                })

        return rates_data
        
    except Exception as e:
        logger.error(f"Failed to scrape RBI rates: {e}")
        return []

if __name__ == "__main__":
    rates = scrape_rbi_rates()
    if rates:
        df = pd.DataFrame(rates)
        base_dir = Path(__file__).resolve().parent.parent.parent.parent.parent / "data" / "proccessed"
        base_dir.mkdir(parents=True, exist_ok=True)
        out_path = base_dir / "benchmark_interest_rates.csv"
        df.to_csv(out_path, index=False)
        logger.info(f"Dynamically scraped and saved benchmark rates to {out_path.name}")
    else:
        logger.warning("Could not extract live rates from RBI.")
