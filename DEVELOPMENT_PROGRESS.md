# Pokemon Champions 对战助手开发进度

更新时间：2026-04-26

## 当前阶段

项目已从“静态设计参考”推进到“可运行 PWA MVP + 版本化 seed data”。当前应用可在本地通过 `npm run dev` 预览，并已具备基本测试与生产构建验证。

## 已完成

- PWA 项目骨架：React + Vite + TypeScript + Tailwind CSS。
- 移动端暗色 UI：底部 5 Tab、当前规则详情、组队、计算、速度线、图鉴、设置。
- 本地存储：IndexedDB 保存队伍、偏好与 benchmark 收藏。
- 队伍能力：创建、删除、添加成员、从队伍进入计算和速度线。
- 图鉴能力：Pokemon / 招式 / 道具 / 特性浏览、搜索、详情、加入队伍。
- 速度线能力：速度轴、benchmark markers、收藏、队伍 benchmark。
- 计算页：保留示例结果卡，但对未确认 Champions 机制维持阻断态。
- 数据基础：新增 `src/data/seed/regMA/`，将 Reg M-A seed data 从页面逻辑中分离。
- 合法性边界：新增 `evaluateMemberLegality`，区分缺少配置、非法、需复核、合法。
- 测试基础：新增 Vitest，覆盖速度计算 gate 与合法性校验。

## 当前验证状态

- `npm test`：通过。
- `npm run build`：通过。
- 本地预览：`http://127.0.0.1:5173/`。

## PRD 对照进度

| 模块 | PRD 状态 | 当前实现 |
| --- | --- | --- |
| P0a 可点击 MVP 壳 | 必须做 | 已完成 |
| 当前规则页 | 必须做 | 已完成基础信息、数据版本、来源、刷新失败兜底 |
| 组队 | 必须做 | 已完成本地队伍与成员快速添加，编辑细节仍待增强 |
| 图鉴 | 必须做 | 已完成四类入口与详情，数据仍是 seed |
| 速度线 | 必须做 | 已完成可视化与收藏，正式机制仍需确认 |
| 伤害计算 | 必须做 | 已完成 UI 与阻断态，未接正式计算引擎 |
| 合法性校验 | P0c | 已有基础边界，仍需真实数据源复核 |
| 导入 / 导出 | P1 | 已完成 JSON 导入导出 |
| 基础配队分析 | P1 | 已完成简单 chip 摘要，解释面板待补 |

## 当前风险

- Reg M-A 完整合法 Pokemon、招式、道具、特性仍未接权威结构化数据。
- Champions Stat Points / IV / EV / Nature 机制未确认，不能输出正式速度或伤害结论。
- `@smogon/calc` 对 Champions 的支持程度尚未验证。
- 当前 catalog 是 seed data，必须维持“需复核”状态，避免误导为强合法结论。
- 中文名、图标和简介资源授权未确认，当前继续使用文字和中性占位。

## 下一步计划

1. 建立 seed data audit：检查来源、版本、交叉引用和默认队伍数据一致性。
2. 把 audit 纳入测试，作为数据质量门禁。
3. 继续扩展 Reg M-A 首批真实数据候选，并为每条数据补 `sourceRefs`。
4. 调研 Champions 速度机制，决定何时把速度线从阻断态升级到部分正式计算。
5. 调研 `@smogon/calc`，决定伤害计算接口和降级策略。

## 开发命令

```bash
npm run dev
npm test
npm run build
```

## 提交记录

- `126902a`：实现 Pokemon Champions MVP PWA。
- `3185068`：新增版本化 seed data 与验证测试。
