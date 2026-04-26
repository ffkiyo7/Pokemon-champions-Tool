# @smogon/calc Compatibility Spike

Date: 2026-04-26

Scope: Evaluate whether `@smogon/calc` can satisfy the Pokemon Champions PRD damage-calculation needs without changing package setup. The project currently does not depend on `@smogon/calc`.

## Sources

- npm package: https://www.npmjs.com/package/@smogon/calc
- npm metadata inspected locally with `npm view @smogon/calc version time dist-tags repository homepage license --json`
- Published tarball inspected locally with `npm pack @smogon/calc@0.11.0`
- Repository: https://github.com/smogon/damage-calc
- Published `0.11.0` source files inspected from tarball: `src/index.ts`, `src/field.ts`, `src/pokemon.ts`, `src/move.ts`, `src/mechanics/gen789.ts`, `src/data/interface.ts`, `src/data/items.ts`
- Upstream `master` Champions mechanics file: https://raw.githubusercontent.com/smogon/damage-calc/master/calc/src/mechanics/champions.ts
- PRD official rule source for Regulation Set M-A: https://news.pokemon-home.com/en/page/751.html

## Package Status

- npm latest is `@smogon/calc@0.11.0`, published 2026-03-11.
- The package exports `calculate`, `Pokemon`, `Move`, `Field`, `Side`, `Generations`, data constants, and stat helpers from `dist/index.js`.
- The published tarball contains generation mechanics for Gen 1-9, but no published `src/mechanics/champions.ts` or `dist/mechanics/champions.js`.
- The upstream GitHub `master` branch currently contains `calc/src/mechanics/champions.ts`, but this appears unreleased in npm `0.11.0`. Treat it as promising upstream work, not a stable dependency target.

## PRD Capability Matrix

| PRD need | Published `@smogon/calc@0.11.0` | Recommendation |
| --- | --- | --- |
| Doubles | Supports `new Field({ gameType: 'Doubles' })`; type is `GameType = 'Singles' \| 'Doubles'`. | Direct use via adapter mapping PRD `battleType` to calc `gameType`. |
| Spread damage | Gen 7-9 mechanics compute spread when `field.gameType !== 'Singles'` and `move.target` is `allAdjacent` or `allAdjacentFoes`. Move data carries target metadata. | Direct use for standard spread moves; adapter should expose an explicit spread toggle only by selecting/overriding target safely. |
| Weather | `Field` has `weather`; supported values include `Sand`, `Sun`, `Rain`, `Hail`, `Snow`, `Harsh Sunshine`, `Heavy Rain`, `Strong Winds`. Mechanics handle Weather Ball, weather suppression, and weather-based damage modifiers. | Direct use for canonical weather values. |
| Terrain | `Field` has `terrain`; supported values include `Electric`, `Grassy`, `Psychic`, `Misty`. Mechanics handle terrain interactions such as Terrain Pulse, Psychic Terrain priority blocking, Grassy Terrain, and terrain seeds. | Direct use for canonical terrain values. |
| Stat stages | `Pokemon` accepts `boosts` for `atk`, `def`, `spa`, `spd`, `spe`; mechanics clamp and compute final stats. | Direct use. Adapter should translate UI stat stages to calc `boosts`. |
| Mega/form handling | Species data has `otherFormes`; item data exports `MEGA_STONES`; `Pokemon.getForme(gen, speciesName, item, moveName)` maps many Mega Stones and special forms. | Adapter required. Use calc form names internally, but keep Champions legality/versioning outside calc. |
| Items | `Pokemon` accepts `item`; item effects are implemented for many mainline mechanics. `Field` also supports Magic Room item suppression. | Direct use for known mainline items; adapter/validation for Champions item legality and any Champions-only item behavior. |
| Abilities | `Pokemon` accepts `ability`; Gen 7-9 mechanics implement many ability effects and field/side abilities. | Direct use for known mainline abilities; adapter/validation for Champions-specific abilities. |
| KO text/damage range | `Result` and desc helpers provide damage arrays and descriptions; common damage calculators use this for ranges and KO chance text. | Direct use after output-normalization adapter. |
| Champions-specific mechanics | Not in published npm `0.11.0`. Upstream `master` has an unreleased `calculateChampions` implementation with Champions-specific names such as `Piercing Drill`, `Mega Sol`, and `Dragonize`. | Block formal production use until released or vendored/forked with verification. |
| Champions Stat Points | Published package computes stats from mainline IV/EV/Nature inputs. PRD marks Stat Points as unconfirmed. | Block formal outputs unless adapter has a verified Stat Points to calc-stat mapping. |
| Champions legality | `@smogon/calc` is a damage engine, not a Regulation Set M-A legality authority. | Keep legality in project data/version layer. Do not rely on calc for legal Pokemon/moves/items. |

## Adapter Shape

Use `@smogon/calc` behind a small project-owned adapter, not directly in React pages:

1. Resolve PRD data IDs to calc names: species/form, move, ability, item, nature.
2. Gate unsupported or unverified Champions mechanics before calculation.
3. Convert Stat Points to EV/IV/Nature only after the mechanics are verified.
4. Build calc objects:
   - `new Pokemon(9, speciesOrFormName, { level, ability, item, nature, evs, ivs, boosts })`
   - `new Move(9, moveName, { isCrit, hits, overrides })`
   - `new Field({ gameType: 'Doubles', weather, terrain, attackerSide, defenderSide })`
5. Normalize result output into PRD `DamageCalcContext` output: damage range, percent range, one-hit/two-hit/roll text, data version, and assumptions.
6. Keep Regulation Set M-A legality, Mega limit, duplicate item rules, and source tracing outside the calc engine.

## Spike Command

Package setup should remain unchanged for now. To run the probe locally without committing dependency metadata:

```bash
npm install --no-save @smogon/calc@0.11.0
node scripts/calc-spike.mjs
```

Expected probe coverage:

- Standard single-target damage.
- Doubles spread move via `Field({ gameType: 'Doubles' })`.
- Weather and terrain field options.
- Stat-stage boosts.
- Mega form resolution through `Pokemon.getForme`.
- Package absence of published Champions mechanics.

## Recommendation

Use `@smogon/calc` as the core mainline damage engine through an adapter, but do not label Champions damage output as formal until Champions-only mechanics are verified.

- Direct-use: doubles, spread damage, weather, terrain, mainline stat stages, many items, many abilities, standard damage ranges.
- Adapter-required: PRD data IDs to calc names, form/Mega resolution, result formatting, legality/version gates, Stat Points mapping, explicit blocked-state UX.
- Blocked for formal Champions output: any Champions-specific mechanic not present in published npm `0.11.0`, including confirmed Stat Points behavior and any Champions-only abilities/items/move effects. Upstream `calculateChampions` is worth tracking, but relying on unreleased `master` would be too brittle for v1.

