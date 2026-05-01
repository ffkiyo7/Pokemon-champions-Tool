# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install              # Install dependencies
npm run dev              # Dev server on 127.0.0.1
npm run build            # TypeScript check + Vite production build
npm run preview          # Preview production build on 127.0.0.1:4173
npm test                 # Run Vitest unit tests (excludes tests/pwa, dist, node_modules)
npm run test:pwa         # Run Playwright PWA tests (offline + visual) against production preview
npm run test:visual      # Run visual regression tests only
npm run data:regma:allowlist  # Generate Reg M-A allowlist from official eligible Pokémon page
npm run data:regma:abilities  # Refresh ability zh-Hans names/effects from source data
```

Playwright uses `npm run build && npm run preview -- --port 4173` as its web server. The PWA visual spec produces snapshot images in `tests/pwa/visual.spec.ts-snapshots/`.

## Architecture

**Mobile-first PWA** for Pokémon Champions Regulation Set M-A. React 19 + Vite 7 + TypeScript + Tailwind CSS 3. IndexedDB for persistence (via `src/lib/db.ts`). Single-page app with 5 bottom tabs, overlays for rule details, and a service worker (`public/sw.js`) for offline support.

**App root** → `src/main.tsx` mounts `<App>` from `App.tsx`. The `<App>` wraps everything in `<AppProvider>` (React Context) which provides global state: teams, preferences, CRUD operations, and data refresh.

**Routing** — No router library. `AppShell` in `App.tsx` switches on `activeTab` (`'teams' | 'calculator' | 'speed' | 'dex' | 'settings'`) and an `overlay` state for the rule page. Cross-tab navigation passes IDs (e.g., open a Pokémon in Speed from Dex).

### Data layer

All seed data lives in `src/data/seed/regMA/` and re-exports through `src/data/index.ts`:

- `metadata.ts` — RuleSet, DataVersion, DataSourceManifest, default preferences
- `allowlist.ts` — Eligible Pokémon allowlist (~80KB, the largest seed file)
- `megaAllowlist.ts` — Mega Evolution allowlist
- `catalog.ts` + `catalog-batch-00*.ts` — Pokemon, Forms, Moves, Items, Abilities, Natures catalog data
- `currentRuleCatalog.ts` — Selectable item/move/nature allowlists, Nature option labels
- `benchmarks.ts` — Preset speed benchmarks
- `defaultTeams.ts` — Pre-seeded example teams

The data version is `v0.2.0-seed` — **mock/manual-review data**. All damage calculations and legality conclusions are UI-validation only, not battle-authoritative.

**IndexedDB** (`src/lib/db.ts`) — Two object stores: `teams` (keyPath `id`) and `meta` (keyPath `key`). Version 2 adds EV→Stat Point migration. On first load, seeds default teams and preferences.

### State management

`src/state/AppContext.tsx` — Single React Context (`AppProvider` + `useAppStore` hook). Exposes: `teams`, `preferences`, `loading`, `lastRefreshError`, plus async operations (`saveTeam`, `deleteTeam`, `addTeam`, `updateMember`, `toggleFavoriteBenchmark`, `replaceTeams`, `clearLocalData`, `simulateRefresh`). Teams are capped at 6 members. State is persisted to IndexedDB on every mutation.

### Key lib modules

- `src/lib/calculations.ts` — Damage calc logic (attacker/defender/move context, stat stages, spread damage, weather/terrain modifiers). Marked as "pending Champions formula."
- `src/lib/legality.ts` — Member legality checking against current rule set (moves, items, abilities, mega stones, nature).
- `src/lib/currentRuleCatalog.ts` — Filter helpers for current-rule-selectable items, moves, and natures.
- `src/lib/dataAudit.ts` — Data integrity checks across the catalog.
- `src/lib/pokemonForms.ts` — Form lookup utilities (mega forms, standard forms).
- `src/lib/teamSchema.ts` — Team import/export validation with JSON schema.
- `src/lib/exportImport.ts` — Team JSON import/export utilities.
- `src/lib/statPoints.ts` — Stat point helpers and EV→Stat Point migration.
- `src/lib/id.ts` — NanoID-based ID generation.

### Pages

Each tab is a page component in `src/pages/`:
- `TeamPage.tsx` (~29KB) — Team CRUD, member management, legality badges, cross-tab navigation
- `CalculatorPage.tsx` (~18KB) — Damage calculation form with battle context (weather, terrain, stat stages, mega state)
- `SpeedPage.tsx` (~15KB) — Speed tier visualization, benchmarks, team member speed comparison
- `DexPage.tsx` (~20KB) — Pokémon/Move/Item/Ability browser with search, filter, detail sheets
- `RulePage.tsx` — Current rule set details (timers, battle type, mega rules, data sources)
- `SettingsPage.tsx` — Data version display, refresh, cache clearing, import/export

### Shared components (`src/components/`)

- `BottomNav.tsx` / `Header.tsx` — Navigation chrome
- `ui.tsx` — Design system primitives: `Card`, `Button`, `IconButton`, `Chip`, `Badge`, `TypeBadge`, `PokemonAvatar`, `EmptyState`
- `RuleSummary.tsx` — Inline rule info display

### Types

All shared types are in `src/types.ts` — RuleSet, DataVersion, Pokemon, PokemonForm, Move, Item, Ability, Team, TeamMember, DamageCalcContext, SpeedBenchmark, UserPreference, AppState, etc. Types are used across the entire app.

### Testing

- **Vitest** for unit tests: `*.test.ts` / `*.test.tsx` files co-located with source. Uses `jsdom` environment, `fake-indexeddb` for IndexedDB mocking, `@testing-library/react` for component tests.
- **Playwright** for PWA integration tests: `tests/pwa/` — offline spec and visual regression spec. Visual tests use `Pixel 5` viewport (390×844) as Chrome mobile.
