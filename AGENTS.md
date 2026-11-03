# 本项目的改动规则

给在本仓库改代码的人和 AI 用。只写本项目特有的约定；通用标准已上收到个人标准仓 `~/standards`，按下面的指引读取。

## 通用标准：按任务类型先读（强制）

通用行为标准（对话与输出、工程原则、代码组织、安全）由 harness 从 `~/.dsh/AGENTS.md` 自动加载，不必重读。任何任务开始前，按类型再读对应模块：

- **任何任务**：`~/standards/2-testing/node-testing.md`（本项目的测试命令在下面「验证方式」）
- **UI 改动**：`~/standards/3-ui/fang-style-STYLE_SPEC.md`（软链，全文必读）+ 本文件「界面构造规则」
- **改持久化数据 / 写路径**：`~/standards/2-data/` 全部三个文件
- **重构 / 批量替换 / 搬移**：`~/standards/5-process/refactor.md`
- **取名字**：`~/standards/4-architecture/naming.md`
- **发版 / 动依赖**：`~/standards/6-release/`、`~/standards/1-engineering/dependencies.md`

冲突时本文件优先；发现本文件与标准仓内容冲突，先改标准仓，再同步本文件。

## 红线（最高优先级，违反即返工——始终内联，不随上收撤出）

以下各条有一个共同点：违反它们，就要作者反复纠正、重复消耗作者的资源——静默失效要等实机才发现，不静默的每次都要亲口再纠正一遍。内联在此，不靠引用，让规则先于错误到达。详细论证在标准仓对应模块。

### 复用已有样式

写任何界面之前，先找已有的组件与类：库件（`Dialog` / `Drawer` / `Segmented` / `List` / `SplitPane` / `Dropdown`）、框架类（`fang-page` / `fang-scroll` / `fang-btn` 及其变体）、本项目「自造类登记表」里的类。**有等价物必须复用**；确需新类，先登记再使用。自造一个已有等价物的样式 = 返工——每一个新类都是未来不一致的种子，这正是间距曾经有十七个值、圆角有十一种的来路。

### 不许在局部写硬编码

一个视觉或行为上的量，只能有一处定义。散落在各条规则里的同一个值，就是局部不一致的来源——同一个视觉重量在这里写 5px、在隔壁写 6px，两个相邻的控件圆角一个 3px 一个 4px，改一处要记得改另外五处。

已经踩过的：

- 间距曾经有 1/2/3/4/5/6/7/8/9/10/12/14/16/18/20/22/24 十七个值
- 圆角曾经有 1/2/3/4/6/7/8/9/18/999/50% 十一种
- 卡片尺寸 `140×56` 同时写在 CSS（`width:140px`）和 JS（`CARD_W = 140`）里，改一处连线就错位
- 网格间距 190/110 是从卡片尺寸算出来的，却被当成独立常量硬写

现在的做法：

- **间距**用 `--fang-space-*`（2/4/8/12/16/24），4px 基准
- **圆角**用 `--fang-radius-*`（xs/sm/md/lg/panel 五档）；`--fang-radius-pill` 是形状不是尺寸
- **控件行高**用 `--fang-row-height` / `--fang-row-height-compact` / `--fang-hit-target`
- **尺寸类**（卡片宽高、网格步长）在 JS 里定义一次，通过行内 style 变量交给 CSS

判定标准：**CSS 里不写裸数字**。

这条没有例外，也没有"只出现一次所以不必抽"的豁免——那句话是我自己加的，作者没有给过这个许可，而且它正好是每次犯错的入口：一个值只出现一次时最容易觉得"这次不用抽"，然后下一个页面要同样的宽度时又写一遍，两处就漂了。

任何长度、尺寸、间距、圆角，一律走变量：

- 刻度里有的，用 `--fang-space-*` / `--fang-radius-*` / `--fang-row-height*`
- 刻度里没有的，就地新增一个有名字的 token，写清它是什么、为什么是这个值

