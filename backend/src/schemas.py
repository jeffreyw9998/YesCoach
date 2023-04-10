from pydantic import BaseModel
import datetime

class HealthDataBase(BaseModel):
    data_type: str
    description: str | None = None

class HealthDataCreate(HealthDataBase):
    data_date: datetime


class HealthData(HealthDataBase):
    user_id: int
    class Config:
        orm_mode = True

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str
    weight: float
    height: float
    age: int

class User(UserBase):
    id: int
    class Config:
        orm_mode = True