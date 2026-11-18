import pandas as pd
import sys

df = pd.read_excel(r'c:\Users\Bhoomi Vaishya\EntreVision2\data\EntreVision_Data_Requirements.xlsx')

with open(r'c:\Users\Bhoomi Vaishya\EntreVision2\data\excel_output.txt', 'w') as f:
    f.write(f"Columns: {list(df.columns)}\n")
    f.write(f"Shape: {df.shape}\n\n")
    f.write("First 10 rows:\n")
    f.write(df.head(10).to_string())
    f.write("\n\n")
    f.write("All data:\n")
    f.write(df.to_string())
