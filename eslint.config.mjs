import js from '@eslint/js'

/**
 * Only the rules that catch a mistake.
 *
 * The point of this config is not style. The files here are one 5,900-line classic script, one
 * 1,300-line host plugin and their tests, and the bugs they have had were of three kinds:
 *
 *  - a duplicated object key silently overwrote the earlier one (`action.close` was defined twice,
 *    so every ✕ button in the panel said 收起)
 *  - a name was read that was never declared, which throws inside a render and the host's error
 *    boundary swallows it into a blank panel
 *  - a function outlived its callers (`highlightRuns` stayed for two rounds after `paintRuns`
 *    replaced it, kept alive only by its own tests)
 *
 * So the set below is deliberately narrow: ESLint's own recommended correctness rules, plus the
 * handful of extras that name the same class of problem. Every formatting rule is OFF, because
 * this codebase has a consistent style already and reformatting 7,000 lines would bury the real
 * changes in a diff nobody can review.
 */
export default [
  {
    // `client.js` is a classic script loaded by the host's module loader: it is not an ES module
    // and it must not be parsed as one.
    files: ['client.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'script',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        URL: 'readonly',
      },
    },
    rules: js.configs.recommended.rules,
  },
  {
    // The shared domain kernel: pure data and rules, imported by both halves. It has no globals
    // of its own on purpose — a `process`, a `window` or a `fetch` appearing here would mean the
    // module has stopped being shareable.
    files: ['domain/**/*.js'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'module' },
    rules: js.configs.recommended.rules,
  },
  {
    files: ['lib/**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      // `Response` is the host's fetch response constructor, available in the plugin's runtime
      // realm rather than imported from node:. `fetch` and `Buffer` are Node globals the image
      // route reads without an import.
      globals: { process: 'readonly', console: 'readonly', URL: 'readonly', Response: 'readonly', fetch: 'readonly', Buffer: 'readonly' },
    },
    rules: js.configs.recommended.rules,
  },
  {
    // The sources under src/client are the files that are actually written; client.js is only
    // their build output. The gate has to read the sources or it reports on code nobody edits
    // and stays silent about the code they do.
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        window: 'readonly', document: 'readonly', navigator: 'readonly',
        fetch: 'readonly', console: 'readonly', setTimeout: 'readonly',
        clearTimeout: 'readonly', URL: 'readonly', Response: 'readonly',
        Request: 'readonly', Blob: 'readonly', crypto: 'readonly',
        TextEncoder: 'readonly', globalThis: 'readonly',
      },
    },
    rules: js.configs.recommended.rules,
  },
  {
    // The one `require` in the sources: the bundle's factory hands it in, and this file is the
    // only place that is allowed to touch it (see shared/react.js).
    files: ['src/client/shared/react.js'],
    languageOptions: { globals: { require: 'readonly' } },
  },
  {
    files: ['tests/**/*.js', 'tests/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      // Node's own test globals plus the web-platform constructors the route tests build requests
      // with. `setTimeout` is a Node global too; naming it keeps a typo visible.
      globals: {
        process: 'readonly', console: 'readonly', URL: 'readonly', globalThis: 'readonly',
        setTimeout: 'readonly', clearTimeout: 'readonly', Request: 'readonly', Response: 'readonly',
        Buffer: 'readonly',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      // A test file legitimately builds a whole component tree and reads one field of it.
      'no-unused-vars': ['error', { args: 'none', varsIgnorePattern: '^_' }],
    },
  },
  {
    // The extras, applied everywhere.
    files: ['client.js', 'lib/**/*.js', 'domain/**/*.js', 'src/**/*.js', 'tests/**/*.js', 'tests/**/*.mjs'],
    rules: {
      // `== null` is the one comparison that means "null or undefined" and is used deliberately
      // in this codebase; every other loose comparison is a bug waiting to happen.
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      // `if (x = y)` assigns instead of comparing. Not a style preference: it is a typo.
      'no-cond-assign': ['error', 'except-parens'],
      // Unreachable code is almost always a missing `return` or a stray early exit.
      'no-unreachable': 'error',
      // A constant condition hides a broken loop or a dead branch.
      'no-constant-condition': ['error', { checkLoops: false }],
      // `case` without `break` falls through silently.
      'no-fallthrough': 'error',
      // A Promise nobody awaits is how a route's write is lost.
      'no-async-promise-executor': 'error',
      // `typeof x === undefined` compares a string to the value `undefined`: always false.
      'valid-typeof': 'error',
      // A self-assignment or a self-comparison is a rename that went wrong.
      'no-self-assign': 'error',
      'no-self-compare': 'error',
      // `no-useless-assignment` is deliberately OFF. It cannot see through the "reassign, then
      // read on the next await" shape a test uses to settle a promise, so it flags code that is
      // correct. A rule that needs this many exceptions is not paying for itself.
      'no-useless-assignment': 'off',
      // `new Array(x)` with one numeric argument is an empty array of length x. Never intended.
      'no-array-constructor': 'error',
      // `return await` inside try is fine; `no-return-await` is deprecated in v10 and omitted.
      // A variable used before it is defined reads as `undefined` at module scope.
      'no-use-before-define': ['error', { functions: false, classes: false, variables: false }],
    },
  },
  {
    // The bundle's stylesheet is one template literal, and a backtick inside a CSS comment closes
    // it early. That happened twice while this file was being edited, each time breaking the whole
    // bundle. `no-template-curly-in-string` catches the other half of the same mistake.
    files: ['client.js'],
    rules: { 'no-template-curly-in-string': 'error' },
  },
  {
    ignores: ['node_modules/**', 'story/**', '.pw-browsers/**', '.venv-goldbook/**', '.pw-profile/**'],
  },
]
