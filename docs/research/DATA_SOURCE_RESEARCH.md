# Pokemon Champions Data Source Research

Last researched: 2026-04-26

This document is a practical source plan for replacing MVP seed data with real, traceable data. It is not legal advice. Treat Pokemon names, character designs, sprites, screenshots, official descriptions, and page layouts as protected IP unless a source grants explicit reuse rights.

## Executive Recommendation

First ingestion should be a small, auditable Reg M-A legality package:

1. Ingest official rule metadata from the Pokemon HOME news page.
2. Manually verify the official Eligible Pokemon page into a local `reg-ma` allowlist.
3. Join that allowlist against Pokemon Showdown and/or PokeAPI identifiers for base stats, types, abilities, move IDs, item IDs, and learnsets.
4. Mark every row `manual-review` until a second reviewer checks source URLs and row counts.
5. Do not ingest or bundle official icons, artwork, screenshots, or official flavor/descriptive prose in the first real-data pass.

This gives the app strong legality boundaries without taking on the highest-risk assets.

## Source Priority By Data Category

| Category | Priority | Recommended sources | Use | Licensing / authorization risk |
| --- | --- | --- | --- | --- |
| Reg M-A legality and rule metadata | P0 | Official Pokemon HOME Reg M-A announcement: https://news.pokemon-home.com/en/page/751.html; official Eligible Pokemon page linked there: https://web-view.app.pokemonchampions.jp/battle/pages/events/rs177501629259kmzbny/en/pokemon.html | Dates, timers, duplicate-item rule, Mega limit/list, eligible species | Low for citation/manual facts; medium/high for automated scraping or redistributing copied page content. The eligible page is official but not obviously a stable public API. |
| Pokemon/move/item/ability base data | P1 | Pokemon Showdown data repo: https://github.com/smogon/pokemon-showdown/tree/master/data and MIT license: https://raw.githubusercontent.com/smogon/pokemon-showdown/master/LICENSE; PokeAPI docs: https://pokeapi.co/docs/v2 and license: https://github.com/PokeAPI/pokeapi/blob/master/LICENSE.md | Structured stats, types, abilities, moves, items, learnsets, mechanical flags | Showdown code/data is MIT; PokeAPI project is BSD-like and asks for local caching. Still medium risk for Pokemon trademarks and any copied official text embedded in datasets. |
| Champions-only Mega forms/mechanics | P0 for existence, P2 for mechanics | Official Reg M-A announcement Mega list; future official Champions docs/news; in-game/HOME observation notes only if manually recorded | Allowed Mega names, Mega limit, required Mega Stone relationship | Medium. Official page confirms existence and legality; exact base stats, move/ability behavior, Stat Points, and damage formulas need official or carefully reviewed evidence before strong conclusions. |
| Chinese names | P1 official, P2 community cross-check | Official China Pokedex: https://www.pokemon.cn/play/pokedex/0001; official Taiwan Pokedex: https://tw.portal-pokemon.com/play/pokedex/0001; Bulbapedia Chinese names list: https://bulbapedia.bulbagarden.net/wiki/List_of_Chinese_Pok%C3%A9mon_names; 52poke list: https://wiki.52poke.com/wiki/%E5%AE%9D%E5%8F%AF%E6%A2%A6%E5%88%97%E8%A1%A8%EF%BC%88%E6%8C%89%E5%85%A8%E5%9B%BD%E5%9B%BE%E9%89%B4%E7%BC%96%E5%8F%B7%EF%BC%89 | zh-CN and zh-TW display names, cross-region name differences | Official sites are safest for factual confirmation but not bulk reuse. Bulbapedia is CC BY-NC-SA 2.5; 52poke is CC BY-NC-SA 3.0. Avoid importing CC BY-NC-SA content into app data unless the app can comply with attribution, noncommercial, and share-alike obligations. |
| Icons/images/artwork | P3 / blocked for v1 | Official Pokedex images; PokeAPI sprites repo: https://github.com/PokeAPI/sprites; Pokemon support IP guidance: https://support.pokemon.com/hc/en-us/articles/360000634094-Can-I-use-Pok%C3%A9mon-images-or-materials-; press asset terms: https://press.pokemon.com/en/Assets-Use-Terms | Visual polish only | High. Even when hosted in accessible repos, Pokemon sprites/artwork depict protected characters. Use text, type chips, generated neutral placeholders, or user-provided local assets until explicit permission/licensing is settled. |
| Descriptions/flavor text | P2 mechanics, P3 flavor | Pokemon Showdown data/text for short mechanical summaries; official CN/TW/EN Pokedex pages only as reference; PokeAPI species flavor text only with caution | Short mechanics summaries for abilities/items/moves; avoid flavor text in v1 | Medium/high. Official prose and game flavor text are copyrightable. Prefer original, terse summaries written by maintainers from mechanics data; do not copy Pokedex entries. |
| Usage/benchmark data | P2 official observation, P3 community | Pokemon HOME Battle Data feature info: https://home.pokemon.com/en-us/features/ and support article: https://support.pokemon.com/hc/en-us/articles/360043472332-What-is-the-Battle-Data-feature-in-Pok%25C3%25A9mon-HOME; Smogon stats index: https://www.smogon.com/stats/; Pikalytics: https://www.pikalytics.com/ | Speed benchmarks, common sets, popularity labels | Official HOME Battle Data is primary but mobile-app access may not permit bulk export. Smogon stats are stable/public for Showdown ladders, but may not match official Champions. Pikalytics is useful for human research but do not scrape or redistribute without permission/terms review. |

