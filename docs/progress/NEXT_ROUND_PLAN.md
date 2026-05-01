# 下一轮开发准备

更新时间：2026-05-01

## 当前状态

- 本地最新已提交基线为 `db671dc Refine team stat UI`；本轮正在收口当前规则 catalog 可信分层，完成后提交。
- `npm test` 通过：9 个测试文件，51 个用例。
- `npm run build` 通过。
- `npm run test:pwa` 通过：PWA 离线 + 390px 移动端视觉回归，视觉基线 11 张。
- 图鉴已经拆成列表与详情页：列表只显示中文名，详情支持英文 / 日文切换，展示特性、种族值、示例 learnset、属性相克。
- 属性 badge 已收敛为项目化胶囊：描边、半透明填充、白色中文、固定尺寸；不再使用本地 PNG 属性图标。
- 队伍页小卡片信息层级已调整：小卡片只显示头像、中文名、属性；特性 / 道具 / 校验结果只在展开或编辑页出现。
- 伤害计算页条件控件可交互，Mega 状态选择会切换当前展示的 Mega 形态属性 / 种族值；正式伤害公式仍阻断。
- 速度线支持 SP 手动调整，并支持对已有本地数据的 Mega 形态进行速度计算；不支持 Mega 的 Pokémon 不再显示“原始形态”标签。
- Reg M-A 官方 Pokémon allowlist 已有 213 行 seed；Reg M-A 官方 Mega allowlist 已有 59 行 shell。
- 当前本地 catalog 只有首批 6 只基础 Pokémon，其中已录入 4 个可用 Mega 形态：超级妙蛙花、超级喷火龙X、超级喷火龙Y、超级烈咬陆鲨。
- 其余 55 个官方允许 Mega 形态只保留 allowlist shell，不伪造 stats / types / ability / sprite / Mega Stone 映射。
- `currentRuleCatalog` 已开始拆分前端可选池与原始 seed：道具选择器只展示当前可选池，突击背心 / 清净坠饰等未确认或不在池内的 seed 道具不再进入新配置入口；旧存档若仍携带会被合法性校验拦截。
- 招式和性格仍是 seed 级候选，当前仅通过 UI 标注、`needs-review` 和后续计划约束，尚未完成 Reg M-A 全量 join。
- Reg M-A 将于 2026-06-17 01:59 UTC 结束；仍需预留 Reg M-B 数据注册表 / 切换设计。

## 下一轮优先事项

1. 扩展 Reg M-A catalog join
   - 以官方 Eligible Pokémon 213 行为主表，分批补 `Pokemon` 基础条目。
   - 每批约 40-55 只，保证 `sourceRefs`、头像、types、baseStats、abilities、learnableMoves 的来源状态清晰。
   - 继续保持 `manual-review`，不输出强合法结论。

2. Mega 数据第二阶段
   - 对 59 个官方 Mega allowlist 做 catalog join。
   - 已完成本地 form 数据的 4 个继续保留；其余 55 个按来源状态分为：
     - 旧主系列 / PokeAPI 或 Showdown 可确认：可补 stats / types / abilities / sprite / item mapping。
     - Champions 新 Mega：只在官方或可靠结构源出现后补战斗字段。
   - 需要新增测试：allowlist entry 与 catalog form 映射、Mega Stone 到 form 的一一关系、缺数据时 UI 显示“官方允许，战斗数据待确认”。

3. 队伍 Mega 体验继续细化
   - 当前编辑页可通过“形态”或 Mega Stone 体现 Mega 后能力值 / 属性。
   - 下一轮需要补“队内最多一个计划 Mega”的轻量提示，但不强阻断，因为实战每场只能 Mega 一次，队伍可携带多个 Mega Stone 的产品边界仍需确认。
   - 需要决定 base ability 与 Mega ability 在队伍编辑中的呈现方式：当前允许 base / Mega ability 均通过校验，后续应区分“登场特性”和“Mega 后特性”。

4. 图鉴详情 learnset 数据补齐
   - 当前“当前规则可学会招式”仍来自 seed 示例，不代表完整 Champions Reg M-A learnset。
   - 下一轮需要建立 learnset 数据来源与字段口径：是否可训练、形态 / Mega 形态是否影响、目标范围与分散伤害标记是否与 Champions 实机一致。
   - 数据补齐前继续标注“示例待补齐”，不能作为正式配招合法性结论。

5. 道具 / 招式 / 性格 catalog 可信分层
   - 继续扩展 `currentRuleCatalog`：把道具、招式、性格从 seed 示例池拆成当前规则确认池、社区候选池、示例 / 开发池。
   - 道具优先完成：补齐 Reg M-A 允许道具列表、来源、中文名、效果、是否 Mega Stone、适用 Pokémon。
   - 招式第二批处理：补目标范围、威力、命中、分类、learnset 关系，并保留分散伤害派生字段。
   - 性格需要确认 Champions 是否全量沿用主系列名称 / 效果；确认前继续只作为 UI seed 子集。

6. 伤害计算适配层
   - 保持正式伤害输出阻断。
   - 下一轮只做适配层边界：输入结构、Mega form stats/types、spread damage 派生、weather/terrain/stage 映射。
   - 不在 Champions 伤害公式确认前输出正式伤害范围或 KO 概率。

7. Regulation 切换设计
   - 增加 Reg registry 草案，避免未来从 Reg M-A 切 Reg M-B 时散改 `data/index.ts`。
   - 记录数据版本、规则状态、过期提醒和本地队伍跨规则迁移策略。

## 验收标准

- `npm test` 通过。
- `npm run build` 通过。
- `npm run test:pwa` 通过。
- 新增数据必须有可解析 `sourceRefs`。
- 未完成复核的数据必须保留 `manual-review` 或等价状态。
- 缺失 Mega 战斗字段时，不得伪造 stats/types/ability/sprite。
- 文档同步更新 `DEVELOPMENT_PROGRESS.md` 与本计划。

## 开工入口

```bash
npm test
npm run build
npm run test:pwa
```

建议下一轮从 “Mega 数据第二阶段 + catalog 分批 join” 开始；UI 现在已经能承接 Mega 形态，瓶颈转回数据完整性和来源复核。
