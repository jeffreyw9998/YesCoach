from sqlalchemy.orm import Session
from sqlalchemy import select, func, insert
from datetime import datetime, timedelta, timezone, date
import requests
import json
from src.utils import to_datetime, hours_between_datetime
from src import models, schemas
from src.RecommendationEngine import RecommendationEngine
from src.database import get_db
from fastapi import Depends, Path, HTTPException


def get_user(user_id: str = Path(...), db: Session = Depends(get_db)) -> models.User | None:
    u = db.query(models.User).filter(models.User.id == user_id).first()
    return u


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()


def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(id=user.id, email=user.email, weight=user.weight, height=user.height,
                          birthday=user.birthday, name=user.name)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user_id: str, user_data: dict[str, datetime | str | int], cur_user: models.User):
    for key, value in user_data.items():
        setattr(cur_user, key, value)
    db.commit()
    db.refresh(cur_user)
    return cur_user


def get_user_data_from_date(db: Session, user_id: str, from_time: datetime, to_time: datetime, which_tables: list[str],
                            aggregate_types: list[str], summarize: bool) -> dict:
    """
    Get user data from specific tables between two times.

    Args:
    db (Session): database session
    user_id (str): user identifier
    from_time (datetime): start time
    to_time (datetime): end time
    which_tables (List[str]): list of tables to get data from

    Returns:
    dict: data of elements in the list
    """

    dicty = {}
    for table in which_tables:
        if table == "sleep":
            sleep_data = (
                db.query(models.SleepActivity)
                .filter(models.SleepActivity.user_id == user_id)
                .filter(models.SleepActivity.startTime >= from_time)
                # .filter(models.SleepActivity.endTime <= to_time)
                .order_by(models.SleepActivity.startTime.desc())
                .all()
            )
            dicty[table] = sleep_data
        elif table == "fitness":
            fitness_data = (
                db.query(models.FitnessActivity)
                .filter(models.FitnessActivity.user_id == user_id)
                .filter(models.FitnessActivity.startTime >= from_time)
                # .filter(models.FitnessActivity.endTime <= to_time)
                .order_by(models.FitnessActivity.startTime.desc())
                .all()
            )
            dicty[table] = fitness_data
        elif table == "aggregate":
            if summarize:
                # Group by aggregate_type and get the sum of the values
                aggregate_data = db.execute(
                    select(
                        models.Aggregate.aggregate_type,
                        func.sum(models.Aggregate.quantity),
                    )
                    .where(
                        models.Aggregate.user_id == user_id,
                        models.Aggregate.startTime >= from_time,
                        # models.Aggregate.endTime <= to_time,
                        models.Aggregate.aggregate_type.in_(aggregate_types),
                    )
                    .group_by(models.Aggregate.aggregate_type)
                    .order_by(models.Aggregate.aggregate_type)
                ).mappings().all()

            else:
                aggregate_data = (
                    db.query(models.Aggregate)
                    .filter(models.Aggregate.user_id == user_id)
                    .filter(models.Aggregate.startTime >= from_time)
                    # .filter(models.Aggregate.endTime <= to_time)
                    .filter(models.Aggregate.aggregate_type.in_(aggregate_types))
                    .order_by(models.Aggregate.startTime.desc())
                    .all()
                )
            dicty[table] = aggregate_data  # can add more
    return dicty


