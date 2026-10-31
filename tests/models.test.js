import test from 'node:test'
import assert from 'node:assert/strict'
import { loadClientForRender, findByText, visibleText } from './helpers/render-hooks.mjs'

/**
 * The model page: four jobs, each on the model the writer chooses, or on dsh's current model
 * when they have not chosen.
 *
 * The picker is built from the host's catalogue. The panel's own job is to store a choice and to
 * say what is actually going to run — a page that offers models the host cannot route to, or
 * names a model it will not use, is worse than no settings at all.
 */

const t = (key, params) => {
  if (params === undefined) return key
  return `${key} ${Object.entries(params).map(([name, value]) => `${name}=${value}`).join(' ')}`
}

/** The host catalogue, as `/api/story.catalog` answers it. */
const CATALOG = {
  groups: [
    { id: 'deepseek-account', name: 'DeepSeek', models: [{ model: 'deepseek-flash', name: 'DeepSeek Flash' }] },
    { id: 'magpie', name: 'Magpie', models: [{ model: 'workbuddy/gpt-6-luna', name: 'GPT-6-Luna' }] },
  ],
}

/** An api double for the three routes the page uses. */
const EFFORTS = {
  'deepseek-flash': [{ id: 'low', name: 'Low' }, { id: 'high', name: 'High' }],
}

function apiFor({
  overrides = {}, inherited = { provider: 'deepseek-account', model: 'deepseek-flash' },
  groups = CATALOG.groups, efforts = EFFORTS,
} = {}) {
  const written = []
  const rolesFor = (next) => Object.fromEntries(
    ['continue', 'suggest', 'chat', 'mosaic'].map((role) => [role, next[role] ?? inherited]),
  )
  const file = '~/.dsh/storywriting/settings.json'
  return {
    written,
    models: async () => ({ ok: true, roles: rolesFor(overrides), overrides, inherited, file }),
    catalog: async () => ({ ok: true, groups }),
    efforts: async (_provider, model) => ({ ok: true, efforts: efforts[model] ?? [] }),
    setModel: async (role, selection) => {
      written.push([role, selection])
      const next = { ...overrides }
      if (selection === null) delete next[role]
      else next[role] = selection
      Object.assign(overrides, next)
      return { ok: true, roles: rolesFor(next), overrides: next, file }
    },
  }
}

/** Let the promise a click started resolve before rendering again. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

async function mountPage({ api = apiFor() } = {}) {
  const { plugin, render, rerender } = loadClientForRender()
  const changed = []
  // What the page hands to the status bar. A failure is reported, not drawn, so a test that mounts
  // the page on its own has to read this instead of looking for a banner in the tree.
  const notices = []
  const props = { t, api, onChange: () => changed.push('changed'), onNotice: (text) => notices.push(text) }
  let mounted = await render(plugin.__components.ModelsPage, props)
  // The page fills itself from two routes in an effect; the mount is over before they answer.
  await flush()
  mounted = await rerender(plugin.__components.ModelsPage, props)
  return {
    changed,
    /** The last message the page reported, which is what the status bar would show. */
    get notice() { return notices.length === 0 ? '' : notices[notices.length - 1] },
    get tree() { return mounted.tree },
    rerender: async () => { mounted = await rerender(plugin.__components.ModelsPage, props); return mounted.tree },
  }
}

/** Every element under a node whose class list contains the token. */
function allByClass(node, token, found = []) {
  if (node === null || typeof node !== 'object') return found
  if (Array.isArray(node)) { node.forEach((child) => allByClass(child, token, found)); return found }
  if (typeof node.props?.className === 'string' && node.props.className.split(/\s+/).includes(token)) found.push(node)
  for (const child of node.children ?? []) allByClass(child, token, found)
  return found
}

/** Open the picker of the first row and return its menu entries. */
async function openFirstMenu(page) {
  allByClass(page.tree, 'st-mselect-button')[0].props.onClick()
  const tree = await page.rerender()
  const items = []
  const walk = (node) => {
    if (node === null || typeof node !== 'object') return
    if (Array.isArray(node)) { node.forEach(walk); return }
    if (node.props?.role === 'menuitem' && typeof node.props.onClick === 'function') items.push(node)
    for (const child of node.children ?? []) walk(child)
  }
  walk(tree)
  return items
}

