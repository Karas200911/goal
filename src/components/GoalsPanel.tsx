import { todayISO } from '../dates';
import { useI18n } from '../i18n';
import { statusKey, tasksRatio } from '../locale';
import { combinedProgress, goalProgress, goalStatus, percent } from '../plan';
import { useStore } from '../store';
import { useConfirmDeleteGoal } from './ConfirmDeleteGoal';
import { LanguageSwitch } from './LanguageSwitch';

interface GoalsPanelProps {
  onNewGoal: () => void;
}

export function GoalsPanel({ onNewGoal }: GoalsPanelProps) {
  const { t } = useI18n();
  const { goals, scope, selectAll, selectGoal } = useStore();
  const { askDeleteGoal, confirmDialog } = useConfirmDeleteGoal();
  const today = combinedProgress(goals, todayISO());

  return (
    <section className="column">
      <div className="column-head">
        <div className="column-head-row">
          <p className="eyebrow">{t('goals')}</p>
          <LanguageSwitch />
        </div>
        <h1 className="panel-title">{t('whatYouWant')}</h1>
      </div>
      <div className="column-body">
        <div className="goal-list">
          <button
            type="button"
            className={`nav-card${scope.kind === 'all' ? ' active' : ''}`}
            onClick={selectAll}
          >
            <div className="goal-title" style={{ fontSize: 20 }}>
              {t('today')}
            </div>
            <div className="meta">{today.total === 0 ? t('noTasksAcross') : tasksRatio(today.done, today.total)}</div>
          </button>
          {goals.map((goal) => {
            const progress = goalProgress(goal);
            const active = scope.kind === 'goal' && scope.goalId === goal.id;
            return (
              <div key={goal.id} className={`goal-card${active ? ' active' : ''}`}>
                <button type="button" className="text-btn goal-card-main" onClick={() => selectGoal(goal.id)}>
                  <div className="goal-title">{goal.title}</div>
                  <div className="progress-row">
                    <div className="progress-track" aria-hidden="true">
                      <div className="progress-fill" style={{ width: `${percent(progress)}%` }} />
                    </div>
                    <span className="percent">{percent(progress)}%</span>
                  </div>
                  <div className="status">{t(statusKey(goalStatus(goal)))}</div>
                </button>
                <button type="button" className="text-btn danger goal-delete" onClick={() => askDeleteGoal(goal.id)}>
                  {t('delete')}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div className="column-foot">
        <button type="button" className="ghost-btn" onClick={onNewGoal}>
          {t('newGoal')}
        </button>
      </div>
      {confirmDialog}
    </section>
  );
}
