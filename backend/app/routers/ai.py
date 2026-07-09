from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import Any, List

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.models.ai import AIConversation, AIMessage
from app.services.ai_service import ai_service
from app.schemas.ai import (
    AIConversationResponse, AIConversationListResponse,
    AIConversationCreate, AIMessageResponse, AIMessageCreate, AIChatRequest
)

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
    reply_text = ai_service.get_mock_reply(req.message, current_user.role.value)

    # Save AI message
    ai_msg = AIMessage(conversation_id=conv.id, sender="ai", message=reply_text)
    db.add(ai_msg)
    await db.commit()
    await db.refresh(ai_msg)
    return ai_msg
