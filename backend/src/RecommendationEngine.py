from src import schemas, models
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, date, timezone
from src.utils import hours_between_datetime, get_all_activities
import math
import numpy as np
from src.body_part_exercises import get_body_part_exercises, get_all_body_parts
import src.crud as crud
import random
import heapq
import pytz
from typing import Any
import logging


##### helper functions #####

def calculate_tfidf(freq_past_week: int, number_weeks_has_activity: int,
                    number_weeks_in_history: int) -> float:
    """
    :freq_past_week: how many times have this activity been recorded in the past week
    :number_weeks_has_activity: the number of weeks in which contains this activity
    :number_weeks_in_history: the number of weeks the user has data in our database
    """
    tf = math.log10(1 + freq_past_week)
    idf = math.log10((1 + number_weeks_in_history / 1 + number_weeks_has_activity))
    return tf * idf


def get_week_fitness_freq(db: Session, user_id: str, fitness_ids: list[int]) -> dict[int, int]:
    """
    query for how many times the user with user_id have done the
    activity with fitness_id in the past weel
    """
    now = datetime.now(timezone.utc)
    one_week_ago = now - timedelta(days=7)
    week_freq = db.query(models.FitnessActivity.activityType,
                         func.coalesce(func.count(models.FitnessActivity.id), 0)) \
        .filter(models.FitnessActivity.activityType.in_(fitness_ids)) \
        .filter(models.FitnessActivity.user_id == user_id) \
        .filter(models.FitnessActivity.startTime >= one_week_ago) \
        .group_by(models.FitnessActivity.activityType) \
        .all()
    # Convert to a dictionary
    week_freq = dict(week_freq)
    return week_freq


def get_week_counts_in_fitness(db: Session, user_id: str) -> int:
    """
    get how many weeks are there in total in the user's history
    """
    weeks = db.query(
        func.coalesce(func.count(func.distinct(func.date_trunc('week', models.FitnessActivity.startTime))), 0)) \
        .filter(models.FitnessActivity.user_id == user_id).scalar()
    return weeks


def get_week_count_with_activity(db: Session, user_id: str, fitness_ids: list[int]) -> dict[int, int]:
    """
    get how many weeks in the past had the user done the specific fitness activity
    """
    weeks = db.query(models.FitnessActivity.activityType,
                     func.count(func.date_trunc('week', models.FitnessActivity.startTime))) \
        .filter(models.FitnessActivity.activityType.in_(fitness_ids)) \
        .filter(models.FitnessActivity.user_id == user_id) \
        .group_by(models.FitnessActivity.activityType).all()
    return dict(weeks)


def get_week_muscle_freq(db: Session, user_id: str, muscles_exercises: list[str]) -> dict[str, int]:
    """
    query for how many times the user with user_id have done the
    exercise in the muscles list in the past weel
    """
    now = datetime.utcnow()
    one_week_ago = now - timedelta(days=7)
    week_freq = db.query(models.MuscleChoice.exercise,
                         func.coalesce(func.count(models.MuscleChoice.exercise), 0)) \
        .filter(models.MuscleChoice.exercise.in_(muscles_exercises)) \
        .filter(models.MuscleChoice.user_id == user_id) \
        .filter(models.MuscleChoice.time >= one_week_ago) \
        .group_by(models.MuscleChoice.exercise) \
        .all()
    # Convert to a dictionary
    week_freq = dict(week_freq)
    return week_freq


def get_week_counts_in_muscle(db: Session, user_id: str) -> int:
    """
    get how many weeks are there in total in the user's muscle_choice history
    """
    weeks = db.query(
        func.coalesce(func.count(func.distinct(func.date_trunc('week', models.MuscleChoice.time))), 0)) \
        .filter(models.MuscleChoice.user_id == user_id).scalar()
    return weeks


def get_week_count_with_activity_in_muscle(db: Session, user_id: str, muscles_exercises: list[str]) -> dict[str, int]:
    """
    for each muscles, get how many weeks in the past had 
    the user done the specific exercise in the muscles list
    """
    weeks = db.query(models.MuscleChoice.exercise,
                     func.count(func.date_trunc('week', models.MuscleChoice.time))) \
        .filter(models.MuscleChoice.exercise.in_(muscles_exercises)) \
        .filter(models.MuscleChoice.user_id == user_id) \
        .group_by(models.MuscleChoice.exercise).all()
    return dict(weeks)


