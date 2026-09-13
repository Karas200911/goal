import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { parseISODate, todayISO } from './dates';
import {
  addTasksToGoal,
  createGoal,
  dateInWeek,
  ensureMonthAndWeek,
  focusDateForGoal,
  locateTask,
  rebuildGoalPlan,
  repeatDates,
  weekEnd,
} from './plan';
import { translate } from './i18n';
import { loadGoals, saveGoals } from './storage';
import type { Goal, RepeatMode, SelectedScope, Task } from './types';

interface StoreValue {
  goals: Goal[];
  scope: SelectedScope;
  selectedDate: string;
  selectedMonthId: string | null;
  selectedWeekId: string | null;
  selectAll: () => void;
  selectGoal: (goalId: string) => void;
  selectDate: (date: string) => void;
  selectMonth: (monthId: string) => void;
  selectWeek: (weekId: string | null) => void;
  goToToday: () => void;
  addGoal: (input: { title: string; description: string; startDate: string; deadline: string }) => string;
  updateGoal: (goalId: string, input: { title: string; description: string; startDate: string; deadline: string }) => void;
  deleteGoal: (goalId: string) => void;
  addTask: (goalId: string, title: string, date: string, repeat?: { mode: RepeatMode; until: string }) => void;
  updateTask: (taskId: string, patch: Partial<Pick<Task, 'title' | 'date' | 'completed'>>) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, date: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function withGoal(goals: Goal[], goalId: string, updater: (goal: Goal) => Goal): Goal[] {
  return goals.map((goal) => (goal.id === goalId ? updater(goal) : goal));
}

function currentPlanSelection(goal: Goal | undefined, date: string) {
  if (!goal) return { monthId: null, weekId: null };
  const parsed = parseISODate(date);
  const month =
    goal.months.find((item) => item.year === parsed.getFullYear() && item.month === parsed.getMonth() + 1) ??
    goal.months[0];
  const week = month?.weeks.find((item) => dateInWeek(item, date)) ?? month?.weeks[0];
  return { monthId: month?.id ?? null, weekId: week?.id ?? null };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>(() => loadGoals());
  const [scope, setScope] = useState<SelectedScope>({ kind: 'all' });
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [selectedMonthId, setSelectedMonthId] = useState<string | null>(null);
  const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null);

  useEffect(() => {
    saveGoals(goals);
  }, [goals]);

  useEffect(() => {
    if (scope.kind === 'goal' && !goals.some((goal) => goal.id === scope.goalId)) {
      setScope({ kind: 'all' });
    }
  }, [goals, scope]);

