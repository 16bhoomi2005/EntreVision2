import os
import time
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
import requests

from app.modules.mandi.models import MandiPrice
from app.modules.mandi.schemas import MandiPriceCreate, CollectorRunResponse

logger = logging.getLogger(__name__)

# Configuration
DATAGOV_API_KEY = os.getenv("DATAGOV_API_KEY")
DATAGOV_RESOURCE_ID = os.getenv("DATAGOV_RESOURCE_ID")
DATAGOV_API_URL = f"https://api.data.gov.in/resource/{DATAGOV_RESOURCE_ID}"

# Target commodities for Maharashtra
COMMODITIES = ["Orange", "Mousambi(Sweet Lime)", "Lemon"]
STATE = "Maharashtra"

# Field mapping configuration - can be adjusted if API field names change
FIELD_MAPPING = {
    "arrival_date": "arrival_date",
    "state": "state",
    "district": "district",
    "market": "market",
    "commodity": "commodity",
    "variety": "variety",
    "grade": "grade",
    "min_price": "min_price",
    "max_price": "max_price",
    "modal_price": "modal_price",
}


class MandiPriceCollector:
    """Collector for Agmarknet mandi price data from data.gov.in API"""

    def __init__(self, db: Session):
        self.db = db
        self.records_processed = 0
        self.records_inserted = 0
        self.records_updated = 0
        self.errors: List[str] = []

    def fetch_commodity_data(self, commodity: str) -> List[Dict[str, Any]]:
        """
        Fetch data for a single commodity with pagination
        """
        if not DATAGOV_API_KEY:
            raise ValueError("DATAGOV_API_KEY environment variable not set")
        if not DATAGOV_RESOURCE_ID:
            raise ValueError("DATAGOV_RESOURCE_ID environment variable not set")

        all_records = []
        offset = 0
        limit = 100

        logger.info(f"Fetching data for commodity: {commodity}")

        while True:
            try:
                params = {
                    "api-key": DATAGOV_API_KEY,
                    "format": "json",
                    "limit": limit,
                    "offset": offset,
                    "filters[state]": STATE,
                    "filters[commodity]": commodity
                }

                response = requests.get(
                    DATAGOV_API_URL,
                    params=params,
                    timeout=60
                )
                response.raise_for_status()

                data = response.json()
                records = data.get("records", [])

                if not records:
                    logger.info(f"No more records for {commodity} at offset {offset}")
                    break

                all_records.extend(records)
                logger.info(f"Fetched {len(records)} records for {commodity} (offset: {offset})")

                # If fewer records than limit, we've reached the end
                if len(records) < limit:
                    break

                offset += limit
                # Rate limiting: sleep between requests
                time.sleep(1)

            except requests.exceptions.Timeout:
                error_msg = f"Timeout fetching data for {commodity} at offset {offset}"
                logger.error(error_msg)
                self.errors.append(error_msg)
                break
            except requests.exceptions.HTTPError as e:
                error_msg = f"HTTP error fetching data for {commodity}: {str(e)}"
                logger.error(error_msg)
                self.errors.append(error_msg)
                break
            except requests.exceptions.RequestException as e:
                error_msg = f"Request error fetching data for {commodity}: {str(e)}"
                logger.error(error_msg)
                self.errors.append(error_msg)
                break
            except ValueError as e:
                error_msg = f"JSON decode error for {commodity}: {str(e)}"
                logger.error(error_msg)
                self.errors.append(error_msg)
                break

        logger.info(f"Total records fetched for {commodity}: {len(all_records)}")
        return all_records

    def parse_record(self, record: Dict[str, Any]) -> Optional[MandiPriceCreate]:
        """
        Parse a single API record using field mapping
        Returns None if required fields are missing
        """
        try:
            # Extract fields using mapping
            parsed = {}
            for api_field, model_field in FIELD_MAPPING.items():
                value = record.get(api_field)
                if value is not None:
                    # Convert price strings to float
                    if model_field in ["min_price", "max_price", "modal_price"]:
                        try:
                            parsed[model_field] = float(value)
                        except (ValueError, TypeError):
                            parsed[model_field] = None
                    else:
                        parsed[model_field] = str(value).strip() if value else None

            # Validate required fields
            required_fields = ["price_date", "state", "district", "market", "commodity"]
            for field in required_fields:
                if not parsed.get(field):
                    logger.warning(f"Missing required field '{field}' in record: {record}")
                    return None

            return MandiPriceCreate(**parsed)

        except Exception as e:
            logger.error(f"Error parsing record: {str(e)}. Record: {record}")
            self.errors.append(f"Parse error: {str(e)}")
            return None

    def upsert_record(self, parsed: MandiPriceCreate) -> bool:
        """
        Insert or update a record (idempotent operation)
        Returns True if inserted, False if updated
        """
        try:
            # Check if record exists
            existing = self.db.query(MandiPrice).filter(
                MandiPrice.price_date == parsed.price_date,
                MandiPrice.market == parsed.market,
                MandiPrice.commodity == parsed.commodity,
                MandiPrice.variety == (parsed.variety or "")
            ).first()

            if existing:
                # Update existing record
                existing.state = parsed.state
                existing.district = parsed.district
                existing.variety = parsed.variety
                existing.grade = parsed.grade
                existing.min_price = parsed.min_price
                existing.max_price = parsed.max_price
                existing.modal_price = parsed.modal_price
                existing.fetched_at = datetime.utcnow()
                self.records_updated += 1
                return False
            else:
                # Insert new record
                db_record = MandiPrice(**parsed.model_dump())
                db_record.fetched_at = datetime.utcnow()
                self.db.add(db_record)
                self.records_inserted += 1
                return True

        except Exception as e:
            logger.error(f"Database error upserting record: {str(e)}")
            self.errors.append(f"Database error: {str(e)}")
            return False

    def collect_all(self) -> CollectorRunResponse:
        """
        Main method to collect data for all configured commodities
        """
        logger.info("Starting mandi price collection")
        start_time = datetime.utcnow()

        try:
            for commodity in COMMODITIES:
                logger.info(f"Processing commodity: {commodity}")
                records = self.fetch_commodity_data(commodity)

                for record in records:
                    self.records_processed += 1
                    parsed = self.parse_record(record)
                    if parsed:
                        self.upsert_record(parsed)

            # Commit all changes
            self.db.commit()
            logger.info("Database commit successful")

        except Exception as e:
            self.db.rollback()
            logger.error(f"Fatal error during collection: {str(e)}")
            self.errors.append(f"Fatal error: {str(e)}")

        duration = (datetime.utcnow() - start_time).total_seconds()
        logger.info(f"Collection completed in {duration:.2f}s")
        logger.info(f"Processed: {self.records_processed}, Inserted: {self.records_inserted}, Updated: {self.records_updated}")

        return CollectorRunResponse(
            success=len(self.errors) == 0,
            message=f"Processed {self.records_processed} records in {duration:.2f}s",
            records_processed=self.records_processed,
            records_inserted=self.records_inserted,
            records_updated=self.records_updated,
            errors=self.errors
        )


def get_mandi_prices(
    db: Session,
    commodity: Optional[str] = None,
    district: Optional[str] = None,
    market: Optional[str] = None,
    state: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = 100
) -> List[MandiPrice]:
    """
    Query mandi prices with optional filters
    """
    query = db.query(MandiPrice)

    if commodity:
        query = query.filter(MandiPrice.commodity.ilike(f"%{commodity}%"))
    if district:
        query = query.filter(MandiPrice.district.ilike(f"%{district}%"))
    if market:
        query = query.filter(MandiPrice.market.ilike(f"%{market}%"))
    if state:
        query = query.filter(MandiPrice.state.ilike(f"%{state}%"))
    if start_date:
        query = query.filter(MandiPrice.price_date >= start_date)
    if end_date:
        query = query.filter(MandiPrice.price_date <= end_date)

    return query.order_by(MandiPrice.price_date.desc()).limit(limit).all()


def run_collector(db: Session) -> CollectorRunResponse:
    """
    Convenience function to run the collector
    """
    collector = MandiPriceCollector(db)
    return collector.collect_all()