def get_sleep_hour(sleep: schemas.SleepActivity) -> float:
    """
    :param sleep: a sleep activity
    :return: number of hours slept
    """
    return hours_between_datetime(sleep.endTime, sleep.startTime)


def get_average_sleep_hour(sleep_data: list[schemas.SleepActivity]) -> float:
    """
    :param sleep_data: list of sleep activities
    :return: average number of hours slept
    """
    sleep_hours = np.array([get_sleep_hour(sleep_point) for sleep_point in sleep_data])
    return float(np.mean(sleep_hours))


def analyze_sleep_trends(past_week_sleep_hours: list[schemas.SleepActivity]) -> str:
    """
    Analyzes the past week's sleep data and returns a string with the analysis
    :param past_week_sleep_hours: list of sleep activities from the past week
    :return: string
    """
    sleep_hours = [get_sleep_hour(sleep_point) for sleep_point in past_week_sleep_hours]
    trend = "flat"
    diff = np.diff(sleep_hours)
    if np.all(diff > 0):
        trend = "increasing"
    elif np.all(diff < 0):
        trend = "decreasing"
    return f"Overall, your sleep trend is {trend}. "


def _get_sleep_hours_according_to_age_range(age: int) -> int:
    """
    :param age: age of the user
    :return: recommended sleep hours according to age range
    """
    if age <= 2:
        return 13
    elif age <= 5:
        return 12
    elif age <= 13:
        return 10
    elif age <= 17:
        return 9
    elif age <= 64:
        return 8
    else:
        return 7


def _calculate_sleep_debt(sleep_hour: float, sleep_goal: int) -> float:
    """
    :param sleep_hour: number of hours slept
    :param sleep_goal: recommended number of hours to sleep
    :return: sleep debt in hours
    """
    return sleep_goal - sleep_hour


def _convert_hours_to_minutes(hours: float) -> str:
    """
    :param hours: number of hours
    :return: number of minutes if hours < 1, else return hours
    """
    if hours < 1:
        return f"{math.floor(hours * 60)} more minutes"
    return f"{hours} more hours"


def _recommend_lifting_exercise(body_parts: list[str], db: Session, user_id: str) -> tuple[list[dict[str, str]], str]:
    """
    :param body_parts: list of body types
    :return: a list of exercise
    """
    exercise_list = []
    if 'no preference' in body_parts:
        # Randomly choose 3 body part
        body_parts = random.sample(get_all_body_parts(), 3)
    # Capital all body parts
    body_parts = [body_part.capitalize() for body_part in body_parts]
    all_exercise = []
    exercise_metadata = {}
    for body_part in body_parts:
        body_part_exercise = get_body_part_exercises(body_part)
        for _exer in body_part_exercise:
            all_exercise.append(_exer['name'])
            exercise_metadata[_exer['name']] = {'url': _exer['url'], 'body_part': body_part}
    T_freq_dict = get_week_muscle_freq(db, user_id, all_exercise)
    if len(T_freq_dict) == 0:
        "if no exercise in list was done within the past week, randomly recommend"
        for body_part in body_parts:
            exercise_list.append(random.choice(get_body_part_exercises(body_part)))
    else:
        N = get_week_counts_in_muscle(db, user_id)
        D_freq_dict = get_week_count_with_activity_in_muscle(db, user_id, all_exercise)
        for exercise in all_exercise:
            if exercise in T_freq_dict:
                T_freq = T_freq_dict[exercise]
            else:
                T_freq = 0
            if exercise in D_freq_dict:
                D_freq = D_freq_dict[exercise]
            else:
                D_freq = 0
            score = -calculate_tfidf(T_freq, D_freq, N)
            heapq.heappush(exercise_list, (score, exercise))
        exercise_list = heapq.nsmallest(length_function(len(exercise_list)), exercise_list)
        exercise_list = [{'name': exercise[1], 'url': exercise_metadata[exercise[1]]['url'],
                          'body_part': exercise_metadata[exercise[1]]['body_part'],
                          'checked': False} for exercise
                         in exercise_list]
    # Generate comment based on the body parts, put an 'and' before the last body part
    body_parts_str = ", ".join(body_parts[:-1]) + " and " + body_parts[-1]
    comment = f"Here are some exercises for your {body_parts_str}: "
    return exercise_list, comment