## Source Notes

### Official Reg M-A

The Reg M-A announcement confirms the schedule, eligible Pokemon policy, Mega Evolution once-per-battle rule, allowed Mega list, duplicate held item rule, and timers. It should be the canonical source for `RuleSet` metadata and `DataVersion.sourceUrls`.

The official Eligible Pokemon page is the only primary source located for the full legal species list. It is linked from the announcement, but it appears to be a rendered web-view rather than a documented API. If automated extraction is used, record the exact URL, retrieval timestamp, row count, and a stored normalized hash. If extraction requires bypassing app controls, authentication, private endpoints, or reverse engineering, do not use it.

### Pokemon Showdown

Pokemon Showdown is the best structured source for battle-mechanics-oriented base data because it is maintained for a simulator and published under MIT. Use it for IDs, types, base stats, move metadata, ability metadata, item metadata, and learnsets where Champions follows mainline mechanics.

Do not assume Pokemon Showdown already supports Pokemon Champions or Reg M-A. Any Champions-only form, Stat Points behavior, Mega behavior, or damage calculation should remain `manual-review` or `needs-review` until verified against official sources or direct in-game testing.

### PokeAPI

PokeAPI is useful as a second structured source and as a stable identifier/reference layer. Its docs say no authentication is required and ask clients to cache resources locally. Use it to cross-check names, IDs, types, sprites references, and species relations.

Do not depend on live PokeAPI calls in the PWA runtime for core legality checks. Ingest into versioned local data and cite the API endpoint/version used.

### Chinese Names

For zh-CN, prefer the official China Pokedex pages. For zh-TW, prefer the official Taiwan Pokedex pages. Bulbapedia and 52poke are valuable cross-checks because they track historical and regional naming differences, but their noncommercial/share-alike terms are a meaningful product risk.

Recommended v1 policy:

- Store `chineseNameCn`, `chineseNameTw`, and `englishName` separately when possible.
- If only one Chinese display field exists, use zh-CN for the current app default and preserve a `nameLocale` note in provenance.
- Do not copy community wiki name tables wholesale into the app unless licensing compliance is explicitly accepted.

### Images And Icons

Do not bundle Pokemon artwork, official sprites, HOME icons, Pokedex images, or screenshots in the first real-data release. The Pokemon support page says they are not positioned to review requests to use Pokemon IP, and press assets are limited to revocable, noncommercial use. PokeAPI sprites are easy to access but still high risk because the underlying character artwork is protected.

Safer v1 alternatives:

- Type-color chips and numeric dex badges.
- Neutral generated silhouettes that do not resemble specific Pokemon.
- Optional user-side external image URL fields disabled by default.

### Descriptions

