import enum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from app.core.database import Base


class AuditSeverity(str, enum.Enum):
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    DANGER = "danger"


class AuditLog(Base):
    """Actor/role are denormalized snapshots (not just a FK) so rows attributed to
    non-user actors like "System" or "AI Engine" still render correctly."""
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    actor_name = Column(String)
    role = Column(String)
    action = Column(String)
    target = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    severity = Column(Enum(AuditSeverity), default=AuditSeverity.INFO)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
