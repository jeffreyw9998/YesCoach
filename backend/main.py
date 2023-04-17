from dotenv import load_dotenv, find_dotenv
from fastapi import FastAPI, Depends, HTTPException
load_dotenv(find_dotenv())

from src import models, crud, schemas
from src.database import SessionLocal, engine

from sqlalchemy.orm import Session

from starlette.responses import HTMLResponse
from starlette.requests import Request



# create the database table if they do not already exist?
# tutorial said normally want to use migration, what is migration?
models.Base.metadata.create_all(bind=engine)



app = FastAPI()





def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



#FastAPI Function
@app.post('/users/')
def create_user(user: schemas.UserCreate,
                db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user.id)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)


@app.get("/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user