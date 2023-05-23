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
    id: str


class UserCreate(UserBase):
    name: str
    weight: float
    height: float
    birthday: datetime


class UserPatch(BaseModel):
    weight: Optional[float] = None
    height: Optional[float] = None
    name: Optional[str] = None
    goals: Optional[list[str]] = None
    birthday: Optional[datetime] = None
    last_update: Optional[datetime] = None
    goals_quantity: Optional[list[float]] = None


class UserGet(UserPatch, UserBase):
    class Config:
        orm_mode = True


class Activity(BaseModel):
    user_id: str
    id: str
    name: Optional[str]
    description: Optional[str]
    startTime: datetime
    endTime: datetime
    modifiedTime: datetime


class FitnessActivity(Activity):
    activityType: int
    activeTimeSeconds: int

    class Config:
        orm_mode = True


class SleepActivity(Activity):
    class Config:
        orm_mode = True


class Aggregate(BaseModel):
    aggregate_type: str
    user_id: str
    startTime: datetime
    endTime: datetime
    quantity: float

    class Config:
        orm_mode = True


class Options(BaseModel):
    access_token: str
    # Don't know why i put it here.
    # Might need them in the future,
    # Do not touch
    pullSleepFitness: bool = False
    pullHydration: bool = False
    pullSteps: bool = False
    pullCalories: bool = False
    pullDistance: bool = False
    # start_time is iso format datetime string in UTC timezone
    start_time: Optional[datetime]


class Preference(BaseModel):
    time: datetime
    type: str
    preferenceArray: list[str]


class MuscleChoice(BaseModel):
    time: datetime = datetime.now()
    muscle: str
    exercise: str
