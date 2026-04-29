# PWA 离线验收清单

更新时间：2026-04-30

## 当前策略

- `public/manifest.webmanifest` 提供 PWA 安装元信息。
- `public/sw.js` 预缓存 app shell：`/`、`/index.html`、`/manifest.webmanifest`、`/icon.svg`。
- 首次在线访问后，service worker 会缓存同源 GET 响应，包括 Vite 构建产物。
- IndexedDB 保存队伍、偏好和 benchmark 收藏，离线时仍可读取。
- IndexedDB 当前版本为 v2；从 v1 打开时会迁移旧 EV-like `statPoints` 到 Champions SP。
- 真实远程数据源尚未接入，刷新入口在当前版本保持 disabled，并显示“暂不支持远程刷新 / 本地缓存可用”。

## 手动验收步骤

- [ ] 在线打开 `http://127.0.0.1:5173/`。
- [ ] 等待页面完整加载，并确认浏览器 DevTools 中 service worker 已注册。
- [ ] 创建或编辑一支队伍。
- [ ] 收藏一个 benchmark。
- [ ] 切换到离线模式。
- [ ] 刷新页面，确认 app shell 可打开。
- [ ] 进入组队页，确认本地队伍仍可见。
- [ ] 进入速度线页，确认收藏 benchmark 仍可见。
- [ ] 进入设置页，确认缓存状态显示队伍数量、收藏数量和缓存规则。
- [ ] 恢复在线，确认刷新按钮仍为 disabled，文案为当前版本暂不支持远程刷新，本地数据不被清空。

## 当前已知限制

- 手写 service worker 采用 runtime cache，不做构建时 precache manifest。
- 首次访问前不能离线打开。
- 若浏览器清除站点数据，IndexedDB 队伍和收藏会丢失。
- 真实数据源接入前，离线图鉴仍来自 seed data。
- 当前版本不提供远程刷新能力；不应出现“刷新失败”的可点击失败入口。

## 自动化候选

- [x] 用 Playwright 增加 service worker 注册检测。
- [x] 用浏览器上下文模拟 offline，验证刷新后 app shell 存活。
- [x] 用 IndexedDB fixture 验证离线队伍读取。
- [x] 验证离线状态下 benchmark 收藏仍可读取。
- [x] 验证 IndexedDB v1 -> v2 迁移会把 `252 -> 32`、`4 -> 1` 的旧 EV-like 输入迁移为 SP。

自动化命令：

```bash
npm run test:pwa
```

当前 Playwright 配置使用本机 Chrome，避免依赖 Playwright Chromium 下载。
