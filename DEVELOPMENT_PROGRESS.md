# Pokemon Champions 对战助手开发进度表

更新时间：2026-04-26

当前阶段：**可运行 PWA MVP 已完成，正在进入“可信数据与计算验证”阶段。**

预览地址：`http://127.0.0.1:5173/`

验证命令：

```bash
npm test
npm run build
```

当前验证结果：

- [x] `npm test` 通过
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
- [ ] 真实 Reg M-A 数据源接入
- [ ] Champions 机制确认
- [ ] 正式伤害计算
- [ ] 正式速度计算结论
- [ ] 移动端视觉回归与交互细化

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

状态：**主要流程、成员编辑和 benchmark 详情已完成，后续继续补真实数据与交互细化**

### P0c：伤害计算 + 合法性校验

- [x] 伤害计算页 UI
- [x] 攻击方 / 防守方展示
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

状态：**UI 和安全阻断完成，正式计算待调研**

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
- [ ] 导入失败错误详情优化
- [ ] 缓存状态和离线状态更精细展示

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
- [ ] 数据 schema 版本迁移策略
- [ ] 导入数据兼容旧版本策略

### Seed Data

- [x] Reg M-A metadata 独立文件
- [x] Pokemon catalog 独立文件
- [x] benchmark 独立文件
- [x] default teams 独立文件
- [x] 统一导出入口 `src/data/index.ts`
- [x] seed data audit 检查引用完整性
- [x] seed data audit 纳入测试
- [ ] 首批真实 Reg M-A Pokemon 数据
- [ ] 首批真实道具数据
- [ ] 首批真实招式数据
- [ ] 首批真实特性数据
- [ ] 每条真实数据的来源链接和复核状态

### 机制确认

- [x] 未确认机制默认阻断正式结论
- [x] 速度计算增加 mechanism gate
- [x] 伤害计算页保留阻断态
- [ ] 确认 Champions Stat Points 机制
- [ ] 确认 IV / EV / Nature 是否沿用既有体系
- [ ] 确认 Mega 形态和 Mega Stone 规则细节
- [ ] 确认招式学习关系权威来源
- [ ] 调研 `@smogon/calc`
- [ ] 确认是否需要自研 Champions 计算适配层

## 4. 测试进度

- [x] Vitest 测试脚本
- [x] 速度计算公式测试
- [x] 速度机制 gate 测试
- [x] 合法性：缺少 Pokemon 配置
- [x] 合法性：seed data 只能给出需复核
- [x] 合法性：重复道具非法
- [x] seed data audit：当前数据内部一致
- [x] seed data audit：benchmark 版本一致
- [x] seed data audit：默认队伍版本一致
- [x] IndexedDB repository 测试
- [x] 导入导出 schema 测试
- [ ] 页面级组件测试
- [ ] 移动端视觉回归测试
- [ ] PWA 离线缓存测试

## 5. 当前风险与处理状态

- [ ] Reg M-A 完整合法列表未接入权威结构化数据
- [ ] Champions Stat Points 机制未确认
- [ ] `@smogon/calc` 兼容性未确认
- [ ] 中文名、图标、简介资源授权未确认
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
- [ ] 建立真实 Reg M-A 数据接入清单
- [ ] 调研并记录 `@smogon/calc` Champions 支持结论

## 7. 提交记录

- [x] `126902a`：实现 Pokemon Champions MVP PWA
- [x] `3185068`：新增版本化 seed data 与验证测试
- [x] `fdf5698`：新增开发进度文档与 seed data audit
- [x] `cf7e88d`：提交 PRD 与设计参考资料
- [x] `0044d09`：新增队伍成员编辑、benchmark 详情与数据持久化测试
