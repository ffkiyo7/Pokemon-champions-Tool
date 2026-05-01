# Pokemon Champions 对战助手开发进度表

更新时间：2026-05-01

当前阶段：**PWA MVP 已完成，已进入“真实数据扩展 + Mega 形态建模 + 正式计算适配边界”阶段。**

下一轮开发准备：`docs/progress/NEXT_ROUND_PLAN.md`

预览地址：`http://127.0.0.1:5173/`

验证命令：

```bash
npm test
npm run test:visual
npm run test:pwa
npm run build
```

当前验证结果：

- [x] `npm test` 通过：9 个测试文件，54 个用例
- [x] `npm run test:visual` 通过：1 个 Playwright 移动端视觉回归用例，11 张基线截图
- [x] `npm run test:pwa` 通过：2 个 Playwright 用例，包含 PWA 离线与移动端视觉回归
- [x] `npm run build` 通过
- [x] 本地 PWA 可预览

## 1. 总体进度

- [x] 项目初始化：React + Vite + TypeScript + Tailwind CSS
- [x] 移动端 PWA 壳：manifest、service worker、移动端 viewport
- [x] 暗色视觉系统：卡片、徽章、chip、底部 Tab、状态条
- [x] 5 个主 Tab：组队、计算、速度线、图鉴、设置
- [x] 当前规则详情页：Regulation Set M-A 元信息、数据版本、来源、刷新状态
- [x] IndexedDB 本地存储：队伍、偏好、benchmark 收藏
- [x] 版本化 seed data 目录：`src/data/seed/regMA/`
- [x] 基础测试框架：Vitest
- [x] 数据质量门禁：seed data audit
- [x] 机制调研文档：`docs/research/MECHANICS_RESEARCH.md`
- [x] 计算库 spike 文档：`docs/research/CALC_ENGINE_SPIKE.md`
- [x] 数据源与授权调研文档：`docs/research/DATA_SOURCE_RESEARCH.md`
- [x] PWA 离线验收清单：`docs/qa/PWA_OFFLINE_CHECKLIST.md`
- [x] 手机端核心交互修正：队伍切换、成员缩略卡、计算页攻防选择、局域网新建兜底
- [x] 页面级组件测试：核心导航、组队、编辑、计算页交互
- [x] PWA 离线自动化测试：app shell、IndexedDB 队伍、benchmark 收藏
- [x] 移动端视觉回归最小集：390px 视口覆盖组队、计算、速度线、图鉴、设置、规则详情
- [x] 真实数据 provenance/sourceRefs 骨架：类型化 source ref manifest 与 audit 解析检查
- [x] 完整真实 Reg M-A Pokemon allowlist seed：官方 Eligible Pokemon 页面 213 行、本地生成脚本、catalog 映射审计
- [x] 首批 6 只真实 Pokemon catalog：妙蛙花、喷火龙、蚊香蛙皇、煤炭龟、烈咬陆鲨、炽焰咆哮虎，含真实头像外链
- [x] Champions SP v1 机制落地：SP 单项 0-32、单只总量 66、Lv.50 固定、IV 不暴露
- [x] 速度线正式改走 mechanism gate，并支持手动调整速度 SP
- [x] 队伍成员 SP 编辑改为 6 项摘要 + 点开式滑条 / min / max / 单步调整
- [x] IndexedDB 升级到 v2，补 `1 -> 2` 迁移并迁移旧 EV-like `statPoints`
- [x] 属性相性补齐 18 种攻击属性，配队分析弱点 / 抗性 / 免疫覆盖更完整
- [x] 远程刷新入口改为 disabled，不再暴露永远失败的刷新操作
- [x] 伤害计算页招式、单双打、天气、场地、能力阶级、Mega 状态控件已可点击；正式伤害输出继续阻断
- [x] 伤害计算页 Mega 状态会切换到对应 Mega 形态的属性 / 种族值展示
- [x] 图鉴 Pokémon 列表只显示中文名，详情页支持英文 / 日文切换
- [x] 图鉴详情页展示特性、种族值、示例 learnset、属性相克
- [x] 属性展示收敛为项目化胶囊 badge，不再使用本地 PNG 属性图标
- [x] Reg M-A 官方 Mega allowlist shell 已接入：59 条，含 source refs 与 audit 测试
- [x] 首批 4 个本地 Mega 形态可用于图鉴、队伍能力值、速度线和计算页形态展示
- [x] 当前规则可选道具池与原始 seed 道具拆分：已接入 117 个 Reg M-A 道具候选，突击背心 / 清净坠饰不再进入前端新配置入口，旧存档携带时会被合法性校验拦截
- [x] 完整真实 Reg M-A 基础数据源接入：181 只基础形态 Pokémon + 108 特性，含中文名、日文名、中文特性描述、种族值、PokeAPI 头像
- [x] 图鉴详情页种族值总和显示
- [x] 队伍添加 Pokémon 底部搜索选择器，支持按中文名/英文名搜索
- [x] 自动化批量数据接入脚本（PokeAPI → 本地 seed 文件），含缓存、去重、Mega 交叉比对
- [ ] 完整真实 Reg M-A 招式 / learnset 数据接入
- [ ] 32 只地区形态 Pokémon 数据接入
- [ ] Champions 伤害机制确认
- [ ] 正式伤害计算
- [x] 正式速度计算结论（基于当前 Champions SP v1 公式与 gate）

