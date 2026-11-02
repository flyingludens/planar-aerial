# fang-style 设计文档

日期：2026-11-02
状态：已与作者确认范围与命名规则，待实施

## 目标

把本插件里不认识「书」「调查板」的 UI 层——通用组件、通用 hook、设计令牌、应用框架样式——抽成一个独立、可复用的样式库 **fang-style**，放在仓库外的独立文件夹，本项目改为引用它。未来项目直接拿库起步。

## 已确认的决策

| 决策点 | 结论 |
|---|---|
| 本项目是否改用库 | 是，真重构，不是复制一份 |
| 库的位置 | `/Users/fang/Projects/fang-style`（新建 Projects 文件夹，与仓库平级） |
| 引用方式 | 本项目 package.json 加 `"fang-style": "file:../Projects/fang-style"`，npm 软链进 node_modules，代码 `import { Drawer } from 'fang-style'` |
| 内部命名前缀 | 类名 `fang-`，CSS 变量 `--fang-` |
| 抽象范围 | 通用组件 + 通用 hook + 设计令牌 + 应用框架，全套 |

## 库的形态与结构

纯 ES 模块，无构建步骤，源文件即交付物。自带最小 package.json（`name: fang-style`、`type: module`、`exports` 入口、`peerDependencies: react`——React 是外部依赖，库不打包它）。

```
Projects/fang-style/
  package.json
  src/
    index.js          — 唯一出口，汇总导出
    styles.js         — 按顺序拼样式表（令牌 → 框架 → 组件）
    tokens.css.js     — 设计令牌（--fang-*）
    frame.css.js      — 应用框架：shell / root / col / scroll / titlebar / rail / gap 系列
    components.css.js — 组件样式：按钮、弹窗、抽屉、下拉、列表、分段、提示
    hooks.js          — useDismiss / usePersisted / useClosingAnimation / useDockState
    widgets/
      overlays.js     — Drawer、Dialog、ConfirmDialog（弹层一族）
      dropdown.js     — Dropdown、Chevron
      file-button.js  — FileButton
      seg-group.js    — SegGroup
      list.js         — List、ListRow、SplitPane
      tooltip.js      — TooltipLayer
```

## 命名规则

1. **前缀与形状**：CSS 类一律 `fang-` 前缀、块_部位_状态三段式（`fang-dropdown-list`）；CSS 变量一律 `--fang-`、`类别-名称[-刻度]`；React 组件大驼峰不加前缀；hook `use` + 动词；文件短横线小写与主导出同名。
2. **不与系统命名近似**：不出现裸 `.button`、`.dialog` 这类与 HTML/ARIA 撞脸的名字；不模仿宿主 `--dsw-*` 构词；状态用 `data-*` 属性（`data-open`、`data-active`），不加状态类。
3. **一个概念一个词**：内距 `inset`、宽度 `width`、文字色 `ink`、表面色 `surface`、描边浓度 `ink-edge`；数字刻度用数字（`--fang-space-8`），角色刻度用角色名（`--fang-text-md`、`--fang-width-reading`）。
4. **随搬家修掉的含糊名**：
   - `--st-w-*` → `--fang-width-narrow/compact/medium/reading/wide/max`（`w` 是缩写）
   - `.st-mid` → `.fang-main`
   - `--st-seg-h`（现有重复声明，28/26 两个值）→ `--fang-seg-height`，修掉冲突
   - `--st-btn-h-*` → `--fang-btn-height-*`

## 抽象边界

**进库**：`shared/ui.js` 全部组件；`shared/styles.js` 的令牌表、框架段落与跨页面共享约定；`shared/hooks.js` 的 `useDismiss`、`usePersisted`、`useClosingAnimation`、`useDockState`（含 `DOCK_STORE`）。

**留在项目**：`useBookData` 等认识「书」的 hook；业务图标（书本、拼图板、笔记本等 SVG）；全部页面组件与页面样式；`shared/react.js`（CJS 边界的 require 是本项目构建契约）；`theme.js`（Electron 宿主主题模拟）。

**进库时的 API 通用化**：`Drawer` / `Dialog` / `ConfirmDialog` 不再接 `t` 翻译函数，改接普通字符串 props（`closeLabel` 等），项目调用处传 `t('action.close')`。

**令牌与宿主解耦**：库的令牌用自己的完整默认值，不认识 `--dsw-*`；本项目在自己的样式里加一小段桥接，把 `--dsw-alias-*` 覆盖映射到对应 `--fang-*` 上。宿主适配是项目的事。

## 本项目的改动

- `package.json` 加 `file:` 本地依赖；`npm install` 建立软链。
- 删 `shared/ui.js`；十几处导入改指 `fang-style`。
- `shared/styles.js` 拆分：令牌与框架段迁走，剩余按规则归类。
- `styles.js` 拼接顺序：先 fang-style 的样式表，后项目自己的 css 模块。
- 全项目 `--st-*` 变量引用批量替换为 `--fang-*`（脚本替换后逐段看 diff，再跑测试）。
- AGENTS.md 中指向 `shared/ui.js` 的规则更新为 fang-style；现存三个弹窗例外（rail-tools、review、tabs）不受影响。

## 验证

- 每步 `node --check`；样式改动跑 `node --test --test-force-exit tests/client-render.test.js`。
- 收尾全量 `npm test`；`npm run lint`（动了依赖与文件位置）。
- 跑 AGENTS 中的重复声明扫描，确认令牌搬家未产生同块重复。
- 测试文件中被搬走类名的断言（`st-dropdown`、`st-sheet`、`st-btn`、`st-list-row` 等）同步改 `fang-`，预计涉及约 4 个测试文件。

## 风险

改动面约 20 个组件文件、20+ css 模块、若干测试。最大风险是批量替换误伤（吃空格、自引用、命中无关文本），对策：替换后先 `git diff` 逐段看，再跑 `client-render` 测试与重复声明扫描。
