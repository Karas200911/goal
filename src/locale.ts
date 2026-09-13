import { monthLabel } from './dates';
import { goalWord, taskWord } from './i18n';

export function tasksRatio(done: number, total: number): string {
  return `${done} / ${total} ${taskWord(total)}`;
}

export function goalsPhrase(n: number): string {
  return `${n} ${goalWord(n)}`;
}

export function displayMonthTitle(month: { title: string; year: number; month: number }): string {
  return monthLabel(month.year, month.month);
}

export function statusKey(status: 'noTasks' | 'inProgress' | 'done' | 'overdue') {
  if (status === 'noTasks') return 'statusNoTasks' as const;
  if (status === 'done') return 'statusDone' as const;
  if (status === 'overdue') return 'statusOverdue' as const;
  return 'statusInProgress' as const;
}
