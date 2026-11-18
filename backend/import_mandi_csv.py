"""
Fallback script to import mandi price data from CSV
Use this if the data.gov.in API is unavailable
"""
import os
import csv
import sys
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

from app.database.connection import SessionLocal
from app.modules.mandi.models import MandiPrice


def import_csv(csv_path: str):
    """
    Import mandi price data from CSV file
    CSV should have headers matching the API fields
    """
    if not os.path.exists(csv_path):
        print(f"ERROR: CSV file not found at {csv_path}")
        sys.exit(1)

    db = SessionLocal()
    try:
        with open(csv_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            
            inserted = 0
            updated = 0
            errors = 0

            for row in reader:
                try:
                    # Map CSV fields to database fields
                    # Adjust field names based on your CSV headers
                    price_date = row.get("Arrival_Date") or row.get("arrival_date") or row.get("Price_Date")
                    state = row.get("State") or row.get("state")
                    district = row.get("District") or row.get("district")
                    market = row.get("Market") or row.get("market")
                    commodity = row.get("Commodity") or row.get("commodity")
                    variety = row.get("Variety") or row.get("variety")
                    grade = row.get("Grade") or row.get("grade")
                    
                    # Parse prices
                    min_price = parse_price(row.get("Min_Price") or row.get("min_price"))
                    max_price = parse_price(row.get("Max_Price") or row.get("max_price"))
                    modal_price = parse_price(row.get("Modal_Price") or row.get("modal_price"))

                    # Validate required fields
                    if not all([price_date, state, district, market, commodity]):
                        print(f"WARNING: Skipping row with missing required fields: {row}")
                        errors += 1
                        continue

                    # Check if record exists
                    existing = db.query(MandiPrice).filter(
                        MandiPrice.price_date == price_date,
                        MandiPrice.market == market,
                        MandiPrice.commodity == commodity,
                        MandiPrice.variety == (variety or "")
                    ).first()

                    if existing:
                        # Update
                        existing.state = state
                        existing.district = district
                        existing.variety = variety
                        existing.grade = grade
                        existing.min_price = min_price
                        existing.max_price = max_price
                        existing.modal_price = modal_price
                        existing.fetched_at = datetime.utcnow()
                        updated += 1
                    else:
                        # Insert
                        record = MandiPrice(
                            price_date=price_date,
                            state=state,
                            district=district,
                            market=market,
                            commodity=commodity,
                            variety=variety,
                            grade=grade,
                            min_price=min_price,
                            max_price=max_price,
                            modal_price=modal_price,
                            fetched_at=datetime.utcnow()
                        )
                        db.add(record)
                        inserted += 1

                except Exception as e:
                    print(f"ERROR processing row: {str(e)}. Row: {row}")
                    errors += 1

            db.commit()
            
            print(f"\n{'='*60}")
            print(f"Import Complete")
            print(f"{'='*60}")
            print(f"Records Inserted: {inserted}")
            print(f"Records Updated: {updated}")
            print(f"Errors: {errors}")
            print(f"{'='*60}")

    except Exception as e:
        db.rollback()
        print(f"ERROR: Import failed: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


def parse_price(value):
    """Parse price string to float"""
    if not value:
        return None
    try:
        # Remove any non-numeric characters except decimal point
        cleaned = str(value).replace(",", "").strip()
        return float(cleaned) if cleaned else None
    except (ValueError, TypeError):
        return None


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python import_mandi_csv.py <csv_file_path>")
        print("\nExample:")
        print("  python import_mandi_csv.py ../data/mandi_prices_2024-01-15.csv")
        sys.exit(1)

    csv_path = sys.argv[1]
    print(f"Importing from: {csv_path}")
    import_csv(csv_path)
