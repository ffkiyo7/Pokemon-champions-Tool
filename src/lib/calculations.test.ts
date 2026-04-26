import { describe, expect, it } from 'vitest';
import { calculateSpeed, calculateSpeedWithMechanismGate } from './calculations';

describe('speed calculation', () => {
  it('keeps the existing Lv.50 speed formula stable for confirmed inputs', () => {
    expect(calculateSpeed(102, 252, 50, '爽朗')).toBe(169);
    expect(calculateSpeed(20, 252, 50, '怕慢(+速)')).toBe(79);
  });

  it('blocks formal speed conclusions while Champions speed mechanisms are pending', () => {
    const result = calculateSpeedWithMechanismGate({
      baseSpeed: 102,
      investment: 252,
      level: 50,
      nature: '爽朗',
      mechanismStatus: 'pending',
    });

    expect(result.status).toBe('blocked');
    expect(result.explanation).toContain('not confirmed');
  });

  it('returns a formal result only when the mechanism is explicitly confirmed', () => {
    const result = calculateSpeedWithMechanismGate({
      baseSpeed: 102,
      investment: 252,
      level: 50,
      nature: '爽朗',
      mechanismStatus: 'confirmed',
    });

    expect(result.status).toBe('confirmed');
    if (result.status === 'confirmed') {
      expect(result.finalSpeed).toBe(169);
    }
  });
});
