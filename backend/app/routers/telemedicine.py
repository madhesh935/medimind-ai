from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.core.audit import log_audit_event
from app.models.user import User, RoleEnum
from app.models.telemedicine import Consultation
from app.models.misc import Notification
from app.models.audit import AuditSeverity
from app.websocket.manager import ws_manager

router = APIRouter()

def _is_admin(user: User) -> bool:
    return user.role == RoleEnum.ADMIN

@router.get("/patient/{patient_id}")
async def get_patient_consultations(
    patient_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.id != patient_id and not _is_admin(current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this patient's consultations")
    result = await db.execute(select(Consultation).where(Consultation.patient_id == patient_id))
    return result.scalars().all()

@router.get("/doctor/{doctor_id}")
async def get_doctor_consultations(
    doctor_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.id != doctor_id and not _is_admin(current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this doctor's consultations")
    result = await db.execute(select(Consultation).where(Consultation.doctor_id == doctor_id))
    return result.scalars().all()

@router.post("/book")
async def book_consultation(
    patient_id: int,
    doctor_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    is_self_patient = current_user.role == RoleEnum.PATIENT and current_user.id == patient_id
    is_self_doctor = current_user.role == RoleEnum.DOCTOR and current_user.id == doctor_id
    if not (is_self_patient or is_self_doctor or _is_admin(current_user)):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to book this consultation")
    consultation = Consultation(
        patient_id=patient_id,
        doctor_id=doctor_id,
        status="PENDING",
        consultation_type="VIDEO"
    )
    db.add(consultation)

    patient_result = await db.execute(select(User).where(User.id == patient_id))
    patient_user = patient_result.scalars().first()
    doctor_result = await db.execute(select(User).where(User.id == doctor_id))
    doctor_user = doctor_result.scalars().first()

    db.add(Notification(
        user_id=doctor_id,
        title="New appointment booked",
        message=f"{patient_user.name if patient_user else 'A patient'} booked a consultation with you.",
        type="appointment",
    ))
    await log_audit_event(
        db,
        actor_name=patient_user.name if patient_user else "Patient",
        role="Patient",
        action="Scheduled appointment",
        target=doctor_user.name if doctor_user else None,
        severity=AuditSeverity.INFO,
        actor_user_id=patient_id,
        commit=False,
    )
    await db.commit()
    await db.refresh(consultation)

    # Broadcast to Doctor
    await ws_manager.send_personal_message({
        "type": "NEW_APPOINTMENT_BOOKED",
        "consultation_id": consultation.id,
        "patient_id": patient_id
    }, doctor_id)

    return consultation

@router.put("/{consultation_id}/status")
async def update_consultation_status(
    consultation_id: int,
    status: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Consultation).where(Consultation.id == consultation_id))
    consultation = result.scalars().first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    if current_user.id not in (consultation.patient_id, consultation.doctor_id) and not _is_admin(current_user):
        # NOTE: can't use status.HTTP_403_FORBIDDEN here — the `status` query param shadows the fastapi module in this scope
        raise HTTPException(status_code=403, detail="Not authorized to update this consultation")

    consultation.status = status
    db.add(Notification(
        user_id=consultation.patient_id,
        title="Appointment status updated",
        message=f"Your consultation status changed to {status}.",
        type="appointment",
    ))
    await log_audit_event(
        db,
        actor_name=current_user.name,
        role=current_user.role.value.capitalize(),
        action=f"Updated appointment status to {status}",
        target=f"Consultation #{consultation.id}",
        severity=AuditSeverity.INFO,
        actor_user_id=current_user.id,
        commit=False,
    )
    await db.commit()

    # Broadcast status change to patient
    await ws_manager.send_personal_message({
        "type": "APPOINTMENT_STATUS_UPDATED",
        "consultation_id": consultation.id,
        "new_status": status
    }, consultation.patient_id)

    return {"status": "success"}
