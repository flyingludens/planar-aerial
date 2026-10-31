import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createEmptyBook } from '../lib/model.js'
import { createBook, deleteBook, listBooks, readBook, renameBook, writeBook } from '../lib/store.js'

const tempWorkspace = () => mkdtemp(join(tmpdir(), 'story-lib-'))

test('an empty workspace lists no books', async () => {
  const ws = await tempWorkspace()
  try {
    assert.deepEqual(await listBooks(ws), [])
  } finally { await rm(ws, { recursive: true, force: true }) }
})

test('creating a book makes a folder named after it, holding a manuscript', async () => {
  const ws = await tempWorkspace()
  try {
    const created = await createBook(ws, '雨夜')
    assert.equal(created.folder, '雨夜')
    const entries = await readdir(join(ws, '雨夜'))
    assert.ok(entries.includes('book.json'))
    assert.ok(entries.includes('manuscript.md'))
    assert.equal((await readBook(ws, '雨夜')).book.title, '雨夜')
  } finally { await rm(ws, { recursive: true, force: true }) }
})

test('two books are independent manuscripts', async () => {
  const ws = await tempWorkspace()
  try {
    const a = await createBook(ws, '甲')
    const b = await createBook(ws, '乙')
    const bookA = createEmptyBook('甲')
    bookA.nodes = [{ id: 'v1', title: '甲卷', level: 'volume', status: 'writing', text: '', children: [
      { id: 'c1', title: '甲的第一章', level: 'chapter', status: 'writing', text: '', children: [] }] }]
    await writeBook(ws, bookA, undefined, a.folder)

    assert.equal((await readBook(ws, a.folder)).book.nodes[0].title, '甲卷')
    assert.deepEqual((await readBook(ws, b.folder)).book.nodes, [])
    const titles = (await listBooks(ws)).map((x) => x.title).sort()
    assert.deepEqual(titles, ['乙', '甲'].sort())
  } finally { await rm(ws, { recursive: true, force: true }) }
})

test('a duplicate title gets a suffix instead of overwriting', async () => {
  const ws = await tempWorkspace()
  try {
    const first = await createBook(ws, '同名')
    const second = await createBook(ws, '同名')
    assert.equal(first.folder, '同名')
    assert.notEqual(second.folder, first.folder)
    assert.equal((await listBooks(ws)).length, 2)
  } finally { await rm(ws, { recursive: true, force: true }) }
})

test('a title with path separators becomes a safe folder name', async () => {
  const ws = await tempWorkspace()
  try {
    const created = await createBook(ws, 'a/b:c*d')
    assert.ok(!created.folder.includes('/'))
    assert.ok(!created.folder.includes(':'))
    assert.ok((await listBooks(ws)).length === 1)
  } finally { await rm(ws, { recursive: true, force: true }) }
})

test('a book title is required and bounded', async () => {
  const ws = await tempWorkspace()
  try {
    await assert.rejects(() => createBook(ws, '   '), /title/)
    await assert.rejects(() => createBook(ws, 'x'.repeat(121)), /120 characters/)
  } finally { await rm(ws, { recursive: true, force: true }) }
})

test('deleting a book removes only that folder', async () => {
  const ws = await tempWorkspace()
  try {
    const a = await createBook(ws, '甲')
    const b = await createBook(ws, '乙')
    await deleteBook(ws, a.folder)
    assert.deepEqual((await listBooks(ws)).map((x) => x.folder), [b.folder])
  } finally { await rm(ws, { recursive: true, force: true }) }
})

test('a folder that is not a book is ignored by the listing', async () => {
  const ws = await tempWorkspace()
  try {
    const { mkdir } = await import('node:fs/promises')
    await mkdir(join(ws, 'some-notes'), { recursive: true })
    await createBook(ws, '真书')
    assert.deepEqual((await listBooks(ws)).map((x) => x.title), ['真书'])
  } finally { await rm(ws, { recursive: true, force: true }) }
})

test('a folder that escapes the library is rejected', async () => {
  const ws = await tempWorkspace()
  try {
    await assert.rejects(() => readBook(ws, '../../etc'), /invalid book folder/)
  } finally { await rm(ws, { recursive: true, force: true }) }
})

test('renameBook changes the title and moves the folder with it', async () => {
  const ws = await tempWorkspace()
  try {
    await createBook(ws, '旧名')
    const out = await renameBook(ws, '旧名', '新名')
    assert.equal(out.title, '新名')
    assert.equal(out.folder, '新名')
    const listed = await listBooks(ws)
    assert.deepEqual(listed.map((b) => b.title), ['新名'])
    // The manuscript is still readable under the new folder.
    assert.equal((await readBook(ws, '新名')).existed, true)
  } finally { await rm(ws, { recursive: true, force: true }) }
})

test('a book keeps its id across a rename, which is what anything remembering it keys on', async () => {
  const ws = await tempWorkspace()
  try {
    await createBook(ws, '旧名')
    const before = (await readBook(ws, '旧名')).book.id
    assert.equal(typeof before, 'string')
    assert.ok(before !== '', 'a book is minted with an id')

    // Renaming moves the folder but not the identity. Everything that has to survive a rename —
    // the panel's last-open book, its per-book bucket of UI state — is keyed on this value, so a
    // rename that changed it would silently strand all of them.
    await renameBook(ws, '旧名', '新名')
    const after = (await readBook(ws, '新名')).book.id
    assert.equal(after, before, 'the id survives the move')

    // And the shelf hands the id out, so a caller can remember it without reading book.json.
    const listed = await listBooks(ws)
    assert.equal(listed.length, 1)
    assert.equal(listed[0].id, before, 'the shelf row carries the id')
  } finally { await rm(ws, { recursive: true, force: true }) }
})

test('renaming onto a name already in use keeps the new title and the old folder', async () => {
  const ws = await tempWorkspace()
  try {
    await createBook(ws, '甲')
    await createBook(ws, '乙')
    const out = await renameBook(ws, '甲', '乙')
    assert.equal(out.title, '乙', 'the title is what the writer asked for')
    assert.equal(out.folder, '甲', 'the folder stays because 乙 is taken')
    assert.equal(out.renamedFolder, false)
  } finally { await rm(ws, { recursive: true, force: true }) }
})

test('deleteBook removes the whole folder only when asked', async () => {
  const ws = await tempWorkspace()
  try {
    // Manifest-only delete: the folder survives, so the writer keeps anything else in it.
    await createBook(ws, '留目录')
    const kept = await createBook(ws, '留目录')
    await deleteBook(ws, kept.folder, { removeFiles: false })
    assert.deepEqual((await listBooks(ws)).map((b) => b.folder), ['留目录'])
    assert.equal(existsSync(join(ws, kept.folder)), true, 'the directory is still there')
    assert.equal(existsSync(join(ws, kept.folder, 'book.json')), false, 'only the manifest went')

    // Full delete: nothing left at all.
    await deleteBook(ws, '留目录')
    assert.deepEqual(await listBooks(ws), [])
    assert.equal(existsSync(join(ws, '留目录')), false)
  } finally { await rm(ws, { recursive: true, force: true }) }
})
