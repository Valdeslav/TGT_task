import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  History,
  ListChecks,
  MessageSquare,
  Plus,
  Sparkles,
  Target,
  UserCheck,
  X,
  Zap,
} from 'lucide-react';
import type {
  CheckIn,
  NewcomerWithRisk,
  Task,
  TaskOwner,
} from '../types';
import { useStore } from '../store/useStore';
import { Avatar } from './Avatar';
import { RiskBadge } from './RiskBadge';
import { Modal } from './Modal';
import { PHASES } from '../data/templates';
import {
  addDays,
  formatDay,
  formatShortDate,
  isPast,
  pluralRu,
  relativeDay,
  todayISO,
} from '../lib/dates';
import { checkInState, nextAction, riskLevelLabel } from '../lib/risk';

const blockerOptions = [
  'Ожидания',
  'Нагрузка',
  'Отношения с руководителем',
  'График и дорога',
  'Процессы',
  'Другое',
];

const moodLabels: Record<number, string> = {
  1: 'Тяжело',
  2: 'Тревожно',
  3: 'Нормально',
  4: 'Хорошо',
  5: 'Отлично',
};

function suggestedTask(newcomer: NewcomerWithRisk): string {
  const signal = newcomer.risk.topSignal?.id;
  if (!newcomer.mentorId) return 'Назначить наставника и познакомить с командой';
  if (signal === 'inactive-mentor') return 'Назначить нового наставника';
  if (signal === 'missed-checkin') return `Провести чек-ин с ${newcomer.name}`;
  if (signal === 'low-mood') return `Провести 1:1 и разобрать причины: ${newcomer.name}`;
  if (signal === 'overdue-critical') {
    const overdue = newcomer.risk.signals.find((item) => item.id === 'overdue-critical');
    return overdue?.detail ? `Проконтролировать: ${overdue.detail}` : 'Закрыть просроченную задачу';
  }
  if (signal === 'week-one-open') return 'Закрыть задачи первой недели';
  if (signal === 'mentor-stale') return 'Организовать встречу с наставником';
  return `Связаться с ${newcomer.name} и уточнить самочувствие`;
}

function activityIcon(type: string) {
  if (type === 'mentor') return UserCheck;
  if (type === 'task') return ListChecks;
  if (type === 'checkin') return MessageSquare;
  if (type === 'note') return FileText;
  if (type === 'risk') return AlertTriangle;
  return History;
}

