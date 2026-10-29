import { describe, expect, it } from 'vitest';
import explainersJson from '../data/explainers.json';
import { CARD_INDEX, EXPLAINERS, explainerSeconds } from '../services/content';
import type { Explainer } from '../types';

const VISUALS = ['scale', 'curve', 'cycle', 'bars', 'stack', 'versus', 'chain', 'statement'];
const RAW = explainersJson as Explainer[];

describe('motion explainers', () => {
  it('every explainer points at a real card, once', () => {
    const ids = RAW.map((e) => e.cardId);
    ids.forEach((id) => expect(CARD_INDEX.has(id), id).toBe(true));
    expect(new Set(ids).size).toBe(ids.length);
    expect(EXPLAINERS.length).toBe(RAW.length);
  });

  it.each(RAW.map((e) => [e.cardId, e] as const))('explainer %s is valid', (_id, e) => {
    expect(e.scenes.length, 'scene count').toBeGreaterThanOrEqual(3);
    expect(e.scenes.length, 'scene count').toBeLessThanOrEqual(6);
    const total = explainerSeconds(e);
    expect(total, 'total seconds').toBeGreaterThanOrEqual(25);
    expect(total, 'total seconds').toBeLessThanOrEqual(60);
    for (const s of e.scenes) {
      expect(VISUALS).toContain(s.visual);
      expect(s.caption.length, s.caption).toBeLessThanOrEqual(140);
      expect(s.chapter.length, s.chapter).toBeLessThanOrEqual(32);
      (s.labels ?? []).forEach((l) => expect(l.length, l).toBeLessThanOrEqual(18));
      (s.values ?? []).forEach((v) => expect(v >= 0 && v <= 1, `value ${v}`).toBe(true));
      if (['scale', 'versus'].includes(s.visual)) expect(s.labels?.length, `${s.visual} labels`).toBe(2);
      if (['bars', 'chain'].includes(s.visual)) expect(s.values?.length, `${s.visual} values`).toBe(s.labels?.length);
      if (s.visual === 'curve') expect((s.values ?? []).length, 'curve points').toBeGreaterThanOrEqual(2);
      if (['cycle', 'stack'].includes(s.visual)) expect(s.labels?.length ?? 0, `${s.visual} labels`).toBeGreaterThanOrEqual(2);
      if (s.visual === 'statement') expect(s.labels?.length, 'statement label').toBe(1);
    }
  });
});
