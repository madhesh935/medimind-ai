from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit import AuditLog, AuditSeverity


async def log_audit_event(
    db: AsyncSession,
    actor_name: str,
    role: str,
    action: str,
    target: Optional[str] = None,
    severity: AuditSeverity = AuditSeverity.INFO,
    actor_user_id: Optional[int] = None,
    commit: bool = True,
) -> AuditLog:
    entry = AuditLog(
        actor_user_id=actor_user_id,
        actor_name=actor_name,
        role=role,
        action=action,
        target=target,
        severity=severity,
    )
    db.add(entry)
    if commit:
        await db.commit()
    return entry
