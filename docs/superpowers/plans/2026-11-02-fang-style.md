# fang-style 抽取实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把本插件不认识业务的 UI 层（通用组件、通用 hook、设计令牌、应用框架样式）抽成独立库 `/Users/fang/Projects/fang-style`，本项目改为引用它，全部测试保持绿。

**Architecture:** 先建库（全新文件，项目不动，测试保持绿），再分三步切换项目（组件 → 样式/令牌 → hooks），最后删旧代码并更新项目规则文档。库是纯 ESM、无构建步骤；本项目用 `file:` 本地依赖引用，esbuild 打进 client.js，React 保持外部依赖。

**Tech Stack:** 原生 ES Modules、React 19（peer dependency）、esbuild（仅项目侧打包）、node --test。

**设计文档:** `docs/superpowers/specs/2026-11-02-fang-style-design.md`（命名的完整依据在这里）

## Global Constraints

- 样式写在 JS 模板字符串里，**注释里不许出现反引号**——提到变量名直接写 --fang-space-8，不加反引号（本项目 AGENTS.md 的教训，库内同样适用）。
- 批量替换脚本必须**先 `git diff` 逐段看，再跑测试**（AGENTS.md：替换吃空格、自引用、误伤注释都发生过）。
- 测试命令一律 `node --test --test-force-exit …`；项目已把它写进 package.json 的 `npm test`。
- 本项目 CSS 里不许写裸数字；搬进库的规则一律读 --fang-* 令牌。
- 在本项目提交，只提交本计划涉及的文件——**工作区里已有作者未提交的改动（AGENTS.md、client.js、lib/ 等），不许 `git add -A`，逐文件 add**。
- 库在仓库外，**不进本仓库的 git**；库自身要不要 git init 由作者之后决定，本计划不做。
- 改任何文件前先读它；每个 Task 结束跑该 Task 指定的验证命令，绿了才提交。

## 全局改名对照表（所有 Task 共用）

### 类名（JSX className 与 CSS 选择器同步改）

| 旧 | 新 | 说明 |
|---|---|---|
| st-shell | fang-shell | 框架根 |
| st-root | fang-root | |
| st-col | fang-col | |
| st-mid | fang-main | 主内容列 |
| st-mid-body | fang-main-body | |
| st-scroll | fang-scroll | |
| st-titlebar | fang-titlebar | |
| st-title | fang-title | |
| st-rail-layer / st-rail / st-rail-scrim / st-rail-collapsed / st-rail-toggle | fang-rail-layer / fang-rail / fang-rail-scrim / fang-rail-collapsed / fang-rail-toggle | 先替换带后缀的长名，最后替换裸 st-rail |
| @keyframes st-rail-in / st-rail-out | fang-rail-in / fang-rail-out | |
| st-gap-under-row / -under-hint / -over-row / -over-section | fang-gap-under-row / -under-hint / -over-row / -over-section | |
| st-spacer | fang-spacer | |
| st-row | fang-row | **词边界替换**：项目里有 st-row-height 等无关 token 和 st-row-xxx 类 |
| st-muted | fang-muted | |
| st-btn | fang-btn | 词边界：st-btn-primary/-ghost/-xl/-icon 跟随变 fang-btn-*；**st-btn-flow、st-session-btn、st-session-label 留在项目不改** |
| st-danger | fang-danger | |
| st-dropdown / -button / -value / -list / -option | fang-dropdown / -button / -value / -list / -option | |
| st-file-button / st-file-input | fang-file-button / fang-file-input | |
| st-sheet-backdrop | fang-backdrop | 与 st-backdrop 统一 |
| st-backdrop | fang-backdrop | |
| st-sheet / -head / -title / -body | fang-drawer / -head / -title / -body | 类名跟组件名 Drawer 走 |
| st-dialog / -head / -title / -body / -actions / -scroll / -panel | fang-dialog / -head / -title / -body / -actions / -scroll / -panel | st-dialog-textarea **留在项目** |
| st-seg / st-seg-item | fang-segmented / fang-segmented-item | 组件改名 Segmented |
| st-list / st-list-row / st-list-row-meta | fang-list / fang-list-row / fang-list-row-meta | |
| st-split / -list / -detail / -detail-head / -detail-title / -detail-meta / -detail-body | fang-split / -list / -detail / -detail-head / -detail-title / -detail-meta / -detail-body | |
| st-tip | fang-tip | |
| st-seat-chevron | fang-chevron | CSS 从 composer.css.js 迁入库 |
| st-seat-cell-chevron | fang-chevron-right | 同上；composer.css.js 里 `.st-seat-back .st-seat-cell-chevron` 选择器前半段不改 |

**留在项目不改的类**：st-card、st-book-card、st-mosaic-*、st-ctx-*、st-warn、st-scan-*、st-find-input、st-chat-input、st-input、st-session-*、st-btn-flow、st-icon-xs/sm/md/lg、st-bar-icon、st-card-action-icon、st-add/st-del/st-insert、st-welcome-*、st-notes-*、st-model*、st-status*、其余全部页面类。

### CSS 变量（库令牌，定义迁入 tokens.css.js，全项目引用同步改）

