import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const ROOT = dirname(fileURLToPath(import.meta.url))
const OUT = join(ROOT, 'dist', 'site')
const downloads = JSON.parse(await readFile(join(ROOT, 'site-downloads.json'), 'utf8'))

await mkdir(OUT, { recursive: true })
await build({
  entryPoints: [join(ROOT, 'src', 'client', 'hosts', 'site.js')],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2020'],
  outfile: join(OUT, 'site.js'),
  minify: true,
  sourcemap: false,
  define: {
    'process.env.NODE_ENV': '"production"',
    __SITE_DOWNLOAD_MAC_ARM64__: JSON.stringify(process.env.SITE_DOWNLOAD_MAC_ARM64 ?? downloads.macArm64 ?? ''),
    __SITE_DOWNLOAD_MAC_INTEL__: JSON.stringify(process.env.SITE_DOWNLOAD_MAC_INTEL ?? downloads.macIntel ?? ''),
    __SITE_DOWNLOAD_WINDOWS__: JSON.stringify(process.env.SITE_DOWNLOAD_WINDOWS ?? downloads.windows ?? ''),
  },
})
await copyFile(join(ROOT, 'icon.svg'), join(OUT, 'icon.svg'))

await writeFile(join(OUT, 'index.html'), `<!doctype html>
<html lang="zh">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#000000">
    <meta name="description" content="位面飞行 Planar Aerial —— 以文字为翼，从此间飞往彼界。">
    <title>位面飞行 · Planar Aerial</title>
    <link rel="icon" href="./icon.svg">
    <style>html,body,#root{height:100%;margin:0;background:#000;overflow:hidden}</style>
  </head>
  <body>
    <div id="root"></div>
    <script src="./site.js"></script>
  </body>
</html>
`)
console.log('[planar-aerial] built dist/site')
