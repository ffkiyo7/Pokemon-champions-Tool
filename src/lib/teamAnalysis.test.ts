import { describe, expect, it } from 'vitest';
import { defaultTeams } from '../data';
import { buildTeamAnalysisDetails } from './calculations';

describe('team analysis details', () => {
  it('returns summary chips and explainable analysis sections', () => {
    const analysis = buildTeamAnalysisDetails(defaultTeams[0]);

    expect(analysis.chips.length).toBeGreaterThan(0);
    expect(analysis.sections.map((section) => section.title)).toEqual([
      '属性弱点',
      '抗性 / 免疫',
      '攻防倾向',
      '速度覆盖',
      '功能位 / 重复定位',
    ]);
  });

  it('surfaces speed coverage using configured team member speeds', () => {
    const analysis = buildTeamAnalysisDetails(defaultTeams[0]);
    const speedSection = analysis.sections.find((section) => section.title === '速度覆盖');

    expect(speedSection?.items.some((item) => item.includes('最终速度'))).toBe(true);
  });

  it('keeps function-slot analysis explicit about duplicate items', () => {
    const analysis = buildTeamAnalysisDetails({
      ...defaultTeams[0],
      members: defaultTeams[0].members.map((member) => ({ ...member, itemId: 'clear-amulet' })),
    });
    const functionSection = analysis.sections.find((section) => section.title === '功能位 / 重复定位');

    expect(functionSection?.status).toBe('warning');
    expect(functionSection?.items.some((item) => item.includes('重复道具'))).toBe(true);
  });
});
