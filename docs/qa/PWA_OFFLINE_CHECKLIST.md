# PWA 离线验收清单

更新时间：2026-04-26

## 当前策略

- `public/manifest.webmanifest` 提供 PWA 安装元信息。
- `public/sw.js` 预缓存 app shell：`/`、`/index.html`、`/manifest.webmanifest`、`/icon.svg`。
- 首次在线访问后，service worker 会缓存同源 GET 响应，包括 Vite 构建产物。
- IndexedDB 保存队伍、偏好和 benchmark 收藏，离线时仍可读取。

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
- [ ] 恢复在线，点击刷新数据，确认失败/成功状态不会清空本地数据。

## 当前已知限制

- 手写 service worker 采用 runtime cache，不做构建时 precache manifest。
- 首次访问前不能离线打开。
- 若浏览器清除站点数据，IndexedDB 队伍和收藏会丢失。
- 真实数据源接入前，离线图鉴仍来自 seed data。

## 自动化候选

- [ ] 用 Playwright 增加 service worker 注册检测。
- [ ] 用浏览器上下文模拟 offline，验证刷新后 app shell 存活。
- [ ] 用 IndexedDB fixture 验证离线队伍读取。
