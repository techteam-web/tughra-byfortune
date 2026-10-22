import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Map as MapLibreMap, Marker, NavigationControl, setWorkerUrl } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { gsap, fx, PAGE_IN, REDUCED } from '../motion/index.js'
import { TopBar, MenuControl, Segmented } from '../ui/controls.jsx'
import { glowAt } from '../ui/glow.js'
import { T, alpha, mix } from '../theme/tokens.js'
import { PROJECT, PLACES, bearingDeg, arcBetween, distanceKm } from './locationData.js'
import './Location.css'

// In production the worker is shipped by the maplibreWorker plugin in vite.config.js
// (dev serves it straight from node_modules, so no override is needed there).
if (import.meta.env.PROD) setWorkerUrl(`${import.meta.env.BASE_URL}maplibre/maplibre-gl-worker.mjs`)

// The map in the site's own palette, every shade derived from the tokens: espresso
// water, cocoa land, darker cocoa parks, cream labels. Roads are quiet warm taupe
// lines (not gold), so the routes in pink, blue, green and yellow sit clearly above them.
const M = {
  ground: mix(T.cocoa, T.espresso, 0.55),
  land: mix(T.cream, T.cocoa, 0.04),
  residential: mix(T.cream, T.cocoa, 0.06),
  park: mix(T.cocoa, T.espresso, 0.75),
  wood: mix(T.cocoa, T.espresso, 0.7),
  grass: mix(T.cocoa, T.espresso, 0.65),
  sand: mix(T.cream, T.cocoa, 0.12),
  water: T.espresso,
  river: mix(T.espresso, T.cocoa, 0.35),
  building: mix(T.cream, T.cocoa, 0.1),
  major: mix(T.cream, T.cocoa, 0.3),
  secondary: mix(T.cream, T.cocoa, 0.2),
  minor: mix(T.cream, T.cocoa, 0.11),
  casing: T.espresso,
  rail: mix(T.cream, T.cocoa, 0.25),
  boundary: mix(T.cream, T.cocoa, 0.2),
  label: T.cream,
  halo: T.espresso,
  clear: alpha(T.espresso, 0),
}

