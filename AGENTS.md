# 本项目的改动规则

给在本仓库改代码的人和 AI 用。只写踩过坑、并且会重复踩的那些。

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

## 不许在局部写硬编码

一个视觉或行为上的量，只能有一处定义。散落在各条规则里的同一个值，就是局部不一致的来源——同一个视觉重量在这里写 5px、在隔壁写 6px，两个相邻的控件圆角一个 3px 一个 4px，改一处要记得改另外五处。

已经踩过的：

- 间距曾经有 1/2/3/4/5/6/7/8/9/10/12/14/16/18/20/22/24 十七个值
- 圆角曾经有 1/2/3/4/6/7/8/9/18/999/50% 十一种
- 卡片尺寸 `140×56` 同时写在 CSS（`width:140px`）和 JS（`CARD_W = 140`）里，改一处连线就错位
- 网格间距 190/110 是从卡片尺寸算出来的，却被当成独立常量硬写

现在的做法：

- **间距**用 `--st-space-*`（2/4/6/8/10/12/14/16/20/24），4px 基准
- **圆角**用 `--st-radius-*`，其中 xs/sm/md/lg/panel 直接指向 dsh 的 token；`--st-radius-pill` 是形状不是尺寸
- **控件行高**用 `--st-row-height` / `--st-row-height-compact` / `--st-hit-target`
- **尺寸类**（卡片宽高、网格步长）在 JS 里定义一次，通过行内 style 变量交给 CSS

判定标准：**CSS 里不写裸数字**。

这条没有例外，也没有"只出现一次所以不必抽"的豁免——那句话是我自己加的，作者没有给过这个许可，而且它正好是每次犯错的入口：一个值只出现一次时最容易觉得"这次不用抽"，然后下一个页面要同样的宽度时又写一遍，两处就漂了。

任何长度、尺寸、间距、圆角，一律走变量：

- 刻度里有的，用 `--st-space-*` / `--st-radius-*` / `--st-row-height*`
- 刻度里没有的，就地新增一个有名字的 token，写清它是什么、为什么是这个值

`min()` / `max()` / `calc()` / 视口单位（`vw`/`vh`/`cqw`）里的数字是表达式的一部分，不是视觉量，可以就地写。

## 颜色必须能在深色主题下看见

面板实际运行在深色主题上。以下 token 在深色主题下几乎不可见，不要用来画线或描边：

- `--dsw-alias-border-l4` —— 浅色主题是 16% 黑，深色主题下画在近黑底上等于没有

需要描边或连线时，用这几类：

- `--st-accent` —— 品牌强调色，深色浅色都可见，卡片边框用的就是它
- `--dsw-alias-label-primary` / `--dsw-alias-label-tertiary` —— 文字色，两套主题都有定义
- 自己给回退值，且回退值要在深色底上看得见（不要回退成黑色）

改完必须自问一句：这个颜色在近黑背景上还能看见吗。

## 批量替换脚本必须先看 diff

用脚本做跨文件批量替换（改 token 名、改数值）时，正则匹配到的往往比预想的多：

- 把 `--st-radius-xs:var(--dsw-radius-xs,4px)` 替换成自引用 `--st-radius-xs:var(--st-radius-xs,4px)`，CSS 自引用无效，**全部圆角静默失效**
- 把注释里 `注释: 正文` 的空格吃掉，变成 `注释:正文`
- 把 `@media (max-width: 640px)` 的空格吃掉

所以：写完脚本先 `git diff` 逐段看，不要靠测试报错来发现。测试只覆盖被断言的部分，剩下的大量静默损坏它看不见。

## 下拉框在滚动容器底部时，选项会被裁掉

`<select>` 展开的选项列表由浏览器绘制，位置默认在控件**下方**。控件如果位于一个 `overflow:auto` 容器的底部，选项就会落到容器外被裁掉，看起来像"下拉框被遮住"。

处理方式：

- 容器上不要给它加 `overflow:hidden`
- 需要时让这一行 `overflow:visible`
- 控件不要紧贴滚动容器的最后一行

## 界面上不留说明文字

用户不是傻子。界面上只留**必要且简短**的说明，其余一概不写。

删过的实例（都是我自己加的，被作者逐条指出）：

- 标题栏书名后面那句「1 章 · 已定稿 1 段」——书名就是这一页的名字，后面不该跟统计
- 目录下半部分那个分区标题「文件操作」——四个按钮各干各的，起不出一个准确的名字，就不该有名字
- 关于弹窗里的解释性段落
- 按钮的 `title` 里写功能复述，比如「导出」写成「把合并稿导出为一个 Markdown 文件」

判断标准：

- **能靠位置、图标、上下文看懂的，不写**。输入框上方不需要「在这里输入」。
- **`title` 只写看不见的信息**：快捷键、会产生什么后果、与同名控件的区别。复述按钮名等于没写。
- **空状态才写一句**，说清「还没有 X」以及下一步点哪里，不解释为什么。
- **不解释设计意图**。界面上不出现「这样可以……」「会自动……」这类承诺式的句子。
- **不做欢迎语、不做成功提示的自我表扬**。保存成功有状态栏的读数就够了。

写文案时自问：删掉这句，用户会不会不知道下一步做什么？会——才留。

## 命名要让人看得懂

名字是给下一个读代码的人的，不是给写过它的人的。取名（函数、变量、文件、token）时自问：**没写过这段代码的人，看见这个名字能不能说出它大概做什么？** 说不出，就换。

踩过的实例（都是我被逐条指出的）：

- `statMtimeMs` —— mtime 是 Node 文件系统的行话，读的人要先会 stat 的词汇表。改成了 `modifiedTime`。
- `listDirEntries` —— "entries" 说了内部类型，没说用途。和 `listFiles` 挤在一起还得猜差别，砍成一个 `listDir`。

判断标准：

- **用读的人的语言，不用实现的语言**。`modifiedTime` 而不是 `statMtimeMs`——前者说事实，后者说实现机制。
- **一个名字只做一件事**。两个名字只差一点点（listDir / listFiles），读者就得猜差别；留一个，另一个删掉。
- **同类操作必须用同一个构词模式**。同一个动作不许一会儿叫 `listFile`、一会儿叫 `listDirEntries`、一会儿又叫 `readdir`——三个名字三种构词，读者得先建一张同义词表才能确定它们是不是一回事。一组同类原语要像一族：`ensureDir` / `listDir` 的参数都是目录，`readTextFile` / `writeTextFile` 是一对，`...Sync` 后缀整齐地跟在同步版后面。加了新成员，先看这族现有的构词，跟上去，而不是另起一个。
- **带契约的后缀可以用**（`writeFileAtomic` 的 Atomic、`...Sync`），契约本身就是读的人需要的信息；但如果每个名字都靠后缀补说明，就是后缀在替你写文档——改成在模块文档里说一次。
- **吃不准就问**。名字一旦散开，改回来要动所有调用方——定名前把候选摆给作者看，比定名后改便宜得多。

## 代码往哪放：这个项目的分层

通用的架构判断见用户级标准「代码组织」一节。这里只写本项目的具体归属——照着填，不用每次重新想。

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
- `shared/` —— **不认识书**，也不 import `api`、`mosaic/` 或 `index.js`。纯逻辑、通用 hook、UI 原子件、存储键、手势。
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
- 状态四分类：书（React state + 磁盘，`updateBook`/`adoptWritten`）、会话（`DOCK_STORE`，按书 id，不落盘）、偏好（localStorage，经 `usePersisted`/`storage.js`）、页面（组件 `useState`，随页面销毁）。新状态先说清属于哪类。

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

