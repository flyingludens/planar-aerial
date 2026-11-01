#!/usr/bin/env node
/** Build the Electron renderer from the shared client sources. DSH's client.js is untouched. */
import { build } from 'esbuild'
import { copyFile, mkdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(fileURLToPath(import.meta.url))
const OUT = join(ROOT, 'dist', 'electron')
const MANIFEST = JSON.parse(await readFile(join(ROOT, 'package.json'), 'utf8'))
await mkdir(OUT, { recursive: true })
await build({
  entryPoints: [join(ROOT, 'src', 'client', 'hosts', 'electron.js')],
  outfile: join(OUT, 'renderer.js'),
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'es2022',
  sourcemap: true,
  minify: false,
  define: {
    'process.env.NODE_ENV': '"production"',
    __PLUGIN_NAME__: JSON.stringify(MANIFEST.name),
    __PLUGIN_VERSION__: JSON.stringify(MANIFEST.version ?? '0.0.0'),
    __PLUGIN_AUTHOR__: JSON.stringify(MANIFEST.author ?? ''),
    __PLUGIN_REPOSITORY__: JSON.stringify(MANIFEST.repository?.url ?? ''),
    __PLUGIN_LICENSE__: JSON.stringify(MANIFEST.license ?? ''),
    __PLUGIN_DESCRIPTION__: JSON.stringify(MANIFEST.description ?? ''),
  },
  logLevel: 'info',
})
await copyFile(join(ROOT, 'electron', 'index.html'), join(OUT, 'index.html'))
console.log('[storywriting] built dist/electron')
