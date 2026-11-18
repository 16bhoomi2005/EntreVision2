"""
Historical Weather API Collector (Datasets D10 & D11)
=====================================================
Uses the free Open-Meteo Historical API to fetch exactly 10 years of 
monthly rainfall and temperature data for the Nagpur citrus belt.
"""
import requests
import pandas as pd
import logging
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def fetch_weather_data(lat, lon, name, tehsil_id):
    """Hits the Open-Meteo Archive API for 10 years of monthly data."""
    logger.info(f"Fetching 10-year weather archive for {name} ({tehsil_id})...")
    
    # We query from 2014 to 2024 for monthly precipitation sum and mean temperature
    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": "2014-01-01",
        "end_date": "2024-01-01",
        "daily": ["temperature_2m_mean", "precipitation_sum"],
        "timezone": "Asia/Kolkata"
    }
    
    try:
        res = requests.get(url, params=params, timeout=15)
        res.raise_for_status()
        data = res.json()
        
        # Open-Meteo returns daily data. We will aggregate it into monthly chunks for the DSS
        df = pd.DataFrame({
            "date": pd.to_datetime(data["daily"]["time"]),
            "temperature_c": data["daily"]["temperature_2m_mean"],
            "rainfall_mm": data["daily"]["precipitation_sum"]
        })
        
        # Drop NaNs and group by Year-Month
        df = df.dropna()
        df['year_month'] = df['date'].dt.to_period('M')
        
        monthly_df = df.groupby('year_month').agg({
            'temperature_c': 'mean',
            'rainfall_mm': 'sum'
        }).reset_index()
        
        monthly_df['tehsil_id'] = tehsil_id
        monthly_df['year_month'] = monthly_df['year_month'].astype(str)
        
        return monthly_df
        
    except Exception as e:
        logger.error(f"Failed to fetch weather for {name}: {e}")
        return pd.DataFrame()

def build_climate_dataset():
    # Tehsils in the Nagpur citrus belt
    tehsils = [
        {"tehsil_id": "T02", "name": "Katol", "lat": 21.2725, "lon": 78.5866},
        {"tehsil_id": "T03", "name": "Narkhed", "lat": 21.4633, "lon": 78.5222},
        {"tehsil_id": "T04", "name": "Kalmeshwar", "lat": 21.2333, "lon": 78.9167},
    ]
    
    all_data = []
    for t in tehsils:
        df = fetch_weather_data(t["lat"], t["lon"], t["name"], t["tehsil_id"])
        if not df.empty:
            all_data.append(df)
            
    if not all_data:
        logger.error("No climate data collected.")
        return
        
    final_df = pd.concat(all_data, ignore_index=True)
    
    # Push to PostgreSQL
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        try:
            engine = create_engine(db_url)
            final_df.to_sql("climate_monthly", engine, if_exists="replace", index=False)
            logger.info(f"Successfully saved {len(final_df)} monthly climate records to PostgreSQL.")
        except Exception as e:
            logger.error(f"Database error: {e}")
            
    return final_df

if __name__ == "__main__":
    df = build_climate_dataset()
    if df is not None:
        print("\n--- 10-Year Historical Climate Data (Sample) ---")
        print(df.head(15))
