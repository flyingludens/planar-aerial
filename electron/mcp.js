/**
 * A small local MCP endpoint over the same story service the panel uses.
 *
 * The transport is JSON-RPC over HTTP POST. It is deliberately not a second implementation of
 * the tools: every method below dispatches to the definitions created by createStoryTools, so a
 * harness and the in-app assistant see the same book, the same board and the same writes.
 */
import { randomUUID } from 'node:crypto'
import { createServer } from 'node:http'

const PROTOCOL = '2024-11-05'
const MAX_BODY = 2 * 1024 * 1024

const json = (res, status, value, headers = {}) => {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'authorization, content-type, mcp-session-id',
    'access-control-allow-methods': 'POST, GET, OPTIONS',
    ...headers,
  })
  res.end(value === undefined ? '' : JSON.stringify(value))
}

const rpcError = (id, code, message) => ({ jsonrpc: '2.0', id: id ?? null, error: { code, message } })

export async function startMcpServer({ tools, version = '0.0.0' } = {}) {
  const token = randomUUID()
  const session = randomUUID()
  const byName = new Map(tools.map((tool) => [tool.name, tool]))
  const clients = new Set()
  let lastActivity = 0
  let activeStreams = 0
  const touch = (request) => {
    lastActivity = Date.now()
    const id = request?.headers?.['mcp-session-id']
    if (typeof id === 'string' && id !== '') clients.add(id)
  }

  const call = async (message) => {
    const { id, method, params } = message ?? {}
    if (method === 'initialize') {
      clients.add(session)
      return {
        jsonrpc: '2.0', id,
        result: {
          protocolVersion: params?.protocolVersion ?? PROTOCOL,
          capabilities: { tools: {} },
          serverInfo: { name: 'planar-aerial', version },
        },
      }
    }
    if (method === 'notifications/initialized') return null
    if (method === 'ping') return { jsonrpc: '2.0', id, result: {} }
    if (method === 'tools/list') {
      return {
        jsonrpc: '2.0', id,
        result: {
          tools: tools.map((tool) => ({
            name: tool.name,
            description: tool.description,
            inputSchema: {
              ...(tool.parameters ?? { type: 'object', properties: {} }),
              properties: {
                ...(tool.parameters?.properties ?? {}),
                // A harness has no current panel selection; it names the book folder explicitly.
                book: { type: 'string', description: 'Book folder name inside the library. Omit to use the first book.' },
              },
            },
          })),
        },
      }
    }
    if (method === 'tools/call') {
      const tool = byName.get(params?.name)
      if (tool === undefined) return rpcError(id, -32602, `unknown tool: ${String(params?.name ?? '')}`)
      try {
        const args = params?.arguments ?? {}
        const value = await tool.execute(args)
        const content = typeof tool.output?.render === 'function'
          ? tool.output.render(args, value)
          : [{ type: 'text', text: JSON.stringify(value) }]
        return { jsonrpc: '2.0', id, result: { content, isError: false } }
      } catch (failure) {
        return {
          jsonrpc: '2.0', id,
          result: { content: [{ type: 'text', text: String(failure?.message ?? failure) }], isError: true },
        }
      }
    }
    return rpcError(id, -32601, `method not found: ${String(method ?? '')}`)
  }

  const server = createServer(async (req, res) => {
    if (req.method === 'OPTIONS') { json(res, 204); return }
    const pathname = new URL(req.url, 'http://local').pathname
    if (pathname !== '/mcp') { json(res, 404, rpcError(null, -32000, 'not found')); return }
    const auth = String(req.headers.authorization ?? '')
    if (auth !== `Bearer ${token}`) { json(res, 401, rpcError(null, -32001, 'unauthorized')); return }
    touch(req)
    if (req.method === 'GET') {
      // A Streamable HTTP client may keep a server-to-client SSE stream open. This server has no
      // unsolicited messages, so the stream is a heartbeat; POST remains the request path.
      res.writeHead(200, {
        'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive',
        'mcp-session-id': session,
      })
      activeStreams += 1
      res.write(': connected\n\n')
      const timer = setInterval(() => res.write(': ping\n\n'), 15000)
      req.on('close', () => { activeStreams = Math.max(0, activeStreams - 1); clearInterval(timer) })
      return
    }
    if (req.method !== 'POST') { json(res, 405, rpcError(null, -32000, 'use POST /mcp')); return }
    let raw = ''
    for await (const chunk of req) {
      raw += chunk
      if (raw.length > MAX_BODY) { json(res, 413, rpcError(null, -32002, 'body too large')); return }
    }
    let body
    try { body = JSON.parse(raw) } catch { json(res, 400, rpcError(null, -32700, 'parse error')); return }
    const messages = Array.isArray(body) ? body : [body]
    const answers = []
    for (const message of messages) {
      const answer = await call(message)
      if (answer !== null) answers.push(answer)
    }
    if (answers.length === 0) { res.writeHead(202, { 'mcp-session-id': session }); res.end(); return }
    json(res, 200, Array.isArray(body) ? answers : answers[0], { 'mcp-session-id': session })
  })

  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const port = server.address().port
  const url = `http://127.0.0.1:${port}/mcp`
  const config = {
    mcp: {
      'planar-aerial': {
        type: 'remote',
        url,
        headers: { Authorization: `Bearer ${token}` },
      },
    },
  }
  return {
    url, token, config, version,
    status: () => ({
      connected: activeStreams > 0 || (lastActivity > 0 && Date.now() - lastActivity < 300000),
      clients: clients.size,
      lastActivity,
    }),
    close: () => new Promise((resolve) => server.close(() => resolve())),
  }
}
