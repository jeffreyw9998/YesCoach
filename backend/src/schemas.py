from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# class HealthDataBase(BaseModel):
#     data_type: str
#     description: str | None = None

# class HealthDataCreate(HealthDataBase):
#     data_date: datetime | None = None


# class HealthData(HealthDataBase):
#     user_id: int
#     class Config:
#         orm_mode = True

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    id: int
    password: str
    weight: float
    height: float
    age: int

class User(UserBase):
    id: int
    weight: Optional[float] = None
    height: Optional[float] = None
    age: Optional[int] = None
    goals: Optional[list] = None
    goals_quantity: Optional[list] = None
    class Config:
        orm_mode = True