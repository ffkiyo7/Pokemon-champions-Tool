# 移动端视觉回归最小集

更新时间：2026-05-01

## 当前策略

- 使用 Playwright 截图断言覆盖 390px 移动视口。
- 使用本机 Chrome channel，避免依赖 Playwright Chromium 下载。
- 视觉测试阻止 service worker，减少旧缓存对截图基线的影响。
- 基线截图保存在 `tests/pwa/visual.spec.ts-snapshots/`。
- 当前视觉集是 smoke coverage，属性 badge 已收敛为项目化中文胶囊；本地 PNG 属性图标不再作为默认视觉方案。

## 覆盖页面

- 组队页缩略态：`01-team-compact.png`
- 组队页展开态：`02-team-expanded.png`
- 成员编辑 bottom sheet：`03-member-editor.png`
- 成员编辑 SP picker 展开态：`03-member-editor-sp-picker.png`
- 计算页选择器入口：`04-calculator-selector.png`
- 速度线页面：`05-speed-line.png`
- 图鉴页面：`06-dex.png`
- 图鉴详情页：`06-dex-detail.png`
- 图鉴属性筛选：`06-dex-type-filter.png`
- 设置页面：`07-settings.png`
- 当前规则详情：`08-rule-detail.png`

## 自动化命令

```bash
npm run test:visual
```

更新基线时使用：

```bash
npm run test:visual -- --update-snapshots
```

完整 PWA 回归会同时执行离线测试和视觉测试：

```bash
npm run test:pwa
```

## 已知边界

- 当前基线只覆盖 390px 移动视口，后续如需要平板或窄屏，可增加独立 project。
- 截图覆盖的是核心页面 smoke set，不替代真实数据接入后的数据准确性测试。
- 速度线图表内 benchmark 标记只显示点位，详细名称通过列表和点击后的详情查看，避免移动端长文本重叠。
- 成员编辑页 SP 主界面只显示六项摘要；具体调整在底部 picker 内完成，以减少 390px 视口的纵向拥挤。
- 属性 badge 使用固定尺寸中文胶囊，截图已覆盖计算页、速度线、图鉴列表、图鉴详情和属性筛选。
- 速度线截图覆盖支持 Mega 的 Pokémon，形态选择器可展示原始 / Mega 形态；不支持 Mega 的 Pokémon 不显示“原始形态”标签。
