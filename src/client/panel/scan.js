/**
 * A section scan: the copy-edit and the grammar critique.
 *
 * One panel, two modes. The mode decides the prompt and the words on screen, not the shape of
 * the result — both come back as a list of findings the writer can jump to.
 */
import { React, h } from '../shared/react.js'
import { SteerBox, AiThinking } from './composer.js'

export function ScanDock({ t, scan, onClose, onAgain, onCritique }) {
  const busy = scan.busy === true
  const isCritique = scan.kind === 'critique'
  const critique = isCritique && scan.critique !== null && scan.critique !== undefined
    ? { verdict: '', points: [], ...scan.critique }
    : null
  const rows = isCritique ? (critique?.points ?? []) : (scan.issues ?? [])
  const failed = typeof scan.error === 'string' && scan.error !== ''
  /** The critique's own run button: "again" with a direction, or without one. */
  const runCritique = (direction) => { if (typeof onCritique === 'function') onCritique(direction) }
  return h('div', { className: 'st-scan' },
    h('div', { className: 'st-scan-head' },
      h('span', { className: 'st-scan-title' },
        isCritique ? t('scan.critiqueTitle') : t('scan.reviewTitle')),
      // The count is the answer to "how bad is it" at a glance, so it sits beside the title
      // and is not repeated anywhere else. The critique's count is its points; the verdict is
      // prose and not counted.
      busy || failed ? null : h('span', { className: 'st-scan-count' },
        isCritique ? t('scan.pointCount', { n: rows.length }) : t('scan.issueCount', { n: rows.length })),
      h('span', { className: 'st-spacer' }),
      h('button', {
        type: 'button', className: 'st-btn st-btn-ghost', title: t('action.close'),
        'aria-label': t('action.close'), onClick: onClose,
      }, '✕')),
    busy
      ? h(AiThinking, {
        t,
        // Different work, different words: a copy-edit is reading for mistakes, a critique is
        // judging the prose, and saying so is the difference between a wait that is explained
        // and one that looks like the wrong button was pressed.
        beats: isCritique
          ? [t('scan.critiqueThinking'), t('scan.critiqueThinking.1'), t('scan.critiqueThinking.2')]
          : [t('scan.reviewThinking'), t('scan.reviewThinking.1'), t('scan.reviewThinking.2')],
      })
      : null,
    // A truncated answer is neither a failure nor a clean result, and it is the one case where
    // the list below is misleading on its own: the issues that arrived are real, but the model
    // was cut off mid-answer, so more may have been on the way. Saying so is the difference
    // between "this section has three problems" and "I have read three problems so far".
    // Nothing found is a result, not an absence: a clean section said nothing at all used to
    // look like the request had failed silently.
    busy || failed ? null
      : isCritique
        ? h(React.Fragment, null,
          // The verdict first: one short paragraph on the prose as a whole. The points then
          // itemise it, but the writer asked for a judgement and that comes before the list.
          critique?.verdict !== '' && critique !== null
            ? h('div', { className: 'st-critique-verdict' }, critique.verdict) : null,
          rows.length === 0
            ? h('div', { className: 'st-scan-empty' }, t('scan.noPoints'))
            : h('div', { className: 'st-scan-list' },
              rows.map((row, index) => h('div', { key: index, className: 'st-scan-row', 'data-kind': row.kind ?? 'wording' },
                h('div', { className: 'st-scan-row-head' },
                  h('span', { className: 'st-scan-tag' }, t(`scan.kind.${row.kind ?? 'wording'}`)),
                  row.where === '' ? null : h('span', { className: 'st-scan-where', title: row.where }, row.where)),
                h('div', { className: 'st-scan-what' }, row.problem),
                row.advice === '' ? null : h('div', { className: 'st-scan-fix' },
                  h('span', { className: 'st-scan-arrow', 'aria-hidden': true }, '→'),
                  h('span', null, row.advice))))))
        : rows.length === 0
          ? h('div', { className: 'st-scan-empty' }, t('scan.noIssues'))
          : h('div', { className: 'st-scan-list' },
            rows.map((row, index) => h('div', { key: index, className: 'st-scan-row', 'data-kind': row.kind ?? 'wording' },
              h('div', { className: 'st-scan-row-head' },
                h('span', { className: 'st-scan-tag' }, t(`scan.kind.${row.kind ?? 'wording'}`)),
                row.where === '' ? null : h('span', { className: 'st-scan-where', title: row.where }, row.where)),
              h('div', { className: 'st-scan-what' }, row.problem),
              // The correction is the useful half: "逗号粘连" is a diagnosis, "拆成两句" is an
              // edit. Shown under the problem, marked with an arrow so the two are not confused.
              row.suggestion === '' ? null : h('div', { className: 'st-scan-fix' },
                h('span', { className: 'st-scan-arrow', 'aria-hidden': true }, '→'),
                h('span', null, row.suggestion))))),
    // Reading the findings and fixing them is one loop: the writer closes the dock, edits, and
    // wants the same pass again. The chord that opens this does that too, but a button makes
    // the loop visible without having to remember it. Below the list, so a long scan never
    // buries it under a scroll. The critique's copy carries a steer: a chevron that opens a
    // one-line box, and the direction rides with the next pass.
    busy || failed ? null : h('div', { className: 'st-scan-foot' },
      h('button', {
        type: 'button', className: 'st-dock-act st-dock-act-primary',
        onClick: () => { if (typeof onAgain === 'function') onAgain() },
      }, t('scan.again')),
      isCritique ? h(SteerBox, {
        t,
        copy: { placeholder: 'scan.steerPlaceholder', label: 'scan.steer', hint: 'scan.steerHint' },
        // In the critique's foot row the chevron sits beside 重试 as its own button, so it
        // says what it is instead of relying on a tooltip.
        showLabel: true,
        autoFocus: false,
        onRun: runCritique,
      }) : null,
      h('button', {
        type: 'button', className: 'st-dock-act st-dock-act-quiet', onClick: onClose,
      }, t('action.close'))))
}

/**
 * The model is working.
 *
 * One fixed label for a wait that can run to several seconds reads like a frozen screen, so
 * the copy walks a short sequence: where it is looking, what it is deciding, then "almost
 * there". Stated in the model's own voice rather than as system text, so it reads as someone
 * writing next to you.
 *
 * The rotation is CSS, not a timer: all four labels are in the DOM and one is visible at a
 * time. A JS interval would re-render the dock every couple of seconds for a purely visual
 * change, and it also kept a handle alive that a test harness has no way to release.
 */
