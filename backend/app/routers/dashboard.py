from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User, RoleEnum
from app.repositories.profile_repo import ProfileRepository
from app.repositories.medicine_repo import MedicineRepository

router = APIRouter()

@router.get("/patient")
async def get_patient_dashboard(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    # In a real app, this would fetch actual analytics, risk scores, etc.
    return {
        "today_medicines": [],
        "weekly_adherence": 94,
        "monthly_adherence": 88,
        "risk_score": "Low",
        "recent_activity": []
    }

@router.get("/doctor")
async def get_doctor_dashboard(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    return {
        "total_patients": 42,
        "high_risk_patients": 5,
        "upcoming_appointments": 3,
        "pending_reports": 2
    }

@router.get("/caregiver")
async def get_caregiver_dashboard(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    return {
        "assigned_patients": 2,
        "missed_medicines": 1,
        "active_alerts": 0
    }

@router.get("/admin")
async def get_admin_dashboard(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    return {
        "total_users": 150,
        "active_doctors": 10,
        "active_patients": 120,
        "connected_devices": 85,
        "system_status": "Healthy"
    }
