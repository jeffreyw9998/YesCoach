
interface Activity{
  user_id: string,
  id: string,
  name?: string
  description?: string
  startTime: string
  endTime: string
  modifiedTime: string
}

interface FitnessActivity extends Activity{
  activityType: number,
  activeTimeSeconds: number,
}


interface SleepActivity extends Activity{

}

interface Aggregate{
  aggregate_type: string,
  user_id: string,
  startTime: string,
  endTime: string,
  quantity: number,
}


export type Stats = {
  'aggregate': Aggregate[] | any,
  'sleep': SleepActivity[] | any,
  'fitness_activity': FitnessActivity[] | any,
}
