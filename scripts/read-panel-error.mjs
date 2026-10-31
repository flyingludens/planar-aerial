/**
 * Read the panel's own crash record out of the desktop app's localStorage.
 *
 * The desktop build ships no developer tools, and a render crash leaves the column empty with
 * nothing to read. The client records the first uncaught error under one storage key; this reads
 * that key straight out of Chromium's leveldb, so no console is needed.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const dir = join(homedir(), 'Library/Application Support/@deepseek-ai/dsh-desktop/Local Storage/leveldb')
const KEY = 'dsh.storywriting.lastError'

let newest = null
for (const name of readdirSync(dir)) {
  if (!name.endsWith('.log') && !name.endsWith('.ldb')) continue
  const text = readFileSync(join(dir, name)).toString('utf8')
  let at = text.indexOf(KEY)
  while (at !== -1) {
    const runs = text.slice(at + KEY.length, at + KEY.length + 6000).split('{')
    for (let i = 1; i < runs.length; i += 1) {
      const candidate = `{${runs.slice(i).join('{')}`
      const close = candidate.lastIndexOf('}')
      if (close === -1) continue
      try {
        const parsed = JSON.parse(candidate.slice(0, close + 1))
        if (parsed !== null && typeof parsed.message === 'string') {
          if (newest === null || String(parsed.at) > String(newest.at)) newest = parsed
        }
      } catch { /* not the whole record */ }
    }
    at = text.indexOf(KEY, at + 1)
  }
}

if (newest === null) {
  console.log(`no "${KEY}" in the desktop storage.`)
  process.exit(0)
}
console.log(`kind:    ${newest.kind}`)
console.log(`at:      ${newest.at}`)
console.log(`message: ${newest.message}`)
console.log('')
console.log(newest.stack ?? '(no stack)')
