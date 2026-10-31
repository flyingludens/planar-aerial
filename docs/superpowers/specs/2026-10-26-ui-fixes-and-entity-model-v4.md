# UI 六项修复与实体数据模型 v4 — 设计

日期：2026-10-26
状态：已确认（用户逐节确认）

## 范围

两部分：六个 UI 修复（client.js 为主），实体数据模型升级（lib/mosaic.js、lib/model.js、画像与提示词）。
两部分相互独立，可分开实施与验证。

## 第一部分：UI 六项

### 共同基础：token 组（无硬编码要求）

**z-index 层级表**，定义在 `.st-shell` 变量块，全站引用：

| 变量 | 值 | 层 |
|---|---|---|
| `--st-layer-rail` | 30 | 目录 rail 与遮罩 |
| `--st-layer-menu` | 60 | 下拉菜单、选择列表 |
| `--st-layer-backdrop` | 70 | 模糊遮罩（调查板、抽屉共用） |
| `--st-layer-mosaic` | 72 | 调查板板面 |
| `--st-layer-drawer` | 75 | 抽屉（必须盖过已开的调查板） |
| `--st-layer-status` | 80 | 状态栏弹层 |

替换现有散落值：`st-rail`(30)、`st-rail-scrim`(29)、`st-title-list`(60)、`st-backdrop`(60)、
`st-sheet-backdrop`(70)、`st-mosaic-backdrop`(70)、`st-status-pop`(80)、各菜单(40/60)。
规则照旧：同一个量出现两次就必须抽出来。

**动效时长**：`--st-motion-open:180ms`（收编现有进入动画时长）、`--st-motion-close:140ms`（收起比展开快）。

### 1. 目录按钮缩进

`st-titlebar` 左 padding 拆两段：按钮前用 `--st-titlebar-lead`
（`max(var(--st-space-16), calc(var(--dsh-frame-leading-clearance) + var(--st-space-8)))`，现有值、新位置），
标题前回落到 `--st-space-8`。目录按钮不再贴帧边。

### 2. 弹层层级（调查板打开时其它弹窗盖在前面）

层级表即修复：`--st-layer-drawer`(75) > `--st-layer-mosaic`(72) > `--st-layer-menu`(60)。
顺序是声明的，不再依赖 DOM 挂载顺序。

### 3. 快捷键显示顺序

原则一条：**可见文本一律 Option 在前，再 Command，再 Shift**。

- `chordLabel`（约 client.js:695）：拼接顺序 `⌥ → ⌘ → ⇧`（Windows `Alt+ → Ctrl+ → Shift+` 不变）
- `resolveGestures` 的文字 hint：`Option+Command+Shift` 顺序
- 修哪处以实际渲染字符串为准；锁这些字符串的测试同步更新

### 4. 书库书卡质感

`st-book-card` 套用调查板卡片同款三件套：

- hairline 边框（可见 token；不用深色下不可见的 `--dsw-alias-border-l4` 画主边）
- 分层阴影 `--dsw-shadow-lv2`，hover 升 `--dsw-shadow-lv3`
- 顶部 1px 内高光（现有 `st-mosaic-sheet` 的做法）

hover 附加 `translateY(-1px)`。间距、圆角全部引用现有 `--st-space-*` / `--st-radius-*`。

### 5. 调查板点空白收回

`st-mosaic-backdrop` 的 `inset` 底部从 `--st-mosaic-dock-clearance` 改为 0，
点击空白覆盖区扩到整个面板；dock 回答区 z-index 在 backdrop 之上不受影响
（实施时验证 dock 现有 z-index，必要时显式提到 `--st-layer-mosaic` 之上）。
板面本体已有 `stopPropagation`，点板面不误关。

### 6. 开合动画

共用一个 `useClosingAnimation` hook：关闭时先标记"关闭中"，播放退出动画
（透明度 + 位移，方向与进入对称），`--st-motion-close` 后真正卸载。
应用到四处：目录 rail、参考抽屉（Drawer）、调查板（MosaicSheet）、sheet。
Escape 与点空白关闭走同一路径。测试环境（同步卸载的渲染 harness）下退化为立即卸载。

### UI 部分验证

- `node --check client.js`（样式改动后立即查，模板字符串反引号禁忌）
- `node --test --test-force-exit`
- 屏幕上的实际效果由用户确认（本机看不到运行中的面板）

