/**
 * The model-calling scenes, in the order a writer meets them.
 *
 * A scene is one kind of model call, not one chapter: continuation and rewrite see different
 * context, and a continuity check sees another. The page draws each scene's composition from
 * this list, so a new route that calls a model belongs here or it is invisible to the writer.
 *
 * `recipe` names the context recipe the scene assembles (see context.js); a scene with no recipe
 * sends only its system prompt and the request's own text, so it has no context parts to show.
 */
export const SCENES = [
  { id: 'continue', recipe: 'continue' },
  { id: 'suggest', promptKey: 'suggest', recipe: 'suggest' },
  { id: 'chat', promptKey: 'chat', recipe: 'chat' },
  { id: 'review', promptKey: 'review' },
  { id: 'critique', promptKey: 'critique' },
  { id: 'consistency', promptKey: 'consistency' },
  { id: 'overview.chapter', promptKey: 'overview.chapter' },
  { id: 'overview.global', promptKey: 'overview.global' },
  { id: 'mosaic.check', promptKey: 'mosaic.check', recipe: 'mosaicCheck' },
  { id: 'mosaic.ask', promptKey: 'mosaic.ask', recipe: 'mosaicAsk' },
  { id: 'mosaic.relate', promptKey: 'mosaic.relate' },
  { id: 'writingStyle', promptKey: 'writingStyle' },
  { id: 'harness', recipe: 'harness' },
]

/** The part of a scene that is its system prompt. */
export const SYSTEM_PART = '@system'

/**
 * Sections a writer may replace with a copy.
 *
 * Only the ones whose official text is the same whichever chapter is open and whatever the
 * request carries. Chapter-scoped sections (本章人物, 本章梗概, 前后章原文) and request-scoped ones
 * (光标窗口, 本章正文) are excluded on purpose: a copy of one of them would freeze one chapter's
 * facts and apply them everywhere.
 */
export const REPLACEABLE_SECTIONS = new Set([
  'bookMeta', 'chapterList', 'globalSummary', 'settingCards', 'boardDigest', 'suspectFacts',
])
