/**
 * What every route module is handed, and the two shapes every handler answers with.
 *
 * The route files exist because `lib/index.js` had grown to 1949 lines, 838 of which were the
 * thirty-five handlers. Splitting them by subject only works if the thing they all share is
 * small and stated in one place — that is this file.
 *
 * `apply` builds the kernel once and passes it down. A handler receives `route` and the payload
 * readers it needs, and nothing else: `ctx` reaches only the config routes, which are the ones
 * that talk to the host's own services.
 */

/** A success or failure body, never cached: the panel re-reads these. */
export const json = (value, status = 200) => Promise.resolve(
  Response.json(value, { status, headers: { 'cache-control': 'no-store' } }),
)

/** The failure shape `post()` on the client checks for. */
export const fail = (message, status = 200) => json({ ok: false, error: String(message) }, status)
