from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User, RoleEnum
from app.models.gamification import GamificationProfile, Achievement
from app.websocket.manager import ws_manager

router = APIRouter()

def _require_self_or_admin(current_user: User, user_id: int) -> None:
    if current_user.id != user_id and current_user.role != RoleEnum.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this profile")

@router.get("/{user_id}")
async def get_gamification_profile(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    _require_self_or_admin(current_user, user_id)
    result = await db.execute(select(GamificationProfile).where(GamificationProfile.user_id == user_id))
    profile = result.scalars().first()
    if not profile:
        profile = GamificationProfile(user_id=user_id)
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
    
    ach_res = await db.execute(select(Achievement).where(Achievement.gamification_profile_id == profile.id))
    achievements = ach_res.scalars().all()
    
    return {
        "level": profile.level,
        "current_xp": profile.current_xp,
        "reward_points": profile.reward_points,
        "current_streak": profile.current_streak,
        "best_streak": profile.best_streak,
        "achievements": achievements
    }

@router.post("/{user_id}/award-xp")
async def award_xp(
    user_id: int,
    xp: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    _require_self_or_admin(current_user, user_id)
    result = await db.execute(select(GamificationProfile).where(GamificationProfile.user_id == user_id))
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    profile.current_xp += xp
    
    # Simple level up logic: Every 1000 XP = 1 Level
    leveled_up = False
    if profile.current_xp >= (profile.level * 1000):
        profile.level += 1
        leveled_up = True
        
    await db.commit()
    await db.refresh(profile)
    
    # Broadcast to patient
    await ws_manager.send_personal_message({
        "type": "GAMIFICATION_UPDATED",
        "xp_added": xp,
        "leveled_up": leveled_up,
        "current_level": profile.level
    }, user_id)
    
    return {"status": "success", "leveled_up": leveled_up, "new_xp": profile.current_xp}
