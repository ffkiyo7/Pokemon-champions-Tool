import { describe, expect, it } from 'vitest';
import { calculateBattleStats, calculateSpeed, calculateSpeedWithMechanismGate } from './calculations';

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

  it('derives displayed battle stats from base stats, stat points, level, and nature', () => {
    const stats = calculateBattleStats(
      { hp: 108, attack: 130, defense: 95, specialAttack: 80, specialDefense: 85, speed: 102 },
      { hp: 252, attack: 252, speed: 252 },
      50,
      '爽朗',
    );

    expect(stats.hp).toBe(215);
    expect(stats.attack).toBe(182);
    expect(stats.specialAttack).toBe(90);
    expect(stats.speed).toBe(169);
  });
});
