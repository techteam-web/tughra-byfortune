import { useEffect, useRef } from 'react'
import { Map as MapLibreMap, Marker, NavigationControl } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import BackButton from '../components/BackButton.jsx'

// Mumbai Central railway station — the project's location.
const MUMBAI_CENTRAL = [72.8194, 18.9696]

// Recolors the OpenFreeMap "liberty" style to the site's dark gold theme —
// near-black ground, warm gold roads, cream labels — instead of its default
// bright/white look.
function applyBrandTheme(map) {
  const set = (id, prop, value) => {
    if (!map.getLayer(id)) return
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

  set('background', 'background-color', '#14100f')

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
    set(id, 'fill-color', '#1c1815')
  }
  set('park', 'fill-color', '#1c1f16')
  set('park_outline', 'line-color', '#2a2e1f')

  // Water
  set('water', 'fill-color', '#0c1416')
  for (const id of ['waterway_tunnel', 'waterway_river', 'waterway_other']) {
    set(id, 'line-color', '#16232a')
  }

  // Buildings
  set('building', 'fill-color', '#241f1a')
  set('building-3d', 'fill-extrusion-color', '#241f1a')

  // Roads — copper-gold for major routes, warm bronze for minor ones
  for (const id of ['road_motorway', 'road_trunk_primary', 'bridge_motorway', 'bridge_trunk_primary', 'tunnel_motorway', 'tunnel_trunk_primary']) {
    set(id, 'line-color', '#c17f45')
  }
  for (const id of ['road_secondary_tertiary', 'bridge_secondary_tertiary', 'tunnel_secondary_tertiary']) {
    set(id, 'line-color', '#8c5a34')
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
    set(id, 'line-color', '#463527')
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
    set(id, 'line-color', '#0f0d0c')
  }
  for (const id of [
    'road_major_rail',
    'road_transit_rail',
    'bridge_major_rail',
    'bridge_transit_rail',
    'tunnel_major_rail',
    'tunnel_transit_rail',
  ]) {
    set(id, 'line-color', '#6b4f3a')
  }

  // Boundaries
  for (const id of ['boundary_2', 'boundary_3', 'boundary_disputed']) {
    set(id, 'line-color', '#5a4530')
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
    set(id, 'text-color', '#f3ecd9')
    set(id, 'text-halo-color', '#0f0d0c')
  }
}

function Location({ onClose }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = new MapLibreMap({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: MUMBAI_CENTRAL,
      zoom: 14.5,
      attributionControl: false,
    })
    mapRef.current = map

    map.on('load', () => applyBrandTheme(map))
    map.addControl(new NavigationControl({ showCompass: false }), 'bottom-right')

    const marker = document.createElement('div')
    marker.style.width = '1.125rem'
    marker.style.height = '1.125rem'
    marker.style.borderRadius = '50%'
    marker.style.background = '#c17f45'
    marker.style.boxShadow = '0 0 0 0.375rem rgba(193,127,69,0.25), 0 0 1.25rem rgba(193,127,69,0.6)'
    marker.style.border = '0.125rem solid #f3ecd9'

    new Marker({ element: marker }).setLngLat(MUMBAI_CENTRAL).addTo(map)

    // The section mounts inside an animated transition (Framer Motion), so
    // the container can still be settling its final size when MapLibre first
    // measures it — keep it in sync as the layout stabilizes.
    const resizeObserver = new ResizeObserver(() => map.resize())
    resizeObserver.observe(mapContainerRef.current)

    return () => {
      resizeObserver.disconnect()
      map.remove()
      mapRef.current = null
    }
  }, [])

  return (
    <section className="relative h-svh w-full overflow-hidden bg-bg text-cream">
      {/* Map — MapLibre's own CSS forces position:relative on the container it's
          given, overriding an "absolute" utility class via cascade order, so
          the sizing wrapper has to be a separate element. */}
      <div className="absolute inset-0">
        <div ref={mapContainerRef} className="h-full w-full" />
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,9,8,0.75) 0%, rgba(10,9,8,0.1) 20%, rgba(10,9,8,0.15) 80%, rgba(10,9,8,0.65) 100%), ' +
            'linear-gradient(90deg, rgba(10,9,8,0.9) 0%, rgba(10,9,8,0.65) 32%, rgba(10,9,8,0.15) 55%, rgba(10,9,8,0) 75%)',
        }}
      />

      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-6 md:px-12 md:py-10">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center border-none bg-transparent p-0 text-left"
        >
          <span>
            <strong className="block font-serif text-2xl tracking-[0.375rem] text-cream">TUGHRA</strong>
            <span className="mt-1.5 block text-[0.625rem] tracking-[0.1875rem] text-muted">MUMBAI CENTRAL</span>
          </span>
        </button>
        <BackButton onClick={onClose} />
      </div>

      {/* Left copy — on mobile the horizontal darkening gradient above doesn't
          leave enough opaque width for a 20rem text block, so it gets a solid
          backdrop panel there instead; desktop relies on the gradient alone. */}
      <div className="pointer-events-none absolute inset-x-6 bottom-24 z-10 max-w-[20rem] rounded-2xl bg-black/55 p-5 backdrop-blur-md md:inset-x-auto md:bottom-auto md:left-12 md:top-1/2 md:max-w-[20rem] md:-translate-y-1/2 md:rounded-none md:bg-transparent md:p-0 md:backdrop-blur-none">
        <span className="mb-5 block h-px w-12 bg-gold/50" />
        <h2 className="font-serif text-[clamp(2rem,4.8vw,3.5rem)] font-light leading-[1.15] text-cream">
          At The Centre
          <br />
          Of It All
        </h2>
        <p className="mt-5 max-w-[20rem] font-serif text-[0.9375rem] leading-relaxed text-muted md:text-[1.0625rem]">
          Mumbai Central — moments from the sea, the city, and everywhere you need to be.
        </p>
      </div>
    </section>
  )
}

export default Location
