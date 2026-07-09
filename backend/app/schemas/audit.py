from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.audit import AuditSeverity

class AuditLogResponse(BaseModel):
    id: int
    actor_name: str
    role: str
    action: str
    target: Optional[str] = None
    ip_address: Optional[str] = None
    severity: AuditSeverity
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
