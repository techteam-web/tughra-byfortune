import BrandMark from '../components/BrandMark.jsx'
import { useEffect, useRef, useState } from 'react'
import { Map as MapLibreMap, Marker, NavigationControl, setWorkerUrl } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import BackButton from '../components/BackButton.jsx'
import { PROJECT, PLACES, bearingDeg, arcBetween, distanceKm } from './locationData.js'
import SkyFx from './SkyFx.jsx'
import './Location.css'

// In production the worker is shipped by the maplibreWorker plugin in vite.config.js
// (dev serves it straight from node_modules, so no override is needed there).
if (import.meta.env.PROD) setWorkerUrl(`${import.meta.env.BASE_URL}maplibre/maplibre-gl-worker.mjs`)

// Recolors the OpenFreeMap "liberty" style to the site's dark gold theme —
// near-black ground, warm gold roads, cream labels — instead of its default
// bright/white look.
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

  set('background', 'background-color', '#1d0711')

  // Ground cover
  for (const id of [
    'landuse_residential',
    'landcover_wood',
    'landcover_grass',
    'landcover_ice',
    'landcover_wetland',
    'landcover_sand',
    'landuse_pitch',
    'landuse_track',
    'landuse_cemetery',
    'landuse_hospital',
    'landuse_school',
    'aeroway_fill',
  ]) {
    set(id, 'fill-color', '#2a0b18')
  }
  set('park', 'fill-color', '#2b0f1a')
  set('park_outline', 'line-color', '#3a1624')

  // Water
  set('water', 'fill-color', '#12050b')
  for (const id of ['waterway_tunnel', 'waterway_river', 'waterway_other']) {
    set(id, 'line-color', '#2a0f1c')
  }

  // Buildings
  set('building', 'fill-color', '#4a1a2a')

  // Roads — copper-gold for major routes, warm bronze for minor ones
  for (const id of ['road_motorway', 'road_trunk_primary', 'bridge_motorway', 'bridge_trunk_primary', 'tunnel_motorway', 'tunnel_trunk_primary']) {
    set(id, 'line-color', '#e0a85a')
  }
  for (const id of ['road_secondary_tertiary', 'bridge_secondary_tertiary', 'tunnel_secondary_tertiary']) {
    set(id, 'line-color', '#a0723f')
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
    set(id, 'line-color', '#6a2f3a')
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
    set(id, 'line-color', '#1d0711')
  }
  for (const id of [
    'road_major_rail',
    'road_transit_rail',
    'bridge_major_rail',
    'bridge_transit_rail',
    'tunnel_major_rail',
    'tunnel_transit_rail',
  ]) {
    set(id, 'line-color', '#8a5a48')
  }

  // Layers the base style draws in white / light grey / yellow that would
  // otherwise show up as stray bright lines once zoomed in.
  set('building', 'fill-outline-color', 'rgba(0,0,0,0)')
  set('park', 'fill-outline-color', 'rgba(0,0,0,0)')
  set('landuse_pitch', 'fill-color', '#2a0b18')
  set('landuse_track', 'fill-color', '#2a0b18')
  set('aeroway_fill', 'fill-opacity', 0.3)
  for (const id of ['tunnel_service_track', 'bridge_service_track', 'tunnel_minor']) {
    set(id, 'line-color', '#6a2f3a')
  }
  for (const id of ['road_motorway_link', 'bridge_motorway_link', 'tunnel_motorway_link']) {
    set(id, 'line-color', '#a0723f')
  }
  for (const id of [
    'road_motorway_link_casing',
    'tunnel_motorway_link_casing',
    'tunnel_link_casing',
    'tunnel_service_track_casing',
    'bridge_street_casing',
    'bridge_path_pedestrian_casing',
  ]) {
    set(id, 'line-color', '#1d0711')
  }

  // Boundaries
  for (const id of ['boundary_2', 'boundary_3', 'boundary_disputed']) {
    set(id, 'line-color', '#7a4a3a')
  }

  // Labels — cream text, dark halo
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
    set(id, 'text-color', '#f9e4d4')
    set(id, 'text-halo-color', '#1d0711')
  }

  // Safety net: anything the lists above missed that is still light (white road
  // casings, pale outlines, ...) is pulled into the palette, so no stray bright
  // lines appear at any zoom.
  const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  const isLight = (css) => {
    if (typeof css !== 'string' || !probe) return false
    probe.clearRect(0, 0, 1, 1)
    probe.fillStyle = '#000'
    probe.fillStyle = css
    probe.fillRect(0, 0, 1, 1)
    const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data
    return a > 20 && 0.299 * r + 0.587 * g + 0.114 * b > 120
  }
  for (const layer of map.getStyle().layers) {
    const { id, type } = layer
    if (type === 'line' && !touched.has(id + 'line-color') && isLight(map.getPaintProperty(id, 'line-color'))) {
      set(id, 'line-color', '#6a2f3a')
    }
    if (type === 'fill') {
      if (!touched.has(id + 'fill-color') && isLight(map.getPaintProperty(id, 'fill-color'))) set(id, 'fill-color', '#2a0b18')
      if (!touched.has(id + 'fill-outline-color')) set(id, 'fill-outline-color', 'rgba(0,0,0,0)')
    }
  }
}

