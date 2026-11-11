import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  ListChecks,
  MessageSquare,
  RefreshCw,
  StickyNote,
  Target,
  UserCheck,
  UserRound,
  Users,
} from 'lucide-react';
import type { PageId } from '../types';
import { useStore } from '../store/useStore';
import { KpiCard } from '../components/KpiCard';
import { RiskBadge } from '../components/RiskBadge';
import { Avatar } from '../components/Avatar';
import { SurvivalChart } from '../components/SurvivalChart';
import { nextAction } from '../lib/risk';
import {
  formatShortDate,
  parseISODate,
  pluralRu,
  relativeDay,
  daysUntil,
} from '../lib/dates';

interface PulsePageProps {
  onOpenNewcomer: (id: string) => void;
  onNavigate: (page: PageId) => void;
}

const reasons = [
  { label: 'Не сошлись ожидания', value: 31, tone: 'ink' },
  { label: 'Нагрузка и темп', value: 24, tone: 'amber' },
  { label: 'Отношения с руководителем', value: 18, tone: 'red' },
  { label: 'График и дорога', value: 15, tone: 'muted' },
  { label: 'Другое', value: 12, tone: 'muted' },
];

function activityIcon(type: string) {
  if (type === 'hire') return UserRound;
  if (type === 'mentor') return UserCheck;
  if (type === 'task') return ListChecks;
  if (type === 'checkin') return MessageSquare;
  if (type === 'note') return StickyNote;
  if (type === 'sync') return RefreshCw;
  return AlertTriangle;
}

function dateTile(iso: string) {
  const date = parseISODate(iso);
  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: new Intl.DateTimeFormat('ru-RU', { month: 'short' })
      .format(date)
      .replace('.', ''),
  };
}

