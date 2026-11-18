"""
Parse the data requirements Excel file and generate a data collection plan
"""
import pandas as pd
import sys
from pathlib import Path

EXCEL_PATH = Path(__file__).parent.parent / "data" / "EntreVision_Data_Requirements.xlsx"


def parse_requirements():
    """Parse the Excel file and display dataset information"""
    if not EXCEL_PATH.exists():
        print(f"ERROR: File not found at {EXCEL_PATH}")
        sys.exit(1)

    # Read Excel file
    df = pd.read_excel(EXCEL_PATH)
    
    print(f"\n{'='*80}")
    print(f"DATA REQUIREMENTS ANALYSIS")
    print(f"{'='*80}")
    print(f"\nTotal datasets: {len(df)}")
    print(f"\nColumns: {list(df.columns)}")
    
    # Display all datasets
    print(f"\n{'='*80}")
    print(f"ALL DATASETS")
    print(f"{'='*80}\n")
    
    for idx, row in df.iterrows():
        print(f"\n--- Dataset {idx + 1} ---")
        for col in df.columns:
            value = row[col]
            if pd.notna(value):
                print(f"{col}: {value}")
    
    # Summary by category
    if 'Category' in df.columns:
        print(f"\n{'='*80}")
        print(f"SUMMARY BY CATEGORY")
        print(f"{'='*80}\n")
        print(df['Category'].value_counts())
    
    # Summary by priority
    if 'Priority' in df.columns:
        print(f"\n{'='*80}")
        print(f"SUMMARY BY PRIORITY")
        print(f"{'='*80}\n")
        print(df['Priority'].value_counts())
    
    # Summary by access method
    if 'Access method' in df.columns:
        print(f"\n{'='*80}")
        print(f"SUMMARY BY ACCESS METHOD")
        print(f"{'='*80}\n")
        print(df['Access method'].value_counts())
    
    # Summary by status
    if 'Status' in df.columns:
        print(f"\n{'='*80}")
        print(f"SUMMARY BY STATUS")
        print(f"{'='*80}\n")
        print(df['Status'].value_counts())
    
    # Save to CSV for easier processing
    csv_path = EXCEL_PATH.parent / "data_requirements.csv"
    df.to_csv(csv_path, index=False)
    print(f"\n{'='*80}")
    print(f"Saved CSV version to: {csv_path}")
    print(f"{'='*80}\n")


if __name__ == "__main__":
    parse_requirements()