// Recolours the OpenFreeMap "liberty" style to the palette above instead of its default bright look.
function applyBrandTheme(map) {
  const touched = new Set()
  const set = (id, prop, value) => {
    if (!map.getLayer(id)) return
    touched.add(id + prop)
    try {
      map.setPaintProperty(id, prop, value)
    } catch {
      // Property doesn't apply to this layer's type — skip it.
    }
  }
  const hide = (id) => {
    if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'none')
  }

  // Strip out the default clutter that clashes with a premium look — bus/poi
  // icons, road shields, one-way arrows, and rail hatching patterns are all
  // small colorful sprites baked into the style's own sprite sheet, so they
  // can't be recolored — only hidden.
  for (const id of [
    'natural_earth',
    'poi_r7',
    'poi_r1',
    'poi_transit',
    'road_one_way_arrow',
    'road_one_way_arrow_opposite',
    'highway-shield-non-us',
    'highway-shield-us-interstate',
    'road_shield_us',
    'road_area_pattern',
    'road_major_rail_hatching',
    'road_transit_rail_hatching',
    'bridge_major_rail_hatching',
    'bridge_transit_rail_hatching',
    'tunnel_major_rail_hatching',
    'tunnel_transit_rail_hatching',
    'boundary_disputed',
    'aeroway_taxiway',
    'aeroway_runway',
  ]) {
    hide(id)
  }
  // Keep the label but drop the blue icon glyph for the remaining POI layer.
  set('poi_r20', 'icon-opacity', 0)
  set('airport', 'icon-opacity', 0)

  set('background', 'background-color', M.ground)

  // Ground cover
  for (const id of [
    'landcover_ice',
    'landcover_wetland',
    'landuse_pitch',
    'landuse_track',
    'landuse_cemetery',
    'landuse_hospital',
    'landuse_school',
    'aeroway_fill',
  ]) {
    set(id, 'fill-color', M.land)
  }
  set('landuse_residential', 'fill-color', M.residential)
  set('landcover_wood', 'fill-color', M.wood)
  set('landcover_grass', 'fill-color', M.grass)
  set('landcover_sand', 'fill-color', M.sand)
  set('landuse_pitch', 'fill-color', M.grass)
  set('park', 'fill-color', M.park)
  set('park_outline', 'line-color', M.park)

  // Water
  set('water', 'fill-color', M.water)
  for (const id of ['waterway_tunnel', 'waterway_river', 'waterway_other']) {
    set(id, 'line-color', M.river)
  }

  // Buildings
  set('building', 'fill-color', M.building)

  // Roads — warm taupe, lighter for major routes, fading for minor ones
  for (const id of ['road_motorway', 'road_trunk_primary', 'bridge_motorway', 'bridge_trunk_primary', 'tunnel_motorway', 'tunnel_trunk_primary']) {
    set(id, 'line-color', M.major)
  }
  for (const id of ['road_secondary_tertiary', 'bridge_secondary_tertiary', 'tunnel_secondary_tertiary']) {
    set(id, 'line-color', M.secondary)
  }
  for (const id of [
    'road_minor',
    'road_link',
    'road_service_track',
    'road_path_pedestrian',
    'road_area_pattern',
    'bridge_street',
    'bridge_link',
    'bridge_path_pedestrian',
    'tunnel_street_casing',
    'tunnel_link',
    'tunnel_minor',
    'tunnel_path_pedestrian',
  ]) {
    set(id, 'line-color', M.minor)
  }
  for (const id of [
    'road_motorway_casing',
    'road_trunk_primary_casing',
    'road_secondary_tertiary_casing',
    'road_minor_casing',
    'road_link_casing',
    'road_service_track_casing',
    'bridge_motorway_casing',
    'bridge_trunk_primary_casing',
    'bridge_secondary_tertiary_casing',
    'bridge_link_casing',
    'bridge_service_track_casing',
    'bridge_motorway_link_casing',
    'tunnel_motorway_casing',
    'tunnel_trunk_primary_casing',
    'tunnel_secondary_tertiary_casing',
  ]) {
    set(id, 'line-color', M.casing)
  }
  for (const id of ['road_major_rail', 'road_transit_rail', 'bridge_major_rail', 'bridge_transit_rail', 'tunnel_major_rail', 'tunnel_transit_rail']) {
    set(id, 'line-color', M.rail)
  }

  // Layers the base style draws in white / light grey / yellow that would
  // otherwise show up as stray bright lines once zoomed in.
  set('building', 'fill-outline-color', M.clear)
  set('park', 'fill-outline-color', M.clear)
  set('aeroway_fill', 'fill-opacity', 0.3)
  for (const id of ['tunnel_service_track', 'bridge_service_track', 'tunnel_minor']) {
    set(id, 'line-color', M.minor)
  }
  for (const id of ['road_motorway_link', 'bridge_motorway_link', 'tunnel_motorway_link']) {
    set(id, 'line-color', M.secondary)
  }
  for (const id of [
    'road_motorway_link_casing',
    'tunnel_motorway_link_casing',
    'tunnel_link_casing',
    'tunnel_service_track_casing',
    'bridge_street_casing',
    'bridge_path_pedestrian_casing',
  ]) {
    set(id, 'line-color', M.casing)
  }

  // Boundaries
  for (const id of ['boundary_2', 'boundary_3', 'boundary_disputed']) {
    set(id, 'line-color', M.boundary)
  }

  // Labels — cream text, espresso halo
  for (const id of [
    'water_name_point_label',
    'water_name_line_label',
    'waterway_line_label',
    'poi_r20',
    'poi_r7',
    'poi_r1',
    'poi_transit',
    'highway-name-path',
    'highway-name-minor',
    'highway-name-major',
    'airport',
    'label_other',
    'label_village',
    'label_town',
    'label_state',
    'label_city',
    'label_city_capital',
    'label_country_3',
    'label_country_2',
    'label_country_1',
  ]) {
    set(id, 'text-color', M.label)
    set(id, 'text-halo-color', M.halo)
  }

  // Safety net: anything the lists above missed that is still light (white road
  // casings, pale outlines, ...) is pulled into the palette, so no stray bright
  // lines appear at any zoom.
  const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  const isLight = (css) => {
    if (typeof css !== 'string' || !probe) return false
    probe.clearRect(0, 0, 1, 1)
    probe.fillStyle = M.ground
    probe.fillStyle = css
    probe.fillRect(0, 0, 1, 1)
    const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data
    return a > 20 && 0.299 * r + 0.587 * g + 0.114 * b > 120
  }
  for (const layer of map.getStyle().layers) {
    const { id, type } = layer
    if (type === 'line' && !touched.has(id + 'line-color') && isLight(map.getPaintProperty(id, 'line-color'))) {
      set(id, 'line-color', M.minor)
    }
    if (type === 'fill') {
      if (!touched.has(id + 'fill-color') && isLight(map.getPaintProperty(id, 'fill-color'))) set(id, 'fill-color', M.land)
      if (!touched.has(id + 'fill-outline-color')) set(id, 'fill-outline-color', M.clear)
    }
  }
}

