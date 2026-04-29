# 下一轮开发准备

更新时间：2026-04-29

## 当前状态

- `master` 本地领先 `origin/master` 2 个提交，最新提交：`3ef9bf0 Add Reg M-A allowlist seed`。
- 本地已有未提交开发改动：首批 6 只真实 Pokemon catalog 与真实头像。
- `npm test` 通过：9 个测试文件，40 个用例。
- `npm run test:visual` 通过：1 个 Playwright 移动端视觉回归用例，8 张基线截图。
- `npm run test:pwa` 通过：2 个 Playwright 用例，包含 PWA 离线与移动端视觉回归。
- `npm run build` 通过：生产包可生成。
- 手机端核心体验已完成一轮修正：多队伍切换、队伍成员缩略卡、展开 / 收起、六项 SP 编辑、示例能力值、计算页攻防双方选择和全图鉴搜索。
- 当前主要风险仍集中在真实 Reg M-A 数据、伤害公式兼容性和完整 learnset 复核。
- Reg M-A 将于 2026-06-17 01:59 UTC 结束；下一轮预留 Reg M-B 数据注册表 / 切换设计占位，避免规则切换时散改 seed re-export。
- 用户已在手机端发现若干待修 bug，具体条目待下次会话补充；下一轮优先进入 bug triage，再继续扩数据。

## 明日优先事项

1. 先收集并复现用户发现的手机端 bug。
2. 对每个 bug 补最小回归测试或 Playwright 视觉覆盖。
3. 修复后跑 `npm test`、`npm run build`、`npm run test:pwa`。
4. 确认 6 只真实 Pokemon catalog 与真实头像没有回退。
5. bug 修完后再继续补 Reg M-A Mega allowlist seed。

## 建议本轮目标

建议下一轮定为：**真实数据接入前的回归保护与数据骨架轮**。

核心目标不是继续堆 UI，而是把已经确认的手机端闭环保护起来，同时建立真实数据接入所需的 source ref / provenance 骨架。这样后续把 mock seed 替换成真实 Reg M-A allowlist 时，不会把 UI、合法性和计算阻断边界一起打乱。

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

## 本轮验收标准

- `npm test` 通过。
- `npm run test:visual` 通过。
- `npm run test:pwa` 通过。
- `npm run build` 通过。
- 页面级组件测试、PWA 离线自动化测试和移动端视觉回归最小集已完成。
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

下一步先处理用户反馈的手机端 bug；bug 收敛后，从第 5 项的扩展工作继续：补 Reg M-A Mega allowlist seed，并扩大 Pokemon catalog join 批次。页面级组件测试已使用 React Testing Library / jsdom；PWA 离线和视觉回归测试已使用 Playwright，并配置为使用本机 Chrome，避免依赖 Playwright Chromium 下载。