// Everything the "3D" feel needs beyond colors: taller, height-graded
// buildings, a hazy wine horizon, and an atmospheric sky.
function applyDepth(map) {
  if (map.getLayer('building-3d')) {
    map.setPaintProperty('building-3d', 'fill-extrusion-color', [
      'interpolate',
      ['linear'],
      ['get', 'render_height'],
      0, '#3a1422',
      40, '#5a2230',
      120, '#9a6240',
      300, '#e0a85a',
    ])
    map.setPaintProperty('building-3d', 'fill-extrusion-opacity', 0.92)
    map.setLayerZoomRange('building-3d', 13, 24)
  }
  try {
    map.setSky({
      'sky-color': '#12050b',
      'horizon-color': '#6b2a35',
      'fog-color': '#2a0b18',
      'sky-horizon-blend': 0.7,
      'horizon-fog-blend': 0.8,
      'fog-ground-blend': 0.85,
    })
  } catch {
    // Style spec without sky support — the plain dark backdrop is fine.
  }
}

const ROUTE_SRC = 'route'
// The route is revealed by masking a line-gradient (cheap) rather than re-sending
// the geometry every frame (which re-parses and re-tiles it).
function routeGradient(p, color) {
  const edge = Math.min(Math.max(p, 0.0001), 0.9999)
  return ['interpolate', ['linear'], ['line-progress'], 0, color, edge, color, Math.min(edge + 0.0001, 1), 'rgba(255,246,230,0)', 1, 'rgba(255,246,230,0)']
}
function setRouteProgress(map, p) {
  if (!map.getLayer('route-line')) return
  map.setPaintProperty('route-glow', 'line-gradient', routeGradient(p, 'rgba(255,190,90,0.7)'))
  map.setPaintProperty('route-line', 'line-gradient', routeGradient(p, '#fff6e6'))
}
const EMPTY = { type: 'FeatureCollection', features: [] }
// Koli fishing boats keep to open water: lanes in the Arabian Sea off the
// western shore and one in Mumbai Harbour. Each sails its lane and back.
// Painted-hull colours vary per boat, as the real ones do.
const BOATS = [
  { path: [[72.783, 18.925], [72.787, 19.012]], period: 130000, phase: 0, hull: '#33506b', stripe: '#b9a169', roof: '#4a3226' },
  { path: [[72.774, 18.99], [72.788, 18.948]], period: 105000, phase: 0.4, hull: '#7a3d36', stripe: '#cfc6b6', roof: '#2f4156' },
  { path: [[72.778, 18.935], [72.781, 18.985]], period: 120000, phase: 0.75, hull: '#b9b2a4', stripe: '#3f6b5a', roof: '#6a4a2e' },
  { path: [[72.855, 18.915], [72.872, 18.975]], period: 115000, phase: 0.2, hull: '#a98a45', stripe: '#2f4a73', roof: '#cfc6b6' },
]

// Side view, bow to the right: a weathered wooden hull with a faded stripe,
// a small wheelhouse, a mast with a single stay, and a lantern.
function boatSvg({ hull, stripe, roof }) {
  return `<svg viewBox="0 0 60 40" aria-hidden="true">
    <path d="M41 3 L41 21" stroke="#2a2018" stroke-width="1.2"/>
    <path d="M41 4 L58 18" stroke="#2a2018" stroke-width="0.5"/>
    <circle cx="41" cy="3.6" r="1" fill="#f2c26b"/>
    <rect x="23" y="12" width="13" height="9" rx="0.8" fill="#cfc6b6"/>
    <rect x="21.5" y="10.2" width="16" height="2.4" rx="0.5" fill="${roof}"/>
    <rect x="25" y="14.4" width="3" height="3" fill="#1d2630"/>
    <rect x="30" y="14.4" width="3" height="3" fill="#1d2630"/>
    <path d="M2 20 L55 20 Q60 13 58.5 9 Q57 14.5 53.5 18 L58 22 Q54 32 44 34 L13 34 Q5 32 2 20 Z" fill="${hull}"/>
    <path d="M4.4 25 L56 25 L54.6 27.6 L6.4 27.6 Z" fill="${stripe}" opacity="0.85"/>
    <path d="M2 20 L55 20" stroke="#17110c" stroke-width="1"/>
    <path d="M13 34 Q30 36 44 34" stroke="#17110c" stroke-width="0.8" fill="none"/>
  </svg>`
}