def length_function(length) -> int:
    """
    This function puts a limit on how many exercises to recommend
    :param length: length of the list
    :return: length of the list if length > 10, else return 10
    """
    return 10 if length > 10 else length


def _recommend_weight_loss_exercise(preference_list: list[str],
                                    db: Session, user_id: str,
                                    activties_map: dict[str | int, str | int],
                                    all_activities: list[str]) -> tuple[list[dict[str, Any]], str]:
    """
    :param preference_list: list of preferences
    :param db: database
    :param user_id: user id
    :param activties_map: map of activity id to activity name
    :param all_activities: list of all activities
    """
    exercise_list = []
    if 'no preference' in preference_list:
        exercise_list = random.sample(all_activities, 10)
        exercise_list = [{'name': exercise, 'url': ''} for exercise in exercise_list]
        comment = "Here are some exercises for you: "
        return exercise_list, comment
    else:
        N = get_week_counts_in_fitness(db, user_id)
        all_act = [activties_map[x] for x in all_activities]
        T_freq_dict = get_week_fitness_freq(db, user_id, all_act)
        D_freq_dict = get_week_count_with_activity(db, user_id, all_act)
        for preference in preference_list:
            activity_id = activties_map[preference]
            if activity_id in T_freq_dict:
                T_freq = T_freq_dict[activity_id]
            else:
                T_freq = 0
            if activity_id in D_freq_dict:
                D_freq = D_freq_dict[activity_id]
            else:
                D_freq = 0
            score = -calculate_tfidf(T_freq, D_freq, N)
            heapq.heappush(exercise_list, (score, preference))
        comment = f"Here are exercise recommended to you based on your preference list: "
        # Pop all the exercises from the heap
        return [{'name': heapq.heappop(exercise_list)[1], 'url': ''} for _ in
                range(length_function(len(exercise_list)))], comment


