import type { EventInfo } from './group';
import { decode, encode, importKey } from './link';
import type { Ticket } from './link';
import { shuffle } from './random';

export type GroupPayload = { event: EventInfo; salt: string; sealed: string[] };

type Entry = { email: string; giver: string; receiver: string };

const IV_BYTES = 12;
const SALT_BYTES = 16;

export function normalizeEmail(raw: string): string {
  const [user, domain] = raw.trim().toLowerCase().split('@');
  if (domain !== 'gmail.com' && domain !== 'googlemail.com') return raw.trim().toLowerCase();
  return `${user.split('+')[0].replaceAll('.', '')}@gmail.com`;
}

export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

async function keyFor(salt: string, email: string) {
  const text = new TextEncoder().encode(`${salt}:${normalizeEmail(email)}`);
  return importKey(new Uint8Array(await crypto.subtle.digest('SHA-256', text)));
}

async function seal(entry: Entry, salt: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const plain = new TextEncoder().encode(JSON.stringify([entry.giver, entry.receiver]));
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    await keyFor(salt, entry.email),
    plain,
  );
  const sealed = new Uint8Array(IV_BYTES + cipher.byteLength);
  sealed.set(iv);
  sealed.set(new Uint8Array(cipher), IV_BYTES);
  return encode(sealed);
}

export async function createGroupToken(event: EventInfo, entries: Entry[]): Promise<string> {
  const salt = encode(crypto.getRandomValues(new Uint8Array(SALT_BYTES)));
  const sealed = await Promise.all(shuffle(entries).map((entry) => seal(entry, salt)));
  const payload: GroupPayload = { event, salt, sealed };
  return encode(new TextEncoder().encode(JSON.stringify(payload)));
}

function isPayload(value: unknown): value is GroupPayload {
  const payload = value as GroupPayload | null;
  return (
    typeof payload?.salt === 'string' &&
    Array.isArray(payload.sealed) &&
    payload.sealed.every((item) => typeof item === 'string') &&
    typeof payload.event?.name === 'string' &&
    typeof payload.event.date === 'string' &&
    typeof payload.event.amount === 'string' &&
    typeof payload.event.note === 'string'
  );
}

export function readGroupToken(token: string): GroupPayload | null {
  try {
    const value: unknown = JSON.parse(new TextDecoder().decode(decode(token)));
    return isPayload(value) ? value : null;
  } catch {
    return null;
  }
}

async function open(item: string, key: CryptoKey): Promise<[string, string] | null> {
  try {
    const bytes = decode(item);
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: bytes.slice(0, IV_BYTES) },
      key,
      bytes.slice(IV_BYTES),
    );
    return JSON.parse(new TextDecoder().decode(plain)) as [string, string];
  } catch {
    return null;
  }
}

export async function openEntry(payload: GroupPayload, email: string): Promise<Ticket | null> {
  const key = await keyFor(payload.salt, email);
  for (const item of payload.sealed) {
    const pair = await open(item, key);
    if (pair) return { giver: pair[0], receiver: pair[1], event: payload.event };
  }
  return null;
}

export function groupTokenFromHash(hash: string): string | null {
  return /^#g=([\w-]+)$/.exec(hash)?.[1] ?? null;
}

export function groupUrl(token: string, base: string): string {
  return `${base}#g=${token}`;
}
