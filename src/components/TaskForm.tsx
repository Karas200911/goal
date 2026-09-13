import { useState, type FormEvent } from 'react';
import { formatMedium } from '../dates';
import { dayWord, useI18n } from '../i18n';
import { findWeekForDate, repeatDates, weekLabel } from '../plan';
import type { Goal, RepeatMode, Task } from '../types';
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
  const [taskDate, setTaskDate] = useState(task?.date ?? date);
  const [mode, setMode] = useState<RepeatMode>('once');
  const [until, setUntil] = useState(goal.deadline >= (task?.date ?? date) ? goal.deadline : task?.date ?? date);
  const week = findWeekForDate(goal, taskDate)?.week;
  const count = task ? 1 : repeatDates(taskDate, until, mode).length;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title, date: taskDate, mode: task ? 'once' : mode, until });
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
        <label className="field">
          <span>{task || mode === 'once' ? t('date') : t('fromDay')}</span>
          <input
            type="date"
            value={taskDate}
            onChange={(event) => {
              const next = event.target.value;
              setTaskDate(next);
              if (until < next) setUntil(next);
            }}
          />
        </label>
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
              <label className="field">
                <span>{t('untilDay')}</span>
                <input
                  type="date"
                  min={taskDate}
                  value={until}
                  onChange={(event) => setUntil(event.target.value)}
                />
              </label>
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
