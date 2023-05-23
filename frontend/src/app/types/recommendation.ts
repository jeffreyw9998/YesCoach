
interface Comment{
  comment: string;
}


interface SleepComment extends Comment{
  next_bed_time: string;
  next_wake_time: string;
}

interface FitnessComment extends Comment{
  exercise_list: {name: string, url: string}[];
}

export interface Recommendation{
  fitness?: FitnessComment;
  hydration?: Comment;
  sleep?: SleepComment;
}