## 2. PRD 模块进度

### P0a：可点击 MVP 壳 / 本地假数据

- [x] 建立移动端 PWA 页面壳
- [x] 建立底部 5 Tab 导航
- [x] 落地暗色视觉规范
- [x] 建立基础组件：Card、Button、Badge、Chip、EmptyState
- [x] 使用本地 seed data 串起主流程
- [x] 所有计算和合法性强结论保留“示例数据 / 需复核 / 机制待确认”提示

状态：**完成**

### P0b：本地队伍 + 图鉴 + 速度线

- [x] 当前规则卡片和规则详情页
- [x] 数据版本展示
- [x] 本地队伍创建
- [x] 本地队伍删除
- [x] 队伍成员快速添加
- [x] 队伍成员完整编辑表单
- [x] 队伍成员字段级校验提示
- [x] Pokemon / 招式 / 道具 / 特性图鉴入口
- [x] 图鉴搜索
- [x] Pokemon 详情页
- [x] 从图鉴加入队伍
- [x] 从图鉴进入速度线
- [x] 从图鉴进入计算页
- [x] 速度线轴可视化
- [x] benchmark 列表
- [x] benchmark 收藏
- [x] 当前队伍 benchmark
- [x] benchmark 详情 bottom sheet
- [x] benchmark 分类筛选真实生效
- [x] 多队伍切换
- [x] 队伍成员 2 列缩略卡
- [x] 队伍成员展开 / 收起交互
- [x] 队伍成员示例能力值展示
- [x] 队伍成员编辑表单补齐六项 SP
- [x] 队伍成员编辑 SP 改为适配手机端的点开式 picker，并显示 `已用 X/66`
- [x] 移除固定规则下的等级编辑
- [x] 速度线页面支持手动调整速度 SP，不再固定满 SP 极速

状态：**主要流程、成员编辑、移动端成员卡片、benchmark 详情与速度 SP 已完成；成员卡信息层级和属性 badge 视觉下一轮继续调**

补充：成员卡信息层级、属性 badge 视觉、图鉴详情页和首批 Mega 形态展示已在后续提交中收敛；下一步重点转向完整 catalog / Mega 数据补齐。

### P0c：伤害计算 + 合法性校验

- [x] 伤害计算页 UI
- [x] 攻击方 / 防守方展示
- [x] 攻击方 / 防守方均可从当前规则图鉴选择
- [x] 计算页支持搜索全部 Pokémon
- [x] 计算页横向推荐当前队伍成员
- [x] 招式展示
- [x] 战斗条件 chip
- [x] 招式选择、单双打、天气、场地、能力阶级、Mega 状态控件可交互
- [x] 分散伤害由招式目标范围和单双打模式在逻辑层派生，不再作为前端手动开关展示
- [x] 机制待确认阻断态
- [x] 计算结果标注“示例数据 / 非真实计算”
- [x] 基础合法性状态：合法、非法、需复核、缺少配置
- [x] 道具重复校验
- [x] 招式与 Pokemon 匹配校验
- [x] 特性与 Pokemon 匹配校验
- [x] Mega Stone 匹配校验
- [x] Mega 形态与 Mega Stone 关系校验
- [x] 队伍成员选择 Mega Stone 时可反映 Mega 后属性 / 能力值
- [x] 计算页 Mega 状态选择可切换进攻方 / 防守方当前形态展示
- [ ] 接入正式伤害计算库
- [x] 验证 `@smogon/calc` 对 Champions 的支持程度
- [ ] 正式输出伤害范围、击杀概率、一确 / 二确 / 乱数
- [ ] 计算结果来源和机制假设详情页

