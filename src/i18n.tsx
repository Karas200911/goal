import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { setDateLocale } from './dates';

export type Lang = 'en' | 'ru';

const STORAGE_KEY = 'goal-task-manager:lang';

const en = {
  appTitle: 'Goal',
  goals: 'Goals',
  whatYouWant: 'What you want',
  today: 'Today',
  noTasksAcross: 'No tasks across goals',
  newGoal: '+ New Goal',
  delete: 'Delete',
  deleteGoal: 'Delete goal',
  deleteGoalConfirm: 'Delete this goal and all of its tasks?',
  plan: 'Plan',
  monthsWeeks: 'Months → weeks',
  selectAGoal: 'Select a goal',
  planEmpty: 'The path to a goal appears here: months, weeks, and days.',
  thePath: 'The path',
  allGoals: 'All goals',
  day: 'Day',
  setAGoal: 'Set a goal',
  setAGoalText: 'Choose what you want, set a deadline, then break it into days.',
  nothingToday: 'Nothing for today',
  noTasksOnDay: 'No tasks on this day',
  addOrPickDay: 'Add a task, or pick another day in the plan.',
  selectGoalAddTask: 'Select a goal and add a task for this day.',
  start: 'Start',
  deadline: 'Deadline',
  acrossGoals: 'Across goals',
  backToToday: 'Back to today',
  edit: 'Edit',
  thisWeek: 'This week',
  noTasks: 'No tasks',
  completed: '{done} / {total} completed',
  addTask: '+ Add task',
  selectGoalToAdd: 'Select a goal to add a task.',
  editGoal: 'Edit goal',
  save: 'Save',
  newGoalTitle: 'New goal',
  createGoal: 'Create goal',
  goalName: 'Goal name',
  goalPlaceholder: 'Learn English to B2',
  description: 'Description',
  optional: 'Optional',
  goalRequired: 'Name, start date, and deadline are required.',
  cancel: 'Cancel',
  newTask: 'New task',
  editTask: 'Edit task',
  task: 'Task',
  taskPlaceholder: 'Learn 20 new words',
  date: 'Date',
  fromDay: 'From',
  repeat: 'Repeat',
  once: 'One day',
  daily: 'Every day',
  weekdays: 'Weekdays',
  untilDay: 'Until',
  goalColon: 'Goal: {title}',
  weekColon: 'Week: {week}',
  weekWillBeCreated: 'Will be created',
  daysSpan: '{count} {days} · {from} — {until}',
  addCount: 'Add {count}',
  addTaskShort: 'Add task',
  statusNoTasks: 'No tasks',
  statusInProgress: 'In progress',
  statusDone: 'Done',
  statusOverdue: 'Overdue',
  markComplete: 'Mark complete',
  markIncomplete: 'Mark incomplete',
  tomorrow: 'Tomorrow',
  todayMark: ' · today',
  taskWordOne: 'task',
  taskWordMany: 'tasks',
  goalWordOne: 'goal',
  goalWordMany: 'goals',
  dayWordOne: 'day',
  dayWordMany: 'days',
};