## 第二部分：实体数据模型 v4

### 类型：五种 kind

| kind | 中文 |
|---|---|
| `character` | 角色 |
| `place` | 地点 |
| `faction` | 组织 |
| `item` | 物品 |
| `event` | 事件 |

不做兼容别名：`card` 从 normalize 白名单里删除，读取时不再识别。
旧数据不值得为它保留一条转换路径——书库在开发期可以随时重建。

### 统一骨架（五类共有）

```js
{
  id, kind, name,
  aliases: [],            // 别名、译名、旧称
  summary: '',            // 一句话简介：卡片正面、digest、上下文层读这个
  description: '',        // 具体描述：多段设定资料，详情页与画像 prompt 用，不进上下文摘要
  tags: [],
  portrait: '',           // portraits 目录的相对路径（沿用）
  statuses: [],           // {id, label}，沿用现有机制
  notes: '',              // 作者私人备忘（区别于 description：那是设定资料）
  custom: [{ id, label, value }],   // 预设字段装不下的都在这里，UI 可增删改
  // —— 板面机制字段，原样保留 ——
  source, evidence, basedOn, layout,
}
```

三个文本字段的分工：

| 字段 | 内容 | 谁读 |
|---|---|---|
| `summary` | 一句话，卡片正面 | 上下文层、digest、卡片正面 |
| `description` | 具体描述，几段都行 | 卡片详情页、`buildPortraitPrompt`（可选） |
| `notes` | 作者私注 | 只有作者 |

上下文层**不读 description**——上下文预算不被长描述撑爆，这是 summary/description 分家的全部意义。

### 类型专属字段（全部可选）

- **character**：`gender` `age` `nationality`（最常用特征，独立字段）；`appearance` 外貌、
  `personality` 性格、`motivation` 动机、`arc` 人物弧光；`role` 保留（故事职能：主角/反派/导师）
- **place**：`location`（隶属，自由文本）、`atmosphere`、`controlledBy`（faction 的 id）
- **faction**：`purpose` 宗旨、`base`（place 的 id）、`leader`（character 的 id）、`members`（id 数组）
- **item**：`origin` 来历、`holder`（实体 id）、`significance` 意义
- **event**：`when`（自由文本，不做结构化日期）、`where`（place 的 id）、
  `participants`（id 数组）、`consequence` 后果

### 引用规则

所有跨类型引用存**实体 id，不存名字**，与 edges 的 id 协议一致；
normalize 时断链（目标 id 不存在）静默置空，与现有 edge 处理一致。

### 连线与字段的分工

edges（板面关系线，带 beliefs、可溯源）不替代字段引用：字段引用是卡片属性
（如物品的持有者），edges 是画出来的关系。检查本章的提案可以两者都提。

### 旧数据：不迁移，不兼容（已确认，勿再反复）

- `card` kind 直接删除，旧卡片在读取时被 normalize 丢弃——与"数据完全不重要"的既定口径一致
- 不写迁移代码：没有 card→place/faction/item 的推断、没有 body→summary/description 的拆分
- `schemaVersion` 直接写 4，`normalizeBook` 不保留 v3 兼容分支
- 开发期验证方式：删掉旧书库目录重建，或在板面上重新建卡

### 联动改动

- `normalizeEntity`：五种 kind 白名单、统一骨架 + 专属字段、custom 规整；未知 kind（含 card）丢弃
- `mosaicDigest`：每类一行；character 行带 gender/age 等最常用特征
- `buildPortraitPrompt`：新类型的画像语义（place 是场景、item 是静物、faction 可出徽记或群像）
- 检查本章 / ask / chat 的提示词补五种类型说明
- `sectionChapterCast` 等上下文层不改（读 name/summary，迁移后自动工作）

### 明确不做

- 字段级必填校验（小说不是表单）
- 自定义 kind
- 结构化日期

### 数据模型部分验证

- `lib/mosaic.js` 单测：新字段 normalize、断链置空、custom 规整、未知 kind（含 card）丢弃
- 画像 prompt 测试：新类型的提示词语义
- 全量 `node --test --test-force-exit`

## 实施顺序建议

UI 六项先行（相互独立、可单独验证），数据模型随后（涉及 lib + client 两端）。
每项改动独立提交，便于回退。
