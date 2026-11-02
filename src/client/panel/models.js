/**
 * Which model does which job.
 *
 * The panel has four jobs — continue, suggest, chat, board — and each can pin its own model or
 * inherit the session's. The page shows the four roles; the two pickers are how a model and an
 * effort level are chosen.
 */
import { React, h } from '../shared/react.js'
import { useNotice } from '../shared/hooks.js'
import { modelLabel } from '../shared/model-display.js'
import { Dialog, Segmented, useDismiss } from 'fang-style'


/**
 * The writer's own OpenAI-compatible models.
 *
 * A custom provider is stored in the same settings file as the roles, so a selection can point at
 * one exactly like a host model. The key is write-only: the list shows whether one is stored and
 * a blank field on edit keeps the existing key.
 */
function ProviderSection({ t, api, providers, onChanged }) {
  const [editing, setEditing] = React.useState(null)
  const [draft, setDraft] = React.useState({ id: '', name: '', baseURL: '', apiKey: '', models: [], kind: 'chat' })
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')
  const [modelsBusy, setModelsBusy] = React.useState(false)
  const [modelsError, setModelsError] = React.useState('')
  const [testing, setTesting] = React.useState(false)
  const [testText, setTestText] = React.useState('')

  // The endpoint owns its catalogue: typing a base URL (or opening an existing provider) reads
  // /models automatically. The debounce keeps a half-typed address from firing a request per key.
  React.useEffect(() => {
    if (editing === null) return undefined
    const baseURL = draft.baseURL.trim()
    if (!/^https?:\/\//i.test(baseURL) || typeof api?.providerModels !== 'function') {
      setModelsBusy(false)
      return undefined
    }
    let cancelled = false
    const timer = globalThis.setTimeout(() => {
      setModelsBusy(true)
      setModelsError('')
      api.providerModels({ id: draft.id, baseURL, apiKey: draft.apiKey }).then(
        (data) => {
          if (cancelled) return
          setDraft((prev) => (prev.baseURL.trim() === baseURL ? { ...prev, models: data?.models ?? [] } : prev))
          setModelsBusy(false)
        },
        (failure) => {
          if (cancelled) return
          setModelsBusy(false)
          setModelsError(String(failure?.message ?? failure))
        },
      )
    }, 500)
    return () => { cancelled = true; globalThis.clearTimeout(timer) }
  }, [editing, draft.baseURL, draft.apiKey])

  if (typeof api?.providers !== 'function' && typeof api?.saveProvider !== 'function') return null
  const open = (provider) => {
    setError('')
    setModelsError('')
    setTestText('')
    setDraft(provider === undefined
      ? { id: '', name: '', baseURL: '', apiKey: '', models: [], kind: 'chat' }
      : { id: provider.id, name: provider.name, baseURL: provider.baseURL, apiKey: '', models: provider.models, kind: provider.kind ?? 'chat' })
    setEditing(provider ?? {})
  }
  const test = () => {
    if (testing || typeof api?.providerTest !== 'function') return
    if (draft.baseURL.trim() === '') { setTestText(t('model.testNeedURL')); return }
    setTesting(true)
    setTestText('')
    api.providerTest({ id: draft.id, baseURL: draft.baseURL, apiKey: draft.apiKey }).then(
      (data) => { setTesting(false); setTestText(t('model.testOk', { n: data?.count ?? 0 })) },
      (failure) => { setTesting(false); setTestText(String(failure?.message ?? failure)) },
    )
  }
  const save = () => {
    if (busy || modelsBusy) return
    if (draft.name.trim() === '' || draft.baseURL.trim() === '' || draft.models.length === 0) {
      setError(t('model.customNeedFields'))
      return
    }
    setBusy(true)
    api.saveProvider({ ...draft, models: draft.models }).then(
      () => { setBusy(false); setEditing(null); if (typeof onChanged === 'function') onChanged() },
      (failure) => { setBusy(false); setError(String(failure?.message ?? failure)) },
    )
  }
  const remove = (provider) => {
    if (typeof api.deleteProvider !== 'function') return
    api.deleteProvider(provider.id).then(
      () => { if (typeof onChanged === 'function') onChanged() },
      (failure) => setError(String(failure?.message ?? failure)),
    )
  }
  return h('div', { className: 'st-custom-models' },
    h('div', { className: 'st-custom-models-head' },
      h('span', { className: 'st-model-role' }, t('model.custom')),
      h('button', { type: 'button', className: 'fang-btn st-custom-add', onClick: () => open(undefined) },
        t('model.customAdd'))),
    providers.length === 0
      ? h('div', { className: 'st-model-follow-tag' }, t('model.customEmpty'))
      : providers.map((provider) => h('div', { key: provider.id, className: 'st-custom-provider' },
          h('div', { className: 'st-custom-provider-main' },
            h('div', { className: 'st-custom-provider-name' }, provider.name),
            h('span', { className: 'st-custom-provider-kind' }, provider.kind === 'image' ? t('model.kindImage') : t('model.kindChat')),
            h('div', { className: 'st-custom-provider-meta' }, provider.baseURL)),
          h('div', { className: 'st-custom-provider-meta' }, provider.models.map((model) => model.id).join(' · ')),
          h('div', { className: 'st-custom-provider-actions' },
            h('span', { className: 'st-model-follow-tag' }, provider.hasKey ? t('model.customKeyStored') : t('model.customKeyMissing')),
            h('button', { type: 'button', className: 'fang-btn fang-btn-ghost', onClick: () => open(provider) }, t('action.edit')),
            h('button', { type: 'button', className: 'fang-btn fang-btn-ghost', onClick: () => remove(provider) }, t('action.delete'))))),
    editing === null ? null : h(Dialog, {
      title: editing.id === undefined || editing.id === '' ? t('model.customAdd') : t('model.customEdit'),
      closeLabel: t('action.close'),
      onClose: () => setEditing(null), size: 'medium',
    },
      h('div', { className: 'st-dialog-field' },
        h('span', { className: 'st-dialog-label' }, t('model.kind')),
        Segmented({
          label: t('model.kind'),
          options: [
            { value: 'chat', label: t('model.kindChat') },
            { value: 'image', label: t('model.kindImage') },
          ],
          value: draft.kind ?? 'chat',
          onChange: (kind) => setDraft({ ...draft, kind }),
          testId: 'model-provider-kind',
        })),
      h('div', { className: 'st-dialog-field' },
        h('span', { className: 'st-dialog-label' }, t('model.customName')),
        h('input', { className: 'st-input', value: draft.name, onChange: (e) => setDraft({ ...draft, name: e.target.value }) })),
      h('div', { className: 'st-dialog-field' },
        h('span', { className: 'st-dialog-label' }, t('model.customBaseURL')),
        h('input', { className: 'st-input', value: draft.baseURL, placeholder: 'https://api.example.com/v1', onChange: (e) => setDraft({ ...draft, baseURL: e.target.value }) })),
      h('div', { className: 'st-dialog-field' },
        h('span', { className: 'st-dialog-label' }, t('model.customKey')),
        h('input', {
          className: 'st-input', type: 'password', value: draft.apiKey,
          placeholder: editing.id === undefined || editing.id === '' ? '' : t('model.customKeyKeep'),
          onChange: (e) => setDraft({ ...draft, apiKey: e.target.value }),
        })),
      h('div', { className: 'st-dialog-field' },
        h('span', { className: 'st-dialog-label' }, t('model.customModels')),
        modelsBusy
          ? h('div', { className: 'st-model-follow-tag' }, t('model.customModelsLoading'))
          : modelsError !== ''
            ? h('p', { className: 'st-dialog-error' }, modelsError)
            : draft.models.length === 0
              ? h('div', { className: 'st-model-follow-tag' }, t('model.customModelsHint'))
              : h('div', { className: 'st-custom-model-list' },
                  draft.models.map((model) => h('span', { key: model.id, className: 'st-custom-model-chip' }, model.name ?? model.id)))),
      error === '' ? null : h('p', { className: 'st-dialog-error' }, error),
      testText === '' ? null : h('p', { className: 'st-dialog-hint' }, testText),
      h('div', { className: 'fang-dialog-actions' },
        typeof api?.providerTest === 'function'
          ? h('button', { type: 'button', className: 'fang-btn', disabled: testing, onClick: test },
              testing ? t('model.testing') : t('model.test'))
          : null,
        h('button', { type: 'button', className: 'fang-btn', onClick: () => setEditing(null) }, t('action.cancel')),
        h('button', { type: 'button', className: 'fang-btn fang-btn-primary', disabled: busy || modelsBusy, onClick: save },
          busy ? '…' : t('action.save')))),
  )
}