`min()` / `max()` / `calc()` / 视口单位（`vw`/`vh`/`cqw`）里的数字是表达式的一部分，不是视觉量，可以就地写。

### 颜色必须在深色主题下可见

面板实际运行在近黑底上。描边与分隔线读 `--fang-ink-edge` / `--fang-ink-hair`（或 `--st-accent`），阴影读配方令牌（`--fang-card-shadow` / `--fang-menu-shadow` / `--fang-dialog-shadow`），**禁止黑色字面量阴影与黑回退**——近黑底上等于没有。每个颜色自问一句：它在近黑背景上还看得见吗。详解见 STYLE_SPEC「交互状态」。

### 批量替换必须逐条看 diff

先保护后缀同名（如 st-btn-flow），最长名先替换，一次一条，每条跑完 `git diff` 逐段看。正则误伤（子串吃字、自引用、吃空格）与静默损坏都不会被测试报出来——测试只覆盖被断言的部分。详解见 `~/standards/5-process/refactor.md`。

### 使用方不得重定义库类

同特异性的规则后加载者胜：项目里一条与库同名的声明会静默遮蔽库规则，测试看不见。定制走令牌桥接（CSS_BRIDGE）与组件变体，不走复制库规则改一改。

### 命名一词一事

一个名字只做一件事：两个名字只差一点点（listDir / listFiles），读者就得猜差别；留一个，另一个删掉。同类操作必须同一构词模式（ensureDir / listDir；readTextFile / writeTextFile；…Sync 跟同步版）。名字用读者的语言（modifiedTime 不是 statMtimeMs），说它**现在是什么**，不撞系统命名。命名失守不炸功能，但每一个含糊的名字都在给所有后来的人收税——评审抓不过来的地方它就在长。详见 `~/standards/4-architecture/naming.md`。

### 命名必须走体系，不许即兴

名字不是逐个发明的，是从命名体系里取的。本项目的构词规则：CSS 类 = `fang-` 块_部位（状态走 data-*）；CSS 变量 = `--fang-类别-名称[-刻度]`，类别只有既定的几族（space / padding / radius / font-size / line-height / icon / width / height / layer / duration / ink / surface / border / layer-表）；组件大驼峰；hook = `use` + 动词；文件名 = 主导出的短横线形式；项目自有令牌 = `--st-业务名`。**加新名字 = 在体系内取位；体系覆盖不了 = 先扩体系（说明新类别是什么、为什么），再取名。** 同一个概念出现第二套叫法——两套前缀、两种构词、缩写与全称并存——就是体系在分叉，当场收拢成一个。即兴命名的代价是词汇表碎片化：每个后来的人（包括未来的你）都得先建一张同义词表才能干活，而这张表永远建不全。体系全文见 `~/standards/4-architecture/naming.md`。

### 界面文案克制

界面上只留必要且简短的说明。能靠位置、图标、上下文看懂的不写；`title` 只写看不见的信息（快捷键、后果、与同名控件的区别）；空状态才写一句「还没有 X、去哪里点」；不解释设计意图、不做欢迎语和成功表扬。写文案时自问：删掉这句，用户会不会不知道下一步做什么？会——才留。违反立即可见，但每一句都摊在用户眼前、要返工才能收回——与静默失效同罪。详解见 STYLE_SPEC 总则第 9 条。

## client.js 是构建产物，改的是 src/client/

`client.js` 由 `node build.mjs`（esbuild）从 `src/client/index.js` 打包生成，它仍然是**提交进仓库**的——因为 dsh 直接读这个文件，没有构建步骤就加载不了插件。但它不是手写文件：

- **不要直接编辑 `client.js`**，下一次构建会覆盖掉
- 改代码改 `src/client/`
- 改完跑 `npm test`（它先构建再测），或 `npm run dev` 起 watch

构建产物的形状由 `build.mjs` 的 banner/footer 决定：`window.__ModuleLoader__.load({ id, factory })`，factory 里是 CJS，`return module.exports.default`。这三个位置任何一处改动都会让宿主拿到错误的对象——`apply` 不存在，面板静默不挂载。

