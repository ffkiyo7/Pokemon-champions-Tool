# 下一轮开发准备

更新时间：2026-05-02

## 当前状态

- 本地最新基线：`c29992b Fix local item icon rendering`
- 本地当前领先 `origin/master` 多个提交；本轮已完成道具图快照、渲染修复与测试补强，待文档提交后统一推送。
- `npm test` 通过：10 个测试文件，59 个用例。
- `npm run build` 通过。
- `npm run test:pwa` 通过：PWA 离线 + 390px 移动端视觉回归，视觉基线 11 张。
- Playwright PWA / 视觉测试使用 `playwright.config.ts` 中的 `channel: 'chrome'`，即本机 Google Chrome；不依赖 Playwright bundled Chromium。
- **Pokemon 基础 catalog 已完成**：181 只基础形态，从 PokeAPI 批量接入，含中文名、日文名、属性、种族值、头像。5 个 batch 文件（001-005），自动化脚本 `scripts/generate-catalog-batch.mjs` 支持增量运行。
- **特性 catalog 已完成当前批次中文化**：174 个当前 catalog 特性，`scripts/generate-ability-effects.mjs` 从 52poke MediaWiki revisions API 抽取 zh-hans 信息框说明，并用 PokeAPI zh-hans 名称优先补齐；`npm run data:regma:abilities` 可复跑。
- **图鉴特性列表已做形态级拥有者映射**：拥有者头像最多显示 5 个 + `+N`，展开后显示完整拥有者；Mega 特性显示 Mega 形态头像 / 名称，点击可直接切到 Pokémon Tab 并打开对应详情页。
- **队伍 Pokémon Picker**：底部搜索选择器替代原来的循环添加逻辑，支持按中文名/英文名搜索。
- **图鉴详情页种族值总和**：种族值列表底部显示合计数值。
- **性格 catalog 已完成**：25 个主系列性格从 PokeAPI 接入，含中文名、增减能力与 neutral 标记。
- **Mega 形态第二阶段已推进**：35 个旧主系列 Mega form 已接入 stats/types/abilities/sprite/Mega Stone 映射；24 个 Champions 新 Mega 仍保留 shell，不伪造战斗字段。
- 属性 badge 已收敛为项目化胶囊；不再使用本地 PNG 属性图标。
- 队伍页小卡片信息层级已调整。
- 伤害计算页条件控件可交互，Mega 状态选择会切换 Mega 形态属性 / 种族值；正式伤害公式仍阻断。
- 速度线支持 SP 手动调整，支持已有本地数据的 Mega 形态速度计算。
- Reg M-A 官方 Pokémon allowlist 213 行；Reg M-A 官方 Mega allowlist 59 行 shell。
- `currentRuleCatalog` 已接入 Reg M-A 道具候选 catalog：当前规则可选池 117 个道具。
- 道具图片已统一为 PokéBase Champions 当前可选道具真实图片快照：117 个 PNG 存入 `public/assets/items/`，`iconRef` 使用本地 `/assets/items/*.png`，SW 已配置惰性预缓存。
- `PokemonAvatar` 已修复本地图片路径识别：支持 `/assets/...`、相对路径与 `data:image/*`，失败时才用文字 fallback。
- 招式和 learnset 已完成已接入 Pokémon 的第一阶段 join：`scripts/generate-champions-moves.mjs` 从 PokéBase Champions Pokémon Available Moves 页面生成 528 个招式与 11323 条 Pokémon-招式关系；PokeAPI 只用于中文名、中文说明和目标范围。
- 图鉴 Pokémon 列表按全国图鉴序号排序；详情页头像可点开大图，当前规则可学招式默认折叠，可按属性 / 性质 / 威力排序。
- 队伍小卡片展示当前携带物图片；队伍编辑页招式和携带物已改为可搜索选择器。
- Reg M-A 将于 2026-06-17 01:59 UTC 结束；仍需预留 Reg M-B 数据注册表 / 切换设计。

## 下一轮优先事项

1. 地区形态数据接入
   - 32 只地区形态（Alolan / Galarian / Hisuian / Paldean）尚未录入 catalog。
   - 地区形态的 stats / types / abilities 与基础形态不同，需要按 form ID 从 PokeAPI 接入。
   - 保持 `manual-review`，不伪造数据。

2. Mega 数据第三阶段
   - 对 59 个官方 Mega allowlist 做 catalog join。
   - 已完成旧主系列 35 个 Mega form；剩余 24 个 Champions 新 Mega 只在官方或可靠结构源出现后补战斗字段。
   - 新增测试：allowlist entry 与 catalog form 映射、Mega Stone 到 form 的一一关系，以及 Mega 特性拥有者在图鉴中指向具体 Mega form。

3. 招式 / learnset 后续补齐
   - 已接入 181 只基础形态 Pokémon 的 PokéBase Champions Available Moves。
   - 下一步只补缺口：32 只地区形态、后续 Champions 新 Mega form 与 learnset 的 form 级差异。
   - 性格已按主系列 25 个接入；后续只需确认 Champions 是否全量沿用名称 / 效果。

4. 伦琴猫与主页轻量内容
   - 图鉴与队伍页新需求已完成第一批：头像大图、招式折叠排序、道具图、招式 / 道具搜索。
   - 剩余：伦琴猫标题背景 / 姿势可动、知识问答或 tips 轮播。
   - 计划文档：`docs/product/PLAN0502.md`。

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
- `PokemonAvatar` 这类通用头像组件必须支持本地 `/assets/...` 静态资源；新增本地图片来源时必须补 UI 渲染测试，不只测文件存在。
- 已接入 Pokémon 的当前规则 learnset 不得为空；图鉴详情不得再出现 seed 示例口径。
- 文档同步更新 `DEVELOPMENT_PROGRESS.md` 与本计划。