/**
 * The image endpoint, configured on its own.
 *
 * A picture request is not a chat request: it uses /images/generations, it has its own model
 * family, and a writer may point it at a different host than the one answering sentences. This
 * block therefore owns its endpoint, key and model instead of borrowing a chat provider row.
 */
function ImageSettings({ t, api, image, providers, flash, onPick }) {
  const [agnesModels, setAgnesModels] = React.useState([])
  const provider = image.provider ?? 'agnes'
  const custom = providers.find((row) => row.id === provider && row.kind === 'image')
  const imageProviders = providers.filter((row) => row.kind === 'image')

  React.useEffect(() => {
    if (provider !== 'agnes' || typeof api?.imageModels !== 'function') return undefined
    let alive = true
    api.imageModels({ provider: 'agnes' }).then(
      (data) => { if (alive) setAgnesModels(data?.models ?? []) },
      () => { if (alive) setAgnesModels([]) },
    )
    return () => { alive = false }
  }, [provider, api])

  const choices = provider === 'agnes' ? agnesModels : (custom?.models ?? [])
  const groups = [{
    id: provider,
    name: provider === 'agnes' ? t('model.builtin') : (custom?.name ?? t('model.imageCustom')),
    models: choices.map((model) => ({ model: model.id, name: model.name })),
  }]

  const chooseProvider = (next) => {
    const providerModels = imageProviders.find((row) => row.id === next)?.models ?? []
    onPick({
      provider: next,
      model: next === 'agnes' ? 'agnes-image-2.1-flash' : (providerModels[0]?.id ?? ''),
    })
  }

  return h('div', { className: 'st-model-row' },
    h('div', { className: 'st-model-row-head' },
      h('span', { className: 'st-model-role' }, t('model.imageRole')),
      flash ? h('span', { className: 'st-model-flash' }, t('model.saved')) : null),
    h('div', { className: 'st-model-row-head' },
      h('span', { className: 'st-model-follow-tag' }, t('model.imageProvider')),
      Segmented({
        label: t('model.imageProvider'),
        options: [
          { value: 'agnes', label: t('model.builtin') },
          ...imageProviders.map((row) => ({ value: row.id, label: row.name })),
        ],
        value: provider,
        onChange: chooseProvider,
        testId: 'model-image-provider',
      })),
    h('div', { className: 'st-model-row-head' },
      h('span', { className: 'st-model-follow-tag' }, t('model.imageModel'))),
    h(ModelSelect, {
      t, groups, value: { provider, model: image.model },
      onChange: (selection) => onPick({ model: selection.model }),
    }),
    h('div', { className: 'st-model-row-head' },
      h('span', { className: 'st-model-follow-tag' }, t('model.imageStyle')),
      Segmented({
        label: t('model.imageStyle'),
        options: IMAGE_STYLE_OPTIONS.map((option) => ({ value: option.id, label: t(option.label) })),
        value: image.style ?? 'realistic',
        onChange: (style) => onPick({ style }),
        testId: 'model-image-style',
      })),
  )
}

