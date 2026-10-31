/**
 * Where the books live, and how to point the panel somewhere else.
 *
 * Read from the host's `models` route rather than derived from the workspace list: the library is
 * a setting, and a path the panel guessed is a path the host may not agree with.
 *
 * `undefined` means "still asking" — the shelf draws its loading state instead of scanning a
 * directory nobody named yet. An empty string means the host answered with nothing, which draws
 * an empty shelf and lets the writer set a location.
 */
import { React } from '../shared/react.js'

export function useLibrary(api) {
  const [library, setLibraryState] = React.useState(undefined)
  const [libraryEpoch, setLibraryEpoch] = React.useState(0)
  React.useEffect(() => {
    let cancelled = false
    // A host without this route (or a failing one) must not leave the panel on its loading
    // state forever: an empty string means "ask the host, it said nothing", which draws the
    // shelf and lets the writer set a library. Only `undefined` means "still asking".
    const settle = (value) => { if (!cancelled) setLibraryState(typeof value === 'string' ? value : '') }
    if (typeof api.models !== 'function') { settle(''); return () => { cancelled = true } }
    api.models().then((data) => settle(data?.library), () => settle(''))
    return () => { cancelled = true }
  }, [api, libraryEpoch])
  /** Point the library somewhere else. The host writes the setting; nothing is moved. */
  const chooseLibrary = async (path) => {
    const data = await api.setLibrary(path)
    setLibraryState(typeof data?.library === 'string' ? data.library : '')
    setLibraryEpoch((n) => n + 1)
    return data
  }

  return { library, chooseLibrary }
}
