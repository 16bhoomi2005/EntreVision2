"""
Parse the data requirements CSV and generate collector stubs
"""
import csv
import re
from pathlib import Path
from typing import List, Dict, Any

CSV_PATH = Path(__file__).parent.parent.parent.parent / "data" / "req.csv"


def parse_requirements() -> List[Dict[str, Any]]:
    """
    Parse the req.csv file and return list of datasets
    Handles the single-line format from Excel exports
    """
    if not CSV_PATH.exists():
        raise FileNotFoundError(f"Requirements file not found: {CSV_PATH}")
    
    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split by newlines and filter empty lines
    lines = [line.strip() for line in content.split('\n') if line.strip()]
    
    if not lines:
        raise ValueError("No data found in CSV file")
    
    # Parse header
    header = lines[0].split(',')
    datasets = []
    
    # Parse each data row
    for line in lines[1:]:
        # Split by comma but respect quoted fields
        parts = []
        current = ""
        in_quotes = False
        
        for char in line:
            if char == '"':
                in_quotes = not in_quotes
            elif char == ',' and not in_quotes:
                parts.append(current.strip('"'))
                current = ""
            else:
                current += char
        parts.append(current.strip('"'))
        
        # Create dictionary
        if len(parts) >= len(header):
            dataset = {}
            for i, col in enumerate(header):
                if i < len(parts):
                    dataset[col] = parts[i]
            datasets.append(dataset)
    
    return datasets


def categorize_by_priority(datasets: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    """Group datasets by priority"""
    categorized = {"P1": [], "P2": [], "P3": []}
    
    for dataset in datasets:
        priority = dataset.get("Priority", "P3")
        if priority in categorized:
            categorized[priority].append(dataset)
    
    return categorized


def categorize_by_access_method(datasets: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    """Group datasets by access method"""
    categorized = {}
    
    for dataset in datasets:
        method = dataset.get("Access method", "Manual")
        if method not in categorized:
            categorized[method] = []
        categorized[method].append(dataset)
    
    return categorized


def print_summary(datasets: List[Dict[str, Any]]):
    """Print summary of datasets"""
    print(f"\n{'='*80}")
    print(f"DATA COLLECTION REQUIREMENTS SUMMARY")
    print(f"{'='*80}")
    print(f"\nTotal datasets: {len(datasets)}")
    
    # By priority
    by_priority = categorize_by_priority(datasets)
    print(f"\nBy Priority:")
    for priority in ["P1", "P2", "P3"]:
        count = len(by_priority.get(priority, []))
        print(f"  {priority}: {count}")
    
    # By access method
    by_method = categorize_by_access_method(datasets)
    print(f"\nBy Access Method:")
    for method, items in by_method.items():
        print(f"  {method}: {len(items)}")
    
    # By category
    categories = {}
    for dataset in datasets:
        cat = dataset.get("Category", "Unknown")
        categories[cat] = categories.get(cat, 0) + 1
    print(f"\nBy Category:")
    for cat, count in categories.items():
        print(f"  {cat}: {count}")
    
    print(f"\n{'='*80}")
    print(f"PRIORITY 1 DATASETS (Start with these)")
    print(f"{'='*80}\n")
    
    for dataset in by_priority.get("P1", []):
        print(f"ID: {dataset.get('Dataset', 'N/A')}")
        print(f"  Category: {dataset.get('Category', 'N/A')}")
        print(f"  Access: {dataset.get('Access method', 'N/A')} ({dataset.get('Format', 'N/A')})")
        print(f"  Difficulty: {dataset.get('Difficulty', 'N/A')}")
        print(f"  Status: {dataset.get('Status', 'N/A')}")
        print()


if __name__ == "__main__":
    try:
        datasets = parse_requirements()
        print_summary(datasets)
    except Exception as e:
        print(f"Error parsing requirements: {e}")
        import traceback
        traceback.print_exc()
