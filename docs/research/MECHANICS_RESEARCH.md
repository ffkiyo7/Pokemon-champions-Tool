# Pokemon Champions Mechanics Research

Research date: 2026-04-26

Scope: mechanics needed by the current PRD for team legality, speed-line calculation, and damage-calculation readiness. Official sources are preferred. Community sources are used only to identify likely behavior and must not be treated as authoritative unless later verified against the game client, official documentation, or a first-party API.

## Sources

- Official Regulation Set M-A news: https://champions-news.pokemon-home.com/en/page/751.html
- Official Pokemon Champions site, gameplay page: https://champions.pokemon.com/en-us/gameplay/
- Official Pokemon Champions site, Pokemon / roster page: https://champions.pokemon.com/en-us/pokemon/
- Official Pokemon Champions home page: https://champions.pokemon.com/en-us/
- Community reference, Bulbapedia Stat point: https://bulbapedia.bulbagarden.net/wiki/Stat_point
- Community reference, VGC.tools stats guide: https://vgc.tools/guides/stats
- Community reference, Game8 Stat Alignment guide: https://game8.co/games/Pokemon-Champions/archives/538687

## Officially Confirmed

### Regulation Set M-A schedule

Confirmed from the official Regulation Set M-A page:

- Start: 2026-04-08 02:00 UTC.
- End: 2026-06-17 01:59 UTC.
- Eligibility is regulation-scoped: only Pokemon displayed in the official Eligible Pokemon page are eligible.

Product impact:

- The rule-set card can display these dates as confirmed.
- Eligible Pokemon should be sourced from the official Eligible Pokemon page, not inferred from species availability.

### Mega Evolution rules

Confirmed from the official Regulation Set M-A page and official gameplay page:

- Mega Evolution is allowed in the first Ranked Battle ruleset.
- Certain Pokemon can Mega Evolve if they are holding a Mega Stone.
- Mega Evolution can be used only one time per battle.
- Regulation Set M-A publishes an explicit list of allowed Mega Evolutions.
- The official gameplay page states the Omni Ring is necessary for Mega Evolution, similar to Mega Rings in prior Pokemon games.

Product impact:

- `allowMega = true` is confirmed for Regulation Set M-A.
- `megaLimitPerBattle = 1` is confirmed.
- A Pokemon should not be treated as Mega-legal unless its Mega form appears in the official Regulation Set M-A Mega list and its required Mega Stone relationship is known.
- The app can validate "at most one intended Mega Evolution per battle/team plan" as a rule hint, but exact in-battle activation timing and edge cases should remain outside v1 unless directly tested.

### Duplicate held item rule

Confirmed from the official Regulation Set M-A page:

- Duplicate held items are not allowed.

Product impact:

- `duplicateHeldItemsAllowed = false` is confirmed.
- Team builder legality can give a strong error when two team members have the same held item.
- Unheld/empty item slots should not be counted as duplicate held items.

### Timers

Confirmed from the official Regulation Set M-A page:

- Total Time: 20 minutes.
- Player Time: 7 minutes.
- Turn Time: 45 seconds.
- Preview Time: 90 seconds.

Product impact:

- The rule-set detail page can display these timer values as confirmed.
- Timer values should remain regulation-versioned data because future regulations may change them.

## Partially Confirmed

### Stat Points vs EV / IV / Nature

Officially confirmed:

- The official Pokemon / roster page states Pokemon can be trained in Pokemon Champions by using VP, including Attack, Defense, and other stats.
- The official home page includes a training-menu image described as categories for stat points, stat alignment, moves, and Ability.
- The official Pokemon / roster page states training performed in Pokemon Champions does not carry over to Pokemon HOME, but saved Champions training is retained if the same visiting Pokemon returns, unless it returns in a different form.

Not officially confirmed in accessible docs:

- Exact Stat Point caps per stat and per Pokemon.
- Exact conversion from legacy EVs to Champions Stat Points.
- Whether IVs are removed, fixed to 31, ignored, or otherwise normalized.
- Whether Stat Alignment is exactly Nature under a new name, including exact 1.1 / 0.9 multipliers and rounding order.
- Whether the in-game stat formula is exactly equivalent to main-series Lv.50 stats with IV fixed to 31 and EVs represented as direct Stat Points.

Community-reported behavior, not authoritative:

- Bulbapedia reports Stat Points replace EVs, with 32 points per stat and 66 total.
- Bulbapedia reports HOME transfer EVs convert to Stat Points using Lv.50-style breakpoints: 4 EVs for the first point in a stat, then 8 EVs per additional point.
- VGC.tools reports IV is always 31 in Pokemon Champions and provides a main-series-style formula using Stat Points.
- Game8 reports Stat Alignments replace Natures functionally, increasing one stat and decreasing another.