状态：**UI 和条件控件已可交互，正式计算仍因 Champions 伤害机制、Mega 细节和计算适配层未完成而阻断**

### P1：导入导出 + 基础配队分析 + 缓存兜底

- [x] 队伍 JSON 导出
- [x] 队伍 JSON 导入
- [x] 导入导出格式包含 `ruleSetId` 和 `dataVersionId`
- [x] 基础配队分析 chip 摘要
- [x] 刷新入口禁用并标注当前版本暂不支持远程刷新 / 本地缓存可用
- [x] 清除本地缓存入口
- [x] 配队分析详情面板
- [x] 属性弱点 / 抗性 / 免疫更完整分析
- [x] 功能位和重复定位更完整分析
- [x] 导入失败错误详情优化
- [x] 缓存状态和离线状态更精细展示

状态：**基础能力完成；分析文案保留轻量风险提醒边界，不生成完整队伍、不点名替换对象**

## 3. 数据与机制进度

### 数据模型

- [x] `RuleSet`
- [x] `DataVersion`
- [x] `Pokemon`
- [x] `PokemonForm / MegaForm`
- [x] `Move`
- [x] `Item`
- [x] `Ability`
- [x] `Team`
- [x] `TeamMember`
- [x] `DamageCalcContext`
- [x] `SpeedBenchmark`
- [x] `UserPreference`
- [x] 数据 schema 版本迁移策略
- [x] 导入数据兼容旧版本策略
- [x] IndexedDB v2 升级迁移策略
- [x] 局域网 / 非安全上下文 ID 生成兜底

### Seed Data

- [x] Reg M-A metadata 独立文件
- [x] Pokemon catalog 独立文件
- [x] benchmark 独立文件
- [x] default teams 独立文件
- [x] 统一导出入口 `src/data/index.ts`
- [x] seed data audit 检查引用完整性
- [x] seed data audit 检查 `sourceRefs` 能解析到 manifest 记录
- [x] seed data audit 检查首批 Reg M-A allowlist 来源、唯一性和 catalog 映射
- [x] seed data audit 纳入测试
- [x] 完整真实 Reg M-A Pokemon allowlist seed
- [x] Reg M-A 官方 Mega allowlist shell：59 条官方允许 Mega Evolution，未 join 的条目保持待补战斗数据
- [x] 首批 6 只真实 Pokemon catalog 数据
- [x] 181 只基础形态 Pokemon 完整 catalog：含中文名、日文名、属性、种族值、特性（中文描述）、可学招式（来自已有招式目录）、PokeAPI 头像
- [x] 108 特性完整 catalog，含 PokeAPI 中文名与项目化中文效果描述
- [x] 首批 4 个 Mega form catalog 数据：超级妙蛙花、超级喷火龙X、超级喷火龙Y、超级烈咬陆鲨
- [x] 首批 seed 道具数据与当前可选池拆分
- [x] 首批 seed 招式数据
- [x] 首批 seed 特性数据
- [x] Reg M-A 道具 catalog 第一批：30 个普通携带道具、59 个 Mega Stone、28 个树果，source refs 仍按社区候选 + manual-review 管理
- [ ] 完整真实 Reg M-A 招式 catalog 数据
- [ ] 完整真实 learnset 数据（招式与 Pokémon 学习关系）
- [ ] Champions 性格 catalog 与效果确认
- [x] 完整真实 Reg M-A 基础形态 Pokemon catalog 数据（181/213 基础形态）
- [ ] 32 只地区形态 Pokémon 数据接入
- [ ] 其余 55 个官方允许 Mega 形态的 stats / types / abilities / sprite / Mega Stone 映射
- [ ] 每条真实数据的来源链接和复核状态

### 机制确认

