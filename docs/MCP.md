# MCP

Electron 独立版内置一个本机 MCP 服务，让 OpenCode 等 Harness 用同一套写作工具读写当前书库。

## 启动

启动 Electron 后，点右上角「MCP」。面板会显示：

- MCP 地址；
- Bearer Token；
- 当前连接状态；
- 可复制的 OpenCode 配置；
- 「打开 Harness」按钮。

服务只监听 `127.0.0.1`，端口和 Token 每次启动重新生成；关闭 Electron 后服务停止。

## OpenCode 配置

把面板里的配置加入 OpenCode 的 MCP 配置：

```json
{
  "mcp": {
    "planar-aerial": {
      "type": "remote",
      "url": "http://127.0.0.1:端口/mcp",
      "headers": {
        "Authorization": "Bearer 令牌"
      }
    }
  }
}
```

不要把 Token 写到公开文件或提交记录里。每次重启 Electron 后，端口和 Token 会变化，需要更新配置。

## 工具

| 工具 | 用途 |
| --- | --- |
| `story_books` | 列出书库和书目录 |
| `story_read` | 读取当前书、章节、人物和设定 |
| `story_write_cast` | 写入人物和关系 |
| `story_write_settings` | 写入世界设定 |
| `story_mosaic_query` | 查询调查板实体和关系 |

除 `story_books` 外，工具都支持可选的 `book` 参数，值为 `story_books` 返回的目录名；不传时使用书库中的第一本书。

## 协议

服务实现 MCP Streamable HTTP 的基本方法：

- `initialize`
- `notifications/initialized`
- `ping`
- `tools/list`
- `tools/call`

请求使用 JSON-RPC 2.0，POST 到 `/mcp`；服务同时支持 GET `/mcp` 的 SSE 心跳流。鉴权使用 `Authorization: Bearer <token>`。

## 连接状态

面板每 3 秒刷新一次状态：

- 有活动中的 SSE 流，或最近 5 分钟收到过请求：显示「已连接」；
- 否则显示「等待连接」。

这只表示 MCP 服务是否被 Harness 访问过，不表示 Harness 当前正在执行哪本书的操作。

## 唤起 Harness

「打开 Harness」会尝试：

1. `PLANAR_HARNESS_PATH` 指定的可执行文件/应用路径；
2. macOS 的 `/Applications/OpenCode.app`；
3. `opencode://` 协议。

唤起应用不等于自动写入 OpenCode 配置；首次使用仍需要把上面的 MCP 配置加入 OpenCode。

## 安全

- 服务只绑定回环地址，不监听局域网；
- Token 每次启动随机生成；
- 工具可以读写书库文件，调用方应被视为可信。
- 不要把 MCP Token 发到公开聊天、日志或截图里。
