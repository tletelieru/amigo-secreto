import { describe, expect, it } from 'vitest';
import {
  createGroupToken,
  groupTokenFromHash,
  groupUrl,
  isEmail,
  normalizeEmail,
  openEntry,
  readGroupToken,
} from './groupLink';

const event = { name: 'Navidad', date: '2026-12-24', amount: '$20.000', note: '' };
const entries = [
  { email: 'ana.maria@gmail.com', giver: 'Ana María', receiver: 'Ben' },
  { email: 'ben@empresa.cl', giver: 'Ben', receiver: 'Ana María' },
];

describe('groupLink', () => {
  it('opens only the entry of the signed-in email', async () => {
    const payload = readGroupToken(await createGroupToken(event, entries))!;
    expect(await openEntry(payload, 'ben@empresa.cl')).toEqual({
      giver: 'Ben',
      receiver: 'Ana María',
      event,
    });
    expect(await openEntry(payload, 'otra@gmail.com')).toBeNull();
  });

  it('matches Gmail addresses the way Google does', async () => {
    const payload = readGroupToken(await createGroupToken(event, entries))!;
    expect((await openEntry(payload, 'AnaMaria+x@googlemail.com'))?.giver).toBe('Ana María');
    expect(normalizeEmail(' A.b+c@Gmail.com ')).toBe('ab@gmail.com');
    expect(normalizeEmail('a.b+c@empresa.cl')).toBe('a.b+c@empresa.cl');
  });

  it('keeps emails and names out of the link', async () => {
    const token = await createGroupToken(event, entries);
    const text = new TextDecoder().decode(
      Uint8Array.from(atob(token.replaceAll('-', '+').replaceAll('_', '/')), (c) =>
        c.charCodeAt(0),
      ),
    );
    expect(text).not.toContain('ana.maria');
    expect(text).not.toContain('Ben');
  });

  it('survives the trip through a url hash', async () => {
    const token = await createGroupToken(event, entries);
    const url = new URL(groupUrl(token, 'https://example.com/amigo-secreto/'));
    expect(groupTokenFromHash(url.hash)).toBe(token);
  });

  it('rejects garbage', () => {
    expect(readGroupToken('nope')).toBeNull();
    expect(groupTokenFromHash('#r=a.b')).toBeNull();
  });

  it('validates emails', () => {
    expect(isEmail(' ana@gmail.com ')).toBe(true);
    expect(isEmail('ana@gmail')).toBe(false);
    expect(isEmail('')).toBe(false);
  });
});