// Everything the "3D" feel needs beyond colors: taller, height-graded
// buildings (cocoa, catching more light the higher they rise), a warm horizon,
// and an atmospheric sky.
function applyDepth(map) {
  if (map.getLayer('building-3d')) {
    map.setPaintProperty('building-3d', 'fill-extrusion-color', [
      'interpolate',
      ['linear'],
      ['get', 'render_height'],
      0,
      mix(T.cream, T.cocoa, 0.08),
      40,
      mix(T.cream, T.cocoa, 0.16),
      120,
      mix(T.cream, T.cocoa, 0.26),
      300,
      mix(T.cream, T.cocoa, 0.38),
    ])
    map.setPaintProperty('building-3d', 'fill-extrusion-opacity', 0.94)
    map.setPaintProperty('building-3d', 'fill-extrusion-vertical-gradient', true)
    map.setLayerZoomRange('building-3d', 13, 24)
  }
  try {
    map.setSky({
      'sky-color': T.espresso,
      'horizon-color': mix(T.cocoa, T.espresso, 0.3),
      'fog-color': M.ground,
      'sky-horizon-blend': 0.7,
      'horizon-fog-blend': 0.8,
      'fog-ground-blend': 0.85,
    })
  } catch {
    // Style spec without sky support — the plain dark backdrop is fine.
  }
}

const ROUTE_SRC = 'route'
const ALL_SRC = 'routes-all'

// Routes use only four colours: pink, blue, green and yellow. Each category takes one
// of them. Within a category, each place gets its own shade of that colour (lightened
// by a different amount), so when several routes share the map at once (the overview)
// every route still reads as its own line without leaving the category's hue.
const PINK = '#F06BA8'
const BLUE = '#4D9BFF'
const GREEN = '#4CD98A'
const YELLOW = '#FFD23F'
const CATEGORY_COLORS = {
  connectivity: BLUE,
  healthcare: PINK,
  landmarks: YELLOW,
  hospitality: PINK,
  business: YELLOW,
  education: GREEN,
}
const SHADE_KEEP = [1, 0.72, 0.5, 0.86, 0.6, 0.94, 0.4, 0.78]
const colorOf = (category, i = 0) => {
  const base = CATEGORY_COLORS[category] || CATEGORY_COLORS.connectivity
  return mix(base, '#ffffff', SHADE_KEEP[((i % SHADE_KEEP.length) + SHADE_KEEP.length) % SHADE_KEEP.length])
}
const ROUTE_DEFAULT = CATEGORY_COLORS.connectivity
const ROUTE_OFF = alpha(ROUTE_DEFAULT, 0)
// The route is revealed by masking a line-gradient (cheap) rather than re-sending
// the geometry every frame (which re-parses and re-tiles it).
function routeGradient(p, color) {
  const edge = Math.min(Math.max(p, 0.0001), 0.9998)
  // fully drawn: one colour end to end (stops must stay strictly ascending)
  if (p >= 0.9998) return ['interpolate', ['linear'], ['line-progress'], 0, color, 1, color]
  return ['interpolate', ['linear'], ['line-progress'], 0, color, edge, color, Math.min(edge + 0.0001, 1), ROUTE_OFF, 1, ROUTE_OFF]
}
function setRouteProgress(map, p, color = ROUTE_DEFAULT) {
  if (!map.getLayer('route-line')) return
  map.setPaintProperty('route-glow', 'line-gradient', routeGradient(p, alpha(color, 0.6)))
  map.setPaintProperty('route-line', 'line-gradient', routeGradient(p, color))
}