def push_user_data(db: Session, user_id: str, payload: schemas.Options):
    """
    take the user id and take data from GFit
    72: Sleep
    :param db: database session
    :param user_id: user id
    :param payload: access token object
    """
    # get the start time of the last data
    present_time = datetime.now(timezone.utc)
    # Query the database for the session with the latest start time
    latest_update: datetime | None = db.execute(
        select(models.User.last_update).where(models.User.id == user_id)
    ).scalar()

    if latest_update is None:
        start_time = present_time - timedelta(days=35)
    elif payload.start_time is not None:
        start_time = payload.start_time
    else:
        # Make latest_update have the utc timezone
        latest_update = latest_update.replace(tzinfo=timezone.utc)
        start_time = latest_update
    # Convert start time to iso format

    iso_start_time = start_time.isoformat()
    iso_end_time = present_time.isoformat()

    headers = {
        "Authorization": "Bearer {}".format(payload.access_token),
        "Content-Type": "application/json",
    }

    if payload.pullSleepFitness:
        session_request_url = f"https://www.googleapis.com/fitness/v1/users/me/sessions"
        session_data = requests.get(
            session_request_url,
            params={
                "startTime": iso_start_time,
                "endTime": iso_end_time,
                "includeDeleted": "false",
            },
            headers=headers,
        )
        # Catch errors in the request
        if session_data.status_code != 200:
            raise HTTPException(
                status_code=session_data.status_code,
                detail=session_data.json()["error"]["message"],
            )
        session_data = session_data.json()
        sleep_activities = []
        normal_activities = []

        # push sleep data to database?
        for ses in session_data["session"]:
            if ses["activityType"] == 72:
                sleep_activity = dict(
                    user_id=user_id,
                    id=ses["id"],
                    name=ses["name"],
                    description=ses["description"],
                    startTime=to_datetime(ses["startTimeMillis"], "ms"),
                    endTime=to_datetime(ses["endTimeMillis"], "ms"),
                    modifiedTime=to_datetime(ses["modifiedTimeMillis"], "ms"),
                )
                sleep_activities.append(sleep_activity)
            else:
                normal_activity = dict(
                    user_id=user_id,
                    id=ses["id"],
                    name=ses["name"],
                    description=ses["description"],
                    startTime=to_datetime(ses["startTimeMillis"], "ms"),
                    endTime=to_datetime(ses["endTimeMillis"], "ms"),
                    modifiedTime=to_datetime(ses["modifiedTimeMillis"], "ms"),
                    activityType=ses["activityType"],
                    activeTimeSeconds=int(ses.get("activeTimeMillis", 0)) // 1000,
                )
                normal_activities.append(normal_activity)

        # Bulk insert without checking for constraints
        for activity in [sleep_activities, normal_activities]:
            if len(activity) > 0:
                if activity[0].get("activityType") is None:
                    db.execute(models.SleepActivity.__table__.insert(), activity)
                else:
                    db.execute(models.FitnessActivity.__table__.insert(), activity)
                db.flush()
                db.commit()

    if payload.pullHydration:
        push_hydration(db, user_id=user_id, start_time=start_time, present_time=present_time, headers=headers)

    if payload.pullCalories:
        # push calories
        push_calories(db, user_id=user_id, start_time=start_time, present_time=present_time, headers=headers)

    if payload.pullSteps:
        # push steps
        push_steps(db, user_id=user_id, start_time=start_time, present_time=present_time, headers=headers)

    if payload.pullDistance:
        push_distance(db, user_id=user_id, start_time=start_time, present_time=present_time, headers=headers)
    return {"status": "successful"}


def post_user_preference(db: Session, user_id: str, preference: schemas.Preference):
    """
    post user preference
    :param db: database session
    :param user_id: user id
    :param preference: preference object
    """
    # Turn preferenceArray into a set to remove duplicates
    preference.preferenceArray = list(set(preference.preferenceArray))
    preference = models.Preferences(**preference.dict(), user_id=user_id)
    try:
        db.add(preference)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    else:
        db.commit()
        db.refresh(preference)


def post_user_choice(db: Session, user_id: str, choice: schemas.MuscleChoice):
    """
    post user choice
    :param db: database session
    :param user_id: user id
    :param choice: choice object
    """
    choice = models.MuscleChoice(**choice.dict(), user_id=user_id)
    try:
        db.add(choice)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    else:
        db.commit()
        db.refresh(choice)


