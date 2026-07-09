from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timedelta

from app.models.medicine import Medicine, MedicationLog, LogStatus
from app.schemas.medicine import MedicineCreate, MedicineUpdate, MedicationLogCreate, MedicationLogUpdate

class MedicineRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_medicines_for_patient(self, patient_id: int) -> List[Medicine]:
        result = await self.session.execute(
            select(Medicine).where(Medicine.patient_id == patient_id)
        )
        return list(result.scalars().all())

    async def get_medicine_by_id(self, med_id: int) -> Optional[Medicine]:
        result = await self.session.execute(
            select(Medicine).where(Medicine.id == med_id)
        )
        return result.scalars().first()

    async def create_medicine(self, obj_in: MedicineCreate) -> Medicine:
        db_obj = Medicine(**obj_in.model_dump())
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def update_medicine(self, db_obj: Medicine, obj_in: MedicineUpdate) -> Medicine:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    # --- Logs ---
    async def create_log(self, obj_in: MedicationLogCreate) -> MedicationLog:
        db_obj = MedicationLog(**obj_in.model_dump())
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def update_log(self, log_id: int, obj_in: MedicationLogUpdate) -> Optional[MedicationLog]:
        result = await self.session.execute(select(MedicationLog).where(MedicationLog.id == log_id))
        db_obj = result.scalars().first()
        if not db_obj: return None
        
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def get_todays_logs(self, patient_id: int) -> List[MedicationLog]:
        # Simple implementation for "today". In reality, handle timezones.
        today = datetime.utcnow().date()
        start = datetime(today.year, today.month, today.day)
        end = start + timedelta(days=1)
        result = await self.session.execute(
            select(MedicationLog).where(
                MedicationLog.patient_id == patient_id,
                MedicationLog.scheduled_time >= start,
                MedicationLog.scheduled_time < end
            ).order_by(MedicationLog.scheduled_time.asc())
        )
        return list(result.scalars().all())
