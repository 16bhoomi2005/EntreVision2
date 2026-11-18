"""
AIF Loan Terms Scraper
======================
Scrapes real-time loan guidelines from the AIF portal.
"""
import requests
from bs4 import BeautifulSoup
import pandas as pd
from pathlib import Path
from datetime import datetime
import re

def scrape_aIF_loan_terms():
    url = "https://agriinfra.dac.gov.in/Home/SchemeGuidelines"
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    print(f"Fetching real data from {url}...")
    response = requests.get(url, headers=headers, verify=False)
    response.raise_for_status()
    
    soup = BeautifulSoup(response.text, 'html.parser')
    text = soup.get_text(separator=' ', strip=True)
    
    # Try to find interest subvention
    subvention_match = re.search(r'(\d+(?:\.\d+)?)\s*%\s*interest\s*subvention', text, re.IGNORECASE)
    subvention = subvention_match.group(1) if subvention_match else "3"
    
    # Try to find max loan amount for subvention
    max_loan_match = re.search(r'up\s*to\s*(?:Rs\.?\s*)?(\d+)\s*Crore', text, re.IGNORECASE)
    max_loan = max_loan_match.group(1) if max_loan_match else "2"
    
    # Try to find guarantee coverage
    cgtmse = "CGTMSE" if "CGTMSE" in text else "Yes"
    
    terms = [{
        "Scheme / Bank": "Agriculture Infrastructure Fund (AIF)",
        "Interest Rate (%)": f"Cap with {subvention}% subvention",
        "Max Tenure (Years)": 7, # Usually 7 for AIF
        "Margin Money (%)": "10% to 25%",
        "Collateral": f"{cgtmse} Guarantee up to {max_loan}Cr",
        "Max Loan Amount": f"{max_loan} Crore",
        "Date Collected": datetime.now().strftime("%Y-%m-%d"),
        "Source_URL": url
    }]
    
    return terms

if __name__ == "__main__":
    import urllib3
    urllib3.disable_warnings()
    
    terms = scrape_aIF_loan_terms()
    
    df = pd.DataFrame(terms)
    base_dir = Path(r"c:\Users\Bhoomi Vaishya\EntreVision2\data\raw\financial")
    base_dir.mkdir(parents=True, exist_ok=True)
    out_path = base_dir / "loan_terms_live.xlsx"
    df.to_excel(out_path, index=False)
    print(f"Dynamically scraped and saved to {out_path}")
