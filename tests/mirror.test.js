import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createEmptyBook } from '../lib/model.js'
import { createBook, readBook, writeBook } from '../lib/store.js'

/**
 * The Markdown mirror `writeBook` maintains beside book.json.
 *
 * The chapters are written concurrently, because each one is its own file and serialising them
 * cost a round trip per chapter on every save. That change is only safe if the mirror still comes
 * out complete and still prunes the pages of deleted chapters — a half-written or stale chapter
 * directory is what the writer would see in Finder.
 */

const tempWorkspace = () => mkdtemp(join(tmpdir(), 'story-mirror-'))

/** A book of `count` chapters, each with its own text so a mixed-up write is visible. */
function bookOf(count) {
  const book = createEmptyBook('镜像')
  book.nodes = [{
    id: 'v1', title: '卷一', level: 'volume', status: 'writing', text: '',
    children: Array.from({ length: count }, (_, index) => ({
      id: `c${index}`, title: `第${index + 1}章`, level: 'chapter', status: 'writing',
      text: `第${index + 1}章的正文。`, children: [],
    })),
  }]
  book.chapters = book.nodes[0].children
  return book
}

test('every chapter reaches the chapters folder, with its own text', async () => {
  const ws = await tempWorkspace()
  try {
    const { folder } = await createBook(ws, '镜像')
    const written = await writeBook(ws, bookOf(12), undefined, folder)
    const dir = join(ws, folder, 'chapters')
    const names = (await readdir(dir)).filter((name) => name.endsWith('.md')).sort()
    assert.equal(names.length, 12, 'twelve chapters, twelve pages')
    // Each page must hold its OWN chapter: a concurrency mistake would show up as two chapters
    // writing the same file, or one page holding another chapter's prose.
    for (const [index, name] of names.entries()) {
      const body = await readFile(join(dir, name), 'utf8')
      assert.ok(body.includes(`第${index + 1}章的正文。`), `${name} holds its own chapter`)
    }
    // The first page is the one the save reports, so the panel can open it.
    assert.ok(written.mdPath.endsWith(names[0]), 'mdPath names the first page')
    assert.equal(written.token.length, 64, 'and the token still commits to the bytes written')
  } finally { await rm(ws, { recursive: true, force: true }) }
})

test('pages of deleted chapters are pruned, and only those', async () => {
  const ws = await tempWorkspace()
  try {
    const { folder } = await createBook(ws, '镜像')
    await writeBook(ws, bookOf(5), undefined, folder)
    const dir = join(ws, folder, 'chapters')
    const before = (await readdir(dir)).filter((name) => name.endsWith('.md')).sort()
    assert.equal(before.length, 5)

    // Drop the last two chapters and save again.
    const shorter = bookOf(3)
    await writeBook(ws, shorter, undefined, folder)
    const after = (await readdir(dir)).filter((name) => name.endsWith('.md')).sort()
    assert.equal(after.length, 3, 'the deleted chapters left no pages behind')
    assert.deepEqual(after, before.slice(0, 3), 'the surviving pages keep their names')
  } finally { await rm(ws, { recursive: true, force: true }) }
})

test('the merged manuscript is written after the chapters it merges', async () => {
  const ws = await tempWorkspace()
  try {
    const { folder } = await createBook(ws, '镜像')
    const written = await writeBook(ws, bookOf(4), undefined, folder)
    const merged = await readFile(written.manuscriptPath, 'utf8')
    // Every chapter has to be in the merged file: if the manuscript were built from a chapter
    // page that had not been written yet, one of these would be missing.
    for (let index = 1; index <= 4; index += 1) {
      assert.ok(merged.includes(`第${index}章的正文。`), `chapter ${index} is in the merged manuscript`)
    }
    assert.ok(merged.startsWith('# 镜像'), 'and it opens with the book title')
  } finally { await rm(ws, { recursive: true, force: true }) }
})

test('a book with no chapters still saves and writes an empty mirror', async () => {
  const ws = await tempWorkspace()
  try {
    const { folder } = await createBook(ws, '空书')
    const empty = createEmptyBook('空书')
    const written = await writeBook(ws, empty, undefined, folder)
    assert.equal(written.mdPath, '', 'no first page to name')
    const dir = join(ws, folder, 'chapters')
    assert.deepEqual((await readdir(dir)).filter((name) => name.endsWith('.md')), [], 'and no pages')
    // The book itself is still readable: an empty manuscript is a valid one.
    assert.equal((await readBook(ws, folder)).book.title, '空书')
  } finally { await rm(ws, { recursive: true, force: true }) }
})
