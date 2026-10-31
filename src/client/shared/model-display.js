/**
 * What a model selection may be called in the UI.
 *
 * The built-in Agnes provider is infrastructure, not a catalogue the writer manages: its model
 * ids are an implementation detail. Anywhere a single current model is named, it reads as
 * 内置模型. The picker menu still carries the real ids because choosing among them is a deliberate
 * act; this helper only hides the default from passive read-outs.
 */
/** The public preset name for a built-in model, e.g. agnes-3.0-flash -> preset-3.0-flash. */
export function presetLabel(t, selection) {
  if (selection !== null && selection !== undefined && selection.provider === 'agnes'
    && typeof selection.model === 'string') {
    return `preset-${selection.model.replace(/^agnes-/, '')}`
  }
  return modelLabel(t, selection)
}

export function modelLabel(t, selection) {
  if (selection !== null && selection !== undefined && selection.provider === 'agnes') return t('model.builtin')
  if (selection !== null && selection !== undefined && typeof selection.model === 'string' && selection.model !== '') return selection.model
  return t('status.modelUnknown')
}
