// Geometry of the menu's glass ribbon (see GlassRibbon.jsx). Kept apart from the component so the
// panel's shape can also be used in screen pixels.
//
// Points are in the reference artwork's pixels (750 px tall); the drawing space is 420 x 900 units
// (one unit = 1/900 of the screen height) with the ribbon's core at x 82.
const S = 1.2 // reference px -> units
const U = ([x, y]) => [82 + (x - 380) * S, y * S]
const f = (p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`

// evenly spaced points straight down a line, from above the screen to `to`
function down(x, to) {
  const n = Math.ceil((to + 30) / 15)
  return Array.from({ length: n + 1 }, (_, i) => [x, -30 + ((to + 30) * i) / n])
}

// a smooth curve through the points (Catmull-Rom, as cubic Béziers)
function curve(pts, start = 'M', T = (p) => p) {
  const P = pts.map((p) => T(U(p)))
  const n = P.length
  const ext = [[2 * P[0][0] - P[1][0], 2 * P[0][1] - P[1][1]], ...P, [2 * P[n - 1][0] - P[n - 2][0], 2 * P[n - 1][1] - P[n - 2][1]]]
  let d = `${start}${f(P[0])}`
  for (let i = 1; i < ext.length - 2; i++) {
    const [p0, p1, p2, p3] = [ext[i - 1], ext[i], ext[i + 1], ext[i + 2]]
    d += ` C${f([p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6])} ${f([p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6])} ${f(p2)}`
  }
  return d
}

// The panel's right edge: the left edge of the ribbon artwork (public/assets/fortune1.png), traced
// from its alpha, set 1.5 px under the ribbon so no seam shows between them.
const EDGE = [
  ...down(371.5, 574),
  [374.7, 586.6], [377.9, 599.3], [382.7, 612.1], [389.9, 624.8], [400.2, 637.6], [414.6, 650.4], [435.3, 663.1],
  [462.4, 675.9], [491.1, 688.6], [509.4, 701.4], [525.4, 714.1], [539.7, 726.9], [550.9, 739.6], [557.2, 749.2],
  [563.5, 762], [569.5, 775],
]
export const LINE_EDGE = curve(EDGE)
export const PANEL = `M-4000 -36 ${curve(EDGE, 'L')} L-4000 ${U(EDGE.at(-1))[1].toFixed(1)} Z`
export const FLOOR = U([450, 705])

// The ribbon artwork, placed so its lines sit on the geometry above. Both files are 941 px tall,
// the full height of the reference; fortune2 is the same ribbon drawn 1 px further right.
export const RIBBON_IMAGES = [
  { href: '/assets/fortune1.png', x: U([370, 0])[0], width: 359 * 0.797 * S },
  { href: '/assets/fortune2.png', x: U([369.2, 0])[0], width: 282 * 0.797 * S },
]

// The panel in screen pixels, for clipping the frosted copy of the photograph:
// `left` is the ribbon box's left edge and H the screen height, both in px.
export function panelClip(left, H) {
  const k = H / 900
  const T = ([u, v]) => [left + u * k, v * k]
  const top = T(U(EDGE[0]))
  const end = T(U(EDGE.at(-1)))
  return `M-60 ${top[1].toFixed(1)} ${curve(EDGE, 'L', T)} L-60 ${end[1].toFixed(1)} Z`
}
