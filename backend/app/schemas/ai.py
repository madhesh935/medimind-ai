from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class AIMessageBase(BaseModel):
    sender: str
    message: str

class AIMessageCreate(AIMessageBase):
    conversation_id: int

class AIMessageResponse(AIMessageBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AIConversationBase(BaseModel):
    title: str

class AIConversationCreate(AIConversationBase):
    user_id: int

class AIConversationResponse(AIConversationBase):
    id: int
    created_at: datetime
    messages: List[AIMessageResponse] = []

    model_config = ConfigDict(from_attributes=True)

class AIConversationListResponse(AIConversationBase):
    """Lightweight response for conversation list — no messages."""
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AIChatRequest(BaseModel):
    message: str

class AIRecommendationResponse(BaseModel):
    id: int
    prediction_id: int
    text: str
    rec_type: str
    applied: bool = False

    model_config = ConfigDict(from_attributes=True)

class AIPredictionResponse(BaseModel):
    id: int
    patient_id: int
    current_risk: str
    future_risk_7d: str
    future_risk_30d: str
    confidence_score: int
    next_miss_probability: int
    expected_adherence: int
    summary: Optional[str] = None
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AIPredictionWithRecs(BaseModel):
    prediction: AIPredictionResponse
    details: List[AIRecommendationResponse]
