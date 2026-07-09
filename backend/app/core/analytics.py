from datetime import datetime
from typing import Optional
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.medicine import MedicationLog, LogStatus


async def adherence_percent(db: AsyncSession, patient_id: int, since: datetime) -> float:
    """Percent of scheduled doses taken since `since`, based on real MedicationLog rows."""
    result = await db.execute(
        select(MedicationLog.status, func.count(MedicationLog.id))
        .where(MedicationLog.patient_id == patient_id, MedicationLog.scheduled_time >= since)
        .group_by(MedicationLog.status)
    )
    counts = {status: count for status, count in result.all()}
    total = sum(counts.values())
    if total == 0:
        return 0.0
    taken = counts.get(LogStatus.TAKEN, 0)
    return round((taken / total) * 100)


async def latest_log(db: AsyncSession, patient_id: int) -> Optional[MedicationLog]:
    """Most recent MedicationLog row for a patient, used to derive last-dose status."""
    result = await db.execute(
        select(MedicationLog)
        .where(MedicationLog.patient_id == patient_id)
        .order_by(MedicationLog.scheduled_time.desc())
        .limit(1)
    )
    return result.scalars().first()


def dose_status_label(log: Optional[MedicationLog]) -> str:
    if log is None:
        return "No data"
    if log.status == LogStatus.MISSED:
        return "Missed"
    if log.status == LogStatus.LATE or (log.delay_minutes or 0) > 0:
        return "Delayed"
    if log.status == LogStatus.TAKEN:
        return "On track"
    return "Pending"