Product impact:

- Store Stat Points as a flexible, versioned configuration object, not as final EVs.
- UI may expose Stat Points and Stat Alignment fields because official UI references them, but validation should use `mechanismPending` until caps and formula are confirmed.
- Do not claim official EV/IV/Nature equivalence in product copy.
- Do not export Stat Points as Showdown EVs without an explicit "approximate / unverified" conversion mode.

### Lv.50 speed formula assumptions

Officially confirmed:

- No accessible official source found in this pass states the exact Speed formula, fixed level, IV treatment, Stat Point cap, Stat Alignment multiplier, or rounding order.

Reasonable but unconfirmed working assumption from community sources:

- Treat Champions battle stats as Lv.50-style stats.
- Treat Speed as a non-HP stat with a main-series-like formula:

```text
Speed = floor((floor((2 * BaseSpeed + IV + StatPoints) * Level / 100) + 5) * Alignment)
```

- Community sources currently assume `Level = 50`, `IV = 31`, `StatPoints = 0..32`, and `Alignment = 0.9 / 1.0 / 1.1`.

Product impact:

- This formula should remain blocked for official speed-line conclusions.
- It is acceptable for internal prototypes or clearly labeled sample calculations if every result is marked "unverified Champions formula".
- v1 speed-line UI may support base Speed, Mega form base Speed, Tailwind, stat-stage multipliers, and item/status toggles only as confirmed/known Pokemon battle concepts, but final numeric Champions speed should not be labeled authoritative until formula and rounding are verified.

## Confirmed vs Blocked Mechanism Matrix

| Mechanism | Status | Reason | Product handling |
| --- | --- | --- | --- |
| Regulation Set M-A dates | Confirmed | Official Regulation Set M-A page gives exact start/end UTC times. | Display as confirmed rule-set metadata. |
| Eligible Pokemon source | Confirmed source, data extraction pending | Official page points to Eligible Pokemon page. | Use official list; block inferred legality. |
| Mega allowed | Confirmed | Official Regulation Set M-A and gameplay pages. | Enable Mega fields for M-A. |
| Mega once per battle | Confirmed | Official Regulation Set M-A page. | Strong rule metadata: one Mega Evolution per battle. |
| Allowed Mega forms | Confirmed list source | Official Regulation Set M-A page lists allowed Mega Evolutions. | Use official list as source of truth. |
| Mega Stone requirement | Confirmed at high level | Official page says certain Pokemon can Mega Evolve if holding a Mega Stone. | Require known Mega Stone relationship; block unknown mappings. |
| Duplicate held items | Confirmed | Official Regulation Set M-A page. | Strong team-builder validation. |
| Timers | Confirmed | Official Regulation Set M-A page. | Display as confirmed rule-set metadata. |
| Stat Points existence | Confirmed | Official site references Stat Points/training. | Show fields, save values, version schema. |
| Stat Point caps | Blocked | No accessible official formula/cap source found. | Do not hard-fail over caps unless later verified. |
| EV-to-Stat Point conversion | Blocked | Only community sources found. | No official conversion in import/export. |
| IV behavior | Blocked | Only community sources found. | Do not assume fixed 31 for official calculations. |
| Stat Alignment vs Nature | Partially confirmed / blocked for math | Official UI references Stat Alignment; community sources map it to Nature-like behavior. | Allow field; block exact multiplier/rounding until verified. |
| Lv.50 Speed formula | Blocked | No accessible official formula source found. | Use only in unverified prototypes, not authoritative results. |
| Damage calculator correctness | Blocked | Depends on Stat Points, IV behavior, Stat Alignment, move/item/ability edge cases. | Keep final KO odds and official labels disabled until verified. |

## PRD Recommendations

- Keep `StatPoints` in the team schema, but allow a `verificationStatus` such as `mechanismPending`.
- Keep current PRD language that says Stat Points / IV / EV / Nature details are not hard-coded.
- For speed-line v1, separate "known display inputs" from "confirmed final Speed". Base stats, form/Mega selection, Tailwind toggle, and stage modifiers can exist as UI controls, but final numeric Speed should stay unverified unless backed by a confirmed formula.
- Implement duplicate held item validation now; it is officially confirmed.
- Implement Regulation Set M-A timer display now; it is officially confirmed.
- Implement Mega metadata now at the rule level, but require source-backed Mega form and Mega Stone mappings before giving per-Pokemon legality a strong pass/fail.
- Treat community mechanics pages as research leads only. Promote a mechanic from blocked to confirmed only after official documentation, direct in-game verification with reproducible screenshots/video, or trusted extracted game data confirms it.
