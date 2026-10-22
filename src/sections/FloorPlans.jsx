import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gsap, fx, EASE, PAGE_IN, REDUCED } from '../motion/index.js'
import { glowAt } from '../ui/glow.js'
import { Lockup, MenuControl } from '../ui/controls.jsx'
import IsoTurntable from '../components/IsoTurntable.jsx'
import { IcBack, IcLayers as IcPlan } from '../ui/icons.jsx'
import { UNITS } from '../components/floorUnits.js'

// Floors that are shown on the tower but cannot be opened.
const LOCKED_FLOORS = new Set(['_8th', '_9th'])
const DEFAULT_FLOOR = '_17th'

const TOWER_IMG = '/assets/menu.png'
const BUILDING_SVG_URL = '/assets/svg/Building.svg'

// Native size of TOWER_IMG - Building.svg's shapes are traced against this
// exact coordinate space, so the overlay <svg> shares the same viewBox.
const CANVAS = { width: 1672, height: 941 }

// The tower render sits inside a much wider, mostly-empty canvas. This crop
// window (in canvas pixels) frames just the building, and drives the
// percentage-based oversized-inner-box trick below so the image and the
// clickable overlay stay pixel-aligned at any display size.
const CROP = { x: 750, y: 150, width: 500, height: 790 }

const idToNum = (id) => {
  if (id === 'terrase') return 'T'
  if (id === 'Ground') return 'G'
  const clean = id.replace(/^_/, '')
  const digits = clean.match(/^\d+/)?.[0]
  return digits ? digits.padStart(2, '0') : clean
}

const idToLabel = (id) => {
  if (id === 'terrase') return 'Terrace'
  if (id === 'Ground') return 'Ground Floor'
  return `${id.replace(/^_/, '')} Floor`
}

