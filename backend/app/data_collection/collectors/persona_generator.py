"""
Synthetic Persona Generator
===========================
Generates the P1 Synthetic Entrepreneur Personas for DSS ranking validation.
"""
import pandas as pd
from pathlib import Path

def generate_personas():
    personas = [
        {
            "Persona_ID": "P01",
            "Description": "Recent Agri-Graduate with some family land but limited capital",
            "Capital_INR": 500000,
            "Land_Acres": 2,
            "Primary_Skill": "Agronomy knowledge",
            "Risk_Appetite": "High",
            "Target_Location": "Kalmeshwar"
        },
        {
            "Persona_ID": "P02",
            "Description": "Experienced FPO Manager looking to scale into processing",
            "Capital_INR": 2500000,
            "Land_Acres": 0, # Relying on leased facility or MIDC
            "Primary_Skill": "Supply chain & logistics",
            "Risk_Appetite": "Medium",
            "Target_Location": "Nagpur City (MIDC)"
        },
        {
            "Persona_ID": "P03",
            "Description": "Traditional Citrus Farmer wanting to reduce post-harvest losses",
            "Capital_INR": 1500000,
            "Land_Acres": 10,
            "Primary_Skill": "Farming & Harvesting",
            "Risk_Appetite": "Low",
            "Target_Location": "Warud"
        },
        {
            "Persona_ID": "P04",
            "Description": "Urban Investor seeking passive ROI in Agri-Tech/Cold Storage",
            "Capital_INR": 10000000,
            "Land_Acres": 5,
            "Primary_Skill": "Finance & Management",
            "Risk_Appetite": "Medium",
            "Target_Location": "Katol"
        },
        {
            "Persona_ID": "P05",
            "Description": "Rural Women's SHG planning a small-scale food product unit",
            "Capital_INR": 200000,
            "Land_Acres": 0,
            "Primary_Skill": "Food Preparation",
            "Risk_Appetite": "Low",
            "Target_Location": "Narkhed"
        }
    ]
    
    base_dir = Path(__file__).resolve().parent.parent.parent.parent.parent
    out_dir = base_dir / "data" / "proccessed"
    out_dir.mkdir(parents=True, exist_ok=True)
    
    df = pd.DataFrame(personas)
    out_path = out_dir / "synthetic_personas.csv"
    df.to_csv(out_path, index=False)
    print(f"Generated {len(personas)} synthetic personas at {out_path.name}")

if __name__ == "__main__":
    generate_personas()
