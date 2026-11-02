import { describe, expect, it } from 'vitest';
import { createToken, readToken, ticketUrl, tokenFromHash } from './link';

const ticket = {
  giver: 'Ana María',
  receiver: 'Benjamín 🎅',
  event: { name: 'Navidad', date: '2026-12-24', amount: '$20.000', note: 'En casa' },
};

describe('link', () => {
  it('round-trips a ticket through a token', async () => {
    expect(await readToken(await createToken(ticket))).toEqual(ticket);
  });

  it('never exposes the receiver in the token', async () => {
    const token = await createToken(ticket);
    expect(atob(token.split('.')[0].replaceAll('-', '+').replaceAll('_', '/'))).not.toContain(
      'Benjam',
    );
  });

  it('uses a different key for each token', async () => {
    const [first, second] = [await createToken(ticket), await createToken(ticket)];
    expect(first.split('.')[1]).not.toBe(second.split('.')[1]);
  });

  it('rejects a tampered token', async () => {
    const token = await createToken(ticket);
    const swapped = token[5] === 'A' ? 'B' : 'A';
    expect(await readToken(`${token.slice(0, 5)}${swapped}${token.slice(6)}`)).toBeNull();
  });

  it('rejects garbage', async () => {
    expect(await readToken('nope')).toBeNull();
    expect(await readToken('a.b')).toBeNull();
  });

  it('survives the trip through a url hash', async () => {
    const token = await createToken(ticket);
    const url = new URL(ticketUrl(token, 'https://example.com/amigo-secreto/'));
    expect(tokenFromHash(url.hash)).toBe(token);
  });

  it('ignores unrelated hashes', () => {
    expect(tokenFromHash('')).toBeNull();
    expect(tokenFromHash('#other')).toBeNull();
  });
});
