import { useEffect, useId, useRef, useState } from 'react';
import {
  addMonths,
  formatLong,
  monthGrid,
  monthLabel,
  parseISODate,
  toISODate,
  todayISO,
  weekdayShortNames,
} from '../dates';
import { useI18n } from '../i18n';

const YEAR_PAGE = 12;

interface DateFieldProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  align?: 'start' | 'end';
}

export function DateField({ value, onChange, min, align = 'start' }: DateFieldProps) {
  const { t, lang } = useI18n();
  const labelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'days' | 'months' | 'years'>('days');
  const initial = value || min || todayISO();
  const parsed = parseISODate(initial);
  const [cursor, setCursor] = useState({ year: parsed.getFullYear(), month: parsed.getMonth() + 1 });
  const viewRef = useRef(view);
  viewRef.current = view;

  useEffect(() => {
    if (!open) return;

    const next = parseISODate(value || min || todayISO());
    setCursor({ year: next.getFullYear(), month: next.getMonth() + 1 });
    setView('days');

    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      if (viewRef.current === 'days') setOpen(false);
      else setView('days');
    };

    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open, value, min]);

  const shiftMonth = (amount: number) => {
    const next = addMonths(new Date(cursor.year, cursor.month - 1, 1), amount);
    setCursor({ year: next.getFullYear(), month: next.getMonth() + 1 });
  };

  const yearStart = Math.floor(cursor.year / YEAR_PAGE) * YEAR_PAGE;
  const years = Array.from({ length: YEAR_PAGE }, (_, index) => yearStart + index);
  const months = Array.from({ length: 12 }, (_, index) => index + 1);
  const minDate = min ? parseISODate(min) : undefined;
  const minYear = minDate?.getFullYear();
  const selected = value ? parseISODate(value) : undefined;
  const selectedYear = selected?.getFullYear();
  const selectedMonth = selected && selectedYear === cursor.year ? selected.getMonth() + 1 : undefined;
  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth() + 1;

  const monthDisabled = (month: number) => {
    if (!min) return false;
    return toISODate(new Date(cursor.year, month, 0)) < min;
  };

  return (
    <div className="date-field" ref={rootRef}>
      <button
        type="button"
        className={`date-field-trigger${open ? ' open' : ''}${value ? '' : ' empty'}`}
        aria-expanded={open}
        aria-controls={labelId}
        onClick={() => setOpen((current) => !current)}
      >
        {value ? formatLong(value) : t('pickDate')}
      </button>
      {open ? (
        <div id={labelId} className={`date-picker align-${align}`} role="dialog" aria-label={t('pickDate')}>
          {view === 'years' ? (
            <>
              <div className="date-picker-head">
                <button
                  type="button"
                  className="text-btn"
                  onClick={() => setCursor((current) => ({ ...current, year: yearStart - 1 }))}
                  aria-label={t('prevYears')}
                >
                  ‹
                </button>
                <strong>
                  {years[0]}–{years[years.length - 1]}
                </strong>
                <button
                  type="button"
                  className="text-btn"
                  onClick={() => setCursor((current) => ({ ...current, year: yearStart + YEAR_PAGE }))}
                  aria-label={t('nextYears')}
                >
                  ›
                </button>
              </div>
              <div className="date-picker-years">
                {years.map((year) => (
                  <button
                    key={year}
                    type="button"
                    className={`date-picker-year${year === selectedYear ? ' selected' : ''}${year === thisYear ? ' today' : ''}`}
                    disabled={minYear !== undefined && year < minYear}
                    onClick={() => {
                      setCursor((current) => ({ ...current, year }));
                      setView('months');
                    }}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </>
          ) : view === 'months' ? (
            <>
              <div className="date-picker-head">
                <button
                  type="button"
                  className="text-btn"
                  onClick={() => setCursor((current) => ({ ...current, year: current.year - 1 }))}
                  aria-label={t('prevYears')}
                >
                  ‹
                </button>
                <button type="button" className="date-picker-year-btn" onClick={() => setView('years')} aria-label={t('pickYear')}>
                  {cursor.year}
                </button>
                <button
                  type="button"
                  className="text-btn"
                  onClick={() => setCursor((current) => ({ ...current, year: current.year + 1 }))}
                  aria-label={t('nextYears')}
                >
                  ›
                </button>
              </div>
              <div className="date-picker-months" key={lang}>
                {months.map((month) => (
                  <button
                    key={month}
                    type="button"
                    className={`date-picker-month${month === selectedMonth ? ' selected' : ''}${cursor.year === thisYear && month === thisMonth ? ' today' : ''}`}
                    disabled={monthDisabled(month)}
                    onClick={() => {
                      setCursor((current) => ({ ...current, month }));
                      setView('days');
                    }}
                  >
                    {monthLabel(cursor.year, month)}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="date-picker-head">
                <button type="button" className="text-btn" onClick={() => shiftMonth(-1)} aria-label={t('prevMonth')}>
                  ‹
                </button>
                <div className="date-picker-title">
                  <button type="button" className="date-picker-year-btn" onClick={() => setView('months')} aria-label={t('pickMonth')}>
                    {monthLabel(cursor.year, cursor.month)}
                  </button>
                  <button type="button" className="date-picker-year-btn" onClick={() => setView('years')} aria-label={t('pickYear')}>
                    {cursor.year}
                  </button>
                </div>
                <button type="button" className="text-btn" onClick={() => shiftMonth(1)} aria-label={t('nextMonth')}>
                  ›
                </button>
              </div>
              <div className="date-picker-grid">
                {weekdayShortNames().map((name) => (
                  <span key={name} className="date-picker-weekday">
                    {name}
                  </span>
                ))}
                {monthGrid(cursor.year, cursor.month).map((iso, index) =>
                  iso ? (
                    <button
                      key={iso}
                      type="button"
                      className={`date-picker-day${iso === value ? ' selected' : ''}${iso === todayISO() ? ' today' : ''}`}
                      disabled={Boolean(min && iso < min)}
                      onClick={() => {
                        onChange(iso);
                        setOpen(false);
                      }}
                    >
                      {parseISODate(iso).getDate()}
                    </button>
                  ) : (
                    <span key={`empty-${index}`} />
                  ),
                )}
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
