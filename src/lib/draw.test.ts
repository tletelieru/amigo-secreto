import { describe, expect, it } from 'vitest';
import { draw } from './draw';
import type { Assignment, Exclusion } from './draw';

const ids = ['a', 'b', 'c', 'd', 'e', 'f'];

function cycleLength(result: Assignment, start: string) {
  let length = 1;
  for (let at = result[start]; at !== start; at = result[at]) length += 1;
  return length;
}

describe('draw', () => {
  it('gives everyone one receiver and never themselves', () => {
    for (let run = 0; run < 200; run += 1) {
      const result = draw(ids, [], false)!;
      expect(Object.keys(result).sort()).toEqual(ids);
      expect(Object.values(result).sort()).toEqual(ids);
      ids.forEach((id) => expect(result[id]).not.toBe(id));
    }
  });

  it('respects two-way exclusions', () => {
    const exclusions: Exclusion[] = [{ from: 'a', to: 'b', oneWay: false }];
    for (let run = 0; run < 200; run += 1) {
      const result = draw(ids, exclusions, false)!;
      expect(result.a).not.toBe('b');
      expect(result.b).not.toBe('a');
    }
  });

  it('applies one-way exclusions in one direction only', () => {
    const exclusions: Exclusion[] = [{ from: 'a', to: 'b', oneWay: true }];
    const reverse = new Set<string>();
    for (let run = 0; run < 300; run += 1) {
      const result = draw(ids, exclusions, false)!;
      expect(result.a).not.toBe('b');
      reverse.add(result.b);
    }
    expect(reverse.has('a')).toBe(true);
  });

  it('forms a single cycle on request', () => {
    for (let run = 0; run < 200; run += 1) {
      expect(cycleLength(draw(ids, [], true)!, 'a')).toBe(ids.length);
    }
  });

  it('finds the only valid assignment under tight exclusions', () => {
    const exclusions: Exclusion[] = [
      { from: 'a', to: 'c', oneWay: true },
      { from: 'b', to: 'a', oneWay: true },
      { from: 'c', to: 'b', oneWay: true },
    ];
    expect(draw(['a', 'b', 'c'], exclusions, false)).toEqual({ a: 'b', b: 'c', c: 'a' });
    expect(draw(['a', 'b', 'c'], exclusions, true)).toEqual({ a: 'b', b: 'c', c: 'a' });
  });

  it('solves a large sparse case that random tries would miss', () => {
    const many = Array.from({ length: 40 }, (_, index) => `p${index}`);
    const exclusions: Exclusion[] = many.flatMap((from, index) =>
      many
        .filter((_, other) => other !== (index + 1) % many.length && other !== index)
        .map((to) => ({ from, to, oneWay: true })),
    );
    const result = draw(many, exclusions, false)!;
    many.forEach((id, index) => expect(result[id]).toBe(many[(index + 1) % many.length]));
  });

  it('returns null when nobody can give to a person', () => {
    const exclusions: Exclusion[] = [
      { from: 'b', to: 'a', oneWay: true },
      { from: 'c', to: 'a', oneWay: true },
    ];
    expect(draw(['a', 'b', 'c'], exclusions, false)).toBeNull();
    expect(draw(['a', 'b', 'c'], exclusions, true)).toBeNull();
  });

  it('separates a pairing that only fails as a single cycle', () => {
    const four = ['a', 'b', 'c', 'd'];
    const exclusions: Exclusion[] = [
      { from: 'a', to: 'c', oneWay: false },
      { from: 'a', to: 'd', oneWay: false },
      { from: 'b', to: 'c', oneWay: false },
      { from: 'b', to: 'd', oneWay: false },
    ];
    expect(draw(four, exclusions, false)).toEqual({ a: 'b', b: 'a', c: 'd', d: 'c' });
    expect(draw(four, exclusions, true)).toBeNull();
  });

  it('needs at least three people', () => {
    expect(draw(['a', 'b'], [], false)).toBeNull();
  });
});