export function PulsePage({ onOpenNewcomer, onNavigate }: PulsePageProps) {
  const { newcomers, state, today } = useStore();
  const red = newcomers.filter((item) => item.risk.level === 'red');
  const yellow = newcomers.filter((item) => item.risk.level === 'yellow');
  const green = newcomers.filter((item) => item.risk.level === 'green');
  const avgRisk = Math.round(
    newcomers.reduce((total, item) => total + item.risk.score, 0) / Math.max(1, newcomers.length),
  );
  const focus =
    newcomers.find((item) => item.id === 'n-marina') ?? red[0] ?? newcomers[0];
  const attention = newcomers
    .filter((item) => item.risk.level !== 'green' && item.id !== focus?.id)
    .slice(0, 5);

  const upcomingCheckIns = state.checkIns
    .filter((checkIn) => !checkIn.doneAt && daysUntil(checkIn.dueDate, today) >= 0)
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1))
    .slice(0, 5)
    .map((checkIn) => ({
      checkIn,
      newcomer: newcomers.find((item) => item.id === checkIn.newcomerId),
    }))
    .filter((item) => item.newcomer);

  const recentActivity = state.activities
    .slice()
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, 6);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">Контроль первых 90 дней</div>
          <h1>Кто может уйти на этой неделе</h1>
          <p className="page-sub">
            Один экран вместо выгрузок из Битрикс24: сигналы риска, просроченные задачи и
            чек-ины. Сначала — красная зона, затем — жёлтая.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={() => onNavigate('newcomers')}>
            Все новички
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      <section className="kpi-grid" aria-label="Ключевые показатели">
        <KpiCard
          label="В адаптации"
          value={newcomers.length}
          note={`${pluralRu(newcomers.length, 'новичок', 'новичка', 'новичков')} · 100+ в год`}
          icon={<Users size={18} />}
        />
        <KpiCard
          label="Красная зона"
          value={red.length}
          note="нужна реакция сегодня"
          icon={<AlertTriangle size={18} />}
          tone="red"
        />
        <KpiCard
          label="Средний риск"
          value={avgRisk}
          note={`${yellow.length} в жёлтой зоне · ${green.length} в норме`}
          icon={<Target size={18} />}
          tone="amber"
        />
        <KpiCard
          label="Дошли до 90 дней"
          value="67%"
          note="цель 80% · последние 12 месяцев"
          icon={<CheckCircle2 size={18} />}
          tone="green"
        />
      </section>

      <div className="dashboard-grid">
        <section className="card attention-card">
          <div className="card-head">
            <div className="card-title">
              Требуют внимания
              <span className="count-pill">{red.length + yellow.length}</span>
            </div>
            <span className="card-hint">сортировка по риску</span>
          </div>

          {focus && (
            <div className="focus-banner">
              <Avatar name={focus.name} size="lg" risk={focus.risk.level} />
              <div className="focus-copy">
                <span className="focus-kicker">
                  <span className="pulse-dot" />
                  Начните здесь · {focus.day}-й день
                </span>
                <div className="focus-name">{focus.name}</div>
                <div className="focus-meta">
                  {focus.roleTitle} · {focus.location}
                </div>
                <div className="focus-signal">
                  {focus.risk.topSignal?.label ?? 'Риск не выявлен'}
                  {focus.risk.topSignal ? ` · ${focus.risk.topSignal.points} баллов` : ''}
                </div>
              </div>
              <div className="focus-side">
                <RiskBadge level={focus.risk.level} score={focus.risk.score} />
                <button className="btn btn-lime" onClick={() => onOpenNewcomer(focus.id)}>
                  Разобрать
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          <div className="attention-list">
            {attention.map((item) => (
              <button
                key={item.id}
                className="attention-row"
                onClick={() => onOpenNewcomer(item.id)}
              >
                <Avatar name={item.name} risk={item.risk.level} />
                <span className="person-main">
                  <span className="person-name">{item.name}</span>
                  <span className="person-meta">
                    {item.roleTitle} · {item.location} · {item.day}-й день
                  </span>
                </span>
                <span className="attention-signal">
                  <span>{item.risk.topSignal?.label ?? 'Нет сигналов'}</span>
                  <small>{item.risk.topSignal?.detail ?? 'Можно не трогать'}</small>
                </span>
                <RiskBadge level={item.risk.level} score={item.risk.score} compact />
                <span className="row-action">
                  {nextAction(item, item.risk)}
                  <ArrowRight size={14} />
                </span>
              </button>
            ))}
          </div>

          <div className="card-footer">
            <span>
              {red.length} в красной зоне, {yellow.length} — под наблюдением
            </span>
            <button className="text-button" onClick={() => onNavigate('newcomers')}>
              Открыть всех
              <ArrowRight size={14} />
            </button>
          </div>
        </section>

        <aside className="side-stack">
          <section className="card survival-card">
            <div className="card-head">
              <div className="card-title">90-дневная выживаемость</div>
              <span className="delta-pill">−33%</span>
            </div>
            <div className="card-body">
              <div className="survival-hero">
                <span className="survival-big">67%</span>
                <span className="survival-caption">
                  доходят до конца испытательного срока
                  <br />
                  <b>каждый третий уходит раньше</b>
                </span>
              </div>
              <SurvivalChart />
              <div className="chart-legend">
                <span>
                  <i className="legend-dot ink" /> факт
                </span>
                <span>
                  <i className="legend-dot lime" /> цель 80%
                </span>
              </div>
            </div>
            <div className="card-footer">
              <span>По 128 увольнениям за 12 месяцев</span>
              <button className="text-button" onClick={() => onNavigate('analytics')}>
                В аналитику
                <ArrowRight size={14} />
              </button>
            </div>
          </section>

          <section className="card reasons-card">
            <div className="card-head">
              <div className="card-title">Почему уходят до 90 дней</div>
              <span className="card-hint">доля уходов</span>
            </div>
            <div className="card-body">
              <div className="reason-list">
                {reasons.map((reason) => (
                  <div className="reason-row" key={reason.label}>
                    <span>{reason.label}</span>
                    <b>{reason.value}%</b>
                    <span className="reason-bar">
                      <span
                        className={`reason-fill ${reason.tone}`}
                        style={{ width: `${reason.value * 2.6}%` }}
                      />
                    </span>
                  </div>
                ))}
              </div>
              <div className="insight-box">
                <span className="insight-icon">
                  <Clock3 size={16} />
                </span>
                <span>
                  <b>Пик потерь — 8–21-й день.</b> Это ещё до первого 30-дневного чек-ина,
                  когда руководитель обычно узнаёт о проблеме последним.
                </span>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <div className="bottom-grid">
        <section className="card">
          <div className="card-head">
            <div className="card-title">
              <CalendarClock size={18} />
              Ближайшие чек-ины
            </div>
            <span className="count-pill">{upcomingCheckIns.length}</span>
          </div>
          <div className="card-body upcoming-list">
            {upcomingCheckIns.length === 0 && (
              <div className="empty-state">На этой неделе чек-инов нет.</div>
            )}
            {upcomingCheckIns.map(({ checkIn, newcomer }) => {
              const tile = dateTile(checkIn.dueDate);
              return (
                <button
                  key={checkIn.id}
                  className="upcoming-row"
                  onClick={() => newcomer && onOpenNewcomer(newcomer.id)}
                >
                  <span className="date-tile">
                    <b>{tile.day}</b>
                    <small>{tile.month}</small>
                  </span>
                  <span className="person-main">
                    <span className="person-name">{newcomer?.name}</span>
                    <span className="person-meta">
                      {checkIn.day}-й день · {relativeDay(checkIn.dueDate, today)}
                    </span>
                  </span>
                  {newcomer && (
                    <RiskBadge level={newcomer.risk.level} score={newcomer.risk.score} compact />
                  )}
                  <ArrowRight size={15} className="muted-icon" />
                </button>
              );
            })}
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <div className="card-title">
              <RefreshCw size={17} />
              Лента событий
            </div>
            <span className="card-hint">Битрикс24 + чек-ины</span>
          </div>
          <div className="card-body activity-list">
            {recentActivity.map((activity) => {
              const Icon = activityIcon(activity.type);
              const person = activity.newcomerId
                ? newcomers.find((item) => item.id === activity.newcomerId)
                : null;
              return (
                <div className={`activity-row type-${activity.type}`} key={activity.id}>
                  <span className="activity-icon">
                    <Icon size={15} />
                  </span>
                  <span className="activity-copy">
                    <span>
                      <b>{person?.name ?? 'Битрикс24'}</b> {activity.text}
                    </span>
                    <small>{relativeDay(activity.at, today)}</small>
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
