export interface GFitOptions {
  access_token: string;
  pullSleepFitness?: boolean;
  pullHydration?: boolean;
  pullSteps?: boolean;
  pullCalories?: boolean;
  pullDistance?: boolean;
}


export interface StatOptions {
  start_time: string;
  end_time: string;
  which_tables: string[];
  aggregate_types: string[];
  summarize?: boolean;
}
