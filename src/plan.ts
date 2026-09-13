import {
  addDays,
  addMonths,
  clampDate,
  eachDate,
  formatWeekRange,
  isWeekday,
  maxISODate,
  minISODate,
  monthLabel,
  parseISODate,
  startOfWeek,
  toISODate,
  todayISO,
  uid,
} from './dates';
import type { Goal, GoalStatus, Month, PeriodMark, Progress, RepeatMode, Task, TaskLocation, Week } from './types';

export function progressOf(tasks: Task[]): Progress {
  return {
    done: tasks.filter((task) => task.completed).length,
    total: tasks.length,
  };
}

export function percent(progress: Progress): number {
  if (progress.total === 0) return 0;
  return Math.round((progress.done / progress.total) * 100);
}

export function allTasks(goal: Goal): Task[] {
  return goal.months.flatMap((month) => month.weeks.flatMap((week) => week.tasks));
}

export function tasksOnDate(goal: Goal, date: string): Task[] {
  return allTasks(goal).filter((task) => task.date === date);
}

export function collectTasks(goals: Goal[], date?: string): TaskLocation[] {
  const result: TaskLocation[] = [];
  for (const goal of goals) {
    for (const month of goal.months) {
      for (const week of month.weeks) {
        for (const task of week.tasks) {
          if (!date || task.date === date) {
            result.push({ goalId: goal.id, monthId: month.id, weekId: week.id, task });
          }
        }
      }
    }
  }
  return result;
}

export function goalProgress(goal: Goal): Progress {
  return progressOf(allTasks(goal));
}

export function dayProgress(goal: Goal, date: string): Progress {
  return progressOf(tasksOnDate(goal, date));
}

export function weekProgress(week: Week): Progress {
  return progressOf(week.tasks);
}

export function monthProgress(month: Month): Progress {
  return progressOf(month.weeks.flatMap((week) => week.tasks));
}

export function combinedProgress(goals: Goal[], date?: string): Progress {
  const tasks = collectTasks(goals, date).map((item) => item.task);
  return progressOf(tasks);
}

export function currentWeekRange(): { start: string; end: string } {
  const start = toISODate(startOfWeek(new Date()));
  return { start, end: toISODate(addDays(parseISODate(start), 6)) };
}

export function currentMonthRange(): { start: string; end: string; title: string } {
  const now = new Date();
  const start = toISODate(new Date(now.getFullYear(), now.getMonth(), 1));
  const end = toISODate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  return { start, end, title: monthLabel(now.getFullYear(), now.getMonth() + 1) };
}

export function rangeProgress(goals: Goal[], start: string, end: string): Progress {
  const tasks = collectTasks(goals)
    .map((item) => item.task)
    .filter((task) => task.date >= start && task.date <= end);
  return progressOf(tasks);
}

export function goalStatus(goal: Goal): GoalStatus {
  const tasks = allTasks(goal);
  if (tasks.length === 0) return 'noTasks';
  if (tasks.every((task) => task.completed)) return 'done';
  if (todayISO() > goal.deadline && tasks.some((task) => !task.completed)) return 'overdue';
  return 'inProgress';
}

export function weekEnd(week: Week): string {
  if (week.endDate) return week.endDate;
  const start = parseISODate(week.startDate);
  const sunday = toISODate(addDays(startOfWeek(start), 6));
  const lastInMonth = toISODate(new Date(start.getFullYear(), start.getMonth() + 1, 0));
  return minISODate(sunday, lastInMonth);
}

export function weekLabel(week: Week): string {
  return formatWeekRange(week.startDate, weekEnd(week));
}

export function dateInWeek(week: Week, date: string): boolean {
  return date >= week.startDate && date <= weekEnd(week);
}

export function monthStart(month: Month): string {
  return toISODate(new Date(month.year, month.month - 1, 1));
}

export function monthEnd(month: Month): string {
  return toISODate(new Date(month.year, month.month, 0));
}

export function periodMark(start: string, end: string, progress: Progress): PeriodMark {
  const today = todayISO();
  if (today >= start && today <= end) return 'current';
  if (today < start) return 'upcoming';
  if (progress.total === 0 || progress.done === progress.total) return 'done';
  return 'upcoming';
}

