import type { EventInfo } from './group';

export type Ticket = { giver: string; receiver: string; event: EventInfo };

const IV_BYTES = 12;
const KEY_BYTES = 32;

export function encode(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');
}

export function decode(text: string): Uint8Array<ArrayBuffer> {
  const binary = atob(text.replaceAll('-', '+').replaceAll('_', '/'));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export const importKey = (raw: Uint8Array<ArrayBuffer>) =>
  crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);

export async function createToken(ticket: Ticket): Promise<string> {
  const raw = crypto.getRandomValues(new Uint8Array(KEY_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const plain = new TextEncoder().encode(JSON.stringify(ticket));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await importKey(raw), plain);
  const sealed = new Uint8Array(IV_BYTES + cipher.byteLength);
  sealed.set(iv);
  sealed.set(new Uint8Array(cipher), IV_BYTES);
  return `${encode(sealed)}.${encode(raw)}`;
}

function isTicket(value: unknown): value is Ticket {
  const ticket = value as Ticket | null;
  return (
    typeof ticket?.giver === 'string' &&
    typeof ticket.receiver === 'string' &&
    typeof ticket.event?.name === 'string' &&
    typeof ticket.event.date === 'string' &&
    typeof ticket.event.amount === 'string' &&
    typeof ticket.event.note === 'string'
  );
}

export async function readToken(token: string): Promise<Ticket | null> {
  try {
    const [sealedText, rawText] = token.split('.');
    const sealed = decode(sealedText);
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: sealed.slice(0, IV_BYTES) },
      await importKey(decode(rawText)),
      sealed.slice(IV_BYTES),
    );
    const value: unknown = JSON.parse(new TextDecoder().decode(plain));
    return isTicket(value) ? value : null;
  } catch {
    return null;
  }
}

export function tokenFromHash(hash: string): string | null {
  return /^#r=([\w-]+\.[\w-]+)$/.exec(hash)?.[1] ?? null;
}

export function ticketUrl(token: string, base: string): string {
  return `${base}#r=${token}`;
}
