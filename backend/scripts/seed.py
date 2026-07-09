import asyncio
import sys
import os

# Add the backend directory to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import SessionLocal
from app.models.user import User, RoleEnum
from app.core.security import get_password_hash

SEED_USERS = [
    {"email": "admin@medimind.ai", "name": "Alex Morgan", "role": RoleEnum.ADMIN},
    {"email": "patient@medimind.ai", "name": "John Anderson", "role": RoleEnum.PATIENT},
    {"email": "doctor@medimind.ai", "name": "Dr. Priya Patel", "role": RoleEnum.DOCTOR},
    {"email": "caregiver@medimind.ai", "name": "Sarah Anderson", "role": RoleEnum.CAREGIVER},
]

async def seed_data():
    async with SessionLocal() as db:
        for u in SEED_USERS:
            existing = await db.execute(select(User).where(User.email == u["email"]))
            if existing.scalars().first():
                print(f"  Skipping {u['email']} (already exists)")
                continue
            user = User(
                email=u["email"],
                name=u["name"],
                password=get_password_hash("password123"),
                role=u["role"]
            )
            db.add(user)
            print(f"  Created {u['role'].value}: {u['email']}")

        await db.commit()
        print("Database seeded successfully.")

if __name__ == "__main__":
    asyncio.run(seed_data())