- [x] 未确认机制默认阻断正式结论
- [x] 速度计算增加 mechanism gate
- [x] 速度页和队伍 benchmark 均走 speed mechanism gate
- [x] 伤害计算页保留阻断态
- [x] 完成 Champions 机制调研文档
- [x] Champions Stat Points v1 机制按产品决策启用：单项 32、总量 66、Lv.50 固定
- [x] IV 不再暴露为用户参数；当前速度 / 能力公式隐含 Champions 固定处理
- [ ] 持续追踪官方一手资料对 IV 固定值、SP 公式和 Stat Alignment 命名的最终表述
- [x] 确认 Reg M-A Mega 可用、每场一次、重复道具禁止和计时规则
- [x] 建立 Reg M-A 官方 Mega allowlist shell，并将已录入的 4 个 Mega form 接入形态解析
- [ ] 补齐其余官方允许 Mega 形态和 Mega Stone 关系数据
- [ ] 确认招式学习关系权威来源
- [x] 调研 `@smogon/calc`
- [x] 确认需要项目自有计算适配层

调研结论：

- `docs/research/MECHANICS_RESEARCH.md`：Reg M-A 日期、Mega、重复道具、计时可作为确认规则；Stat Points / 速度公式已按 Champions SP v1 机制启用，伤害公式继续阻断。
- `docs/research/CALC_ENGINE_SPIKE.md`：`@smogon/calc@0.11.0` 可覆盖主线 doubles、spread、weather、terrain、stat stages、Mega/form 等能力，但 published npm 不含稳定 Champions 机制，必须通过适配层和阻断 gate 使用。
- `docs/research/DATA_SOURCE_RESEARCH.md`：首批真实数据建议从官方 HOME Reg M-A 元信息和 Eligible Pokemon allowlist 开始，再用 Showdown/PokeAPI join 基础字段；图片、官方描述、使用率数据暂不进入 v1。

## 4. 测试进度

- [x] Vitest 测试脚本
- [x] 速度计算公式测试
- [x] 速度机制 gate 测试
- [x] 示例能力值计算测试
- [x] ID 生成 fallback 测试
- [x] 合法性：缺少 Pokemon 配置
- [x] 合法性：seed data 只能给出需复核
- [x] 合法性：重复道具非法
- [x] seed data audit：当前数据内部一致
- [x] seed data audit：benchmark 版本一致
- [x] seed data audit：默认队伍版本一致
- [x] IndexedDB repository 测试
- [x] IndexedDB v1 -> v2 fixture 迁移测试
- [x] 导入导出 schema 测试
- [x] 导入数据 schema 迁移测试
- [x] PWA 离线验收清单文档
- [x] 页面级组件测试
- [x] PWA 离线缓存测试
- [x] 移动端视觉回归测试
- [x] source ref manifest 解析测试
- [x] Reg M-A allowlist seed 解析测试
- [x] Reg M-A Mega allowlist shell 解析测试
- [x] 首批真实 catalog 头像 URL 测试
- [x] 首批 Mega form 头像 URL 测试
- [x] 18 属性相性枚举与 Ghost / Fairy / Poison / Bug / Steel 覆盖测试
- [x] SP 输入最大 32、总量 66、点开式 picker 与刷新 disabled 测试
- [x] Mega form + Mega Stone 合法性测试
- [x] 速度线 Mega 形态速度测试
- [x] 当前规则道具可选池测试：117 个候选道具进入 selector pool，突击背心 / 清净坠饰不进入 selector，seed 中保留但不标可用

## 5. 当前风险与处理状态

- [x] Reg M-A 完整合法列表已接入官方 Eligible Pokemon allowlist seed，但仍需二次复核和 catalog join
- [x] Champions Stat Points 已按 v1 产品机制启用；后续仍需追踪官方最终措辞
- [x] `@smogon/calc` 兼容性已调研：主线能力可用，Champions 特有机制仍阻断
- [ ] 中文名、头像、简介资源授权风险仍需产品确认
- [x] 属性 PNG 图标实验已撤回，当前采用项目化中文胶囊 badge
- [x] 真实头像风险已按用户接受策略接入 PokeAPI official-artwork 外链
- [x] 手机局域网测试中新建失败风险：通过 `createId` fallback 兜底
- [x] seed data 不被误用为强合法结论：通过 `needs-review` 和测试约束
- [x] 数据引用断裂风险：通过 `auditSeedData` 测试约束
- [x] 未确认计算输出风险：通过机制阻断态约束
- [x] 远程刷新误导风险：刷新入口已 disabled，避免永远失败的操作入口
- [x] Pokemon 基础数据已完整接入：181 只基础形态已从 PokeAPI 正式拉取，含中文名/日文名/属性/种族值/特性/中文特性描述/头像
- [ ] Mega 数据不完整风险：59 条官方 allowlist 已建 shell，但只有 4 个本地 Mega form 具备可展示 stats/types/ability/sprite
- [ ] 地区形态数据缺失：32 只地区形态（Alolan/Galarian/Hisuian/Paldean）尚未录入 catalog
- [ ] 招式 / learnset / 性格 catalog 不完整风险：招式与性格仍为 seed 示例级数据，learnset 来自 PokeAPI 但需与 Champions 实机规则对齐后正式启用

