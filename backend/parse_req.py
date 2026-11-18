import csv
import sys
from pathlib import Path

CSV_PATH = Path(__file__).parent.parent / "data" / "req.csv"

with open(CSV_PATH, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    rows = list(reader)
    
print(f"Total datasets: {len(rows)}")
print(f"\nColumns: {list(rows[0].keys()) if rows else 'No rows'}")

for idx, row in enumerate(rows[:5]):
    print(f"\n--- Dataset {idx + 1} ---")
    for key, value in row.items():
        print(f"{key}: {value}")
