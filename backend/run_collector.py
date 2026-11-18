"""
Manual script to run the mandi price collector
Usage: python run_collector.py
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app.database.connection import SessionLocal
from app.modules.mandi.service import run_collector


def main():
    """Run the mandi price collector manually"""
    print("Starting mandi price collection...")

    # Check environment variables
    if not os.getenv("DATAGOV_API_KEY"):
        print("ERROR: DATAGOV_API_KEY environment variable not set")
        sys.exit(1)

    if not os.getenv("DATAGOV_RESOURCE_ID"):
        print("ERROR: DATAGOV_RESOURCE_ID environment variable not set")
        sys.exit(1)

    db = SessionLocal()
    try:
        result = run_collector(db)
        print(f"\n{'='*60}")
        print(f"Collection Result: {'SUCCESS' if result.success else 'FAILED'}")
        print(f"{'='*60}")
        print(f"Message: {result.message}")
        print(f"Records Processed: {result.records_processed}")
        print(f"Records Inserted: {result.records_inserted}")
        print(f"Records Updated: {result.records_updated}")

        if result.errors:
            print(f"\nErrors encountered:")
            for error in result.errors:
                print(f"  - {error}")

        sys.exit(0 if result.success else 1)

    except Exception as e:
        print(f"\nERROR: Collection failed with exception: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
