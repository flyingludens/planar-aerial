/**
 * The package's public surface.
 *
 * The implementation is split by host: `service.js` is the shared book/routes/tools layer and
 * `adapters/dsh.js` is the Cordis plugin around it. Re-exports stay here because the package
 * root is what `exports` in package.json points at and what callers and tests import.
 */
export { apply, name, inject } from './adapters/dsh.js'
export { createStoryService, createStoryTools } from './service.js'
export { createStoryHttpHandler } from './adapters/http.js'
export { createModelRuntime } from './model-runtime.js'
export { fetchProviderModels } from './custom-provider.js'
export { createStoryMcpTools } from './adapters/mcp.js'
export { stripJsonBlock } from './llm.js'

export {
  IMAGE_STYLES, IMAGE_DEFAULT, libraryFrom, modelOverride, normalizeImageSettings, mergeImageSettings, maskImageSettings,
  readSettings, writeSettings, resolveModelSelection,
} from './settings.js'
export {
  extractSearchIntent, extractProposal, stripProposal, continueSystem, cleanContinuation,
  parseStyleBlock, parseIssueBlock, parseReviewBlock, parseCritiqueBlock,
} from './ai.js'
export { applyProposalToBook } from './mosaic.js'
