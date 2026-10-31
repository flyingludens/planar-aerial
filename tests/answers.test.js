import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createEmptyBook } from '../lib/model.js'
import {
  ANSWER_LIMIT, deleteAnswer, deleteBook, listAnswers, removeAnswerDir,
  trimAnswers, writeAnswer, writeBook,
} from '../lib/store.js'

async function withBook(fn) {
  const ws = await mkdtemp(join(tmpdir(), 'story-answers-'))
  const folder = '测试书'
  try {
    await writeBook(ws, createEmptyBook('雨夜'), undefined, folder)
    return await fn({ ws, folder })
  } finally {
    await rm(ws, { recursive: true, force: true })
  }
}

test('an answer is written to its own file beside the book, not into book.json', async () => {
  await withBook(async ({ ws, folder }) => {
    const before = await readFile(join(ws, folder, 'book.json'), 'utf8')
    const saved = await writeAnswer(ws, folder, { question: '这句怎么收？', reply: '收在雨停之前。', chapterId: 'c1' })

    assert.equal(typeof saved.id, 'string')
    assert.ok(saved.id !== '', 'the store assigns an id when the caller has none')
    assert.equal(saved.chapterId, 'c1')

    const files = await readdir(join(ws, folder, 'answers'))
    assert.deepEqual(files, [`${saved.id}.json`], 'one file, named by the id')

    // The manuscript file is untouched by an answer: that is the whole point of a separate folder.
    assert.equal(await readFile(join(ws, folder, 'book.json'), 'utf8'), before,
      'saving an answer does not rewrite book.json')
  })
})

test('answers come back newest first, and a limit takes the newest', async () => {
  await withBook(async ({ ws, folder }) => {
    await writeAnswer(ws, folder, { question: 'first', reply: 'a', at: 1000 })
    await writeAnswer(ws, folder, { question: 'second', reply: 'b', at: 2000 })
    await writeAnswer(ws, folder, { question: 'third', reply: 'c', at: 3000 })

    const all = (await listAnswers(ws, folder)).map((row) => row.question)
    assert.deepEqual(all, ['third', 'second', 'first'], 'newest first')

    // The limit is applied AFTER sorting: a caller asking for one must get the newest one, not
    // whichever file the directory happened to yield first.
    const newest = await listAnswers(ws, folder, 1)
    assert.equal(newest.length, 1)
    assert.equal(newest[0].question, 'third')
  })
})

test('an answer asked in no chapter stores null rather than an empty id', async () => {
  await withBook(async ({ ws, folder }) => {
    const noChapter = await writeAnswer(ws, folder, { question: 'q', reply: 'r' })
    assert.equal(noChapter.chapterId, null, 'absent chapter is null')
    const blank = await writeAnswer(ws, folder, { question: 'q2', reply: 'r2', chapterId: '' })
    assert.equal(blank.chapterId, null, 'an empty id is the same as none')
  })
})

test('trimming keeps the newest and removes the rest', async () => {
  await withBook(async ({ ws, folder }) => {
    for (let i = 0; i < 6; i += 1) {
      await writeAnswer(ws, folder, { question: `q${i}`, reply: `r${i}`, at: 1000 + i })
    }
    // Trimming is called after a save, so it must not be the thing that discards the answer
    // just written: the newest survives a trim to a smaller limit.
    const removed = await trimAnswers(ws, folder, 3)
    assert.equal(removed, 3)
    const left = await listAnswers(ws, folder)
    assert.equal(left.length, 3)
    assert.equal(left[0].question, 'q5', 'the newest is still there')
  })
})

test('one unreadable file does not make the whole history unreadable', async () => {
  await withBook(async ({ ws, folder }) => {
    await writeAnswer(ws, folder, { question: 'good', reply: 'r', at: 1000 })
    // A half-written or hand-broken file is ordinary in a folder a person can open.
    await writeFile(join(ws, folder, 'answers', 'broken.json'), '{ not json', 'utf8')
    const rows = await listAnswers(ws, folder)
    assert.equal(rows.length, 1, 'the good answer is still listed')
    assert.equal(rows[0].question, 'good')
  })
})

test('an answer id cannot address a file outside the answer folder', async () => {
  await withBook(async ({ ws, folder }) => {
    const bookBefore = await readFile(join(ws, folder, 'book.json'), 'utf8')
    for (const bad of ['../book.json', '..', '.', 'a/b', '.hidden']) {
      assert.equal(await deleteAnswer(ws, folder, bad), false, `${JSON.stringify(bad)} is refused`)
      await assert.rejects(
        () => writeAnswer(ws, folder, { id: bad, question: 'q', reply: 'r' }),
        /invalid answer id/,
        `${JSON.stringify(bad)} is refused on write too`,
      )
    }
    assert.equal(await readFile(join(ws, folder, 'book.json'), 'utf8'), bookBefore,
      'the manuscript was never a candidate for deletion')
  })
})

test('deleting a book entry takes its answer history with it', async () => {
  await withBook(async ({ ws, folder }) => {
    await writeAnswer(ws, folder, { question: 'q', reply: 'r' })
    // "Remove the entry, keep my words": the manuscript goes, and so does anything that is
    // about a book the library no longer lists.
    await deleteBook(ws, folder, { removeFiles: false })
    const entries = await readdir(join(ws, folder)).catch(() => [])
    assert.ok(!entries.includes('answers'), 'the answer folder is gone')
  })
})

test('removing the answer folder is safe when there is none', async () => {
  await withBook(async ({ ws, folder }) => {
    await assert.doesNotReject(() => removeAnswerDir(ws, folder))
  })
})

test('the limit is a number the panel can rely on', () => {
  assert.equal(typeof ANSWER_LIMIT, 'number')
  assert.ok(ANSWER_LIMIT > 0)
})
