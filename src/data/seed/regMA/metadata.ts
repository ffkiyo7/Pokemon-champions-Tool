import type { DataSourceManifest, DataVersion, RuleSet, UserPreference } from '../../../types';

export const officialEligiblePokemonUrl = 'https://web-view.app.pokemonchampions.jp/battle/pages/events/rs177501629259kmzbny/en/pokemon.html';

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
  sourceUrls: [currentRuleSet.officialSourceUrl, officialEligiblePokemonUrl],
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

export const dataSourceManifest: DataSourceManifest = {
  id: currentDataVersion.id,
  ruleSetId: currentRuleSet.id,
  mode: 'versioned-seed',
  sources: [
    {
      id: 'reg-ma-official-rule',
      url: currentRuleSet.officialSourceUrl,
      sourceType: 'official',
      licenseRisk: 'low',
      retrievedAt: '2026-04-26T16:00:00.000Z',
      fieldsUsed: [
        'ruleSet.startAt',
        'ruleSet.endAt',
        'ruleSet.battleType',
        'ruleSet.allowMega',
        'ruleSet.megaLimitPerBattle',
        'ruleSet.duplicateHeldItemsAllowed',
        'ruleSet.timers',
      ],
      notes: 'Official Pokemon HOME Regulation Set M-A announcement used for rule metadata only.',
    },
    {
      id: 'manual-seed-review',
      url: 'local://docs/research/DATA_SOURCE_RESEARCH.md',
      sourceType: 'manual-observation',
      licenseRisk: 'medium',
      retrievedAt: currentDataVersion.updatedAt,
      sourcePath: 'src/data/seed/regMA/catalog.ts',
      fieldsUsed: ['pokemon', 'forms', 'abilities', 'moves', 'items', 'learnsets', 'baseStats'],
      notes: 'Hand-authored MVP seed data for UI validation. Rows with this ref must stay needs-review.',
    },
    {
      id: 'reg-ma-official-eligible-pokemon',
      url: officialEligiblePokemonUrl,
      sourceType: 'official',
      licenseRisk: 'medium',
      retrievedAt: '2026-04-28T15:20:00.000Z',
      sourceVersion: 'row-count-213',
      fieldsUsed: ['eligiblePokemon.championsFormId', 'eligiblePokemon.nationalDexNo', 'eligiblePokemon.englishName'],
      notes: 'Official public web-view Eligible Pokemon page. Local allowlist rows are generated from its public payload and remain manual-review until a second pass verifies row count and normalization.',
    },
  ],
  reviewPolicy: 'Every catalog row must retain sourceRefs and verificationStatus before being used for strong legality conclusions.',
  blockedMechanisms: ['Champions Stat Points', 'Champions damage formula compatibility', 'complete move learnsets'],
};
