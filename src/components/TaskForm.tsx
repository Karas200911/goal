import { useState, type FormEvent } from 'react';
import { clampDate, formatMedium } from '../dates';
import { dayWord, useI18n } from '../i18n';
import { findWeekForDate, repeatDates, weekLabel } from '../plan';
import type { Goal, RepeatMode, Task } from '../types';
import { DateField } from './DateField';
import { Modal } from './Modal';

interface TaskFormProps {
  goal: Goal;
  task?: Task;
  date: string;
  onSubmit: (values: { title: string; date: string; mode: RepeatMode; until: string }) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export function TaskForm({ goal, task, date, onSubmit, onDelete, onClose }: TaskFormProps) {
  const { t } = useI18n();
  const [title, setTitle] = useState(task?.title ?? '');
  const [taskDate, setTaskDate] = useState(clampDate(task?.date ?? date, goal.startDate, goal.deadline));
  const [mode, setMode] = useState<RepeatMode>('once');
  const [until, setUntil] = useState(clampDate(goal.deadline, goal.startDate, goal.deadline));
  const week = findWeekForDate(goal, taskDate)?.week;
  const count = task
    ? 1
    : repeatDates(taskDate, until, mode).filter((item) => item >= goal.startDate && item <= goal.deadline).length;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title,
      date: clampDate(taskDate, goal.startDate, goal.deadline),
      mode: task ? 'once' : mode,
      until: clampDate(until, goal.startDate, goal.deadline),
    });
  };

  return (
    <Modal title={task ? t('editTask') : t('newTask')} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <label className="field">
          <span>{t('task')}</span>
          <input
            autoFocus
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t('taskPlaceholder')}
          />
        </label>
        <div className="field">
          <span>{task || mode === 'once' ? t('date') : t('fromDay')}</span>
          <DateField
            value={taskDate}
            min={goal.startDate}
            max={goal.deadline}
            onChange={(next) => {
              setTaskDate(next);
              if (until < next) setUntil(next);
            }}
          />
        </div>
        {task ? null : (
          <>
            <fieldset className="field">
              <span>{t('repeat')}</span>
              <div className="choice-row">
                <label>
                  <input type="radio" name="repeat" checked={mode === 'once'} onChange={() => setMode('once')} />
                  {t('once')}
                </label>
                <label>
                  <input type="radio" name="repeat" checked={mode === 'daily'} onChange={() => setMode('daily')} />
                  {t('daily')}
                </label>
                <label>
                  <input
                    type="radio"
                    name="repeat"
                    checked={mode === 'weekdays'}
                    onChange={() => setMode('weekdays')}
                  />
                  {t('weekdays')}
                </label>
              </div>
            </fieldset>
            {mode === 'once' ? null : (
              <div className="field">
                <span>{t('untilDay')}</span>
                <DateField value={until} min={taskDate} max={goal.deadline} onChange={setUntil} />
              </div>
            )}
          </>
        )}
        <p className="meta">
          {t('goalColon', { title: goal.title })}
          <br />
          {task || mode === 'once' ? (
            <>
              {t('weekColon', { week: week ? weekLabel(week) : t('weekWillBeCreated') })}
              <br />
              {taskDate ? formatMedium(taskDate) : ''}
            </>
          ) : (
            t('daysSpan', {
              count,
              days: dayWord(count),
              from: formatMedium(taskDate),
              until: formatMedium(until),
            })
          )}
        </p>
        <div className="modal-actions">
          {onDelete ? (
            <button type="button" className="text-btn danger" onClick={onDelete}>
              {t('delete')}
            </button>
          ) : null}
          <button type="button" className="ghost-btn" onClick={onClose}>
            {t('cancel')}
          </button>
          <button type="submit" className="primary-btn">
            {task ? t('save') : count > 1 ? t('addCount', { count }) : t('addTaskShort')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
