import { describe, expect, it, vi } from 'vitest';
import { createId } from './id';

describe('createId', () => {
  it('falls back when crypto.randomUUID is unavailable', () => {
    const originalCrypto = globalThis.crypto;
    vi.stubGlobal('crypto', {});

    const id = createId('team');

    expect(id).toMatch(/^team-/);
    expect(id.length).toBeGreaterThan(12);

    vi.stubGlobal('crypto', originalCrypto);
  });
});
