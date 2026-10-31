# 架构

位面飞行分三层，外加两个运行宿主。

## 依赖方向

```text
src/client  →  domain  ←  lib
                  ↑
                不依赖任何一半
```

- `domain/` 只放书、树、调查板、id、状态这类两边共用的纯规则；不 import `node:*`、React、`lib/` 或 `src/client/`。
- `lib/` 是服务端：路由、存储、模型调用、写作工具、MCP 服务使用的领域服务。
- `src/client/` 是浏览器端：DSH 面板、Electron renderer 和官网静态站共用同一套组件。
- `electron/` 是 Node/桌面宿主，负责窗口、原生文件选择器、MCP HTTP 服务和 IPC。

## 服务端

`lib/service.js` 只做装配：读配置、构造模型运行时、注册路由、暴露写作工具。业务规则分散在：

- `lib/routes/books.js`：书库、书、打开目录、章节和保存；
- `lib/routes/writing.js`：续写、润色、对话；
- `lib/routes/mosaic.js`：调查板检查、关系、人物；
- `lib/routes/config.js`：模型、角色、图像、书库设置；
- `lib/store.js`：`book.json`、`mosaic.json`、快照和答案；
- `lib/agnes.js`：内置模型 id 与 `preset-*` 显示名称。

客户端只通过 `src/client/api.js` 的路径表访问服务端，不直接拼 URL。

## 书的数据

一本书是一个目录：

```text
library/
  书名/
    book.json       正文树、人物、设定、关系、元数据
    manuscript.md   合并稿镜像
    mosaic.json     调查板数据
    chapters/       章节镜像
    portraits/      人物头像
```

`book.json` 是唯一事实来源；Markdown 和章节文件是导出/镜像。写入时先更新 UI，再进入保存队列；服务端写入会返回新的 `book` 和 `token`，客户端只在没有新编辑时替换内存中的书。

## 客户端

- `src/client/panel/core.js`：面板装配、页面路由、书库和打开目录；
- `src/client/panel/library-state.js`：书库设置读取与切换；
- `src/client/panel/settings.js`：版式、保存间隔、快捷键和默认书库；
- `src/client/panel/models.js`：模型角色、内置模型显示和自定义 provider；
- `src/client/panel/mcp-panel.js`：MCP 地址、状态、配置和 Harness 启动；
- `src/client/shared/styles.js`：所有设计 token 和共享样式；
- `src/client/hosts/electron.js`：Electron renderer 的 host 装配。

## Electron

`electron/main.js`：

1. 创建共享 `createStoryService`；
2. 在 `127.0.0.1` 随机端口启动 MCP HTTP 服务；
3. 通过 IPC 暴露 `story:request`、`story:pickDirectory`、`story:mcpInfo`、`story:openHarness`；
4. 打开 `dist/electron/index.html`。

`electron/preload.cjs` 只做 contextBridge，不把 Node 能力直接交给页面。MCP Token 在每次启动时生成，不落盘。

## 官网

`src/client/hosts/site.js` 直接复用 `WelcomePage`，只替换主按钮为下载控件。静态站构建在 `build.site.mjs`，下载地址在 `site-downloads.json`，部署到 Cloudflare Pages 项目 `planaraerial`。

## 测试边界

- `node build.mjs` 始终先生成 `client.js`，测试读取构建产物。
- CSS 注释里不能出现反引号；样式模板字符串会被提前截断。
- 视觉尺寸和颜色走 `--st-*` token；不在局部写裸像素。
- 修改样式先跑 `node --test --test-force-exit tests/client-render.test.js`，再跑全量。
