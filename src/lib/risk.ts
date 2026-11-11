import type {
  CheckIn,
  Mentor,
  Newcomer,
  RiskLevel,
  RiskResult,
  RiskSignal,
  Task,
} from '../types';
import { daysSince, daysUntil, isPast, todayISO } from './dates';

export const RISK_THRESHOLDS = {
  red: 50,
  yellow: 25,
};

export function riskLevel(score: number): RiskLevel {
  if (score >= RISK_THRESHOLDS.red) return 'red';
  if (score >= RISK_THRESHOLDS.yellow) return 'yellow';
  return 'green';
}

export function riskLevelLabel(level: RiskLevel): string {
  if (level === 'red') return 'Высокий риск';
  if (level === 'yellow') return 'Наблюдать';
  return 'В норме';
}

export function riskShortLabel(level: RiskLevel): string {
  if (level === 'red') return 'Красная зона';
  if (level === 'yellow') return 'Жёлтая зона';
  return 'Зелёная зона';
}

export function assessRisk(
  newcomer: Newcomer,
  tasks: Task[],
  checkIns: CheckIn[],
  mentors: Mentor[],
  today = todayISO(),
): RiskResult {
  const day = Math.max(0, daysSince(newcomer.startDate, today));
  const ownTasks = tasks.filter((task) => task.newcomerId === newcomer.id);
  const ownCheckIns = checkIns.filter((checkIn) => checkIn.newcomerId === newcomer.id);
  const mentor = mentors.find((item) => item.id === newcomer.mentorId) ?? null;
  const signals: RiskSignal[] = [];

  const overdueCritical = ownTasks.filter(
    (task) => task.critical && !task.doneAt && isPast(task.dueDate, today),
  );
  if (overdueCritical.length > 0) {
    const points = Math.min(36, overdueCritical.length * 18);
    const names = overdueCritical
      .slice(0, 2)
      .map((task) => task.title)
      .join('; ');
    signals.push({
      id: 'overdue-critical',
      label:
        overdueCritical.length === 1
          ? 'Просрочена обязательная задача'
          : `Просрочены обязательные задачи: ${overdueCritical.length}`,
      detail: names,
      points,
      tone: points >= 20 ? 'danger' : 'warning',
    });
  }

  if (day >= 3 && !newcomer.mentorId) {
    signals.push({
      id: 'no-mentor',
      label: 'Не назначен наставник',
      detail: `Новичок ${day} дней без закреплённого наставника`,
      points: 22,
      tone: 'danger',
    });
  }

  if (mentor && !mentor.active) {
    signals.push({
      id: 'inactive-mentor',
      label: 'Наставник недоступен',
      detail: `${mentor.name} уволился — нужен новый наставник`,
      points: 16,
      tone: 'warning',
    });
  }

  const missedCheckIns = ownCheckIns.filter(
    (checkIn) => !checkIn.doneAt && isPast(checkIn.dueDate, today),
  );
  if (missedCheckIns.length > 0) {
    signals.push({
      id: 'missed-checkin',
      label:
        missedCheckIns.length === 1
          ? 'Пропущен чек-ин'
          : `Пропущены чек-ины: ${missedCheckIns.length}`,
      detail: missedCheckIns.map((checkIn) => `${checkIn.day}-й день`).join(', '),
      points: 24,
      tone: 'danger',
    });
  }

  const doneCheckIns = ownCheckIns
    .filter((checkIn) => checkIn.doneAt)
    .sort((a, b) => b.day - a.day);
  const lastCheckIn = doneCheckIns[0];
  if (lastCheckIn?.mood !== null && lastCheckIn?.mood !== undefined && lastCheckIn.mood <= 2) {
    signals.push({
      id: 'low-mood',
      label: 'Низкая оценка на чек-ине',
      detail: `${lastCheckIn.day}-й день: ${lastCheckIn.mood}/5`,
      points: 20,
      tone: 'danger',
    });
  }

  const daysSinceOneOnOne =
    newcomer.lastOneOnOneAt === null ? null : daysSince(newcomer.lastOneOnOneAt, today);
  if (day > 21 && (daysSinceOneOnOne === null || daysSinceOneOnOne > 14)) {
    signals.push({
      id: 'stale-one-on-one',
      label: 'Нет 1:1 с руководителем',
      detail:
        daysSinceOneOnOne === null
          ? 'Встреч ещё не было'
          : `Последняя встреча ${daysSinceOneOnOne} дней назад`,
      points: 14,
      tone: 'warning',
    });
  }

  const weekOneOpen = ownTasks.filter(
    (task) => task.phase === 'week1' && !task.doneAt && isPast(task.dueDate, today),
  );
  if (day > 7 && weekOneOpen.length > 0) {
    signals.push({
      id: 'week-one-open',
      label: 'Не закрыта первая неделя',
      detail: `${weekOneOpen.length} задач: ${weekOneOpen[0].title}`,
      points: 12,
      tone: 'warning',
    });
  }

  const daysSinceMentor =
    newcomer.lastMentorMeetingAt === null
      ? null
      : daysSince(newcomer.lastMentorMeetingAt, today);
  if (
    mentor &&
    mentor.active &&
    day > 14 &&
    (daysSinceMentor === null || daysSinceMentor > 14)
  ) {
    signals.push({
      id: 'mentor-stale',
      label: 'Наставник не встречался 14+ дней',
      detail:
        daysSinceMentor === null
          ? 'Встреч с наставником ещё не было'
          : `Последняя встреча ${daysSinceMentor} дней назад`,
      points: 10,
      tone: 'warning',
    });
  }

  const score = Math.min(
    100,
    signals.reduce((total, signal) => total + signal.points, 0),
  );
  const sortedSignals = [...signals].sort((a, b) => b.points - a.points);

  return {
    score,
    level: riskLevel(score),
    signals: sortedSignals,
    topSignal: sortedSignals[0] ?? null,
  };
}

export function nextCheckIn(checkIns: CheckIn[], today = todayISO()): CheckIn | null {
  const upcoming = checkIns
    .filter((checkIn) => !checkIn.doneAt && daysUntil(checkIn.dueDate, today) >= 0)
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));
  return upcoming[0] ?? null;
}

export function checkInState(checkIn: CheckIn, today = todayISO()): 'done' | 'missed' | 'upcoming' {
  if (checkIn.doneAt) return 'done';
  if (isPast(checkIn.dueDate, today)) return 'missed';
  return 'upcoming';
}

export function nextAction(newcomer: Newcomer, risk: RiskResult): string {
  if (!newcomer.mentorId) return 'Назначить наставника';
  if (risk.signals.some((signal) => signal.id === 'inactive-mentor')) {
    return 'Назначить нового наставника';
  }
  if (risk.signals.some((signal) => signal.id === 'missed-checkin')) return 'Провести чек-ин';
  if (risk.signals.some((signal) => signal.id === 'low-mood')) return 'Провести 1:1';
  if (risk.signals.some((signal) => signal.id === 'overdue-critical')) {
    return 'Создать задачу руководителю';
  }
  if (risk.signals.some((signal) => signal.id === 'stale-one-on-one')) return 'Провести 1:1';
  if (risk.signals.some((signal) => signal.id === 'week-one-open')) return 'Закрыть первую неделю';
  if (risk.signals.some((signal) => signal.id === 'mentor-stale')) {
    return 'Связаться с наставником';
  }
  return 'Проверить карточку';
}
