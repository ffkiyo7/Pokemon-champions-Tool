# 下一轮开发准备

更新时间：2026-04-30

## 当前状态

- `master` 本地领先 `origin/master` 1 个提交，最新提交：`37e6b5f Fix Champions SP mechanics and local data migrations`。
- 本地已有未提交开发改动：伤害计算页条件控件、属性 PNG 图标实验、速度 SP 手动调整、成员编辑 SP picker、移动端视觉基线更新。
- `npm test` 通过：9 个测试文件，45 个用例。
- `npm run test:visual` 通过：1 个 Playwright 移动端视觉回归用例，9 张基线截图。
- `npm run test:pwa` 通过：2 个 Playwright 用例，包含 PWA 离线与移动端视觉回归。
- `npm run build` 通过：生产包可生成。
- 手机端核心体验已完成多轮修正：多队伍切换、成员缩略卡、展开 / 收起、点开式 SP picker、示例能力值、计算页攻防双方选择、全图鉴搜索、速度 SP 手动调整。
- 机制边界已收紧：Champions SP v1 速度 / 能力公式启用，伤害公式、Mega 细节、完整 learnset 仍阻断。
- 当前主要风险集中在真实 Reg M-A 数据扩展、Mega allowlist / Mega Stone 映射、正式伤害计算适配和属性 badge 视觉方案。
- Reg M-A 将于 2026-06-17 01:59 UTC 结束；下一轮预留 Reg M-B 数据注册表 / 切换设计占位，避免规则切换时散改 seed re-export。
- 用户已在手机端发现若干待修体验问题，已记录在“新增用户反馈待处理”；下一轮优先进入 UI 回评和 Mega 数据合法性设计。

## 明日优先事项

1. 先处理队伍页成员卡信息层级：属性放到名字旁，“能力配置”可直接进入编辑。
2. 回评属性 badge：最初英文+代表色方案 vs 百科式条形圆角方案，并用 390px 截图判断。
3. 重构图鉴属性筛选，保证完整 18 属性可用且不挤压首屏。
4. 核实并建模 Reg M-A Mega allowlist / Mega Stone 映射，补计算页和组队页禁用 / 校验。
5. 每个 UI 改动补组件测试或 Playwright 视觉覆盖；修复后跑 `npm test`、`npm run build`、`npm run test:pwa`。

## 新增用户反馈待处理

1. 队伍页成员卡信息层级调整
   - 属性图标应放在 Pokemon 名字旁边，然后再显示“需复核”等状态，不应放在性格下方、招式上方。
   - “能力配置”区域应可直接点击进入成员编辑页，不能只依赖右上角编辑图标。
   - 需要补组件测试或 Playwright 覆盖：点击能力配置打开编辑 bottom sheet，成员卡标题行在窄屏下不重叠。

2. 属性图标视觉方案回评
   - 当前原生 PNG 图标观感不理想，下一轮需要回评两种方向：
     - 回到最初的英文缩写 + 可辨识属性代表色 icon / badge 风格。
     - 参考神奇宝贝百科的“属性图标 + 属性文字 + 属性代表色底色”的条形圆角 badge 风格。
   - 评估重点：移动端 390px 宽度下是否撑高列表、双属性并排是否溢出、中文 / 英文标签是否影响扫描效率。
   - 若继续使用外部图标资源，先确认来源、尺寸、裁切和本地缓存策略；不再使用本地自绘图标作为默认方案。

3. 图鉴搜索与属性筛选重构
   - 搜索框 placeholder 只提示可搜索名称；属性搜索价值较低，且下方已有筛选入口。
   - 属性筛选需要为完整 18 属性做扩展设计，不能继续依赖一排 chip 硬塞。
   - 候选交互：点开式下拉 / bottom sheet 多选、横向滚动分组、或紧凑网格筛选；优先用手机端实际截图判断。
   - 验收：完整 18 属性可选，筛选状态清晰，可一键清空，不挤压图鉴列表首屏。

4. Reg M-A Mega 合法性与 UI 禁用策略
   - 需要先核实当前最新可靠来源：Reg M-A 中哪些 Pokemon 可参赛、哪些 Pokemon 拥有 Mega 形态、哪些 Mega 形态 / Mega Stone 在当前规则中可用。
   - 数据层建立 `canMegaEvolve` / `megaForms` / `requiredMegaItem` 或等价字段，并记录 source refs 与复核状态。
   - 伤害计算页：不支持 Mega 的 Pokemon 应禁用 Mega 状态选项；若历史数据或导入数据带有非法 Mega 状态，应显示不支持 / 不合法提示。
   - 组队编辑页：不支持 Mega 的 Pokemon 不应可选无效 Mega 道具；若导入或旧数据已携带非法 Mega 道具，合法性校验应报错或至少标记需复核。
   - 测试覆盖：支持 Mega / 不支持 Mega 两类 Pokemon、合法 Mega Stone / 非法 Mega Stone、计算页 Mega toggle 禁用与导入旧数据校验。