| 旧 | 新 |
|---|---|
| --st-accent / --st-on-accent / --st-bg | --fang-accent / --fang-on-accent / --fang-bg |
| --st-shade / --st-highlight | --fang-shade / --fang-highlight |
| --st-text-primary / -secondary / -tertiary | --fang-ink-primary / -secondary / -tertiary |
| --st-space-2/4/8/12/16/24 | --fang-space-2/4/8/12/16/24 |
| --st-inset-xs/sm/md/xl | --fang-padding-xs/sm/md/xl |
| --st-radius-xs/sm/md/lg/panel/pill | --fang-radius-xs/sm/md/lg/panel/pill |
| --st-surface / --st-surface-high | --fang-surface / --fang-surface-high |
| --st-selected-fill / --st-hover-fill / --st-active-fill / --st-list-hover | --fang-selected-fill / --fang-hover-fill / --fang-active-fill / --fang-list-hover |
| --st-ink-whisper / -hair / -edge / -faint | --fang-ink-whisper / -hair / -edge / -faint |
| --st-focus-ink | --fang-focus-ink |
| --st-font-family / --st-font-mono / --st-font-weight-normal/medium/strong | --fang-font-family / --fang-font-mono / --fang-font-weight-* |
| --st-text-sm/md/lg/xl | --fang-font-size-sm/md/lg/xl |
| --st-text-sm-leading 等四个 / --st-line-height-ui / --st-line-height-reading | --fang-line-height-sm/md/lg/xl / --fang-line-height-ui / --fang-line-height-reading |
| --st-icon-xs/sm/md/lg | --fang-icon-xs/sm/md/lg |
| --st-w-narrow/compact/medium/reading/wide/max | --fang-width-narrow/compact/medium/reading/wide/max |
| --st-btn-h / --st-btn-h-xl/lg/sm | --fang-btn-height / --fang-btn-height-xl/lg/sm |
| --st-row-height / --st-row-height-compact / --st-hit-target | --fang-row-height / --fang-row-height-compact / --fang-hit-target |
| --st-hairline | --fang-hairline |
| --st-card-shadow / --st-card-shadow-lift / --st-card-motion | --fang-card-shadow / -lift / --fang-card-motion |
| --st-panel-shadow-left / -right / --st-panel-rim | --fang-panel-shadow-left / -right / --fang-panel-rim |
| --st-motion-open / --st-motion-close | --fang-duration-open / --fang-duration-close |
| --st-layer-rail/menu/drawer/status/modal | --fang-layer-rail/menu/drawer/status/modal |
| --st-welcome-title? **否** | welcome/glyph/mcp/canvas/seg-0..7/mosaic/card-w/gallery/thread/pin/fade/session/flow/send 等业务令牌**全部留在项目**，名字不动 |
| --st-sheet-max | --fang-drawer-max（默认值 var(--fang-width-wide)） |
| --st-dialog-w / --st-dialog-max-h | --fang-dialog-width（默认 var(--fang-width-compact)）/ --fang-dialog-max-h |
| --st-split-list-w / --st-split-min-h | --fang-split-list-w / --fang-split-min-h |
| --st-rail-w | --fang-rail-w |
| --st-titlebar-height | --fang-titlebar-height |
| --st-shelf-gutter | --fang-frame-gutter（shelf 是项目词） |
| --st-seg-h（重复定义 28px/26px） | --fang-segmented-height（28px，修掉冲突） |
| --st-board-gap / --st-board-inset / --st-board-inset-compact | **留在项目**，值改为 var(--fang-space-12) / var(--fang-space-16) / var(--fang-space-12) |

**回退调色板 --st-fallback-\* 取消**：库令牌直接用深色主题的值做默认值（ink-primary #f2f2f3、bg-layer-1 #1c1c1e、bg-layer-2 #2c2c2e、border-hair #ffffff14、border-edge #ffffff1f、border-strong #ffffff29），不再二级回退。新增库令牌 --fang-bg-layer-1/2、--fang-border-hair/edge/strong、--fang-focus-ring-width（默认 2px）。

**宿主桥接**（放本项目 shared/styles.js 顶部，把 dsh 的变量映射到库令牌；库自身不认识 --dsw-*）：

