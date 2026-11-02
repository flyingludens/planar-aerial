import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

/**
 * Structural checks on the bundle itself, rather than on what it renders.
 *
 * Every one of these guards a defect that had already happened and had no test:
 *
 *  - `.st-md-h1` … `.st-md-h6` were styled but never applied, so every heading in the manuscript
 *    preview fell back to the browser's own h1-h6 sizes (30px where the sheet asked for 20).
 *  - A duplicate `action.close` key silently overwrote the earlier one, so every ✕ button in the
 *    panel said 收起 instead of 关闭.
 *  - `label.model` existed only in Chinese, so the English composer showed the raw key name.
 *  - 26 CSS classes and 30 dictionary entries outlived the code that used them.
 *
 * These are cheap and exact, which is the point: a render test cannot see a class that is never
 * applied, and a missing translation only shows up in the other language.
 */

const here = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(join(here, '..', 'client.js'), 'utf8')

/**
 * The stylesheet, assembled from the CSS MODULES rather than from the bundle.
 *
 * Those checks are about what the sheet SAYS — hard-coded pixels, a border where the convention
 * is borderless, a class nothing renders. Reading the built bundle used to be correct because the
 * sheet was one template string literal. Once it was split, the bundle only carries
 * `${CSS_CORE}`-style references, so the literal scan found nothing and every rule in this file
 * went quiet at once.
 *
 * Reading the sources keeps the scan honest: the modules hold the real text, and the aggregator
 * in styles.js only decides the order.
 */
const CSS_DIRS = ['shared', 'panel', 'mosaic']
const cssFiles = CSS_DIRS
  .flatMap((dir) => readdirSync(join(here, '..', 'src', 'client', dir))
    .filter((name) => name.endsWith('.css.js'))
    .map((name) => join(here, '..', 'src', 'client', dir, name)))
  .concat(join(here, '..', 'src', 'client', 'styles.js'))  // the aggregator: order only, plus its header
  .concat(join(here, '..', 'src', 'client', 'shared', 'styles.js'))

