import pandas as pd
from pathlib import Path

def analyze_requirements():
    base_dir = Path(r"c:\Users\Bhoomi Vaishya\EntreVision2\data")
    
    # Analyze the XLSX file
    xlsx_path = base_dir / "EntreVision_Data_Requirements.xlsx"
    if xlsx_path.exists():
        print("=== EntreVision_Data_Requirements.xlsx ===")
        # Read all sheets
        xls = pd.ExcelFile(xlsx_path)
        for sheet in xls.sheet_names:
            df = pd.read_excel(xlsx_path, sheet_name=sheet)
            print(f"\nSheet: {sheet}")
            if "Dataset" in df.columns and "Status" in df.columns:
                for idx, row in df.iterrows():
                    print(f" - {row['Dataset']}: {row['Status']}")
            elif "Dataset" in df.columns:
                for idx, row in df.iterrows():
                    print(f" - {row['Dataset']}")
            else:
                print(df.head(3))
                
    # Analyze the CSV requirements folder
    csv_req_dir = base_dir / "csvrequirement"
    print("\n=== EntreVision_csvrequirement ===")
    if csv_req_dir.exists():
        for csv_file in csv_req_dir.glob("*.csv"):
            df = pd.read_csv(csv_file)
            print(f"\nFile: {csv_file.name}")
            print(f"Columns: {list(df.columns)}")
            print(f"Rows: {len(df)}")
            
    # Also check the direct datasetsrequirements.csv
    csv_path = base_dir / "datasetsrequirements.csv"
    if csv_path.exists():
        print("\n=== datasetsrequirements.csv ===")
        df = pd.read_csv(csv_path)
        print(f"Columns: {list(df.columns)}")
        print(df.head(5))

if __name__ == "__main__":
    analyze_requirements()