export function weekMark(week: Week): PeriodMark {
  return periodMark(week.startDate, weekEnd(week), weekProgress(week));
}

export function monthMark(month: Month): PeriodMark {
  return periodMark(monthStart(month), monthEnd(month), monthProgress(month));
}

export function markSymbol(mark: PeriodMark): string {
  if (mark === 'done') return '✓';
  if (mark === 'current') return '→';
  return '○';
}

export function generateWeeksForMonth(year: number, month: number, fromISO?: string, toISO?: string): Week[] {
  const calendarFirst = toISODate(new Date(year, month - 1, 1));
  const calendarLast = toISODate(new Date(year, month, 0));
  const first = fromISO ? maxISODate(calendarFirst, fromISO) : calendarFirst;
  const last = toISO ? minISODate(calendarLast, toISO) : calendarLast;
  if (first > last) return [];

  const weeks: Week[] = [];
  let cursor = parseISODate(first);

  while (cursor <= parseISODate(last)) {
    const start = toISODate(cursor);
    const sunday = toISODate(addDays(startOfWeek(cursor), 6));
    const end = minISODate(sunday, last);
    weeks.push({
      id: uid(),
      title: formatWeekRange(start, end),
      startDate: start,
      endDate: end,
      tasks: [],
    });
    cursor = addDays(parseISODate(end), 1);
  }

  return weeks;
}

export function createMonth(year: number, month: number, fromISO?: string, toISO?: string): Month {
  return {
    id: uid(),
    title: monthLabel(year, month),
    year,
    month,
    weeks: generateWeeksForMonth(year, month, fromISO, toISO),
  };
}

export function generatePlan(from: Date, deadline: Date): Month[] {
  const fromISO = toISODate(from);
  const deadlineISO = toISODate(deadline);
  const months: Month[] = [];
  const start = new Date(from.getFullYear(), from.getMonth(), 1);
  const end = new Date(deadline.getFullYear(), deadline.getMonth(), 1);

  for (let cursor = new Date(start); cursor <= end; cursor = addMonths(cursor, 1)) {
    months.push(createMonth(cursor.getFullYear(), cursor.getMonth() + 1, fromISO, deadlineISO));
  }

  return months;
}

export function rebuildGoalPlan(goal: Goal, startDate: string, deadline: string): Goal {
  const tasks = allTasks(goal);
  const months = generatePlan(parseISODate(startDate), parseISODate(deadline));
  return tasks.reduce((current, task) => addTaskToGoal(current, task), { ...goal, startDate, deadline, months });
}

export function createGoal(input: {
  title: string;
  description: string;
  startDate: string;
  deadline: string;
}): Goal {
  if (!input.title.trim() || !input.startDate || !input.deadline) {
    throw new Error('Goal requires a title, start date, and deadline');
  }
  const startDate = maxISODate(
    input.startDate <= input.deadline ? input.startDate : input.deadline,
    todayISO(),
  );
  const deadline = input.deadline >= startDate ? input.deadline : startDate;

  return {
    id: uid(),
    title: input.title.trim(),
    description: input.description.trim(),
    startDate,
    deadline,
    createdAt: new Date().toISOString(),
    months: generatePlan(parseISODate(startDate), parseISODate(deadline)),
  };
}

export function focusDateForGoal(goal: Goal, preferred = todayISO()): string {
  return clampDate(preferred, goal.startDate, goal.deadline);
}

export function repeatDates(start: string, until: string, mode: RepeatMode): string[] {
  if (mode === 'once') return [start];
  const end = until < start ? start : until;
  const dates = eachDate(start, end, mode === 'weekdays' ? isWeekday : undefined);
  return dates.length > 0 ? dates : [start];
}

export function addTaskToGoal(goal: Goal, task: Task): Goal {
  const ensured = ensureMonthAndWeek(goal, task.date);
  return {
    ...goal,
    months: ensured.months.map((month) =>
      month.id === ensured.monthId
        ? {
            ...month,
            weeks: month.weeks.map((week) =>
              week.id === ensured.weekId ? { ...week, tasks: [...week.tasks, task] } : week,
            ),
          }
        : month,
    ),
  };
}

