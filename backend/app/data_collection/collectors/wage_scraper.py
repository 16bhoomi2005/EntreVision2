"""
Labour Wage Rates Scraper (Dataset D29) - Bypass Anti-Bot
=========================================================
Dynamically scrapes the official minimum wages for Maharashtra 
from public databases using Pandas HTML parsing with real browser headers.
"""
import pandas as pd
import requests
import logging
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def scrape_wages():
    logger.info("Connecting to public wage database to scrape Maharashtra minimum wages...")
    
    try:
        # Sites often block the default Python user-agent. We disguise ourselves as a real Chrome browser.
        url = 'https://paycheck.in/salary/minimumwages/maharashtra'
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        # Pass the raw HTML string directly into Pandas
        tables = pd.read_html(response.text)
        
        if not tables:
            logger.error("No tables found in the HTML.")
            return None
            
        # The core data is usually the first massive table
        df = tables[0]
        logger.info(f"Successfully scraped {len(df)} wage categories.")
        
        # Clean up column names
        df.columns = [str(c).lower().replace(' ', '_').replace('/', '').replace('__', '_') for c in df.columns]
        
        return df
        
    except Exception as e:
        logger.error(f"Failed to scrape wage data: {e}")
        return None

def update_database(df: pd.DataFrame):
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    if db_url and df is not None:
        try:
            engine = create_engine(db_url)
            df.to_sql("maharashtra_wages", engine, if_exists="replace", index=False)
            logger.info(f"Successfully pushed wage data to PostgreSQL 'maharashtra_wages' table.")
        except Exception as e:
            logger.error(f"Database error: {e}")

if __name__ == "__main__":
    df = scrape_wages()
    if df is not None:
        print("\n--- Live Maharashtra Wage Rates ---")
        print(df.head())
        update_database(df)
