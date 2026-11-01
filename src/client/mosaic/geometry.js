/**
 * The card's box, and the free spot a new card takes on the wall.
 *
 * These are not decoration. The canvas draws wires between card EDGES, so the width, the height
 * and the step between columns have to be the same numbers the layout uses — when they drifted
 * apart, a wire stopped landing on the card it belonged to and nothing else looked wrong.
 *
 * The card's size is ALSO written into the stylesheet through --st-card-w / --st-card-h, which
 * the canvas sets from these constants. That duplication is the one this file cannot remove —
 * the stylesheet draws the box, and the SVG needs its centre as a number. A test pins the two
 * together rather than a comment asking politely.
 *
 * 120 x 168 is 1:1.4, the trading-card proportion. The portrait fills the card and the caption
 * lies over its lower half, so the card IS the picture; the height comes from the width by that
 * ratio instead of from the sum of a band, a caption and two paddings, which is what tied it to
 * a layout that no longer exists.
 */
export const CARD_W = 120
export const CARD_H = 168

/** The pin's centre, measured from the card's top edge. The wire ends here, not at the card
 * centre: a thread is tied to the pin, and a pin is what the eye follows. */
export const PIN_Y = 12

/** The gap between cards, so the pitch follows the card instead of being measured from it. */
const CARD_GAP_X = 24
const CARD_GAP_Y = 24

export const CARD_STEP_X = CARD_W + CARD_GAP_X
export const CARD_STEP_Y = CARD_H + CARD_GAP_Y

/**
 * Where to put a card that has no position yet: the first free spot on the wall.
 *
 * NOT a grid any more. The canvas is a wall the writer arranges by hand, and a slot chosen by
 * ARRAY INDEX made a card's position depend on how many cards came before it — hide one with a
 * filter and its neighbours jumped, add one and the whole wall reshuffled. A card now has a
 * position because it was given one, once; after that only the writer's own drag moves it.
 *
 * "Free" is measured against the cards already placed, so this needs no canvas measurement and
 * cannot disagree with a width that has not been read yet. It walks a lattice and returns the
 * first cell no existing card overlaps, comparing real boxes: a cell is skipped when a card only
 * clips its corner.
 *
 * @param taken  the boxes already on the wall, as { x, y, w, h }
 */
export const mosaicFreeSpot = (taken) => {
  const boxes = Array.isArray(taken) ? taken : []
  const ORIGIN = 24
  const overlaps = (x, y, box) => (
    x < box.x + box.w && x + CARD_W > box.x
    && y < box.y + box.h && y + CARD_H > box.y
  )
  // Bounded: 40 rows by 12 columns is far more cells than a cast graph has cards, and the bound
  // keeps a pathological board from searching forever.
  for (let row = 0; row < 40; row += 1) {
    for (let col = 0; col < 12; col += 1) {
      const x = ORIGIN + col * CARD_STEP_X
      const y = ORIGIN + row * CARD_STEP_Y
      if (!boxes.some((box) => overlaps(x, y, box))) return { x, y }
    }
  }
  // Every cell taken: stack past the last row rather than leave a card without a position.
  return { x: ORIGIN, y: ORIGIN + 40 * CARD_STEP_Y }
}
