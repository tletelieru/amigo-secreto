import { beforeEach, describe, expect, it } from 'vitest';
import { addParticipant, emptyGroup } from './group';
import { applyList, loadLists, saveLists, toSavedList, upsertList } from './lists';

const base = ['Ana', 'Ben', 'Cami'].reduce(addParticipant, emptyGroup());
const [ana, ben] = base.participants;
const group = {
  ...base,
  exclusions: [{ from: ana.id, to: ben.id, oneWay: false }],
};

beforeEach(() => localStorage.clear());

describe('lists', () => {
  it('restores people and exclusions with fresh ids', () => {
    const restored = applyList(emptyGroup(), toSavedList(group, ' Familia '));
    expect(restored.participants.map((p) => p.name)).toEqual(['Ana', 'Ben', 'Cami']);
    expect(restored.participants[0].id).not.toBe(ana.id);
    expect(restored.exclusions).toEqual([
      { from: restored.participants[0].id, to: restored.participants[1].id, oneWay: false },
    ]);
  });

  it('keeps the event when a list is applied', () => {
    const current = { ...emptyGroup(), event: { ...emptyGroup().event, name: 'Navidad' } };
    expect(applyList(current, toSavedList(group, 'Familia')).event.name).toBe('Navidad');
  });

  it('replaces a list with the same name', () => {
    const first = toSavedList(group, 'Familia');
    const second = toSavedList(base, 'familia');
    expect(upsertList([first], second)).toEqual([second]);
  });

  it('survives a reload and ignores corrupt data', () => {
    const list = toSavedList(group, 'Familia');
    saveLists([list]);
    expect(loadLists()).toEqual([list]);
    localStorage.setItem('as-lists', '[{"name":1}]');
    expect(loadLists()).toEqual([]);
  });
});
