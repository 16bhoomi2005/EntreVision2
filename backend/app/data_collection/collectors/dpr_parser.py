"""
DPR Model Parser
============================
Extracts structured financial calibration data (Capex, Margins, IRR, DSCR) 
from reference DPR/Bankable Project text files.
"""
import re
import csv
import sys
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def parse_dpr_file(file_path: Path):
    text = file_path.read_text(encoding="utf-8")
    
    data = {
        "project_name": "Unknown",
        "capex_inr": None,
        "farmer_equity_inr": None,
        "subsidy_inr": None,
        "bank_loan_inr": None,
        "irr_percent": None,
        "dscr": None,
        "payback_years": None,
        "break_even_percent": None,
        "source": file_path.name
    }
    
    # Extract project name
    title_match = re.search(r'Source Title:\s*(.+)', text)
    if title_match:
        data["project_name"] = title_match.group(1).strip()
        
    # Extract financial metrics using regex
    cost_match = re.search(r'TOTAL PROJECT COST.*?Rs\.\s*([\d.]+)\s*Thousand', text)
    if cost_match:
        data["capex_inr"] = float(cost_match.group(1)) * 1000
        
    equity_match = re.search(r'Farmer\'s Equity Share.*?Rs\.\s*([\d.]+)\s*Thousand', text)
    if equity_match:
        data["farmer_equity_inr"] = float(equity_match.group(1)) * 1000
        
    subsidy_match = re.search(r'Government Capital Subsidy.*?Rs\.\s*([\d.]+)\s*Thousand', text)
    if subsidy_match:
        data["subsidy_inr"] = float(subsidy_match.group(1)) * 1000
        
    loan_match = re.search(r'Bank Term Loan.*?Rs\.\s*([\d.]+)\s*Thousand', text)
    if loan_match:
        data["bank_loan_inr"] = float(loan_match.group(1)) * 1000
        
    irr_match = re.search(r'Internal Rate of Return \(IRR\):\s*([\d.]+)%', text)
    if irr_match:
        data["irr_percent"] = float(irr_match.group(1))
        
    dscr_match = re.search(r'Average Debt Service Coverage Ratio \(DSCR\):\s*([\d.]+)', text)
    if dscr_match:
        data["dscr"] = float(dscr_match.group(1))
        
    payback_match = re.search(r'Payback Period:\s*([\d.]+)\s*Years', text)
    if payback_match:
        data["payback_years"] = float(payback_match.group(1))
        
    be_match = re.search(r'Break-even Point:.*?([\d.]+)%\s*of', text)
    if be_match:
        data["break_even_percent"] = float(be_match.group(1))

    return data


def run_parser(input_dir: Path, output_path: Path):
    if not input_dir.exists():
        logger.error(f"Input dir not found: {input_dir}")
        return
        
    all_dpr_data = []
    
    # Process all txt files that look like DPR models
    for txt_file in input_dir.glob("*.txt"):
        if "model" in txt_file.name.lower() or "dpr" in txt_file.name.lower():
            logger.info(f"Parsing DPR file: {txt_file.name}")
            parsed = parse_dpr_file(txt_file)
            all_dpr_data.append(parsed)
            
    if all_dpr_data:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=all_dpr_data[0].keys())
            writer.writeheader()
            for d in all_dpr_data:
                writer.writerow(d)
        logger.info(f"Saved {len(all_dpr_data)} DPR models to {output_path}")
    else:
        logger.warning("No DPR data found to parse.")

if __name__ == "__main__":
    BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent
    in_dir = BASE_DIR / "data" / "raw" / "orange" / "government"
    out_path = BASE_DIR / "data" / "proccessed" / "reference_dprs.csv"
    run_parser(in_dir, out_path)