## 建议本轮目标

建议下一轮定为：**手机端信息层级回评 + Mega 合法性数据轮**。

核心目标不是继续堆页面，而是把用户手机端已经指出的扫描效率问题解决掉，同时补 Mega 合法性所需的数据骨架。这样后续接正式伤害计算时，Mega 状态、Mega Stone 和不支持 Mega 的 Pokemon 不会在 UI 与合法性层各自散落。

## 推荐任务顺序

1. 增加页面级组件测试
   - 覆盖底部 Tab 导航和规则详情入口。
   - 覆盖组队页：新建队伍、切换队伍、添加成员、展开 / 收起成员卡。
   - 覆盖成员编辑：六项 SP 输入、固定 Lv.50、不展示等级编辑。
   - 覆盖计算页：进攻方 / 防守方切换、全图鉴搜索、队伍推荐选择、机制阻断态。
   - 状态：已完成。

2. 增加 PWA 离线自动化测试
   - 检测 service worker 注册。
   - 模拟 offline 后刷新页面，确认 app shell 可打开。
   - 用 IndexedDB fixture 验证本地队伍和 benchmark 收藏离线可读。
   - 状态：已完成。

3. 补移动端视觉回归最小集
   - 选取 390px 宽移动视口。
   - 截取组队、计算、速度线、图鉴、设置、规则详情。
   - 重点检查：底部导航、成员展开卡、编辑 bottom sheet、计算页选择器、长文本和按钮不重叠。
   - 状态：已完成，基线位于 `tests/pwa/visual.spec.ts-snapshots/`。

4. 建立真实数据 provenance 骨架
   - 新增 source ref manifest 类型和种子示例。
   - 让 catalog rows 的 `sourceRefs` 可以解析到真实来源记录。
   - 在 seed data audit 中增加 source ref 存在性检查。
   - 保持 mock / manual-review 数据不能输出强合法结论。
   - 状态：已完成。

5. 准备首批真实 Reg M-A allowlist seed
   - 按 `docs/research/DATA_SOURCE_RESEARCH.md` 的首批范围执行。
   - 优先接官方规则元信息、Eligible Pokemon allowlist、Mega allowlist。
   - 每条数据必须有 source ref、检索时间和复核状态。
   - 在二次复核前全部保持 `manual-review`。
   - 状态：已完成完整 Pokemon allowlist seed（213 行）和生成脚本，并接入首批 6 只真实 catalog 与头像；Mega allowlist 待扩展。

6. 修正机制边界和本地数据升级
   - Champions SP 范围固定为单项 0-32、总量 66。
   - 速度线和队伍 benchmark 走 `calculateSpeedWithMechanismGate`。
   - 属性相性补齐 18 种攻击属性。
   - IndexedDB 升到 v2 并迁移旧 EV-like `statPoints`。
   - 刷新入口 disabled。
   - 状态：已完成并提交 `37e6b5f`。

7. 当前未提交 UI 实验和待收口事项
   - 伤害计算页条件控件已可点击，但结果仍阻断。
   - 速度线支持手动速度 SP。
   - 成员编辑 SP 改为点开式 picker。
   - 属性 PNG 图标已接入，但视觉不满意，下一轮回评并可能替换。
   - 状态：代码已实现且测试已复跑，待最终视觉取舍和提交。

## 本轮验收标准

- `npm test` 通过。
- `npm run test:visual` 通过。
- `npm run test:pwa` 通过。
- `npm run build` 通过。
- 页面级组件测试、PWA 离线自动化测试和移动端视觉回归最小集已完成，并覆盖 SP picker 展开态。
- 新增测试不依赖外部网络。
- 真实数据接入前，所有 mock / manual-review 数据仍不能产生强合法性或正式计算结论。
- `DEVELOPMENT_PROGRESS.md` 与本计划同步更新。

## 开工入口

建议从测试设施开始：

```bash
npm test
npm run test:visual
npm run test:pwa
npm run build
```

下一步先处理用户反馈的手机端信息层级与属性 badge 视觉；UI 收敛后，从 Mega 合法性数据继续：补 Reg M-A Mega allowlist seed、Mega Stone 映射、计算页 Mega 状态禁用和组队页道具校验。页面级组件测试已使用 React Testing Library / jsdom；PWA 离线和视觉回归测试已使用 Playwright，并配置为使用本机 Chrome，避免依赖 Playwright Chromium 下载。
