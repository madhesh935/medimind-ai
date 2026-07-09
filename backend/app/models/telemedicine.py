from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), index=True)
    doctor_id = Column(Integer, ForeignKey("users.id"), index=True)
    
    scheduled_for = Column(DateTime(timezone=True), index=True)
    status = Column(String, default="PENDING") # PENDING, CONFIRMED, COMPLETED, CANCELLED
    consultation_type = Column(String, default="VIDEO") # VIDEO, CHAT, IN_PERSON
    
    consultation_notes = Column(Text, nullable=True)
    prescription_status = Column(String, default="NO_CHANGES") # NO_CHANGES, UPDATED, NEW_PRESCRIPTION
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    patient = relationship("User", foreign_keys=[patient_id])
    doctor = relationship("User", foreign_keys=[doctor_id])
