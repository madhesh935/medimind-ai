from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.ai import AIConversation, AIMessage
from app.schemas.ai import AIConversationCreate, AIMessageCreate

class AIRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_conversations_for_user(self, user_id: int) -> List[AIConversation]:
        result = await self.session.execute(
            select(AIConversation).where(AIConversation.user_id == user_id).order_by(AIConversation.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_conversation_by_id(self, conv_id: int) -> Optional[AIConversation]:
        result = await self.session.execute(
            select(AIConversation).options(selectinload(AIConversation.messages)).where(AIConversation.id == conv_id)
        )
        return result.scalars().first()

    async def create_conversation(self, obj_in: AIConversationCreate) -> AIConversation:
        db_obj = AIConversation(**obj_in.model_dump())
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def create_message(self, obj_in: AIMessageCreate) -> AIMessage:
        db_obj = AIMessage(**obj_in.model_dump())
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj
    
    async def delete_conversation(self, conv_id: int) -> None:
        conv = await self.get_conversation_by_id(conv_id)
        if conv:
            await self.session.delete(conv)
            await self.session.commit()
