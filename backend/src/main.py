from typing import List

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import session
from . import models, crud, schemas
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)



app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



#FastAPI Functions
