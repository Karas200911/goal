import { formatDayNumber, formatWeekday, todayISO, weekDays } from '../dates';
import { useI18n } from '../i18n';
import { displayMonthTitle } from '../locale';
import { markSymbol, monthMark, monthProgress, weekEnd, weekLabel, weekMark, weekProgress } from '../plan';
import { useStore } from '../store';
import type { Month, Week } from '../types';

export function PlanPanel() {
  const {
    goals,
    scope,
    selectedDate,
    selectedMonthId,
    selectedWeekId,
    selectDate,
    selectMonth,
    selectWeek,
  } = useStore();

  const { t } = useI18n();
  const selectedGoal = scope.kind === 'goal' ? goals.find((goal) => goal.id === scope.goalId) : undefined;

  if (!selectedGoal) {
    return (
      <section className="column">
        <div className="column-head">
          <p className="eyebrow">{t('plan')}</p>
          <h1 className="panel-title">{t('monthsWeeks')}</h1>
        </div>
        <div className="column-body">
          <div className="empty-state">
            <h2>{t('selectAGoal')}</h2>
            <p>{t('planEmpty')}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="column">
      <div className="column-head">
        <p className="eyebrow">{t('plan')}</p>
        <h1 className="panel-title">{t('thePath')}</h1>
      </div>
      <div className="column-body">
        <div className="plan-list">
          {selectedGoal.months.map((month) => (
            <MonthBlock
              key={month.id}
              month={month}
              expanded={selectedMonthId === month.id}
              selectedWeekId={selectedWeekId}
              selectedDate={selectedDate}
              onSelectMonth={() => selectMonth(month.id)}
              onSelectWeek={(week) => {
                if (selectedWeekId === week.id) selectWeek(null);
                else selectWeek(week.id);
              }}
              onSelectDate={selectDate}
              todayMark={t('todayMark')}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface MonthBlockProps {
  month: Month;
  expanded: boolean;
  selectedWeekId: string | null;
  selectedDate: string;
  onSelectMonth: () => void;
  onSelectWeek: (week: Week) => void;
  onSelectDate: (date: string) => void;
  todayMark: string;
}

function MonthBlock({
  month,
  expanded,
  selectedWeekId,
  selectedDate,
  onSelectMonth,
  onSelectWeek,
  onSelectDate,
  todayMark,
}: MonthBlockProps) {
  const progress = monthProgress(month);
  const mark = monthMark(month);

  return (
    <div className="plan-month">
      <div className="month-head">
        <button type="button" className="text-btn month-title" onClick={onSelectMonth}>
          {displayMonthTitle(month)}
        </button>
        <span className="meta">
          {markSymbol(mark)} {progress.done}/{progress.total}
        </span>
      </div>

      {month.weeks.map((week) =>
        expanded ? (
          <WeekBlock
            key={week.id}
            week={week}
            expanded={selectedWeekId === week.id}
            selectedDate={selectedDate}
            onSelect={() => onSelectWeek(week)}
            onSelectDate={onSelectDate}
            todayMark={todayMark}
          />
        ) : (
          <button
            key={week.id}
            type="button"
            className={`week-row${selectedWeekId === week.id ? ' active' : ''}`}
            onClick={() => onSelectWeek(week)}
          >
            <span>{weekLabel(week)}</span>
            <span className="meta">{markSymbol(weekMark(week))}</span>
          </button>
        ),
      )}
    </div>
  );
}

interface WeekBlockProps {
  week: Week;
  expanded: boolean;
  selectedDate: string;
  onSelect: () => void;
  onSelectDate: (date: string) => void;
  todayMark: string;
}

function WeekBlock({ week, expanded, selectedDate, onSelect, onSelectDate, todayMark }: WeekBlockProps) {
  const progress = weekProgress(week);
  const mark = weekMark(week);
  const days = weekDays(week.startDate, weekEnd(week));

  return (
    <div>
      <button type="button" className={`week-row${expanded ? ' active' : ''}`} onClick={onSelect}>
        <span>{weekLabel(week)}</span>
        <span className="meta">
          {markSymbol(mark)} {progress.done}/{progress.total}
        </span>
      </button>

      {expanded ? (
        <div className="days">
          {days.map((date) => {
            const count = week.tasks.filter((task) => task.date === date).length;
            const done = week.tasks.filter((task) => task.date === date && task.completed).length;
            const isToday = date === todayISO();
            return (
              <button
                key={date}
                type="button"
                className={`day-row${selectedDate === date ? ' active' : ''}`}
                onClick={() => onSelectDate(date)}
              >
                <span>
                  {formatWeekday(date)} {formatDayNumber(date)}
                  {isToday ? todayMark : ''}
                </span>
                <span className="meta">{count === 0 ? '○' : `${done}/${count}`}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
