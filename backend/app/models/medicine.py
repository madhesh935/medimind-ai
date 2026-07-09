import enum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Float, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class MedicineStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    STOPPED = "stopped"

class LogStatus(str, enum.Enum):
    TAKEN = "taken"
    MISSED = "missed"
    LATE = "late"
    PENDING = "pending"

class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    medicine_name = Column(String, index=True)
    dosage = Column(String)
    frequency = Column(String)  # e.g., "Twice a day"
    schedule = Column(JSON)     # e.g., ["08:00", "20:00"]
    instructions = Column(String, nullable=True)
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    remaining_pills = Column(Integer, default=0)
    status = Column(Enum(MedicineStatus), default=MedicineStatus.ACTIVE)
    auto_refill = Column(Boolean, default=False)

    patient = relationship("Patient", back_populates="medicines")
    logs = relationship("MedicationLog", back_populates="medicine")

class MedicationLog(Base):
    __tablename__ = "medication_logs"

    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"))
    patient_id = Column(Integer, ForeignKey("patients.id"))
    scheduled_time = Column(DateTime(timezone=True))
    taken_time = Column(DateTime(timezone=True), nullable=True)
    status = Column(Enum(LogStatus), default=LogStatus.PENDING)
    delay_minutes = Column(Integer, default=0)
    device_id = Column(String, nullable=True)

    medicine = relationship("Medicine", back_populates="logs")
