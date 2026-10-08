import { useEffect, useState } from 'react'
import BrandMark from '../components/BrandMark.jsx'
import FloorStage from '../components/FloorStage.jsx'
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

  const selectable = floors.filter((f) => !LOCKED_FLOORS.has(f.id))
  const activeFloor = floors.find((f) => f.id === selectedFloor)
  const tagFloor = floors.find((f) => f.id === (hoveredFloor || selectedFloor))

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
      className="relative flex min-h-svh w-full flex-col text-[#470d21] lg:h-svh lg:overflow-hidden"
      style={{ background: 'radial-gradient(60rem 40rem at 20% 0%, #fdf0e6 0%, transparent 70%), radial-gradient(50rem 36rem at 100% 100%, #f1d3c0 0%, transparent 70%), #f7e3d6' }}
    >
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g fill="none" stroke="#c9954a" strokeOpacity="0.4" strokeWidth="1.2">
          <path d="M-40 760C260 700 420 560 640 520C900 470 1060 560 1240 420C1380 310 1480 180 1660 130" />
          <path d="M-40 800C300 760 460 640 700 600C960 556 1100 640 1280 510C1420 410 1520 290 1660 250" strokeOpacity="0.25" />
          <path d="M260 -40C360 120 330 260 470 380C560 456 560 560 700 620" strokeOpacity="0.28" />
          <path d="M1660 520C1500 560 1420 700 1260 760C1120 810 1000 800 880 940" strokeOpacity="0.3" />
        </g>
        <g fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="2">
          <path d="M-40 780C280 730 440 600 670 560C930 512 1080 600 1260 465C1400 360 1500 235 1660 190" />
        </g>
      </svg>
      {/* Top bar */}
      <div className="relative z-20 flex shrink-0 items-start justify-between px-6 py-5 md:px-10 md:py-6">
        <button type="button" onClick={onClose} className="border-none bg-transparent p-0 text-left">
          <BrandMark tone="dark" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="lux-btn lux-light group flex items-center gap-2.5 rounded-full px-5 py-2.5 text-[0.625rem] uppercase tracking-[0.25rem]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back
        </button>
      </div>

      <div className="relative z-10 grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] gap-6 px-6 pb-6 md:px-10 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-6 lg:grid-cols-[17rem_minmax(0,1fr)_13rem] lg:grid-rows-[minmax(0,1fr)] lg:gap-8 lg:pb-[4.5rem]">
        {/* ---------- Left: tower, the floor selector ---------- */}
        <div
          className="relative flex flex-col overflow-hidden rounded-[1.75rem] p-4 [--tower-h:min(54svh,24rem)] md:row-span-2 md:self-start md:[--tower-h:min(70svh,19rem)] lg:row-span-1 lg:self-stretch lg:[--tower-h:min(calc(100svh-18rem),23rem)]"
          style={{ background: '#470d21', boxShadow: '0 1.5rem 3rem rgba(71,13,33,0.28)' }}
        >
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 270 700" preserveAspectRatio="none" aria-hidden="true">
            <path d="M-10 640C70 600 150 640 290 560" fill="none" stroke="#e0a24e" strokeOpacity="0.35" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
            <path d="M-10 670C80 630 160 670 290 590" fill="none" stroke="#e0a24e" strokeOpacity="0.2" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
          </svg>

          <div className="relative flex items-center justify-center gap-2 text-[0.5625rem] uppercase tracking-[0.25rem] text-[#e3c9a0]/85">
            <span className="h-px w-5 bg-[#d9a066]/70" />
            Select a floor
          </div>

          <div className="relative mt-5 flex min-h-0 flex-1 items-center justify-center">
            {/* Tower */}
            <div className="relative shrink-0" style={{ height: 'var(--tower-h)', aspectRatio: `${CROP.width} / ${CROP.height}` }}>
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
                              fill: isSelected ? 'rgba(240,184,102,0.42)' : isHovered ? 'rgba(240,184,102,0.26)' : 'rgba(240,184,102,0.01)',
                            },
                          }
                      return floor.type === 'path' ? <path key={floor.id} d={floor.d} {...shapeProps} /> : <polygon key={floor.id} points={floor.points} {...shapeProps} />
                    })}
                  </svg>
                </div>
              </div>

              {tagFloor && !LOCKED_FLOORS.has(tagFloor.id) && (
                <div
                  className="pointer-events-none absolute left-0 z-10 -translate-x-[45%] -translate-y-1/2 transition-[top] duration-500 ease-out"
                  style={{ top: `${(((tagFloor.y0 + tagFloor.y1) / 2 - CROP.y) / CROP.height) * 100}%` }}
                >
                  <span className="flex h-9 min-w-9 items-center justify-center rounded-full px-2 font-serif text-[1rem] font-semibold text-[#470d21]" style={{ background: 'linear-gradient(145deg,#f0c27a,#d99a4a)', boxShadow: '0 0 0.9rem rgba(240,184,102,0.55)' }}>
                    {tagFloor.num === 'G' || tagFloor.num === 'T' ? tagFloor.num : parseInt(tagFloor.num, 10)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ---------- Centre + right: the selected floor ---------- */}
        {activeFloor && <FloorStage key={activeFloor.id} floor={activeFloor} floors={selectable} onSelect={setSelectedFloor} unitId={unitId} setUnitId={setUnitId} />}
      </div>
    </section>
  )
}

export default FloorPlans
