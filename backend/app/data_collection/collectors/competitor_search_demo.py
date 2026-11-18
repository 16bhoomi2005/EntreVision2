"""
Competitor Search Engine (Demonstration 2)
========================================
Proves how the backend can instantly find all competitors for OTHER products.
"""
import os
import logging
import pandas as pd
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def search_competitors(product_keyword):
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    
    if db_url:
        engine = create_engine(db_url)
        
        query = text("""
            SELECT company_name, scale, products 
            FROM local_competitors 
            WHERE products ILIKE :keyword
        """)
        
        with engine.connect() as conn:
            result = conn.execute(query, {"keyword": f"%{product_keyword}%"})
            df = pd.DataFrame(result.fetchall(), columns=result.keys())
            return df

if __name__ == "__main__":
    print("\n--- SEARCH: 'Cosmetics' or 'Face' ---")
    cosmetics = search_competitors("Cosmetic")
    face = search_competitors("Face")
    print(pd.concat([cosmetics, face]).drop_duplicates().to_string(index=False))
    
    print("\n--- SEARCH: 'Oil' ---")
    oil = search_competitors("Oil")
    print(oil.to_string(index=False))
    
    print("\n--- SEARCH: 'Nursery' or 'Sapling' ---")
    nursery = search_competitors("Nursery")
    sapling = search_competitors("Sapling")
    print(pd.concat([nursery, sapling]).drop_duplicates().to_string(index=False))
    
    print("\n--- SEARCH: 'Storage' or 'Packhouse' ---")
    storage = search_competitors("Storage")
    packhouse = search_competitors("Packhouse")
    print(pd.concat([storage, packhouse]).drop_duplicates().to_string(index=False))