// road route from the project to a place (an arc when offline or rate-limited), cached per place
const routeCache = new globalThis.Map()
function fetchRoute(place, signal) {
  if (routeCache.has(place.id)) return routeCache.get(place.id)
  const t = setTimeout(() => signal?.abort?.(), 7000)
  const pr = fetch(`https://router.project-osrm.org/route/v1/driving/${PROJECT.join(',')};${place.at.join(',')}?overview=full&geometries=geojson`)
    .then((r) => r.json())
    .then((json) => {
      const coords = json.routes?.[0]?.geometry?.coordinates
      if (!coords || coords.length < 2) throw new Error('no route')
      return coords
    })
    .catch(() => arcBetween(PROJECT, place.at))
    .finally(() => clearTimeout(t))
  routeCache.set(place.id, pr)
  return pr
}
const EMPTY = { type: 'FeatureCollection', features: [] }

const OVERVIEW = { center: PROJECT, zoom: 15.2, pitch: 64, bearing: -25 }

// Three fishing boats on the water off Haji Ali, Breach Candy and in Back Bay [lng, lat]
const BOATS = [
  [72.8048, 18.9772],
  [72.7985, 18.98],
  [72.8135, 18.9435],
]
// a small koli fishing boat, painted the way they are on the Mumbai shore: a blue hull
// with a red band, a raised bow, a mast, a white sail and a red pennant, on a faint wake
const BOAT_SVG = `<svg viewBox="0 0 44 36" width="30" height="25" aria-hidden="true">
  <path d="M5 31 Q14 29.5 22 31 T39 31" fill="none" stroke="#ffffff" stroke-opacity="0.28" stroke-linecap="round"/>
  <path d="M2 21 Q5 22.5 9 23 L35 23 Q39 22.5 42 19.5 L37 28.5 Q22 30.5 8 28.5 Z" fill="#2F7DC4"/>
  <path d="M5.5 24.6 L38.8 24.6" stroke="#E5533F" stroke-width="1.6"/>
  <path d="M21 23 L21 4" stroke="#F4F1EA" stroke-width="1.2"/>
  <path d="M21 6 L33.5 21 L21 21 Z" fill="#F4F1EA" fill-opacity="0.95"/>
  <path d="M21 4 L27 5.6 L21 7.2 Z" fill="#E5533F"/>
</svg>`

// gulls in each flock, small and loose: [x, y, size]
const FLOCK = [
  [0, 0, 1],
  [18, 7, 0.85],
  [-15, 9, 0.9],
  [34, 15, 0.7],
]
const TABS = PLACES.map((c) => ({ value: c.key, label: c.label }))

