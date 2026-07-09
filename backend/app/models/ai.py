from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, default="New Chat")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="ai_conversations")
    messages = relationship("AIMessage", back_populates="conversation", cascade="all, delete-orphan")

class AIMessage(Base):
    __tablename__ = "ai_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("ai_conversations.id"))
    sender = Column(String)  # "user" or "ai"
    message = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    conversation = relationship("AIConversation", back_populates="messages")

class AIPrediction(Base):
    __tablename__ = "ai_predictions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True)
    
    current_risk = Column(String, default="Low")
    future_risk_7d = Column(String, default="Low")
    future_risk_30d = Column(String, default="Low")
    confidence_score = Column(Integer, default=95)
    next_miss_probability = Column(Integer, default=10)
    expected_adherence = Column(Integer, default=90)
    
    summary = Column(Text)
    
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    patient = relationship("User", foreign_keys=[patient_id])
    recommendations = relationship("AIRecommendation", back_populates="prediction", cascade="all, delete-orphan")

class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("ai_predictions.id"))
    text = Column(String)
    rec_type = Column(String) # "EXPLAINABILITY" or "RECOMMENDATION"
    applied = Column(Boolean, default=False)

    prediction = relationship("AIPrediction", back_populates="recommendations")
