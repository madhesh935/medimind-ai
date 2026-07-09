import asyncio
import random
import sys
import os
from datetime import date, datetime, timedelta

# Add the backend directory to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.core.audit import log_audit_event
from app.models.user import User, RoleEnum
from app.models.profiles import Patient, Doctor
from app.models.medicine import Medicine, MedicationLog, MedicineStatus, LogStatus
from app.models.ai import AIPrediction, AIRecommendation
from app.models.device import SmartBottle, BottleEvent
from app.models.telemedicine import Consultation
from app.models.audit import AuditSeverity

random.seed(42)


async def get_or_create_user(db: AsyncSession, email: str, name: str, role: RoleEnum) -> User:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    if user:
        return user
    user = User(email=email, name=name, password=get_password_hash("password123"), role=role)
    db.add(user)
    await db.flush()
    print(f"  Created {role.value}: {email}")
    return user


async def get_or_create_doctor(db: AsyncSession, user: User, **fields) -> Doctor:
    result = await db.execute(select(Doctor).where(Doctor.user_id == user.id))
    doctor = result.scalars().first()
    if doctor:
        return doctor
    doctor = Doctor(user_id=user.id, **fields)
    db.add(doctor)
    await db.flush()
    return doctor


async def get_or_create_patient(db: AsyncSession, user: User, **fields) -> Patient:
    result = await db.execute(select(Patient).where(Patient.user_id == user.id))
    patient = result.scalars().first()
    if patient:
        return patient
    patient = Patient(user_id=user.id, **fields)
    db.add(patient)
    await db.flush()
    return patient


async def seed_medicines_and_logs(db: AsyncSession, patient: Patient, med_specs, days: int, adherence_target: float):
    """Creates medicines + `days` of realistic MedicationLog history, skipping if this
    patient already has medicines (keeps repeated seed runs idempotent)."""
    existing = await db.execute(select(Medicine).where(Medicine.patient_id == patient.id))
    if existing.scalars().first():
        return

    medicines = []
    for name, dosage, frequency, schedule, remaining in med_specs:
        med = Medicine(
            patient_id=patient.id, medicine_name=name, dosage=dosage, frequency=frequency,
            schedule=schedule, remaining_pills=remaining, status=MedicineStatus.ACTIVE,
        )
        db.add(med)
        medicines.append(med)
    await db.flush()

    now = datetime.utcnow()
    for med in medicines:
        for day_offset in range(days, 0, -1):
            day = now - timedelta(days=day_offset)
            for time_str in med.schedule:
                hour, minute = (int(x) for x in time_str.split(":"))
                scheduled = datetime(day.year, day.month, day.day, hour, minute)
                roll = random.random()
                if roll < adherence_target:
                    status, delay = LogStatus.TAKEN, random.choice([0, 0, 0, 5, 10])
                elif roll < adherence_target + (1 - adherence_target) * 0.5:
                    status, delay = LogStatus.LATE, random.randint(15, 90)
                else:
                    status, delay = LogStatus.MISSED, 0
                db.add(MedicationLog(
                    medicine_id=med.id, patient_id=patient.id, scheduled_time=scheduled,
                    taken_time=scheduled + timedelta(minutes=delay) if status != LogStatus.MISSED else None,
                    status=status, delay_minutes=delay,
                ))
    await db.flush()


async def seed_prediction(db: AsyncSession, user_id: int, risk: str, adherence: int, summary: str):
    existing = await db.execute(select(AIPrediction).where(AIPrediction.patient_id == user_id))
    if existing.scalars().first():
        return
    prediction = AIPrediction(
        patient_id=user_id, current_risk=risk, future_risk_7d=risk, future_risk_30d=risk,
        confidence_score=random.randint(80, 97), next_miss_probability=random.randint(5, 35),
        expected_adherence=adherence, summary=summary,
    )
    db.add(prediction)
    await db.flush()
    db.add(AIRecommendation(prediction_id=prediction.id, text=summary, rec_type="EXPLAINABILITY"))