```js
export const CSS_BRIDGE = `
      .fang-shell{
        --fang-ink-primary:var(--dsw-alias-label-primary,#f2f2f3);
        --fang-ink-secondary:var(--dsw-alias-label-secondary,#b8b8bd);
        --fang-ink-tertiary:var(--dsw-alias-label-tertiary,#8e8e93);
        --fang-bg-layer-1:var(--dsw-alias-bg-layer-1,#1c1c1e);
        --fang-bg-layer-2:var(--dsw-alias-bg-layer-2,#2c2c2e);
        --fang-border-hair:var(--dsw-alias-border-l2,#ffffff14);
        --fang-border-edge:var(--dsw-alias-border-l3,#ffffff1f);
        --fang-border-strong:var(--dsw-alias-border-l4,#ffffff29);
        --fang-radius-xs:var(--dsw-radius-xs,4px);
        --fang-radius-sm:var(--dsw-radius-sm,8px);
        --fang-radius-md:var(--dsw-radius-md,12px);
        --fang-radius-lg:var(--dsw-radius-lg,16px);
        --fang-radius-panel:var(--dsw-radius-panel,28px);
        --fang-focus-ring-width:var(--dsw-focus-ring-width,2px);
      }
`
```

库内令牌定义的引用规则：tokens.css.js 里所有 var() 引用只能指向 --fang-* 或字面量，**不许出现 --dsw-**。原来写在令牌里的 var(--dsw-radius-xs,4px) 改成 4px，由桥接负责接宿主。

---

### Task 1: 库骨架、项目依赖、冒烟测试（先红）

**Files:**
- Create: `/Users/fang/Projects/fang-style/package.json`
- Create: `/Users/fang/Projects/fang-style/src/index.js`（本 Task 只有占位导出）
- Create: `tests/fang-style.test.js`
- Modify: `package.json`（项目根，加一条依赖）

**Interfaces:**
- Produces: npm 包 `fang-style`，入口 `import ... from 'fang-style'`；后续所有 Task 的 import 都走这个名字。

- [ ] **Step 1: 写冒烟测试（此时期望失败）**

创建 `tests/fang-style.test.js`：

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'

test('fang-style 可以被解析并导入', async () => {
  const fang = await import('fang-style')
  assert.equal(typeof fang, 'object')
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `node --test --test-force-exit tests/fang-style.test.js`
Expected: FAIL，`Cannot find package 'fang-style'`

- [ ] **Step 3: 建库骨架**

`mkdir -p /Users/fang/Projects/fang-style/src/widgets`

创建 `/Users/fang/Projects/fang-style/package.json`：

```json
{
  "name": "fang-style",
  "version": "0.1.0",
  "description": "fang 的通用 UI 组件与样式令牌库",
  "type": "module",
  "exports": { ".": "./src/index.js" },
  "files": ["src"],
  "peerDependencies": { "react": ">=18" }
}
```

创建占位 `/Users/fang/Projects/fang-style/src/index.js`：

```js
/** fang-style 的唯一出口。各部分就位后在这里汇总导出。 */
export const FANG_CSS = ''
```

- [ ] **Step 4: 项目加依赖并安装**

项目根 `package.json` 的 `dependencies` 里加一行（保持键序，react 之前）：

```json
    "fang-style": "file:../Projects/fang-style",
```

Run: `npm install`
Expected: `node_modules/fang-style` 出现，且是指向 `../Projects/fang-style` 的软链（`ls -la node_modules/fang-style` 核对）。

- [ ] **Step 5: 冒烟测试转绿**

Run: `node --test --test-force-exit tests/fang-style.test.js`
Expected: 第一条 FAIL（组件还没导出）、第二条 FAIL（FANG_CSS 为空）——此时**允许红**，Task 2 完成后转绿。若 `Cannot find package 'fang-style'` 仍在，先修软链再继续。

- [ ] **Step 6: 提交**

```bash
git add package.json package-lock.json tests/fang-style.test.js
git commit -m "build: 引入本地依赖 fang-style，加冒烟测试"
```

---

### Task 2: 库内容就位（令牌、框架、组件、hooks）

**Files:**
- Create: `/Users/fang/Projects/fang-style/src/react.js`
- Create: `/Users/fang/Projects/fang-style/src/storage.js`
- Create: `/Users/fang/Projects/fang-style/src/tokens.css.js`
- Create: `/Users/fang/Projects/fang-style/src/frame.css.js`
- Create: `/Users/fang/Projects/fang-style/src/components.css.js`
- Create: `/Users/fang/Projects/fang-style/src/styles.js`
- Create: `/Users/fang/Projects/fang-style/src/hooks.js`
- Create: `/Users/fang/Projects/fang-style/src/widgets/{overlays,dropdown,file-button,segmented,list,tooltip}.js`
- Modify: `/Users/fang/Projects/fang-style/src/index.js`

**Interfaces:**
- Consumes: 源文件 `src/client/shared/ui.js`、`src/client/shared/styles.js`、`src/client/shared/hooks.js`、`src/client/shared/storage.js`、`src/client/panel/composer.css.js`（两个 chevron 类）。
- Produces: `fang-style` 的最终导出面（冒烟测试点名的全部名字 + FANG_CSS）。导出名与签名是 Task 3-5 的契约。

- [ ] **Step 1: react 适配器与存储助手（全新小文件，全文如下）**

`/Users/fang/Projects/fang-style/src/react.js`：

```js
/**
 * React 与 createElement 别名。
 *
 * 库用标准 ESM import 取 React，宿主决定 React 从哪来（打包器 external、
 * 或宿主自己的模块表）。本项目在 esbuild 里把 react 列为 external，
 * 恰好落在宿主交给 factory 的 require 上。
 */
import React from 'react'

export const h = React.createElement
export { React }
```

`/Users/fang/Projects/fang-style/src/storage.js`（从 `src/client/shared/storage.js` 搬三个函数，STORAGE_KEYS 留在项目）：

```js
/**
 * 浏览器里小巧的持久键值：安全地读写 localStorage。
 *
 * localStorage 在 Node 渲染环境缺失、在隐私模式抛错，两者都是普通情况：
 * 读不到是默认值，写失败留给本次会话的内存值。
 */
export function storageAvailable() {
  try {
    return typeof window !== 'undefined' && window.localStorage !== undefined && window.localStorage !== null
  } catch { return false }
}

/** The stored string, or null when there is none or storage cannot be reached. */
export function readStored(key) {
  try {
    if (typeof window === 'undefined' || window.localStorage === undefined) return null
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

/** Store a string. A failure is swallowed: private mode must not break the panel. */
export function writeStored(key, value) {
  try {
    if (typeof window === 'undefined' || window.localStorage === undefined) return false
    window.localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}
```

- [ ] **Step 2: tokens.css.js —— 令牌表**

从 `src/client/shared/styles.js` 第 11-600 行的 `.st-shell{...}` 块中，把**对照表里标了 --fang- 的令牌**搬进来，选择器改为 `.fang-shell{...}`。操作要点：

1. 文件骨架：`export const FANG_TOKENS = \`` + 缩进两格的 `.fang-shell{` + 令牌声明 + `}\``（声明格式照抄源文件，含原有注释）。
2. 应用全局改名对照表的令牌列；**业务令牌（welcome/glyph/mcp/canvas/seg-0..7/mosaic/gallery/card-w/thread/pin/fade/session/flow/send/ctx-copy/settings-w/dialog-textarea-min-h/overlay-inset/log-col/notes/model-list/detail/overview-summary/preview/fact-label/statusbar/effort-tick/hairline-row-h/event/rule/picker/menu-min-w/status-menu-min-w/review/find/gutter-w/editor-min-h/icon-menu-*/layer-mosaic/board-*）不搬**。
3. 回退调色板 --st-fallback-* 的值并入对应令牌的默认值（深色值，见对照表末段说明）；删除 fallback 声明本身。
4. 新增声明：--fang-bg-layer-1:#1c1c1e、--fang-bg-layer-2:#2c2c2e、--fang-border-hair:#ffffff14、--fang-border-edge:#ffffff1f、--fang-border-strong:#ffffff29、--fang-focus-ring-width:2px。
5. 文件内凡 var() 引用只许 --fang-* 或字面量；grep 检查：

Run: `grep -n "dsw-\|--st-" /Users/fang/Projects/fang-style/src/tokens.css.js`
Expected: 无输出。

6. `node --check /Users/fang/Projects/fang-style/src/tokens.css.js` 通过。

- [ ] **Step 3: frame.css.js —— 应用框架**

从 `src/client/shared/styles.js` 搬以下块（按源文件行号，行号以当前文件为准，先读再切）：

- 第 18 行 box-sizing 规则：`.st-root,.st-root *,.st-shell *{box-sizing:border-box}` → 选择器换 fang-。
- 第 36-600 行 `.st-shell` 块里**非令牌**的尾部声明（display:flex、font-family、background、color 等）并入 frame 的 `.fang-shell` 规则；令牌已搬走的不要重复。
- 第 602-625 行 titlebar/title/图标类：titlebar、title 搬；`.st-bar-icon`、`.st-card-action-icon`、`.st-icon-*` 五条**不搬**（留在项目）。
- 第 627-686 行 frame 块：st-root、st-col、st-rail-layer、st-rail、两个 keyframes、st-rail-collapsed、st-rail-scrim、四条 gap 类、st-mid、st-rail-toggle、st-scroll。
- 第 879-880 行：`.st-row`、`.st-spacer`。
- 第 881 行：`.st-muted`。
- 第 688-703 行：`.st-split*` 五条（split-list/split-detail/split-detail-head/title/meta/body 属于同一族，一并搬）。
- 第 727-728 行：`.st-list-row-meta`。

选择器、令牌、keyframes 名按对照表替换（st-mid→fang-main，--st-shelf-gutter→--fang-frame-gutter，--st-split-list-w→--fang-split-list-w，--st-motion-open→--fang-duration-open，--st-titlebar-height→--fang-titlebar-height，--st-rail-w→--fang-rail-w，--st-layer-rail→--fang-layer-rail，--st-board-gap→**改读** var(--fang-space-12)，--st-board-inset-compact→var(--fang-space-12)——split 的 head/body padding 读的是 board 令牌，库里换成 space 刻度）。

验证：

Run: `grep -n "st-\|dsw-" /Users/fang/Projects/fang-style/src/frame.css.js`
Expected: 无输出。

Run: `node --check /Users/fang/Projects/fang-style/src/frame.css.js`
Expected: 通过。

- [ ] **Step 4: components.css.js —— 组件样式**

从 `src/client/shared/styles.js` 搬：

- 第 709-728 行 `.st-list` / `.st-list-row` 及其 hover/active/button 态。
- 第 734-781 行输入与下拉块中的 **.st-dropdown* 五条、.st-file-button、.st-file-input**（.st-input/.st-find-input/.st-chat-input/.st-scan-steer-input 的边框less字段约定**留在项目**，它们的选择器是项目类）。
- 第 784-799 行 `.st-btn` 基础与状态。
- 第 800-809 行 `.st-btn-primary`。
- 第 852-865 行 `.st-btn-primary:hover`、`.st-btn.st-btn-xl`、`.st-btn-ghost` 两条、`.st-btn-ghost.st-btn-icon`、`aria-pressed` 规则。（.st-session-btn/.st-btn-flow/.st-session-label/@property/@keyframes st-flow-ring/st-session-text-flow **不搬**，留在项目。）
- 第 866-878 行 `.st-tip` 两条。
- `src/client/panel/core.css.js` 里 dialog 族规则：先 grep `st-dialog` 定位（backdrop、dialog、dialog-head/title/body/actions/scroll/panel），**搬走 backdrop/dialog/dialog-head/dialog-title/dialog-body/dialog-actions/dialog-scroll/dialog-panel；.st-dialog-textarea 留在项目**。
- `src/client/panel/core.css.js` 里 sheet 族规则（grep `st-sheet`）：全部搬，类名按对照表（sheet→drawer，sheet-backdrop→backdrop）。
- `src/client/panel/composer.css.js` 第 215-217、241 行两条 chevron 规则（`.st-seat-back .st-seat-cell-chevron` 那条留在项目，选择器后半段改 fang-chevron-right）。
- segmented：grep `st-seg` 定位 `.st-seg`/`.st-seg-item` 规则（在 settings.css.js 或 core.css.js），搬走并改名 fang-segmented；高度读 --fang-segmented-height（新令牌，声明在 tokens.css.js，值 28px）。

全部按对照表替换类名与令牌。验证：

Run: `grep -n "st-\|dsw-" /Users/fang/Projects/fang-style/src/components.css.js`
Expected: 无输出。

Run: `node --check /Users/fang/Projects/fang-style/src/components.css.js`
Expected: 通过。

- [ ] **Step 5: widgets —— 组件 JS**

以 `src/client/shared/ui.js` 为源，逐块搬，改动只有三类：import 改 `'../react.js'`/`'../hooks.js'`；类名按对照表；`t` 参数改标签 props。

`src/widgets/overlays.js`：`Drawer`、`ConfirmDialog`、`Dialog` 三个函数原样搬，签名改：

```js
export function Drawer({ title, children, onClose, size, bodyClassName, closing = false, closeLabel = '关闭' })
// 函数体里 t('action.close') → closeLabel
export function ConfirmDialog({ title, children, confirmLabel = '确定', cancelLabel = '取消', onConfirm, onCancel, busy, danger = true })
// t('action.cancel') → cancelLabel；t('action.ok') → confirmLabel
export function Dialog({ title, children, onClose, size, bodyClassName, panelClassName, backdropClassName, closeLabel = '关闭' })
```

Escape/背板/aria 逻辑逐行保留。

`src/widgets/dropdown.js`：`Chevron`（className 改 fang-chevron / fang-chevron-right）与 `Dropdown`（类名按对照表，`useDismiss` 从 `'../hooks.js'` 导入）。

`src/widgets/file-button.js`：`FileButton`，类名 fang-file-button/fang-file-input，内部按钮类 fang-btn。

`src/widgets/segmented.js`：函数改名 `Segmented`（props 不变：label/options/value/onChange/testId/disabled），类名 fang-segmented/fang-segmented-item。

`src/widgets/list.js`：`List`、`ListRow`、`SplitPane`，类名按对照表。

`src/widgets/tooltip.js`：`TooltipLayer`，类名 fang-tip。

每个文件头部写一段模块注释，说明这个组件是什么、给谁用（沿用源文件注释，删掉讲本面板历史的段落）。逐个 `node --check`。

- [ ] **Step 6: hooks.js**

`src/client/shared/hooks.js` 里搬四个（内容逐行保留，只改 import 与名字）：

- `useDismiss`（原样）。
- `usePersisted`（`./storage.js` → `'./storage.js'`，同目录）。
- `useClosingAnimation`（原样）。
- `useDockState` → `useSessionState`，`DOCK_STORE` → `SESSION_STORE`；函数体与注释同步把「dock」措辞改为「会话内存活」。

`createStateStore` 保持在 hooks.js 内部。`./react.js` import。

Run: `node --check /Users/fang/Projects/fang-style/src/hooks.js`
Expected: 通过。

- [ ] **Step 7: styles.js 与 index.js（全文件如下）**

`/Users/fang/Projects/fang-style/src/styles.js`：

```js
/**
 * 库的整张样式表，一个模板字符串。
 *
 * 顺序即层叠：令牌最先（一切规则读它），框架其次（其余规则布局在它里面），
 * 组件最后。调用方把 FANG_CSS 注入一个 style 元素即可，位置在它自己的
 * 样式之前，让宿主样式能覆盖库的默认值。
 */
import { FANG_TOKENS } from './tokens.css.js'
import { FANG_FRAME } from './frame.css.js'
import { FANG_COMPONENTS } from './components.css.js'

export const FANG_CSS = `${FANG_TOKENS}
${FANG_FRAME}
${FANG_COMPONENTS}`
```

`/Users/fang/Projects/fang-style/src/index.js`：

```js
/** fang-style 的唯一出口：组件、hook、整张样式表。 */
export { Drawer, ConfirmDialog, Dialog } from './widgets/overlays.js'
export { Chevron, Dropdown } from './widgets/dropdown.js'
export { FileButton } from './widgets/file-button.js'
export { Segmented } from './widgets/segmented.js'
export { List, ListRow, SplitPane } from './widgets/list.js'
export { TooltipLayer } from './widgets/tooltip.js'
export { useDismiss, usePersisted, useClosingAnimation, useSessionState, SESSION_STORE } from './hooks.js'
export { FANG_CSS } from './styles.js'
```

- [ ] **Step 8: 冒烟测试转绿**

把 `tests/fang-style.test.js` 的内容替换为完整断言：

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as fang from 'fang-style'

test('fang-style 导出完整的组件与 hook 面', () => {
  const widgets = ['Drawer', 'Dialog', 'ConfirmDialog', 'Dropdown', 'FileButton',
    'Segmented', 'List', 'ListRow', 'SplitPane', 'TooltipLayer', 'Chevron']
  const hooks = ['useDismiss', 'usePersisted', 'useClosingAnimation', 'useSessionState', 'SESSION_STORE']
  for (const name of [...widgets, ...hooks]) {
    assert.equal(typeof fang[name], 'function', `${name} 应该是函数`)
  }
})

test('FANG_CSS 是只含 fang- 命名的样式表', () => {
  assert.equal(typeof fang.FANG_CSS, 'string')
  assert.match(fang.FANG_CSS, /\.fang-btn\{/)
  assert.doesNotMatch(fang.FANG_CSS, /--st-/)
  assert.doesNotMatch(fang.FANG_CSS, /\.st-/)
  assert.doesNotMatch(fang.FANG_CSS, /--dsw-/)
})
```

Run: `node --test --test-force-exit tests/fang-style.test.js`
Expected: 2 条全 PASS。

Run: `node --test --test-force-exit`
Expected: 原有测试全部 PASS（库未被项目使用，项目应无变化；若红，是本 Task 误改了项目文件，回查）。

- [ ] **Step 9: 提交**

```bash
git add tests/fang-style.test.js package.json package-lock.json
git commit -m "feat: fang-style 库内容就位并通过冒烟测试"
```

---

### Task 3: 项目组件切换到库

**Files:**
- Modify: 16 个 import `shared/ui.js` 的文件（`src/client/index.js`、`src/client/hosts/site.js`、`src/client/panel/{core,composer,models,library,welcome,overlays,context,settings,notes,rail-tools}.js`、`src/client/mosaic/{index,relations,review,tabs}.js` —— 以 `grep -rl "shared/ui.js" src/client` 实际结果为准）
- Modify: `src/client/panel/core.css.js`（删 dialog/sheet 族已迁规则）
- Modify: `src/client/panel/composer.css.js`（删两条 chevron 规则，改一条选择器）
- Modify: `src/client/styles.js`（FANG_CSS 进拼接）
- Modify: `src/client/shared/ui.js`（删除）
- Modify: `tests/{chat,client-render,editor-surface,rail-tools,hygiene}.test.js`（类名断言）

**Interfaces:**
- Consumes: Task 2 的导出面。
- Produces: 项目里不再有 `shared/ui.js`；Dialog/Drawer/ConfirmDialog 调用点改传 closeLabel 等字符串；Segmented 取代 SegGroup。

- [ ] **Step 1: styles.js 先引入库样式**

`src/client/styles.js` 头部加 `import { FANG_CSS } from 'fang-style'`，模板串第一位变 `${FANG_CSS}`（在 CSS_SHARED 之前）。此时库里 `.fang-*` 规则与项目旧 `.st-*` 规则并存，无害。

Run: `npm test 2>&1 | tail -5`
Expected: 全绿（纯增量）。

- [ ] **Step 2: 更新 import**

对 `grep -rl "shared/ui.js" src/client` 的每个文件，把 `from '../../shared/ui.js'` / `from '../shared/ui.js'`（按各自深度）改成 `from 'fang-style'`。其中 `SegGroup` 的导入名改为 `Segmented`（import 与 JSX 调用点一起改；grep `SegGroup` 找全）。

Run: `grep -rn "shared/ui.js" src/client`
Expected: 无输出。

- [ ] **Step 3: 弹层调用点补标签 props**

grep `h(Drawer|h(Dialog|h(ConfirmDialog`（文件清单见前：tabs.js、index.js(mosaic)、notes.js、models.js、library.js、overlays.js、context.js）。凡调用传了 `t` 的，删掉 `t` 属性；需要非默认按钮文案的调用点，把 `t('…')` 的值改成显式 props：

- Drawer/Dialog：`closeLabel: t('action.close')`
- ConfirmDialog：`cancelLabel: t('action.cancel')`、`confirmLabel` 按调用点原有语义（多数已显式传，没传的删 `t` 即可用默认值）

规则：**默认文案是库里给的中文兜底；项目调用点一律显式传 t(...)，不依赖兜底**——本步给每个弹层调用点都补上显式 props，宁多勿漏。

- [ ] **Step 4: JSX 类名替换（组件类）**

对全 `src/client` 执行对照表的**组件类部分**（dropdown/file-button/sheet/backdrop/dialog/seg/list/split/tip/btn/danger/spacer/row/muted/seat-chevron/seat-cell-chevron）。用词边界替换，每类一条 sed，**逐条跑完立即 `git diff` 看这一条的 diff** 再跑下一条。例：

```bash
grep -rl "st-dropdown" src/client | xargs sed -i '' 's/st-dropdown/fang-dropdown/g'
git diff --stat   # 确认只动了预期文件
```

st-btn 与 st-row 用带边界的模式（`st-btn[^-a-z]` 语境下逐个核对：先替换 st-btn-primary/ghost/xl/icon，再 `s/st-btn/fang-btn/g` 会把 st-btn-flow 误伤——**st-btn-flow 先临时改名 st-btn-flow-KEEP，跑完 st-btn 替换后改回来**；st-row 同理先保护 st-row-height 等）。

- [ ] **Step 5: 删项目里已迁移的 CSS**

- `core.css.js`：删 Step 4 清单里已搬走的 dialog/sheet 族规则块（整块删，含注释）。
- `composer.css.js`：删两条 chevron 规则；`.st-seat-back .st-seat-cell-chevron` 改成 `.st-seat-back .fang-chevron-right`。

Run: `grep -n "st-sheet\|st-backdrop\|st-dialog-panel\|st-dialog-scroll\|st-dropdown\|st-seat-chevron\|st-seg\b\|st-list\b\|st-split\b\|st-tip\b\|st-btn\b" src/client/*/*.css.js src/client/shared/styles.js`
Expected: 逐条核对剩余命中——只允许是留在项目的类（st-dialog-textarea、st-btn-flow、st-session-* 等）。

- [ ] **Step 6: 删 shared/ui.js**

确认 `grep -rn "shared/ui.js" src/client tests` 无输出后 `rm src/client/shared/ui.js`。

- [ ] **Step 7: 更新测试断言**

对 `tests/chat.test.js`、`tests/client-render.test.js`、`tests/editor-surface.test.js`、`tests/rail-tools.test.js`、`tests/hygiene.test.js` 里的旧类名按对照表替换（同样词边界、逐条 sed 逐条看 diff）。`tests/hygiene.test.js` 若用 indexOf 定位 CSS 切片，锚点字符串改成新类名/新令牌。

Run: `node --test --test-force-exit tests/client-render.test.js`
Expected: PASS。

- [ ] **Step 8: 提交**

```bash
git add src/client tests package.json
git commit -m "refactor: 项目组件改用 fang-style，类名与调用点同步"
```

---

### Task 4: 样式与令牌切换（框架 + 令牌表拆分）

**Files:**
- Modify: `src/client/shared/styles.js`（大幅缩减）
- Modify: 全部项目 css 模块与含 className 的 JS（令牌与框架类替换）
- Modify: `tests/*.js`（令牌/类名断言）

**Interfaces:**
- Consumes: Task 2 的 FANG_TOKENS/FANG_FRAME。
- Produces: 项目样式 = FANG_CSS + 桥接 + 项目令牌 + 页面样式；库令牌成为唯一通用刻度来源。

- [ ] **Step 1: shared/styles.js 拆分**

文件最终形状（从上到下）：

1. `CSS_BRIDGE`（本计划全局段给出的代码，放最前——桥接必须先于任何读 --fang- 的项目规则？不必：CSS 变量无序，拼接位置只影响同特异性规则覆盖。放最前是可读性选择）。
2. `CSS_SHARED`：项目令牌块（`.fang-shell{ --st-mosaic-card-w:…; … }`——**业务令牌原值照搬**，只把其中引用通用刻度的改成 var(--fang-space-*)）+ 留在项目的共享约定：`.st-input` 字段族（fallback 引用改字面量）、`.st-card`、`.st-session-btn`/flow 族、`.st-add/.st-del/.st-ctx*/.st-insert`、`.st-warn`、`.st-scan-where`、图标类五条（.st-bar-icon/.st-card-action-icon/.st-icon-*）、`.st-board-gap/inset` 别名、`.st-glyph-*` 等。
3. 已搬走的令牌/框架/split/list/按钮/下拉/tip 块**删除**。

Run: `grep -c "st-" src/client/shared/styles.js` 逐段核对剩余都是有意的项目类/令牌。

- [ ] **Step 2: 项目令牌与框架类名替换**

全 `src/client` 范围：

1. 令牌：按对照表把**库令牌**的引用替换（--st-text-primary → --fang-ink-primary 等）。先替换长名（--st-text-sm-leading → --fang-line-height-sm），再替换短名；--st-text- 一族先做 leading 三个、再 font-size 四个、最后 ink 三个，**每条 sed 后 git diff**。
2. 框架类：shell/root/col/main/scroll/titlebar/title/rail*/gap*/row/muted 按对照表替换（st-rail 先长后短；st-row 保护 st-row-height）。
3. 业务令牌与页面类不动。

- [ ] **Step 3: 语法与渲染验证**

Run: `node build.mjs && node --check client.js`
Expected: 构建通过。

Run: `node --test --test-force-exit tests/client-render.test.js`
Expected: PASS（这是样式注释反引号类事故的唯一稳定探测器）。

- [ ] **Step 4: 重复声明扫描**

Run（AGENTS.md 原文）:

```bash
tr '\n' ' ' < client.js | grep -o "[^{}]*{[^}]*}" | while read r; do
  body="${r#*\{}"
  echo "$body" | tr ';' '\n' | cut -d: -f1 | sort | uniq -d | head -1
done | sort | uniq -c
```

Expected: 无同块重复属性（--st-seg-h 的 28/26 冲突已随迁移消失）。有命中就逐条修掉再扫。

- [ ] **Step 5: 全量测试与残留检查**

Run: `npm test 2>&1 | grep -E "^ℹ (tests|pass|fail)|^✖" ` 
Expected: 全绿；若有 hygiene 定位类失败，修 tests/hygiene.test.js 的锚点字符串后重跑（重定向到文件分段读，不盲跑第三遍）。

Run: `grep -rn "st-sheet\|st-mid\b\|--st-text-\|--st-w-\|--st-motion-\|--st-inset-\|--st-btn-h" src/client tests`
Expected: 无输出（这些名字应已不存在）。

- [ ] **Step 6: 提交**

```bash
git add src/client tests client.js
git commit -m "refactor: 令牌与框架样式切换到 fang-style，业务令牌留项目"
```

---

### Task 5: hooks 切换

**Files:**
- Modify: `src/client/shared/hooks.js`（删四个已迁 hook）
- Modify: `src/client/mosaic/{review,tabs}.js`、`src/client/panel/{core,models-state,ai-state,prefs-state}.js`、`src/client/index.js`（以 `grep -rln "useDockState\|usePersisted\|useClosingAnimation" src/client` 为准）
- Modify: `src/client/shared/storage.js`（删三个已迁函数，留 STORAGE_KEYS）

**Interfaces:**
- Consumes: fang-style 的 useDismiss/usePersisted/useClosingAnimation/useSessionState/SESSION_STORE/readStored/writeStored。
- Produces: 项目 hooks.js 只剩认识「书」的部分；storage.js 只剩键名表。

- [ ] **Step 1: 调用点改 import**

- `useDockState` / `DOCK_STORE` 的引用：`import { useSessionState, SESSION_STORE } from 'fang-style'`，调用点改名（grep 逐处核对，含 `DOCK_STORE.` 直接使用）。
- `usePersisted`、`useClosingAnimation`、`useDismiss`：import 源改为 `'fang-style'`。
- storage 键表 STORAGE_KEYS 的 import 路径不变（仍在项目）。

Run: `grep -rn "useDockState\|DOCK_STORE" src/client tests`
Expected: 无输出。

- [ ] **Step 2: 删旧实现**

`shared/hooks.js` 删 useDismiss/usePersisted/useClosingAnimation/useDockState/createStateStore 及其注释；`shared/storage.js` 删 storageAvailable/readStored/writeStored（grep 确认项目内无引用后删；若 prefers-state 等还用 readStored，那些调用点 Step 1 已改到 fang-style）。

Run: `node --test --test-force-exit tests/client-render.test.js tests/prefs.test.js 2>/dev/null || npm test 2>&1 | tail -5`
Expected: 相关测试 PASS（prefs 测试文件名以实际为准，先 `ls tests`）。

- [ ] **Step 3: 提交**

```bash
git add src/client tests
git commit -m "refactor: 通用 hook 改用 fang-style，项目只留书写域 hook"
```

---

### Task 6: 收尾与全量验证

**Files:**
- Modify: `AGENTS.md`（引用路径与类名更新）
- Modify: `README.md`（若提及 shared/ui.js）

**Interfaces:**
- Produces: 文档与代码一致；全量绿。

- [ ] **Step 1: AGENTS.md 更新**

- 「界面构造规则」第 3 条：`shared/ui.js` 的 Dialog/Drawer → `fang-style` 的 Dialog/Drawer；例外清单不变。
- 「不许在局部写硬编码」一节的令牌名：--st-space-* → --fang-space-*、--st-radius-* → --fang-radius-*、--st-row-height → --fang-row-height。
- 「客户端 src/client/」分层一节：shared/ 描述补一句「通用 UI 原子件在仓库外的 fang-style，经本地依赖引用」。

- [ ] **Step 2: 全量验证**

```bash
npm run lint
npm test 2>&1 | grep -E "^ℹ (tests|pass|fail)|^✖|AssertionError|TypeError|ReferenceError"
```

Expected: lint 0 error；测试全绿（540+ 用例）。

- [ ] **Step 3: 最终一致性检查**

```bash
grep -rn "shared/ui.js" src/client tests docs | grep -v plans
grep -c "fang-" client.js
```

Expected: 第一条无输出；第二条 > 0（产物里含库样式）。

- [ ] **Step 4: 提交**

```bash
git add AGENTS.md README.md
git commit -m "docs: 规则文档对齐 fang-style 引用"
```

---

## Self-Review 记录

- 规格覆盖：设计文档五节都有对应 Task——位置与形态（T1）、结构（T2）、命名映射（全局表 + T3/T4 的替换）、本项目改动（T3-T5）、验证（每 Task 步骤 + T6）。
- 占位符：无 TBD；「以 grep 实际结果为准」的文件清单都给了 grep 命令本体。
- 类型一致性：Segmented/SESSION_STORE/useSessionState/closeLabel 的名字在 T2 定义、T3/T5 使用，两处一致；FANG_CSS 在 T2 产出、T3/T4 消费，一致。
- 已知风险（写在这里提醒执行者）：sed 误伤（先保护后缀同名）、hygiene 测试的 indexOf 锚点、注释反引号、以及 client.js 是构建产物——所有验证都跑 npm test（先构建）。