const OVERVIEW = { center: PROJECT, zoom: 15.2, pitch: 64, bearing: -25 }

function Location({ onClose }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef(new globalThis.Map())
  const orbitRef = useRef({ paused: true, lastTouch: 0 })
  const drawRef = useRef(0)
  const [ready, setReady] = useState(false)
  const [category, setCategory] = useState(PLACES[0].key)
  const [selected, setSelected] = useState(null)

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
    map.addControl(new NavigationControl({ visualizePitch: true }), 'bottom-right')

    map.on('load', () => {
      applyBrandTheme(map)
      applyDepth(map)
      map.addSource(ROUTE_SRC, { type: 'geojson', data: EMPTY, lineMetrics: true })
      map.addLayer({
        id: 'route-glow',
        type: 'line',
        source: ROUTE_SRC,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-width': 14, 'line-blur': 9, 'line-gradient': routeGradient(0, 'rgba(255,190,90,0.7)') },
      })
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: ROUTE_SRC,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-width': 4.5, 'line-gradient': routeGradient(0, '#fff6e6') },
      })
      setReady(true)
      // Cinematic arrival: drop from a flat overview into the tilted view.
      map.easeTo({ ...OVERVIEW, duration: 4800, easing: (t) => 1 - Math.pow(1 - t, 3) })
      map.once('moveend', () => {
        orbit.paused = false
      })
    })

    // Any hands-on interaction pauses the slow idle orbit for a few seconds.
    const touch = () => {
      orbit.lastTouch = performance.now()
    }
    for (const ev of ['mousedown', 'touchstart', 'wheel']) map.on(ev, touch)

    // Boats — HTML markers (styled on an inner node) sailing back and forth.
    const boats = BOATS.map((b) => {
      const el = document.createElement('div')
      el.className = 'loc-boat-mk'
      const inner = document.createElement('div')
      inner.className = 'loc-boat'
      inner.innerHTML = boatSvg(b)
      el.appendChild(inner)
      return { ...b, inner, marker: new Marker({ element: el }).setLngLat(b.path[0]).addTo(map) }
    })

    let raf = 0
    let prev = performance.now()
    const tick = (now) => {
      const dt = Math.min(now - prev, 64)
      prev = now
      if (!orbit.paused && now - orbit.lastTouch > 4000 && !map.isMoving()) {
        map.setBearing(map.getBearing() + dt * 0.004)
      }
      for (const b of boats) {
        const u = ((now / b.period + b.phase) % 1) * 2
        const f = u < 1 ? u : 2 - u
        const [a, z] = b.path
        b.marker.setLngLat([a[0] + (z[0] - a[0]) * f, a[1] + (z[1] - a[1]) * f])
        b.inner.classList.toggle('flip', u >= 1)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    // Project tower — the floor-plan render, standing on a pulsing footprint.
    // MapLibre owns the marker element's position/transform, so all styling
    // lives on an inner node — otherwise the marker drifts while zooming.
    const tower = document.createElement('div')
    tower.className = 'loc-tower-mk'
    tower.innerHTML = '<div class="loc-tower"><span class="base"></span><img alt="" src="/assets/img/menu_crop.png" draggable="false" /></div>'
    new Marker({ element: tower, anchor: 'bottom' }).setLngLat(PROJECT).addTo(map)

    // The section mounts inside an animated transition (Framer Motion), so
    // the container can still be settling its final size when MapLibre first
    // measures it — keep it in sync as the layout stabilizes.
    const resizeObserver = new ResizeObserver(() => map.resize())
    resizeObserver.observe(mapContainerRef.current)

    return () => {
      cancelAnimationFrame(raf)
      cancelAnimationFrame(drawRef.current)
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
    for (const p of current.places) {
      const el = document.createElement('div')
      el.className = 'loc-mk'
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
    }
    return () => {
      for (const m of placed) m.remove()
      markers.clear()
    }
  }, [ready, current])

  // --- Selection: highlight, fetch the road route, then drive the camera along it ---
  useEffect(() => {
    const map = mapRef.current
    if (!ready || !map) return
    cancelAnimationFrame(drawRef.current)
    for (const [id, el] of markersRef.current) el.classList.toggle('is-on', id === selected)
    const source = map.getSource(ROUTE_SRC)
    source?.setData(EMPTY)
    setRouteProgress(map, 0)
    if (!selectedPlace) return

    const orbit = orbitRef.current
    orbit.paused = true
    let cancelled = false
    const controller = new AbortController()
    const desktop = window.innerWidth >= 768
    const padding = desktop
      ? { top: 120, bottom: 100, left: 420, right: 80 }
      : { top: 100, bottom: Math.round(window.innerHeight * 0.48), left: 40, right: 40 }
    const { at } = selectedPlace

    // Fetch the road route (falls back to an arc offline / rate-limited).
    const timeout = setTimeout(() => controller.abort(), 7000)
    const routed = fetch(
      `https://router.project-osrm.org/route/v1/driving/${PROJECT.join(',')};${at.join(',')}?overview=full&geometries=geojson`,
      { signal: controller.signal },
    )
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
      const duration = Math.min(8000, Math.max(4500, 3000 + total * 400))
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
        setRouteProgress(map, 0.65 * t + 0.35 * (0.5 - Math.cos(Math.PI * t) / 2))
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
  }, [ready, selected, selectedPlace])

  const overview = () => {
    const map = mapRef.current
    if (!map) return
    setSelected(null)
    orbitRef.current.paused = true
    map.easeTo({ ...OVERVIEW, duration: 2200 })
    map.once('moveend', () => {
      orbitRef.current.paused = false
    })
  }

  return (
    <section className={`loc-stage relative h-svh w-full overflow-hidden bg-bg text-cream ${ready ? 'is-open' : ''}`}>
      {/* Map — MapLibre's own CSS forces position:relative on the container it's
          given, overriding an "absolute" utility class via cascade order, so
          the sizing wrapper has to be a separate element. */}
      <div className="absolute inset-0">
        <div ref={mapContainerRef} className="h-full w-full" />
      </div>
      {/* Wine vignette + depth haze so the edges fall away into the theme. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 85% 75% at 60% 55%, rgba(29,7,17,0) 40%, rgba(29,7,17,0.78) 100%), linear-gradient(180deg, rgba(71,13,33,0.35) 0%, rgba(71,13,33,0) 22%)',
        }}
      />

      <SkyFx open={ready} />

      {/* Top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-6 md:px-12 md:py-10">
        <button type="button" onClick={onClose} className="pointer-events-auto flex items-center border-none bg-transparent p-0 text-left">
          <BrandMark />
        </button>
        <div className="pointer-events-auto">
          <BackButton onClick={onClose} />
        </div>
      </div>

      {/* Location table */}
      <aside className="loc-panel absolute inset-x-4 bottom-4 z-10 flex max-h-[44svh] flex-col rounded-2xl p-4 md:inset-x-auto md:bottom-auto md:left-12 md:top-1/2 md:max-h-[72svh] md:w-[22rem] md:-translate-y-1/2 md:p-6">
        <h2 className="font-serif text-[1.5rem] font-light uppercase leading-none tracking-[0.04em] text-cream md:text-[1.75rem]">
          Location Highlights
        </h2>
        <span className="mt-3 block h-px w-10 bg-gold/60" />
        <div className="mt-4 flex gap-x-4 gap-y-1 overflow-x-auto md:flex-wrap md:overflow-visible">
          {PLACES.map((c) => (
            <button
              key={c.key}
              type="button"
              className={`loc-tab ${c.key === category ? 'is-on' : ''}`}
              onClick={() => {
                setCategory(c.key)
                setSelected(null)
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="loc-list mt-3 min-h-0 flex-1 overflow-y-auto">
          {current.places.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`loc-row ${p.id === selected ? 'is-on' : ''}`}
              onClick={() => setSelected((s) => (s === p.id ? null : p.id))}
            >
              <span>{p.name}</span>
              <span className="km">{p.km.toFixed(1)} km</span>
            </button>
          ))}
        </div>
      </aside>

      {selected && (
        <button
          type="button"
          onClick={overview}
          className="lux-btn absolute right-16 top-24 z-10 rounded-full px-5 py-2.5 text-[0.625rem] uppercase tracking-[0.25rem] md:bottom-6 md:top-auto md:py-3"
        >
          Overview
        </button>
      )}
    </section>
  )
}

export default Location
