# Pokemon Champions Mechanics Research

Research date: 2026-04-26

Implementation review: 2026-04-30

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

## Product Decision For Current Code

As of 2026-04-30, the app promotes Champions Stat Points to the v1 product calculation layer while keeping provenance explicit:

- SP range is fixed in code as `0-32` per stat and `66` total per Pokemon.
- Lv.50 is fixed for official Champions calculations.
- IV is not exposed as a user parameter. The current simplified Champions formula treats IV behavior as folded into the SP formula rather than user-editable.
- HP formula: `base + SP + 75`.
- Non-HP / Speed formula: `floor((base + SP + 20) * natureMultiplier)`.
- Speed pages and team-derived benchmarks must call `calculateSpeedWithMechanismGate`; the gate status is set to `confirmed` for the current SP v1 formula.
- Damage calculation remains blocked for formal KO odds/ranges until Champions damage mechanics, Mega details, and calc adapter assumptions are verified.

This is a product implementation decision based on official training direction plus cross-checked community/mechanics references. It should continue to be monitored against future first-party documentation or direct game-client evidence.

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

- Store Stat Points as Champions SP, not EVs.
- Validate SP as single stat `0-32`, total `66`.
- Keep import/export and IndexedDB migration paths for old EV-like `statPoints`.
- Do not expose IV in UI; do not export Stat Points as Showdown EVs without an explicit approximate conversion mode.
- Continue avoiding first-party wording such as "officially confirmed exact formula" until official documentation or direct client evidence is captured.

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

Current product impact:

- The app now uses the simplified Champions SP formula above for formal speed-line output.
- `calculateSpeedWithMechanismGate` remains in place as an architectural boundary so the mechanism can be downgraded to blocked if future evidence contradicts v1 assumptions.
- Damage output remains blocked; confirming speed/SP does not imply full damage correctness.

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
| Stat Point caps | Product v1 enabled / monitor | Caps come from cross-checked community references, not a clearly accessible official formula page. | Enforce `0-32` per stat and `66` total; keep provenance and monitor official docs. |
| EV-to-Stat Point conversion | Migration-only heuristic | Community references and legacy app data require a safe upgrade path. | Convert old local/imported values only when any stat is `>32`: `252 -> 32`, `4 -> 1`; do not present as official export conversion. |
| IV behavior | Product v1 folded into formula / monitor | Community sources report IV fixed to 31; accessible official docs do not state the exact IV wording. | Do not expose IV; current formula bakes in Champions fixed handling. |
| Stat Alignment vs Nature | Product v1 enabled / monitor | Official UI references Stat Alignment; community sources map it to Nature-like behavior. | Use nature-like multipliers for speed and battle stats; monitor official wording. |
| Lv.50 Speed formula | Product v1 enabled through gate | Formula comes from product decision and cross-checked references. | Use for formal speed-line values via `calculateSpeedWithMechanismGate`; keep damage blocked. |
| Damage calculator correctness | Blocked | Depends on Stat Points, IV behavior, Stat Alignment, move/item/ability edge cases. | Keep final KO odds and official labels disabled until verified. |

## PRD Recommendations

- Keep `StatPoints` in the team schema as Champions SP with v2 migration support for old EV-like input.
- Keep PRD language precise: SP v1 is enabled, but final official wording for IV and Stat Alignment should still be monitored.
- For speed-line v1, final numeric Speed can be shown through the mechanism gate, but the code should not bypass that gate.
- Implement duplicate held item validation now; it is officially confirmed.
- Implement Regulation Set M-A timer display now; it is officially confirmed.
- Implement Mega metadata now at the rule level, but require source-backed Mega form and Mega Stone mappings before giving per-Pokemon legality a strong pass/fail.
- Treat community mechanics pages as research leads only. Promote a mechanic from blocked to confirmed only after official documentation, direct in-game verification with reproducible screenshots/video, or trusted extracted game data confirms it.