/**
 * The four portrait styles, in the order they are offered.
 *
 * The ids match the server's IMAGE_STYLES: the label is translated, the id travels, so the
 * stored value is language-independent.
 */
const IMAGE_STYLE_OPTIONS = [
  { id: 'realistic', label: 'model.style.realistic' },
  { id: 'anime', label: 'model.style.anime' },
  { id: 'pixel', label: 'model.style.pixel' },
  { id: 'sketch', label: 'model.style.sketch' },
]

/**
 * Which model does what.
 *
 * Three roles, because one model cannot be right for all three jobs: a continuation runs on a
 * keystroke and should be cheap and fast, a rewrite is the prose the writer keeps, and the chat
 * holds a conversation. Left alone, all three follow dsh's current model — the panel adds no
 * model catalogue of its own, it opens the host's directory, so the two cannot disagree about
 * which models exist.
 *
 * A pinned role is remembered under the dsh home; "use the default" clears it. The page shows
 * the resolved model either way, so the writer can see what is actually going to answer
 * instead of a word like "default" that names nothing.
 */

/**
 * Reasoning effort as a horizontal axis.
 *
 * A row of stops on one line, least to most: the levels are ordered by the adapter, and the
 * point of showing them as a line rather than a dropdown is that "higher" has a direction.
 * Nothing is invented when the model has no levels — the caller just does not render it.
 */
