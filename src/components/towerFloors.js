// The tower's levels as they stand in the render, bottom to top, each with the band of height
// (the render's world Z, from the "world pass") it occupies. These bands are what make the tower
// clickable: tools/tower-floor-maps.mjs reads each frame's world position and object mask and
// writes a floor map (/public/towerframes/floors/NNN.png) in which every tower pixel holds the
// 1-based index of its level in this list. Names and kinds can be changed here freely; changing
// a height or the order of the list needs the maps rebuilt.
//
// Heights are read off the facade: a double-height entrance lobby, three screened parking bays,
// two glazed floors, the floor where the copper arches turn, then 17 floors on a steady 3.905
// rhythm, and the terrace and crown on top.
const kinds = { lobby: 'lobby', parking: 'parking', amenity: 'amenity', residence: 'residence', terrace: 'terrace' }

const ordinal = (n) => {
  const s = n % 100 >= 11 && n % 100 <= 13 ? 'th' : { 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th'
  return `${n}${s}`
}

const level = (n, kind, z0, z1) => ({ id: `_${ordinal(n)}`, num: String(n), label: `${ordinal(n)} Floor`, kind, z0, z1 })

const RHYTHM = 3.905
const RHYTHM_FROM = 41.7 // the first slab of the regular floors

export const TOWER_FLOORS = [
  { id: 'Ground', num: 'G', label: 'Ground Floor', kind: kinds.lobby, z0: -Infinity, z1: 10.4 },
  level(1, kinds.parking, 10.4, 15.6),
  level(2, kinds.parking, 15.6, 21.8),
  level(3, kinds.parking, 21.8, 28.1),
  level(4, kinds.amenity, 28.1, 32.2),
  level(5, kinds.amenity, 32.2, 37.4),
  level(6, kinds.residence, 37.4, RHYTHM_FROM),
  ...Array.from({ length: 17 }, (_, i) => level(7 + i, kinds.residence, RHYTHM_FROM + i * RHYTHM, RHYTHM_FROM + (i + 1) * RHYTHM)),
  { id: 'terrace', num: 'T', label: 'Terrace', kind: kinds.terrace, z0: RHYTHM_FROM + 17 * RHYTHM, z1: Infinity },
]
