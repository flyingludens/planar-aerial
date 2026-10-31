# dsh 写故事插件 — 设计文档

状态：待实现
日期：2026-10-23
目标宿主：DeepSeek Harness（profile `desktop`，Web GUI）

## 1. 目标

在 dsh 里提供一个专门写故事的写作台。核心是**段落级流水线**：用户写一段 → AI 给修改建议 → 用户采纳或再改 → 采纳后并入正文 → 生成新版本快照。围绕这条主线，提供设定、人物关系、多版本与全书概览。

非目标（第一版不做）：富文本编辑、关系图画布、多人协作、云端同步、章节拖拽动画、发布导出为 epub/docx。

## 2. 扩展点与整体结构

写作界面注册为**输入框上方的可折叠面板**（`conversation.input.dock`）：

| 插槽 | 注册 | 作用 |
|---|---|---|
| `conversation.input.dock` | `id: 'story'`，可折叠 | 对话输入框上方的一块写作区，默认展开，可收起 |

**为什么不用 `conversation.view`**：视图会替换整个会话内容区（`renderSlot('conversation.view', …, { only: viewId })`），对话与输入框一起消失，写故事时就无法再和 AI 说话。改用 dock 后对话原封不动留在下面，写作面板浮在输入框上方，两者同屏。

**为什么不用 `main`**：`main` 是单格 keyed slot，占住它会把整个会话壳（标题栏、右栏、对话）一起替换掉。

```
┌─ 会话壳（宿主提供，完整保留）────────────────────────┐
│ 标题栏：会话标题 · 面包屑                              │
├──────────────────────────────────────────────────┤
│  对话消息流（宿主渲染，工具卡片等一应俱全）             │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │ ▾ 写故事                              [收起]  │  │
│  │ 目录 │ 段落流（定稿可折叠、建议内联）            │  │
│  └──────────────────────────────────────────────┘  │
│  ┌ 输入框 ────────────────────────────────────┐    │
└──────────────────────────────────────────────────┘
```

写作面板高度固定为 46vh（最小 220px），内部自己滚动，不挤占对话。

### 主对话如何"知道"故事

面板是附加组件，但主对话要有故事上下文，否则"帮我设计三个配角"这类要求它无从下手。两条通道：

1. **提示词注入**（只读）：在 **agent 作用域**注册 `systemPrompt.context`，文本函数每次组装提示词时读该会话工作区的 `book.json`，注入书名、体裁、视角、章节进度、人物、设定、梗概。没有故事时贡献空串（`renderContextSections` 会丢弃空贡献），所以从未写过故事的会话完全不受影响。
2. **工具回写**：`story_read` / `story_write_cast` / `story_write_settings`（见 §7.5）。

注册在 agent 作用域而非全局有两个原因：故事属于该 agent 的会话；全局层拿不到 agent 实例，无法定位工作区。

### 写作区布局

全宽主面板 + 自带标题行 + 右侧可收起的 AI 窄栏：

```
┌ 标题行：书名 · 3 章 · 已定稿 12 段 ────────────────────┐
├ 目录 ─┬─ 段落流 ──────────────────────┬─ AI 助手 ───┤
│      │  ┌ 段落卡 ─────────────────┐  │ 你：三个配角  │
│      │  │ 建议 diff / 折叠 / 补全   │  │ AI：…       │
│      │  └─────────────────────────┘  │ [加入设定]   │
└──────┴───────────────────────────────┴─────────────┘
```

- **标题行**：主面板会替换掉会话壳，所以必须自带一行标题；否则顶部会与框架左上角按钮重叠。
- **AI 窄栏**：宿主没有第二处对话界面（右栏只有文件/终端/预览，且是会话作用域），所以窄栏自绘，320px、可收起成 28px。
- **样式**：圆角沿用宿主的 4px（面与控件）/999px（胶囊），字号 12–14px，颜色只用 `--dsw-alias-*`。宿主没有暴露圆角令牌，数值按宿主组件实测对齐。

### 行内补全

段落输入停顿 1.2 秒后，请求一句续写，以淡色文字显示在正文下方，`Tab` 接受、`Esc` 忽略、点击接受。

- 只在非空段落上触发，且失败时静默（写作过程中的辅助不能打断写作）。
- 模型若把已有文本原样回显，`cleanContinuation` 会丢弃，避免重复插入。
- 宿主自带的 `inputTriggers` 只服务会话输入框（`/`、`@` 触发），无法挂到写作 textarea，因此自绘。

## 3. 数据模型

核心实体是段落，不是全文。

