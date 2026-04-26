import type { DataVersion, RuleSet, UserPreference } from '../../../types';

export const currentRuleSet: RuleSet = {
  id: 'reg-ma',
  name: 'Regulation Set M-A',
  displayName: 'Pokemon Champions Regulation Set M-A',
  startAt: '2026-04-08T02:00:00.000Z',
  endAt: '2026-06-17T01:59:00.000Z',
  battleType: 'doubles',
  allowMega: true,
  megaLimitPerBattle: 1,
  duplicateHeldItemsAllowed: false,
  timers: {
    totalTimeMinutes: 20,
    playerTimeMinutes: 7,
    turnTimeSeconds: 45,
    previewTimeSeconds: 90,
  },
  officialSourceUrl: 'https://news.pokemon-home.com/en/page/751.html',
  dataVersionId: 'dv-reg-ma-seed-0.2.0',
  status: 'current',
};

export const currentDataVersion: DataVersion = {
  id: 'dv-reg-ma-seed-0.2.0',
  ruleSetId: currentRuleSet.id,
  versionName: 'v0.2.0-seed',
  updatedAt: '2026-04-26T16:00:00.000Z',
  sourceSummary: 'Versioned MVP seed data. Official rule metadata is tracked separately from manually reviewed catalog entries.',
  sourceUrls: [currentRuleSet.officialSourceUrl],
  verificationStatus: 'manual-review',
  notes: 'Seed data is structured for validation and UI flow. Do not treat catalog legality or damage output as final battle guidance.',
};

export const defaultPreferences: UserPreference = {
  language: 'zh-CN',
  favoriteBenchmarkIds: ['bench-garchomp-max'],
  defaultBenchmarkFilters: ['preset'],
  cachedRuleSetId: currentRuleSet.id,
  lastDataRefreshAt: currentDataVersion.updatedAt,
};

export const dataSourceManifest = {
  id: currentDataVersion.id,
  ruleSetId: currentRuleSet.id,
  mode: 'versioned-seed',
  officialRuleSource: currentRuleSet.officialSourceUrl,
  reviewPolicy: 'Every catalog row must retain sourceRefs and verificationStatus before being used for strong legality conclusions.',
  blockedMechanisms: ['Champions Stat Points', 'Champions damage formula compatibility', 'complete move learnsets'],
};