class RecommendationEngine:
    def __init__(self, user: schemas.UserGet, summarize: bool):
        self.weight = user.weight
        self.height = user.height
        self._user = user
        self.goal_dict = {}
        for i in range(len(user.goals)):
            self.goal_dict[user.goals[i]] = user.goals_quantity[i]
        now = datetime.now()
        age_timedelta = now - user.birthday
        self.age = math.floor(age_timedelta.total_seconds() / 31536000)
        self._summarize = summarize

    def get_hydration_recommendation(self, water_drank_so_far: float, exercise_hours: float) -> dict[str, str | float]:
        """

        :param water_drank_so_far: water drank so far in ounces
        :param exercise_hours: number of hours of exercise
        :return: a dictionary with a comment
        """
        # the goal of water that the person should be having in liters 

        goal = self.goal_dict.get('hydration', 0)
        if goal is None or int(goal) == 0:
            goal = ((self.weight / 2) + (exercise_hours * 2 * 12)) * 0.029574
        if self._summarize:
            if water_drank_so_far > goal:
                return {"score": round(100 / 3, 2)}
            return {"score": round((water_drank_so_far / goal) * (100 / 3), 2)}
        # Convert liters to ounces
        remaining_water = int((goal - water_drank_so_far) * 33.814)
        comment = f"You have drank {math.floor(water_drank_so_far * 33.814)} ounces of water today. "
        if remaining_water <= 0:
            comment += "You did it :-). You have drank enough water for today!"
        elif remaining_water > goal / 2:
            comment += f"Still some work to go! {remaining_water} ounces to go!"
        else:
            comment += f"Great Job, Keep it up! Only {remaining_water} ounces to go!"
        return {"comment": comment}

    def get_fitness_recommendation(self,
                                   db: Session, user_id: str, activties_map: dict[str | int, str | int]) -> dict[
        str, str | list[str] | float]:
        """
        :param db: database session
        :param user_id: user id
        :param activties_map: map of activity name to activity id and vice versa
        :return: a dictionary with a comment and a list of exercise or a score
        """
        if self._summarize:
            a_week_ago = datetime.now(timezone.utc) - timedelta(days=7)
            exercise_hour_benchmark = 7
            num_muscle_workout_benchmark = 2
            exercise_hour = crud.get_exercises(db, user_id, a_week_ago)
            exercise_hour_score = exercise_hour / exercise_hour_benchmark
            num_muscle_workout = crud.get_muscle_session(db, user_id, a_week_ago)
            num_muscle_workout_score = num_muscle_workout / num_muscle_workout_benchmark
            score = round((exercise_hour_score + num_muscle_workout_score) / 2 * 1, 2)
            if score > 1:
                score = 1
            return {"score": round(score * (100 / 3), 2)}
        exercise_list = []
        comment = ""
        all_body_parts = get_all_body_parts()
        all_activities = get_all_activities()
        latest_user_preference = crud.get_latest_preference(db, user_id, self._user.goals[0])
        body_parts = []
        if latest_user_preference is not None:
            goal = latest_user_preference.type
            body_parts = latest_user_preference.preferenceArray
        else:
            goal = random.choice(["muscles", "weight"])
            # Randomly choose 3 body part
            match goal:
                case "muscles":
                    body_parts = random.sample(all_body_parts, 3)
                case "weight":
                    body_parts = random.sample(all_activities, 3)
        match goal:
            case "muscles":
                # Recommend lifting exercises
                exercise_list, comment = _recommend_lifting_exercise(body_parts, db, user_id)
            case "weight":
                exercise_list, comment = _recommend_weight_loss_exercise(body_parts,
                                                                         db,
                                                                         user_id,
                                                                         activties_map,
                                                                         all_activities)

                # Recommend weight loss exercises
        return {"comment": comment, "exercise_list": exercise_list}

    def get_sleep_recommendation(self, past_week_sleep_hours: list[schemas.SleepActivity]) -> dict[str, str | float]:
        """
        :param past_week_sleep_hours: list of sleep activities in the past week
        :return: a dictionary with a comment
        """
        avg_sleep = get_average_sleep_hour(past_week_sleep_hours)
        sleep_goal = self.goal_dict.get('sleep')
        if sleep_goal == 0 or sleep_goal is None:
            sleep_goal = _get_sleep_hours_according_to_age_range(self.age)
        goal_percent = avg_sleep / sleep_goal
        if self._summarize:
            if goal_percent > 1:
                return {"score": round(100 / 3, 2)}
            return {"score": goal_percent * (100 / 3)}
        comment = analyze_sleep_trends(past_week_sleep_hours)
        sleep_debt = [_calculate_sleep_debt(get_sleep_hour(sleep_point), sleep_goal) for sleep_point in
                      past_week_sleep_hours]
        # The sleep debt is the sum of all the sleep debt in the past week
        # or 0 if the sleep debt is negative
        sleep_debt = np.array(sleep_debt)
        sleep_debt[sleep_debt < 0] = 0
        extra_sleep_hours = np.sum(sleep_debt)
        average_extra_sleep = round(extra_sleep_hours / 7, 2)
        if extra_sleep_hours > 0:
            comment += f"In this past week, you have accumulated {round(extra_sleep_hours, 2)} hours of sleep debt. " \
                       f"To pay back this debt, you should sleep " \
                       f"{_convert_hours_to_minutes(average_extra_sleep)} each day in the next 7 days."
        if goal_percent < 0.5:
            comment += f" You NEED to get more sleep, you should sleep about {sleep_goal - avg_sleep} hours earlier "
        elif goal_percent < 0.75:
            comment += f" You should sleep a bit earlier, you're almost at you goal."
        elif goal_percent < 0.9:
            comment += f" Good Job, your average sleep in the past week is {avg_sleep} hours. So close!"
        else:
            comment += f" Fantastic Job, you achieved your sleeping goal!"

        # Convert to the timezone of the user, which is Pacific Time
        last_wake_up = past_week_sleep_hours[-1].endTime

        last_wake_up = last_wake_up.replace(tzinfo=timezone.utc).astimezone(tz=pytz.timezone("US/Pacific"))

        last_sleep_duration = get_sleep_hour(past_week_sleep_hours[-1])

        next_bed_time = last_wake_up + timedelta(hours=(24 - last_sleep_duration))
        next_wake_up = next_bed_time + timedelta(hours=(sleep_goal + average_extra_sleep))

        return {
            "comment": comment,
            # Return the time in the fomrat of 'HH:MM'
            "next_bed_time": next_bed_time.strftime("%H:%M"),
            "next_wake_time": next_wake_up.strftime("%H:%M")
        }
