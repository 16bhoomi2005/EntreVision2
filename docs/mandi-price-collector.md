# Mandi Price Collector Integration

This document describes the integration of the Agmarknet mandi-price data collector into the EntreVision application.

## Overview

The mandi-price collector fetches daily commodity prices from the data.gov.in API for Maharashtra markets. It specifically collects data for:
- Orange
- Mousambi (Sweet Lime)
- Lemon

## Architecture

The integration follows the existing application architecture:
- **Module**: `app/modules/mandi/` - Contains models, schemas, service, and routes
- **Scheduler**: `app/scheduler/` - APScheduler for daily job execution
- **Database**: Uses existing PostgreSQL database via SQLAlchemy
- **API**: RESTful endpoints for data retrieval and manual triggering

## Required Environment Variables

Add the following to your `.env` file in the `backend` directory:

```bash
# Existing variables
DATABASE_URL=postgresql://user:password@localhost/dbname

# New variables for mandi collector
DATAGOV_API_KEY=your_api_key_here
DATAGOV_RESOURCE_ID=your_resource_id_here
```

### How to Obtain API Credentials

1. **Get API Key**:
   - Visit [data.gov.in](https://data.gov.in)
   - Sign in or create an account
   - Go to "My Account" > "API key"
   - Copy your API key

2. **Get Resource ID**:
   - Search for the dataset: "Current Daily Price of Various Commodities from Various Markets (Mandi)"
   - Open the dataset page
   - Click on the "API" tab
   - Copy the Resource ID from the API endpoint URL
   - Example URL: `https://api.data.gov.in/resource/{RESOURCE_ID}/...`

## Database Schema

A new table `mandi_prices` is created with the following structure:

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| price_date | String(50) | Arrival date from API |
| state | String(100) | State name |
| district | String(100) | District name |
| market | String(200) | Market/mandi name |
| commodity | String(200) | Commodity name |
| variety | String(200) | Variety (optional) |
| grade | String(100) | Grade (optional) |
| min_price | Float | Minimum price |
| max_price | Float | Maximum price |
| modal_price | Float | Modal/most common price |
| fetched_at | DateTime | Timestamp when record was fetched |

**Unique Constraint**: `(price_date, market, commodity, variety)` - Prevents duplicate records

## API Endpoints

### GET /mandi/prices
Retrieve mandi prices with optional filters.

**Query Parameters**:
- `commodity` (optional): Filter by commodity name
- `district` (optional): Filter by district
- `market` (optional): Filter by market name
- `state` (optional): Filter by state
- `start_date` (optional): Filter by start date (YYYY-MM-DD)
- `end_date` (optional): Filter by end date (YYYY-MM-DD)
- `limit` (optional, default=100): Maximum number of records

**Example**:
```bash
curl "http://localhost:8000/mandi/prices?commodity=Orange&district=Nagpur&limit=50"
```

### POST /mandi/collect
Manually trigger the mandi price collection job.

**Example**:
```bash
curl -X POST "http://localhost:8000/mandi/collect"
```

**Response**:
```json
{
  "success": true,
  "message": "Processed 150 records in 12.34s",
  "records_processed": 150,
  "records_inserted": 120,
  "records_updated": 30,
  "errors": []
}
```

### GET /mandi/collect/status
Get information about the collection endpoint (placeholder for future enhancements).

## Daily Schedule

The collector runs automatically every day at **7:00 PM (19:00)** using APScheduler.

The scheduler is started automatically when the FastAPI application starts up and shuts down gracefully when the application stops.

**Schedule Configuration**: Located in `app/scheduler/config.py`

To change the schedule time, modify the `CronTrigger` in `start_scheduler()`:
```python
scheduler.add_job(
    scheduled_mandi_collection,
    trigger=CronTrigger(hour=19, minute=0),  # Change hour/minute as needed
    id="mandi_price_collection",
    name="Daily Mandi Price Collection",
    replace_existing=True
)
```

## Manual Execution

### Via API
Use the POST endpoint:
```bash
curl -X POST "http://localhost:8000/mandi/collect"
```

### Via Python Script
Create a script `run_collector.py`:
```python
from app.database.connection import SessionLocal
from app.modules.mandi.service import run_collector

db = SessionLocal()
try:
    result = run_collector(db)
    print(f"Success: {result.success}")
    print(f"Processed: {result.records_processed}")
    print(f"Inserted: {result.records_inserted}")
    print(f"Updated: {result.records_updated}")
    if result.errors:
        print(f"Errors: {result.errors}")
finally:
    db.close()
```

Run it:
```bash
cd backend
python run_collector.py
```

## Field Mapping

The API field names are configurable in `app/modules/mandi/service.py` via the `FIELD_MAPPING` dictionary.

If the data.gov.in API changes field names, update this mapping:
```python
FIELD_MAPPING = {
    "arrival_date": "arrival_date",    # API field -> Model field
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
```

To debug field names, set `DEBUG=True` in the environment and check the logs for a sample record.

## Error Handling

The collector handles:
- API timeouts (60s timeout)
- HTTP errors (4xx, 5xx)
- Malformed JSON responses
- Missing required fields
- Invalid price values
- Empty API responses
- Database errors

All errors are logged and included in the response when triggered manually.

## Logging

The collector uses Python's standard logging module. Logs are written to stdout with the format:
```
%(asctime)s - %(name)s - %(levelname)s - %(message)s
```

To enable debug logging, modify the logging level in `app/main.py`:
```python
logging.basicConfig(
    level=logging.DEBUG,  # Change from INFO to DEBUG
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

## Testing

Run the test suite:
```bash
cd backend
pytest tests/test_mandi_collector.py -v
```

Tests cover:
- API response parsing
- Pagination handling
- Database insertion/upsert
- Duplicate prevention
- API failure handling
- Missing/invalid price values
- Field mapping

## Troubleshooting

### API Returns 401 Unauthorized
- Verify `DATAGOV_API_KEY` is correct in `.env`
- Check if your API key is active on data.gov.in

### API Returns 404 Not Found
- Verify `DATAGOV_RESOURCE_ID` is correct
- Check if the dataset is still available on data.gov.in

### No Records Fetched
- Check if the commodities exist in the API response
- Verify the state filter ("Maharashtra") is correct
- Check logs for any parsing errors

### Duplicate Records
- The unique constraint should prevent duplicates
- If duplicates appear, check the composite key values
- Verify the `variety` field is consistent

### Scheduler Not Running
- Check application logs for scheduler startup errors
- Verify APScheduler is installed: `pip list | grep apscheduler`
- Check if the application is running (scheduler runs in-process)

### Database Connection Errors
- Verify `DATABASE_URL` is correct in `.env`
- Ensure PostgreSQL is running
- Check database credentials

## Data Flow

1. **Scheduled Trigger** (7 PM daily) or **Manual API Call**
2. **Collector Service** fetches data from data.gov.in API
3. **Pagination** handles large result sets (100 records per page)
4. **Field Mapping** converts API fields to database fields
5. **Validation** checks required fields and converts prices
6. **Upsert** inserts new records or updates existing ones
7. **Commit** saves changes to database
8. **Logging** records statistics and errors

## Security Notes

- **Never expose** `DATAGOV_API_KEY` to frontend or client-side code
- The API key is only used server-side in the service layer
- All API endpoints require proper authentication in production
- Consider adding rate limiting to the `/mandi/collect` endpoint

## Dependencies Added

- `requests==2.32.3` - HTTP client for API calls
- `apscheduler==3.10.4` - Background job scheduling
- `pytest==8.3.4` - Testing framework

## Files Changed

### New Files Created
- `backend/app/modules/mandi/__init__.py`
- `backend/app/modules/mandi/models.py`
- `backend/app/modules/mandi/schemas.py`
- `backend/app/modules/mandi/service.py`
- `backend/app/modules/mandi/routes.py`
- `backend/app/scheduler/__init__.py`
- `backend/app/scheduler/config.py`
- `backend/tests/__init__.py`
- `backend/tests/test_mandi_collector.py`
- `docs/mandi-price-collector.md`

### Modified Files
- `backend/app/main.py` - Added mandi router, scheduler, logging, and startup/shutdown events
- `backend/requirements.txt` - Added new dependencies

## Verification Commands

### Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Run Tests
```bash
cd backend
pytest tests/test_mandi_collector.py -v
```

### Start Application
```bash
cd backend
uvicorn app.main:app --reload
```

### Test API Endpoints
```bash
# Get prices
curl "http://localhost:8000/mandi/prices?limit=10"

# Manual collection
curl -X POST "http://localhost:8000/mandi/collect"

# Check database
curl "http://localhost:8000/test-db"
```

### Check Logs
The application logs will show:
- Scheduler startup
- Daily collection execution
- API fetch progress
- Database operations
- Any errors

## CSV Import Fallback

If the data.gov.in API is unavailable or inaccessible, you can use the CSV import script:

```bash
cd backend
python import_mandi_csv.py path/to/mandi_data.csv
```

The CSV import script:
- Reads CSV files downloaded from data.gov.in
- Maps CSV headers to database fields (flexible field name matching)
- Performs idempotent upserts (inserts new, updates existing)
- Handles price parsing and validation
- Reports statistics on insert/update/error counts

**CSV Headers**: The script tries multiple common header name variations:
- Arrival_Date / arrival_date / Price_Date
- State / state
- District / district
- Market / market
- Commodity / commodity
- Variety / variety
- Grade / grade
- Min_Price / min_price
- Max_Price / max_price
- Modal_Price / modal_price

**Example**:
```bash
python import_mandi_csv.py ../data/mandi_prices_2024-01-15.csv
```

## Assumptions and Limitations

1. **API Field Names**: The field mapping is based on typical data.gov.in responses. If the API changes field names, update `FIELD_MAPPING` in `service.py`.

2. **Commodity Names**: The commodities are configured as `["Orange", "Mousambi(Sweet Lime)", "Lemon"]`. Verify exact spellings in the actual API response.

3. **Rate Limiting**: The collector sleeps 1 second between API requests to respect rate limits. Adjust if needed.

4. **Pagination**: Uses 100 records per page. This can be adjusted in `fetch_commodity_data()`.

5. **Timezone**: The scheduler uses the server's local timezone. For production, consider using UTC or a specific timezone.

6. **API Availability**: The data.gov.in API may be intermittently unavailable. Use the CSV import fallback as needed.

7. **Network Connectivity**: Some networks may block access to api.data.gov.in. If the API is unreachable, use the CSV import method.

## Future Enhancements

- Add authentication to `/mandi/collect` endpoint
- Store last run status in database for better monitoring
- Add alerting for failed collections
- Support for additional states and commodities
- Historical data analysis endpoints
- Price trend calculations
- Dashboard integration in frontend
