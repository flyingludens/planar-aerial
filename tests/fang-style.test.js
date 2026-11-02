import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as fang from 'fang-style'

test('fang-style 导出完整的组件与 hook 面', () => {
  const widgets = ['Drawer', 'Dialog', 'ConfirmDialog', 'Dropdown', 'FileButton',
    'Segmented', 'List', 'ListRow', 'SplitPane', 'TooltipLayer', 'Chevron']
  const hooks = ['useDismiss', 'usePersisted', 'useClosingAnimation', 'useSessionState']
  for (const name of [...widgets, ...hooks]) {
    assert.equal(typeof fang[name], 'function', `${name} 应该是函数`)
  }
  // SESSION_STORE 是状态仓对象（createStateStore 的结果），不是函数；检验它的接口。
  for (const method of ['read', 'write', 'subscribe']) {
    assert.equal(typeof fang.SESSION_STORE?.[method], 'function', `SESSION_STORE.${method} 应该是函数`)
  }
})

test('FANG_CSS 是只含 fang- 命名的样式表', () => {
  assert.equal(typeof fang.FANG_CSS, 'string')
  assert.match(fang.FANG_CSS, /\.fang-btn\{/)
  assert.doesNotMatch(fang.FANG_CSS, /--st-/)
  assert.doesNotMatch(fang.FANG_CSS, /\.st-/)
  assert.doesNotMatch(fang.FANG_CSS, /--dsw-/)
})
