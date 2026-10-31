/**
 * MCP adapter over the shared service.
 *
 * The standalone app can expose the same agent tools the DSH plugin registers, without copying
 * their definitions. `createStoryMcpTools` only reshapes each service tool into the MCP shape
 * (`inputSchema`, one async handler returning content); the execute functions are the service's.
 */
export function createStoryMcpTools(service) {
  return (service?.tools ?? []).map((definition) => ({
    name: definition.name,
    description: definition.description,
    inputSchema: definition.parameters ?? { type: 'object', properties: {} },
    async handler(args = {}) {
      const value = await definition.execute(args)
      const rendered = typeof definition.output?.render === 'function'
        ? definition.output.render(args, value)
        : undefined
      const text = (rendered ?? [])
        .filter((part) => part && typeof part.text === 'string' && part.text !== '')
        .map((part) => part.text)
        .join('\n')
      return {
        content: [{ type: 'text', text: text === '' ? JSON.stringify(value) : text }],
        structuredContent: value,
      }
    },
  }))
}