## 6. 下一步开发清单

建议下一轮优先级：

- [x] 增加导入 / 导出 schema 测试
- [x] 增加 IndexedDB repository 测试
- [x] 做队伍成员编辑表单
- [x] 做 benchmark 详情 bottom sheet
- [x] 把速度线筛选切换做成真实过滤
- [x] 建立导入 schema 迁移策略
- [x] 建立 PWA 离线验收清单
- [x] 建立真实 Reg M-A 数据接入清单
- [x] 调研并记录 `@smogon/calc` Champions 支持结论
- [x] 修正手机端组队与计算核心交互
- [x] 页面级组件测试
- [x] PWA 离线缓存自动化测试
- [x] 移动端视觉回归测试
- [x] 建立真实数据 provenance 骨架
- [x] 扩展完整 Reg M-A Pokemon allowlist seed
- [x] 接入首批 6 只真实 Pokemon catalog 和真实头像
- [x] 修复 Champions SP 机制边界、18 属性相性和 IndexedDB v2 迁移
- [x] 伤害计算页条件控件可交互，但正式计算继续阻断
- [x] 成员编辑 SP 改为手机端点开式 picker
- [x] 调整队伍成员卡属性位置与“能力配置”点击编辑入口
- [x] 回评并收敛属性 badge 视觉方案
- [x] 重构图鉴属性筛选以支持完整 18 属性
- [x] 补 Reg M-A Mega allowlist seed 与 Mega Stone / Mega 状态禁用校验
- [x] 拆分当前规则道具可选池，移除突击背心 / 清净坠饰等未确认道具入口
- [x] 接入 Reg M-A 117 个道具候选 catalog，并让 selector pool 从合法道具自动生成
- [x] 分批补齐 Reg M-A 181 只基础形态 catalog（基础形态 100%，剩余 32 只地区形态待补充）
- [x] 特性描述全部改为中文，不再使用英文 API 原文
- [x] 队伍添加 Pokémon 改为底部搜索 Picker，不再按顺序循环
- [x] 图鉴详情页种族值加上总和数值
- [ ] 分批补齐 32 只地区形态 Pokémon 数据
- [ ] 分批补齐其余 55 个官方允许 Mega 形态数据
- [ ] 分批补齐 Reg M-A 招式 / learnset / 性格 catalog
- [ ] 建立 Reg M-B / 后续规则 registry 草案

## 7. 提交记录

- [x] `126902a`：实现 Pokemon Champions MVP PWA
- [x] `3185068`：新增版本化 seed data 与验证测试
- [x] `fdf5698`：新增开发进度文档与 seed data audit
- [x] `cf7e88d`：提交 PRD 与设计参考资料
- [x] `0044d09`：新增队伍成员编辑、benchmark 详情与数据持久化测试
- [x] `2611dc2`：新增配队分析详情面板
- [x] `757b493`：优化导入错误和缓存状态
- [x] `112960f`：新增调研文档和队伍 schema 迁移
- [x] `25c71fa`：优化手机端队伍和计算页交互
- [x] `730f7f0`：新增回归测试并修正文档口径
- [x] `986e0cf`：新增 source provenance audit 并修复选择器交互
- [x] `3ef9bf0`：新增 Reg M-A allowlist seed
- [x] `adccbb3`：接入首批真实 catalog 头像
- [x] `37e6b5f`：修复 Champions SP 机制、属性相性与本地数据迁移
- [x] `aee7d82`：优化移动端 SP 编辑与计算页条件控件
- [x] `5fc4768`：收敛移动端队伍页、图鉴筛选和属性 badge UI
- [x] `3a0b632`：新增图鉴详情页与中 / 英 / 日名称展示
- [x] `0e6bd9d`：新增 Mega form 数据骨架与 UI 接入
- [x] `db671dc`：优化队伍页能力值与属性 badge 细节
