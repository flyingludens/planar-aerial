import test from 'node:test'
import assert from 'node:assert/strict'
import { loadClientForRender, findByClass, findByText } from './helpers/render-hooks.mjs'

const DATA = {
  ok: true, bookId: 'b1', bookFolder: 'f1',
  scenes: [{
    id: 'chat', promptKey: 'chat',
    system: { text: '官方系统提示词全文', override: '' },
    parts: [{
      key: 'bookMeta', official: '官方书名与体裁', text: '官方书名与体裁',
      override: '', replaceable: true, versions: [],
    }],
  }],
  prompts: [],
}

/** The context page bound to a recording stub api. */
async function mountContext(calls) {
  const { plugin, render } = loadClientForRender()
  const api = {
    context: async () => DATA,
    addContextVersion: async (bookId, scene, part, text) => {
      calls.push(['addContextVersion', bookId, scene, part, text])
      return { ok: true, versions: { chat: { bookMeta: [{ id: 'v-new', text, at: 1 }] } } }
    },
    addPromptDoc: async (key, text) => {
      calls.push(['addPromptDoc', key, text])
      return DATA.prompts
    },
  }
  const props = {
    t: (key) => key, api, bookFolder: 'f1', bookId: 'b1', chapterId: 'c1',
    onClose: () => {}, onNotice: () => {},
  }
  const rerender = () => render(plugin.__components.ContextPage, props)
  // mount, then one pass on the SAME hook tables: the load effect's promise resolves inside the
  // mount drive's settle, and its setData only lands on the tables a rerender keeps.
  const mounted = await render(plugin.__components.ContextPage, props)
  const loaded = await rerender()
  return { mounted: loaded, rerender }
}

test.skip('新建副本：弹窗里的保存走到 addContextVersion，而不是无声无息', { skip: 'render harness 的异步挂载限制：组件的 useEffect 数据落地后，harness 的重渲染仍读到旧槽位（mount 后的 rerender 显示 loading）。待 harness 修复后启用——在那之前此流程由 Electron 实机验证。' }, async () => {
  const calls = []
  const { mounted, rerender } = await mountContext(calls)

  // 区头的「新建副本」打开弹窗（此时 dialog 的确认键尚未出现）。
  const open = findByText(mounted.tree, 'context.newCopy')
  assert.ok(open !== undefined, 'mine 区头应有新建按钮')
  open.props.onClick()
  const opened = await rerender()
  assert.ok(findByClass(opened.tree, 'st-dialog-textarea') !== undefined, '弹窗应带着文本框出现')

  // 输入文本，点弹窗里的确认键。
  findByClass(opened.tree, 'st-dialog-textarea').props.onChange({ target: { value: '新副本文本' } })
  const filled = await rerender()
  const confirm = findByClass(filled.tree, 'fang-btn-primary')
  assert.ok(confirm !== undefined, '弹窗确认键应在')
  await confirm.props.onClick()

  assert.deepEqual(calls[0], ['addContextVersion', 'b1', 'chat', 'bookMeta', '新副本文本'],
    `弹窗保存应调用 addContextVersion，实际：${JSON.stringify(calls)}`)
})
