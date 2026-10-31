/**
 * The pointer's patch of the dot canvas: cells near the mouse turn into small, tilted glyphs.
 *
 * CSS can draw a dot lattice but cannot choose a random character per cell, so this is a small
 * imperative layer: a fixed pool of absolutely positioned slots is moved over the grid, and only
 * the cells inside the pointer radius are switched on. Nothing here changes React state — the
 * pointer is a 60fps event and re-rendering the page for it would be the wrong tool.
 */
import { React, h } from '../shared/react.js'

const GLYPHS = [
  '位', '面', '飞', '行', '山', '川', '风', '月', '云', '雨', '灯', '书', '纸', '墨',
  '夜', '星', '海', '舟', '花', '木', '光', '影', '梦', '路', '门', '窗',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'K', 'M', 'N', 'R', 'S', 'T', 'W', 'X', 'Y', 'Z',
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'k', 'm', 'n', 'r', 's', 't', 'w', 'x', 'y', 'z',
]

const SLOT_COUNT = 220

/** A stable number per grid cell: the same cell keeps its letter and tilt between visits. */
function hashCell(col, row) {
  let value = (col * 73856093) ^ (row * 19349663)
  value = Math.imul(value ^ (value >>> 13), 1274126177)
  return value >>> 0
}

function tokenNumber(styles, name, fallback) {
  const value = Number.parseFloat(styles.getPropertyValue(name))
  return Number.isFinite(value) && value > 0 ? value : fallback
}

export function GlyphField() {
  const rootRef = React.useRef(null)

  React.useEffect(() => {
    const root = rootRef.current
    if (root === null || root === undefined || typeof document === 'undefined' || typeof window === 'undefined') return undefined
    if (typeof window.getComputedStyle !== 'function' || typeof document.createElement !== 'function') return undefined
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const parent = root.parentElement
    if (parent === null || parent === undefined) return undefined

    const styles = window.getComputedStyle(root)
    const cell = tokenNumber(styles, '--st-canvas-grid', 24)
    const radius = tokenNumber(styles, '--st-glyph-radius', 150)
    const contentPad = tokenNumber(styles, '--st-glyph-content-pad', 6)
    const slots = []
    for (let index = 0; index < SLOT_COUNT; index += 1) {
      const slot = document.createElement('div')
      slot.className = 'st-glyph-slot'
      slot.dataset.on = 'false'
      const face = document.createElement('span')
      face.className = 'st-glyph-face'
      slot.appendChild(face)
      root.appendChild(slot)
      slots.push({ slot, face, used: false })
    }
    const active = new Map()
    let frame = 0
    let pointer = null

    const free = () => slots.find((entry) => !entry.used)
    const draw = () => {
      frame = 0
      if (pointer === null) return
      const rect = root.getBoundingClientRect()
      const x = pointer.clientX - rect.left
      const y = pointer.clientY - rect.top
      const firstCol = Math.floor((x - radius) / cell)
      const lastCol = Math.floor((x + radius) / cell)
      const firstRow = Math.floor((y - radius) / cell)
      const lastRow = Math.floor((y + radius) / cell)
      const wanted = new Set()
      // Each actual component is a box of its own. A single union around the copy column also
      // covered the empty air between the lede and the action row, which is not content.
      const content = root.parentElement?.querySelector?.('.st-welcome-main')
      const zones = content === null || content === undefined
        ? []
        : [...content.querySelectorAll('.st-welcome-title, .st-welcome-latin, .st-welcome-lede, .st-welcome-actions')]
      const contentBoxes = zones.map((zone) => {
        const box = zone.getBoundingClientRect()
        return {
          left: box.left - rect.left - contentPad, right: box.right - rect.left + contentPad,
          top: box.top - rect.top - contentPad, bottom: box.bottom - rect.top + contentPad,
        }
      })

      for (let row = firstRow; row <= lastRow; row += 1) {
        for (let col = firstCol; col <= lastCol; col += 1) {
          const cx = (col + 0.5) * cell
          const cy = (row + 0.5) * cell
          if ((cx - x) ** 2 + (cy - y) ** 2 > radius ** 2) continue
          const key = `${col}:${row}`
          const underContent = contentBoxes.some((box) => cx >= box.left && cx <= box.right
            && cy >= box.top && cy <= box.bottom)
          wanted.add(key)
          const n = hashCell(col, row)
          // Not every cell: a full grid reads as pasted text. The holes are what makes the patch
          // feel like the lattice itself has broken into symbols.
          if (n % 3 === 0) continue
          const char = GLYPHS[n % GLYPHS.length]
          let entry = active.get(key)
          if (entry === undefined) {
            entry = free()
            if (entry === undefined) continue
            entry.used = true
            active.set(key, entry)
            entry.slot.style.transform = `translate3d(${Math.round(col * cell)}px, ${Math.round(row * cell)}px, 0)`
            entry.face.textContent = char
            entry.slot.dataset.tone = n % 16 === 0 ? 'accent' : (n % 4 === 0 ? 'primary' : 'secondary')
            entry.face.style.setProperty('--st-glyph-ry', `${((n % 20) - 10)}deg`)
            entry.face.style.setProperty('--st-glyph-rx', `${((n >>> 4) % 10) - 5}deg`)
            entry.face.style.setProperty('--st-glyph-delay', `${(n % 5) * 24}ms`)
          }
          entry.slot.dataset.on = 'true'
          entry.slot.dataset.content = underContent ? 'true' : 'false'
        }
      }
      for (const [key, entry] of [...active]) {
        if (wanted.has(key)) continue
        entry.slot.dataset.on = 'false'
        entry.used = false
        active.delete(key)
      }
    }

    const onMove = (event) => {
      pointer = { clientX: event.clientX, clientY: event.clientY }
      // Over the headline or the actions, the field must stop competing with the content: blur
      // it rather than letting random glyphs sit behind a button label.
      root.dataset.visible = 'true'
      if (frame === 0) frame = (window.requestAnimationFrame ?? globalThis.requestAnimationFrame)(draw)
    }
    const onLeave = () => {
      pointer = null
      root.dataset.visible = 'false'
      for (const entry of active.values()) {
        entry.slot.dataset.on = 'false'
        entry.used = false
      }
      active.clear()
    }

    parent.addEventListener('pointermove', onMove)
    parent.addEventListener('pointerleave', onLeave)
    parent.addEventListener('pointercancel', onLeave)
    return () => {
      if (frame !== 0) (window.cancelAnimationFrame ?? globalThis.cancelAnimationFrame)(frame)
      parent.removeEventListener('pointermove', onMove)
      parent.removeEventListener('pointerleave', onLeave)
      parent.removeEventListener('pointercancel', onLeave)
      for (const entry of slots) entry.slot.remove()
    }
  }, [])

  return h('div', { className: 'st-glyph-field', ref: rootRef, 'aria-hidden': 'true', 'data-visible': 'false' })
}
