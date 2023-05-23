from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship, mapped_column, Mapped
from sqlalchemy.types import ARRAY
from typing import List, Dict
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    weight = Column(Float, nullable=False)
    height = Column(Float, nullable=False)
    birthday = Column(DateTime, nullable=False)
    last_update = Column(DateTime)
    goals = Column(ARRAY(String), default=['','',''])
    goals_quantity = Column(ARRAY(Float), default=[0,0,0])


class SleepActivity(Base):
    __tablename__ = "sleep"
    user_id = Column(String, ForeignKey(User.id), primary_key=True)
    id = Column(String, primary_key=True)
    name = Column(String, nullable=True)
    description = Column(String, nullable=True)
    startTime = Column(DateTime, primary_key=True)
    endTime = Column(DateTime, primary_key=True)
    modifiedTime = Column(DateTime, nullable=False)

class FitnessActivity(Base):
    __tablename__ = "fitness"
    user_id = Column(String, ForeignKey(User.id), primary_key=True)
    id = Column(String, primary_key=True)
    name = Column(String, nullable=True)
    description = Column(String, nullable=True)
    startTime = Column(DateTime, primary_key=True)
    endTime = Column(DateTime, primary_key=True)
    modifiedTime = Column(DateTime, nullable=False)
    activityType = Column(Integer)
    activeTimeSeconds = Column(Integer)


class Aggregate(Base):
    __tablename__ = "aggregate"
    aggregate_type = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey(User.id), primary_key=True)
    startTime = Column(DateTime, primary_key=True)
    endTime = Column(DateTime, primary_key=True)
    quantity = Column(Float, default=0)


class Preferences(Base):
    __tablename__ = "exercise_preferences"
    user_id = Column(String, ForeignKey(User.id), primary_key=True)
    time = Column(DateTime, primary_key=True)
    type = Column(String, index=True)
    # preferenceArray is a json object since we don't know how many preferences there will be
    preferenceArray = Column(JSONB, nullable=False)

class MuscleChoice(Base):
    __tablename__ = "muscle_choice"
    user_id = Column(String, ForeignKey(User.id), primary_key=True)
    time = Column(DateTime, primary_key=True)
    muscle = Column(String, index=True)
    exercise = Column(String, index=True)
