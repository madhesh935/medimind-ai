from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict
from app.models.user import RoleEnum

class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None
    role: RoleEnum = RoleEnum.PATIENT

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    avatar: Optional[str] = None

class UserInDBBase(UserBase):
    id: int
    avatar: Optional[str] = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

class User(UserInDBBase):
    pass
