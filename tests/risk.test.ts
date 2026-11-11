import { describe, expect, it } from 'vitest';
import { buildSeed } from '../src/data/seed';
import { assessRisk, riskLevel } from '../src/lib/risk';
import type { CheckIn, Newcomer, Task } from '../src/types';

const TODAY = '2026-11-11';

function state() {
  return buildSeed(TODAY);
}

function newcomer(id: string, data = state()): Newcomer {
  const found = data.newcomers.find((item) => item.id === id);
  if (!found) throw new Error(`Новичок ${id} не найден`);
  return found;
}

function assess(
  person: Newcomer,
  tasks: Task[],
  checkIns: CheckIn[],
  mentors = state().mentors,
) {
  return assessRisk(person, tasks, checkIns, mentors, TODAY);
}

describe('risk engine', () => {
  it('держит три красные зоны в демо-срезе', () => {
    const data = state();
    const red = data.newcomers.filter(
      (item) => assess(item, data.tasks, data.checkIns).level === 'red',
    );
    expect(red.map((item) => item.id).sort()).toEqual(['n-kirill', 'n-marina', 'n-nikita']);
  });

  it('Марина: 94 балла и четыре сигнала до действий', () => {
    const data = state();
    const person = newcomer('n-marina', data);
    const risk = assess(person, data.tasks, data.checkIns);
    expect(risk.score).toBe(94);
    expect(risk.level).toBe('red');
    expect(risk.signals.map((signal) => signal.id).sort()).toEqual([
      'missed-checkin',
      'no-mentor',
      'overdue-critical',
      'week-one-open',
    ]);
  });

  it('назначение наставника снимает 22 балла', () => {
    const data = state();
    const person = { ...newcomer('n-marina', data), mentorId: 'm-romanova' };
    const risk = assess(person, data.tasks, data.checkIns);
    expect(risk.score).toBe(72);
    expect(risk.signals.some((signal) => signal.id === 'no-mentor')).toBe(false);
  });

  it('закрытый чек-ин снимает ещё 24 балла', () => {
    const data = state();
    const person = { ...newcomer('n-marina', data), mentorId: 'm-romanova' };
    const checkIns = data.checkIns.map((checkIn) =>
      checkIn.newcomerId === 'n-marina' && checkIn.day === 7
        ? { ...checkIn, doneAt: TODAY, mood: 3, note: 'Нормально', blockers: [] }
        : checkIn,
    );
    const risk = assess(person, data.tasks, checkIns);
    expect(risk.score).toBe(48);
    expect(risk.signals.some((signal) => signal.id === 'missed-checkin')).toBe(false);
  });

  it('закрытие двух обязательных задач опускает Марину в зелёную зону', () => {
    const data = state();
    const person = { ...newcomer('n-marina', data), mentorId: 'm-romanova' };
    const checkIns = data.checkIns.map((checkIn) =>
      checkIn.newcomerId === 'n-marina' && checkIn.day === 7
        ? { ...checkIn, doneAt: TODAY, mood: 3, note: 'Нормально', blockers: [] }
        : checkIn,
    );
    const tasks = data.tasks.map((task) =>
      task.newcomerId === 'n-marina' &&
      ['common-access', 'sales-cash'].includes(task.templateId)
        ? { ...task, doneAt: TODAY }
        : task,
    );
    const risk = assess(person, tasks, checkIns);
    expect(risk.score).toBe(0);
    expect(risk.level).toBe('green');
  });

  it('видит уволившегося наставника', () => {
    const data = state();
    const risk = assess(newcomer('n-ilya', data), data.tasks, data.checkIns);
    expect(risk.signals.some((signal) => signal.id === 'inactive-mentor')).toBe(true);
    expect(risk.score).toBe(30);
  });

  it('не поднимает тревогу у новичка без сигналов', () => {
    const data = state();
    const risk = assess(newcomer('n-daria', data), data.tasks, data.checkIns);
    expect(risk.score).toBe(0);
    expect(risk.level).toBe('green');
    expect(risk.signals).toHaveLength(0);
  });

  it('переводит баллы в зоны по порогам', () => {
    expect(riskLevel(0)).toBe('green');
    expect(riskLevel(24)).toBe('green');
    expect(riskLevel(25)).toBe('yellow');
    expect(riskLevel(49)).toBe('yellow');
    expect(riskLevel(50)).toBe('red');
    expect(riskLevel(100)).toBe('red');
  });
});