**构建刻意不压缩**（`minify: false`）。测试读的是这个产物，hygiene 规则要在里面扫硬编码像素值、类名和字典键；压缩后这些全都变成短标识符，所有规则会静默失效。

## CSS 写在模板字符串里，注释里不能出现反引号

`client.js` 的样式表是一整个模板字符串：

```js
const CSS = `
  .st-foo{color:red}
`
```

反引号就是它的结束符。在样式注释里写 `` `--dsw-alias-border-l4` `` 这类**带反引号的 token 名**，会提前把字符串截断，后面所有代码被当成表达式解析，整套测试挂掉。

已经犯过三次，所以：

- 样式注释里提到变量名，**不加反引号**，直接写 --dsw-alias-border-l4
- 需要强调时用大写或破折号，不要用反引号


### 同一声明块里的重复声明，谁也不会报错

改 padding、radius 这类"块里可能已经有旧值"的属性时，先确认块内没有同名声明。已踩过的实例：标题栏规则里残留 `padding-block:0`，写在后补的 `padding-block:8px` 之后——同块内后声明覆盖先声明，8px 静默失效，按钮照旧顶满栏高，作者看到的是"内距没了"。

这条事故语法检查抓不住（完全合法）、测试抓不住（读的是字符串不是渲染）、连"产物里有没有这条规则"的检查都抓不住（规则在，只是被自己后面的值盖掉）。只有两种办法发现：对产物做逐属性的重复声明扫描，或看真实渲染。改完这类属性，跑一遍下面的扫描：

```bash
tr '\n' ' ' < client.js | grep -o "[^{}]*{[^}]*}" | while read r; do
  body="${r#*\{}"
  echo "$body" | tr ';' '\n' | cut -d: -f1 | sort | uniq -d | head -1
done | sort | uniq -c
```


### node --check 抓不住这个 bug

上面写着"改完立刻 node --check"，这句话只在**反引号后面跟的是不能当标识符的字符**时成立。踩过的情况分两种：

- 注释里写 `` `--dsw-alias-border-l4` `` —— 反引号后面是 `-`，`X` 后面跟 `-` 不是合法表达式，`node --check` 报 `Invalid left-hand side expression in postfix operation`。**抓得住。**
- 注释里写 `` `.st-book-card` `` —— 反引号后面是 `.`，整个东西变成 `` `<CSS>` ``.st-book-card`` ` carries…` ``，也就是一个**带标签的模板字符串**（tagged template），语法完全合法。`node --check` 退出码 0，**抓不住**；只有运行到那一行才抛 `ReferenceError: book is not defined`。

实测过：把 `` `.st-book-card` `` 写进注释，`node --check client.js` 通过，`new Function(src)` 也通过，`tests/hygiene.test.js` 16 条全绿，只有 `tests/client-render.test.js` 红 61 条。

所以：

- **改完样式跑 `node --test --test-force-exit tests/client-render.test.js`**（1.2 秒）。这是唯一能稳定抓住这个 bug 的检查。
- `node --check` 仍然值得跑（0.1 秒），它抓的是另一类错误，但不能当成"样式没写坏"的证据。
- `tests/hygiene.test.js` 也抓不住：它的 CSS 切片靠 `indexOf` 定位，字符串被提前截断后它读到的还是那段"看起来正常"的前半截。

## 代码往哪放：这个项目的分层

通用的架构判断见 `~/standards/1-engineering/code-organization.md`。这里只写本项目的具体归属——照着填，不用每次重新想。

**三层，加一条进程边界**。依赖只朝一个方向：

```
src/client  →  domain  ←  lib
                  ↑
         不依赖任何一半，也不碰 Node / React / fetch
```

客户端不依赖服务端代码，服务端不依赖客户端代码；两边都可以依赖 `domain/`，`domain/` 谁都不依赖。唯一的进程接口仍是 `src/client/api.js` 里那张路由表。

**共享领域 `domain/`**

