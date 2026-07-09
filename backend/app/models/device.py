from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class SmartBottle(Base):
    __tablename__ = "smart_bottles"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    device_id = Column(String, unique=True, index=True)
    battery = Column(Integer, default=100)
    wifi_status = Column(String, default="disconnected")
    temperature = Column(Float, nullable=True)
    weight = Column(Float, nullable=True)
    lid_status = Column(String, default="closed")
    firmware_version = Column(String, nullable=True)
    last_sync = Column(DateTime(timezone=True), nullable=True)

    patient = relationship("Patient", back_populates="smart_bottles")
    events = relationship("BottleEvent", back_populates="bottle")

class BottleEvent(Base):
    __tablename__ = "bottle_events"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, ForeignKey("smart_bottles.device_id"))
    event_type = Column(String)  # open, closed, heartbeat
    sensor_data = Column(JSON, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    bottle = relationship("SmartBottle", back_populates="events")