async def seed_data():
    async with SessionLocal() as db:
        admin_user = await get_or_create_user(db, "admin@medimind.ai", "Alex Morgan", RoleEnum.ADMIN)
        doctor_user = await get_or_create_user(db, "doctor@medimind.ai", "Dr. Priya Patel", RoleEnum.DOCTOR)
        patient_user = await get_or_create_user(db, "patient@medimind.ai", "John Anderson", RoleEnum.PATIENT)
        await db.commit()

        doctor = await get_or_create_doctor(
            db, doctor_user, hospital="Apollo Clinic", specialization="Internal Medicine",
            license_number="MD-48213", availability_status="available",
        )
        patient = await get_or_create_patient(
            db, patient_user, doctor_id=doctor.id, dob=date(1978, 3, 14), gender="Male",
            blood_group="O+", height=178.0, weight=82.0, allergies="Penicillin",
            medical_history="Type 2 Diabetes, Hypertension",
        )
        await db.commit()

        await seed_medicines_and_logs(
            db, patient,
            [
                ("Metformin", "500mg", "Twice a day", ["08:00", "20:00"], 24),
                ("Lisinopril", "10mg", "Once a day", ["09:00"], 18),
                ("Atorvastatin", "20mg", "Once a day", ["22:00"], 12),
                ("Aspirin", "81mg", "Once a day", ["09:00"], 30),
            ],
            days=30, adherence_target=0.88,
        )
        await seed_prediction(
            db, patient_user.id, risk="Low", adherence=88,
            summary="Adherence has been consistently strong over the last 30 days, with occasional evening delays on Metformin. Risk remains low.",
        )
        await db.commit()

        # Extra patients under the same doctor so roster/report views aren't empty.
        extra_specs = [
            ("emma.wilson@medimind.ai", "Emma Wilson", "High", 68,
             [("Metformin", "500mg", "Twice a day", ["08:00", "20:00"], 10), ("Insulin", "10U", "Once a day", ["21:00"], 8)], 0.55),
            ("robert.kim@medimind.ai", "Robert Kim", "High", 61,
             [("Tiotropium", "18mcg", "Once a day", ["08:00"], 6)], 0.5),
            ("sofia.alvarez@medimind.ai", "Sofia Alvarez", "Medium", 79,
             [("Metformin", "500mg", "Once a day", ["08:00"], 15)], 0.75),
            ("david.chen@medimind.ai", "David Chen", "Low", 94,
             [("Warfarin", "5mg", "Once a day", ["09:00"], 20), ("Atorvastatin", "40mg", "Once a day", ["22:00"], 18)], 0.92),
        ]
        for email, name, risk, adherence, meds, target in extra_specs:
            u = await get_or_create_user(db, email, name, RoleEnum.PATIENT)
            await db.commit()
            p = await get_or_create_patient(db, u, doctor_id=doctor.id, dob=date(1965, 1, 1), gender="Female")
            await db.commit()
            await seed_medicines_and_logs(db, p, meds, days=14, adherence_target=target)
            await seed_prediction(db, u.id, risk=risk, adherence=adherence, summary=f"{name.split()[0]}'s adherence trend places them at {risk.lower()} risk based on the last 14 days of logs.")
            await db.commit()

        # Smart bottle for the primary demo patient
        bottle_result = await db.execute(select(SmartBottle).where(SmartBottle.patient_id == patient.id))
        if not bottle_result.scalars().first():
            bottle = SmartBottle(
                patient_id=patient.id, device_id="SMB-001", battery=87, wifi_status="connected",
                temperature=24.5, weight=128.0, lid_status="closed", firmware_version="v2.4.1",
                last_sync=datetime.utcnow(),
            )
            db.add(bottle)
            await db.flush()
            for i in range(5):
                db.add(BottleEvent(device_id=bottle.device_id, event_type="open", timestamp=datetime.utcnow() - timedelta(hours=i * 6)))
            await db.commit()

        # One sample consultation between the demo doctor and patient
        consult_result = await db.execute(select(Consultation).where(Consultation.patient_id == patient_user.id, Consultation.doctor_id == doctor_user.id))
        if not consult_result.scalars().first():
            db.add(Consultation(
                patient_id=patient_user.id, doctor_id=doctor_user.id, status="CONFIRMED",
                consultation_type="VIDEO", scheduled_for=datetime.utcnow() + timedelta(days=2),
                consultation_notes="Routine adherence follow-up.",
            ))
            await db.commit()

        # A handful of audit-log entries so the admin audit trail isn't empty
        audit_result = await db.execute(select(User))
        if audit_result.scalars().first():
            await log_audit_event(db, actor_name="Dr. Priya Patel", role="Doctor", action="Generated prescription", target="John Anderson", severity=AuditSeverity.SUCCESS, actor_user_id=doctor_user.id, commit=False)
            await log_audit_event(db, actor_name="System", role="System", action="Smart bottle paired", target="SMB-001", severity=AuditSeverity.INFO, commit=False)
            await log_audit_event(db, actor_name="Alex Morgan", role="Admin", action="Reviewed platform health", target="System status", severity=AuditSeverity.INFO, actor_user_id=admin_user.id, commit=False)
            await db.commit()

        print("Database seeded successfully.")


if __name__ == "__main__":
    asyncio.run(seed_data())
