// The tower's levels as they stand in the render, bottom to top, each with the band of height
// (the render's world Z, from the "world pass") it occupies. These bands are what make the tower
// clickable: tools/tower-floor-maps.mjs reads each frame's world position and object mask and
// writes a floor map (/public/towerframes/floors/NNN.png) in which every tower pixel holds the
// 1-based index of its level in this list. Names and kinds can be changed here freely; changing
// a height or the order of the list needs the maps rebuilt.
//
// The heights are the architect's, read off the east elevation (260505 ALT 03): the render's
// world Z is in metres on the same datum, the tower standing from 0.07m at the plinth to
// 117.67m at the top of the crown. Each level runs up to the height of the one above it.
//
// The residences are the 11th to the 27th. Below them: the ground floor, the retail level, nine
// podium levels and a service floor. Above them: a second service floor - the filtration plant -
// and the terrace, which carries the parapet (112.80) and the crown over it.
const kinds = {
  lobby: 'lobby',
  retail: 'retail',
  podium: 'podium',
  service: 'service',
  residence: 'residence',
  terrace: 'terrace',
}

const ordinal = (n) => {
  const s = n % 100 >= 11 && n % 100 <= 13 ? 'th' : { 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th'
  return `${n}${s}`
}

const pad = (n) => String(n).padStart(2, '0')

// the podium levels, 02 to 10, at their slab heights
const PODIUM = [9.3, 12.4, 15.5, 18.6, 21.7, 24.8, 27.9, 32.1, 36.3]
// the residences, the 11th to the 27th
const RESIDENCES = [42.6, 46.5, 50.4, 54.3, 58.2, 62.1, 66.0, 69.9, 73.8, 77.7, 81.6, 85.5, 89.4, 93.3, 97.2, 101.1, 105.3]

const LEVELS = [
  { id: 'ground', num: 'G', label: 'Ground Floor', kind: kinds.lobby, z: 0 }, // with the plinth at 0.90
  { id: 'retail', num: '01', label: 'Retail Level 01', kind: kinds.retail, z: 5.1 },
  ...PODIUM.map((z, i) => ({ id: `podium-${pad(i + 2)}`, num: pad(i + 2), label: `Podium Level ${pad(i + 2)}`, kind: kinds.podium, z })),
  { id: 'service-podium', num: 'S', label: 'Service Floor', kind: kinds.service, z: 40.8 },
  ...RESIDENCES.map((z, i) => ({ id: `_${ordinal(11 + i)}`, num: String(11 + i), label: `${ordinal(11 + i)} Floor`, kind: kinds.residence, z })),
  { id: 'service-plant', num: 'S', label: 'Service Floor', kind: kinds.service, z: 109.5 }, // the filtration plant
  { id: 'terrace', num: 'T', label: 'Terrace', kind: kinds.terrace, z: 111.3 },
]

export const TOWER_FLOORS = LEVELS.map(({ z, ...level }, i) => ({
  ...level,
  z0: i === 0 ? -Infinity : z,
  z1: i === LEVELS.length - 1 ? Infinity : LEVELS[i + 1].z,
}))
