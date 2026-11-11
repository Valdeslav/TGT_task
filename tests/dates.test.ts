import { describe, expect, it } from 'vitest';
import { addDays, daysBetween, daysSince, pluralRu, relativeDay } from '../src/lib/dates';

describe('date helpers', () => {
  it('складывает дни через границу месяца', () => {
    expect(addDays('2026-01-30', 3)).toBe('2026-02-02');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('считает разницу в днях без часовых поясов', () => {
    expect(daysBetween('2026-11-01', '2026-11-11')).toBe(10);
    expect(daysSince('2026-11-11', '2026-11-11')).toBe(0);
  });

  it('склоняет русские существительные', () => {
    expect(pluralRu(1, 'день', 'дня', 'дней')).toBe('день');
    expect(pluralRu(2, 'день', 'дня', 'дней')).toBe('дня');
    expect(pluralRu(5, 'день', 'дня', 'дней')).toBe('дней');
    expect(pluralRu(11, 'день', 'дня', 'дней')).toBe('дней');
    expect(pluralRu(21, 'день', 'дня', 'дней')).toBe('день');
  });

  it('показывает относительные даты', () => {
    expect(relativeDay('2026-11-11', '2026-11-11')).toBe('сегодня');
    expect(relativeDay('2026-11-12', '2026-11-11')).toBe('завтра');
    expect(relativeDay('2026-11-10', '2026-11-11')).toBe('вчера');
    expect(relativeDay('2026-11-15', '2026-11-11')).toBe('через 4 дня');
  });
});
