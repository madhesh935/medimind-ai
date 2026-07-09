from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class GamificationProfile(Base):
    __tablename__ = "gamification_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True)
    level = Column(Integer, default=1)
    current_xp = Column(Integer, default=0)
    reward_points = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    best_streak = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User")
    achievements = relationship("Achievement", back_populates="gamification_profile", cascade="all, delete-orphan")

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    gamification_profile_id = Column(Integer, ForeignKey("gamification_profiles.id"))
    badge_type = Column(String, index=True) # e.g. "7_DAY_STREAK", "EARLY_BIRD"
    title = Column(String)
    icon = Column(String)
    unlocked_at = Column(DateTime(timezone=True), server_default=func.now())

    gamification_profile = relationship("GamificationProfile", back_populates="achievements")
