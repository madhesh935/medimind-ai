from typing import Optional, List
from datetime import date
from pydantic import BaseModel
from app.schemas.user import User

class PatientBase(BaseModel):
    dob: Optional[date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    allergies: Optional[str] = None
    medical_history: Optional[str] = None

class PatientCreate(PatientBase):
    user_id: int
    doctor_id: Optional[int] = None

class PatientUpdate(PatientBase):
    doctor_id: Optional[int] = None

class PatientInDB(PatientBase):
    id: int
    user_id: int
    doctor_id: Optional[int] = None

    class Config:
        from_attributes = True

class PatientResponse(PatientInDB):
    user: Optional[User] = None

class DoctorBase(BaseModel):
    hospital: Optional[str] = None
    specialization: Optional[str] = None
    license_number: Optional[str] = None
    availability_status: Optional[str] = None

class DoctorCreate(DoctorBase):
    user_id: int

class DoctorUpdate(DoctorBase):
    pass

class DoctorInDB(DoctorBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class DoctorResponse(DoctorInDB):
    user: Optional[User] = None

class PatientSummary(BaseModel):
    """Composed response for the real patient roster (patients.tsx, prescriptions.tsx,
    doctor dashboard) — merges Patient columns with computed adherence/risk/status fields
    that have no single backing column."""
    id: int
    user_id: int
    name: str
    email: str
    dob: Optional[date] = None
    gender: Optional[str] = None
    doctor_id: Optional[int] = None
    risk: str = "Low"
    adherence: int = 0
    status: str = "On track"
    last_dose: Optional[str] = None
    medications: List[str] = []

class DoctorSummary(BaseModel):
    """Composed response for the admin doctor roster (doctors.tsx) — real columns plus a
    real patients_count. No rating field: there is no review/rating data model, so it is
    intentionally omitted rather than fabricated."""
    id: int
    user_id: int
    name: str
    email: str
    phone: Optional[str] = None
    hospital: Optional[str] = None
    specialization: Optional[str] = None
    status: str = "active"
    patients_count: int = 0


