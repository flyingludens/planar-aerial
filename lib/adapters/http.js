/**
 * A host-neutral HTTP adapter over the shared service.
 *
 * The service returns `{ path, handler }` rows that expect a Web `Request`. A standalone host
 * (Electron's main process, or a small Node server) can hand requests straight to this function;
 * DSH continues to use its own connection layer. Nothing here starts a server: binding a port and
 * authenticating callers is the host's decision, not the service's.
 */
import { fail } from '../routes/kernel.js'

export function createStoryHttpHandler(service) {
  const routes = new Map((service?.routes ?? []).map((row) => [row.path, row.handler]))
  return async function handleStoryRequest(request) {
    let pathname
    try {
      pathname = new URL(request.url, 'http://127.0.0.1').pathname
    } catch {
      return fail('bad request URL', 400)
    }
    const handler = routes.get(pathname)
    if (handler === undefined) return fail(`unknown story route: ${pathname}`, 404)
    return handler(request)
  }
}
