import { useMemo, useState } from 'react';
import { addDays, formatLong, parseISODate, todayISO, toISODate } from '../dates';
import { useI18n } from '../i18n';
import { displayMonthTitle, goalsPhrase, tasksRatio } from '../locale';
import {
  collectTasks,
  combinedProgress,
  currentMonthRange,
  currentWeekRange,
  dayProgress,
  findCurrentMonth,
  findCurrentWeek,
  findWeekForDate,
  goalProgress,
  monthProgress,
  percent,
  rangeProgress,
  weekLabel,
  weekProgress,
} from '../plan';
import { useStore } from '../store';
import type { Goal, Task } from '../types';
import { GoalForm } from './GoalForm';
import { TaskForm } from './TaskForm';
import { TaskItem } from './TaskItem';

interface TodayPanelProps {
  onNewGoal: () => void;
}

export function TodayPanel({ onNewGoal }: TodayPanelProps) {
  const { t } = useI18n();
  const {
    goals,
    scope,
    selectedDate,
    goToToday,
    toggleTask,
    moveTask,
    addTask,
    updateTask,
    deleteTask,
    updateGoal,
    deleteGoal,
  } = useStore();
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [taskForm, setTaskForm] = useState<{ goal: Goal; task?: Task } | null>(null);

  const selectedGoal = scope.kind === 'goal' ? goals.find((goal) => goal.id === scope.goalId) : undefined;
  const isToday = selectedDate === todayISO();
  const visibleGoals = selectedGoal ? [selectedGoal] : goals;
  const locations = collectTasks(visibleGoals, selectedDate);
  const day = selectedGoal ? dayProgress(selectedGoal, selectedDate) : combinedProgress(goals, selectedDate);
  const currentWeek = selectedGoal
    ? (findWeekForDate(selectedGoal, selectedDate)?.week ?? findCurrentWeek(selectedGoal))
    : undefined;
  const currentMonth = selectedGoal
    ? (selectedGoal.months.find((month) => month.weeks.some((week) => week.id === currentWeek?.id)) ??
      findCurrentMonth(selectedGoal))
    : undefined;

  const weekRange = currentWeekRange();
  const monthRange = currentMonthRange();
  const week = selectedGoal
    ? currentWeek
      ? weekProgress(currentWeek)
      : { done: 0, total: 0 }
    : rangeProgress(goals, weekRange.start, weekRange.end);
  const month = selectedGoal
    ? currentMonth
      ? monthProgress(currentMonth)
      : { done: 0, total: 0 }
    : rangeProgress(goals, monthRange.start, monthRange.end);
  const overall = selectedGoal ? goalProgress(selectedGoal) : combinedProgress(goals);

  const title = selectedGoal?.title ?? t('allGoals');
  const heading = isToday ? t('today') : formatLong(selectedDate);

  const emptyCopy = useMemo(() => {
    if (goals.length === 0) {
      return {
        title: t('setAGoal'),
        text: t('setAGoalText'),
      };
    }
    if (locations.length === 0) {
      return {
        title: isToday ? t('nothingToday') : t('noTasksOnDay'),
        text: selectedGoal ? t('addOrPickDay') : t('selectGoalAddTask'),
      };
    }
    return null;
  }, [goals.length, isToday, locations.length, selectedGoal, t]);

  return (
    <section className="column">
      <div className="center-head">
        <div className="center-top">
          <div>
            <p className="eyebrow">{isToday ? t('today') : t('day')}</p>
            <h1 className="panel-title">{title}</h1>
            {selectedGoal?.description ? <p className="meta">{selectedGoal.description}</p> : null}
          </div>
          <div>
            {selectedGoal ? (
              <div className="date-range">
                <div className="deadline">
                  {t('start')}
                  <strong>{formatLong(selectedGoal.startDate)}</strong>
                </div>
                <div className="deadline">
                  {t('deadline')}
                  <strong>{formatLong(selectedGoal.deadline)}</strong>
                </div>
              </div>
            ) : (
              <div className="deadline">
                {t('acrossGoals')}
                <strong>{goalsPhrase(goals.length)}</strong>
              </div>
            )}
            <div className="head-actions" style={{ marginTop: 10, justifyContent: 'flex-end' }}>
              {!isToday ? (
                <button type="button" className="text-btn" onClick={goToToday}>
                  {t('backToToday')}
                </button>
              ) : null}
              {selectedGoal ? (
                <>
                  <button type="button" className="text-btn" onClick={() => setGoalFormOpen(true)}>
                    {t('edit')}
                  </button>
                  <button type="button" className="text-btn danger" onClick={() => deleteGoal(selectedGoal.id)}>
                    {t('delete')}
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="progress-row">
          <div className="progress-track" aria-hidden="true">
            <div className="progress-fill" style={{ width: `${percent(overall)}%` }} />
          </div>
          <span className="percent">{percent(overall)}%</span>
        </div>

        <div className="stats">
          <div className="stat">
            <div className="stat-label">{isToday ? t('today') : formatLong(selectedDate)}</div>
            <div className="stat-value">{tasksRatio(day.done, day.total)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">{currentWeek ? weekLabel(currentWeek) : t('thisWeek')}</div>
            <div className="stat-value">{tasksRatio(week.done, week.total)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">{currentMonth ? displayMonthTitle(currentMonth) : monthRange.title}</div>
            <div className="stat-value">{tasksRatio(month.done, month.total)}</div>
          </div>
        </div>
      </div>

      <div className="column-body">
        <div className="section-title">
          <p className="eyebrow" style={{ margin: 0 }}>
            {heading}
          </p>
          <span className="count">
            {day.total === 0 ? t('noTasks') : t('completed', { done: day.done, total: day.total })}
          </span>
        </div>

        {emptyCopy ? (
          <div className="empty-state">
            <h2>{emptyCopy.title}</h2>
            <p>{emptyCopy.text}</p>
          </div>
        ) : (
          <div className="task-list">
            {locations.map(({ task, goalId }) => {
              const goal = goals.find((item) => item.id === goalId);
              return (
                <TaskItem
                  key={task.id}
                  task={task}
                  goalTitle={selectedGoal ? undefined : goal?.title}
                  onToggle={() => toggleTask(task.id)}
                  onOpen={() => goal && setTaskForm({ goal, task })}
                  onMoveTomorrow={() => moveTask(task.id, toISODate(addDays(parseISODate(todayISO()), 1)))}
                />
              );
            })}
          </div>
        )}
      </div>

      <div className="column-foot">
        {selectedGoal ? (
          <button type="button" className="ghost-btn" onClick={() => setTaskForm({ goal: selectedGoal })}>
            {t('addTask')}
          </button>
        ) : goals.length === 1 ? (
          <button type="button" className="ghost-btn" onClick={() => setTaskForm({ goal: goals[0] })}>
            {t('addTask')}
          </button>
        ) : goals.length > 1 ? (
          <p className="meta" style={{ margin: '0 8px' }}>
            {t('selectGoalToAdd')}
          </p>
        ) : (
          <button type="button" className="primary-btn" onClick={onNewGoal}>
            {t('newGoal')}
          </button>
        )}
      </div>

      {goalFormOpen && selectedGoal ? (
        <GoalForm
          title={t('editGoal')}
          initial={{
            title: selectedGoal.title,
            description: selectedGoal.description,
            startDate: selectedGoal.startDate,
            deadline: selectedGoal.deadline,
          }}
          submitLabel={t('save')}
          onClose={() => setGoalFormOpen(false)}
          onDelete={() => {
            deleteGoal(selectedGoal.id);
            setGoalFormOpen(false);
          }}
          onSubmit={(values) => {
            updateGoal(selectedGoal.id, values);
            setGoalFormOpen(false);
          }}
        />
      ) : null}

      {taskForm ? (
        <TaskForm
          goal={taskForm.goal}
          task={taskForm.task}
          date={selectedDate}
          onClose={() => setTaskForm(null)}
          onDelete={
            taskForm.task
              ? () => {
                  deleteTask(taskForm.task!.id);
                  setTaskForm(null);
                }
              : undefined
          }
          onSubmit={({ title, date, mode, until }) => {
            if (taskForm.task) {
              updateTask(taskForm.task.id, { title, date });
            } else {
              addTask(taskForm.goal.id, title, date, { mode, until });
            }
            setTaskForm(null);
          }}
        />
      ) : null}
    </section>
  );
}
