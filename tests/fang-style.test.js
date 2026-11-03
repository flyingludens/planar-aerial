import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as fang from 'fang-style'

test('fang-style 导出完整的组件与 hook 面', () => {
  const widgets = ['Drawer', 'Dialog', 'ConfirmDialog', 'Dropdown', 'FileButton',
    'Segmented', 'List', 'ListRow', 'SplitPane', 'TooltipLayer', 'Chevron']
  const hooks = ['useDismiss', 'usePersisted', 'useClosingAnimation', 'useSessionState']
  // The localStorage helpers the panel's preference hooks sit on; the panel imports them from
  // here and keeps only its own key names.
  const storage = ['readStored', 'writeStored', 'storageAvailable']
  for (const name of [...widgets, ...hooks, ...storage]) {
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

test('关键令牌值被钉住：库的值级漂移在这里现形', () => {
  const token = (name) => {
    const hit = fang.FANG_CSS.match(new RegExp(`--${name}:([^;]+);`))
    return hit === null ? undefined : hit[1].trim()
  }
  // 颜色：面板的身份色与墨色三层（改这些值 = 全部使用方变样，必须显式 bump）。
  assert.equal(token('fang-accent'), '#c3272b')
  assert.equal(token('fang-danger'), '#ec1313')
  assert.equal(token('fang-ink-primary'), '#f2f2f3')
  assert.equal(token('fang-bg'), '#000')
  // 刻度的两端：间距最小与最大步。
  assert.equal(token('fang-space-2'), '2px')
  assert.equal(token('fang-space-24'), '24px')
  // 圆角与形状。
  assert.equal(token('fang-radius-panel'), '28px')
  assert.equal(token('fang-radius-pill'), '999px')
  // 框架几何与高度梯子。
  assert.equal(token('fang-frame-gutter'), '28px')
  assert.equal(token('fang-titlebar-height'), '68px')
  assert.equal(token('fang-statusbar-height'), '30px')
  assert.equal(token('fang-btn-height-lg'), '36px')
  assert.equal(token('fang-hit-target'), '44px')
  // 层级表与动效对。
  assert.equal(token('fang-layer-menu'), '60')
  assert.equal(token('fang-layer-modal'), '90')
  assert.equal(token('fang-duration-open'), '180ms')
  assert.equal(token('fang-duration-close'), '140ms')
  // 阴影配方存在（配方结构复杂，这里钉存在性与墨色来源）。
  assert.match(fang.FANG_CSS, /--fang-card-shadow:[^;]*var\(--fang-hairline\)/)
  assert.match(fang.FANG_CSS, /--fang-menu-shadow:[^;]*var\(--fang-hairline\)/)
  assert.match(fang.FANG_CSS, /--fang-dialog-shadow:[^;]*var\(--fang-hairline\)/)
})
