from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.connection import SessionLocal
from app.modules.mandi import service, schemas

router = APIRouter(prefix="/mandi", tags=["Mandi Prices"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/prices", response_model=List[schemas.MandiPriceResponse])
def get_mandi_prices(
    commodity: Optional[str] = None,
    district: Optional[str] = None,
    market: Optional[str] = None,
    state: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get mandi prices with optional filters
    """
    return service.get_mandi_prices(
        db=db,
        commodity=commodity,
        district=district,
        market=market,
        state=state,
        start_date=start_date,
        end_date=end_date,
        limit=limit
    )


@router.post("/collect", response_model=schemas.CollectorRunResponse)
def trigger_collection(db: Session = Depends(get_db)):
    """
    Manually trigger the mandi price collection job
    This endpoint allows administrators to fetch the latest prices without waiting for the scheduled job
    """
    try:
        result = service.run_collector(db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Collection failed: {str(e)}")


@router.get("/collect/status", response_model=schemas.CollectorRunResponse)
def get_collection_status(db: Session = Depends(get_db)):
    """
    Get the status of the last collection run
    (This is a placeholder - in production you might want to store last run status in the database)
    """
    return schemas.CollectorRunResponse(
        success=True,
        message="Use POST /mandi/collect to trigger a new collection",
        records_processed=0,
        records_inserted=0,
        records_updated=0
    )
