import { useEffect, useState } from 'react'
import BrandMark from '../components/BrandMark.jsx'
import BackButton from '../components/BackButton.jsx'
import FloorStage from '../components/FloorStage.jsx'
import { UNITS } from '../components/floorUnits.js'

// Floors that are shown on the tower but cannot be opened.
const LOCKED_FLOORS = new Set(['_8th', '_9th'])
const DEFAULT_FLOOR = '_17th'

const TOWER_IMG = '/assets/menu.png'
const BUILDING_SVG_URL = '/assets/svg/Building.svg'
const GOLD = '#c98b62'

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
    <section
      className="relative flex min-h-svh w-full flex-col text-cream lg:h-svh lg:overflow-hidden"
      style={{ background: 'radial-gradient(38rem 34rem at 30% 62%, rgba(193,110,50,0.2) 0%, rgba(120,80,56,0.12) 45%, transparent 72%), var(--royal-base)' }}
    >
      {/* Logo and Back, as on every page */}
      <div className="relative z-20 flex shrink-0 items-start justify-between px-5 pt-5 sm:px-8 md:px-12 md:pt-9 lg:absolute lg:inset-x-0 lg:top-0">
        <button type="button" onClick={onClose} className="border-none bg-transparent p-0 text-left">
          <BrandMark />
        </button>
        <BackButton onClick={onClose} />
      </div>

      <div className="relative z-10 grid min-h-0 flex-1 grid-cols-[4.5rem_minmax(0,1fr)] gap-x-4 gap-y-6 px-5 pb-8 pt-6 sm:px-8 md:grid-cols-[6rem_minmax(0,1fr)] md:px-12 lg:grid-cols-[11rem_minmax(0,0.85fr)_minmax(0,1.5fr)] lg:grid-rows-[minmax(0,1fr)] lg:gap-x-8 lg:pb-[2.5rem] lg:pt-[8rem] xl:pl-[4.5rem]">
        {/* ---------- Floor picker ---------- */}
        <nav className="flex min-h-0 flex-col justify-center" aria-label="Floor picker">
          <div className="mb-3 flex items-start gap-2.5 text-[0.5625rem] uppercase leading-[1.5] tracking-[0.25rem] text-cream/70">
            <span className="mt-[0.45rem] block h-px w-4 shrink-0" style={{ background: GOLD }} />
            <span>
              Floor
              <br />
              Picker
            </span>
          </div>
          <ul className="relative flex h-[min(56svh,26rem)] flex-col justify-between lg:h-[min(calc(100svh-23rem),30rem)]">
            {/* the ruler the floors hang on */}
            <span className="pointer-events-none absolute bottom-1 top-1 left-[2.15rem] w-px bg-[#c98b62]/25" aria-hidden="true" />
            {ordered.map((f) => {
              const locked = LOCKED_FLOORS.has(f.id)
              const on = f.id === selectedFloor
              const hot = f.id === hoveredFloor
              return (
                <li key={f.id} className="relative">
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => setSelectedFloor(f.id)}
                    onMouseEnter={() => setHoveredFloor(f.id)}
                    onMouseLeave={() => setHoveredFloor(null)}
                    aria-pressed={on}
                    aria-label={f.label}
                    className="relative flex w-[4.25rem] items-center gap-2 rounded-full border bg-transparent py-[0.12rem] pl-2 pr-1 text-left leading-none transition-colors duration-300 disabled:cursor-default"
                    style={{ borderColor: on ? 'rgba(201,139,98,0.75)' : 'transparent', background: on ? 'rgba(201,139,98,0.12)' : 'transparent' }}
                  >
                    {on && <i className="absolute -left-2.5 block h-1.5 w-1.5 rounded-full" style={{ background: GOLD, boxShadow: '0 0 0.5rem rgba(201,139,98,0.9)' }} />}
                    <span className={`w-5 text-right text-[0.625rem] tabular-nums transition-colors duration-300 ${on ? 'font-semibold text-[#e8b48f]' : locked ? 'text-cream/20' : hot ? 'text-cream' : 'text-cream/60'}`}>
                      {f.num}
                    </span>
                    <span className="block h-px w-3" style={{ background: on || hot ? GOLD : 'rgba(201,139,98,0.3)' }} />
                  </button>
                </li>
              )
            })}
          </ul>
          <p className="mt-5 hidden whitespace-nowrap text-[0.5rem] uppercase leading-[1.9] tracking-[0.25rem] text-cream/60 lg:block">
            A higher
            <br />
            standard of living
            <span className="mt-3 block h-px w-10" style={{ background: GOLD }} />
          </p>
        </nav>

        {/* ---------- The tower: tap a floor ---------- */}
        <div className="relative flex min-h-0 items-center justify-center">
          <span className="pointer-events-none absolute bottom-[8%] left-1/2 h-[18%] w-[90%] -translate-x-1/2 rounded-[50%]" style={{ background: 'radial-gradient(closest-side, rgba(214,140,95,0.35), transparent)' }} aria-hidden="true" />
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
                            transition: 'fill 0.2s ease',
                            fill: isSelected ? 'rgba(201,139,98,0.42)' : isHovered ? 'rgba(201,139,98,0.26)' : 'rgba(201,139,98,0.01)',
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
        {activeFloor && <FloorStage key={activeFloor.id + unitId} floor={activeFloor} unitId={unitId} setUnitId={setUnitId} />}
      </div>
    </section>
  )
}

export default FloorPlans
