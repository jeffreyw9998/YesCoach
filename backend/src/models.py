from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float
from sqlalchemy.orm import relationship, mapped_column, Mapped
from sqlalchemy.types import ARRAY
from typing import List, Dict
import datetime
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    weight = Column(Float, nullable=False)
    height = Column(Float, nullable=False)
    age = Column(Integer, nullable=False)

    goals = Column(ARRAY(Integer), default=['','',''])
    goals_quantity = Column(ARRAY(Integer), default=[0,0,0])

#     items: Mapped[List["HealthData"]] = relationship(back_populates="users")


# class HealthData(Base):
#     __tablename__ = "healthdata"

#     user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), primary_key=True)

#     items: Mapped["User"] = relationship(back_populates="HealthData")
