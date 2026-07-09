from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from sqlalchemy.orm import selectinload
from typing import Any, List, Optional

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.core.audit import log_audit_event
from app.models.user import User, RoleEnum
from app.models.profiles import Patient, Doctor
from app.models.device import SmartBottle, BottleEvent
from app.models.audit import AuditLog, AuditSeverity
from app.schemas.admin import AdminUserResponse, AdminUserStatusUpdate, AdminDeviceResponse
from app.schemas.audit import AuditLogResponse

router = APIRouter()


def _require_admin(user: User) -> None:
    if user.role != RoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")


@router.get("/users", response_model=List[AdminUserResponse])
async def list_users(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    _require_admin(current_user)
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = list(result.scalars().all())

    responses: List[AdminUserResponse] = []
    for u in users:
        patients_count = 0
        if u.role == RoleEnum.DOCTOR:
            doctor_result = await db.execute(select(Doctor).where(Doctor.user_id == u.id))
            doctor = doctor_result.scalars().first()
            if doctor:
                count_result = await db.execute(select(func.count(Patient.id)).where(Patient.doctor_id == doctor.id))
                patients_count = count_result.scalar() or 0
        responses.append(AdminUserResponse(
            id=u.id, name=u.name, email=u.email, phone=u.phone, role=u.role,
            is_active=u.is_active, created_at=u.created_at, patients_count=patients_count,
        ))
    return responses


@router.put("/users/{user_id}/status", response_model=AdminUserResponse)
async def update_user_status(
    user_id: int,
    status_in: AdminUserStatusUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    _require_admin(current_user)
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = status_in.is_active
    await log_audit_event(
        db,
        actor_name=current_user.name,
        role="Admin",
        action="Reactivated user account" if status_in.is_active else "Suspended user account",
        target=user.name,
        severity=AuditSeverity.SUCCESS if status_in.is_active else AuditSeverity.DANGER,
        actor_user_id=current_user.id,
        commit=False,
    )
    await db.commit()
    await db.refresh(user)

    patients_count = 0
    if user.role == RoleEnum.DOCTOR:
        doctor_result = await db.execute(select(Doctor).where(Doctor.user_id == user.id))
        doctor = doctor_result.scalars().first()
        if doctor:
            count_result = await db.execute(select(func.count(Patient.id)).where(Patient.doctor_id == doctor.id))
            patients_count = count_result.scalar() or 0

    return AdminUserResponse(
        id=user.id, name=user.name, email=user.email, phone=user.phone, role=user.role,
        is_active=user.is_active, created_at=user.created_at, patients_count=patients_count,
    )


@router.get("/devices", response_model=List[AdminDeviceResponse])
async def list_devices(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    _require_admin(current_user)
    result = await db.execute(
        select(SmartBottle).options(selectinload(SmartBottle.patient).selectinload(Patient.user))
    )
    bottles = list(result.scalars().all())

    responses: List[AdminDeviceResponse] = []
    for b in bottles:
        open_count_result = await db.execute(
            select(func.count(BottleEvent.id)).where(BottleEvent.device_id == b.device_id, BottleEvent.event_type == "open")
        )
        open_count = open_count_result.scalar() or 0
        patient_name: Optional[str] = None
        if b.patient and b.patient.user:
            patient_name = b.patient.user.name
        responses.append(AdminDeviceResponse(
            id=b.id, device_id=b.device_id, patient_name=patient_name, battery=b.battery,
            wifi_status=b.wifi_status, firmware_version=b.firmware_version,
            last_sync=b.last_sync, open_count=open_count,
        ))
    return responses


@router.get("/audit-logs", response_model=List[AuditLogResponse])
async def list_audit_logs(
    severity: Optional[str] = None,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    _require_admin(current_user)
    query = select(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit)
    if severity:
        query = query.where(AuditLog.severity == severity)
    result = await db.execute(query)
    return list(result.scalars().all())
