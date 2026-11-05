// Routes for the neighbourhood map: from the project to every place on it, by car and on foot, the
// shortest by road distance. Run from the project root, no key needed:
//
//   node tools/place-routes.mjs
//
// The coordinates in src/sections/locationData.js are the truth: every route starts at PROJECT and
// ends at the place's own `at`, exactly as written there - nothing is geocoded and nothing is moved.
// OSRM snaps each end to the nearest road, so the short hop between the given point and that road is
// stitched back on and counted, which keeps the drawn line touching the pin it belongs to.
//
// For each place and mode it asks for the route and its alternatives and keeps the one with the
// shortest distance. Writes src/sections/placeRoutes.json, which ships with the page - so a route
// draws the moment a place is picked, with no request at all. Rerun it when a place is added or
// moved; a place whose coordinates no longer match its route is routed live on the page until then.
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { PLACES, PROJECT, distanceKm } from '../src/sections/locationData.js'

const root = path.resolve(import.meta.dirname, '..')
const outFile = path.join(root, 'src/sections/placeRoutes.json')

// The public OSRM instances: one profile per mode, each with its own road network.
const MODES = [
  { key: 'drive', base: 'https://routing.openstreetmap.de/routed-car/route/v1/driving' },
  { key: 'walk', base: 'https://routing.openstreetmap.de/routed-foot/route/v1/foot' },
]
const GAP_KMH = { drive: 12, walk: 4.8 } // the stitched hop on and off the road network
const PAUSE = 350 // ms between requests - the demo servers are shared
const TRIES = 3

const round = (v) => Math.round(v * 1e5) / 1e5 // about a metre
const same = (a, b) => Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const ask = async (mode, to) => {
  const url = `${mode.base}/${PROJECT.join(',')};${to.join(',')}?overview=full&geometries=geojson&alternatives=3`
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url)
      const json = await res.json()
      if (!res.ok || json.code !== 'Ok') throw new Error(json.message ?? json.code ?? `HTTP ${res.status}`)
      return json.routes ?? []
    } catch (err) {
      if (attempt >= TRIES) throw err
      await sleep(PAUSE * attempt * 3)
    }
  }
}

// the shortest way there for this mode, pinned to the given coordinates at both ends
const shortest = async (mode, to) => {
  const routes = (await ask(mode, to)).filter((r) => r.geometry?.coordinates?.length > 1)
  const best = routes.sort((a, b) => a.distance - b.distance)[0]
  if (!best) throw new Error('no route')

  const coords = best.geometry.coordinates.map(([lng, lat]) => [round(lng), round(lat)])
  // Put the given points back on the ends, so the line runs pin to pin.
  const head = distanceKm(PROJECT, coords[0])
  const tail = distanceKm(coords[coords.length - 1], to)
  if (!same(coords[0], PROJECT)) coords.unshift([round(PROJECT[0]), round(PROJECT[1])])
  if (!same(coords[coords.length - 1], to)) coords.push([round(to[0]), round(to[1])])

  const km = best.distance / 1000 + head + tail
  const minutes = best.duration / 60 + ((head + tail) / GAP_KMH[mode.key]) * 60
  return { km: Math.round(km * 100) / 100, minutes: Math.max(1, Math.round(minutes)), coords }
}

const out = {}
let failed = 0
for (const place of PLACES.flatMap((c) => c.places)) {
  const ways = {}
  for (const mode of MODES) {
    try {
      ways[mode.key] = await shortest(mode, place.at)
    } catch (err) {
      console.error(`${place.id.padEnd(44)} ${mode.key} failed: ${err.message}`)
    }
    await sleep(PAUSE)
  }
  if (!ways.drive && !ways.walk) {
    failed++
    continue
  }
  out[place.id] = { to: place.at, ...ways }
  const show = (w) => (w ? `${w.km.toFixed(2).padStart(6)} km ${String(w.minutes).padStart(3)} min` : '           —      ')
  console.log(`${place.id.padEnd(44)} car ${show(ways.drive)} | walk ${show(ways.walk)}`)
}

writeFileSync(outFile, JSON.stringify(out) + '\n')
console.log(`\n${Object.keys(out).length} routes written to ${path.relative(root, outFile)}${failed ? `, ${failed} failed` : ''}`)
if (failed) process.exitCode = 1
