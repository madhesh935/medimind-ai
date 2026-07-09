from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import Any

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User, RoleEnum
from app.models.profiles import Patient, Doctor, Caregiver
from app.schemas.profiles import (
    PatientResponse, PatientUpdate,
)

router = APIRouter()


@router.get("/patient/me", response_model=PatientResponse)
async def get_my_patient_profile(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    if current_user.role != RoleEnum.PATIENT:
        raise HTTPException(status_code=403, detail="Not a patient")

    result = await db.execute(
        select(Patient)
        .options(selectinload(Patient.user))
        .where(Patient.user_id == current_user.id)
    )
    patient = result.scalars().first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    return patient


@router.post("/patient/me", response_model=PatientResponse)
async def upsert_my_patient_profile(
    profile_in: PatientUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    if current_user.role != RoleEnum.PATIENT:
        raise HTTPException(status_code=403, detail="Not a patient")

    result = await db.execute(
        select(Patient).where(Patient.user_id == current_user.id)
    )
    patient = result.scalars().first()

    if patient:
        update_data = profile_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(patient, field, value)
    else:
        patient = Patient(user_id=current_user.id, **profile_in.model_dump(exclude_unset=True))
        db.add(patient)

    await db.commit()
    await db.refresh(patient)

    # Re-fetch with user loaded
    result = await db.execute(
        select(Patient)
        .options(selectinload(Patient.user))
        .where(Patient.id == patient.id)
    )
    return result.scalars().first()
