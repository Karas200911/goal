import { useState, type FormEvent } from 'react';
import { useI18n } from '../i18n';
import { Modal } from './Modal';

export interface GoalFormValues {
  title: string;
  description: string;
  startDate: string;
  deadline: string;
}

interface GoalFormProps {
  title: string;
  initial?: GoalFormValues;
  submitLabel: string;
  onSubmit: (values: GoalFormValues) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export function GoalForm({ title, initial, submitLabel, onSubmit, onDelete, onClose }: GoalFormProps) {
  const { t } = useI18n();
  const [values, setValues] = useState<GoalFormValues>(
    initial ?? { title: '', description: '', startDate: '', deadline: '' },
  );
  const [triedSubmit, setTriedSubmit] = useState(false);

  const titleOk = Boolean(values.title.trim());
  const startOk = Boolean(values.startDate);
  const deadlineOk = Boolean(values.deadline);
  const canSubmit = titleOk && startOk && deadlineOk;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setTriedSubmit(true);
    if (!canSubmit) return;
    onSubmit({
      ...values,
      title: values.title.trim(),
      startDate: values.startDate <= values.deadline ? values.startDate : values.deadline,
      deadline: values.deadline >= values.startDate ? values.deadline : values.startDate,
    });
  };

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <label className="field">
          <span>{t('goalName')}</span>
          <input
            required
            autoFocus
            value={values.title}
            onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
            placeholder={t('goalPlaceholder')}
          />
        </label>
        <label className="field">
          <span>{t('description')}</span>
          <textarea
            value={values.description}
            onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
            placeholder={t('optional')}
          />
        </label>
        <div className="field-row">
          <label className="field">
            <span>{t('start')}</span>
            <input
              required
              type="date"
              value={values.startDate}
              onChange={(event) =>
                setValues((current) => {
                  const startDate = event.target.value;
                  return {
                    ...current,
                    startDate,
                    deadline: current.deadline && current.deadline < startDate ? startDate : current.deadline,
                  };
                })
              }
            />
          </label>
          <label className="field">
            <span>{t('deadline')}</span>
            <input
              required
              type="date"
              min={values.startDate || undefined}
              value={values.deadline}
              onChange={(event) => setValues((current) => ({ ...current, deadline: event.target.value }))}
            />
          </label>
        </div>
        {triedSubmit && !canSubmit ? <p className="meta">{t('goalRequired')}</p> : null}
        <div className="modal-actions">
          {onDelete ? (
            <button type="button" className="text-btn danger" onClick={onDelete}>
              {t('deleteGoal')}
            </button>
          ) : null}
          <button type="button" className="ghost-btn" onClick={onClose}>
            {t('cancel')}
          </button>
          <button type="submit" className="primary-btn" disabled={!canSubmit}>
            {submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
