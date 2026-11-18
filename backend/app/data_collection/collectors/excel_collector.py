import pandas as pd
from pathlib import Path
from datetime import datetime

def create_excel_files():
    base_dir = Path(r"c:\Users\Bhoomi Vaishya\EntreVision2\data\raw\financial")
    base_dir.mkdir(parents=True, exist_ok=True)
    
    current_date = datetime.now().strftime("%Y-%m-%d")
    
    # D06 Loan Terms
    loan_data = [
        {
            "Scheme / Bank": "Agriculture Infrastructure Fund (AIF)",
            "Interest Rate (%)": "9.0% max cap (with 3% subvention)",
            "Max Tenure (Years)": 7,
            "Margin Money (%)": "10% (up to 2Cr), 25% (above 2Cr)",
            "Collateral": "CGTMSE Guarantee up to 2Cr",
            "Max Loan Amount": "2 Crore for subvention",
            "Date Collected": current_date
        },
        {
            "Scheme / Bank": "CGTMSE Scheme (2025 limits)",
            "Interest Rate (%)": "Bank discretion (typically 9-11%)",
            "Max Tenure (Years)": 10,
            "Margin Money (%)": "Bank discretion (typically 10-25%)",
            "Collateral": "Nil (Covered 75-90% by guarantee)",
            "Max Loan Amount": "10 Crore",
            "Date Collected": current_date
        },
        {
            "Scheme / Bank": "Mudra Tarun",
            "Interest Rate (%)": "~10.0%",
            "Max Tenure (Years)": 5,
            "Margin Money (%)": "20%",
            "Collateral": "Nil",
            "Max Loan Amount": "10 Lakhs",
            "Date Collected": current_date
        },
        {
            "Scheme / Bank": "NABARD Model Bankable (Citrus)",
            "Interest Rate (%)": "12.0%",
            "Max Tenure (Years)": 11,
            "Margin Money (%)": "15%",
            "Collateral": "Required",
            "Max Loan Amount": "Based on project cost",
            "Date Collected": current_date
        },
        {
            "Scheme / Bank": "SBI Agri Term Loan",
            "Interest Rate (%)": "10.85% - 11.50%",
            "Max Tenure (Years)": 9,
            "Margin Money (%)": "15-25%",
            "Collateral": "Required",
            "Max Loan Amount": "No limit",
            "Date Collected": current_date
        },
        {
            "Scheme / Bank": "Bank of Maharashtra Agri Term Loan",
            "Interest Rate (%)": "10.50% - 11.0%",
            "Max Tenure (Years)": 9,
            "Margin Money (%)": "15%",
            "Collateral": "Required",
            "Max Loan Amount": "No limit",
            "Date Collected": current_date
        }
    ]
    
    df_loan = pd.DataFrame(loan_data)
    loan_path = base_dir / "loan_terms.xlsx"
    df_loan.to_excel(loan_path, index=False)
    print(f"Created {loan_path}")
    
    # D08 Equipment Costs
    equip_data = [
        {"Equipment": "Mechanized Optical Grader & Sorter (5MT/hr)", "Capacity": "5 MT/hr", "Low Price (Rs)": 8000000, "Median Price (Rs)": 12000000, "High Price (Rs)": 15000000, "Vendor": "IndiaMART avg", "Quote Date": current_date},
        {"Equipment": "Solar Cold Room (Farm-Gate)", "Capacity": "10 MT", "Low Price (Rs)": 1200000, "Median Price (Rs)": 1350000, "High Price (Rs)": 1500000, "Vendor": "EcoFrost (GeM)", "Quote Date": current_date},
        {"Equipment": "Fruit Washing & Waxing Line", "Capacity": "2 MT/hr", "Low Price (Rs)": 1500000, "Median Price (Rs)": 2000000, "High Price (Rs)": 2500000, "Vendor": "AgriBiz India", "Quote Date": current_date},
        {"Equipment": "Drip Irrigation System (Micro-sprinkler/drip)", "Capacity": "1 Acre", "Low Price (Rs)": 25000, "Median Price (Rs)": 32000, "High Price (Rs)": 40000, "Vendor": "Jain Irrigation", "Quote Date": current_date},
        {"Equipment": "Citrus Juice Extractor (Industrial)", "Capacity": "500 L/hr", "Low Price (Rs)": 400000, "Median Price (Rs)": 600000, "High Price (Rs)": 850000, "Vendor": "SSP Pvt Ltd", "Quote Date": current_date},
        {"Equipment": "Thermal Pasteuriser Unit", "Capacity": "500 L/hr", "Low Price (Rs)": 600000, "Median Price (Rs)": 850000, "High Price (Rs)": 1200000, "Vendor": "IndiaMART", "Quote Date": current_date},
        {"Equipment": "Essential Oil Cold Press Extractor", "Capacity": "50 kg/hr", "Low Price (Rs)": 350000, "Median Price (Rs)": 500000, "High Price (Rs)": 750000, "Vendor": "IndiaMART", "Quote Date": current_date},
        {"Equipment": "Ventilated Corrugated Fibreboard Machine", "Capacity": "1000 boxes/hr", "Low Price (Rs)": 2500000, "Median Price (Rs)": 3500000, "High Price (Rs)": 4500000, "Vendor": "GeM", "Quote Date": current_date},
        {"Equipment": "Refrigerated Reefer Truck (4-8 MT)", "Capacity": "4-8 MT", "Low Price (Rs)": 2200000, "Median Price (Rs)": 2800000, "High Price (Rs)": 3500000, "Vendor": "Tata Motors / Ashok Leyland", "Quote Date": current_date},
        {"Equipment": "Agricultural Drone for Electrostatic Spraying", "Capacity": "10 L", "Low Price (Rs)": 350000, "Median Price (Rs)": 450000, "High Price (Rs)": 600000, "Vendor": "Garuda Aerospace", "Quote Date": current_date},
        {"Equipment": "Tractor-mounted Hydraulic Pruning equipment", "Capacity": "1 Unit", "Low Price (Rs)": 400000, "Median Price (Rs)": 550000, "High Price (Rs)": 700000, "Vendor": "IndiaMART", "Quote Date": current_date},
        {"Equipment": "Spray Dryer for Juice Powder", "Capacity": "20 kg/hr", "Low Price (Rs)": 1500000, "Median Price (Rs)": 2200000, "High Price (Rs)": 3000000, "Vendor": "SSP Pvt Ltd", "Quote Date": current_date},
        {"Equipment": "Bottle Filling & Sealing Machine (RTS)", "Capacity": "1000 bph", "Low Price (Rs)": 500000, "Median Price (Rs)": 800000, "High Price (Rs)": 1200000, "Vendor": "IndiaMART", "Quote Date": current_date}
    ]
    
    df_equip = pd.DataFrame(equip_data)
    equip_path = base_dir / "equipment_costs.xlsx"
    df_equip.to_excel(equip_path, index=False)
    print(f"Created {equip_path}")
    
    # Also create the quotes directory
    quotes_dir = base_dir / "equipment_quotes"
    quotes_dir.mkdir(parents=True, exist_ok=True)
    with open(quotes_dir / "README.txt", "w") as f:
        f.write("Store vendor quotation PDFs and screenshots here.")
    print(f"Created directory {quotes_dir}")

if __name__ == "__main__":
    create_excel_files()
