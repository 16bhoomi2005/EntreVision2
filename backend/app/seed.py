import os
import csv
from app.database.connection import SessionLocal, engine
from app.database.base import Base
from app.modules.industry.models import Industry, BusinessOpportunity


def seed_database():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. Seed Industry
        existing_industry = db.query(Industry).filter(Industry.name == "Orange").first()
        if not existing_industry:
            print("Seeding Industry: Orange...")
            industry = Industry(
                name="Orange",
                description="Nagpur Mandarin Orange ecosystem covering high-density cultivation, mechanized packhouses, food/beverage processing, by-product bio-economy, and global export aggregation.",
                region="Nagpur, Maharashtra",
                is_active=True
            )
            db.add(industry)
            db.commit()
            db.refresh(industry)
            industry_id = industry.id
            print(f"Created Industry ID: {industry_id}")
        else:
            industry_id = existing_industry.id
            print(f"Industry 'Orange' already exists with ID: {industry_id}")

        # 2. Seed Business Opportunities from CSV
        csv_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "proccessed", "opportunities.csv")
        csv_path = os.path.abspath(csv_path)

        if not os.path.exists(csv_path):
            print(f"Error: CSV not found at {csv_path}")
            return

        with open(csv_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                # Check if opportunity already exists by name
                existing_opp = db.query(BusinessOpportunity).filter(
                    BusinessOpportunity.name == row["name"],
                    BusinessOpportunity.industry_id == industry_id
                ).first()

                if not existing_opp:
                    opp = BusinessOpportunity(
                        industry_id=industry_id,
                        name=row["name"],
                        description=row["description"],
                        category=row["category"],
                        subcategory=row["subcategory"],
                        investment_level=row["investment_level"],
                        technology_level=row["technology_level"],
                        target_market=row["target_market"],
                        location_relevance=row["location_relevance"],
                        status=row["status"],
                        source=row["source"],
                        source_url=row["source_url"]
                    )
                    db.add(opp)
                    count += 1

            db.commit()
            print(f"Successfully seeded {count} new Business Opportunities into the database!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
