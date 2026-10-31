import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createEmptyBook } from '../lib/model.js'
import {
  deleteBook, deleteProposal, listProposals, readProposal,
  setProposalStatus, writeBook, writeProposal,
} from '../lib/store.js'

async function withBook(fn) {
  const ws = await mkdtemp(join(tmpdir(), 'story-proposals-'))
  const folder = '测试书'
  try {
    await writeBook(ws, createEmptyBook('雨夜'), undefined, folder)
    return await fn({ ws, folder })
  } finally {
    await rm(ws, { recursive: true, force: true })
  }
}

test('a proposal outlives the panel that asked for it', async () => {
  // The bug this pins: proposals lived only in the panel's memory, so closing the sheet, switching
  // books or restarting DSH threw away work the model had already done.
  await withBook(async ({ ws, folder }) => {
    const stored = await writeProposal(ws, folder, {
      id: 'p1', source: 'relate', sourceChapterId: null,
      evidence: ['十年前的同案'],
      changes: [{ op: 'edge.upsert', from: 'a', to: 'b', kind: '旧识', note: '十年前的同案' }],
    })
    assert.equal(stored.status, 'pending', 'a new proposal waits for an answer')
    assert.ok(stored.at > 0, 'and carries when it arrived')

    // Reading it back is what a restart does: no memory, just the book folder.
    const back = await readProposal(ws, folder, 'p1')
    assert.equal(back.id, 'p1')
    assert.equal(back.changes.length, 1)
    assert.deepEqual(back.evidence, ['十年前的同案'])
  })
})

test('the list is newest first, skipping files that are not proposals', async () => {
  await withBook(async ({ ws, folder }) => {
    await writeProposal(ws, folder, { id: 'old', at: 1000, changes: [] })
    await writeProposal(ws, folder, { id: 'new', at: 2000, changes: [] })
    // Something else in the folder must not break the listing.
    const dir = join(ws, folder, 'proposals')
    await writeFile(join(dir, 'notes.txt'), 'not json')
    const rows = await listProposals(ws, folder)
    assert.deepEqual(rows.map((r) => r.id), ['new', 'old'])
  })
})

test('a proposal with no stored folder lists as empty, not as an error', async () => {
  await withBook(async ({ ws, folder }) => {
    assert.deepEqual(await listProposals(ws, folder), [], 'no proposals yet is a normal state')
    assert.equal(await readProposal(ws, folder, 'nope'), null)
  })
})

test('answering a proposal records the answer without losing it', async () => {
  await withBook(async ({ ws, folder }) => {
    await writeProposal(ws, folder, { id: 'p1', changes: [{ op: 'x' }] })
    const accepted = await setProposalStatus(ws, folder, 'p1', 'accepted')
    assert.equal(accepted.status, 'accepted')
    assert.equal(accepted.changes.length, 1, 'the changes stay readable after the answer')
    // Still listed: the page says what happened rather than the row vanishing.
    assert.equal((await listProposals(ws, folder)).length, 1)
  })
})

test('a proposal id cannot escape the proposals folder', async () => {
  await withBook(async ({ ws, folder }) => {
    for (const bad of ['../escape', '..', '.', 'a/b']) {
      assert.equal(await readProposal(ws, folder, bad), null, `${bad} is refused`)
      assert.equal(await deleteProposal(ws, folder, bad), false)
      await assert.rejects(() => writeProposal(ws, folder, { id: bad, changes: [] }))
    }
  })
})

test('deleting a book entry takes its proposals with it', async () => {
  await withBook(async ({ ws, folder }) => {
    await writeProposal(ws, folder, { id: 'p1', changes: [] })
    await deleteBook(ws, folder, { removeFiles: false })
    // The folder survives (the writer kept their files) but is no longer a book.
    const dir = join(ws, folder, 'proposals')
    const left = await readdir(join(ws, folder))
    assert.ok(!left.includes('mosaic.json'), 'the board goes too')
    await assert.rejects(() => readdir(dir), 'and the proposals with them')
  })
})