function EffortAxis({ t, efforts, value, onPick }) {
  if (!Array.isArray(efforts) || efforts.length === 0) return null
  // The default stop comes first, exactly as dsh's own picker does it: choosing it CLEARS the
  // stored effort (onPick('')), which is the only way back to the model's own default once a
  // level has been pinned. Marked "on" when no level is stored — that IS the default state.
  const stops = [{ id: '', name: t('status.effortDefault') }, ...efforts]
  return h('div', { className: 'st-effort', role: 'radiogroup', 'aria-label': t('label.effort') },
    stops.map((effort) => h('button', {
      key: effort.id || 'default', type: 'button', className: 'st-effort-stop',
      role: 'radio', 'aria-checked': effort.id === value ? 'true' : 'false',
      'data-on': effort.id === value ? 'true' : 'false',
      onClick: () => { if (typeof onPick === 'function') onPick(effort.id) },
    },
      h('span', { className: 'st-effort-dot', 'aria-hidden': true }),
      h('span', { className: 'st-effort-name' }, effort.name ?? effort.id))))
}

/**
 * A model picker for the settings page.
 *
 * Deliberately not the composer's chip: that one belongs to the conversation and switches the
 * session's model. This one only REPORTS a choice for one role — nothing is selected until the
 * panel stores it — so it takes the catalogue and a callback, and the row decides what the
 * choice means.
 *
 * The closed control names the model that will actually run, in both states, because "跟随
 * 默认" alone does not tell the writer which model that is.
 */

/**
 * A model picker for the settings page.
 *
 * Deliberately not the composer's chip: that one belongs to the conversation and switches the
 * session's model. This one only REPORTS a choice for one role — nothing is selected until the
 * panel stores it — so it takes the catalogue and a callback, and the row decides what the
 * choice means.
 *
 * The closed control names the model that will actually run, in both states, because "跟随
 * 默认" alone does not tell the writer which model that is.
 */
function ModelSelect({ t, groups, value, onChange }) {
  const [open, setOpen] = React.useState(false)
  const rootRef = React.useRef(null)
  useDismiss(rootRef, open, () => setOpen(false))
  const name = modelLabel(t, value)
  const rows = []
  for (const group of groups ?? []) {
    const builtin = group.id === 'agnes'
    rows.push(h('div', { key: `g:${group.id}`, className: 'st-model-group' },
      h('div', { className: 'st-model-group-name' }, builtin ? t('model.builtin') : group.name ?? group.id)))
    for (const model of group.models ?? []) {
      const current = value !== null && value !== undefined
        && value.provider === group.id && value.model === model.model
      rows.push(h('button', {
        key: `${group.id}:${model.model}`, type: 'button', className: 'st-model-item',
        role: 'menuitem', 'data-current': current ? 'true' : 'false',
        // The model id, not the display name: the id is what the config file holds and what
        // the host routes on, and two providers may name the same model differently.
        onClick: () => { setOpen(false); if (typeof onChange === 'function') onChange({ provider: group.id, model: model.model }) },
      }, h('span', { className: 'st-model-item-name' }, builtin
        ? `preset-${String(model.model).replace(/^agnes-/, '')}`
        : (model.name ?? model.model)),
        builtin ? null : h('span', { className: 'st-model-item-id' }, model.model)))
    }
  }
  if (rows.length === 0) rows.push(h('div', { key: 'none', className: 'st-model-empty' }, t('label.noModels')))
  return h('div', { className: 'st-mselect', ref: rootRef },
    h('button', {
      type: 'button', className: 'st-mselect-button',
      'aria-haspopup': 'menu', 'aria-expanded': open ? 'true' : 'false',
      onClick: () => setOpen((value_) => !value_),
    },
      h('span', { className: 'st-mselect-name' }, name),
      h('span', { className: 'st-mselect-caret', 'aria-hidden': true }, '⌄')),
    open ? h('div', { className: 'st-model-menu', role: 'menu' }, rows) : null)
}

/**
 * The four portrait styles, in the order they are offered.
 *
 * The ids match the server's IMAGE_STYLES: the label is translated, the id travels, so the
 * stored value is language-independent.
 */

