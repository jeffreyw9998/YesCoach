interface BaseActivity {
  user_id: string,
  id: string,
  name?: string
  description?: string
  startTime: string
  endTime: string
  modifiedTime: string
}

interface FitnessActivity extends BaseActivity {
  activityType: number,
  activeTimeSeconds: number,
}


interface SleepActivity extends BaseActivity {

}

interface Aggregate {
  aggregate_type: string,
  user_id: string,
  startTime: string,
  endTime: string,
  quantity: number,
}


export interface Slumber {
  date: string,
  start: string,
  end: string,
}

export interface BasicStats {
  steps: string,
  distance: string,
  sleepHours: string,
  burnedCalories: string,
}

export interface Water{
  date: string,
  amount: string,
}

export interface SummarizedActivity {
  name: string,
  date: string,
  duration: string,
}

export type Stats = {
  'aggregate': Aggregate[] | Array<any>,
  'sleep': SleepActivity[] | Array<any>,
  'fitness': FitnessActivity[] | Array<any>,
}