```ts
type ParagraphStatus = 'draft' | 'pending' | 'final'   // 写作中 → 待定 → 已定稿

interface Paragraph {
  id: string
  text: string                       // 当前正文
  status: ParagraphStatus
  suggestions: Suggestion[]          // 该段收到的建议，按时间
  history: { text: string; at: number }[]   // 每次采纳前的旧文本
}

interface Suggestion {
  id: string
  baseText: string                   // 生成时的原文，用于过期判断
  proposedText: string
  note?: string                      // AI 说明改了什么
  createdAt: number
  state: 'ready' | 'accepted' | 'rejected' | 'stale'
}

interface Chapter {
  id: string
  title: string
  status: 'todo' | 'writing' | 'done'
  paragraphs: Paragraph[]
}

interface Character {
  id: string
  name: string
  aliases: string[]
  role: string        // 身份
  goal: string
  traits: string[]
  notes: string
}

interface Relationship {
  id: string
  fromId: string
  toId: string
  kind: string        // 关系类型，如 亲属/敌对/暗恋
  note: string
}

interface SettingEntry {
  id: string
  title: string
  body: string        // Markdown
}

interface Snapshot {
  id: string
  at: number
  label: string
  chapters: Chapter[]  // 只读副本
}

interface Overview {
  global?: { text: string; basedOn: string }
  chapters: Record<string, { text: string; basedOn: string }>
}

interface Book {
  schemaVersion: 1
  title: string
  genre: string
  pov: string         // 视角
  tense: string       // 时态
  chapters: Chapter[]
  characters: Character[]
  relationships: Relationship[]
  settings: SettingEntry[]
  snapshots: Snapshot[]
  overview: Overview
}
```

设计理由：把状态挂在段落上，用户的「写一段→建议→确定→并入正文」流程就是一次 `draft → pending → final` 的流转；采用建议时旧文本进 `history`，段落史即微观版本，`Snapshot` 是宏观版本，两者不重复造概念。

## 4. 文件落盘

数据存在**当前工作区的普通文件**里，人可读、可进 git：

```
<workspace>/story/
  book.json                  # 唯一权威数据
  chapters/003-雨夜.md        # 已定稿段落拼成的 Markdown 镜像，用于阅读/导出
  snapshots/<ISO 时间>.json   # 全书快照
```

规则：

- `book.json` 是权威；`.md` 每次定稿后由 `final` 段落重新拼接生成，**只写不反向解析**。镜像损坏不影响正文。
- 写入原子化：先写临时文件再 rename，避免半截文件。
- 读取时校验 `schemaVersion` 与必填字段。

## 5. 交互与状态机

单段流程：

```
写(draft) ── 写完失焦 / 点「请AI改」──► pending + 生成建议（右栏对照）
   ▲                                        │
   │                                  ┌─────┴─────┐
   │                               采纳          再改（可带一句反馈）
   │                                  │              │
   └──── 点段落可回退 ◄──── final    ▼              └─► 新建议
```

- **手动模式（默认）**：段卡右上角「请 AI 改」。右栏显示原文/建议两栏 + 逐词 diff 高亮，按钮：采纳 / 再改（可填一句要求）/ 放弃。
- **自动模式**：段落失焦或停顿约 1.5s 后自动请求一次建议，段卡出现「建议已就绪 ●」，不自动弹右栏，点击才查看。
- 模式是插件 Config 项，面板头部另有快捷开关。
- **过期保护**：原文改动后，旧建议标 `stale`，采纳按钮禁用，提示「原文已变，需重新生成」，防止旧改法覆盖新文本。
- **定稿**：段落置 `final`，中栏收起该段建议提示，触发 `.md` 重建 + 快照（Config `snapshotEvery` 默认 1，即每次定稿）。
- **回退**：点已定稿段落可「退回到待定」，从 `history` 取上一版文本。

## 6. 故事概览

概览不是额外维护的文档，而是**每次调用 AI 时按需组装的上下文包**，分两层。

### 6.1 事实层（读取时现算，永不滞后）

- 书名、体裁、视角、时态
- 章节目录、每章状态、每章字数
- 人物名单：姓名 + 身份一句话
- 关系三元组：A → B，关系类型
- 设定条目标题清单
- 当前段落的**前一段定稿原文**与**后一段定稿原文**（连贯性必需）

这些直接从 `book.json` 计算，不缓存。

### 6.2 语义层（LLM 生成，缓存 + 失效检测）

- 全书一句话梗概
- 每章 2–3 句「发生了什么」

缓存写进 `book.json.overview`，每条带 `basedOn`（生成时输入的定稿文本哈希）。请求 AI 前比对当前哈希：

- 一致 → 用缓存
- 不一致 → 该条标脏，**同步刷新一次再请求**
- Config `overviewRefresh: 'strict' | 'lazy'`，`lazy` 表示先用旧摘要并在上下文里标注「摘要可能滞后」，换取低延迟（默认 `strict`）

定稿时后台触发一次防抖（1.2s）串行刷新，使多数情况下缓存已是新的。

### 6.3 组装顺序与预算

概览有字数上限（Config `overviewBudget`，默认约 2000 字），按优先级装配，超出从低优先级裁剪：

