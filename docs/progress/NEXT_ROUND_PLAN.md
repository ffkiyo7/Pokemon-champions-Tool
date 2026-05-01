# 下一轮开发准备

更新时间：2026-05-02

## 当前状态

- 本地最新基线：`463337a Add onError fallback to PokemonAvatar for broken item sprites`
- 本地当前领先 `origin/master` 11 个提交；本轮仅补文档后统一推送。
- `npm test` 通过：9 个测试文件，55 个用例。
- `npm run build` 通过。
- `npm run test:pwa` 通过：PWA 离线 + 390px 移动端视觉回归，视觉基线 11 张。
- Playwright PWA / 视觉测试使用 `playwright.config.ts` 中的 `channel: 'chrome'`，即本机 Google Chrome；不依赖 Playwright bundled Chromium。
- **Pokemon 基础 catalog 已完成**：181 只基础形态，从 PokeAPI 批量接入，含中文名、日文名、属性、种族值、头像。5 个 batch 文件（001-005），自动化脚本 `scripts/generate-catalog-batch.mjs` 支持增量运行。
- **特性 catalog 已完成当前批次中文化**：174 个当前 catalog 特性，`scripts/generate-ability-effects.mjs` 从 52poke MediaWiki revisions API 抽取 zh-hans 信息框说明，并用 PokeAPI zh-hans 名称优先补齐；`npm run data:regma:abilities` 可复跑。
- **图鉴特性列表已做形态级拥有者映射**：拥有者头像最多显示 5 个 + `+N`，展开后显示完整拥有者；Mega 特性显示 Mega 形态头像 / 名称，点击可直接切到 Pokémon Tab 并打开对应详情页。
- **队伍 Pokémon Picker**：底部搜索选择器替代原来的循环添加逻辑，支持按中文名/英文名搜索。
- **图鉴详情页种族值总和**：种族值列表底部显示合计数值。
- 属性 badge 已收敛为项目化胶囊；不再使用本地 PNG 属性图标。
- 队伍页小卡片信息层级已调整。
- 伤害计算页条件控件可交互，Mega 状态选择会切换 Mega 形态属性 / 种族值；正式伤害公式仍阻断。
- 速度线支持 SP 手动调整，支持已有本地数据的 Mega 形态速度计算。
- Reg M-A 官方 Pokémon allowlist 213 行；Reg M-A 官方 Mega allowlist 59 行 shell。
- `currentRuleCatalog` 已接入 Reg M-A 道具候选 catalog：当前规则可选池 117 个道具。
- 道具图片当前仍以 PokeAPI item sprites 为临时来源，已确认覆盖不完整；明日改为 PokéBase Champions 当前可选道具真实图片快照，不使用本地生成图标。
- 招式和性格仍是 seed 级候选，尚未完成 Reg M-A 全量 join。
- Reg M-A 将于 2026-06-17 01:59 UTC 结束；仍需预留 Reg M-B 数据注册表 / 切换设计。

## 下一轮优先事项

1. 道具图片真实资源快照
   - 仅处理当前 Reg M-A 可选池 117 个道具；不为当前规则外的 Clear Amulet / Assault Vest 额外补图。
   - 主源使用 PokéBase Champions item 页面，统一下载真实图片到项目静态资源目录，避免热链与画风混用。
   - PokeAPI 只作为备用校验源，不再作为图鉴道具页主图源；不得使用本地生成 SVG / 文字图标作为正常展示路径。
   - 新增生成脚本与审计测试：117 个可选道具必须都有本地真实图片，图片路径必须可解析，PWA 静态资源缓存需覆盖这些图片。

2. 地区形态数据接入
   - 32 只地区形态（Alolan / Galarian / Hisuian / Paldean）尚未录入 catalog。
   - 地区形态的 stats / types / abilities 与基础形态不同，需要按 form ID 从 PokeAPI 接入。
   - 保持 `manual-review`，不伪造数据。

3. Mega 数据第二阶段
   - 对 59 个官方 Mega allowlist 做 catalog join。
   - 已完成本地 form 数据的 4 个继续保留；其余 55 个按来源状态分批：
     - 旧主系列 / PokeAPI 或 Showdown 可确认：可补 stats / types / abilities / sprite / item mapping。
     - Champions 新 Mega：只在官方或可靠结构源出现后补战斗字段。
   - 新增测试：allowlist entry 与 catalog form 映射、Mega Stone 到 form 的一一关系，以及 Mega 特性拥有者在图鉴中指向具体 Mega form。

4. 招式 / learnset / 性格 catalog 可信分层
   - 招式第批处理：补目标范围、威力、命中、分类、learnset 关系。
   - 性格需确认 Champions 是否全量沿用主系列名称 / 效果。
   - 拆成当前规则确认池、社区候选池、示例 / 开发池。

5. 伤害计算适配层
   - 保持正式伤害输出阻断。
   - 下一轮只做适配层边界：输入结构、Mega form stats/types、spread damage 派生、weather/terrain/stage 映射。

6. Regulation 切换设计
   - 增加 Reg registry 草案，避免未来从 Reg M-A 切 Reg M-B 时散改 `data/index.ts`。
   - 记录数据版本、规则状态、过期提醒和本地队伍跨规则迁移策略。

## 验收标准

- `npm test` 通过。
- `npm run build` 通过。
- `npm run test:pwa` 通过。
- 新增数据必须有可解析 `sourceRefs`。
- 未完成复核的数据必须保留 `manual-review` 或等价状态。
- 缺失 Mega 战斗字段时，不得伪造 stats/types/ability/sprite。
- 特性拥有者必须按具体 dex entry / form 映射，不能把 Mega-only 特性挂到基础形态展示。
- 搜索特性时只匹配特性中文名 / 英文名，不匹配说明文本。
- 图鉴道具页的当前规则 117 个可选道具不得出现破损图标、文字 fallback、生成图标或跨来源画风混用。
- 文档同步更新 `DEVELOPMENT_PROGRESS.md` 与本计划。