  const value = useMemo<StoreValue>(() => {
    const selectedGoal = scope.kind === 'goal' ? goals.find((goal) => goal.id === scope.goalId) : undefined;

    const applyDateSelection = (goal: Goal | undefined, date: string) => {
      const next = currentPlanSelection(goal, date);
      setSelectedMonthId(next.monthId);
      setSelectedWeekId(next.weekId);
    };

    return {
      goals,
      scope,
      selectedDate,
      selectedMonthId,
      selectedWeekId,
      selectAll: () => {
        setScope({ kind: 'all' });
        setSelectedDate(todayISO());
        setSelectedMonthId(null);
        setSelectedWeekId(null);
      },
      selectGoal: (goalId) => {
        const goal = goals.find((item) => item.id === goalId);
        setScope({ kind: 'goal', goalId });
        applyDateSelection(goal, selectedDate);
      },
      selectDate: (date) => {
        setSelectedDate(date);
        applyDateSelection(selectedGoal, date);
      },
      selectMonth: (monthId) => {
        setSelectedMonthId(monthId);
      },
      selectWeek: (weekId) => {
        if (!weekId) {
          setSelectedWeekId(null);
          return;
        }
        setSelectedWeekId(weekId);
        const month = selectedGoal?.months.find((item) => item.weeks.some((week) => week.id === weekId));
        const week = month?.weeks.find((item) => item.id === weekId);
        if (month) setSelectedMonthId(month.id);
        if (week && (selectedDate < week.startDate || selectedDate > weekEnd(week))) {
          setSelectedDate(week.startDate);
        }
      },
      goToToday: () => {
        const today = todayISO();
        setSelectedDate(today);
        applyDateSelection(selectedGoal, today);
      },
      addGoal: (input) => {
        if (!input.title.trim() || !input.startDate || !input.deadline) return '';
        const goal = createGoal(input);
        const focus = focusDateForGoal(goal);
        setGoals((current) => [...current, goal]);
        setScope({ kind: 'goal', goalId: goal.id });
        setSelectedDate(focus);
        applyDateSelection(goal, focus);
        return goal.id;
      },
      updateGoal: (goalId, input) => {
        setGoals((current) =>
          withGoal(current, goalId, (goal) => {
            const startDate = input.startDate <= input.deadline ? input.startDate : input.deadline;
            const deadline = input.deadline >= startDate ? input.deadline : startDate;
            return {
              ...rebuildGoalPlan(goal, startDate, deadline),
              title: input.title.trim(),
              description: input.description.trim(),
            };
          }),
        );
      },
      deleteGoal: (goalId) => {
        if (!window.confirm(translate('deleteGoalConfirm'))) return;
        setGoals((current) => current.filter((goal) => goal.id !== goalId));
        setScope({ kind: 'all' });
      },
      addTask: (goalId, title, date, repeat) => {
        setGoals((current) =>
          withGoal(current, goalId, (goal) => {
            const dates = repeatDates(date, repeat?.until ?? date, repeat?.mode ?? 'once');
            return addTasksToGoal(goal, title, dates);
          }),
        );
      },
      updateTask: (taskId, patch) => {
        if (patch.date) {
          const location = locateTask(goals, taskId);
          if (location && location.task.date !== patch.date) {
            const title = patch.title ?? location.task.title;
            const completed = patch.completed ?? location.task.completed;
            setGoals((current) => moveTaskBetweenDates(current, taskId, patch.date as string, { title, completed }));
            return;
          }
        }
        setGoals((current) =>
          current.map((goal) => ({
            ...goal,
            months: goal.months.map((month) => ({
              ...month,
              weeks: month.weeks.map((week) => ({
                ...week,
                tasks: week.tasks.map((task) => (task.id === taskId ? { ...task, ...patch } : task)),
              })),
            })),
          })),
        );
      },
      toggleTask: (taskId) => {
        setGoals((current) =>
          current.map((goal) => ({
            ...goal,
            months: goal.months.map((month) => ({
              ...month,
              weeks: month.weeks.map((week) => ({
                ...week,
                tasks: week.tasks.map((task) =>
                  task.id === taskId ? { ...task, completed: !task.completed } : task,
                ),
              })),
            })),
          })),
        );
      },
      deleteTask: (taskId) => {
        setGoals((current) =>
          current.map((goal) => ({
            ...goal,
            months: goal.months.map((month) => ({
              ...month,
              weeks: month.weeks.map((week) => ({
                ...week,
                tasks: week.tasks.filter((task) => task.id !== taskId),
              })),
            })),
          })),
        );
      },
      moveTask: (taskId, date) => {
        setGoals((current) => moveTaskBetweenDates(current, taskId, date));
      },
    };
  }, [goals, scope, selectedDate, selectedMonthId, selectedWeekId]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function moveTaskBetweenDates(
  goals: Goal[],
  taskId: string,
  date: string,
  overrides?: { title?: string; completed?: boolean },
): Goal[] {
  const location = locateTask(goals, taskId);
  if (!location) return goals;

  return goals.map((goal) => {
    if (goal.id !== location.goalId) return goal;
    const withoutTask: Goal = {
      ...goal,
      months: goal.months.map((month) => ({
        ...month,
        weeks: month.weeks.map((week) => ({
          ...week,
          tasks: week.tasks.filter((task) => task.id !== taskId),
        })),
      })),
    };
    const ensured = ensureMonthAndWeek(withoutTask, date);
    const moved: Task = {
      ...location.task,
      title: overrides?.title ?? location.task.title,
      completed: overrides?.completed ?? location.task.completed,
      date,
    };
    return {
      ...withoutTask,
      months: ensured.months.map((month) =>
        month.id === ensured.monthId
          ? {
              ...month,
              weeks: month.weeks.map((week) =>
                week.id === ensured.weekId ? { ...week, tasks: [...week.tasks, moved] } : week,
              ),
            }
          : month,
      ),
    };
  });
}

export function useStore(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useStore must be used within StoreProvider');
  return value;
}
