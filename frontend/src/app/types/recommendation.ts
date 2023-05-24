interface Comment {
  comment: string;
  score?: number;
}


interface SleepComment extends Comment {
  next_bed_time: string;
  next_wake_time: string;
}

export interface Exercise {
  name: string,
  url: string,
  checked?: boolean,
  body_part?: string
}

interface FitnessComment extends Comment {
  exercise_list: Exercise[];
}

export interface Recommendation {
  fitness?: FitnessComment;
  hydration?: Comment;
  sleep?: SleepComment;
  comment?: string;
}
