#!/usr/bin/env node
/**
 * Build the browser half of this plugin.
 *
 * dsh loads a client plugin as ONE classic script that registers a factory:
 * `window.__ModuleLoader__.load({ id, factory })`. The factory body is CJS —
 * it is handed a `require` that answers platform modules (`react`) and nothing
 * else — and its `module.exports` is the plugin object the host applies.
 *
 * That contract is why the source cannot be many files: there is no import
 * graph at runtime, only that one registration. So the sources under
 * `src/client/` are ordinary ESM, and this script bundles them into the single
 * registration the loader expects. The banner/footer below ARE the wrapper that
 * used to be typed by hand at the top and bottom of client.js.
 *
 * Deliberately NOT minified. The output is what the tests read: hygiene checks
 * scan it for hard-coded pixel values, class names and dictionary keys, and a
 * minified bundle would hide every one of them behind mangled identifiers.
 *
 * `--watch` rebuilds on change; that is the mode to leave running while editing.
 */
import { build, context } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { readFileSync } from 'node:fs'

const ROOT = dirname(fileURLToPath(import.meta.url))

/**
 * The plugin's identity, read from package.json rather than repeated here.
 *
 * The About card shows the name, the version and the author, and a second copy of those three in
 * the source is a copy that drifts: a release bumps the version in package.json and the card goes
 * on claiming the old one. The id has always had to match that file anyway — the comment above it
 * used to say so, which is exactly the kind of promise that needs a machine to keep it.
 */
const MANIFEST = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
/** The package id the host knows this plugin by; it must match package.json. */
const ID = MANIFEST.name

/** Modules the browser module table answers, so they must not be bundled. */
const EXTERNALS = ['react', 'react/jsx-runtime', 'react-dom']

const options = {
  entryPoints: [join(ROOT, 'src', 'client', 'index.js')],
  outfile: join(ROOT, 'client.js'),
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  external: EXTERNALS,
  // The identity, substituted as compile-time constants so the client cannot disagree with the
  // manifest it was built from. `define` rather than a runtime fetch: the panel is one classic
  // script with no manifest available to it in the browser.
  define: {
    __PLUGIN_NAME__: JSON.stringify(MANIFEST.name),
    __PLUGIN_VERSION__: JSON.stringify(MANIFEST.version ?? '0.0.0'),
    __PLUGIN_AUTHOR__: JSON.stringify(MANIFEST.author ?? ''),
    __PLUGIN_REPOSITORY__: JSON.stringify(MANIFEST.repository?.url ?? ''),
    __PLUGIN_LICENSE__: JSON.stringify(MANIFEST.license ?? ''),
    __PLUGIN_DESCRIPTION__: JSON.stringify(MANIFEST.description ?? ''),
  },
  sourcemap: false,
  minify: false,
  // The two halves of the registration. `factory` is a plain function, so the
  // banner opens it and the footer closes it; the CJS `module`/`exports` pair is
  // declared inside because the factory body assigns `module.exports`.
  banner: {
    js: `window.__ModuleLoader__.load({\n  id: ${JSON.stringify(ID)},\n  factory(require) {\n    var module = { exports: {} };\n    var exports = module.exports;`,
  },
  // esbuild turns the ESM default export into a CJS namespace object
  // (`{ __esModule, default }`), so the factory has to hand the host the
  // default itself. Returning `module.exports` would give it the namespace,
  // and the host would apply an object with no `apply` on it.
  footer: { js: '    return module.exports.default;\n  },\n});' },
  logLevel: 'info',
}

if (process.argv.includes('--watch')) {
  const ctx = await context(options)
  await ctx.watch()
  console.log(`[storywriting] watching src/client → client.js`)
} else {
  await build(options)
  console.log('[storywriting] built client.js')
}
