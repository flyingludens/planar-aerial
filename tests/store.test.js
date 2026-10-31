import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir, rm, stat, writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createEmptyBook } from '../lib/model.js'
import { assertLibrary, renderMarkdown, readBook, writeBook, writeSnapshot, readSnapshot } from '../lib/store.js'

const tempWorkspace = () => mkdtemp(join(tmpdir(), 'story-ws-'))

test('rejects relative workspace', () => {
  assert.throws(() => assertLibrary('rel/dir'), /absolute/)
  assert.throws(() => assertLibrary(''), /absolute/)
})

test('missing book returns empty with existed=false', async () => {
  const ws = await tempWorkspace()
  try { const out = await readBook(ws, '测试书'); assert.equal(out.existed, false); assert.equal(out.book.chapters.length, 0) }
  finally { await rm(ws, { recursive: true, force: true }) }
})

test('write then read round-trips', async () => {
  const ws = await tempWorkspace()
  try {
    const book = createEmptyBook('测试')
    book.chapters.push({ id: 'c1', title: '第一章', status: 'writing',
      text: '他推开门。' })
    await writeBook(ws, book, undefined, '测试书')
    const out = await readBook(ws, '测试书')
    assert.equal(out.book.chapters[0].text, '他推开门。')
  } finally { await rm(ws, { recursive: true, force: true }) }
})

test('corrupt json is backed up then replaced', async () => {
  const ws = await tempWorkspace()
  try {
    await mkdir(join(ws, BOOK), { recursive: true })
    await writeFile(join(ws, BOOK, 'book.json'), '{ bad')
    const out = await readBook(ws, '测试书')
    assert.equal(out.recovered, true)
    assert.equal(await readFile(join(ws, BOOK, 'book.json.bak'), 'utf8'), '{ bad')
  } finally { await rm(ws, { recursive: true, force: true }) }
})

test('markdown mirror carries the chapter body', () => {
  // There is no per-paragraph status any more: the chapter IS the body, so the mirror has it all.
  const book = createEmptyBook()
  book.chapters.push({ id: 'c1', title: '雨夜', status: 'writing', text: '雨下了一整夜。' })
  const md = renderMarkdown(book)
  assert.ok(md.includes('## 雨夜'))
  assert.ok(md.includes('雨下了一整夜。'))
})

test('snapshot round-trips', async () => {
  const ws = await tempWorkspace()
  try {
    const snap = await writeSnapshot(ws, createEmptyBook('S'), '初稿', '测试书')
    assert.equal((await readSnapshot(ws, snap.id, '测试书')).label, '初稿')
  } finally { await rm(ws, { recursive: true, force: true }) }
})

test('snapshot id traversal is rejected', async () => {
  const ws = await tempWorkspace()
  try { await assert.rejects(() => readSnapshot(ws, '../../etc/passwd', '测试书'), /invalid snapshot id/) }
  finally { await rm(ws, { recursive: true, force: true }) }
})

const chapter = (id, title, text) => ({ id, title, status: 'writing', text })
const BOOK = '测试书'
const mdFiles = async (ws) => (await readdir(join(ws, BOOK, 'chapters'))).filter((name) => name.endsWith('.md'))

test('renaming or deleting a chapter prunes its stale markdown', async () => {
  const ws = await tempWorkspace()
  try {
    const two = createEmptyBook('旧标题')
    two.chapters.push(chapter('c1', '一', '第一章定稿。'), chapter('c2', '二', '第二章定稿。'))
    await writeBook(ws, two, undefined, '测试书')
    const before = await mdFiles(ws)
    assert.equal(before.length, 2)
    assert.ok(before.some((name) => name.includes('一')))
    assert.ok(before.some((name) => name.includes('二')))

    const one = createEmptyBook('旧标题')
    one.chapters.push(chapter('c1', '一改名', '改名后的定稿。'))
    await writeBook(ws, one, undefined, '测试书')
    const after = await mdFiles(ws)
    assert.equal(after.length, 1)
    assert.ok(after[0].includes('一改名'))
    assert.match(await readFile(join(ws, BOOK, 'chapters', after[0]), 'utf8'), /一改名/)
  } finally { await rm(ws, { recursive: true, force: true }) }
})

test('non-markdown files in the chapter directory are left alone', async () => {
  const ws = await tempWorkspace()
  try {
    const book = createEmptyBook('B')
    book.chapters.push(chapter('c1', '一', '定稿。'))
    await writeBook(ws, book, undefined, '测试书')
    await writeFile(join(ws, BOOK, 'chapters', 'keep.txt'), 'keep', 'utf8')
    await writeBook(ws, book, undefined, '测试书')
    assert.equal(await readFile(join(ws, BOOK, 'chapters', 'keep.txt'), 'utf8'), 'keep')
    assert.equal((await mdFiles(ws)).length, 1)
  } finally { await rm(ws, { recursive: true, force: true }) }
})

test('readBook returns a token that changes with the bytes on disk', async () => {
  const ws = await tempWorkspace()
  try {
    assert.equal((await readBook(ws, '测试书')).token, 'none', 'a missing book has a stable sentinel token')
    await writeBook(ws, createEmptyBook('一'), undefined, '测试书')
    const first = await readBook(ws, '测试书')
    await writeBook(ws, createEmptyBook('二'), undefined, '测试书')
    const second = await readBook(ws, '测试书')
    assert.notEqual(first.token, second.token)
    assert.equal(second.token, (await readBook(ws, '测试书')).token, 'same bytes, same token')
  } finally { await rm(ws, { recursive: true, force: true }) }
})