def get_activity_recommendations(db: Session, user_id: str, which_activity: list[str], user: schemas.UserGet,
                                 activities_map: dict[str | int, str | int], summarize: bool):
    personal_rec_engine = RecommendationEngine(user, summarize)
    rec_dict = {}
    for activity in which_activity:
        match activity:
            case "sleep":
                rec_dict['sleep'] = personal_rec_engine.get_sleep_recommendation(
                    get_week_sleep_data(db, user_id))
            case "hydration":
                if summarize:
                    # get amount of water drank for the entire week
                    # get amount of exercise for the entire week
                    a_week_ago = datetime.now().replace(hour=8, minute=0, second=0) - timedelta(days=7)
                    rec = personal_rec_engine.get_hydration_recommendation(
                        get_hydration(db, user_id, a_week_ago),
                        get_exercises(db, user_id, a_week_ago)
                    )
                else:
                    rec = personal_rec_engine.get_hydration_recommendation(
                        get_hydration(db, user_id, datetime.now().replace(hour=0, minute=0, second=0)),
                        get_exercises(db, user_id, datetime.now().replace(hour=0, minute=0, second=0)))
                rec_dict['hydration'] = rec
            case "fitness":
                rec_dict['fitness'] = personal_rec_engine.get_fitness_recommendation(db, user_id, activities_map)
            case _:
                continue
    return rec_dict


##### helper function #####


def get_latest_preference(db: Session, user_id: str, preference_type: str) -> models.Preferences | None:
    """
    :param db: database session
    :param user_id: user id
    :param preference_type: preference type
    """
    # get latest preference from database that has the same type
    return db.query(models.Preferences).filter(
        models.Preferences.user_id == user_id,
        models.Preferences.type == preference_type,
    ).order_by(models.Preferences.time.desc()).first()


def push_aggregate(db: Session, user_id: str, headers: dict, body: dict, aggregate_type: str):
    aggregate_url = f"https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate"
    responses = requests.post(aggregate_url, data=json.dumps(body), headers=headers)
    if responses.status_code != 200:
        raise HTTPException(
            status_code=responses.status_code,
            detail=responses.json()["error"]["message"],
        )
    responses = responses.json()
    aggregate_data = []
    for bucket in responses["bucket"]:
        aggregate_start_time = to_datetime(bucket["startTimeMillis"], "ms")
        aggregate_end_time = to_datetime(bucket["endTimeMillis"], "ms")
        for dataset in bucket.get("dataset", []):
            for point in dataset.get("point", []):
                quantity = point["value"][0]
                for _, value in quantity.items():
                    if type(value) in [int, float]:
                        quantity = value
                aggregate = dict(
                    aggregate_type=aggregate_type,
                    user_id=user_id,
                    startTime=aggregate_start_time,
                    endTime=aggregate_end_time,
                    quantity=quantity,
                )
                aggregate_data.append(aggregate)
    # Bulk insert without checking for constraints
    if len(aggregate_data) > 0:
        db.execute(models.Aggregate.__table__.insert(), aggregate_data)
        db.flush()
        db.commit()


def push_hydration(db: Session, user_id: str, start_time: datetime, present_time: datetime, headers: dict[str, str]):
    start_time_timestamp = int(start_time.timestamp())
    present_time_timestamp = int(present_time.timestamp())

    body = {
        "aggregateBy": [{"dataTypeName": "com.google.hydration"}],
        "bucketByTime": {"durationMillis": 86400000},  # 1 day in milliseconds
        "startTimeMillis": start_time_timestamp * 1000,  # start of time in milliseconds
        "endTimeMillis": present_time_timestamp * 1000,  # end of time in milliseconds
    }
    push_aggregate(db, user_id=user_id, headers=headers, body=body, aggregate_type="hydration")


def push_steps(db: Session, user_id: str, start_time: datetime, present_time: datetime, headers: dict[str, str]):
    start_time_timestamp = int(start_time.timestamp())
    present_time_timestamp = int(present_time.timestamp())

    body = {
        "aggregateBy": [
            {
                "dataTypeName": "com.google.step_count.delta",
            }
        ],
        "bucketByTime": {"durationMillis": 86400000},  # 1 day in milliseconds
        "startTimeMillis": start_time_timestamp * 1000,  # start of time in milliseconds
        "endTimeMillis": present_time_timestamp * 1000,  # end of time in milliseconds
    }
    push_aggregate(db, user_id=user_id, headers=headers, body=body, aggregate_type="steps")


