import { randomInt, shuffle } from './random';
import type { Rng } from './random';

export type Exclusion = { from: string; to: string; oneWay: boolean };

export type Assignment = Record<string, string>;

export const MIN_PARTICIPANTS = 3;

const RANDOM_ATTEMPTS = 5000;
const SEARCH_STEPS = 500_000;

type Allowed = (giver: string, receiver: string) => boolean;

function allowedBy(exclusions: readonly Exclusion[]): Allowed {
  const blocked = new Set<string>();
  for (const { from, to, oneWay } of exclusions) {
    blocked.add(`${from}>${to}`);
    if (!oneWay) blocked.add(`${to}>${from}`);
  }
  return (giver, receiver) => giver !== receiver && !blocked.has(`${giver}>${receiver}`);
}

function randomPairs(ids: readonly string[], allowed: Allowed, rng: Rng): Assignment | null {
  for (let attempt = 0; attempt < RANDOM_ATTEMPTS; attempt += 1) {
    const receivers = shuffle(ids, rng);
    if (ids.every((id, index) => allowed(id, receivers[index]))) {
      return Object.fromEntries(ids.map((id, index) => [id, receivers[index]]));
    }
  }
  return null;
}

function matchPairs(ids: readonly string[], allowed: Allowed, rng: Rng): Assignment | null {
  const giverOf = new Map<string, string>();
  const place = (giver: string, seen: Set<string>): boolean => {
    for (const receiver of shuffle(ids, rng)) {
      if (!allowed(giver, receiver) || seen.has(receiver)) continue;
      seen.add(receiver);
      const current = giverOf.get(receiver);
      if (current === undefined || place(current, seen)) {
        giverOf.set(receiver, giver);
        return true;
      }
    }
    return false;
  };
  for (const giver of shuffle(ids, rng)) {
    if (!place(giver, new Set())) return null;
  }
  return Object.fromEntries([...giverOf].map(([receiver, giver]) => [giver, receiver]));
}

function toCycle(order: readonly string[]): Assignment {
  return Object.fromEntries(order.map((id, index) => [id, order[(index + 1) % order.length]]));
}

function isCycle(order: readonly string[], allowed: Allowed): boolean {
  return order.every((id, index) => allowed(id, order[(index + 1) % order.length]));
}

function randomCycle(ids: readonly string[], allowed: Allowed, rng: Rng): Assignment | null {
  for (let attempt = 0; attempt < RANDOM_ATTEMPTS; attempt += 1) {
    const order = shuffle(ids, rng);
    if (isCycle(order, allowed)) return toCycle(order);
  }
  return null;
}

function searchCycle(ids: readonly string[], allowed: Allowed, rng: Rng): Assignment | null {
  const [start, ...rest] = shuffle(ids, rng);
  const path = [start];
  const used = new Set(path);
  let steps = 0;
  const extend = (): boolean => {
    steps += 1;
    if (steps > SEARCH_STEPS) return false;
    const last = path[path.length - 1];
    if (path.length === ids.length) return allowed(last, start);
    for (const next of shuffle(rest, rng)) {
      if (used.has(next) || !allowed(last, next)) continue;
      path.push(next);
      used.add(next);
      if (extend()) return true;
      path.pop();
      used.delete(next);
    }
    return false;
  };
  return extend() ? toCycle(path) : null;
}

export function draw(
  ids: readonly string[],
  exclusions: readonly Exclusion[],
  singleCycle: boolean,
  rng: Rng = randomInt,
): Assignment | null {
  if (ids.length < MIN_PARTICIPANTS) return null;
  const allowed = allowedBy(exclusions);
  if (singleCycle) return randomCycle(ids, allowed, rng) ?? searchCycle(ids, allowed, rng);
  return randomPairs(ids, allowed, rng) ?? matchPairs(ids, allowed, rng);
}
