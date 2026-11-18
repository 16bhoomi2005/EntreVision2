from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime


class MandiPriceBase(BaseModel):
    price_date: str
    state: str
    district: str
    market: str
    commodity: str
    variety: Optional[str] = None
    grade: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    modal_price: Optional[float] = None


class MandiPriceCreate(MandiPriceBase):
    pass


class MandiPriceResponse(MandiPriceBase):
    id: int
    fetched_at: datetime

    class Config:
        from_attributes = True


class MandiPriceFilter(BaseModel):
    commodity: Optional[str] = None
    district: Optional[str] = None
    market: Optional[str] = None
    state: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class CollectorRunResponse(BaseModel):
    success: bool
    message: str
    records_processed: int
    records_inserted: int
    records_updated: int
    errors: List[str] = Field(default_factory=list)