/**
 * Which model does what.
 *
 * Three roles, because one model cannot be right for all three jobs: a continuation runs on a
 * keystroke and should be cheap and fast, a rewrite is the prose the writer keeps, and the chat
 * holds a conversation. Left alone, all three follow dsh's current model — the panel adds no
 * model catalogue of its own, it opens the host's directory, so the two cannot disagree about
 * which models exist.
 *
 * A pinned role is remembered under the dsh home; "use the default" clears it. The page shows
 * the resolved model either way, so the writer can see what is actually going to answer
 * instead of a word like "default" that names nothing.
 */
export function ModelsPage({ t, api, onChange, onNotice }) {
  const [state, setState] = React.useState({
    status: 'loading', roles: {}, overrides: {}, inherited: null, file: '', groups: [], error: '',
    // Reasoning levels per job, and which job was just written, for the confirmation.
    efforts: {}, flash: '',
    // The portrait settings: which image model, and in what style. Separate from the roles
    // above because an image model is not a chat model — different endpoint, different request.
    image: { provider: 'agnes', baseURL: '', model: 'agnes-image-2.1-flash', style: 'realistic' },
    providers: [],
  })
  useNotice(onNotice, state.error)
  const flashTimer = React.useRef(null)
  React.useEffect(() => () => {
    if (flashTimer.current !== null) globalThis.clearTimeout(flashTimer.current)
  }, [])
  /**
   * A missing route is a different problem from a failed one.
   *
   * The panel is served from disk on every load, so the browser half can be newer than the
   * host half that was started with the app: the page would otherwise show three rows it
   * cannot change and no reason why. Naming it turns a broken setting into one instruction.
   */
  const messageOf = (error) => {
    const text = String(error?.message ?? error ?? '')
    return /HTTP 404/.test(text) ? t('model.routeMissing') : text
  }
  const load = () => {
    if (typeof api?.models !== 'function') { setState((prev) => ({ ...prev, status: 'ready' })); return }
    // The catalogue and the current choices together: the page is useless with one and not the
    // other, and a failure of either is the same failure to the writer.
    Promise.all([
      api.models(),
      typeof api.catalog === 'function' ? api.catalog() : Promise.resolve({ groups: [] }),
      // A host that predates the custom-provider route still gets a working model page.
      typeof api.providers === 'function' ? api.providers().catch(() => ({ providers: [] })) : Promise.resolve({ providers: [] }),
    ]).then(
      ([data, catalogue, custom]) => {
        setState((prev) => ({
          ...prev,
          status: 'ready', roles: data.roles ?? {}, overrides: data.overrides ?? {},
          inherited: data.inherited ?? null, file: data.file ?? '',
          groups: catalogue?.groups ?? [], providers: custom?.providers ?? [], error: '',
          ...(data.image === undefined || data.image === null ? {} : { image: data.image }),
        }))
        for (const role of ['continue', 'suggest', 'chat', 'mosaic']) {
          fetchEfforts(role, data.roles?.[role] ?? data.inherited ?? null)
        }
      },
      (error) => setState((prev) => ({ ...prev, status: 'ready', error: messageOf(error) })),
    )
  }
  /** The levels one model offers. Empty is the answer for most models, not an error. */
  const fetchEfforts = (role, selection) => {
    if (selection === null || selection === undefined || typeof api?.efforts !== 'function') return
    api.efforts(selection.provider, selection.model).then(
      (data) => setState((prev) => ({
        ...prev, efforts: { ...prev.efforts, [role]: data?.efforts ?? [] },
      })),
      () => {},
    )
  }
  React.useEffect(load, [])
  const pick = (role, selection) => {
    if (typeof api?.setModel !== 'function') return
    api.setModel(role, selection).then(
      (data) => {
        setState((prev) => ({
          ...prev, roles: data.roles ?? prev.roles, overrides: data.overrides ?? prev.overrides,
          file: data.file ?? prev.file, error: '', flash: role,
        }))
        // Written, so the row can offer the levels of whatever model it now points at.
        fetchEfforts(role, data.roles?.[role] ?? null)
        // Confirmation. It is a timed mark rather than a state: "saved" is only news for a
        // moment, and a permanent badge would be noise on the next visit.
        if (flashTimer.current !== null) globalThis.clearTimeout(flashTimer.current)
        flashTimer.current = globalThis.setTimeout(() => {
          flashTimer.current = null
          setState((prev) => ({ ...prev, flash: '' }))
        }, 2200)
        // The panel names the models in the status bar and on the composer chip, and both were
        // read when the book opened. Without this the page would say one thing and the chip
        // another, which is worse than a stale name.
        if (typeof onChange === 'function') onChange()
      },
      (error) => setState((prev) => ({ ...prev, error: messageOf(error) })),
    )
  }
  const pickImage = (patch) => {
    const before = state.image
    const next = { ...before, ...patch }
    setState((prev) => ({ ...prev, image: next, flash: 'image', error: '' }))
    if (flashTimer.current !== null) globalThis.clearTimeout(flashTimer.current)
    flashTimer.current = globalThis.setTimeout(() => setState((prev) => ({ ...prev, flash: '' })), 1200)
    if (typeof api?.setImage !== 'function') return
    api.setImage(next).then(
      (data) => { if (data?.ok === true && data.image !== undefined) setState((prev) => ({ ...prev, image: data.image })) },
      (error) => setState((prev) => ({ ...prev, image: before, error: messageOf(error) })),
    )
  }

  // The four jobs, named. The role label is the whole explanation: 续写 is what a writer calls the
  // thing Tab does, 改写 is what they call the thing a rewrite is, and a sentence under each row
  // telling them their own vocabulary back was the definition of noise.
  const rows = [
    { role: 'continue', label: t('model.role.continue') },
    { role: 'suggest', label: t('model.role.suggest') },
    { role: 'chat', label: t('model.role.chat') },
    { role: 'mosaic', label: t('model.role.mosaic') },
  ]
  return h('div', { className: 'st-models' },
    rows.map((row) => {
      return h('div', { key: row.role, className: 'st-model-row' },
        h('div', { className: 'st-model-row-head' },
          h('span', { className: 'st-model-role' }, row.label),
          state.flash === row.role ? h('span', { className: 'st-model-flash' }, t('model.saved')) : null),
        h(ModelSelect, {
          t, groups: state.groups,
          // The resolved model, so an inherited row names the model it is following.
          value: state.roles[row.role] ?? state.inherited,
          onChange: (selection) => pick(row.role, selection),
        }),
        // The levels of THAT model, as an axis: the setting is a direction, not a menu.
        h(EffortAxis, {
          t, efforts: state.efforts[row.role] ?? [],
          value: (state.roles[row.role] ?? state.inherited)?.reasoningEffort ?? '',
          onPick: (id) => {
            const current = state.roles[row.role] ?? state.inherited
            if (current === null || current === undefined) return
            pick(row.role, { provider: current.provider, model: current.model, reasoningEffort: id })
          },
        }))
    }),
    // ---- the portrait settings ----
    //
    // A section of its own: an image model is a different endpoint with a different request and
    // its own key, not a fifth chat role. It shares the dropdown component so the two pickers
    // read as one system.
    h(ImageSettings, {
      t, api, image: state.image, providers: state.providers, flash: state.flash === 'image',
      onPick: pickImage,
    }),
    h(ProviderSection, {
      t, api, providers: state.providers,
      onChanged: load,
    }),
    // Where the choice is kept. A setting the writer can point at is a setting they can
    // back up, edit by hand, or copy to another machine.
    state.file === '' ? null : h('div', { className: 'st-model-file' },
      t('model.storedAt', { file: state.file })))
}

/**
 * Page typography: font size, line height and measure.
 *
 * These were fixed in the stylesheet (15px on a 1.85 line, 820px wide), which is a guess about
 * the writer's eyes and screen. Steps rather than sliders: a range input invites a value
 * between the stops, and for type there is no such thing. The choices are stored per browser
 * because they belong to the reader, not to the manuscript.
 */
/**
 * The settings page: how the page looks, and how often it is written to disk.
 *
 * Typography was its own drawer, which meant the panel had two places for "preferences about
 * how this panel behaves" — one called 排版 and one that did not exist. Saving belongs beside
 * type: both are things the writer sets once and then expects to hold.
 *
 * Type: fixed values in the stylesheet (15px on a 1.85 line, 820px wide) were a guess about
 * the writer's eyes and screen. Steps rather than sliders, because a range input invites a
 * value between the stops and for type there is no such thing.
 *
 * Auto-save: see AUTO_SAVE_DEFAULT. The row says what the wait costs, because "five minutes"
 * only means anything as "this much typing could be lost".
 *
 * Both are stored per browser: they belong to the reader, not to the manuscript.
 */
