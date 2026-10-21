import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, fx, EASE, PAGE_IN, glideTo } from '../motion/index.js'
import { TopBar, BackControl } from '../ui/controls.jsx'
import FloorStage from '../components/FloorStage.jsx'
import tower from '../assets/render/menu-tower.webp'
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

function FloorPlans({ onClose }) {
  const [floors, setFloors] = useState([])
  const [selectedFloor, setSelectedFloor] = useState(null)
  const [hoveredFloor, setHoveredFloor] = useState(null)
  const [unitId, setUnitId] = useState(UNITS[0].id)
  const rootRef = useRef(null)
  const pillRef = useRef(null)
  const btnRefs = useRef({})
  const placed = useRef(false)

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

        // getBBox() only works once the element is actually in a rendered
        // SVG, so measure via a hidden, zero-size svg appended to the page.
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
      tl.add(fx.fade('.tb-anim, .fp-back', { y: -10 }), 0)
      tl.add(fx.fade('.fp-picker-head', { y: 8 }), 0.15)
      tl.add(fx.lineY('.fp-rail'), 0.2)
      tl.add(fx.show('.fp-tower', { duration: 1.2 }), 0.2)
      tl.add(fx.fade('.fp-tagline', { y: 8 }), 0.7)
    }, rootRef)
    return () => ctx.revert()
  }, [])

  useLayoutEffect(() => {
    if (!floors.length) return
    gsap.fromTo(rootRef.current.querySelectorAll('.fp-num'), { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.02, ease: EASE.soft, delay: 0.2 })
  }, [floors.length])

  // The gold pill glides along the rail to the chosen floor
  useLayoutEffect(() => {
    const place = (immediate) => glideTo(pillRef.current, btnRefs.current[selectedFloor], { axis: 'y', size: false, immediate })
    place(!placed.current)
    if (btnRefs.current[selectedFloor]) placed.current = true
    const onResize = () => place(true)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [selectedFloor, floors.length])

  const activeFloor = floors.find((f) => f.id === selectedFloor)
  // top of the tower first, as the picker reads: Terrace, 24 down to 1, Ground
  const rank = (f) => (f.num === 'T' ? 1000 : f.num === 'G' ? -1 : parseInt(f.num, 10))
  const ordered = [...floors].sort((a, b) => rank(b) - rank(a))

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
    <section ref={rootRef} className="relative isolate flex min-h-svh w-full flex-col bg-espresso text-cream lg:h-svh lg:overflow-hidden">
      {/* the dusk photograph, melted into warm light behind everything, with a faint grain */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <img src={tower} alt="" className="h-full w-full scale-125 object-cover opacity-80 blur-[48px]" draggable={false} />
        <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--espresso)_62%,transparent)]" style={{ backgroundImage: 'var(--grain)' }} />
      </div>
      <TopBar onBrand={onClose} sticky className="lg:absolute">
        <span className="fp-back">
          <BackControl onClick={onClose} />
        </span>
      </TopBar>

      <div className="relative z-10 grid min-h-0 flex-1 grid-cols-[4.75rem_minmax(0,1fr)] gap-x-4 gap-y-6 px-5 pb-[max(2rem,var(--safe-b))] pt-4 sm:px-8 md:grid-cols-[6rem_minmax(0,1fr)] md:px-12 lg:grid-cols-[10rem_minmax(0,0.8fr)_minmax(0,1.55fr)] lg:grid-rows-[minmax(0,1fr)] lg:gap-x-8 lg:pb-[2.5rem] lg:pt-[8rem] xl:pl-[4.5rem]">
        {/* ---------- Floor picker ---------- */}
        <nav className="flex min-h-0 flex-col justify-center" aria-label="Floor picker">
          <span className="fp-picker-head tr-label mb-4 block leading-[1.6]">
            Floor
            <br />
            picker
          </span>
          <ul className="relative flex h-[29rem] flex-col justify-between lg:h-[min(calc(100svh-23rem),30rem)]">
            {/* the rail the floors hang on */}
            <span className="fp-rail tr-vhair pointer-events-none absolute bottom-0 top-0 left-[2.6rem]" aria-hidden="true" />
            {/* the chosen floor: a gold pill with ink figures */}
            <span ref={pillRef} className="pointer-events-none absolute left-0 top-0 h-4 w-[2.4rem] rounded-full bg-[linear-gradient(90deg,var(--ribbon-champagne),var(--ribbon-main-gold))] shadow-[0_0_0.9rem_color-mix(in_srgb,var(--ribbon-main-gold)_50%,transparent)]" style={{ opacity: activeFloor ? 1 : 0 }} aria-hidden="true" />
            {ordered.map((f) => {
              const locked = LOCKED_FLOORS.has(f.id)
              const on = f.id === selectedFloor
              const hot = f.id === hoveredFloor
              return (
                <li key={f.id}>
                  <button
                    ref={(el) => (btnRefs.current[f.id] = el)}
                    type="button"
                    disabled={locked}
                    onClick={() => setSelectedFloor(f.id)}
                    onMouseEnter={() => setHoveredFloor(f.id)}
                    onMouseLeave={() => setHoveredFloor(null)}
                    aria-pressed={on}
                    aria-label={locked ? `${f.label} (not available)` : f.label}
                    className="fp-num tr-focus relative flex h-4 items-center gap-2 rounded-full border-none bg-transparent p-0 text-left leading-none disabled:cursor-default"
                  >
                    <span
                      className={`w-[2.4rem] text-center font-sans text-[0.625rem] tabular-nums tracking-[0.06em] transition-colors duration-300 ${
                        on ? 'font-semibold text-ink' : locked ? 'text-cream/25' : hot ? 'text-[var(--ribbon-champagne)]' : 'text-cream/65'
                      }`}
                    >
                      {f.num}
                    </span>
                    <span
                      className={`block h-px origin-left transition-[transform,background-color] duration-300 ${on || hot ? 'scale-x-100 bg-[var(--ribbon-champagne)]' : 'scale-x-[0.6] bg-gold-pale/40'}`}
                      style={{ width: '0.9rem' }}
                    />
                  </button>
                </li>
              )
            })}
          </ul>
          <p className="fp-tagline tr-label mt-6 hidden whitespace-nowrap text-[0.5625rem] leading-[1.9] lg:block">
            A higher
            <br />
            standard of living
            <span className="tr-hair mt-3 block w-10" />
          </p>
        </nav>

        {/* ---------- The tower: tap a floor ---------- */}
        <div className="fp-tower relative flex min-h-0 items-center justify-center">
          <div className="relative shrink-0" style={{ height: 'min(calc(100svh - 9rem), 44rem)', maxHeight: '100%', aspectRatio: `${CROP.width} / ${CROP.height}` }}>
            <div className="relative h-full w-full select-none overflow-hidden">
              <div style={innerStyle}>
                <img src={TOWER_IMG} alt="Tughra tower elevation" className="pointer-events-none absolute inset-0 h-full w-full select-none" draggable={false} />
                <svg viewBox={`0 0 ${CANVAS.width} ${CANVAS.height}`} className="absolute inset-0 h-full w-full">
                  {floors.map((floor) => {
                    const isHovered = hoveredFloor === floor.id
                    const isSelected = selectedFloor === floor.id
                    const shapeProps = LOCKED_FLOORS.has(floor.id)
                      ? { style: { pointerEvents: 'none', fill: 'transparent' } }
                      : {
                          onClick: () => setSelectedFloor(floor.id),
                          onMouseEnter: () => setHoveredFloor(floor.id),
                          onMouseLeave: () => setHoveredFloor(null),
                          style: {
                            cursor: 'pointer',
                            pointerEvents: 'all',
                            transition: 'fill-opacity 0.3s ease',
                            fill: 'var(--ribbon-main-gold)',
                            fillOpacity: isSelected ? 0.5 : isHovered ? 0.26 : 0.01,
                          },
                        }
                    return floor.type === 'path' ? <path key={floor.id} d={floor.d} {...shapeProps} /> : <polygon key={floor.id} points={floor.points} {...shapeProps} />
                  })}
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- The residence on the chosen floor ---------- */}
        {activeFloor && <FloorStage floor={activeFloor} unitId={unitId} setUnitId={setUnitId} />}
      </div>
    </section>
  )
}

export default FloorPlans