test('the page lists the four jobs and names the model each one will use', async () => {
  const page = await mountPage()
  const rows = allByClass(page.tree, 'st-model-row')
  // Four chat jobs, then the portrait section. The portrait is a fifth ROW because it lives in the
  // same drawer and the same file, but it is not a fifth job: it has no picker from the host's
  // catalogue and no reasoning axis, so counting it as one would make this test wrong about what
  // the page is for.
  assert.equal(rows.length, 5, 'four jobs, plus the portrait section')
  const text = visibleText(page.tree).join(' ')
  for (const key of ['model.role.continue', 'model.role.suggest', 'model.role.chat', 'model.role.mosaic']) {
    assert.ok(text.includes(key), `${key} is on the page`)
  }
  // There is no follow-dsh control any more: the inherited model is still shown by the picker.
  assert.equal((text.match(/model\.following/g) ?? []).length, 0, 'no follow labels')
  assert.equal(findByText(page.tree, 'model.followDefault'), undefined, 'and no follow button')
  const controls = allByClass(page.tree, 'st-mselect-button')
  assert.equal(controls.length, 5, 'four roles and the image model each have a picker')
  assert.ok(visibleText(controls[0]).join(' ').includes('deepseek-flash'), 'the control shows the model')
})

test('opening the picker offers every model the host can route to', async () => {
  const page = await mountPage()
  const items = await openFirstMenu(page)
  const labels = items.map((item) => visibleText(item).join(' '))
  assert.ok(labels.some((label) => label.includes('DeepSeek Flash')), 'the first provider is listed')
  assert.ok(labels.some((label) => label.includes('GPT-6-Luna')), 'and the second: one catalogue, not one provider')
  // The id travels with the name, because the id is what the config file holds.
  assert.ok(labels.some((label) => label.includes('workbuddy/gpt-6-luna')), 'the model id is shown')
  // The current model is marked, so opening the menu answers "what is it now" as well.
  assert.equal(items.filter((item) => item.props['data-current'] === 'true').length, 1)
})

test('built-in models are listed under 内置模型 with preset names', async () => {
  const groups = [{
    id: 'agnes', name: 'Agnes',
    models: [{ model: 'agnes-3.0-flash', name: 'preset-3.0-flash' }],
  }]
  const page = await mountPage({ api: apiFor({ groups, inherited: { provider: 'agnes', model: 'agnes-3.0-flash' } }) })
  allByClass(page.tree, 'st-mselect-button')[0].props.onClick()
  const tree = await page.rerender()
  const text = visibleText(tree).join(' ')
  assert.ok(text.includes('model.builtin'), 'the group is named as built-in')
  assert.ok(text.includes('preset-3.0-flash'), 'the preset name is shown')
  assert.ok(!text.includes('agnes-3.0-flash'), 'the routing id is not shown')
})

test('choosing a model pins that job, and only that job', async () => {
  const api = apiFor()
  const page = await mountPage({ api })
  const items = await openFirstMenu(page)
  const target = items.find((item) => visibleText(item).join(' ').includes('workbuddy/gpt-6-luna'))
  target.props.onClick()
  await flush()
  assert.deepEqual(api.written, [['continue', { provider: 'magpie', model: 'workbuddy/gpt-6-luna' }]],
    'the continuation is pinned, and the request names the job')
  await page.rerender()
  const text = visibleText(page.tree).join(' ')
  assert.equal(text.includes('model.pinnedTag'), false, 'the removed follow state is not shown')
})

test('the page no longer offers a follow-dsh button on any role', async () => {
  const api = apiFor({ overrides: { chat: { provider: 'magpie', model: 'workbuddy/gpt-6-luna' } } })
  const page = await mountPage({ api })
  assert.equal(findByText(page.tree, 'model.followDefault'), undefined, 'the button is gone')
})

test('the page names the file the choice is kept in', async () => {
  const page = await mountPage()
  const text = visibleText(page.tree).join(' ')
  assert.ok(text.includes('model.storedAt'), 'the caption is there')
  assert.ok(text.includes('~/.dsh/storywriting/settings.json'), `with the path, saw: ${text.slice(-120)}`)
})

test('pinning a model tells the panel to re-read the names it shows', async () => {
  // The status bar and the composer chip name a model, and both were read when the book opened.
  // If they are not re-read, the page and the chip disagree about who is about to answer.
  const page = await mountPage()
  const items = await openFirstMenu(page)
  items[1].props.onClick()
  await flush()
  assert.deepEqual(page.changed, ['changed'], 'the panel is asked to refresh what it names')
})

test('a host without the routes says so instead of showing a dead page', async () => {
  // The browser half is served from disk on every load; the host half is whatever the app was
  // started with. A 404 here means "restart dsh", not "this page is broken".
  const api = {
    models: async () => { throw new Error('/api/story.models failed: HTTP 404') },
    catalog: async () => { throw new Error('/api/story.models failed: HTTP 404') },
    setModel: async () => { throw new Error('/api/story.setModel failed: HTTP 404') },
  }
  const page = await mountPage({ api })
  // Reported to the status bar rather than drawn on the page: the panel has one corner for every
  // message, and this page is only one of the things that can raise one.
  assert.ok(page.notice.includes('model.routeMissing'),
    `the reason is named, saw: ${JSON.stringify(page.notice)}`)
  assert.ok(!page.notice.includes('HTTP 404'), 'and the raw status is not left for the writer to decode')
  assert.ok(!visibleText(page.tree).join(' ').includes('HTTP 404'), 'nor shown on the page itself')
})