// The reference's paper sidebar and layout table, with the tower in the middle. Clicking
// a floor on the tower opens the plan page: a big plan, a small residence list on its
// left, and the floor plan / isometric switch underneath - all on the same beige ground.
function FloorPlans({ onClose }) {
  const [floors, setFloors] = useState([])
  const [selectedFloor, setSelectedFloor] = useState(null)
  const [hoveredFloor, setHoveredFloor] = useState(null)
  const [unitId, setUnitId] = useState(UNITS.find((u) => u.iso)?.id ?? UNITS[0].id)
  const [planView, setPlanView] = useState('2d') // '2d' (floor plan) or 'iso' (isometric)
  const [zoomOpen, setZoomOpen] = useState(false)
  const rootRef = useRef(null)
  const zoomRef = useRef(null)
  const unit = UNITS.find((u) => u.id === unitId)
  const activeSrc = unit[planView === '2d' ? 'plan2d' : 'iso']
  const planLabel = planView === '2d' ? 'floor plan' : 'isometric plan'

  // Load Building.svg itself and measure each floor shape's real bounding
  // box, rather than keeping a hand-copied duplicate of its path data - any
  // future edit to the file is picked up automatically.
  useEffect(() => {
    let cancelled = false

    fetch(BUILDING_SVG_URL)
      .then((res) => res.text())
      .then((svgText) => {
        if (cancelled) return
        const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml')
        const shapeEls = [...doc.querySelectorAll('path, polygon')]

        const measureSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        measureSvg.setAttribute('style', 'position:absolute; width:0; height:0; overflow:hidden')
        document.body.appendChild(measureSvg)

        const parsed = shapeEls.map((el) => {
          const clone = el.cloneNode()
          measureSvg.appendChild(clone)
          const b = clone.getBBox()
          const id = el.id
          return {
            id,
            type: el.tagName.toLowerCase(),
            d: el.getAttribute('d'),
            points: el.getAttribute('points'),
            num: idToNum(id),
            label: idToLabel(id),
            y0: b.y,
            y1: b.y + b.height,
          }
        })

        document.body.removeChild(measureSvg)
        if (cancelled) return

        setFloors(parsed)
        setSelectedFloor((cur) => cur || (parsed.some((f) => f.id === DEFAULT_FLOOR) ? DEFAULT_FLOOR : parsed.find((f) => !LOCKED_FLOORS.has(f.id))?.id))
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  // Entrance
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: PAGE_IN })
      tl.add(fx.fade('.fp2-top', { y: -10 }), 0)
      tl.add(fx.fade('.fp2-aside-l > *', { y: 10, stagger: 0.07 }), 0.15)
      tl.add(fx.show('.fp2-stage', { duration: 1 }), 0.25)
      tl.add(fx.fade('.fp2-aside-r > *', { y: 10, stagger: 0.07 }), 0.4)
      tl.add(fx.fade('.fp2-foot', { y: 10 }), 0.6)
    }, rootRef)
    return () => ctx.revert()
  }, [])

  // Unit or tab changed: the plan and the table cross-fade in place
  useLayoutEffect(() => {
    // direct children only: the turntable owns the opacity of its own stacked frames
    gsap.fromTo('.fp2-big > img', { opacity: 0 }, { opacity: 1, duration: REDUCED ? 0.2 : 0.6, ease: EASE.move, overwrite: 'auto' })
    gsap.fromTo('.fp2-swap', { opacity: 0.2, y: 3 }, { opacity: 1, y: 0, duration: REDUCED ? 0.2 : 0.45, ease: EASE.soft, stagger: 0.02, overwrite: 'auto' })
  }, [unitId, planView])

  const openFloor = (id) => {
    setSelectedFloor(id)
    setPlanView('2d')
    setZoomOpen(true)
  }

  const closeZoom = () => gsap.to(zoomRef.current, { autoAlpha: 0, duration: REDUCED ? 0.1 : 0.4, ease: EASE.soft, onComplete: () => setZoomOpen(false) })

  useEffect(() => {
    if (!zoomOpen) return
    const onKey = (e) => e.key === 'Escape' && closeZoom()
    window.addEventListener('keydown', onKey)
    gsap.fromTo(zoomRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: REDUCED ? 0.15 : 0.5, ease: EASE.soft })
    gsap.fromTo(zoomRef.current.querySelector('.fp2-big'), { opacity: 0, scale: 0.985 }, { opacity: 1, scale: 1, duration: REDUCED ? 0.15 : 0.7, ease: EASE.soft, delay: 0.1 })
    return () => window.removeEventListener('keydown', onKey)
  }, [zoomOpen])

  const floorName = floors.find((f) => f.id === selectedFloor)?.label

  // The room-by-room layout table. Room count follows the bedroom count; sizes
  // read "To be confirmed" until real dimensions are supplied - no numbers invented.
  const roomRows = [
    { label: 'Drawing room' },
    { label: 'Dining' },
    { label: 'Kitchen' },
    ...Array.from({ length: unit.bedrooms }, (_, i) => ({ label: `Bedroom ${String(i + 1).padStart(2, '0')}` })),
    { label: 'Balcony' },
  ]
  const specRows = [{ label: 'Carpet area', value: unit.carpetArea }, ...roomRows.map((r) => ({ ...r, value: null }))]

  // The inner box is oversized relative to the cropped wrapper so that, once
  // clipped by overflow:hidden, only the CROP window is visible - and since
  // both the image and the svg fill this same oversized box, they always
  // stay pixel-aligned regardless of how large the wrapper renders.
  const innerStyle = {
    position: 'absolute',
    width: `${(CANVAS.width / CROP.width) * 100}%`,
    height: `${(CANVAS.height / CROP.height) * 100}%`,
    left: `${-(CROP.x / CROP.width) * 100}%`,
    top: `${-(CROP.y / CROP.height) * 100}%`,
  }

  return (
    <section ref={rootRef} className="relative isolate flex h-svh w-full flex-col overflow-hidden bg-[var(--cream)] text-[var(--ink)]">
      {/* ---------- Top: the logo on the left (back to the menu, as on every page) ---------- */}
      <header className="fp2-top flex items-center justify-between px-5 pt-[max(1.25rem,var(--safe-t))] sm:px-8 side:px-[2.9rem] side:pt-[2.7rem] short:px-5 short:pt-3">
        <button type="button" onClick={onClose} aria-label="Back to menu" className="tr-focus shrink-0 border-none bg-transparent p-0 text-left">
          <Lockup dark />
        </button>
        <MenuControl onClick={onClose} />
      </header>

      {/* ---------- Body: text sidebar, the tower/plan, the layout table ---------- */}
      {/* stacked on small screens with the tower holding the middle row, three columns from lg */}
      <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)_auto] gap-4 overflow-hidden px-5 pb-16 pt-4 sm:px-10 lg:grid-cols-[15rem_minmax(0,1fr)_14rem] lg:grid-rows-none lg:items-stretch lg:gap-10 xl:grid-cols-[17rem_minmax(0,1fr)_15rem]">
        {/* ---------- Left: what this is, and the unit types ---------- */}
        <aside className="fp2-aside-l min-h-0 lg:self-center">
          <span className="block font-sans text-[0.7rem] uppercase tracking-[0.24em] text-[var(--bronze-deep)]">Residences</span>
          <h1 className="mt-2 font-serif text-[1.75rem] leading-[1.05] sm:text-[2.1rem] lg:mt-4 lg:text-[clamp(2.2rem,3.2vw,2.9rem)]" style={{ color: 'var(--ink)' }}>
            Homes
            <br />
            Designed
            <br />
            to Inspire
          </h1>
          {/* the line of copy gives way to the tower on small screens */}
          <p className="mt-5 hidden max-w-[18rem] font-sans text-[0.85rem] leading-relaxed text-[var(--ink-soft)] lg:block">4, 5 &amp; 6 BHK residences, each with panoramic views over the city skyline and the sea.</p>
          <ul className="mt-4 flex flex-row flex-wrap gap-x-6 gap-y-2 lg:mt-9 lg:flex-col lg:gap-5">
            {UNITS.map((u, i) => {
              const on = u.id === unitId
              return (
                <li key={u.id} className="relative pl-4">
                  {on && <span className="absolute left-0 top-[0.15em] h-[1.1em] w-[2px] bg-[var(--bronze-deep)]" aria-hidden="true" />}
                  <button
                    type="button"
                    onClick={() => setUnitId(u.id)}
                    onPointerMove={glowAt}
                    aria-pressed={on}
                    className="mn-glow tr-focus flex touch-manipulation items-baseline gap-3 rounded-md border-none bg-transparent p-0 text-left"
                  >
                    <span className="font-sans text-[0.65rem] tabular-nums tracking-[0.1em] text-[var(--ink-soft)]">{String(i + 1).padStart(2, '0')}</span>
                    <span className={`font-serif text-[1.15rem] leading-none transition-colors duration-300 ${on ? 'text-[var(--ink)]' : 'text-[var(--ink-soft)]'}`}>{u.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>

        {/* ---------- Middle: the tower, its floors as switches that open the plan page ---------- */}
        <div className="fp2-stage flex min-h-0 min-w-0 flex-col items-center justify-center">
          {/* the tower takes whatever height the row leaves it, so the page never scrolls */}
          <div className="relative flex h-full max-h-full w-full items-center justify-center">
            {/* ---- the tower on a wide parchment mat, its floors as clickable switches ---- */}
            <div className="absolute inset-0 overflow-hidden border border-[var(--bronze)]/25 bg-[var(--parchment)] p-3 shadow-[0_1.75rem_3.5rem_-1.75rem_rgba(42,28,18,0.35)]">
              <div className="flex h-full w-full items-center justify-center overflow-hidden">
                <div className="relative h-full select-none overflow-hidden" style={{ aspectRatio: `${CROP.width} / ${CROP.height}` }}>
                  <div style={innerStyle}>
                    <img src={TOWER_IMG} alt="Tughra tower elevation" className="pointer-events-none absolute inset-0 h-full w-full select-none" draggable={false} />
                    <svg viewBox={`0 0 ${CANVAS.width} ${CANVAS.height}`} className="absolute inset-0 h-full w-full">
                      {floors.map((floor) => {
                        const isHovered = hoveredFloor === floor.id
                        const isSelected = selectedFloor === floor.id
                        const shapeProps = LOCKED_FLOORS.has(floor.id)
                          ? { style: { pointerEvents: 'none', fill: 'transparent' } }
                          : {
                              onClick: () => openFloor(floor.id),
                              onMouseEnter: () => setHoveredFloor(floor.id),
                              onMouseLeave: () => setHoveredFloor(null),
                              // every floor reads as a faintly darkened band with a fine pale line
                              // between floors; the one under the cursor and the chosen one warm to bronze
                              style: {
                                cursor: 'pointer',
                                pointerEvents: 'all',
                                transition: 'fill-opacity 0.3s ease, fill 0.3s ease',
                                fill: isSelected || isHovered ? 'var(--bronze-deep)' : 'var(--espresso)',
                                fillOpacity: isSelected ? 0.6 : isHovered ? 0.45 : 0.2,
                                stroke: 'var(--cream)',
                                strokeOpacity: 0.45,
                                strokeWidth: 1,
                                vectorEffect: 'non-scaling-stroke',
                              },
                            }
                        return floor.type === 'path' ? <path key={floor.id} d={floor.d} {...shapeProps} /> : <polygon key={floor.id} points={floor.points} {...shapeProps} />
                      })}
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Right: the layout, kept small and held in its own card ---------- */}
        <aside className="fp2-aside-r min-h-0 min-w-0 lg:self-center">
          <div className="rounded-lg border border-[var(--bronze)]/25 bg-[color-mix(in_srgb,var(--parchment)_55%,transparent)] px-4 py-3.5">
            <h2 className="fp2-swap font-serif text-[0.95rem] leading-none text-[var(--ink)]">{unit.label} Flat Layout</h2>
            <span className="mt-3 block h-px w-full bg-[var(--ink)]/12" aria-hidden="true" />
            <dl className="divide-y divide-[var(--ink)]/8">
              {specRows.map(({ label, value }) => (
                <div key={label} className="flex items-baseline justify-between gap-3 py-[0.42rem]">
                  <dt className="font-sans text-[0.68rem] uppercase tracking-[0.06em] text-[var(--ink-soft)]">{label}</dt>
                  <dd className={`fp2-swap shrink-0 font-sans text-[0.68rem] ${value ? 'text-[var(--ink)]' : 'text-[var(--ink-soft)]/60'}`}>{value ?? 'TBC'}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>

      {/* ---------- Foot: where this sits ---------- */}
      <div className="fp2-foot absolute inset-x-0 bottom-0 z-10 flex items-center px-5 pb-[max(1.5rem,var(--safe-b))] sm:px-10">
        <span className="flex items-center gap-3 font-sans text-[0.7rem] uppercase tracking-[0.2em] text-[var(--ink-soft)]">
          <span className="tabular-nums text-[var(--ink)]">04</span>
          <span className="h-px w-6 bg-[var(--ink)]/25" aria-hidden="true" />
          <span className="tabular-nums">07</span>
          <span className="ml-1">Residences</span>
        </span>
      </div>

      {/* ---------- The plan page: opened by a floor on the tower, portalled over everything ---------- */}
      {zoomOpen &&
        createPortal(
          <div
            ref={zoomRef}
            className="fixed inset-0 z-[200] flex flex-col bg-[var(--cream)] text-[var(--ink)]"
            style={{ visibility: 'hidden' }}
            role="dialog"
            aria-modal="true"
            aria-label={`${unit.label} ${planLabel}`}
          >
            {/* the plan fills the screen; everything else sits on top of it */}
            <div className="fp2-big absolute inset-0">
              {planView === 'iso' && unit.isoFrames ? (
                <IsoTurntable key={unit.id} frames={unit.isoFrames} poster={unit.iso} alt={`${unit.label} isometric`} className="h-full w-full" />
              ) : activeSrc ? (
                <img src={activeSrc} alt={`${unit.label} ${planLabel}`} className="absolute inset-0 h-full w-full object-contain" draggable={false} />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center">
                  <IcPlan size={26} className="text-[var(--ink-soft)]/50" />
                  <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[var(--ink-soft)]/70">Coming soon</span>
                  <p className="max-w-[16rem] font-serif text-[1rem] text-[var(--ink-soft)]">
                    The {unit.label} {planLabel} is on its way.
                  </p>
                </div>
              )}
            </div>

            <header className="relative z-10 flex items-center justify-between px-5 pt-[max(1.25rem,var(--safe-t))] sm:px-8 side:px-[2.9rem] side:pt-[2.7rem] short:px-5 short:pt-3">
              <button type="button" onClick={closeZoom} onPointerMove={glowAt} aria-label="Back to the tower" className="mn-glow tr-focus flex h-10 w-10 items-center justify-center rounded-full border border-[var(--ink)]/20 bg-[color-mix(in_srgb,var(--cream)_70%,transparent)] text-[var(--ink)] backdrop-blur-sm">
                <IcBack size={16} />
              </button>
              <MenuControl onClick={onClose} />
            </header>

            {/* the residence types, over the plan on the left */}
            <aside className="relative z-10 mt-auto mb-auto w-fit px-5 sm:px-8 side:px-[2.9rem]">
              <div className="rounded-lg border border-[var(--bronze)]/25 bg-[color-mix(in_srgb,var(--cream)_72%,transparent)] px-4 py-3 backdrop-blur-sm">
                {floorName && <span className="block font-sans text-[0.6rem] uppercase tracking-[0.22em] text-[var(--bronze-deep)]">{floorName}</span>}
                <ul className="mt-2.5 flex flex-col gap-2.5">
                  {UNITS.map((u, i) => {
                    const on = u.id === unitId
                    return (
                      <li key={u.id} className="relative pl-3">
                        {on && <span className="absolute left-0 top-[0.2em] h-[0.95em] w-[2px] bg-[var(--bronze-deep)]" aria-hidden="true" />}
                        <button
                          type="button"
                          onClick={() => setUnitId(u.id)}
                          onPointerMove={glowAt}
                          aria-pressed={on}
                          className="mn-glow tr-focus flex touch-manipulation items-baseline gap-2.5 rounded-md border-none bg-transparent p-0 text-left"
                        >
                          <span className="font-sans text-[0.6rem] tabular-nums tracking-[0.1em] text-[var(--ink-soft)]">{String(i + 1).padStart(2, '0')}</span>
                          <span className={`font-serif text-[0.98rem] leading-none transition-colors duration-300 ${on ? 'text-[var(--ink)]' : 'text-[var(--ink-soft)]'}`}>{u.label}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </aside>

            {/* floor plan / isometric, over the plan at the foot - both fill the screen */}
            <div className="relative z-10 flex justify-center pb-[max(1.5rem,var(--safe-b))]">
              <div className="flex items-center gap-1 rounded-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--cream)_72%,transparent)] p-1 backdrop-blur-sm">
                {[
                  ['2d', 'Floor plan'],
                  ['iso', 'Isometric'],
                ].map(([v, l]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setPlanView(v)}
                    onPointerMove={glowAt}
                    aria-pressed={planView === v}
                    className={`mn-glow tr-focus rounded-full px-5 py-2 font-sans text-[0.68rem] uppercase tracking-[0.16em] transition-colors duration-300 ${
                      planView === v ? 'bg-[var(--bronze-deep)] text-[var(--cream)]' : 'text-[var(--ink-soft)]'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  )
}

export default FloorPlans
