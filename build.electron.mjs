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
  // fang-style 以 npm link 挂进来时，它的 react 解析不到消费方的副本（peer 在 link 模式
  // 下不可达），esbuild 会从库目录再拉一份 react——两份实例的 hooks 内部状态互不相通，
  // 面板白屏。alias 把两个入口都钉到本项目的同一份 React。
  alias: {
    react: join(ROOT, 'node_modules', 'react'),
    'react-dom': join(ROOT, 'node_modules', 'react-dom'),
  },
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