```
1. 当前段落 + 前后定稿段（必带）
2. 当前章语义摘要
3. 本章出现过的人物/关系（按姓名在本章文本中匹配，不塞全量）
4. 全书一句话梗概
5. 其他章一句话 + 设定条目标题
```

第 3 条「按章匹配」是关键：人物全量塞入既费 token 又干扰模型，只带本章真实出现过的角色。

### 6.4 UI

左栏「概览」页：上半为实时事实（章节进度、字数、人物数），下半为语义摘要，每条带「是否最新」标记与手动「刷新」。右栏建议区顶部显示「本次已注入约 N 字概览」，让用户看得见模型拿到了什么。

## 7. Host / Client 分工

配置 `dsh.client`：`platform: web`，`immediately: true`，`inject: ["@deepseek-ai/dsh-client-ui-conversation"]`。

```
Client (client.js, React)                Host (index.js)
├ 三栏 UI、段落卡、diff 对照      ──►   host.call('load' | 'save' | 'suggest' | 'snapshot' | 'overview')
├ 本地编辑状态                          ├ fs 读写 story/ 文件
└ host.call 取数/提交                   ├ llm.stream() 用当前会话模型生成建议/摘要
                                        └ 重建 .md、写快照
```

- AI 建议与概览摘要都在 **Host 侧**调用 `llm.stream`，模型取当前会话 `agentDefaultModel.currentSelection()`，复用现有 provider 与额度，密钥不出 Host。
- Client 不直接访问文件系统，全部读写经 Host。

## 7.5 Agent 工具（对话生成设定）

右栏是宿主完整对话，它默认只会读写文件，动不了 `book.json` 的结构。因此注册三个模型可调用的工具，让"帮我想三个配角""帮我设计这个城市的规则"这类要求能直接落到数据里：

| 工具 | 作用 |
|---|---|
| `story_read` | 读全书：标题、各章段数、人物、关系、设定 |
| `story_write_cast` | 按姓名新增或更新人物，并按姓名建关系；只写模型给出的字段，未给的字段保持不变 |
| `story_write_settings` | 按标题新增或更新世界观条目 |

权限刻意限制在**人物 / 关系 / 设定**：正文仍由用户在段落流里逐段写，AI 只能通过段落卡里的「请 AI 改」碰正文。这样对话可以帮你搭世界，但不会在你不知情时改掉小说。

工具通过 `ctx.inject(['tools','workingDirectory'], cb)` 注册，所在 profile 没有这两个服务时工具缺席、其余功能照常。工作区取调用会话的 `workingDirectory.get(session)`。

## 8. 视觉与主题

- 全部使用 `--dsw-alias-*` 令牌，不写死颜色，跟随明暗切换。
- 状态徽标：草稿 = `--dsw-alias-state-idle-primary`；待定 = `--dsw-alias-state-warn-primary`；已定稿 = `--dsw-alias-state-success-primary`；stale 建议 = 红边（`--dsw-alias-state-error-primary`）。
- 段落卡圆角、内边距、行高对齐宿主列表样式；diff 使用等宽字体。
- 可见文案走 Client locale 服务，提供 `locale/zh.json` 与 `locale/en.json`，含 `meta.title` / `meta.description`。

## 9. 错误处理

- `book.json` 损坏或缺字段：面板顶部黄条提示，原文件备份为 `book.json.bak`，重建空结构，不静默丢数据。
- AI 请求失败：建议区显示错误原文 + 「重试」，不影响正文编辑。
- 写文件失败（权限/磁盘）：操作回滚，toast 报错。
- 概览刷新失败：保留旧摘要并标「可能滞后」，不阻塞写作。

## 10. 第一版范围

做：目录、段落流（增删改、状态流转）、手动+自动建议、采纳/再改/放弃、设定卡、人物卡、关系列表、自动快照+回滚、`.md` 导出、事实层+语义层概览。

不做：关系图画布、多人协作、云端同步、拖拽排序动画、富文本。

## 11. 待实现清单（供后续 writing-plans）

1. 插件骨架：`package.json`（含 `dsh.bundle` / `dsh.client` / exports / files / icon / locale）、`cordis.patch.yml`、`index.js`（Host）、`client.js`（Client）、`locale/zh.json`、`locale/en.json`、`icon.svg`。
2. Host：`load` / `save`（原子写 + `.md` 重建）/ `snapshot` / `suggest`（llm.stream）/ `overview`（事实层 + 语义层 + 哈希失效）。
3. Client：三栏布局、目录页、段落卡与状态徽标、右栏 diff 对照、设定/人物/版本/概览页。
4. Config：`aiMode`、`snapshotEvery`、`overviewBudget`、`overviewRefresh`。
5. 安装与验收：`plugin_manager install_bundle`，在 GUI 中确认侧栏图标、面板渲染、一次完整段落流转。
