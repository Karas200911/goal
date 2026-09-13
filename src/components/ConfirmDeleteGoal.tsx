import { useState } from 'react';
import { useI18n } from '../i18n';
import { useStore } from '../store';
import { Modal } from './Modal';

interface ConfirmDeleteGoalProps {
  goalTitle?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDeleteGoal({ goalTitle, onConfirm, onClose }: ConfirmDeleteGoalProps) {
  const { t } = useI18n();

  return (
    <Modal title={t('deleteGoal')} onClose={onClose}>
      <p className="confirm-text">{t('deleteGoalConfirm')}</p>
      {goalTitle ? <p className="meta">{goalTitle}</p> : null}
      <div className="modal-actions">
        <button type="button" className="ghost-btn" onClick={onClose}>
          {t('cancel')}
        </button>
        <button type="button" className="primary-btn danger-fill" onClick={onConfirm}>
          {t('delete')}
        </button>
      </div>
    </Modal>
  );
}

export function useConfirmDeleteGoal() {
  const { deleteGoal, goals } = useStore();
  const [goalId, setGoalId] = useState<string | null>(null);
  const goal = goals.find((item) => item.id === goalId);

  return {
    askDeleteGoal: (id: string) => setGoalId(id),
    confirmDialog: goalId ? (
      <ConfirmDeleteGoal
        goalTitle={goal?.title}
        onClose={() => setGoalId(null)}
        onConfirm={() => {
          deleteGoal(goalId);
          setGoalId(null);
        }}
      />
    ) : null,
  };
}