test('writeBook refuses a stale expectedToken and accepts the current one', async () => {
  const ws = await tempWorkspace()
  try {
    await writeBook(ws, createEmptyBook('一'), undefined, '测试书')
    const stale = (await readBook(ws, '测试书')).token
    await writeBook(ws, createEmptyBook('二'), undefined, '测试书')
    await assert.rejects(() => writeBook(ws, createEmptyBook('三'), stale, '测试书'), /^Error: stale book/)
    assert.equal((await readBook(ws, '测试书')).book.title, '二', 'the refused write must not land')
    await writeBook(ws, createEmptyBook('四'), (await readBook(ws, '测试书')).token, '测试书')
    assert.equal((await readBook(ws, '测试书')).book.title, '四')
    // No token: internal callers keep working.
    await writeBook(ws, createEmptyBook('五'), undefined, '测试书')
    assert.equal((await readBook(ws, '测试书')).book.title, '五')
  } finally { await rm(ws, { recursive: true, force: true }) }
})

test('the derived chapters list is never written to disk', async () => {
  // `chapters` is computed from `nodes`. Storing it beside its source made two copies that had to
  // be kept in step by hand; when they drifted the editor rendered one and the file held the
  // other, which is how keystrokes were being lost. The file carries the tree only.
  const ws = await tempWorkspace()
  try {
    const book = createEmptyBook('不落盘')
    book.nodes = [{ id: 'c1', title: '章', level: 'chapter', status: 'writing', text: '正文。', children: [] }]
    await writeBook(ws, book, undefined, BOOK)
    const onDisk = JSON.parse(await readFile(join(ws, BOOK, 'book.json'), 'utf8'))
    assert.equal('chapters' in onDisk, false, 'the derived list must not be persisted')

    // And a reader still gets it, computed from the tree.
    const back = await readBook(ws, BOOK)
    assert.equal(back.book.chapters.length, 1)
    assert.equal(back.book.chapters[0].text, '正文。')
  } finally { await rm(ws, { recursive: true, force: true }) }
})

test('a stored chapters copy that disagrees with the tree is ignored', async () => {
  // Old files did persist the copy. When it is stale, the tree is the truth.
  const ws = await tempWorkspace()
  try {
    await mkdir(join(ws, BOOK), { recursive: true })
    await writeFile(join(ws, BOOK, 'book.json'), JSON.stringify({
      title: '旧书',
      nodes: [{ id: 'c1', title: '章', level: 'chapter', status: 'writing', text: '真实内容。', children: [] }],
      chapters: [{ id: 'c1', title: '章', level: 'chapter', status: 'writing', text: '过期的旧副本', children: [] }],
    }))
    const back = await readBook(ws, BOOK)
    assert.equal(back.book.chapters[0].text, '真实内容。')
  } finally { await rm(ws, { recursive: true, force: true }) }
})

test('moving a card writes ONE file, not the manuscript and every chapter', async () => {
  // The point of splitting the board out of book.json. Before this, a card drag went through the
  // same writeBook as a keystroke: book.json plus one markdown file per chapter plus the merged
  // manuscript, all rewritten to say exactly what they said before. On a real book that is a dozen
  // file writes per dragged pixel-row, and every one of them is a chance to catch a half-written
  // file on disk.
  const ws = await mkdtemp(join(tmpdir(), 'story-board-'))
  const folder = '测试书'
  try {
    const book = createEmptyBook('雨夜')
    book.nodes = [
      { id: 'v1', title: '卷一', text: '', children: [
        { id: 'c1', title: '第一章', text: '正文一。', children: [] },
        { id: 'c2', title: '第二章', text: '正文二。', children: [] },
      ] },
    ]
    book.mosaic.entities = [
      { id: 'e1', kind: 'character', name: '林', role: '摄影师', summary: '', statuses: [], tags: [], layout: { x: 10, y: 10 }, portrait: '' },
      { id: 'e2', kind: 'character', name: '周', role: '医生', summary: '', statuses: [], tags: [], layout: { x: 200, y: 10 }, portrait: '' },
    ]
    await writeBook(ws, book, undefined, folder)

    const dir = join(ws, folder)
    const stamp = async () => {
      const rows = {}
      for (const name of ['book.json', 'mosaic.json', 'manuscript.md', 'chapters/001-第一章.md', 'chapters/002-第二章.md']) {
        rows[name] = (await stat(join(dir, name))).mtimeMs
      }
      return rows
    }
    const before = await stamp()
    // Let the clock move: mtime granularity on some filesystems is a full second.
    await new Promise((r) => setTimeout(r, 20))

    // Drag one card. Nothing about the PROSE changed.
    const dragged = (await readBook(ws, folder)).book
    dragged.mosaic.entities[0].layout = { x: 400, y: 300 }
    await writeBook(ws, dragged, undefined, folder)

    const after = await stamp()
    assert.notEqual(after['mosaic.json'], before['mosaic.json'], 'the board is written')
    assert.equal(after['book.json'], before['book.json'], 'the manuscript file is untouched')
    assert.equal(after['manuscript.md'], before['manuscript.md'], 'the merged mirror is untouched')
    assert.equal(after['chapters/001-第一章.md'], before['chapters/001-第一章.md'], 'and so is every chapter mirror')

    // The move survives a reload, and the prose is still there.
    const back = (await readBook(ws, folder)).book
    assert.deepEqual(back.mosaic.entities[0].layout, { x: 400, y: 300 })
    assert.equal(back.chapters[0].text, '正文一。')

    // Editing PROSE still writes it, and does not lose the board.
    const edited = (await readBook(ws, folder)).book
    edited.chapters[0].text = '改过的正文。'
    await writeBook(ws, edited, undefined, folder)
    const final = (await readBook(ws, folder)).book
    assert.equal(final.chapters[0].text, '改过的正文。')
    assert.equal(final.mosaic.entities.length, 2, 'the board rode along')
  } finally {
    await rm(ws, { recursive: true, force: true })
  }
})

