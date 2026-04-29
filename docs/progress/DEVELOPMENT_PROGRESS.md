# Pokemon Champions 对战助手开发进度表

更新时间：2026-04-29

当前阶段：**可运行 PWA MVP 已完成，正在进入“可信数据与计算验证”阶段。**

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

- [x] `npm test` 通过：9 个测试文件，40 个用例
- [x] `npm run test:visual` 通过：1 个 Playwright 移动端视觉回归用例，8 张基线截图
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
- [ ] 完整真实 Reg M-A 数据源接入
- [ ] Champions 机制确认
- [ ] 正式伤害计算
- [ ] 正式速度计算结论

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
- [x] 移除固定规则下的等级编辑

状态：**主要流程、成员编辑、移动端成员卡片、benchmark 详情与视觉回归保护已完成，后续继续补真实数据**

### P0c：伤害计算 + 合法性校验

- [x] 伤害计算页 UI
- [x] 攻击方 / 防守方展示
- [x] 攻击方 / 防守方均可从当前规则图鉴选择
- [x] 计算页支持搜索全部 Pokémon
- [x] 计算页横向推荐当前队伍成员
- [x] 招式展示
- [x] 战斗条件 chip
- [x] 机制待确认阻断态
- [x] 计算结果标注“示例数据 / 非真实计算”
- [x] 基础合法性状态：合法、非法、需复核、缺少配置
- [x] 道具重复校验
- [x] 招式与 Pokemon 匹配校验
- [x] 特性与 Pokemon 匹配校验
- [x] Mega Stone 匹配校验
- [ ] 接入正式伤害计算库
- [ ] 验证 `@smogon/calc` 对 Champions 的支持程度
- [ ] 正式输出伤害范围、击杀概率、一确 / 二确 / 乱数
- [ ] 计算结果来源和机制假设详情页

状态：**UI、攻防选择和安全阻断完成，正式计算待机制确认与计算适配层**

### P1：导入导出 + 基础配队分析 + 缓存兜底

- [x] 队伍 JSON 导出
- [x] 队伍 JSON 导入
- [x] 导入导出格式包含 `ruleSetId` 和 `dataVersionId`
- [x] 基础配队分析 chip 摘要
- [x] 数据刷新失败缓存兜底提示
- [x] 清除本地缓存入口
- [x] 配队分析详情面板
- [x] 属性弱点 / 抗性 / 免疫更完整分析
- [x] 功能位和重复定位更完整分析
- [x] 导入失败错误详情优化
- [x] 缓存状态和离线状态更精细展示

状态：**基础能力完成，分析解释和异常体验待补**

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
- [x] 首批 6 只真实 Pokemon catalog 数据
- [x] 首批真实道具数据
- [x] 首批真实招式数据
- [x] 首批真实特性数据
- [ ] 完整真实 Reg M-A Pokemon catalog 数据
- [ ] 每条真实数据的来源链接和复核状态

### 机制确认

- [x] 未确认机制默认阻断正式结论
- [x] 速度计算增加 mechanism gate
- [x] 伤害计算页保留阻断态
- [x] 完成 Champions 机制调研文档
- [ ] 确认 Champions Stat Points 机制
- [ ] 确认 IV / EV / Nature 是否沿用既有体系
- [x] 确认 Reg M-A Mega 可用、每场一次、重复道具禁止和计时规则
- [ ] 确认完整 Mega 形态和 Mega Stone 关系数据
- [ ] 确认招式学习关系权威来源
- [x] 调研 `@smogon/calc`
- [x] 确认需要项目自有计算适配层

调研结论：

- `docs/research/MECHANICS_RESEARCH.md`：Reg M-A 日期、Mega、重复道具、计时可作为确认规则；Stat Points / 速度公式已按 Champions SP 机制启用，伤害公式继续阻断。
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
- [x] 导入导出 schema 测试
- [x] 导入数据 schema 迁移测试
- [x] PWA 离线验收清单文档
- [x] 页面级组件测试
- [x] PWA 离线缓存测试
- [x] 移动端视觉回归测试
- [x] source ref manifest 解析测试
- [x] Reg M-A allowlist seed 解析测试
- [x] 首批真实 catalog 头像 URL 测试

## 5. 当前风险与处理状态

- [x] Reg M-A 完整合法列表已接入官方 Eligible Pokemon allowlist seed，但仍需二次复核和 catalog join
- [ ] Champions Stat Points 机制未确认
- [x] `@smogon/calc` 兼容性已调研：主线能力可用，Champions 特有机制仍阻断
- [ ] 中文名、图标、简介资源授权风险仍需产品确认
- [x] 真实头像风险已按用户接受策略接入 PokeAPI official-artwork 外链
- [x] 手机局域网测试中新建失败风险：通过 `createId` fallback 兜底
- [x] seed data 不被误用为强合法结论：通过 `needs-review` 和测试约束
- [x] 数据引用断裂风险：通过 `auditSeedData` 测试约束
- [x] 未确认计算输出风险：通过机制阻断态约束

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
- [ ] 补 Reg M-A Mega allowlist seed

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
