from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import Any

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User, RoleEnum
from app.models.profiles import Patient, Doctor
from app.models.medicine import MedicationLog
from app.models.ai import AIPrediction
from app.models.misc import Appointment, Report
from app.models.device import SmartBottle
from app.repositories.profile_repo import ProfileRepository
from app.core.analytics import adherence_percent as _adherence_percent
from app.schemas.medicine import PatientDashboardResponse

router = APIRouter()


@router.get("/patient", response_model=PatientDashboardResponse)
async def get_patient_dashboard(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    profile_repo = ProfileRepository(db)
    patient = await profile_repo.get_patient_by_user_id(current_user.id)
    if not patient:
        return {
            "today_medicines": [],
            "weekly_adherence": 0,
            "monthly_adherence": 0,
            "risk_score": "Low",
            "recent_activity": [],
        }

    now = datetime.utcnow()
    weekly_adherence = await _adherence_percent(db, patient.id, now - timedelta(days=7))
    monthly_adherence = await _adherence_percent(db, patient.id, now - timedelta(days=30))

    pred_result = await db.execute(select(AIPrediction).where(AIPrediction.patient_id == current_user.id))
    prediction = pred_result.scalars().first()

    today_start = datetime(now.year, now.month, now.day)
    today_logs_result = await db.execute(
        select(MedicationLog)
        .where(MedicationLog.patient_id == patient.id, MedicationLog.scheduled_time >= today_start)
        .order_by(MedicationLog.scheduled_time.asc())
    )
    recent_result = await db.execute(
        select(MedicationLog)
        .where(MedicationLog.patient_id == patient.id)
        .order_by(MedicationLog.scheduled_time.desc())
        .limit(5)
    )

    return {
        "today_medicines": list(today_logs_result.scalars().all()),
        "weekly_adherence": weekly_adherence,
        "monthly_adherence": monthly_adherence,
        "risk_score": prediction.current_risk if prediction else "Low",
        "recent_activity": list(recent_result.scalars().all()),
    }


@router.get("/doctor")
async def get_doctor_dashboard(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    profile_repo = ProfileRepository(db)
    doctor = await profile_repo.get_doctor_by_user_id(current_user.id)
    if not doctor:
        return {"total_patients": 0, "high_risk_patients": 0, "upcoming_appointments": 0, "recent_reports": 0}

    patients_result = await db.execute(select(Patient).where(Patient.doctor_id == doctor.id))
    patients = list(patients_result.scalars().all())
    patient_user_ids = [p.user_id for p in patients]
    patient_ids = [p.id for p in patients]

    high_risk_patients = 0
    if patient_user_ids:
        high_risk_result = await db.execute(
            select(func.count(AIPrediction.id)).where(
                AIPrediction.patient_id.in_(patient_user_ids),
                AIPrediction.current_risk == "High",
            )
        )
        high_risk_patients = high_risk_result.scalar() or 0

    now = datetime.utcnow()
    upcoming_result = await db.execute(
        select(func.count(Appointment.id)).where(
            Appointment.doctor_id == doctor.id,
            Appointment.appointment_date >= now,
            Appointment.status == "scheduled",
        )
    )
    upcoming_appointments = upcoming_result.scalar() or 0

    recent_reports = 0
    if patient_ids:
        reports_result = await db.execute(
            select(func.count(Report.id)).where(
                Report.patient_id.in_(patient_ids),
                Report.generated_date >= now - timedelta(days=7),
            )
        )
        recent_reports = reports_result.scalar() or 0

    return {
        "total_patients": len(patients),
        "high_risk_patients": high_risk_patients,
        "upcoming_appointments": upcoming_appointments,
        "recent_reports": recent_reports,
    }


@router.get("/admin")
async def get_admin_dashboard(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    total_users_result = await db.execute(select(func.count(User.id)))
    active_doctors_result = await db.execute(
        select(func.count(User.id)).where(User.role == RoleEnum.DOCTOR, User.is_active == True)
    )
    active_patients_result = await db.execute(
        select(func.count(User.id)).where(User.role == RoleEnum.PATIENT, User.is_active == True)
    )
    connected_devices_result = await db.execute(
        select(func.count(SmartBottle.id)).where(SmartBottle.wifi_status == "connected")
    )

    return {
        "total_users": total_users_result.scalar() or 0,
        "active_doctors": active_doctors_result.scalar() or 0,
        "active_patients": active_patients_result.scalar() or 0,
        "connected_devices": connected_devices_result.scalar() or 0,
        "system_status": "Healthy",
    }
