import { describe, expect, it } from 'vitest';
import { encryptionService } from '../../server/src/services/encryptionService.js';

describe('encryptionService', () => {
  it('encrypts and decrypts data', () => {
    const secret = 'test-secret';
    const enc = encryptionService.encrypt(secret);
    const dec = encryptionService.decrypt(enc);
    expect(dec).toBe(secret);
  });
});
