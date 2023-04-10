from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship, mapped_column, Mapped

from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int]             = Column(autoincrement=True, primary_key=True, index=True)
    email: Mapped[str]          = Column(unique=True, index=True, nullable=False)
    password: Mapped[str]       = Column(nullable=False)
    weight: Mapped[float]       = Column(nullable=False)
    height: Mapped[float]       = Column(nullable=False)
    age: Mapped[int]            = Column(nullable=False)

    items: Mapped["HealthData"] = relationship(back_populates="users")

class HealthData(Base):
    __tablename__ = "healthdata"

    user_id: Mapped[int]        = mapped_column(ForeignKey("user.id"),primary_key=True)

    
    items: Mapped["User"]       = relationship(back_populates="HealthData")

