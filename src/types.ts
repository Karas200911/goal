export type ID = string;

export type RepeatMode = 'once' | 'daily' | 'weekdays';

export interface Task {
  id: ID;
  title: string;
  date: string;
  completed: boolean;
  seriesId?: string;
}

export interface Week {
  id: ID;
  title: string;
  startDate: string;
  endDate?: string;
  tasks: Task[];
}

export interface Month {
  id: ID;
  title: string;
  year: number;
  month: number;
  weeks: Week[];
}

export interface Goal {
  id: ID;
  title: string;
  description: string;
  startDate: string;
  deadline: string;
  createdAt: string;
  months: Month[];
}

export type GoalStatus = 'noTasks' | 'inProgress' | 'done' | 'overdue';

export type PeriodMark = 'done' | 'current' | 'upcoming';

export interface Progress {
  done: number;
  total: number;
}

export interface TaskLocation {
  goalId: ID;
  monthId: ID;
  weekId: ID;
  task: Task;
}

export type SelectedScope =
  | { kind: 'all' }
  | { kind: 'goal'; goalId: ID };