export function addTasksToGoal(goal: Goal, title: string, dates: string[]): Goal {
  const trimmed = title.trim();
  if (!trimmed || dates.length === 0) return goal;
  const seriesId = dates.length > 1 ? uid() : undefined;
  return dates.reduce(
    (next, date) => addTaskToGoal(next, { id: uid(), title: trimmed, date, completed: false, seriesId }),
    goal,
  );
}

export function findCurrentMonth(goal: Goal): Month | undefined {
  const today = new Date();
  return (
    goal.months.find((month) => month.year === today.getFullYear() && month.month === today.getMonth() + 1) ??
    goal.months[0]
  );
}

export function findCurrentWeek(goal: Goal): Week | undefined {
  const today = todayISO();
  return findWeekForDate(goal, today)?.week ?? goal.months[0]?.weeks[0];
}

export function findWeekForDate(goal: Goal, date: string): { month: Month; week: Week } | null {
  const parsed = parseISODate(date);
  const month = goal.months.find((item) => item.year === parsed.getFullYear() && item.month === parsed.getMonth() + 1);
  const week = month?.weeks.find((item) => dateInWeek(item, date));
  return month && week ? { month, week } : null;
}

export function ensureMonthAndWeek(goal: Goal, date: string): { months: Month[]; monthId: string; weekId: string } {
  const parsed = parseISODate(date);
  const year = parsed.getFullYear();
  const monthNumber = parsed.getMonth() + 1;
  const months = goal.months.map((month) => ({
    ...month,
    weeks: month.weeks.map((week) => ({ ...week, tasks: [...week.tasks] })),
  }));

  let month = months.find((item) => item.year === year && item.month === monthNumber);
  if (!month) {
    month = createMonth(year, monthNumber, goal.startDate, goal.deadline);
    months.push(month);
    months.sort((a, b) => a.year - b.year || a.month - b.month);
  }

  let week = month.weeks.find((item) => dateInWeek(item, date));
  if (!week) {
    const start = maxISODate(toISODate(startOfWeek(parsed)), maxISODate(monthStart(month), goal.startDate));
    const end = minISODate(toISODate(addDays(startOfWeek(parsed), 6)), minISODate(monthEnd(month), goal.deadline));
    week = {
      id: uid(),
      title: formatWeekRange(start, end),
      startDate: start,
      endDate: end,
      tasks: [],
    };
    month.weeks.push(week);
    month.weeks.sort((a, b) => a.startDate.localeCompare(b.startDate));
  }

  return { months, monthId: month.id, weekId: week.id };
}

function isLegacyWeek(week: Week, month: Month): boolean {
  const start = parseISODate(week.startDate);
  return (
    !week.endDate ||
    start.getFullYear() !== month.year ||
    start.getMonth() + 1 !== month.month ||
    /^(Week|Неделя)\s+\d+$/i.test(week.title)
  );
}

function planNeedsRebuild(goal: Goal): boolean {
  if (goal.months.some((month) => month.weeks.some((week) => isLegacyWeek(week, month)))) return true;
  const firstWeek = goal.months[0]?.weeks[0];
  if (firstWeek && firstWeek.startDate < goal.startDate) return true;
  const lastMonth = goal.months[goal.months.length - 1];
  const lastWeek = lastMonth?.weeks[lastMonth.weeks.length - 1];
  return Boolean(lastWeek && weekEnd(lastWeek) > goal.deadline);
}

export function normalizeGoalWeeks(goal: Goal): Goal {
  const monthsWithNames = goal.months.map((month) => ({
    ...month,
    title: monthLabel(month.year, month.month),
  }));
  const next = { ...goal, months: monthsWithNames };
  if (!planNeedsRebuild(next)) return next;
  return rebuildGoalPlan(next, next.startDate, next.deadline);
}

export function locateTask(goals: Goal[], taskId: string): TaskLocation | null {
  for (const goal of goals) {
    for (const month of goal.months) {
      for (const week of month.weeks) {
        const task = week.tasks.find((item) => item.id === taskId);
        if (task) {
          return { goalId: goal.id, monthId: month.id, weekId: week.id, task };
        }
      }
    }
  }
  return null;
}
