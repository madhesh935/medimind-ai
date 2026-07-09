from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func
from typing import Any, List

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.models.ai import AIConversation, AIMessage, AIPrediction, AIRecommendation
from app.models.medicine import MedicationLog, LogStatus
from app.models.misc import Notification
from app.repositories.profile_repo import ProfileRepository
from app.services.ai_service import ai_service
from app.websocket.manager import ws_manager
from app.schemas.ai import (
    AIConversationResponse, AIConversationListResponse,
    AIConversationCreate, AIMessageResponse, AIMessageCreate, AIChatRequest,
    AIPredictionWithRecs, AIRecommendationResponse,
)

RISK_WINDOW_DAYS = 14

router = APIRouter()


@router.get("/conversations", response_model=List[AIConversationListResponse])
async def get_conversations(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(
        select(AIConversation)
        .where(AIConversation.user_id == current_user.id)
        .order_by(AIConversation.created_at.desc())
    )
    return list(result.scalars().all())


@router.post("/conversations", response_model=AIConversationResponse)
async def create_conversation(
    conv_in: AIConversationCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    db_conv = AIConversation(user_id=current_user.id, title=conv_in.title)
    db.add(db_conv)
    await db.commit()
    await db.refresh(db_conv)
    # Re-fetch with messages eagerly loaded
    result = await db.execute(
        select(AIConversation)
        .options(selectinload(AIConversation.messages))
        .where(AIConversation.id == db_conv.id)
    )
    return result.scalars().first()


@router.get("/conversations/{conv_id}", response_model=AIConversationResponse)
async def get_conversation(
    conv_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(
        select(AIConversation)
        .options(selectinload(AIConversation.messages))
        .where(AIConversation.id == conv_id, AIConversation.user_id == current_user.id)
    )
    conv = result.scalars().first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv


@router.post("/conversations/{conv_id}/messages", response_model=AIMessageResponse)
async def send_message(
    conv_id: int,
    req: AIChatRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    # Verify conversation belongs to user
    result = await db.execute(
        select(AIConversation).where(
            AIConversation.id == conv_id,
            AIConversation.user_id == current_user.id
        )
    )
    conv = result.scalars().first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Save user message
    user_msg = AIMessage(conversation_id=conv.id, sender="user", message=req.message)
    db.add(user_msg)
    await db.commit()

    # Get AI response
    reply_text = ai_service.get_reply(req.message, current_user.role.value)

    # Save AI message
    ai_msg = AIMessage(conversation_id=conv.id, sender="ai", message=reply_text)
    db.add(ai_msg)
    await db.commit()
    await db.refresh(ai_msg)
    return ai_msg

@router.get("/prediction/{patient_id}", response_model=AIPredictionWithRecs)
async def get_patient_prediction(
    patient_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.id != patient_id and current_user.role.value not in ("doctor", "admin"):
        raise HTTPException(status_code=403, detail="Not authorized for this patient's prediction")
    result = await db.execute(select(AIPrediction).where(AIPrediction.patient_id == patient_id))
    prediction = result.scalars().first()
    if not prediction:
        # Create mock baseline
        prediction = AIPrediction(patient_id=patient_id, summary="Waiting for more data to generate insights.")
        db.add(prediction)
        await db.commit()
        await db.refresh(prediction)
        
    # Fetch recommendations
    recs_res = await db.execute(select(AIRecommendation).where(AIRecommendation.prediction_id == prediction.id))
    recs = recs_res.scalars().all()
    
    return {
        "prediction": prediction,
        "details": recs
    }

@router.post("/prediction/{patient_id}/recalculate")
async def recalculate_risk(
    patient_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.id != patient_id and current_user.role.value not in ("doctor", "admin"):
        raise HTTPException(status_code=403, detail="Not authorized for this patient's prediction")
    result = await db.execute(select(AIPrediction).where(AIPrediction.patient_id == patient_id))
    prediction = result.scalars().first()
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction profile not found")

    profile_repo = ProfileRepository(db)
    patient = await profile_repo.get_patient_by_user_id(patient_id)

    adherence_pct = 100.0
    missed_doses = 0
    if patient:
        since = datetime.utcnow() - timedelta(days=RISK_WINDOW_DAYS)
        logs_result = await db.execute(
            select(MedicationLog.status, func.count(MedicationLog.id))
            .where(MedicationLog.patient_id == patient.id, MedicationLog.scheduled_time >= since)
            .group_by(MedicationLog.status)
        )
        counts = {status: count for status, count in logs_result.all()}
        total = sum(counts.values())
        missed_doses = counts.get(LogStatus.MISSED, 0)
        if total > 0:
            adherence_pct = (counts.get(LogStatus.TAKEN, 0) / total) * 100

    if adherence_pct >= 90:
        new_risk = "Low"
    elif adherence_pct >= 75:
        new_risk = "Medium"
    else:
        new_risk = "High"

    explanation = ai_service.explain_risk(new_risk, adherence_pct, missed_doses, RISK_WINDOW_DAYS)

    prediction.current_risk = new_risk
    prediction.expected_adherence = round(adherence_pct)
    prediction.summary = explanation
    db.add(AIRecommendation(prediction_id=prediction.id, text=explanation, rec_type="EXPLAINABILITY"))
    db.add(Notification(
        user_id=patient_id,
        title=f"Risk level updated to {new_risk}",
        message=explanation,
        type="risk_update",
    ))
    await db.commit()

    # Broadcast to care team (Patient, Doctor)
    await ws_manager.send_personal_message({
        "type": "RISK_SCORE_UPDATED",
        "new_risk": prediction.current_risk
    }, patient_id)

    return {"status": "success", "new_risk": prediction.current_risk, "explanation": explanation}


@router.put("/recommendations/{recommendation_id}/apply", response_model=AIRecommendationResponse)
async def apply_recommendation(
    recommendation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(AIRecommendation).where(AIRecommendation.id == recommendation_id))
    recommendation = result.scalars().first()
    if not recommendation:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    prediction_result = await db.execute(select(AIPrediction).where(AIPrediction.id == recommendation.prediction_id))
    prediction = prediction_result.scalars().first()
    if prediction and current_user.id != prediction.patient_id and current_user.role.value not in ("doctor", "admin"):
        raise HTTPException(status_code=403, detail="Not authorized to apply this recommendation")

    recommendation.applied = True
    await db.commit()
    await db.refresh(recommendation)
    return recommendation
