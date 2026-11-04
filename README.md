# 位面飞行 · Planar Aerial

位面飞行是一个面向长篇小说写作的段落级编辑器。它以 DSH 面板和独立 Electron 应用两种形态运行：左边是书的结构，中间是正文，调查板负责人物、地点、物品、事件和关系，模型按「续写 / 润色 / 对话 / 调查板」四个角色分别配置。

当前版本为 `0.1.0-beta.1`，仓库仍为私有，安装包未签名、未公证。

## 功能

- 段落级写作，章节树与正文分离，支持卷 / 章 / 节。
- 续写、润色、对话和调查板四类模型角色，每类可单独指定模型与推理强度。
- 内置模型统一显示为「内置模型」，列表名称为 `preset-*`，不暴露内部 provider 名称。
- 调查板：人物、地点、组织、物品、事件、关系，以及基于当前正文的检查。
- 书库管理：切换书库、打开已有书目录、在空目录直接新建书。
- 三种保存路径：自动保存、手动保存、导出 Markdown。
- Electron 独立版内置本地 MCP 服务，可让 OpenCode 等 Harness 调用写作工具。
- 官网首页：<https://planaraerial.pages.dev>

## 结构

```text
domain/                 纯领域模型与规则，不依赖 Node、React 或 lib/
lib/                    服务端：路由、存储、模型适配、写作工具、MCP 用的服务
  routes/               按使用者分组的 HTTP 路由
  adapters/             宿主适配层
src/client/
  shared/               通用逻辑、hooks、UI 原子件和样式
  panel/                写作面板、书库、设置、模型页、目录栏
  mosaic/               调查板
  hosts/                浏览器和 Electron 的装配入口
electron/               独立桌面应用：主进程、preload、renderer、MCP 服务
tests/                  Node 测试
```

依赖方向是单向的：`src/client → domain ← lib`。`domain/` 不依赖任何一半；客户端不依赖服务端代码，服务端不依赖客户端代码。

## 环境

- Node.js 24+
- macOS 或 Windows（Electron 桌面端）
- DSH（使用 DSH 面板形态时）

## 安装到 DSH

```bash
dsh plugin --profile web add @flyingludens/dsh-planar-aerial@beta
```

安装或升级后重启 DSH，侧边栏会出现「位面飞行」入口。插件包只包含 DSH 客户端和服务端代码，不包含 Electron 安装包或官网静态站。

## 开发

```bash
npm install
npm test
npm run lint
```

常用命令：

```bash
npm run build          # 构建 DSH 客户端 client.js
npm run dev            # watch 构建
npm run electron:build # 构建 Electron renderer
npm run electron:start # 构建并启动 Electron
npm run build:all      # 构建 DSH + Electron + 官网静态站
npm run site:build     # 只构建官网静态站
```

测试命令带 `--test-force-exit`，避免自动保存队列和动画定时器把 Node 测试进程挂住。

## Electron 独立版

```bash
npm run electron:start
```

独立版的数据目录是 Electron 的 `app.getPath('userData')/storywriting`，包含：

- `settings.json`：模型角色、图像模型、默认书库
- `library/`：默认书库
- 事件日志与运行状态

独立版通过环境变量配置 OpenAI 兼容端点：

```bash
STORYWRITING_BASE_URL=https://api.openai.com/v1 \
STORYWRITING_API_KEY=... \
STORYWRITING_MODEL=gpt-4o-mini \
npm run electron:start
```

不要把 API Key 写进仓库、提交记录或截图。

## 书库

设置页的「默认存书目录」是一个目录选择器，不是手填路径。选择目录后：

- 目录里有 `book.json`：直接打开这本书；
- 目录里是书库：切换书库并显示书架；
- 目录是空的：在该目录直接创建一本书，书名取目录名。

开始页新建书弹窗、书架新建书弹窗、左侧目录栏的「打开目录」共用同一套目录能力。DSH 使用宿主的 `uiWorkspace.pickDirectory()`，Electron 使用原生 `dialog.showOpenDialog`。

## MCP

Electron 右上角「MCP」入口会显示本机 MCP 服务地址、Bearer Token、连接状态和 OpenCode 配置。

MCP 服务只监听 `127.0.0.1`，每次启动生成新的随机端口和 Token。当前工具：

- `story_books`：列出书库中的书和目录；
- `story_read`：读取当前书、章节、人物和设定；
- `story_write_cast`：写入人物和关系；
- `story_write_settings`：写入世界设定；
- `story_mosaic_query`：查询调查板实体和关系。

所有写作工具都接受一个可选的 `book` 参数，值是 `story_books` 返回的目录名；省略时使用书库中的第一本书。完整配置和调用说明见 [docs/MCP.md](docs/MCP.md)。

## 打包

### macOS

使用 `@electron/packager` 生成 `.app`，再用 `hdiutil` 生成 DMG：

```bash
npx @electron/packager . "PlanarAerial" \
  --platform=darwin --arch=arm64 \
  --out=dist/releases --overwrite \
  --app-version=0.1.0-beta.1 --build-version=0.1.0-beta.1

hdiutil create -volname "Planar Aerial" \
  -srcfolder dist/releases/PlanarAerial-darwin-arm64/PlanarAerial.app \
  -ov -format UDZO \
  dist/releases/PlanarAerial-0.1.0-beta.1-mac-arm64.dmg
```

Intel 构建把 `--arch=arm64` 换成 `--arch=x64`。

### Windows

```bash
npx electron-builder --win nsis --x64
```

配置在 [electron-builder.yml](electron-builder.yml)，输出在 `dist/releases/installer`。

安装包目前没有代码签名和公证：macOS 首次打开可能需要右键「打开」，Windows 可能出现 SmartScreen 提示。

## 文档

- [架构](docs/ARCHITECTURE.md)
- [MCP 配置](docs/MCP.md)
- [开发与贡献](CONTRIBUTING.md)

## 许可证

MIT，见 [LICENSE](LICENSE)。

作者：flyingludens
