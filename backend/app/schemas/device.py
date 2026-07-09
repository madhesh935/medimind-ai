from typing import Optional, Any
from datetime import datetime
from pydantic import BaseModel

class SmartBottleBase(BaseModel):
    device_id: str
    battery: Optional[int] = 100
    wifi_status: Optional[str] = "disconnected"
    temperature: Optional[float] = None
    weight: Optional[float] = None
    lid_status: Optional[str] = "closed"
    firmware_version: Optional[str] = None

class SmartBottleRegister(SmartBottleBase):
    pass

class SmartBottlePair(BaseModel):
    device_id: str
    patient_id: int

class SmartBottleUpdate(BaseModel):
    battery: Optional[int] = None
    wifi_status: Optional[str] = None
    temperature: Optional[float] = None
    weight: Optional[float] = None
    lid_status: Optional[str] = None
    firmware_version: Optional[str] = None

class SmartBottleResponse(SmartBottleBase):
    id: int
    patient_id: Optional[int] = None
    last_sync: Optional[datetime] = None

    class Config:
        from_attributes = True

class BottleEventBase(BaseModel):
    event_type: str
    sensor_data: Optional[Any] = None

class BottleEventCreate(BottleEventBase):
    device_id: str

class BottleEventResponse(BottleEventBase):
    id: int
    device_id: str
    timestamp: datetime

    class Config:
        from_attributes = True
