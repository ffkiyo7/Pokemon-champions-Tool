# 本轮开发总结 (2026-05-02)

基线：`e217523 Document local Chrome Playwright setup`
当前最新：`c29992b Fix local item icon rendering`

## 完成事项

### 1. 性格完整接入（PokeAPI → 25 条）

- 从 PokeAPI `/nature/` 端点拉取全部 25 个主系列性格
- 替换原来手写 6 个 seed 示例性格
- 每条含中文名、英文名、`up`（提升能力）、`down`（降低能力）、`neutral`（无修正标记）
- 脚本：`scripts/generate-natures.mjs`
- 数据：`src/data/seed/regMA/currentRuleCatalog.ts`
- 适配：`src/lib/currentRuleCatalog.ts` (`natureOptionLabel` 支持 neutral 显示)
- Source ref：`pokeapi-nature-data` (community, medium risk)

### 2. Mega 形态大批量接入（35 旧主系列 + 24 shell）

- 为 35 个旧主系列 Mega Evolution 生成完整 `PokemonForm` (stats / types / abilities / sprite / Mega Stone)
- 6 个 Champions 独有 Mega (Clefable / Victreebel / Starmie / Dragonite / Meganium / Feraligatr) 与初始 18 个 Champions Mega 共 24 个保留 shell，不伪造数据
- Mega sprite ID 使用正确的 PokeAPI 特定编号（非公式化 `dexNo+10000`）
- 脚本：`scripts/generate-mega-forms.mjs`
- 数据：`src/data/seed/regMA/mega-catalog.ts`
- 集成：`catalog.ts` 末尾后处理——`megaFormsByParentId` 合并入对应父 Pokemon，自动设置 `canMega: true`
- Mega Stone `applicablePokemonIds` 自动填充
- `megaAllowlist.ts` 的 `knownForms` 映射 35 条
- Source ref：`mega-form-competitive-data` (community, medium risk) + `pokeapi-pokemon-data`

### 3. 道具图片本地快照（PokéBase → 117 PNG）

- 当前 117 个 `legalInCurrentRule=true` 道具：30 个常规携带物 + 59 个 Mega Stone + 28 个树果
- 从 PokéBase Champions (`pokebase.app/pokemon-champions/items/{id}`) 逐个抓取真实图片，存入 `public/assets/items/`
- 全部 117 张均为真实 PNG，无缺损、无本地生成、无混源
- 两张图片临时缺失后已补充
- `catalog.ts` 的 `iconRef` 改为本地路径（`itemIconMapping`），不再使用 PokeAPI 热链
- `public/sw.js` 增加惰性预缓存：`Promise.allSettled` 方式，单个图片缺失不阻塞 SW 安装
- Clear Amulet / Assault Vest 不做任何处理（当前规则不可选）
- 生成脚本：`scripts/generate-item-icons.mjs`
- 映射文件：`src/data/seed/regMA/item-icon-mapping.ts`
- Source ref：`pokebase-champions-item-icons` (community, high risk)

### 4. PokemonAvatar onError 兜底

- `src/components/ui.tsx`：`<img>` 增加 `onError` handler，图片加载失败时显示文字首字符，避免浏览器原生破损图标
- 后续验收发现：本地 `/assets/items/*.png` 曾被旧逻辑当成文字 fallback，手机端道具图不显示
- 已修复为显式支持 `http(s)`、本地绝对路径、相对路径与 `data:image/*`
- fallback 改为 React 状态驱动，避免直接改 DOM 后与 React 渲染状态打架

### 5. 审计与测试

- 新审计测试："全部 117 个可选道具 iconRef 指向本地路径且文件实际存在，并且文件头是 PNG signature"
- 新组件测试：`PokemonAvatar` 收到 `/assets/items/choice-scarf.png` 必须渲染为 `<img>`；图片失败时才显示文字 fallback
- 新页面测试：图鉴道具页搜索"围巾"时，讲究围巾必须展示 `/assets/items/choice-scarf.png`
- `tsconfig.app.json` 排除 `**/*.test.ts` `**/*.test.tsx`，避免 Node API 类型报错

### 6. 招式 / learnset 第一阶段接入

- 脚本：`scripts/generate-champions-moves.mjs`
- 数据：`src/data/seed/regMA/move-catalog.ts`
- 来源：PokéBase Champions Pokémon Available Moves 页面，覆盖当前已接入 181 只基础形态 Pokémon
- PokeAPI 只补充中文名、中文说明与目标范围，不作为 Champions learnset 判断源
- 结果：528 个招式，11323 条 Pokémon-招式关系
- UI：图鉴详情页招式列表默认折叠，支持按属性 / 性质 / 威力排序；头像可点开大图
- 队伍页：小卡片显示携带物图片；编辑页招式 / 携带物改为搜索式选择

## 提交记录

| Commit | 内容 |
|---|---|
| `9aad7a5` | 性格完整接入（6 → 25） |
| `e5492dd` | 41→35 个 Mega forms，修复 6 个错误伪造 |
| `81fe2eb` | 修复 Mega sprite ID（`dexNo+10000` → 正确 ID） |
| `463337a` | PokemonAvatar onError fallback |
| `de05724` | 道具 iconRef + 性格 + Mega 集成提交 |
| `16e470c` | 117 个道具 PokéBase 本地快照 |
| `c29992b` | 修复本地道具图片渲染 + UI / audit 测试 |

## 验证状态

```bash
npm test      # 10 files / 59 tests ✅
npm run build # tsc + vite build ✅
npm run test:pwa # 2/2 (offline + visual regression) ✅
```

## 当前数据规模

| 类别 | 数量 | 状态 |
|---|---|---|
| Pokémon（基础形态）| 181 | ✅ |
| 特性 | 174 | ✅ 中文描述 |
| Mega 形态（完整数据）| 35 | ✅ 旧主系列 |
| Mega 形态（shell）| 24 | ⏳ Champions 新 Mega |
| 性格 | 25 | ✅ |
| 道具（含本地图片）| 117 | ✅ PokéBase 快照 |
| 道具（不可选）| 2 | — Clear Amulet, Assault Vest |
| 招式 | 528 | ✅ PokéBase learnset 第一阶段 |
| Learnset 关系 | 11323 | ✅ 181 只已接入 Pokémon |
| 地区形态 | 0/32 | ⏳ |

## 剩余工作

- 32 只地区形态数据接入
- 地区形态 / Champions 新 Mega form 的 learnset join
- PLAN0502.md 剩余任务（伦琴猫、知识问答 / tips、地区形态后续 join）