- `book.js` / `board.js` / `tree.js` / `schema.js` / `ids.js` —— 书、板、树、字段清单、id 和状态规则。两边共用的形状和纯规则都在这里。
- **不许 import `node:*`、`react`、`lib/`、`src/client/`**。要加新文件，先问它是不是两边都需要；只有一边需要，就留在那一边。
- `domain/` 里的函数只做值变换。时间、随机数和 I/O 由调用方给；id 统一走 `ids.js`。

**服务端 `lib/`**

- `index.js` —— 只做装配：注册工具、注入上下文、调 `apply`。**不放业务逻辑**。业务逻辑写进来，它就成了所有模块的下层，谁都要反过来依赖它。
- `routes/` —— 按「谁在看这些接口」分组（`books` / `writing` / `mosaic` / `config`），每个模块只接收它用得到的依赖。**书和板的路由拿不到 `config`**，这样它们不可能悄悄依赖某个设置项。
- `ai.js` / `llm.js` —— 模型调用、系统提示词、回复解析。不读设置、不认识路由。
- `store.js` / `settings.js` / `context.js` / `overview.js` / `facts.js` / `hash.js` / `text.js` / `image.js` —— 各自一个领域。
- `model.js` / `mosaic.js` —— 服务端对领域模型的门面，把 `domain/` 的名字按原有接口交出去；不要再往里写实现。

**客户端 `src/client/`**

- `index.js` —— 纯入口：import 各模块、组装插件对象、导出 `apply`。
- `api.js` —— 传输。别的地方不直接拼 URL。
- `shared/` —— **不认识书**，也不 import `api`、`mosaic/` 或 `index.js`。纯逻辑、通用 hook、存储键、手势。通用 UI 原子件不在仓库里，在仓库外的 fang-style 库，经本地依赖（`fang-style: github:flyingludens/fang-style#semver:^0.1.0`）引用。
- `panel/` —— 认识书，不认识 `mosaic/` 的内部。`panel/*-state.js` 是书的用例层。
- `mosaic/` —— 认识书，不认识 panel。`mosaic/board-state.js` 是板的用例层。
- 样式跟着组件走：`xxx.js` 旁边就是 `xxx.css.js`，最后由 `styles.js` 按顺序拼起来。**不按类型分目录**（不存在「所有样式」目录）。

**判断归属的三个问题**

- 这块代码需要知道「书」吗？不知道 → `shared/`。
- 它需要知道「调查板」吗？不需要 → 留在 `panel/`。
- 两边都要用吗？是 → `domain/`；只有一边用，不要为了「对称」搬进去。

要让下层反过来依赖上层时，答案不是加条件绕开，是把那块代码挪到正确的层。

### 写路径：只有两个入口

- **本地编辑** → `updateBook(next, { immediate })`：先更新屏幕，再进保存队列。结构变更传 `immediate`，普通输入等间隔。
- **主机已经写盘** → `adoptWritten({ book, merge, token, savedAt })`：领回路由写的那本书和它的 token，**不再入队**。只改板/梗概时传 `merge(prevBook)`，别整本替换掉正在输入的文字。
- 除此之外不许写 `state.book`：`useBookData` 不再把裸 `setState` 交出去。
- 每个写盘的路由都返回 `book` 和 `token`。保存响应只在“请求期间没有新编辑”时替换书；有编辑就只领 token。版本守卫在 `useBookData` 里。
- 状态四分类：书（React state + 磁盘，`updateBook`/`adoptWritten`）、会话（`SESSION_STORE`，按书 id，不落盘）、偏好（localStorage，经 `usePersisted`/`storage.js`）、页面（组件 `useState`，随页面销毁）。新状态先说清属于哪类。

### 客户端用例层

- `useBookData` —— 书的生命周期：读、写、保存队列、版本守卫。
- `useAiActions` / `useTreeEdits` / `useBoardActions` —— 一个主题一组动作，返回动作和它们的状态，不返回按钮。
- 页面只画。读可以直接读领域字段；写必须经过上面的动作。不要在页面里拼一个实体、卡片或边的对象。

## 验证方式

