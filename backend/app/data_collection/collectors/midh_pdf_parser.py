"""
MIDH/NHB Cost Norms PDF Parser
============================
Extracts structured unit costs and subsidy percentages from MIDH/NHB guidelines.

Usage:
    python midh_pdf_parser.py --pdf ../../data/raw/financial/midh_nhb_norms.pdf
"""
import re
import csv
import sys
import logging
import argparse
from pathlib import Path
from typing import List, Dict, Any, Optional

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def extract_text_from_pdf(pdf_path: Path) -> str:
    text = ""
    try:
        import pdfplumber
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        logger.info(f"Extracted {len(text):,} chars from {pdf_path.name}")
        return text
    except Exception as e:
        logger.error(f"Failed to extract text: {e}")
        return ""

def parse_midh_norms(text: str) -> List[Dict[str, Any]]:
    norms = []
    # Simplified parsing for the expected format
    lines = text.split("\n")
    norm_counter = 1
    
    current_category = "General"
    
    # Patterns
    # "Cost norm: Rs. 12.50 lakh/ha"
    # "Subsidy: 50% for SC/ST, 35% for general"
    cost_pattern = r'cost\s*(?:norm|limit)?\s*(?:of|is|:)?\s*(?:Rs\.?\s*)?([\d.,]+)\s*(lakh|crore|/ha|/unit)'
    subsidy_pattern = r'(\d{1,3})\s*%\s*(?:of\s*(?:cost|project))?'
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        if "Component:" in line or "Item:" in line:
            current_category = line.split(":", 1)[1].strip()
            continue
            
        cost_match = re.search(cost_pattern, line, re.IGNORECASE)
        subsidy_match = re.search(subsidy_pattern, line, re.IGNORECASE)
        
        if cost_match or subsidy_match:
            norms.append({
                "norm_id": f"MIDH{norm_counter:04d}",
                "component": current_category,
                "cost_norm": cost_match.group(0) if cost_match else "",
                "subsidy_rate": subsidy_match.group(0) if subsidy_match else "",
                "source_text": line[:200]
            })
            norm_counter += 1
            
    return norms

def run_parser(pdf_path: Path, output_path: Path):
    if not pdf_path.exists():
        logger.error(f"PDF not found: {pdf_path}")
        return
        
    text = extract_text_from_pdf(pdf_path)
    if not text.strip():
        logger.error("No text extracted")
        return
        
    norms = parse_midh_norms(text)
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        if norms:
            writer = csv.DictWriter(f, fieldnames=norms[0].keys())
            writer.writeheader()
            for norm in norms:
                writer.writerow(norm)
    
    logger.info(f"Extracted {len(norms)} norms to {output_path}")

if __name__ == "__main__":
    BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent
    pdf_path = BASE_DIR / "data" / "raw" / "financial" / "midh_nhb_norms.pdf"
    out_path = BASE_DIR / "data" / "proccessed" / "midh_norms_parsed.csv"
    run_parser(pdf_path, out_path)
