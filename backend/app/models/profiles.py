from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=True)
    dob = Column(Date, nullable=True)
    gender = Column(String, nullable=True)
    blood_group = Column(String, nullable=True)
    height = Column(Float, nullable=True)
    weight = Column(Float, nullable=True)
    allergies = Column(Text, nullable=True)
    medical_history = Column(Text, nullable=True)

    user = relationship("User", back_populates="patient")
    doctor = relationship("Doctor", back_populates="patients")
    medicines = relationship("Medicine", back_populates="patient")
    smart_bottles = relationship("SmartBottle", back_populates="patient")
    appointments = relationship("Appointment", back_populates="patient")
    reports = relationship("Report", back_populates="patient")

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    hospital = Column(String, nullable=True)
    specialization = Column(String, nullable=True)
    license_number = Column(String, nullable=True)
    availability_status = Column(String, default="available")  # "available" | "away"

    user = relationship("User", back_populates="doctor")
    patients = relationship("Patient", back_populates="doctor")
    appointments = relationship("Appointment", back_populates="doctor")