- 改样式：`node --test --test-force-exit tests/client-render.test.js`。`node --check client.js` 也跑，但它抓不住注释里的反引号，理由见上文。
- 改行为：`node --test --test-force-exit`（全量约 4 秒，540 余个用例）。
- 改依赖或移动文件：`npm run lint`。它现在检查 `src`、`lib`、`tests`，**不再检查构建产物 `client.js`**；产物里的问题到源码里修。
- `domain/` 的纯净性由 `tests/domain.test.js` 守着：它不能 import `node:`、`react` 或任何一半。
- 看真实渲染：这台机器上**看不到**运行中的 DSH 面板，宿主 URL 和令牌由每次运行环境给出。所以任何“屏幕上现在长什么样”的结论都必须由用户确认，不能自己断言。

## DSH 部署目标（2026-11-03 记）

- 写作面板**只装 desktop profile**（`~/.dsh/profiles/desktop`）。web profile（`~/.dsh/profiles/web`）里的插件与依赖已清除，不要再装回去。
- desktop profile 由 Electron 应用独占管理（设计上不与 npm CLI 共享可执行包/激活/lockfile/node_modules，避免版本漂移与并发竞争）。npm 装的 `dsh`（`~/bin/dsh`）会被硬拒；受支持的入口只有 Desktop 自带的 bundled CLI：`/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh`，且须**完全退出应用后**运行 `dsh plugin --profile desktop add <tgz>` / `remove`，再重开应用。手改 package.json + 运行时 pnpm 只是绕过写锁的应急法，不算受支持路径。
- 本地安装走打包产物：`npm pack` 出新的 `dsh-planar-aerial-<version>.tgz` 再装。npm registry 发布暂时搁置；依赖一律走 git，`fang-style` 是构建期 devDependency（已打进 `client.js`，安装时不拉）。


## 界面构造规则（2026-11-02 新增，上下文窗口一役的教训）

每一次 UI 改动都适用；违反任何一条都算改错，即使测试全绿。与 fang-style STYLE_SPEC 总则重合的条目（框尺寸固定、动作按钮位置、弹层只用库件、文案克制、先报参照物、自造类登记制）已上收，不再重复；下面是本项目特有的部分。

3. **弹窗只用 `fang-style` 的 `Dialog` / `Drawer`**，不许手写 backdrop 或对话框骨架。现存例外（改动到它们时收编）：`panel/rail-tools.js`（关于卡）、`mosaic/review.js`、`mosaic/tabs.js`。
4. **文案与控件的排版复用既有类**：正文 `st-overview-text` / `st-writing-style-prompt`；编辑框 `st-overview-summary` / `st-dialog-textarea`（一律 `resize:none`，不许出现可拖拽的输入组件）。
6. **作者未指定形态时，新页面默认独立弹窗。**
7. **自造类登记制。** 页面级 CSS 确实没有现成等价物时才允许新类，且必须登记在下表：类名、它是什么、为什么没有现成等价物。不在此表的新页面类 = 违规。

   | 类名 | 是什么 | 为什么没有现成等价物 |
   |---|---|---|
   | `st-ctx-dialog-body` | 上下文弹窗体的固定高 | 弹窗体需要确定高，`Dialog` 本身只有 max-height |
   | `st-ctx-bar` / `st-ctx-seg` / `st-ctx-seg-label` | 上下文构成横条 | 面板没有「分段构成条」组件 |
   | `st-ctx-official` | 官方版本区（弹性高，内滚） | 官方文本与副本必须分属两个固定区，不共滚动区 |
   | `st-ctx-mine` | 我的版本区（固定 40%：版本列表 + 选中副本详情） | 同上；分区边界是窗格的常量 |
   | `st-ctx-mine-head` / `st-ctx-mine-split` / `st-ctx-mine-list` / `st-ctx-mine-detail` | 我的版本的区头与区内左右分栏 | 版本列表与详情需要区内的第二层分栏；`SplitPane` 的固定 220px 列表在 40% 高的区内放不下 |
