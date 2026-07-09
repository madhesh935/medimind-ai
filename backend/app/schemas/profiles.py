from typing import Optional
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
    caregiver_id: Optional[int] = None

class PatientUpdate(PatientBase):
    doctor_id: Optional[int] = None
    caregiver_id: Optional[int] = None

class PatientInDB(PatientBase):
    id: int
    user_id: int
    doctor_id: Optional[int] = None
    caregiver_id: Optional[int] = None

    class Config:
        from_attributes = True

class PatientResponse(PatientInDB):
    user: Optional[User] = None

class DoctorBase(BaseModel):
    hospital: Optional[str] = None
    specialization: Optional[str] = None
    license_number: Optional[str] = None

class DoctorCreate(DoctorBase):
    user_id: int

class DoctorUpdate(DoctorBase):
    pass

class DoctorInDB(DoctorBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class CaregiverBase(BaseModel):
    relationship_to_patient: Optional[str] = None

class CaregiverCreate(CaregiverBase):
    user_id: int

class CaregiverUpdate(CaregiverBase):
    pass

class CaregiverInDB(CaregiverBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
