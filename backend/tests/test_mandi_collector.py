import pytest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base import Base
from app.modules.mandi.models import MandiPrice
from app.modules.mandi.service import MandiPriceCollector, FIELD_MAPPING
from app.modules.mandi.schemas import MandiPriceCreate


# Test database setup
TEST_DATABASE_URL = "sqlite:///./test_mandi.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function")
def db():
    """Create a fresh database for each test"""
    Base.metadata.create_all(bind=test_engine)
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=test_engine)


class TestMandiPriceCollector:
    """Test suite for MandiPriceCollector"""

    def test_parse_record_valid(self, db):
        """Test parsing a valid API record"""
        collector = MandiPriceCollector(db)

        sample_record = {
            "arrival_date": "2024-01-15",
            "state": "Maharashtra",
            "district": "Nagpur",
            "market": "Nagpur APMC",
            "commodity": "Orange",
            "variety": "Nagpur Santra",
            "grade": "A",
            "min_price": "1500",
            "max_price": "2000",
            "modal_price": "1800"
        }

        parsed = collector.parse_record(sample_record)

        assert parsed is not None
        assert parsed.price_date == "2024-01-15"
        assert parsed.state == "Maharashtra"
        assert parsed.district == "Nagpur"
        assert parsed.market == "Nagpur APMC"
        assert parsed.commodity == "Orange"
        assert parsed.variety == "Nagpur Santra"
        assert parsed.grade == "A"
        assert parsed.min_price == 1500.0
        assert parsed.max_price == 2000.0
        assert parsed.modal_price == 1800.0

    def test_parse_record_missing_required_field(self, db):
        """Test parsing a record with missing required field"""
        collector = MandiPriceCollector(db)

        sample_record = {
            "arrival_date": "2024-01-15",
            "state": "Maharashtra",
            # Missing district
            "market": "Nagpur APMC",
            "commodity": "Orange"
        }

        parsed = collector.parse_record(sample_record)
        assert parsed is None

    def test_parse_record_invalid_price(self, db):
        """Test parsing a record with invalid price values"""
        collector = MandiPriceCollector(db)

        sample_record = {
            "arrival_date": "2024-01-15",
            "state": "Maharashtra",
            "district": "Nagpur",
            "market": "Nagpur APMC",
            "commodity": "Orange",
            "min_price": "invalid",
            "max_price": "2000",
            "modal_price": "1800"
        }

        parsed = collector.parse_record(sample_record)

        assert parsed is not None
        assert parsed.min_price is None  # Should be None for invalid price
        assert parsed.max_price == 2000.0
        assert parsed.modal_price == 1800.0

    def test_upsert_record_insert(self, db):
        """Test inserting a new record"""
        collector = MandiPriceCollector(db)

        parsed = MandiPriceCreate(
            price_date="2024-01-15",
            state="Maharashtra",
            district="Nagpur",
            market="Nagpur APMC",
            commodity="Orange",
            variety="Nagpur Santra",
            min_price=1500.0,
            max_price=2000.0,
            modal_price=1800.0
        )

        result = collector.upsert_record(parsed)
        assert result is True  # Inserted

        db.commit()

        # Verify record exists
        record = db.query(MandiPrice).filter(
            MandiPrice.price_date == "2024-01-15",
            MandiPrice.market == "Nagpur APMC",
            MandiPrice.commodity == "Orange"
        ).first()

        assert record is not None
        assert record.min_price == 1500.0

    def test_upsert_record_update(self, db):
        """Test updating an existing record (idempotent)"""
        collector = MandiPriceCollector(db)

        # First insert
        parsed = MandiPriceCreate(
            price_date="2024-01-15",
            state="Maharashtra",
            district="Nagpur",
            market="Nagpur APMC",
            commodity="Orange",
            variety="Nagpur Santra",
            min_price=1500.0,
            max_price=2000.0,
            modal_price=1800.0
        )

        collector.upsert_record(parsed)
        db.commit()

        # Update with new prices
        parsed.min_price = 1600.0
        parsed.max_price = 2100.0
        parsed.modal_price = 1900.0

        result = collector.upsert_record(parsed)
        assert result is False  # Updated, not inserted

        db.commit()

        # Verify updated values
        record = db.query(MandiPrice).filter(
            MandiPrice.price_date == "2024-01-15",
            MandiPrice.market == "Nagpur APMC",
            MandiPrice.commodity == "Orange"
        ).first()

        assert record.min_price == 1600.0
        assert record.max_price == 2100.0
        assert record.modal_price == 1900.0

    def test_duplicate_prevention(self, db):
        """Test that duplicate records are not created"""
        collector = MandiPriceCollector(db)

        parsed = MandiPriceCreate(
            price_date="2024-01-15",
            state="Maharashtra",
            district="Nagpur",
            market="Nagpur APMC",
            commodity="Orange",
            variety="Nagpur Santra",
            min_price=1500.0,
            max_price=2000.0,
            modal_price=1800.0
        )

        # Insert same record twice
        collector.upsert_record(parsed)
        collector.upsert_record(parsed)
        db.commit()

        # Count records
        count = db.query(MandiPrice).filter(
            MandiPrice.price_date == "2024-01-15",
            MandiPrice.market == "Nagpur APMC",
            MandiPrice.commodity == "Orange",
            MandiPrice.variety == "Nagpur Santra"
        ).count()

        assert count == 1  # Only one record should exist

    @patch('app.modules.mandi.service.requests.get')
    def test_fetch_commodity_data_success(self, mock_get, db):
        """Test successful API fetch with pagination"""
        collector = MandiPriceCollector(db)

        # Mock first page response
        mock_response_page1 = Mock()
        mock_response_page1.json.return_value = {
            "records": [
                {
                    "arrival_date": "2024-01-15",
                    "state": "Maharashtra",
                    "district": "Nagpur",
                    "market": "Nagpur APMC",
                    "commodity": "Orange",
                    "variety": "Nagpur Santra",
                    "min_price": "1500",
                    "max_price": "2000",
                    "modal_price": "1800"
                }
            ]
        }
        mock_response_page1.raise_for_status = Mock()

        # Mock second page response (empty to end pagination)
        mock_response_page2 = Mock()
        mock_response_page2.json.return_value = {"records": []}
        mock_response_page2.raise_for_status = Mock()

        mock_get.side_effect = [mock_response_page1, mock_response_page2]

        records = collector.fetch_commodity_data("Orange")

        assert len(records) == 1
        assert records[0]["commodity"] == "Orange"
        assert mock_get.call_count == 2

    @patch('app.modules.mandi.service.requests.get')
    def test_fetch_commodity_data_timeout(self, mock_get, db):
        """Test handling of API timeout"""
        collector = MandiPriceCollector(db)

        mock_get.side_effect = Exception("Timeout")

        records = collector.fetch_commodity_data("Orange")

        assert len(records) == 0
        assert len(collector.errors) > 0

    @patch('app.modules.mandi.service.requests.get')
    def test_fetch_commodity_data_http_error(self, mock_get, db):
        """Test handling of HTTP errors"""
        import requests
        collector = MandiPriceCollector(db)

        mock_response = Mock()
        mock_response.raise_for_status.side_effect = requests.exceptions.HTTPError("404 Not Found")
        mock_get.return_value = mock_response

        records = collector.fetch_commodity_data("Orange")

        assert len(records) == 0
        assert len(collector.errors) > 0

    @patch('app.modules.mandi.service.requests.get')
    def test_fetch_commodity_data_malformed_json(self, mock_get, db):
        """Test handling of malformed JSON"""
        collector = MandiPriceCollector(db)

        mock_response = Mock()
        mock_response.json.side_effect = ValueError("Invalid JSON")
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response

        records = collector.fetch_commodity_data("Orange")

        assert len(records) == 0
        assert len(collector.errors) > 0


class TestFieldMapping:
    """Test field mapping configuration"""

    def test_field_mapping_exists(self):
        """Test that field mapping is properly defined"""
        assert FIELD_MAPPING is not None
        assert "arrival_date" in FIELD_MAPPING
        assert "state" in FIELD_MAPPING
        assert "district" in FIELD_MAPPING
        assert "market" in FIELD_MAPPING
        assert "commodity" in FIELD_MAPPING
