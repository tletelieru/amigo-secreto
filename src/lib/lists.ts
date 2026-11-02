import { limits } from './group';
import type { Group } from './group';
import { load, save } from './storage';

type SavedPerson = { name: string; emoji: string; email?: string };
type SavedExclusion = { from: string; to: string; oneWay: boolean };

export type SavedList = {
  id: string;
  name: string;
  people: SavedPerson[];
  exclusions: SavedExclusion[];
};

const listsKey = 'as-lists';

export function toSavedList(group: Group, rawName: string): SavedList {
  const nameOf = new Map(group.participants.map((p) => [p.id, p.name]));
  return {
    id: crypto.randomUUID(),
    name: rawName.trim().slice(0, limits.name),
    people: group.participants.map(({ name, emoji, email }) => ({ name, emoji, email })),
    exclusions: group.exclusions.map(({ from, to, oneWay }) => ({
      from: nameOf.get(from) ?? '',
      to: nameOf.get(to) ?? '',
      oneWay,
    })),
  };
}

export function applyList(group: Group, list: SavedList): Group {
  const participants = list.people.map((person) => ({ ...person, id: crypto.randomUUID() }));
  const idOf = new Map(participants.map((p) => [p.name, p.id]));
  const exclusions = list.exclusions.flatMap(({ from, to, oneWay }) => {
    const fromId = idOf.get(from);
    const toId = idOf.get(to);
    return fromId && toId ? [{ from: fromId, to: toId, oneWay }] : [];
  });
  return { ...group, participants, exclusions };
}

export function upsertList(lists: SavedList[], list: SavedList): SavedList[] {
  const key = list.name.toLowerCase();
  return [...lists.filter((saved) => saved.name.toLowerCase() !== key), list];
}

function isList(value: unknown): value is SavedList {
  const list = value as SavedList | null;
  return (
    typeof list?.id === 'string' &&
    typeof list.name === 'string' &&
    Array.isArray(list.people) &&
    Array.isArray(list.exclusions) &&
    list.people.every(
      (p) =>
        typeof p?.name === 'string' &&
        typeof p.emoji === 'string' &&
        (p.email === undefined || typeof p.email === 'string'),
    ) &&
    list.exclusions.every(
      (e) =>
        typeof e?.from === 'string' && typeof e.to === 'string' && typeof e.oneWay === 'boolean',
    )
  );
}

const isLists = (value: unknown): value is SavedList[] =>
  Array.isArray(value) && value.every(isList);

export const loadLists = () => load(listsKey, isLists, []);

export const saveLists = (lists: SavedList[]) => save(listsKey, lists);
