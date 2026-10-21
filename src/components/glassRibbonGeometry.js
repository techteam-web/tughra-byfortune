// Geometry of the menu's glass ribbon (see GlassRibbon.jsx), traced from the reference artwork.
// Kept apart from the component so the panel's shape can also be used in screen pixels.
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
const rev = (a) => [...a].reverse()

const I = [...down(371, 576), [373, 590], [377, 603], [382, 615], [389, 627], [398, 639], [410, 651], [426, 663], [447, 675], [472, 687], [497, 699], [517, 711], [532, 723], [544, 735], [553, 747], [561, 760], [568, 775]]
const A = [...down(380, 545), [381, 558], [382, 570], [385, 582], [389, 594], [394, 606], [401, 620], [410, 634], [422, 648], [438, 661], [458, 674], [484, 688], [510, 702], [533, 716], [553, 730], [570, 744], [584, 758], [596, 772]]
const B = [...down(389, 470), [390, 485], [392, 500], [394, 514], [396, 528], [398, 542], [401, 556], [403, 568], [406, 580], [409, 592], [413, 604], [418, 616], [425, 628], [434, 640], [445, 652], [458, 664], [474, 676], [493, 688], [515, 700], [537, 713], [555, 726], [570, 739], [583, 752], [595, 765]]
const C = [...down(389, 470), [392, 485], [395, 500], [399, 514], [403, 528], [408, 542], [413, 556], [419, 569], [426, 582], [434, 595], [443, 608], [452, 620], [462, 633], [474, 646], [489, 659], [505, 672], [521, 685], [537, 698], [552, 711], [565, 724], [576, 737], [586, 750], [596, 763]]
const CURL = [[315, -30], [316, 30], [318, 80], [320, 120], [323, 160], [328, 200], [334, 240], [342, 280], [352, 315], [362, 350], [368, 380], [371, 410]]

export const LINE_I = curve(I)
export const LINE_A = curve(A)
export const LINE_B = curve(B.slice(B.findIndex((p) => p[1] >= 470)))
export const LINE_C = curve(C)
export const LINE_CURL = curve(CURL)
export const PANEL = `M-4000 -36 ${curve(I, 'L')} L-4000 ${U(I.at(-1))[1].toFixed(1)} Z`
export const BODY = `${curve(I)} ${curve(rev(C), 'L')} Z`
export const CORE = `${curve(A)} ${curve(rev(B), 'L')} Z`
export const FACE = `${curve(B)} ${curve(rev(C), 'L')} Z`
export const GLASS = `${LINE_CURL} L${f(U([371, -30]))} Z`
export const FLOOR = U([450, 705])
export const SWEEP_I = curve(I.slice(I.findIndex((p) => p[1] >= 540)))
// the glossy face is lit from its leading edge (B) and dims toward the outer edge (C): a gradient
// across the band, whose run is roughly straight at this angle
export const FACE_FROM = [244, 840]
export const FACE_TO = [244 + 32 * 0.58, 840 - 32 * 0.81]

// The panel in screen pixels, for clipping the frosted copy of the photograph:
// `left` is the ribbon box's left edge and H the screen height, both in px.
export function panelClip(left, H) {
  const k = H / 900
  const T = ([u, v]) => [left + u * k, v * k]
  const top = T(U(I[0]))
  const end = T(U(I.at(-1)))
  return `M-60 ${top[1].toFixed(1)} ${curve(I, 'L', T)} L-60 ${end[1].toFixed(1)} Z`
}