/** One module's template-string body, between its opening and closing backtick. */
const cssBodyOf = (path) => {
  const text = readFileSync(path, 'utf8')
  const at = text.search(/(?:const|var|let)\s+CSS[A-Z_]*\s*=\s*`/)
  if (at < 0) return ''
  const open = text.indexOf('`', at) + 1
  const close = text.indexOf('`', open)
  return close < 0 ? '' : text.slice(open, close)
}
const css = cssFiles.map(cssBodyOf).join('\n')

/** Every line of the sources outside a stylesheet: the components, the hooks, the dictionaries. */
const outsideCss = [
  join(here, '..', 'src', 'client', 'index.js'),
  join(here, '..', 'src', 'client', 'api.js'),
  ...CSS_DIRS.flatMap((dir) => readdirSync(join(here, '..', 'src', 'client', dir))
    .filter((name) => name.endsWith('.js') && !name.endsWith('.css.js'))
    .map((name) => join(here, '..', 'src', 'client', dir, name))),
].map((path) => readFileSync(path, 'utf8')).join('\n')

/** One top-level declaration's body offset in the bundle, matched without assuming `const`. */
const declOf = (name, open) => new RegExp(`(?:const|var|let)\\s+${name}\\s*=\\s*${open}`)
const afterDecl = (name, open) => {
  const at = source.search(declOf(name, open))
  if (at < 0) return -1
  return at + declOf(name, open).exec(source.slice(at))[0].length
}

// The two dictionaries, from each one's opening brace to the next declaration that follows it.
const ZH_BODY = afterDecl('ZH', '\\{')
const EN_BODY = afterDecl('EN', '\\{')
/**
 * `function StoryPanel` was the anchor for "the code after the dictionaries" while everything
 * lived in one file. It is wrong now: slicing to it carried a second copy of some keys into the
 * English body, which then read as keys English has and Chinese does not.
 */
const AFTER_EN = EN_BODY < 0
  ? source.length
  : EN_BODY + /(?:^|\n)(?:var|const|let|function)\s+\w+/.exec(source.slice(EN_BODY)).index
const zhBody = ZH_BODY < 0 ? '' : source.slice(ZH_BODY, EN_BODY < 0 ? source.length : EN_BODY)
const enBody = EN_BODY < 0 ? '' : source.slice(EN_BODY, AFTER_EN)
/**
 * The bundle's code, with the stylesheet and both dictionaries removed.
 *
 * Both dictionaries are one contiguous region: ZH opens, EN follows it, and the code resumes
 * at the declaration after EN. There is no stylesheet to cut out any more — the CSS lives in
 * its own modules now, so what remains of the bundle is exactly the code.
 */
const code = source.slice(0, ZH_BODY) + source.slice(AFTER_EN)

/** The keys of one inline dictionary, in source order (duplicates included). */
const keysOf = (text) => [...text.matchAll(/['"]([A-Za-z][\w.]*)['"]:/g)].map((match) => match[1])

/**
 * Classes the JSX can only produce by composition, so they never appear as a literal.
 * `st-ctx-${side}` and `st-md-h${level}` are built at render time; everything else must be
 * spelled out somewhere.
 */
const COMPOSED = new Set([
  'st-ctx-before', 'st-ctx-after',
  'st-md-h1', 'st-md-h2', 'st-md-h3', 'st-md-h4', 'st-md-h5', 'st-md-h6',
])

test('the stylesheet has balanced braces and no block without a selector', () => {
  // Removing a dead rule means removing its SELECTOR line, and it is easy to take the selector and
  // leave the declarations behind. A stray `}` then closes the rule before it early and shifts
  // every rule after that, so the rest of the sheet silently stops applying — which is exactly
  // what happened: four blocks lost their selectors, and the panel rendered unstyled wherever no
  // theme was masking it.
  const bare = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const open = (bare.match(/{/g) ?? []).length
  const close = (bare.match(/}/g) ?? []).length
  assert.equal(open, close, `braces must balance, saw ${open} open and ${close} close`)

  // A block with no selector: a `}` followed by declarations instead of a new rule.
  const orphans = [...bare.matchAll(/}\s*\n\s*([a-z-]+):/g)].map((match) => match[1])
  assert.deepEqual(orphans, [], `declarations with no selector: ${orphans.join(', ')}`)
})

test('every class the stylesheet defines is produced by the bundle', () => {
  const defined = [...new Set([...css.matchAll(/\.(st-[a-z0-9-]+)/g)].map((match) => match[1]))]
  assert.ok(defined.length > 100, 'the stylesheet is found and has rules')
  const dead = defined.filter((name) => !COMPOSED.has(name) && !outsideCss.includes(name))
  assert.deepEqual(dead, [], `CSS rules nothing can ever match: ${dead.join(', ')}`)
})

test('a class the JSX composes is also styled, at every level it can reach', () => {
  // The other direction: the heading class was composed but the sheet only knew `.st-md-h`, so
  // the fix is only correct if `.st-md-hN` exists for every level the renderer can emit.
  for (let level = 1; level <= 6; level += 1) {
    assert.ok(css.includes(`.st-md-h${level}`), `.st-md-h${level} has a rule`)
  }
  assert.ok(outsideCss.includes('st-md-h${level}'), 'and the renderer composes the level into it')
  assert.ok(outsideCss.includes('st-ctx-${side}'), 'the context edge composes its side')
  for (const side of ['before', 'after']) {
    assert.ok(css.includes(`.st-ctx-${side}`), `.st-ctx-${side} has a rule`)
  }
})

test('the two dictionaries define the same keys, and neither repeats one', () => {
  const zh = keysOf(zhBody)
  const en = keysOf(enBody)
  // A repeated key is not a syntax error: the later one wins silently, and whatever the earlier
  // one said is unreachable. That is how the panel ended up with 收起 on its close buttons.
  const repeatedZh = zh.filter((key, index) => zh.indexOf(key) !== index)
  const repeatedEn = en.filter((key, index) => en.indexOf(key) !== index)
  assert.deepEqual([...new Set(repeatedZh)], [], `ZH defines these twice: ${repeatedZh.join(', ')}`)
  assert.deepEqual([...new Set(repeatedEn)], [], `EN defines these twice: ${repeatedEn.join(', ')}`)

  const onlyZh = [...new Set(zh)].filter((key) => !en.includes(key))
  const onlyEn = [...new Set(en)].filter((key) => !zh.includes(key))
  assert.deepEqual(onlyZh, [], `defined in Chinese but not English: ${onlyZh.join(', ')}`)
  assert.deepEqual(onlyEn, [], `defined in English but not Chinese: ${onlyEn.join(', ')}`)
})

test('every key the panel asks for exists in both dictionaries', () => {
  // `t('literal')` and the computed `t(\`prefix.${value}\`)` forms both have to resolve. A missing
  // key is not a crash — the host falls back to the key itself — so nothing else would notice.
  const literals = [...new Set([...code.matchAll(/\bt\(['"]([A-Za-z][\w.]*)['"]/g)].map((match) => match[1]))]
  const prefixes = [...new Set([...code.matchAll(/\bt\(`([^`]*?)\$\{/g)].map((match) => match[1]))]
  assert.ok(literals.length > 100, 'the panel still names many keys')
  assert.ok(prefixes.length > 0, 'and composes some')

  const zh = new Set(keysOf(zhBody))
  const en = new Set(keysOf(enBody))
  // `panel` is written without quotes (`panel: '写故事'`), so the quoted-key scan misses it.
  const resolves = (dict, key) => dict.has(key) || key === 'panel'
  const missingZh = literals.filter((key) => !resolves(zh, key))
  const missingEn = literals.filter((key) => !resolves(en, key))
  assert.deepEqual(missingZh, [], `asked for but not defined in Chinese: ${missingZh.join(', ')}`)
  assert.deepEqual(missingEn, [], `asked for but not defined in English: ${missingEn.join(', ')}`)

  // A computed key needs at least one entry under its prefix, or the whole family is missing.
  for (const prefix of prefixes) {
    assert.ok([...zh].some((key) => key.startsWith(prefix)), `${prefix}* exists in Chinese`)
    assert.ok([...en].some((key) => key.startsWith(prefix)), `${prefix}* exists in English`)
  }
})

test('no dictionary entry outlives the code that asked for it', () => {
  // Dead copy is not harmless: it is what makes a dictionary look authoritative when a key has
  // already been renamed out from under it, and it is a translation nobody will ever see.
  const prefixes = [...new Set([...code.matchAll(/\bt\(`([^`]*?)\$\{/g)].map((match) => match[1]))]
  // Keys read as data rather than through `t()` directly: the preset tables name their labels.
  // `label:` as well as `key:`: the preset tables (image styles, type sizes, auto-save steps) name
  // their dictionary entry with `label`, and checking only `key` made every one of them look dead.
  const dataKeys = new Set([...code.matchAll(/(?:key|label): ['"]([A-Za-z][\w.]*)['"]/g)].map((match) => match[1]))
  // Both quote styles: the source is hand-written with single quotes, but the BUILT bundle is
  // read here and esbuild normalises every string to double quotes. Checking one style made
  // every key look unreferenced the moment the build was introduced.
  const used = (key) => dataKeys.has(key)
    || code.includes(`'${key}'`) || code.includes(`"${key}"`)
    || prefixes.some((prefix) => key.startsWith(prefix))
  // The two tests must agree on the DYNAMIC form: a key asked through a computed prefix
  // (the event log's `log.op.${action}`) is asked, so it cannot be dead. The asked test above
  // already counts prefixes; this one had forgotten them, which flagged live keys as dead.

  const deadZh = [...new Set(keysOf(zhBody))].filter((key) => !used(key))
  const deadEn = [...new Set(keysOf(enBody))].filter((key) => !used(key))
  assert.deepEqual(deadZh, [], `Chinese strings nothing reads: ${deadZh.join(', ')}`)
  assert.deepEqual(deadEn, [], `English strings nothing reads: ${deadEn.join(', ')}`)
})

test('every class in the stylesheet is also named by the bundle', () => {
  // The first test in this file already covers this, but it is worth naming the failure it guards:
  // a rule whose class nothing renders is dead weight, and a rule whose class the bundle DOES use
  // is load-bearing. Removing the second kind is what broke the stylesheet — the selector went and
  // the declarations stayed, so the rest of the sheet stopped applying. This asserts the direction
  // that matters for a cleanup: before deleting a rule, the class must be absent from the JS too.
  const defined = [...new Set([...css.matchAll(/\.(st-[a-z0-9-]+)/g)].map((match) => match[1]))]
  const unproduced = defined.filter((name) => !COMPOSED.has(name) && !outsideCss.includes(name))
  assert.deepEqual(unproduced, [], `rules for classes nothing renders: ${unproduced.join(', ')}`)
})

test('a class is not given two rules unless the second is a deliberate override', () => {
  // Two rules for one class is how a size and its own leading drift apart: the second silently
  // wins on the properties it names, and nothing says which of the two is the real one. This
  // happened while repairing the sheet — a restored block duplicated a rule that was already there.
  //
  // Some duplicates ARE deliberate: a reduced-motion override, or a state variant that adds one
  // property. Those are listed here, with the reason, so a new accidental one fails.
  const deliberate = new Set([
    'st-scroll', 'st-mid', 'st-root', 'st-shell', 'st-sheet', 'st-desk', 'st-editor-wrap',
    'st-dock-slot', 'st-status-flash', 'st-ai-dock-busy', 'st-ai-dock', 'st-ai-thinking-label',
    // The detail drawer's slide-in has a reduced-motion twin: the same class, a fade instead of a
    // translation, so the only difference between the two rules is the animation it names.
    'st-mosaic-page',
    // The board's second rule lives in a container query: the short side of its inset has to be
    // the dock's MEASURED height, and the base rule can only carry a written fallback for the
    // browsers that cannot read a container size.
    'st-mosaic-backdrop',
  ])
  const bare = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const selectors = [...bare.matchAll(/(?:^|\n)\s*\.([a-z0-9-]+)\{/g)].map((match) => match[1])
  const repeated = [...new Set(selectors.filter((name, index) => selectors.indexOf(name) !== index))]
  const unexplained = repeated.filter((name) => !deliberate.has(name))
  assert.deepEqual(unexplained, [], `classes with more than one rule: ${unexplained.join(', ')}`)
})

test('text on a filled control uses the foreground token, never the brand colour', () => {
  // `--dsw-alias-brand-text` is the brand colour ITSELF — what you use to make text brand-coloured.
  // In the shipped theme it equals `--dsw-alias-brand-primary` (#0f1115), so a button filled with
  // the brand colour and labelled with it is a dark rectangle with invisible text. That is exactly
  // what the top-right button was. DSH's own primary button uses
  // `--dsw-alias-label-primary-foreground` for this, which is the colour that contrasts with a fill.
  assert.ok(!css.includes('--dsw-alias-brand-text'),
    'the brand colour is not a label colour: use --dsw-alias-label-primary-foreground on a fill')

  // A control that paints a fill AND sets its text colour has to use the contrasting one. A rule
  // that only paints a shape — an indicator dot, a progress bar — carries no text and is not
  // checked: it sets no colour at all, which is what the `color:` filter below selects for.
  // The contrasting ink is either DSH's label-primary-foreground or the panel's own
  // --st-on-accent: in the theme the panel actually runs on the host alias resolves to a DARK
  // ink (the tooltip incident proved it), so on the dark vermilion fill the panel carries a
  // constant-white ink of its own rather than trusting the alias.
  const filled = [...css.matchAll(/\{([^{}]*background:var\(--(?:st-accent|dsw-alias-button-primary-fill)[^{}]*\})/g)]
    .map((match) => match[1])
    .filter((rule) => /(^|;)\s*color:/.test(rule))
  assert.ok(filled.length > 0, 'there are filled controls to check')
  for (const rule of filled) {
    assert.ok(/color:var\(--(?:dsw-alias-label-primary-foreground|st-on-accent)/.test(rule),
      `a filled control must set a contrasting label colour, saw: ${rule.slice(0, 90)}`)
  }
})

test('every host token reference survives a missing theme', () => {
  // A var() with no fallback makes its whole declaration invalid when the token is absent, and
  // "no theme" is a supported state: the panel then renders browser-default controls. The panel's
  // own variables are exempt — they are declared on `.st-shell` with their own literal fallback.
  const bare = [...css.matchAll(/var\(\s*(--[a-z0-9-]+)\s*\)/g)].map((match) => match[1])
  const hostTokens = bare.filter((token) => token.startsWith('--dsw-') || token.startsWith('--ds-'))
  assert.deepEqual(hostTokens, [],
    `host tokens with no literal fallback: ${[...new Set(hostTokens)].join(', ')}`)

  // The panel's own variables must each end their chain in a real value rather than in another
  // var(), because a var() whose fallback is a var() is not a fallback at all.
  //
  // What counts as that value depends on the kind of token: a colour (#rrggbb), a length or
  // duration (12px, 140ms), a unitless number (a z-index), or — for the two font stacks — a font
  // family name. The family case was added when the panel took its typography over from the host:
  // a stack like -apple-system,BlinkMacSystemFont,"Segoe UI" IS the literal, and demanding a #
  // would have meant either a fake colour or a special case for one token.
  const own = [...new Set(bare.filter((token) => token.startsWith('--st-')))]
  /** The text of one declaration, from its name to the semicolon that ends it. */
  const valueOf = (token) => {
    const at = css.indexOf(`${token}:`)
    if (at < 0) return null
    const rest = css.slice(at + token.length + 1)
    // A value ends at the first semicolon OUTSIDE any parentheses. The scan starts at depth zero
    // and walks the whole value, so a calc() that nests var() calls is read to its real end.
    let depth = 0
    for (let i = 0; i < rest.length; i += 1) {
      const ch = rest[i]
      if (ch === '(') depth += 1
      else if (ch === ')') depth -= 1
      else if (ch === ';' && depth === 0) return rest.slice(0, i)
    }
    return rest
  }
  /**
   * Every --st-* variable resolves to something real when no theme is loaded.
   *
   * The failure this guards is a var() chain that ends in nothing: `--a:var(--b,var(--c))` where
   * neither b nor c exists is not a fallback, and the whole declaration is invalid. What counts as
   * "something real" is either a literal in the value itself, OR a reference to another --st-*
   * variable that the panel declares on the same rule — that second case is deliberate, not a
   * loophole: --st-book-card-h is a calc() of four other panel variables, and each of those carries
   * its own literal a few lines above. Demanding a literal in the sum would mean repeating four
   * numbers inside it, which is the duplication the token table exists to prevent.
   */
  const unresolved = (token, seen = new Set()) => {
    if (seen.has(token)) return true
    seen.add(token)
    const value = valueOf(token)
    if (value === null) return true
    const refs = [...value.matchAll(/var\((--st-[a-z0-9-]+)/g)].map((match) => match[1])
    // Blank the FALLBACK part of each var() as well as the reference: a literal written inside
    // var(--token, 140ms) is exactly the fallback this test is about, so it has to count. The
    // previous version removed whole var() calls, which deleted their fallbacks with them.
    const withoutVars = value
      .replace(/var\([^,()]+,\s*([^()]*(?:\([^()]*\)[^()]*)*)\)/g, ' $1 ')
      .replace(/var\([^()]*(?:\([^()]*\)[^()]*)*\)/g, '')
    const hasLiteral = /#[0-9a-f]{3,8}\b|\d+(\.\d+)?(px|ms|s|%|deg|vh|vw|ch|em|rem)?\b|(?:[a-zA-Z-]{2,}|"[^"]+"|'[^']+'),\s*(?:[a-zA-Z-]{2,}|"[^"]+"|'[^']+')/i.test(withoutVars)
    if (hasLiteral) return false
    // No literal of its own: every reference it has must resolve, and it must have at least one.
    if (refs.length === 0) return true
    return refs.some((ref) => unresolved(ref, new Set(seen)))
  }
  for (const token of own) {
    assert.ok(!unresolved(token), `${token} resolves to a literal through its own chain`)
  }
})

test('the send button is a true circle in vermilion, not a themed primary fill', () => {
  // 朱红 is the panel's own colour for "this sends": fixed across themes, so the one affirmative
  // control in the composer does not turn into another neutral chip on a monochrome theme. And the
  // circle has to be a circle: a full radius is not enough on its own, because the host theme draws
  // every corner as a superellipse. See the corner-shape test below.
  const rule = /\.st-chat-send\{([^}]*)\}/.exec(css)?.[1] ?? ''
  assert.ok(rule !== '', 'the send button has a rule')
  assert.ok(rule.includes('background:var(--st-send'), 'filled with the panel vermilion')
  assert.ok(!rule.includes('dsw-alias-button-primary-fill'), 'not the theme primary fill')
  assert.ok(/border-radius:var\(--st-radius-round|border-radius:var\(--st-radius-pill/.test(rule),
    'a full radius, so it is round at any size')
  assert.ok(/corner-shape:round/.test(rule), 'and not the theme squircle')
  assert.ok(/aspect-ratio:1\/1/.test(rule), 'with a locked square aspect')
  assert.ok(/width:var\(--st-send-size,34px\)/.test(rule) && /height:var\(--st-send-size,34px\)/.test(rule),
    'and equal sides, from the one token that sizes it')

  // The colour itself, declared once, with a literal so a missing theme still gets vermilion.
  assert.ok(/--st-send:\s*(var\([^)]*#[0-9a-f]{6}|#[0-9a-f]{6})/i.test(css),
    'the vermilion is declared with a literal fallback')
})

test('every circle and pill opts out of the theme squircle', () => {
  // The host theme ships this, and it is not opt-in:
  //
  //   @supports (corner-shape:superellipse(1.5)){
  //     :root{--dsw-corner-shape:superellipse(1.5)}
  //     *,:before,:after{corner-shape:var(--dsw-corner-shape)}
  //   }
  //
  // A superellipse is the squircle. Under it a 50% radius draws a rounded square, so a "round"
  // control that does not reset corner-shape is measurably 34 by 34 with a 17px radius and still
  // looks wrong. The host's own round controls all carry corner-shape:round; ours must too.
  // Rectangles are excluded on purpose: the squircle IS the app's design language for cards and
  // buttons, and only full-round shapes are meant to be circles.
  const bare = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const blocks = bare.split('}').map((block) => block.trim()).filter(Boolean)
  const offenders = blocks.filter((block) => /border-radius:(50%|999px)/.test(block)
    && !/corner-shape:round/.test(block)
    && !/corner-shape:var\(--dsw-corner-shape/.test(block))
  const names = offenders.map((block) => block.split('{')[0].trim().slice(0, 60))
  assert.deepEqual(names, [], `full-radius rules without corner-shape:round: ${names.join(' | ')}`)
})

test('no CSS rule carries a hard-coded type size', () => {
  // Type comes from the host's scale so the panel matches the surface around it. This is the
  // same guarantee the render test makes, checked here without parsing a template literal twice.
  const sizes = [...css.matchAll(/font-size:(\d+)px/g)].map((match) => match[1])
  assert.deepEqual(sizes, [], `hard-coded font sizes: ${sizes.join(', ')}`)
})

// ---- one definition per quantity ----

/**
 * The stylesheet with its comments removed.
 *
 * Comments explain what a value MEANS ("28px and read as a small tag") and are not declarations;
 * scanning them would report the explanations as offenders.
 */
const cssCode = css.replace(/\/\*[\s\S]*?\*\//g, '')

/** Every declaration in the sheet, as `[property, value]`. */
function declarations(text) {
  return [...text.matchAll(/([a-zA-Z-]+)\s*:\s*([^;{}]+);/g)].map((m) => [m[1], m[2].trim()])
}

/** A value with its var() calls blanked out, so only literal lengths remain. */
const literalsOnly = (value) => value.replace(/var\([^()]*\)/g, 'V')

test('no CSS declaration carries a bare pixel value', () => {
  // EVERY length goes through a variable. This started as a rule about padding, gap and margin,
  // because those were once written as seventeen different values — 3 next to 4 next to 5 — and two
  // cards that should have looked alike did not.
  //
  // It is every length now, and the reason is the same one step out: a width written once is a
  // width that gets written again on the next page, and then two screens that look like siblings
  // are 340 and 340 by coincidence. The exemption that used to be here — "a value that appears once
  // needs no token" — was not the author's rule, it was invented to avoid the work, and it is
  // exactly where every one of those drifts started.
  //
  // What is allowed inline: numbers inside an expression rather than a value. min(), max(),
  // calc(), and viewport units describe a relationship to the container, not a design decision.
  const SIZED = /^(?:width|height|min-width|min-height|max-width|max-height|inline-size|block-size|top|right|bottom|left|inset|padding|gap|margin|border-radius|border-width|outline-width|font-size|line-height|letter-spacing)(?:-|$)/
  const offenders = []
  for (const [property, value] of declarations(cssCode)) {
    if (!SIZED.test(property)) continue
    // Blank out anything that is an expression rather than a literal length.
    const stripped = literalsOnly(value)
      .replace(/(?:min|max|calc|clamp)\([^()]*(?:\([^()]*\)[^()]*)*\)/g, '')
    const bare = [...stripped.matchAll(/(?<![\w.-])(\d+(?:\.\d+)?)(?:px|rem|em)\b/g)].map((m) => m[0])
    // 0 is a length with no units to choose from.
    // em on a spacing property is TYPOGRAPHY, not geometry: it is a multiple of the font size and
    // is how a heading's rhythm follows the type it sits in. Pinning those to px would break the
    // relationship the unit exists to express, so they are exempt by unit rather than by value.
    const real = bare.filter((token) => !/^0(?:\.0+)?(?:px|rem|em)$/.test(token))
      .filter((token) => !(/\.?\d+em$/.test(token) && /^(?:margin|padding|gap)/.test(property)))
    if (real.length > 0) offenders.push(`${property}:${value}`)
  }
  assert.deepEqual(offenders, [], `lengths outside the token table: ${offenders.join(' | ')}`)
})

test('radii come from the scale, never from a local pixel value', () => {
  // Same reasoning as spacing, and the same history: 1, 2, 3, 6, 7, 9, 18 and 999 all appeared,
  // each one chosen for one rule. The five sizes come from dsh; the pill is a shape, not a size,
  // and is named for that reason rather than written as a literal in sixteen rules.
  const offenders = []
  for (const [property, value] of declarations(cssCode)) {
    if (property !== 'border-radius') continue
    const bare = [...literalsOnly(value).matchAll(/(?<![\w.-])(\d+(?:\.\d+)?)(px|%)/g)].map((m) => m[0])
    // Zero means "no radius", which is an intention that needs no step.
    const real = bare.filter((token) => token !== '0px' && token !== '0%')
    if (real.length > 0) offenders.push(`${value}`)
  }
  assert.deepEqual(offenders, [], `radii outside the scale: ${offenders.join(' | ')}`)
})

test('z-index and stroke-width come from a named token, never from a bare number', () => {
  // A stacking order is a design decision — what covers what — and the board's four layers were
  // four unrelated integers until they were named as a group. The same goes for the wire widths:
  // three stroke weights that describe one line. Both read a var() or nothing.
  const offenders = []
  for (const [property, value] of declarations(cssCode)) {
    if (property !== 'z-index' && property !== 'stroke-width') continue
    // A var() — alone or shifted inside a calc() — is a value with one definition; a bare
    // integer is a local one.
    if (!/^var\(/.test(value) && !/^calc\((?:[^()]*var\([^()]*\))?[^()]*\)$/.test(value)) offenders.push(`${property}:${value}`)
  }
  assert.deepEqual(offenders, [], `stacking and stroke weights outside the token table: ${offenders.join(' | ')}`)
})

test('the card size is defined once, and the stylesheet reads it', () => {
  // It was written twice — `width:140px` in the sheet and `CARD_W = 140` in the code that places
  // the wires — and the two copies drifted, which is why a wire could stop landing on the card it
  // belonged to. One constant, handed to the sheet as a variable.
  assert.match(cssCode, /\.st-mosaic-card\{[^}]*width:var\(--st-card-w,/,
    'the card width comes from the variable the canvas sets')
  assert.match(cssCode, /\.st-mosaic-card\{[^}]*height:var\(--st-card-h,/,
    'and so does its height')
  assert.ok(!/\.st-mosaic-card\{[^}]*width:140px/.test(cssCode), 'no second copy of the number')
  // The pitch is derived from the card, not measured once and frozen. The declaration keyword is
  // matched loosely because this reads the BUILT bundle, where esbuild rewrites `const` to `var`.
  assert.match(source, /(?:const|var) CARD_STEP_X = CARD_W \+ CARD_GAP_X/,
    'the grid pitch follows the card size')
  assert.match(source, /(?:const|var) CARD_STEP_Y = CARD_H \+ CARD_GAP_Y/)
})

test('no token definition references itself', () => {
  // The surface tokens were born broken: a sweep that renamed the host layer tokens rewrote the
  // DEFINITIONS too, and `--st-surface:...var(--st-surface)...` is a self-reference — invalid as
  // a custom property, so every fill that read it went transparent. Nothing failed: no build
  // error, no test red, just panels you could see the host through. A definition may read other
  // tokens, never the one it is defining.
  const offenders = [...cssCode.matchAll(/--(st-[\w-]+):([^;{}]+)/g)]
    .filter(([, name, value]) => new RegExp(`var\\(--${name}[,) ]`).test(value))
    .map(([full]) => full)
  assert.deepEqual(offenders, [], `self-referential token definitions: ${offenders.join(' | ')}`)
})

test('file IO lives in one module', () => {
  // The IO module exists so the filesystem invariants (atomic writes, "missing is undefined")
  // are stated once. The first unification had six modules importing node:fs, with the atomic
  // write hand-copied three times — the copies drift exactly when a fix lands in one of them.
  // lib/io.js is the only file allowed to import node:fs; everything else goes through it.
  const libDir = join(here, '..', 'lib')
  const offenders = []
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) { walk(full); continue }
      if (!entry.name.endsWith('.js') || full === join(libDir, 'io.js')) continue
      const text = readFileSync(full, 'utf8')
      if (/from 'node:fs|from "node:fs|require\('node:fs/.test(text)) offenders.push(full.slice(libDir.length + 1))
    }
  }
  walk(libDir)
  assert.deepEqual(offenders, [], `these modules import node:fs directly: ${offenders.join(' | ')}`)
})

test('popups come from the shared Dialog/Drawer, never a hand-rolled backdrop', () => {
  // The context window once hand-rolled its own backdrop and dialog skeleton instead of mounting
  // the shared Dialog — a second popup implementation that could not inherit the fixes the shared
  // one gets. The backdrop class now lives in the fang-style library; only the library draws one.
  // The grandfathered files predate this rule and get folded in when they are next touched.
  const grandfathered = new Set([
    'panel/rail-tools.js',
    'mosaic/review.js',
    'mosaic/tabs.js',
  ])
  const root = join(here, '..', 'src', 'client')
  const offenders = []
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) { walk(full); continue }
      if (!entry.name.endsWith('.js') || entry.name.endsWith('.css.js')) continue
      const rel = full.slice(root.length + 1)
      if (grandfathered.has(rel)) continue
      if (/fang-backdrop|st-backdrop|st-sheet-backdrop/.test(readFileSync(full, 'utf8'))) offenders.push(rel)
    }
  }
  walk(root)
  assert.deepEqual(offenders, [], `hand-rolled popup skeletons: ${offenders.join(' | ')}`)
})

test('editable boxes never resize: the pane under them keeps its geometry', () => {
  // A resizable textarea dragged the reading pane's layout around under the text, which is how a
  // "fixed" page turned into one whose boxes moved on every drag. Every input in the panel is a
  // fixed box that scrolls; the resize property may only ever be `none`.
  const resizes = [...css.matchAll(/resize:\s*(vertical|both|horizontal)/g)].map((match) => match[1])
  assert.deepEqual(resizes, [], `resizable components: ${resizes.join(', ')}`)
})