test('each row offers the reasoning levels of its own model, as an axis', async () => {
  // The level belongs to the model: the same word means different things on different routes, and
  // a level offered for the wrong model is a failed request. The axis is a line because "higher"
  // has a direction, which a dropdown cannot show.
  const page = await mountPage()
  // The inherited model (deepseek-flash) has two levels; every row inherits it.
  const axes = allByClass(page.tree, 'st-effort')
  assert.equal(axes.length, 4, 'one axis per row that has levels')
  const stops = allByClass(axes[0], 'st-effort-stop')
  // The default stop leads, exactly as dsh's picker lists it; the model's own levels follow.
  assert.deepEqual(stops.map((stop) => visibleText(stop).join('')), ['status.effortDefault', 'Low', 'High'],
    'default first, then least to most')
  // Following dsh with no stored level IS the default state, so the default stop is the marked one.
  assert.equal(stops.filter((stop) => stop.props['data-on'] === 'true').length, 1,
    'the default stop is marked while no level is stored')
  assert.equal(stops[0].props['data-on'], 'true', 'and it is the first one')
})

test('picking a level writes the model and the level together', async () => {
  const api = apiFor()
  const page = await mountPage({ api })
  const stops = allByClass(page.tree, 'st-effort-stop')
  stops[2].props.onClick()
  await flush()
  // The row was following dsh, so the level pins the model as well: a level without a model is not
  // a selection the host can resolve.
  assert.deepEqual(api.written, [[
    'continue', { provider: 'deepseek-account', model: 'deepseek-flash', reasoningEffort: 'high' },
  ]])
  await page.rerender()
  const after = allByClass(page.tree, 'st-effort-stop')
  // One mark per row: the picked level here, and the default stop on the rows that store no
  // level — the default state is a real state now, not an unmarked absence.
  assert.equal(after.filter((stop) => stop.props['data-on'] === 'true').length, 4, 'one stop marked per row')
  assert.equal(after[2].props['data-on'], 'true', 'the picked level is the marked one on this row')
})

test('picking the default stop clears the stored effort but keeps the model', async () => {
  // The default stop is the way BACK: once a level is pinned, this is how the row returns to the
  // model's own default without unpinning the model itself. dsh's picker does the same by sending
  // a selection without an effort.
  const api = apiFor({ overrides: { continue: { provider: 'deepseek-account', model: 'deepseek-flash', reasoningEffort: 'high' } } })
  const page = await mountPage({ api })
  await flush()
  let stops = allByClass(page.tree, 'st-effort-stop')
  assert.equal(stops[2].props['data-on'], 'true', 'the pinned level is marked')
  stops[0].props.onClick()
  await flush()
  // Written with an EMPTY effort: modelOverride drops it, so the file pins the model only.
  assert.deepEqual(api.written, [[
    'continue', { provider: 'deepseek-account', model: 'deepseek-flash', reasoningEffort: '' },
  ]])
  await page.rerender()
  stops = allByClass(page.tree, 'st-effort-stop')
  assert.equal(stops[0].props['data-on'], 'true', 'and the default stop is the marked one again')
})

test('a save says it took effect, and the mark goes away on its own', async () => {
  // Writing a setting and seeing nothing is indistinguishable from a control that does nothing.
  const api = apiFor()
  const page = await mountPage({ api })
  const stops = allByClass(page.tree, 'st-effort-stop')
  stops[0].props.onClick()
  await flush()
  await page.rerender()
  assert.ok(visibleText(page.tree).join(' ').includes('model.saved'), 'saved is confirmed in the row')
  // It is a moment, not a state: the row's own tag already says what is set.
  await new Promise((resolve) => setTimeout(resolve, 2350))
  await page.rerender()
  assert.equal(visibleText(page.tree).join(' ').includes('model.saved'), false, 'and it clears itself')
})

test('the mosaic job is pinable like the others, and the page asks for its levels', async () => {
  const api = apiFor()
  const page = await mountPage({ api })
  // The mosaic row is the fourth; open ITS picker and pin a model there.
  const buttons = allByClass(page.tree, 'st-mselect-button')
  buttons[3].props.onClick()
  const tree = await page.rerender()
  const items = []
  const walk = (node) => {
    if (node === null || typeof node !== 'object') return
    if (Array.isArray(node)) { node.forEach(walk); return }
    if (node.props?.role === 'menuitem' && typeof node.props.onClick === 'function') items.push(node)
    for (const child of node.children ?? []) walk(child)
  }
  walk(tree)
  const target = items.find((item) => visibleText(item).join(' ').includes('workbuddy/gpt-6-luna'))
  assert.ok(target, 'the mosaic row offers the same catalogue')
  target.props.onClick()
  await flush()
  assert.deepEqual(api.written, [['mosaic', { provider: 'magpie', model: 'workbuddy/gpt-6-luna' }]],
    'the mosaic job is pinned under its own role name')
})
