"""
IndiaMART Equipment Cost Parser
===============================
Parses manually saved IndiaMART search result HTML files to extract 
equipment names, prices, and vendor details dynamically.

Usage:
    1. Go to indiamart.com and search for equipment (e.g., "optical sorter")
    2. Save the webpage as HTML (Ctrl+S) into:
       data/raw/financial/equipment_quotes/indiamart_exports/
    3. Run this script:
       python indiamart_parser.py
"""
import re
import csv
import logging
from pathlib import Path
from bs4 import BeautifulSoup
from datetime import datetime

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def extract_price(price_str: str) -> float:
    """Extract numeric price from strings like '₹ 12 Lakh/ Unit' or 'Rs 85,000'"""
    if not price_str:
        return 0.0
    
    # Remove currency symbols and commas
    cleaned = re.sub(r'[^\d.LakhCrore\s]', '', price_str, flags=re.IGNORECASE)
    
    # Extract base number
    num_match = re.search(r'([\d.]+)', cleaned)
    if not num_match:
        return 0.0
        
    base_val = float(num_match.group(1))
    
    # Handle Lakh / Crore text multipliers
    if 'lakh' in price_str.lower():
        base_val *= 1_00_000
    elif 'crore' in price_str.lower():
        base_val *= 1_00_00_000
        
    return base_val

def parse_indiamart_html(html_file: Path) -> list:
    """Parse a single IndiaMART HTML file to extract product listings."""
    logger.info(f"Parsing {html_file.name}...")
    
    try:
        with open(html_file, 'r', encoding='utf-8', errors='replace') as f:
            soup = BeautifulSoup(f, 'html.parser')
            
        products = []
        
        # IndiaMART typically uses sections or divs for product cards
        # We look for common price identifiers in the DOM
        cards = soup.find_all(lambda tag: tag.name == 'div' and tag.find(text=re.compile(r'(?:₹|Rs\.?)\s*[\d,]+')))
        
        # Deduplicate cards to avoid double counting nested elements
        seen_titles = set()
        
        for card in cards:
            # Try to find Title
            title_elem = card.find(['h2', 'h3', 'a', 'span'], class_=re.compile(r'title|name|desc', re.I))
            if not title_elem:
                title_elem = card
                
            title = title_elem.get_text(strip=True)[:100]
            
            if len(title) < 5 or title in seen_titles:
                continue
                
            # Try to find Price
            price_elem = card.find(text=re.compile(r'(?:₹|Rs\.?)\s*[\d,]+'))
            if not price_elem:
                continue
                
            raw_price = price_elem.strip()
            num_price = extract_price(raw_price)
            
            if num_price > 0:
                seen_titles.add(title)
                products.append({
                    "Equipment_Title": title,
                    "Raw_Price_String": raw_price,
                    "Parsed_Price_INR": num_price,
                    "Vendor": "IndiaMART Listing",
                    "Source_File": html_file.name,
                    "Date_Parsed": datetime.now().strftime("%Y-%m-%d")
                })
                
        logger.info(f"  -> Extracted {len(products)} viable product quotes.")
        return products
        
    except Exception as e:
        logger.error(f"Error parsing {html_file.name}: {e}")
        return []

def run_parser():
    base_dir = Path(__file__).resolve().parent.parent.parent.parent.parent
    data_dir = base_dir / "data"
    html_dir = base_dir / "data" / "raw" / "financial" / "equipment_quotes" / "indiamart_exports"
    out_path = base_dir / "data" / "proccessed" / "parsed_equipment_quotes.csv"
    
    html_dir.mkdir(parents=True, exist_ok=True)
    
    # Check both the specific exports dir and the root data dir for HTML/MHTML files
    files = list(html_dir.glob("*.html")) + list(html_dir.glob("*.mhtml"))
    files += list(data_dir.glob("*.html")) + list(data_dir.glob("*.mhtml"))
    
    if not files:
        logger.warning("No HTML/MHTML files found.")
        return
        
    all_quotes = []
    for h_file in files:
        quotes = parse_indiamart_html(h_file)
        all_quotes.extend(quotes)
        
    if all_quotes:
        out_path.parent.mkdir(parents=True, exist_ok=True)
        with open(out_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=all_quotes[0].keys())
            writer.writeheader()
            writer.writerows(all_quotes)
        logger.info(f"Successfully saved {len(all_quotes)} aggregated equipment quotes to {out_path.name}")
    else:
        logger.warning("No valid quotes could be extracted from the provided HTML files.")

if __name__ == "__main__":
    run_parser()
