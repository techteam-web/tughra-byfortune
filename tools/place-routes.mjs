// Routes for the neighbourhood map: from the project to every place on it, by car and on foot, the
// shortest by distance, from Google's Routes API. Run from the project root with a Maps API key that has the
// Routes API enabled:
//
//   GOOGLE_MAPS_API_KEY=... node tools/place-routes.mjs
//
// For each place it asks for the default route, its alternatives and Google's shorter-distance
// reference route, and keeps the shortest of them. Writes src/sections/placeRoutes.json, which
// ships with the page - so a route draws the moment a place is picked, with no request at all,
// and the key never reaches the browser. Rerun it when a place is added or moved; a place whose
// coordinates no longer match its route is routed live on the page until then.
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { PLACES } from '../src/sections/locationData.js'

const KEY = process.env.GOOGLE_MAPS_API_KEY
if (!KEY) {
  console.error('Set GOOGLE_MAPS_API_KEY to a Google Maps API key with the Routes API enabled.')
  process.exit(1)
}

const root = path.resolve(import.meta.dirname, '..')
const outFile = path.join(root, 'src/sections/placeRoutes.json')
const URL = 'https://routes.googleapis.com/directions/v2:computeRoutes'
const FIELDS = 'routes.distanceMeters,routes.duration,routes.polyline.geoJsonLinestring,routes.legs.startLocation'

// Every route starts at the building, which Google finds from its street address - exact where the
// coordinates in locationData.js are only approximate. The point it settles on is printed at the end:
// put it in PROJECT so the tower on the map stands where the routes start.
const ORIGIN = '165, Meghraj Sethi Marg, Agripada, Mumbai, Maharashtra'
let start = null

const point = ([lng, lat]) => ({ location: { latLng: { latitude: lat, longitude: lng } } })
const round = (v) => Math.round(v * 1e5) / 1e5 // about a metre

const ask = async (to, travelMode, shorter) => {
  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': KEY, 'X-Goog-FieldMask': FIELDS },
    body: JSON.stringify({
      origin: { address: ORIGIN },
      destination: point(to),
      travelMode,
      // alternatives and traffic only apply to driving; a walk is one route
      ...(travelMode === 'DRIVE' && { routingPreference: 'TRAFFIC_UNAWARE', computeAlternativeRoutes: true }),
      ...(travelMode === 'DRIVE' && shorter && { requestedReferenceRoutes: ['SHORTER_DISTANCE'] }),
      polylineQuality: 'HIGH_QUALITY',
      polylineEncoding: 'GEO_JSON_LINESTRING',
      units: 'METRIC',
    }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error?.message ?? `HTTP ${res.status}`)
  return json.routes ?? []
}

// the shortest route there; the shorter-distance reference route is asked for where Google offers it
const shortest = async (to, travelMode) => {
  let routes
  try {
    routes = await ask(to, travelMode, true)
  } catch {
    routes = await ask(to, travelMode, false)
  }
  start ??= routes[0]?.legs?.[0]?.startLocation?.latLng
  const best = routes.filter((r) => r.polyline?.geoJsonLinestring?.coordinates?.length > 1).sort((a, b) => a.distanceMeters - b.distanceMeters)[0]
  if (!best) throw new Error('no route')
  return {
    km: Math.round(best.distanceMeters / 10) / 100,
    minutes: Math.round(parseInt(best.duration, 10) / 60),
    coords: best.polyline.geoJsonLinestring.coordinates.map(([lng, lat]) => [round(lng), round(lat)]),
  }
}

const out = {}
let failed = 0
for (const place of PLACES.flatMap((c) => c.places)) {
  try {
    const [drive, walk] = [await shortest(place.at, 'DRIVE'), await shortest(place.at, 'WALK')]
    out[place.id] = { to: place.at, drive, walk }
    console.log(`${place.id.padEnd(44)} car ${drive.km.toFixed(2).padStart(6)} km ${String(drive.minutes).padStart(3)} min | walk ${walk.km.toFixed(2).padStart(6)} km ${String(walk.minutes).padStart(3)} min`)
  } catch (err) {
    failed++
    console.error(`${place.id.padEnd(48)} failed: ${err.message}`)
  }
}

if (start) console.log(`
the building, as Google places it: PROJECT = [${start.longitude}, ${start.latitude}]`)
writeFileSync(outFile, JSON.stringify(out) + '\n')
console.log(`\n${Object.keys(out).length} routes written to ${path.relative(root, outFile)}${failed ? `, ${failed} failed` : ''}`)
if (failed) process.exitCode = 1
