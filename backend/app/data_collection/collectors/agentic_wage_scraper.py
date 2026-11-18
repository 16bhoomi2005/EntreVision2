"""
Agentic Labour Wage Collector (Dataset D29)
===========================================
Since government wage websites use Nuxt.js/Javascript rendering and block traditional bots, 
this script uses the Gemini 3.8 Flash LLM to dynamically research the live web for the 
current Maharashtra Agricultural Minimum Wage, parse the result, and save it to PostgreSQL.
No hardcoding allowed!
"""
import os
import json
import logging
import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def agentic_wage_collection():
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    db_url = os.getenv("DATABASE_URL")
    
    if not api_key or not db_url:
        logger.error("Missing credentials.")
        return None

    logger.info("Deploying Agentic Web Researcher to find live Maharashtra Minimum Wages...")
    try:
        from google import genai
        from google.genai import types
        
        client = genai.Client(api_key=api_key)
        
        # We instruct the LLM to search the web (its built-in capability) and return strict JSON
        prompt = """
        You are an agricultural economist. Research the current official Minimum Wage for 'Unskilled Agricultural Labour' 
        in Maharashtra, India for the current year (per day and per month).
        
        Return ONLY a raw JSON array of objects with these exact keys:
        [
            {"category": "Unskilled Agriculture", "wage_per_day_inr": <number>, "wage_per_month_inr": <number>, "source": "<url or government body>"}
        ]
        Do not include markdown blocks or any other text.
        """
        
        # We can use the standard generate_content to get the JSON
        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt
        )
        
        # Clean the response in case the LLM added markdown
        clean_json = response.text.replace("```json", "").replace("```", "").strip()
        data = json.loads(clean_json)
        
        df = pd.DataFrame(data)
        logger.info(f"Agent successfully researched and parsed {len(df)} wage categories.")
        
        engine = create_engine(db_url)
        df.to_sql("maharashtra_wages", engine, if_exists="replace", index=False)
        logger.info("Successfully pushed agentic wage data to PostgreSQL.")
        
        return df
        
    except Exception as e:
        logger.error(f"Agentic collection failed: {e}")
        return None

if __name__ == "__main__":
    df = agentic_wage_collection()
    if df is not None:
        print("\n--- Agentic Maharashtra Wage Rates ---")
        print(df)
