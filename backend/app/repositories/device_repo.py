from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.device import SmartBottle, BottleEvent
from app.schemas.device import SmartBottleRegister, SmartBottleUpdate, BottleEventCreate

class DeviceRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_bottle_by_device_id(self, device_id: str) -> Optional[SmartBottle]:
        result = await self.session.execute(
            select(SmartBottle).where(SmartBottle.device_id == device_id)
        )
        return result.scalars().first()

    async def register_bottle(self, obj_in: SmartBottleRegister) -> SmartBottle:
        db_obj = SmartBottle(**obj_in.model_dump())
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def update_bottle(self, db_obj: SmartBottle, obj_in: SmartBottleUpdate) -> SmartBottle:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db_obj.last_sync = select(func.now()) # Or set in Python
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def pair_bottle(self, db_obj: SmartBottle, patient_id: int) -> SmartBottle:
        db_obj.patient_id = patient_id
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def create_event(self, obj_in: BottleEventCreate) -> BottleEvent:
        db_obj = BottleEvent(**obj_in.model_dump())
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj
    
    async def get_events(self, device_id: str, limit: int = 50) -> List[BottleEvent]:
        result = await self.session.execute(
            select(BottleEvent).where(BottleEvent.device_id == device_id).order_by(BottleEvent.timestamp.desc()).limit(limit)
        )
        return list(result.scalars().all())
