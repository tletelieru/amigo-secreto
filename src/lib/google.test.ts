import { describe, expect, it } from 'vitest';
import { emailFromCredential } from './google';

const credential = (claims: object) =>
  `header.${btoa(JSON.stringify(claims)).replaceAll('+', '-').replaceAll('/', '_')}.signature`;

describe('emailFromCredential', () => {
  it('reads a verified email', () => {
    expect(emailFromCredential(credential({ email: 'a@gmail.com', email_verified: true }))).toBe(
      'a@gmail.com',
    );
  });

  it('rejects an unverified email', () => {
    expect(
      emailFromCredential(credential({ email: 'a@gmail.com', email_verified: false })),
    ).toBeNull();
  });

  it('rejects garbage', () => {
    expect(emailFromCredential('nope')).toBeNull();
  });
});
