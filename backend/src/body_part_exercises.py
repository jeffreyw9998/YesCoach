import numpy as np
body_part_exercises = {
    "Chest": [
        {"name": "Barbell bench press", "url": "https://www.muscleandstrength.com/exercises/barbell-bench-press.html"},
        {"name": "Dumbbell bench press", "url": "https://barbend.com/dumbbell-bench-press/"},
        {"name": "Incline bench press", "url": "https://www.muscleandstrength.com/exercises/incline-bench-press.html"},
        {"name": "Push ups", "url": "https://www.verywellfit.com/the-push-up-exercise-3120574"},
        {"name": "Cable chest fly",
         "url": "https://www.muscleandstrength.com/exercises/cable-crossovers-(mid-chest).html"}
    ],
    "Back": [{"name": "Pull-ups",
              "url": "https://www.cnet.com/health/fitness/your-step-by-step-guide-to-mastering-a-pull-up/"},
             {"name": "Lat pulldowns",
              "url": "https://www.puregym.com/exercises/back/lat-exercises/#:~:text=Stand%20up%20and%20grab%20the%20bar%20with%20palms%20facing%20each,back%20to%20the%20starting%20position."},
             {"name": "Seated rows", "url": "https://www.verywellfit.com/how-to-do-the-cable-row-3498605"},
             {"name": "Barbell deadlifts", "url": "https://www.self.com/story/how-to-do-a-deadlift"},
             {"name": "Dumbbell rows", "url": "https://barbend.com/dumbbell-row/"}],
    "Shoulders": [{"name": "Barbell shoulder press",
                   "url": "https://www.verywellfit.com/how-to-do-the-barbell-shoulder-press-4842906"},
                  {"name": "Dumbbell shoulder press",
                   "url": "https://www.muscleandstrength.com/exercises/dumbbell-lateral-raise.html"},
                  {"name": "Lateral raises",
                   "url": "https://www.muscleandstrength.com/exercises/dumbbell-lateral-raise.html"},
                  {"name": "Face pulls",
                   "url": "https://www.verywellfit.com/face-pulls-exercise-for-stronger-shoulders-4161298"}],
    "Biceps": [{"name": "Barbell curls", "url": "https://barbend.com/barbell-curl/"},
               {"name": "Dumbbell curls", "url": "https://www.verywellfit.com/how-to-do-the-biceps-arm-curl-3498604"},
               {"name": "Preacher curls",
                "url": "https://www.coachweb.com/biceps-exercises/7405/how-to-do-the-preacher-curl"},
               {"name": "Hammer curls", "url": "https://barbend.com/hammer-curls/"}],
    "Triceps": [
        {"name": "Tricep pushdowns", "url": "https://www.verywellfit.com/how-to-do-the-triceps-pushdown-3498613"},
        {"name": "Overhead tricep extensions",
         "url": "https://www.coachweb.com/tricep-exercises/6053/how-to-do-an-overhead-dumbbell-tricep-extension"},
        {"name": "Skull crushers",
         "url": "https://www.verywellfit.com/doing-the-triceps-extension-skullcrusher-3498313"},
        {"name": "Dips", "url": "https://stronglifts.com/dips/"}],
    "Legs": [{"name": "Barbell squats",
              "url": "https://www.coachweb.com/barbell-exercises/6705/how-to-master-the-barbell-back-squat"},
             {"name": "Deadlifts", "url": "https://www.self.com/story/how-to-do-a-deadlift"},
             {"name": "Leg press", "url": "https://www.verywellfit.com/how-to-do-the-leg-press-3498610"},
             {"name": "Lunges", "url": "https://www.self.com/story/how-to-do-lunges"},
             {"name": "Calf raises", "url": "https://www.verywellfit.com/how-to-do-calf-raises-4801090"}],
    "Abs": [{"name": "Crunces", "url": "https://www.wikihow.com/Do-Crunches"},
                   {"name": "Planks", "url": "https://www.verywellfit.com/the-plank-exercise-3120068"},
                   {"name": "Russian twists",
                    "url": "https://www.womenshealthmag.com/fitness/a26011033/russian-twist/"},
                   {"name": "Leg raises", "url": "https://health.clevelandclinic.org/how-to-do-leg-lifts/"},
                   {"name": "Bicycle crunches", "url": "https://www.verywellfit.com/bicycle-crunch-exercise-3120058"}]
}


def get_body_part_exercises(body_part: str) -> list[dict[str, str]]:
    """Returns a list of exercises for the given body part"""
    return body_part_exercises.get(body_part, [])


def get_all_body_parts() -> list[str]:
    """Returns a list of all body parts"""
    return list(body_part_exercises.keys())