export function NewcomerDrawer({
  newcomerId,
  onClose,
}: {
  newcomerId: string;
  onClose: () => void;
}) {
  const {
    newcomers,
    tasksFor,
    checkInsFor,
    activityFor,
    toggleTask,
    showToast,
    today,
  } = useStore();
  const newcomer = newcomers.find((item) => item.id === newcomerId);
  const tasks = tasksFor(newcomerId);
  const checkIns = checkInsFor(newcomerId);
  const activities = activityFor(newcomerId);
  const [mentorOpen, setMentorOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [checkInTarget, setCheckInTarget] = useState<CheckIn | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  if (!newcomer) return null;

  const pendingCheckIns = checkIns.filter((checkIn) => !checkIn.doneAt);
  const nextCheckIn = pendingCheckIns[0] ?? checkIns.find((checkIn) => checkIn.day === 90) ?? checkIns[0];
  const doneTasks = tasks.filter((task) => task.doneAt).length;
  const progress = Math.round((doneTasks / Math.max(1, tasks.length)) * 100);
  const canAssignMentor = !newcomer.mentorId || newcomer.mentor?.active === false;
  const riskClass = newcomer.risk.level;
  const circumference = 2 * Math.PI * 42;
  const dashOffset = circumference * (1 - newcomer.risk.score / 100);

  return (
    <div
      className="drawer-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={`Карточка ${newcomer.name}`}>
        <div className="drawer-header">
          <div className="drawer-topline">
            <span className="eyebrow">Карточка новичка · демо</span>
            <button className="icon-button" onClick={onClose} aria-label="Закрыть карточку">
              <X size={18} />
            </button>
          </div>

          <div className="drawer-person">
            <Avatar name={newcomer.name} size="lg" risk={newcomer.risk.level} />
            <div className="drawer-person-copy">
              <h2>{newcomer.name}</h2>
              <p>
                {newcomer.roleTitle} · {newcomer.location}
              </p>
              <div className="drawer-tags">
                <span className="tag">
                  <CalendarDays size={13} />
                  {newcomer.day}-й день из 90
                </span>
                <span className="tag">с {formatDay(newcomer.startDate)}</span>
                <RiskBadge level={newcomer.risk.level} score={newcomer.risk.score} />
              </div>
            </div>
            <div className={`drawer-score ${riskClass}`}>
              <b>{newcomer.risk.score}</b>
              <span>риск</span>
            </div>
          </div>

          <div className="drawer-meta">
            <div>
              <span>Руководитель</span>
              <b>{newcomer.manager}</b>
            </div>
            <div>
              <span>Наставник</span>
              <b className={!newcomer.mentor ? 'text-danger' : ''}>
                {newcomer.mentor?.name ?? 'не назначен'}
              </b>
            </div>
            <div>
              <span>Источник</span>
              <b>{newcomer.source}</b>
            </div>
            <div>
              <span>Задачи</span>
              <b>
                {doneTasks} из {tasks.length}
              </b>
            </div>
          </div>

          <div className="drawer-actions">
            {canAssignMentor && (
              <button className="btn btn-primary" onClick={() => setMentorOpen(true)}>
                <UserCheck size={16} />
                {newcomer.mentorId ? 'Сменить наставника' : 'Назначить наставника'}
              </button>
            )}
            <button
              className={`btn ${canAssignMentor ? 'btn-lime' : 'btn-primary'}`}
              onClick={() => setCheckInTarget(nextCheckIn)}
            >
              <MessageSquare size={16} />
              Провести чек-ин
            </button>
            <button className="btn btn-ghost" onClick={() => setTaskOpen(true)}>
              <Plus size={16} />
              Задача в Битрикс24
            </button>
          </div>
        </div>

        <div className="drawer-body">
          <section className={`risk-panel level-${riskClass}`}>
            <div className="risk-donut">
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <circle className="donut-bg" cx="50" cy="50" r="42" />
                <circle
                  className="donut-value"
                  cx="50"
                  cy="50"
                  r="42"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                />
              </svg>
              <div className="donut-label">
                <b>{newcomer.risk.score}</b>
                <span>из 100</span>
              </div>
            </div>

            <div className="risk-copy">
              <div className="risk-head">
                <span className="risk-title">Почему в зоне риска</span>
                <span className={`risk-level-label ${riskClass}`}>
                  {riskLevelLabel(newcomer.risk.level)}
                </span>
              </div>

              {newcomer.risk.signals.length === 0 ? (
                <div className="risk-empty">
                  <CheckCircle2 size={20} />
                  <span>
                    <b>Сигналов нет.</b> План идёт по графику — держите текущий темп.
                  </span>
                </div>
              ) : (
                <div className="signal-list">
                  {newcomer.risk.signals.map((signal) => (
                    <div className={`signal-row ${signal.tone}`} key={signal.id}>
                      <span className="signal-icon">
                        {signal.tone === 'danger' ? (
                          <AlertTriangle size={15} />
                        ) : (
                          <Clock3 size={15} />
                        )}
                      </span>
                      <span className="signal-copy">
                        <b>{signal.label}</b>
                        <small>{signal.detail}</small>
                      </span>
                      <span className="signal-points">+{signal.points}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="risk-next">
                <span>
                  <Zap size={15} />
                  Следующий шаг
                </span>
                <b>{nextAction(newcomer, newcomer.risk)}</b>
                <small>
                  Риск пересчитается сразу после действия. Это сигнал для разговора, а не
                  приговор.
                </small>
              </div>
            </div>
          </section>

          <section className="drawer-section">
            <div className="section-head">
              <div className="section-title">
                <Target size={17} />
                Контрольные точки
              </div>
              <span className="section-hint">4 чек-ина за 90 дней</span>
            </div>
            <div className="checkpoint-grid">
              {checkIns.map((checkIn) => {
                const state = checkInState(checkIn, today);
                return (
                  <article className={`checkpoint ${state}`} key={checkIn.id}>
                    <div className="checkpoint-top">
                      <b>{checkIn.day}-й день</b>
                      <span className={`checkpoint-status ${state}`}>
                        {state === 'done' && <Check size={12} />}
                        {state === 'missed' && <AlertTriangle size={12} />}
                        {state === 'upcoming' && <Clock3 size={12} />}
                        {state === 'done'
                          ? 'пройден'
                          : state === 'missed'
                            ? 'пропущен'
                            : 'запланирован'}
                      </span>
                    </div>
                    <div className="checkpoint-date">
                      {formatShortDate(checkIn.dueDate)} · {relativeDay(checkIn.dueDate, today)}
                    </div>

                    {state === 'done' && checkIn.mood !== null && (
                      <>
                        <div className="mood-dots" aria-label={`Оценка ${checkIn.mood} из 5`}>
                          {[1, 2, 3, 4, 5].map((value) => (
                            <span
                              key={value}
                              className={value <= (checkIn.mood ?? 0) ? 'filled' : ''}
                            />
                          ))}
                          <b>{checkIn.mood}/5</b>
                        </div>
                        {checkIn.note && <p className="checkpoint-note">«{checkIn.note}»</p>}
                        {checkIn.blockers.length > 0 && (
                          <div className="mini-chips">
                            {checkIn.blockers.map((blocker) => (
                              <span key={blocker}>{blocker}</span>
                            ))}
                          </div>
                        )}
                        <button
                          className="text-button compact"
                          onClick={() => setCheckInTarget(checkIn)}
                        >
                          Изменить
                        </button>
                      </>
                    )}

                    {state === 'missed' && (
                      <>
                        <p className="checkpoint-note danger">
                          Чек-ин не проведён. Это один из самых сильных сигналов риска.
                        </p>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setCheckInTarget(checkIn)}
                        >
                          Провести сейчас
                        </button>
                      </>
                    )}

                    {state === 'upcoming' && (
                      <>
                        <p className="checkpoint-note">
                          Запланирован. Можно провести досрочно, если есть тревожный сигнал.
                        </p>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setCheckInTarget(checkIn)}
                        >
                          Провести досрочно
                        </button>
                      </>
                    )}
                  </article>
                );
              })}
            </div>
          </section>

          <section className="drawer-section">
            <div className="section-head">
              <div className="section-title">
                <ListChecks size={17} />
                План на 90 дней
              </div>
              <span className="section-hint">
                {doneTasks} из {tasks.length} закрыто
              </span>
            </div>
            <div className="plan-progress" aria-hidden="true">
              <span style={{ width: `${progress}%` }} />
            </div>

            <div className="plan-list">
              {PHASES.map((phase) => {
                const phaseTasks = tasks
                  .filter((task) => task.phase === phase.id)
                  .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));
                if (phaseTasks.length === 0) return null;
                const phaseDone = phaseTasks.filter((task) => task.doneAt).length;
                return (
                  <div className="phase-group" key={phase.id}>
                    <div className="phase-head">
                      <span>
                        <b>{phase.label}</b>
                        <small>
                          {phaseDone}/{phaseTasks.length}
                        </small>
                      </span>
                      <span className="phase-line" />
                    </div>
                    {phaseTasks.map((task) => {
                      const overdue = !task.doneAt && isPast(task.dueDate, today);
                      return (
                        <div className={`task-row ${task.doneAt ? 'done' : ''}`} key={task.id}>
                          <button
                            className={`task-check ${task.doneAt ? 'checked' : ''}`}
                            onClick={() => toggleTask(task.id)}
                            aria-label={
                              task.doneAt
                                ? `Вернуть задачу «${task.title}» в работу`
                                : `Закрыть задачу «${task.title}»`
                            }
                            title={task.doneAt ? 'Вернуть в работу' : 'Отметить выполненной'}
                          >
                            {task.doneAt && <Check size={13} />}
                          </button>
                          <span className="task-copy">
                            <span className="task-title">{task.title}</span>
                            <span className="task-meta">
                              <span className={overdue ? 'text-danger' : ''}>
                                до {formatShortDate(task.dueDate)}
                                {overdue ? ' · просрочено' : ''}
                              </span>
                              <span>{task.owner}</span>
                              {task.critical && <span className="critical-tag">обязательная</span>}
                              <button
                                className="bitrix-task"
                                onClick={() =>
                                  showToast(
                                    `Задача ${task.bitrixTaskId} в Битрикс24`,
                                    'Демо-адаптер: ссылка откроется в реальном портале',
                                  )
                                }
                              >
                                <span className="bitrix-mini">Б</span>
                                {task.bitrixTaskId}
                                <ExternalLink size={11} />
                              </button>
                            </span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <button className="btn btn-ghost full-width" onClick={() => setTaskOpen(true)}>
              <Plus size={16} />
              Добавить задачу в Битрикс24
            </button>
          </section>

          <section className="drawer-section">
            <div className="section-head">
              <div className="section-title">
                <History size={17} />
                История
              </div>
              <span className="section-hint">{activities.length} событий</span>
            </div>
            <div className="drawer-activity">
              {activities.length === 0 && (
                <div className="empty-state">Событий пока нет.</div>
              )}
              {activities.slice(0, 10).map((activity) => {
                const Icon = activityIcon(activity.type);
                return (
                  <div className={`activity-row type-${activity.type}`} key={activity.id}>
                    <span className="activity-icon">
                      <Icon size={14} />
                    </span>
                    <span className="activity-copy">
                      <span>{activity.text}</span>
                      <small>{relativeDay(activity.at, today)}</small>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </aside>

      {mentorOpen && (
        <MentorModal
          newcomer={newcomer}
          onClose={() => setMentorOpen(false)}
        />
      )}
      {checkInTarget && (
        <CheckInModal
          newcomer={newcomer}
          checkIn={checkInTarget}
          onClose={() => setCheckInTarget(null)}
        />
      )}
      {taskOpen && <TaskModal newcomer={newcomer} onClose={() => setTaskOpen(false)} />}
    </div>
  );
}

function MentorModal({
  newcomer,
  onClose,
}: {
  newcomer: NewcomerWithRisk;
  onClose: () => void;
}) {
  const { state, assignMentor } = useStore();
  const [selected, setSelected] = useState(newcomer.mentorId ?? '');
  const activeMentors = useMemo(
    () =>
      state.mentors
        .filter((mentor) => mentor.active)
        .sort((a, b) => {
          const aMatch = a.location === newcomer.location ? 1 : 0;
          const bMatch = b.location === newcomer.location ? 1 : 0;
          return bMatch - aMatch;
        }),
    [state.mentors, newcomer.location],
  );

  return (
    <Modal
      title={newcomer.mentorId ? 'Сменить наставника' : 'Назначить наставника'}
      subtitle="Наставник — не начальник. Он помогает освоиться и снимает бытовые вопросы."
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Отмена
          </button>
          <button
            className="btn btn-primary"
            disabled={!selected}
            onClick={() => {
              assignMentor(newcomer.id, selected);
              onClose();
            }}
          >
            Назначить
          </button>
        </>
      }
    >
      {newcomer.mentor && !newcomer.mentor.active && (
        <div className="warning-box">
          <AlertTriangle size={16} />
          Текущий наставник {newcomer.mentor.name} недоступен. Нужна замена.
        </div>
      )}
      <div className="mentor-list">
        {activeMentors.map((mentor) => {
          const load = state.newcomers.filter(
            (item) => item.mentorId === mentor.id && item.id !== newcomer.id,
          ).length;
          const recommended = mentor.location === newcomer.location;
          return (
            <button
              key={mentor.id}
              className={`mentor-option ${selected === mentor.id ? 'selected' : ''}`}
              onClick={() => setSelected(mentor.id)}
            >
              <span className={`radio-dot ${selected === mentor.id ? 'checked' : ''}`} />
              <span className="mentor-option-copy">
                <span className="mentor-option-top">
                  <b>{mentor.name}</b>
                  {recommended && <span className="recommend-tag">та же точка</span>}
                </span>
                <small>
                  {mentor.role} · {mentor.location}
                </small>
              </span>
              <span className="mentor-load">
                {load} {pluralRu(load, 'новичок', 'новичка', 'новичков')}
              </span>
            </button>
          );
        })}
      </div>
      <p className="modal-note">
        После назначения в Битрикс24 создастся задача на знакомство со сроком «завтра».
      </p>
    </Modal>
  );
}

function CheckInModal({
  newcomer,
  checkIn,
  onClose,
}: {
  newcomer: NewcomerWithRisk;
  checkIn: CheckIn;
  onClose: () => void;
}) {
  const { completeCheckIn } = useStore();
  const [mood, setMood] = useState<number | null>(checkIn.mood);
  const [note, setNote] = useState(checkIn.note === 'Чек-ин не проведён.' ? '' : checkIn.note);
  const [blockers, setBlockers] = useState<string[]>(checkIn.blockers);
  const isDone = Boolean(checkIn.doneAt);

  const toggleBlocker = (blocker: string) => {
    setBlockers((current) =>
      current.includes(blocker)
        ? current.filter((item) => item !== blocker)
        : [...current, blocker],
    );
  };

  return (
    <Modal
      title={`Чек-ин ${checkIn.day}-го дня`}
      subtitle="15 минут с руководителем. Оценка — сигнал, а не рейтинг сотрудника."
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Отмена
          </button>
          <button
            className="btn btn-primary"
            disabled={mood === null}
            onClick={() => {
              if (mood === null) return;
              completeCheckIn(newcomer.id, checkIn.day, mood, note.trim(), blockers);
              onClose();
            }}
          >
            {isDone ? 'Обновить чек-ин' : 'Сохранить чек-ин'}
          </button>
        </>
      }
    >
      <div className="field">
        <label>Как новичок оценивает состояние?</label>
        <div className="mood-picker">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              className={`mood-option mood-${value} ${mood === value ? 'selected' : ''}`}
              onClick={() => setMood(value)}
            >
              <b>{value}</b>
              <small>{moodLabels[value]}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="checkin-note">Что важно зафиксировать</label>
        <textarea
          id="checkin-note"
          className="input textarea"
          rows={4}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Что беспокоит? Что помогает? Что нужно изменить?"
        />
      </div>

      <div className="field">
        <label>Что мешает работать</label>
        <div className="blocker-chips">
          {blockerOptions.map((blocker) => (
            <button
              key={blocker}
              className={`blocker-chip ${blockers.includes(blocker) ? 'selected' : ''}`}
              onClick={() => toggleBlocker(blocker)}
            >
              {blockers.includes(blocker) && <Check size={12} />}
              {blocker}
            </button>
          ))}
        </div>
      </div>

      <details className="script-box">
        <summary>
          <Sparkles size={15} />
          Скрипт разговора на 15 минут
        </summary>
        <ol>
          <li>Что оказалось не так, как ты ожидал(а), когда выходил(а) на работу?</li>
          <li>Что сейчас больше всего мешает делать задачи? Что помогает?</li>
          <li>Что тебе нужно от меня или наставника на следующей неделе?</li>
        </ol>
      </details>
    </Modal>
  );
}

function TaskModal({
  newcomer,
  onClose,
}: {
  newcomer: NewcomerWithRisk;
  onClose: () => void;
}) {
  const { createTask, showToast, today } = useStore();
  const [title, setTitle] = useState(suggestedTask(newcomer));
  const [owner, setOwner] = useState<TaskOwner>('Руководитель');
  const [dueDate, setDueDate] = useState(addDays(today, 1));
  const [critical, setCritical] = useState(newcomer.risk.level === 'red');

  return (
    <Modal
      title="Задача в Битрикс24"
      subtitle={`Для ${newcomer.name}. Появится в плане и в портале.`}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Отмена
          </button>
          <button
            className="btn btn-primary"
            disabled={!title.trim()}
            onClick={() => {
              const id = createTask(newcomer.id, {
                title: title.trim(),
                dueDate,
                owner,
                critical,
              });
              showToast(
                `Задача ${id} создана в Битрикс24`,
                `${owner} · срок ${formatShortDate(dueDate)}`,
              );
              onClose();
            }}
          >
            Создать задачу
          </button>
        </>
      }
    >
      <div className="field">
        <label htmlFor="task-title">Что сделать</label>
        <input
          id="task-title"
          className="input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          autoFocus
        />
      </div>

      <div className="form-grid">
        <div className="field">
          <label htmlFor="task-owner">Ответственный</label>
          <select
            id="task-owner"
            className="input"
            value={owner}
            onChange={(event) => setOwner(event.target.value as TaskOwner)}
          >
            <option>Руководитель</option>
            <option>Наставник</option>
            <option>HR</option>
            <option>Новичок</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="task-due">Срок</label>
          <input
            id="task-due"
            type="date"
            className="input"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </div>
      </div>

      <label className="checkline">
        <input
          type="checkbox"
          checked={critical}
          onChange={(event) => setCritical(event.target.checked)}
        />
        <span>
          <b>Обязательная задача</b>
          <small>Просрочка попадёт в риск-сигналы</small>
        </span>
      </label>

      <div className="bitrix-preview">
        <span className="bitrix-mark">Б</span>
        <span>
          <b>Битрикс24 · демо-адаптер</b>
          <small>
            Задача создастся с ID и дедлайном. Реальный вебхук не подключён — нет доступа к
            порталу.
          </small>
        </span>
        <ArrowRight size={16} />
      </div>
    </Modal>
  );
}
