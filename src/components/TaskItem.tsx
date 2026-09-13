import { addDays, parseISODate, todayISO, toISODate } from '../dates';
import { useI18n } from '../i18n';
import type { Task } from '../types';

interface TaskItemProps {
  task: Task;
  goalTitle?: string;
  onToggle: () => void;
  onOpen: () => void;
  onMoveTomorrow: () => void;
}

export function TaskItem({ task, goalTitle, onToggle, onOpen, onMoveTomorrow }: TaskItemProps) {
  const { t } = useI18n();
  const tomorrow = toISODate(addDays(parseISODate(todayISO()), 1));
  const canMoveTomorrow = !task.completed && task.date !== tomorrow;

  return (
    <div className={`task-item${task.completed ? ' done' : ''}`}>
      <button
        type="button"
        className={`checkbox${task.completed ? ' checked' : ''}`}
        aria-label={task.completed ? t('markIncomplete') : t('markComplete')}
        onClick={onToggle}
      >
        {task.completed ? '✓' : ''}
      </button>
      <button type="button" className="text-btn" onClick={onOpen}>
        <div className="task-title">{task.title}</div>
        {goalTitle ? <div className="goal-chip">{goalTitle}</div> : null}
      </button>
      <div className="task-actions">
        {canMoveTomorrow ? (
          <button type="button" className="text-btn" onClick={onMoveTomorrow}>
            {t('tomorrow')}
          </button>
        ) : null}
        <button type="button" className="text-btn" onClick={onOpen}>
          {t('edit')}
        </button>
      </div>
    </div>
  );
}