def push_calories(db: Session, user_id: str, start_time: datetime, present_time: datetime, headers: dict[str, str]):
    start_time_timestamp = int(start_time.timestamp())
    present_time_timestamp = int(present_time.timestamp())

    body = {
        "aggregateBy": [
            {
                "dataTypeName": "com.google.calories.expended",
            }
        ],
        "bucketByTime": {"durationMillis": 86400000},  # 1 day in milliseconds
        "startTimeMillis": start_time_timestamp * 1000,  # start of time in milliseconds
        "endTimeMillis": present_time_timestamp * 1000,  # end of time in milliseconds
    }
    push_aggregate(db, user_id=user_id, headers=headers, body=body, aggregate_type="calories")


def push_distance(db: Session, user_id: str, start_time: datetime, present_time: datetime, headers: dict[str, str]):
    start_time_timestamp = int(start_time.timestamp())
    present_time_timestamp = int(present_time.timestamp())

    body = {
        "aggregateBy": [
            {
                "dataTypeName": "com.google.distance.delta",
            }
        ],
        "bucketByTime": {"durationMillis": 86400000},  # 1 day in milliseconds
        "startTimeMillis": start_time_timestamp * 1000,  # start of time in milliseconds
        "endTimeMillis": present_time_timestamp * 1000,  # end of time in milliseconds
    }
    push_aggregate(db, user_id=user_id, headers=headers, body=body, aggregate_type="distance")


def get_week_sleep_data(db: Session, user_id: str) -> list[models.SleepActivity]:
    now = date.today()
    one_week_ago = now - timedelta(days=7)
    sleep_data = (
        db.query(models.SleepActivity)
        .filter(models.SleepActivity.user_id == user_id)
        .filter(models.SleepActivity.startTime >= one_week_ago)
        .order_by(models.SleepActivity.startTime.desc())
        .all()
    )
    return sleep_data


def get_hydration(db: Session, user_id: str, startTime: datetime) -> float | int:
    hydration_data = db.execute(
        select(func.sum(models.Aggregate.quantity))
        .where(
            models.Aggregate.user_id == user_id,
            # models.Aggregate.endTime <= to_time,
            models.Aggregate.startTime >= startTime,
            models.Aggregate.aggregate_type == "hydration",
        )
    ).mappings().all()
    return hydration_data[0]['sum'] if type(hydration_data[0]['sum']) in (int, float) else 0


def get_exercises(db: Session, user_id: str, startTime: datetime) -> float:
    """
    Get the number of hours exercised in the last week
    """
    # Translate this query to sqlalchemy
    query = select(func.sum(models.FitnessActivity.endTime - models.FitnessActivity.startTime)).where(
        models.FitnessActivity.user_id == user_id,
        models.FitnessActivity.startTime >= startTime,
    )
    result: timedelta | None = db.execute(query).scalar()
    if result is None:
        return 0
    return result.total_seconds() / 3600


def get_muscle_session(db: Session, user_id: str, startTime: datetime) -> int:
    """
    Get the number of muscle workouts in the last week
    :param db: Database session
    :param user_id: User ID
    :param startTime: Start time of the week
    :return: Number of muscle workouts
    """
    query = select(func.count(models.MuscleChoice.time)).where(
        models.MuscleChoice.user_id == user_id,
        models.MuscleChoice.time >= startTime,
    )
    result: int | None = db.execute(query).scalar()
    return result if result is not None else 0



# def get_exercises(db: Session, user_id: str, startTime: datetime) -> int:
#     fitness_data = (db.query(models.FitnessActivity)
#                     .filter(models.FitnessActivity.user_id == user_id)
#                     .filter(models.FitnessActivity.startTime >= startTime)
#                     .order_by(models.FitnessActivity.startTime.desc())
#                     .all())
#     return get_exercise_min_sum(fitness_data)
#
#
# def get_exercise_min_sum(fitness_activity: list[schemas.FitnessActivity]) -> int:
#     total = 0
#     for fitness in fitness_activity:
#         total += hours_between_datetime(fitness.endTime, fitness.startTime)
#     return total
