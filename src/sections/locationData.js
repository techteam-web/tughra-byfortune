// The project's location. [lng, lat] (18.972319, 72.822374)
export const PROJECT = [72.822374, 18.972319]

// Landmarks around the project. Coordinates are approximate; distances are
// computed (straight-line, km) from PROJECT so they always match the map.
export const CATEGORIES = [
  {
    key: 'connectivity',
    label: 'Connectivity',
    places: [
      { name: 'Aqua Line Metro', at: [72.8203, 18.9708] },
      { name: 'Grant Road Station', at: [72.8161, 18.9637] },
      { name: 'Mahalaxmi Station', at: [72.8236, 18.9826] },
      { name: 'Lower Parel Station', at: [72.83, 18.997] },
      { name: 'Bandra-Worli Sea Link', at: [72.817, 19.0275] },
      { name: 'CSMT Terminus', at: [72.8355, 18.9398] },
      { name: 'Airport Terminal 2', at: [72.8656, 19.0896] },
    ],
  },
  {
    key: 'healthcare',
    label: 'Healthcare',
    places: [
      { name: 'Nair Hospital', at: [72.8202, 18.9751] },
      { name: 'Wockhardt Hospital', at: [72.8177, 18.9737] },
      { name: 'Jaslok Hospital', at: [72.8096, 18.9716] },
      { name: 'Breach Candy Hospital', at: [72.8045, 18.9715] },
      { name: 'Bombay Hospital', at: [72.8277, 18.9432] },
    ],
  },
  {
    key: 'landmarks',
    label: 'Landmarks',
    places: [
      { name: 'Maratha Mandir', at: [72.8217, 18.9712] },
      { name: 'Mahalaxmi Race Course', at: [72.8185, 18.982] },
      { name: 'Haji Ali Dargah', at: [72.8089, 18.9827] },
      { name: 'Nehru Science Centre', at: [72.8185, 18.9908] },
      { name: 'Palladium Mall', at: [72.8256, 18.9937] },
      { name: 'Girgaum Chowpatty', at: [72.8147, 18.9547] },
      { name: 'Marine Drive', at: [72.8236, 18.944] },
      { name: 'Gateway of India', at: [72.8347, 18.922] },
    ],
  },
  {
    key: 'hospitality',
    label: 'Hospitality',
    places: [
      { name: 'Four Seasons Mumbai', at: [72.8186, 18.9946] },
      { name: 'St. Regis Mumbai', at: [72.8267, 18.9925] },
      { name: 'ITC Grand Central', at: [72.8362, 19.0002] },
      { name: 'Trident Nariman Point', at: [72.8203, 18.9273] },
      { name: 'Taj Mahal Palace', at: [72.8332, 18.9217] },
    ],
  },
  {
    key: 'business',
    label: 'Business',
    places: [
      { name: 'Peninsula Business Park', at: [72.8247, 18.9999] },
      { name: 'Kamala Mills', at: [72.8264, 19.0006] },
      { name: 'One Indiabulls Centre', at: [72.833, 18.998] },
      { name: 'Fort District', at: [72.8337, 18.934] },
      { name: 'Nariman Point', at: [72.8246, 18.9256] },
      { name: 'Bandra Kurla Complex', at: [72.8683, 19.0674] },
    ],
  },
  {
    key: 'education',
    label: 'Education',
    places: [
      { name: 'Sophia College', at: [72.8085, 18.9697] },
      { name: 'Grant Medical College', at: [72.8346, 18.9632] },
      { name: "St. Xavier's College", at: [72.8312, 18.9435] },
      { name: 'Govt. Law College', at: [72.828, 18.9435] },
    ],
  },
]

export function distanceKm([lng1, lat1], [lng2, lat2]) {
  const rad = Math.PI / 180
  const dLat = (lat2 - lat1) * rad
  const dLng = (lng2 - lng1) * rad
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(a))
}

export function bearingDeg([lng1, lat1], [lng2, lat2]) {
  const rad = Math.PI / 180
  const y = Math.sin((lng2 - lng1) * rad) * Math.cos(lat2 * rad)
  const x =
    Math.cos(lat1 * rad) * Math.sin(lat2 * rad) -
    Math.sin(lat1 * rad) * Math.cos(lat2 * rad) * Math.cos((lng2 - lng1) * rad)
  return (Math.atan2(y, x) / rad + 360) % 360
}

// Curved route between two points (quadratic Bezier bowed to one side) so the
// line reads as an arc over the 3D map instead of a flat ruler line.
export function arcBetween(a, b, steps = 64) {
  const mx = (a[0] + b[0]) / 2
  const my = (a[1] + b[1]) / 2
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const cx = mx - dy * 0.18
  const cy = my + dx * 0.18
  const out = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const u = 1 - t
    out.push([u * u * a[0] + 2 * u * t * cx + t * t * b[0], u * u * a[1] + 2 * u * t * cy + t * t * b[1]])
  }
  return out
}

// Pre-computed, nearest first, with stable ids.
export const PLACES = CATEGORIES.map((c) => ({
  ...c,
  places: c.places
    .map((p) => ({ ...p, id: `${c.key}:${p.name}`, km: distanceKm(PROJECT, p.at) }))
    .sort((a, b) => a.km - b.km),
}))
