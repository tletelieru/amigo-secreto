import { draw } from './draw';
import type { Exclusion } from './draw';
import { googleClientId } from './google';
import { createGroupToken, isEmail, normalizeEmail } from './groupLink';
import { createToken } from './link';

export type EventInfo = { name: string; date: string; amount: string; note: string };

export type Participant = { id: string; name: string; emoji: string; email?: string };

export type DrawResult = {
  tokens: Record<string, string>;
  sent: Record<string, boolean>;
  groupToken?: string;
};

export type Group = {
  event: EventInfo;
  participants: Participant[];
  exclusions: Exclusion[];
  singleCycle: boolean;
  result: DrawResult | null;
};

export const limits = { name: 40, eventName: 60, amount: 30, note: 200, participants: 60 };

export const emptyGroup = (): Group => ({
  event: { name: '', date: '', amount: '', note: '' },
  participants: [],
  exclusions: [],
  singleCycle: false,
  result: null,
});

export const participantIds = (group: Group) => group.participants.map(({ id }) => id);

export const canDraw = (group: Group) =>
  draw(participantIds(group), group.exclusions, group.singleCycle) !== null;

export function addParticipant(group: Group, rawName: string): Group {
  const name = rawName.trim().slice(0, limits.name);
  const taken = group.participants.some((p) => p.name.toLowerCase() === name.toLowerCase());
  if (!name || taken || group.participants.length >= limits.participants) return group;
  const participant = { id: crypto.randomUUID(), name, emoji: '' };
  return { ...group, participants: [...group.participants, participant] };
}

export function removeParticipant(group: Group, id: string): Group {
  return {
    ...group,
    participants: group.participants.filter((p) => p.id !== id),
    exclusions: group.exclusions.filter(({ from, to }) => from !== id && to !== id),
  };
}

export function hasAllEmails(group: Group): boolean {
  const emails = group.participants.map((p) => p.email ?? '');
  const unique = new Set(emails.map(normalizeEmail));
  return emails.length > 0 && emails.every(isEmail) && unique.size === emails.length;
}

export async function runDraw(group: Group): Promise<Group | null> {
  const assignment = draw(participantIds(group), group.exclusions, group.singleCycle);
  if (!assignment) return null;
  const nameOf = new Map(group.participants.map((p) => [p.id, p.name]));
  const entries = await Promise.all(
    group.participants.map(async ({ id, name }) => {
      const receiver = nameOf.get(assignment[id])!;
      return [id, await createToken({ giver: name, receiver, event: group.event })] as const;
    }),
  );
  const groupToken =
    googleClientId() && hasAllEmails(group)
      ? await createGroupToken(
          group.event,
          group.participants.map(({ id, name, email }) => ({
            email: email ?? '',
            giver: name,
            receiver: nameOf.get(assignment[id])!,
          })),
        )
      : undefined;
  const tokens = Object.fromEntries(entries);
  return { ...group, result: { tokens, sent: {}, ...(groupToken ? { groupToken } : {}) } };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasStrings = (value: Record<string, unknown>, keys: string[]) =>
  keys.every((key) => typeof value[key] === 'string');

function isResult(value: unknown): value is DrawResult {
  return (
    isRecord(value) &&
    isRecord(value.tokens) &&
    isRecord(value.sent) &&
    Object.values(value.tokens).every((token) => typeof token === 'string') &&
    Object.values(value.sent).every((sent) => typeof sent === 'boolean') &&
    (value.groupToken === undefined || typeof value.groupToken === 'string')
  );
}

export function isGroup(value: unknown): value is Group {
  if (!isRecord(value) || !isRecord(value.event)) return false;
  if (!Array.isArray(value.participants) || !Array.isArray(value.exclusions)) return false;
  if (typeof value.singleCycle !== 'boolean') return false;
  if (value.result !== null && !isResult(value.result)) return false;
  return (
    hasStrings(value.event, ['name', 'date', 'amount', 'note']) &&
    value.participants.every(
      (p) =>
        isRecord(p) &&
        hasStrings(p, ['id', 'name', 'emoji']) &&
        (p.email === undefined || typeof p.email === 'string'),
    ) &&
    value.exclusions.every(
      (e) => isRecord(e) && hasStrings(e, ['from', 'to']) && typeof e.oneWay === 'boolean',
    )
  );
}

export function parseGroup(text: string): Group | null {
  try {
    const value: unknown = JSON.parse(text);
    return isGroup(value) ? value : null;
  } catch {
    return null;
  }
}
