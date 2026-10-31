# 开发与贡献

## 开始

```bash
npm install
npm test
npm run lint
```

项目要求 Node.js 24 或更新版本。

## 代码位置

- `domain/`：两边共用的纯领域模型和规则；
- `lib/`：服务端路由、存储、模型调用和写作工具；
- `src/client/`：面板、调查板、共享 UI 和宿主装配；
- `electron/`：桌面主进程、preload、renderer 和 MCP 服务；
- `tests/`：Node 测试。

不要直接从客户端拼服务端 URL，统一走 `src/client/api.js`。

## 验证

```bash
npm test        # 构建 client.js 并跑全量测试
npm run lint
```

修改样式时先单独跑：

```bash
node --test --test-force-exit tests/client-render.test.js
```

`client.js` 是构建产物：改 `src/client/`，不要手改 `client.js`。

## 样式

- 长度、尺寸、间距、圆角、字号都使用 `--st-*` token；
- 不在局部规则里写裸像素；
- CSS 写在模板字符串里，注释中不能出现反引号；
- 新颜色必须在深色主题下可见。

## 提交

一个提交只做一件事。提交信息说明「为什么改」，不要只列文件名。不要提交本地书库、API Key、MCP Token 或 `dist/` 构建产物。

## 许可证

贡献代码按 MIT 许可证授权，版权归 flyingludens。
