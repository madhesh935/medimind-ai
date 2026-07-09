from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from sqlalchemy.orm import selectinload
from typing import Any, List

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.core.analytics import adherence_percent, latest_log, dose_status_label
from app.models.user import User, RoleEnum
from app.models.profiles import Patient, Doctor
from app.models.medicine import Medicine, MedicineStatus
from app.models.ai import AIPrediction
from app.schemas.profiles import (
    PatientResponse, PatientUpdate, DoctorResponse, DoctorUpdate,
    PatientSummary, DoctorSummary,
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

    result = await db.execute(
        select(Patient)
        .options(selectinload(Patient.user))
        .where(Patient.id == patient.id)
    )
    return result.scalars().first()


@router.get("/doctor/me", response_model=DoctorResponse)
async def get_my_doctor_profile(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    if current_user.role != RoleEnum.DOCTOR:
        raise HTTPException(status_code=403, detail="Not a doctor")

    result = await db.execute(
        select(Doctor)
        .options(selectinload(Doctor.user))
        .where(Doctor.user_id == current_user.id)
    )
    doctor = result.scalars().first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    return doctor


@router.post("/doctor/me", response_model=DoctorResponse)
async def upsert_my_doctor_profile(
    profile_in: DoctorUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    if current_user.role != RoleEnum.DOCTOR:
        raise HTTPException(status_code=403, detail="Not a doctor")

    result = await db.execute(
        select(Doctor).where(Doctor.user_id == current_user.id)
    )
    doctor = result.scalars().first()

    if doctor:
        update_data = profile_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(doctor, field, value)
    else:
        doctor = Doctor(user_id=current_user.id, **profile_in.model_dump(exclude_unset=True))
        db.add(doctor)

    await db.commit()
    await db.refresh(doctor)

    result = await db.execute(
        select(Doctor)
        .options(selectinload(Doctor.user))
        .where(Doctor.id == doctor.id)
    )
    return result.scalars().first()


@router.get("/patients", response_model=List[PatientSummary])
async def list_patients(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Real patient roster for doctors (own patients) and admins (all patients).
    Powers patients.tsx, prescriptions.tsx, and the doctor dashboard/reports roster."""
    if current_user.role == RoleEnum.DOCTOR:
        doctor_result = await db.execute(select(Doctor).where(Doctor.user_id == current_user.id))
        doctor = doctor_result.scalars().first()
        if not doctor:
            return []
        result = await db.execute(
            select(Patient).options(selectinload(Patient.user)).where(Patient.doctor_id == doctor.id)
        )
    elif current_user.role == RoleEnum.ADMIN:
        result = await db.execute(select(Patient).options(selectinload(Patient.user)))
    else:
        raise HTTPException(status_code=403, detail="Not authorized to list patients")

    patients = list(result.scalars().all())
    now = datetime.utcnow()
    summaries: List[PatientSummary] = []
    for p in patients:
        pred_result = await db.execute(select(AIPrediction).where(AIPrediction.patient_id == p.user_id))
        prediction = pred_result.scalars().first()

        meds_result = await db.execute(
            select(Medicine.medicine_name).where(Medicine.patient_id == p.id, Medicine.status == MedicineStatus.ACTIVE)
        )
        medications = [m for (m,) in meds_result.all()]

        log = await latest_log(db, p.id)
        adherence = await adherence_percent(db, p.id, now - timedelta(days=30))

        summaries.append(PatientSummary(
            id=p.id,
            user_id=p.user_id,
            name=p.user.name if p.user else "Unknown",
            email=p.user.email if p.user else "",
            dob=p.dob,
            gender=p.gender,
            doctor_id=p.doctor_id,
            risk=prediction.current_risk if prediction else "Low",
            adherence=int(adherence),
            status=dose_status_label(log),
            last_dose=log.scheduled_time.isoformat() if log else None,
            medications=medications,
        ))
    return summaries


@router.get("/doctors", response_model=List[DoctorSummary])
async def list_doctors(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Real doctor roster for admins. No rating field — there is no review/rating data
    model, so patients_count (real) is used in its place instead of a fabricated score."""
    if current_user.role != RoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to list doctors")

    result = await db.execute(select(Doctor).options(selectinload(Doctor.user)))
    doctors = list(result.scalars().all())

    summaries: List[DoctorSummary] = []
    for d in doctors:
        count_result = await db.execute(select(func.count(Patient.id)).where(Patient.doctor_id == d.id))
        patients_count = count_result.scalar() or 0
        summaries.append(DoctorSummary(
            id=d.id,
            user_id=d.user_id,
            name=d.user.name if d.user else "Unknown",
            email=d.user.email if d.user else "",
            phone=d.user.phone if d.user else None,
            hospital=d.hospital,
            specialization=d.specialization,
            status="active" if (d.user and d.user.is_active) else "suspended",
            patients_count=patients_count,
        ))
    return summaries
