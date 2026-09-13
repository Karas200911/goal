import { todayISO } from './dates';
import { normalizeGoalWeeks } from './plan';
import type { Goal } from './types';

const STORAGE_KEY = 'goal-task-manager:v1';

function normalizeGoal(goal: Goal): Goal {
  return normalizeGoalWeeks({
    ...goal,
    startDate: goal.startDate || goal.createdAt?.slice(0, 10) || todayISO(),
  });
}

export function loadGoals(): Goal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Goal[];
    return Array.isArray(parsed) ? parsed.map(normalizeGoal) : [];
  } catch {
    return [];
  }
}

export function saveGoals(goals: Goal[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}
