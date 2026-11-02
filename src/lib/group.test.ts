import { describe, expect, it } from 'vitest';
import {
  addParticipant,
  canDraw,
  emptyGroup,
  parseGroup,
  removeParticipant,
  runDraw,
} from './group';
import { readToken } from './link';

const withNames = (...names: string[]) => names.reduce(addParticipant, emptyGroup());

describe('group', () => {
  it('trims names and skips blanks and duplicates', () => {
    const group = withNames(' Ana ', 'ana', '   ', 'Ben');
    expect(group.participants.map((p) => p.name)).toEqual(['Ana', 'Ben']);
  });

  it('drops exclusions with a removed participant', () => {
    const group = withNames('Ana', 'Ben', 'Cami');
    const [ana, ben, cami] = group.participants;
    const excluded = {
      ...group,
      exclusions: [
        { from: ana.id, to: ben.id, oneWay: false },
        { from: ben.id, to: cami.id, oneWay: false },
      ],
    };
    expect(removeParticipant(excluded, ana.id).exclusions).toHaveLength(1);
  });

  it('reports whether a draw is possible', () => {
    expect(canDraw(withNames('Ana', 'Ben'))).toBe(false);
    expect(canDraw(withNames('Ana', 'Ben', 'Cami'))).toBe(true);
  });

  it('issues one readable ticket per person', async () => {
    const group = await runDraw(withNames('Ana', 'Ben', 'Cami'));
    const tickets = await Promise.all(
      group!.participants.map((p) => readToken(group!.result!.tokens[p.id])),
    );
    expect(tickets.map((t) => t!.giver)).toEqual(['Ana', 'Ben', 'Cami']);
    expect(tickets.map((t) => t!.receiver).sort()).toEqual(['Ana', 'Ben', 'Cami']);
    tickets.forEach((t) => expect(t!.receiver).not.toBe(t!.giver));
  });

  it('round-trips through JSON and rejects bad imports', async () => {
    const group = await runDraw(withNames('Ana', 'Ben', 'Cami'));
    expect(parseGroup(JSON.stringify(group))).toEqual(group);
    expect(parseGroup('nope')).toBeNull();
    expect(parseGroup('{"event":{}}')).toBeNull();
  });
});
