from dotenv import load_dotenv, find_dotenv
from fastapi import FastAPI, Depends, HTTPException, Path, Query
from fastapi.middleware.cors import CORSMiddleware

load_dotenv(find_dotenv())
from datetime import datetime
from src import models, crud, schemas
from sqlalchemy.orm import Session
import uvicorn
from src.database import Base, get_db, engine
from src.utils import activties_map
from typing import Any

# create the database table if they do not already exist?
# tutorial said normally want to use migration, what is migration?


Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=True, allow_methods=['*'],
                   allow_headers=['*'])


# Define a dependency that gets the current user from the user id that is passed in the path and
# checks that the user exists
def get_current_user(db: Session = Depends(get_db), user_id: str = Path(...)) -> schemas.UserGet:
    db_user = crud.get_user(user_id=user_id, db=db)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


# FastAPI Function
@app.post("/users", response_model=schemas.UserGet)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Creates a new user
    :param user: user data
    :param db: database session
    :return: user data or raise an error
    """
    db_user = crud.get_user(user_id=user.id, db=db)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)


@app.put('/users/{user_id}', response_model=schemas.UserGet)
def patch_user(user_id: str, user_data: schemas.UserPatch, db: Session = Depends(get_db),
               current_user: models.User = Depends(crud.get_user)):
    """
    Updates the user data
    :param user_id: user id
    :param user_data: user data
    :param db: database session
    :param current_user: current user
    :return: user data
    """
    try:
        if current_user is None:
            raise HTTPException(status_code=404, detail="User not found")
        user_data = user_data.dict()
        # Loop through all attributes of user_data
        for key, value in dict(user_data).items():
            # If the value is None, delete the key
            if value is None or getattr(current_user, key) == value:
                del user_data[key]
        new_user = crud.update_user(db, user_id, user_data, current_user)
    except Exception as e:
        if type(e) is HTTPException:
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    else:
        return new_user


@app.post("/activity/{user_id}", dependencies=[Depends(get_current_user)])
def sync_activities(payload: schemas.Options, user_id: str = Path(...), db: Session = Depends(get_db)):
    """
    Syncs the user's activities and push them to the database
    :param payload: access token
    :param user_id: user id
    :param db: database session
    :return message of success or failure
    """
    try:
        crud.push_user_data(db, user_id=user_id, payload=payload)
    except Exception as e:
        if type(e) is HTTPException:
            raise e
        else:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        return {"detail": f"Successfully synced activities for user with id {user_id}"}


@app.get("/users/{user_id}", response_model=schemas.UserGet)
def read_user(current_user: schemas.UserGet = Depends(get_current_user)):
    """
    Gets the user data
    """
    return current_user


@app.get("/activity/{user_id}", dependencies=[Depends(get_current_user)],
         response_model=dict[str, list[schemas.FitnessActivity | schemas.SleepActivity | schemas.Aggregate | dict]])
def get_activities(start_time: datetime, end_time: datetime, which_tables: list[str] = Query(...),
                   aggregate_types: list[str] = Query(...),
                   summarize: bool = Query(...),
                   user_id: str = Path(...), db: Session = Depends(get_db)):
    """
    :param start_time: utc start time in iso format
    :param end_time: utc end time in iso format
    :param user_id: user id
    :param which_tables: which tables to query
    :param aggregate_types: which aggregate types to query
    :param db: database session
    :param summarize: whether to summarize the data
    :return: user data
    """
    try:
        activities_dict = crud.get_user_data_from_date(
            db, user_id, start_time, end_time, which_tables, aggregate_types, summarize=summarize
        )
    except Exception as e:
        if type(e) is HTTPException:
            raise e
        else:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        return activities_dict


@app.post("/preference/{user_id}", dependencies=[Depends(get_current_user)])
def post_preference(preference: schemas.Preference, user_id=Path(...), db: Session = Depends(get_db)) -> dict[str, str]:
    """
    Post user exercise preference to database
    :param preference: user preference
    :param user_id: user id
    :param db: database session
    """
    try:
        crud.post_user_preference(db, user_id, preference)
    except Exception as e:
        if type(e) is HTTPException:
            raise e
        else:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        return {"detail": f"Successfully posted preference for user with id {user_id} and goal {preference.type}"}


@app.post("/choice/{user_id", dependencies=[Depends(get_current_user)])
def post_choice(choice: schemas.MuscleChoice, user_id=Path(...), db: Session = Depends(get_db)) -> dict[str, str]:
    try:
        crud.post_user_choice(db, user_id, choice)
    except Exception as e:
        if type(e) is HTTPException:
            raise e
        else:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        return {"detail": f"Successfully posted choice for user with id {user_id} and choice {choice.exercise}"}


@app.get("/recommendation/{user_id}", response_model=dict[str, Any])
def get_recommendations(which_activity: list[str] = Query(...),
                        summarize: bool = Query(False),
                        user_id: str = Path(...), db: Session = Depends(get_db),
                        user: schemas.UserGet = Depends(get_current_user)) -> dict[str, Any]:
    """
    Get recommendations for the user
    :param which_activity: which activity to get recommendations for
    :param user_id: user id
    :param db: database session
    :param summarize: whether to summarize the data
    :param user: current user
    """
    try:
        recommendation_dict = crud.get_activity_recommendations(
            db, user_id, which_activity, user, activties_map, summarize
        )
    except Exception as e:
        if type(e) is HTTPException:
            raise e
        else:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        return recommendation_dict


@app.get("/")
def home():
    return {"message": "What's up coach"}


if __name__ == "__main__":
    uvicorn.run("main:app", reload=True)