const ru: typeof en = {
  appTitle: 'Цель',
  goals: 'Цели',
  whatYouWant: 'Что вы хотите',
  today: 'Сегодня',
  noTasksAcross: 'Нет задач ни по одной цели',
  newGoal: '+ Новая цель',
  delete: 'Удалить',
  deleteGoal: 'Удалить цель',
  deleteGoalConfirm: 'Удалить эту цель и все её задачи?',
  plan: 'План',
  monthsWeeks: 'Месяцы → недели',
  selectAGoal: 'Выберите цель',
  planEmpty: 'Здесь появится путь к цели: месяцы, недели и дни.',
  thePath: 'Путь',
  allGoals: 'Все цели',
  day: 'День',
  setAGoal: 'Поставьте цель',
  setAGoalText: 'Выберите, чего хотите, укажите срок и разбейте путь на дни.',
  nothingToday: 'На сегодня ничего нет',
  noTasksOnDay: 'На этот день нет задач',
  addOrPickDay: 'Добавьте задачу или выберите другой день в плане.',
  selectGoalAddTask: 'Выберите цель и добавьте задачу на этот день.',
  start: 'Начало',
  deadline: 'Срок',
  acrossGoals: 'По всем целям',
  backToToday: 'К сегодня',
  edit: 'Изменить',
  thisWeek: 'Эта неделя',
  noTasks: 'Нет задач',
  completed: '{done} / {total} выполнено',
  addTask: '+ Добавить задачу',
  selectGoalToAdd: 'Выберите цель, чтобы добавить задачу.',
  editGoal: 'Изменить цель',
  save: 'Сохранить',
  newGoalTitle: 'Новая цель',
  createGoal: 'Создать цель',
  goalName: 'Название цели',
  goalPlaceholder: 'Выучить английский до B2',
  description: 'Описание',
  optional: 'Необязательно',
  goalRequired: 'Нужны название, дата начала и срок.',
  cancel: 'Отмена',
  newTask: 'Новая задача',
  editTask: 'Изменить задачу',
  task: 'Задача',
  taskPlaceholder: 'Выучить 20 новых слов',
  date: 'Дата',
  fromDay: 'С какого дня',
  repeat: 'Повтор',
  once: 'Один день',
  daily: 'Каждый день',
  weekdays: 'По будням',
  untilDay: 'До какого дня',
  goalColon: 'Цель: {title}',
  weekColon: 'Неделя: {week}',
  weekWillBeCreated: 'Будет создана',
  daysSpan: '{count} {days} · {from} — {until}',
  addCount: 'Добавить {count}',
  addTaskShort: 'Добавить задачу',
  statusNoTasks: 'Нет задач',
  statusInProgress: 'В работе',
  statusDone: 'Готово',
  statusOverdue: 'Просрочено',
  markComplete: 'Отметить выполненной',
  markIncomplete: 'Снять выполнение',
  tomorrow: 'На завтра',
  todayMark: ' · сегодня',
  taskWordOne: 'задача',
  taskWordMany: 'задач',
  goalWordOne: 'цель',
  goalWordMany: 'целей',
  dayWordOne: 'день',
  dayWordMany: 'дней',
};

const dictionaries = { en, ru };
export type MessageKey = keyof typeof en;

function loadLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'ru' || stored === 'en') return stored;
  } catch {
    /* ignore */
  }
  return 'en';
}

let currentLang: Lang = loadLang();

export function getLang(): Lang {
  return currentLang;
}

function format(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ''));
}

export function translate(key: MessageKey, vars?: Record<string, string | number>, lang = currentLang): string {
  return format(dictionaries[lang][key], vars);
}

function russianPlural(n: number, one: string, few: string, many: string): string {
  const value = Math.abs(n) % 100;
  const last = value % 10;
  if (value > 10 && value < 20) return many;
  if (last > 1 && last < 5) return few;
  if (last === 1) return one;
  return many;
}

export function taskWord(n: number, lang = currentLang): string {
  if (lang === 'ru') return russianPlural(n, 'задача', 'задачи', 'задач');
  return n === 1 ? dictionaries.en.taskWordOne : dictionaries.en.taskWordMany;
}

export function goalWord(n: number, lang = currentLang): string {
  if (lang === 'ru') return russianPlural(n, 'цель', 'цели', 'целей');
  return n === 1 ? dictionaries.en.goalWordOne : dictionaries.en.goalWordMany;
}

export function dayWord(n: number, lang = currentLang): string {
  if (lang === 'ru') return russianPlural(n, 'день', 'дня', 'дней');
  return n === 1 ? dictionaries.en.dayWordOne : dictionaries.en.dayWordMany;
}

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

function applyLang(lang: Lang) {
  currentLang = lang;
  setDateLocale(lang);
  document.documentElement.lang = lang;
  document.title = translate('appTitle', undefined, lang);
  localStorage.setItem(STORAGE_KEY, lang);
}

setDateLocale(currentLang);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(loadLang);

  useEffect(() => {
    applyLang(lang);
  }, [lang]);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang: (next) => {
        applyLang(next);
        setLangState(next);
      },
      t: (key, vars) => translate(key, vars, lang),
    }),
    [lang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n must be used within LanguageProvider');
  return value;
}
