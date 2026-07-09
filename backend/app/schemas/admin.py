from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.user import RoleEnum

class AdminUserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    role: RoleEnum
    is_active: bool
    created_at: datetime
    patients_count: int = 0

    model_config = ConfigDict(from_attributes=True)

class AdminUserStatusUpdate(BaseModel):
    is_active: bool

class AdminDeviceResponse(BaseModel):
    id: int
    device_id: str
    patient_name: Optional[str] = None
    battery: int
    wifi_status: str
    firmware_version: Optional[str] = None
    last_sync: Optional[datetime] = None
    open_count: int = 0

    model_config = ConfigDict(from_attributes=True)
