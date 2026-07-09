from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timedelta
from typing import Any, List, Optional

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User, RoleEnum
from app.models.profiles import Patient
from app.models.medicine import Medicine, MedicationLog, MedicineStatus, LogStatus
from app.schemas.medicine import (
    MedicineResponse, MedicineCreate, MedicineUpdate,
    MedicationLogResponse, MedicationLogUpdate
)

router = APIRouter()


async def _get_patient_id(db: AsyncSession, user_id: int) -> Optional[int]:
    """Return the patient.id for a given user_id, or None if no profile exists."""
    result = await db.execute(select(Patient).where(Patient.user_id == user_id))
    patient = result.scalars().first()
    return patient.id if patient else None


@router.get("", response_model=List[MedicineResponse])
async def get_my_medicines(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    if current_user.role != RoleEnum.PATIENT:
        return []
    patient_id = await _get_patient_id(db, current_user.id)
    if patient_id is None:
        return []
    result = await db.execute(select(Medicine).where(Medicine.patient_id == patient_id))
    return list(result.scalars().all())


@router.post("/", response_model=MedicineResponse)
async def create_medicine(
    med_in: MedicineCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    db_med = Medicine(**med_in.model_dump())
    db.add(db_med)
    await db.commit()
    await db.refresh(db_med)
    return db_med


@router.put("/{med_id}", response_model=MedicineResponse)
async def update_medicine(
    med_id: int,
    med_in: MedicineUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(select(Medicine).where(Medicine.id == med_id))
    med = result.scalars().first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")
    update_data = med_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(med, field, value)
    await db.commit()
    await db.refresh(med)
    return med


@router.get("/logs/today", response_model=List[MedicationLogResponse])
async def get_todays_schedule(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    if current_user.role != RoleEnum.PATIENT:
        return []
    patient_id = await _get_patient_id(db, current_user.id)
    if patient_id is None:
        return []
    today = datetime.utcnow().date()
    start = datetime(today.year, today.month, today.day)
    end = start + timedelta(days=1)
    result = await db.execute(
        select(MedicationLog).where(
            MedicationLog.patient_id == patient_id,
            MedicationLog.scheduled_time >= start,
            MedicationLog.scheduled_time < end,
        ).order_by(MedicationLog.scheduled_time.asc())
    )
    return list(result.scalars().all())


@router.put("/logs/{log_id}", response_model=MedicationLogResponse)
async def update_log(
    log_id: int,
    log_in: MedicationLogUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(select(MedicationLog).where(MedicationLog.id == log_id))
    log = result.scalars().first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    update_data = log_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(log, field, value)
    await db.commit()
    await db.refresh(log)
    return log
