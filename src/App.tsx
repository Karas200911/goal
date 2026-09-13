import { useState } from 'react';
import { GoalForm } from './components/GoalForm';
import { GoalsPanel } from './components/GoalsPanel';
import { PlanPanel } from './components/PlanPanel';
import { TodayPanel } from './components/TodayPanel';
import { useI18n } from './i18n';
import { useStore } from './store';

export function App() {
  const { addGoal } = useStore();
  const { t } = useI18n();
  const [newGoalOpen, setNewGoalOpen] = useState(false);

  return (
    <div className="app">
      <GoalsPanel onNewGoal={() => setNewGoalOpen(true)} />
      <TodayPanel onNewGoal={() => setNewGoalOpen(true)} />
      <PlanPanel />
      {newGoalOpen ? (
        <GoalForm
          title={t('newGoalTitle')}
          submitLabel={t('createGoal')}
          onClose={() => setNewGoalOpen(false)}
          onSubmit={(values) => {
            addGoal(values);
            setNewGoalOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
