from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.profiles import Patient, Doctor, Caregiver
from app.schemas.profiles import PatientCreate, PatientUpdate, DoctorCreate, DoctorUpdate, CaregiverCreate, CaregiverUpdate

class ProfileRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    # --- Patient ---
    async def get_patient_by_user_id(self, user_id: int) -> Optional[Patient]:
        result = await self.session.execute(
            select(Patient).options(selectinload(Patient.user)).where(Patient.user_id == user_id)
        )
        return result.scalars().first()

    async def create_patient(self, obj_in: PatientCreate) -> Patient:
        db_obj = Patient(**obj_in.model_dump())
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def update_patient(self, db_obj: Patient, obj_in: PatientUpdate) -> Patient:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    # --- Doctor ---
    async def get_doctor_by_user_id(self, user_id: int) -> Optional[Doctor]:
        result = await self.session.execute(
            select(Doctor).options(selectinload(Doctor.user)).where(Doctor.user_id == user_id)
        )
        return result.scalars().first()
    
    async def create_doctor(self, obj_in: DoctorCreate) -> Doctor:
        db_obj = Doctor(**obj_in.model_dump())
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    # --- Caregiver ---
    async def get_caregiver_by_user_id(self, user_id: int) -> Optional[Caregiver]:
        result = await self.session.execute(
            select(Caregiver).options(selectinload(Caregiver.user)).where(Caregiver.user_id == user_id)
        )
        return result.scalars().first()

    async def create_caregiver(self, obj_in: CaregiverCreate) -> Caregiver:
        db_obj = Caregiver(**obj_in.model_dump())
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj
