import { describe, expect, it } from 'vitest';
import { buildSeed } from '../src/data/seed';

const TODAY = '2026-11-11';

describe('demo seed', () => {
  const data = buildSeed(TODAY);

  it('собирает 14 новичков и по 4 чек-ина на каждого', () => {
    expect(data.newcomers).toHaveLength(14);
    expect(data.checkIns).toHaveLength(14 * 4);
  });

  it('не оставляет задачи без идентификатора Битрикс24', () => {
    expect(data.tasks.length).toBeGreaterThan(150);
    expect(data.tasks.every((task) => task.bitrixTaskId?.startsWith('#'))).toBe(true);
  });

  it('делает Марину учебным кейсом: 12-й день, без наставника, чек-ин пропущен', () => {
    const marina = data.newcomers.find((item) => item.id === 'n-marina');
    expect(marina).toBeDefined();
    expect(marina?.mentorId).toBeNull();
    const missed = data.checkIns.find(
      (item) => item.newcomerId === 'n-marina' && item.day === 7,
    );
    expect(missed?.doneAt).toBeNull();
  });

  it('не содержит персональных данных реальных людей', () => {
    const names = data.newcomers.map((item) => item.name).join(' ');
    expect(names).not.toContain('@');
    expect(names).not.toMatch(/\d{3}/);
  });
});