function Location({ onClose }) {
  const rootRef = useRef(null)
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef(new globalThis.Map())
  const orbitRef = useRef({ paused: true, lastTouch: 0 })
  const drawRef = useRef(0)
  const [ready, setReady] = useState(false)
  const [category, setCategory] = useState(PLACES[0].key)
  const [selected, setSelected] = useState(null)
  const [late, setLate] = useState(false) // the map is slow or offline: show the table anyway
  const panelOn = ready || late

  const current = PLACES.find((c) => c.key === category)
  const selectedPlace = selected && current.places.find((p) => p.id === selected)

  // --- Map setup ---
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return
    const orbit = orbitRef.current
    const markers = markersRef.current

    const map = new MapLibreMap({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: PROJECT,
      zoom: 12.2,
      pitch: 0,
      bearing: 0,
      maxPitch: 78,
      attributionControl: false,
    })
    mapRef.current = map
    // zoom is locked: the guest can turn and tilt the map, but not zoom it
    map.scrollZoom.disable()
    map.doubleClickZoom.disable()
    map.boxZoom.disable()
    map.touchZoomRotate.disable()
    map.keyboard.disable()
    map.addControl(new NavigationControl({ visualizePitch: true, showZoom: false }), 'bottom-right')

    map.on('load', () => {
      applyBrandTheme(map)
      applyDepth(map)
      map.addSource(ALL_SRC, { type: 'geojson', data: EMPTY })
      map.addLayer({ id: 'all-glow', type: 'line', source: ALL_SRC, layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-width': 9, 'line-blur': 6, 'line-opacity': 0.45, 'line-color': ['get', 'color'] } })
      map.addLayer({ id: 'all-line', type: 'line', source: ALL_SRC, layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-width': 2.6, 'line-color': ['get', 'color'] } })
      map.addSource(ROUTE_SRC, { type: 'geojson', data: EMPTY, lineMetrics: true })
      map.addLayer({
        id: 'route-glow',
        type: 'line',
        source: ROUTE_SRC,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-width': 12, 'line-blur': 8, 'line-gradient': routeGradient(0, alpha(ROUTE_DEFAULT, 0.6)) },
      })
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: ROUTE_SRC,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-width': 3.5, 'line-gradient': routeGradient(0, ROUTE_DEFAULT) },
      })
      setReady(true)
      // Arrival: a slow drop from a flat overview into the tilted view.
      map.easeTo({ ...OVERVIEW, duration: REDUCED ? 0 : 4800, easing: (t) => 1 - Math.pow(1 - t, 3) })
      map.once('moveend', () => {
        orbit.paused = REDUCED
      })
    })

    // Any hands-on interaction pauses the slow idle orbit for a few seconds.
    const touch = () => {
      orbit.lastTouch = performance.now()
    }
    for (const ev of ['mousedown', 'touchstart', 'wheel']) map.on(ev, touch)

    let raf = 0
    let prev = performance.now()
    const tick = (now) => {
      const dt = Math.min(now - prev, 64)
      prev = now
      if (!orbit.paused && now - orbit.lastTouch > 4000 && !map.isMoving()) {
        map.setBearing(map.getBearing() + dt * 0.004)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    // Project tower — the elevation render, standing on a bronze footprint.
    // MapLibre owns the marker element's position/transform, so all styling
    // lives on an inner node — otherwise the marker drifts while zooming.
    const tower = document.createElement('div')
    tower.className = 'loc-tower-mk'
    tower.innerHTML = '<div class="loc-tower"><span class="base"></span><img alt="" src="/assets/img/menu_crop.png" draggable="false" /></div>'
    new Marker({ element: tower, anchor: 'bottom', pitchAlignment: 'viewport', rotationAlignment: 'viewport' }).setLngLat(PROJECT).addTo(map)

    // Fishing boats out on the bay, each rocking and drifting on its own rhythm
    const boatTweens = []
    for (const at of BOATS) {
      const el = document.createElement('div')
      el.className = 'loc-boat-mk'
      el.innerHTML = `<div class="loc-boat">${BOAT_SVG}</div>`
      new Marker({ element: el, anchor: 'bottom', pitchAlignment: 'viewport', rotationAlignment: 'viewport' }).setLngLat(at).addTo(map)
      if (REDUCED) continue
      const boat = el.firstChild
      const r = () => gsap.utils.random(0, 2)
      boatTweens.push(
        gsap.fromTo(boat, { rotation: -3 }, { rotation: 3, duration: gsap.utils.random(1.8, 2.6), repeat: -1, yoyo: true, ease: 'sine.inOut', delay: r(), transformOrigin: '50% 85%' }),
        gsap.fromTo(boat, { y: 0 }, { y: -2.5, duration: gsap.utils.random(1.3, 1.9), repeat: -1, yoyo: true, ease: 'sine.inOut', delay: r() }),
        gsap.fromTo(boat, { x: -8 }, { x: 8, duration: gsap.utils.random(7, 11), repeat: -1, yoyo: true, ease: 'sine.inOut', delay: r() }),
      )
    }

    // The section mounts inside the page transition, so the container can still be
    // settling its final size when MapLibre first measures it — keep it in sync.
    const resizeObserver = new ResizeObserver(() => map.resize())
    resizeObserver.observe(mapContainerRef.current)

    return () => {
      cancelAnimationFrame(raf)
      cancelAnimationFrame(drawRef.current)
      boatTweens.forEach((t) => t.kill())
      resizeObserver.disconnect()
      markers.clear()
      map.remove()
      mapRef.current = null
    }
  }, [])

  // --- Pins for the active category ---
  useEffect(() => {
    const map = mapRef.current
    if (!ready || !map) return
    const markers = markersRef.current
    const placed = []
    current.places.forEach((p, i) => {
      const el = document.createElement('div')
      el.className = 'loc-mk'
      el.style.setProperty('--pin', colorOf(category, i))
      const pin = document.createElement('div')
      pin.className = 'loc-pin'
      const label = document.createElement('span')
      label.textContent = p.name
      pin.appendChild(label)
      el.appendChild(pin)
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        setSelected((s) => (s === p.id ? null : p.id))
      })
      placed.push(new Marker({ element: el }).setLngLat(p.at).addTo(map))
      markers.set(p.id, el)
    })
    return () => {
      for (const m of placed) m.remove()
      markers.clear()
    }
  }, [ready, current, category])

  // --- Selection: highlight, fetch the road route, then drive the camera along it ---
  useEffect(() => {
    const map = mapRef.current
    if (!ready || !map) return
    cancelAnimationFrame(drawRef.current)
    for (const [id, el] of markersRef.current) el.classList.toggle('is-on', id === selected)
    const source = map.getSource(ROUTE_SRC)
    source?.setData(EMPTY)
    const selectedIndex = current.places.findIndex((p) => p.id === selected)
    setRouteProgress(map, 0, colorOf(category, selectedIndex))
    if (selectedPlace) map.getSource(ALL_SRC)?.setData(EMPTY)
    if (!selectedPlace) return

    const orbit = orbitRef.current
    orbit.paused = true
    let cancelled = false
    const controller = new AbortController()
    const desktop = window.innerWidth >= 768
    const sideways = window.innerHeight < 520 && window.innerWidth > window.innerHeight
    const padding = sideways
      ? { top: 70, bottom: 50, left: 290, right: 50 }
      : desktop
        ? { top: 120, bottom: 100, left: 440, right: 80 }
        : { top: 100, bottom: Math.round(window.innerHeight * 0.48), left: 40, right: 40 }
    const { at } = selectedPlace

    // Fetch the road route (falls back to an arc offline / rate-limited).
    const timeout = setTimeout(() => controller.abort(), 7000)
    const routed = fetch(`https://router.project-osrm.org/route/v1/driving/${PROJECT.join(',')};${at.join(',')}?overview=full&geometries=geojson`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((json) => {
        const coords = json.routes?.[0]?.geometry?.coordinates
        if (!coords || coords.length < 2) throw new Error('no route')
        return coords
      })
      .catch(() => arcBetween(PROJECT, at))
      .finally(() => clearTimeout(timeout))

    routed.then((coords) => {
      if (cancelled) return
      const cum = [0]
      for (let i = 1; i < coords.length; i++) cum.push(cum[i - 1] + distanceKm(coords[i - 1], coords[i]))
      const total = cum[cum.length - 1] || 0.001
      // The full line goes in once; the draw-on animation only changes a gradient mask.
      source?.setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: coords } })

      // One slow, steady camera move that frames the whole road (no chasing the
      // line round its corners), while the line draws on independently.
      const duration = REDUCED ? 600 : Math.min(8000, Math.max(4500, 3000 + total * 400))
      const xs = coords.map((c) => c[0])
      const ys = coords.map((c) => c[1])
      map.fitBounds(
        [
          [Math.min(...xs), Math.min(...ys)],
          [Math.max(...xs), Math.max(...ys)],
        ],
        {
          padding,
          bearing: bearingDeg(PROJECT, at),
          pitch: 58,
          maxZoom: 15.2,
          duration: duration + 600,
          easing: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
          essential: true,
        },
      )

      const started = performance.now()
      const frame = (now) => {
        if (cancelled) return
        const t = Math.min((now - started) / duration, 1)
        setRouteProgress(map, 0.65 * t + 0.35 * (0.5 - Math.cos(Math.PI * t) / 2), colorOf(category, selectedIndex))
        if (t < 1) drawRef.current = requestAnimationFrame(frame)
      }
      drawRef.current = requestAnimationFrame(frame)
    })

    return () => {
      cancelled = true
      clearTimeout(timeout)
      controller.abort()
      cancelAnimationFrame(drawRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, selected, selectedPlace])

  // Top bar first; the panel arrives once the map has loaded and the camera is settling
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.timeline({ delay: PAGE_IN }).add(fx.fade('.tb-anim, .loc-back', { y: -10 }), 0)
    }, rootRef)
    return () => ctx.revert()
  }, [])

  // Two small flocks of gulls cross the sky now and then: a few quick wingbeats, then a
  // glide, each bird out of step with the next. Decorative only - skipped under reduced motion.
  useLayoutEffect(() => {
    if (REDUCED) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.loc-bird').forEach((bird) => {
        gsap
          .timeline({ repeat: -1, delay: gsap.utils.random(0, 1.5), repeatDelay: gsap.utils.random(0.8, 2) })
          .to(bird, { scaleY: 0.35, transformOrigin: '50% 60%', duration: 0.16, repeat: 5, yoyo: true, ease: 'sine.inOut' })
      })
      gsap.fromTo('.loc-flock--a', { x: '-8vw' }, { x: '108vw', duration: 30, ease: 'none', repeat: -1, repeatDelay: 6, delay: PAGE_IN + 1.2 })
      gsap.fromTo('.loc-flock--b', { x: '108vw' }, { x: '-8vw', duration: 38, ease: 'none', repeat: -1, repeatDelay: 9, delay: PAGE_IN + 12 })
      gsap.to('.loc-flock', { y: -10, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: 1.7 })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setLate(true), 4000)
    return () => clearTimeout(t)
  }, [])

  useLayoutEffect(() => {
    if (!panelOn) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: REDUCED || late ? 0 : 1.4 })
      tl.add(fx.panel('.loc-panel'), 0)
      tl.add(fx.corners('.loc-panel .tr-corner'), 0.3)
      tl.add(fx.fade('.loc-rise', { stagger: 0.07 }), 0.2)
      tl.add(fx.line('.loc-hair'), 0.3)
    }, rootRef)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelOn])

  // rows rise in whenever the category changes
  useLayoutEffect(() => {
    if (!panelOn) return
    const ctx = gsap.context(() => fx.fade('.loc-row', { y: 8, stagger: 0.04, duration: 0.45 }), rootRef)
    return () => ctx.revert()
  }, [category, panelOn])

  const overview = async () => {
    const map = mapRef.current
    if (!map) return
    setSelected(null)
    orbitRef.current.paused = true
    const lines = await Promise.all(current.places.map((pl, i) => fetchRoute(pl).then((coords) => ({ coords, id: pl.id, color: colorOf(category, i) }))))
    if (!mapRef.current || mapRef.current !== map) return
    map.getSource(ROUTE_SRC)?.setData(EMPTY)
    map.getSource(ALL_SRC)?.setData({
      type: 'FeatureCollection',
      features: lines.map((l) => ({ type: 'Feature', properties: { color: l.color }, geometry: { type: 'LineString', coordinates: l.coords } })),
    })
    const pts = [PROJECT, ...lines.flatMap((l) => l.coords)]
    const xs = pts.map((c) => c[0])
    const ys = pts.map((c) => c[1])
    const desktop = window.innerWidth >= 768
    map.fitBounds(
      [
        [Math.min(...xs), Math.min(...ys)],
        [Math.max(...xs), Math.max(...ys)],
      ],
      { padding: desktop ? { top: 110, bottom: 90, left: 440, right: 90 } : { top: 100, bottom: Math.round(window.innerHeight * 0.48), left: 30, right: 30 }, pitch: 45, bearing: 0, duration: REDUCED ? 0 : 2600, essential: true },
    )
  }

  const pickCategory = (key) => {
    setCategory(key)
    setSelected(null)
    mapRef.current?.getSource(ALL_SRC)?.setData(EMPTY)
  }

  return (
    <section ref={rootRef} className="loc-stage relative h-svh w-full overflow-hidden bg-espresso text-cream">
      {/* Map — MapLibre's own CSS forces position:relative on the container it's
          given, overriding an "absolute" utility class via cascade order, so
          the sizing wrapper has to be a separate element. */}
      <div className="absolute inset-0">
        <div ref={mapContainerRef} className="h-full w-full" />
      </div>
      {/* The edges fall away into espresso */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 85% 75% at 60% 55%, transparent 40%, var(--scrim) 100%), linear-gradient(180deg, var(--scrim) 0%, transparent 22%)' }}
      />

      {/* gulls crossing the sky - small, a few at a time */}
      <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden text-cream/75" aria-hidden="true">
        {[
          ['a', '13%', 1],
          ['b', '24%', 0.8],
        ].map(([k, top, s]) => (
          <div key={k} className={`loc-flock loc-flock--${k} absolute left-0`} style={{ top }}>
            {FLOCK.map(([x, y, size], i) => (
              <svg key={i} className="loc-bird absolute" viewBox="0 0 24 10" style={{ left: x * s, top: y * s, width: 12 * size * s }}>
                <path d="M1 6 Q4 2.5 8 4 Q10.5 5 12 7.5 Q13.5 5 16 4 Q20 2.5 23 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ))}
          </div>
        ))}
      </div>

      <TopBar onBrand={onClose}>
        <span className="loc-back">
          <MenuControl onClick={onClose} />
        </span>
      </TopBar>

      {/* Location table */}
      <aside
        className="loc-panel tr-panel absolute inset-x-3 bottom-[max(0.75rem,var(--safe-b))] z-10 flex max-h-[46svh] flex-col p-4 opacity-0 md:inset-x-auto md:bottom-0 md:left-8 md:top-0 md:my-auto md:h-fit md:max-h-[70svh] md:w-[23rem] md:p-6 side:left-[2.9rem] short:inset-x-auto short:bottom-3 short:left-4 short:top-[4.25rem] short:my-0 short:h-auto short:max-h-none short:w-[16rem] short:p-3"
      >
        <span className="loc-rise flex items-center gap-4 short:hidden">
          <span className="tr-num">05</span>
          <span className="tr-dash" />
          <span className="tr-label">Mumbai Central</span>
        </span>
        <h2 className="loc-rise tr-display mt-3 text-[1.6rem] leading-none md:text-[2.1rem] short:mt-0 short:text-[1.15rem]">Location Highlights</h2>
        <i className="loc-hair tr-hair mt-4 short:mt-2" />

        <div className="loc-rise mt-4 hidden md:block short:mt-2">
          <Segmented options={TABS} value={category} onChange={pickCategory} label="Categories" grid={2} className="w-full" />
        </div>
        <div className="loc-rise tr-noscroll -mx-1 mt-3 overflow-x-auto px-1 md:hidden">
          <Segmented options={TABS} value={category} onChange={pickCategory} label="Categories" />
        </div>

        <ul className="loc-list -mx-1.5 mt-3 min-h-0 flex-1 overflow-y-auto px-1.5">
          {current.places.map((p, i) => {
            const on = p.id === selected
            return (
              <li key={p.id} className="loc-row">
                {/* menu-style rows with the golden hover */}
                <button
                  type="button"
                  aria-pressed={on}
                  onPointerMove={glowAt}
                  className={`mn-glow tr-focus group flex w-full touch-manipulation items-center gap-3 rounded-lg border-none bg-transparent px-2.5 py-2.5 text-left font-sans text-[0.75rem] uppercase tracking-[0.14em] transition-colors duration-300 short:py-1 short:text-[0.6875rem] ${on ? 'is-on text-[var(--ribbon-champagne)]' : 'text-cream hover:text-[var(--ribbon-champagne)]'}`}
                  onClick={() => setSelected((s) => (s === p.id ? null : p.id))}
                >
                  <span className="tr-num w-6 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  <span className="min-w-0 flex-1 truncate">{p.name}</span>
                  <span className="shrink-0 tabular-nums tracking-[0.06em] text-[color-mix(in_srgb,var(--ribbon-champagne)_80%,transparent)]">{p.km.toFixed(1)} km</span>
                </button>
              </li>
            )
          })}
        </ul>
      </aside>

      {panelOn && (
        <button
          type="button"
          onClick={overview}
          style={{ borderColor: CATEGORY_COLORS[category] }}
          onPointerMove={glowAt}
          className="tr-btn tr-btn--outline mn-glow absolute right-16 top-28 z-10 md:bottom-8 md:right-[5.75rem] md:top-auto short:bottom-3 short:right-16 short:top-auto"
        >
          Overview
        </button>
      )}
    </section>
  )
}

export default Location