Use original, concise mechanical summaries instead of copied official text. For example, an ability summary should describe calculation impact in maintainers' words and point to a source reference. Avoid Pokedex flavor text and long item/move descriptions unless a license path is approved.

### Usage And Benchmarks

For speed benchmarks, separate "mechanical benchmark" from "metagame popularity":

- Mechanical: derived from verified base stats, level, nature, investment, items/statuses, and the app's own speed formula. This can be ingested first once Champions Stat Points are confirmed.
- Metagame popularity: derived from HOME Battle Data, tournament reports, Smogon ladder stats, Pikalytics, or manual analyst notes. These should never drive strong legality conclusions.

Until Pokemon Champions official usage exports are documented, treat HOME/Pikalytics/Game8 usage as research-only. If a maintainer manually records a top list, mark it `manual-review`, include the observation date, season/regulation, and reviewer initials, and avoid copying third-party tables wholesale.

## Provenance Model

Current types have `sourceRefs: string[]` on catalog rows and `verificationStatus` on `DataVersion`. Keep that, but make each `sourceRefs` entry resolve to a manifest record rather than a vague token.

Recommended source ref format:

```ts
type SourceRef = {
  id: string;
  url: string;
  sourceType: 'official' | 'community' | 'derived' | 'manual-observation';
  licenseRisk: 'low' | 'medium' | 'high' | 'blocked';
  retrievedAt: string;
  sourceVersion?: string;
  sourcePath?: string;
  fieldsUsed: string[];
  notes?: string;
};
```

Recommended row-level verification fields:

```ts
type RowVerification = {
  status: 'official' | 'community-verified' | 'manual-review' | 'mock' | 'blocked';
  reviewedBy?: string;
  reviewedAt?: string;
  verificationNotes?: string;
};
```

If schema changes are deferred, encode stable IDs in existing `sourceRefs`, for example:

- `official-reg-ma-news-2026-04-26`
- `official-reg-ma-eligible-pokemon-2026-04-26`
- `showdown-data-pokedex-commit-<sha>`
- `showdown-data-learnsets-commit-<sha>`
- `pokeapi-pokemon-<id>-2026-04-26`
- `official-pokedex-cn-<nationalDexNo>-2026-04-26`
- `manual-review-<reviewer>-<date>`

## Verification Status Rules

Use strong statuses only when the actual field is verified, not merely when the row has at least one trusted source.

- `official`: Field is directly stated by an official Pokemon source and the source is cited. Good for Reg M-A dates, timers, duplicate item rule, Mega list, and official names.
- `community-verified`: Field is sourced from a permissively licensed stable community dataset and cross-checked by another source or reviewer. Good for base stats/types/learnsets after review.
- `manual-review`: Field was entered or transformed by a maintainer and needs review, or the source is reliable but licensing/automation is unresolved.
- `mock`: UI/demo data only; must not produce strong legality or calculation conclusions.
- `blocked`: Source exists but should not be ingested because license, authorization, or access method is unacceptable.

## Ingestion Checklist

For each ingestion batch:

1. Define a `DataVersion` with source summary, source URLs, retrieval date, source hashes, and review notes.
2. Ingest only one category at a time: rule metadata, eligible Pokemon, base catalog, names, mechanics, benchmarks.
3. Require every row to have nonempty `sourceRefs`.
4. Require every imported file to keep raw-source commit SHA, URL, or retrieval timestamp in a manifest.
5. Run existing seed data audit and add checks for blocked/high-risk refs before a row can become `legal`.
6. Keep source-derived official prose and images out of exported team data.

## First Real-Data Ingestion Scope

Recommended first batch:

- `RuleSet`: official Reg M-A metadata from the announcement.
- `DataVersion`: `dv-reg-ma-official-legality-0.1.0`.
- Pokemon allowlist: official Eligible Pokemon, manually verified row count.
- Mega allowlist: official Reg M-A Mega list.
- Base joins: Showdown/PokeAPI IDs, base stats, types, abilities, and learnsets for allowlisted Pokemon only.

Do not include:

- Official sprites/artwork/icons.
- Pokedex flavor text.
- HOME/Pikalytics usage percentages.
- Strong damage conclusions.
- Champions Stat Points conclusions until mechanics are confirmed.
