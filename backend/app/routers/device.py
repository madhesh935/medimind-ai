from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
from typing import Any, List

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.models.device import SmartBottle, BottleEvent
from app.schemas.device import (
    SmartBottleResponse, SmartBottleRegister, SmartBottlePair,
    SmartBottleUpdate, BottleEventCreate, BottleEventResponse
)

router = APIRouter()


@router.post("/register", response_model=SmartBottleResponse)
async def register_device(
    device_in: SmartBottleRegister,
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(select(SmartBottle).where(SmartBottle.device_id == device_in.device_id))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Device already registered")
    bottle = SmartBottle(**device_in.model_dump())
    db.add(bottle)
    await db.commit()
    await db.refresh(bottle)
    return bottle


@router.post("/pair", response_model=SmartBottleResponse)
async def pair_bottle(
    pair_in: SmartBottlePair,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(select(SmartBottle).where(SmartBottle.device_id == pair_in.device_id))
    bottle = result.scalars().first()
    if not bottle:
        raise HTTPException(status_code=404, detail="Device not found")
    bottle.patient_id = pair_in.patient_id
    await db.commit()
    await db.refresh(bottle)
    return bottle


@router.put("/{device_id}/status", response_model=SmartBottleResponse)
async def update_device_status(
    device_id: str,
    update_in: SmartBottleUpdate,
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(select(SmartBottle).where(SmartBottle.device_id == device_id))
    bottle = result.scalars().first()
    if not bottle:
        raise HTTPException(status_code=404, detail="Device not found")
    update_data = update_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(bottle, field, value)
    bottle.last_sync = datetime.utcnow()
    await db.commit()
    await db.refresh(bottle)
    return bottle


@router.post("/{device_id}/events", response_model=BottleEventResponse)
async def log_device_event(
    device_id: str,
    event_in: BottleEventCreate,
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(select(SmartBottle).where(SmartBottle.device_id == device_id))
    if not result.scalars().first():
        raise HTTPException(status_code=404, detail="Device not found")
    event = BottleEvent(device_id=device_id, event_type=event_in.event_type, sensor_data=event_in.sensor_data)
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event


@router.get("/{device_id}/events", response_model=List[BottleEventResponse])
async def get_device_events(
    device_id: str,
    limit: int = 50,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(
        select(BottleEvent)
        .where(BottleEvent.device_id == device_id)
        .order_by(BottleEvent.timestamp.desc())
        .limit(limit)
    )
    return list(result.scalars().all())
