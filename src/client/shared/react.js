/**
 * React, and the `h` alias every component in this plugin uses.
 *
 * The bundle is CJS at the boundary — the host hands the factory a `require` that answers the
 * platform's modules — but the sources are ESM. So the one `require('react')` lives here, and
 * every other module imports from this file. Calling `require` in several modules would work
 * (the loader memoises), but it would also mean each of them silently depended on a global that
 * only exists inside the factory closure.
 */
const React = require('react')

/** `h` is `React.createElement`; the components read better without the long name. */
export const h = React.createElement
export { React }
