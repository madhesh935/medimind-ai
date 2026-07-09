from typing import Optional, Any, List
from datetime import datetime
from pydantic import BaseModel
from app.models.medicine import MedicineStatus, LogStatus

class MedicineBase(BaseModel):
    medicine_name: str
    dosage: str
    frequency: str
    schedule: Any  # JSON representation of times
    instructions: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    remaining_pills: int = 0
    status: MedicineStatus = MedicineStatus.ACTIVE
    auto_refill: bool = False

class MedicineCreate(MedicineBase):
    pass

class MedicineUpdate(BaseModel):
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    schedule: Optional[Any] = None
    instructions: Optional[str] = None
    remaining_pills: Optional[int] = None
    status: Optional[MedicineStatus] = None
    auto_refill: Optional[bool] = None

class MedicineResponse(MedicineBase):
    id: int
    patient_id: int

    class Config:
        from_attributes = True

class MedicationLogBase(BaseModel):
    scheduled_time: datetime
    status: LogStatus = LogStatus.PENDING

class MedicationLogCreate(MedicationLogBase):
    medicine_id: int
    patient_id: int

class MedicationLogUpdate(BaseModel):
    taken_time: Optional[datetime] = None
    status: Optional[LogStatus] = None
    delay_minutes: Optional[int] = None
    device_id: Optional[str] = None

class MedicationLogResponse(MedicationLogBase):
    id: int
    medicine_id: int
    patient_id: int
    taken_time: Optional[datetime] = None
    delay_minutes: int
    device_id: Optional[str] = None

    class Config:
        from_attributes = True

class PatientDashboardResponse(BaseModel):
    today_medicines: List[MedicationLogResponse]
    weekly_adherence: float
    monthly_adherence: float
    risk_score: str
    recent_activity: List[MedicationLogResponse]
