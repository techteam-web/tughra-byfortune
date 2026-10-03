import BrandMark from '../components/BrandMark.jsx'
import { useEffect, useState } from 'react'
import BackButton from '../components/BackButton.jsx'
import UnitPanel from '../components/UnitPanel.jsx'

// Floors that are shown on the tower but cannot be opened.
const LOCKED_FLOORS = new Set(['_8th', '_9th'])

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

const floorTitle = (f) => (f.num === 'G' ? 'Ground Floor' : f.num === 'T' ? 'Terrace' : `Floor ${parseInt(f.num, 10)}`)

function FloorPlans({ onClose }) {
  const [floors, setFloors] = useState([])
  const [selectedFloor, setSelectedFloor] = useState(null)
  const [hoveredFloor, setHoveredFloor] = useState(null)

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
            x0: b.x,
            x1: b.x + b.width,
            y0: b.y,
            y1: b.y + b.height,
          }
        })

        document.body.removeChild(measureSvg)
        if (cancelled) return

        setFloors(parsed)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  const activeFloor = floors.find((f) => f.id === selectedFloor)

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
      style={{ background: 'radial-gradient(circle at 100% 0%, rgba(201,162,39,0.14) 0%, transparent 40%), radial-gradient(circle at 0% 0%, #4a3a32 0%, #2d2420 35%, #1d1816 65%, #14110f 100%)' }}
    >
      {/* Top bar */}
      <div className="relative z-20 flex shrink-0 items-start justify-between px-6 py-5 md:px-12 md:py-6">
        <button type="button" onClick={onClose} className="flex items-center border-none bg-transparent p-0 text-left">
          <BrandMark />
        </button>
        <BackButton onClick={onClose} />
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-8 px-6 pb-6 md:px-12 lg:flex-row lg:gap-10">
        {/* Left: floor picker + interactive tower */}
        <div className="flex shrink-0 flex-col items-center gap-3 self-center [--tower-h:min(52svh,28rem)] lg:mb-16 lg:min-w-0 lg:flex-1 lg:[--tower-h:min(calc(100svh-17rem),30rem)]">
          <div className="flex items-center gap-2 text-[0.5625rem] uppercase tracking-[0.2rem] text-muted">
            <span className="h-px w-4 bg-gold/50" />
            Select a floor
          </div>
          <div className="relative flex gap-4">
            <div className="relative shrink-0 select-none overflow-hidden" style={{ height: 'var(--tower-h)', aspectRatio: `${CROP.width} / ${CROP.height}` }}>
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
                            fill: isSelected ? 'rgba(227,196,99,0.35)' : isHovered ? 'rgba(227,196,99,0.22)' : 'rgba(227,196,99,0.01)',
                          },
                        }
                    return floor.type === 'path' ? (
                      <path key={floor.id} d={floor.d} {...shapeProps} />
                    ) : (
                      <polygon key={floor.id} points={floor.points} {...shapeProps} />
                    )
                  })}
                </svg>
              </div>
            </div>
            {/* Floor number tag - only the number, riding alongside the highlighted floor */}
            {(() => {
              const f = floors.find((x) => x.id === (hoveredFloor || selectedFloor))
              if (!f || LOCKED_FLOORS.has(f.id)) return null
              const top = (((f.y0 + f.y1) / 2 - CROP.y) / CROP.height) * 100
              return (
                <div className="pointer-events-none absolute left-0 z-10 flex -translate-x-full -translate-y-1/2 items-center transition-[top] duration-500 ease-out" style={{ top: `${top}%` }}>
                  <span className="flex h-9 min-w-9 items-center justify-center rounded-full px-2 font-serif text-lg font-semibold text-[#1d1816]" style={{ background: 'linear-gradient(135deg,#e3c463,#c9a227)' }}>
                    {f.num}
                  </span>
                  <span className="h-px w-5 bg-gold" />
                </div>
              )
            })()}
          </div>
        </div>

        {/* Right: floor plan card */}
        <div className="min-h-0 w-full min-w-0 lg:h-[min(100%,38rem)] lg:w-[50rem] lg:max-w-[50rem] lg:shrink-0 lg:self-center xl:mr-[4%]">
          {activeFloor ? (
            <UnitPanel key={activeFloor.id} floorTitle={floorTitle(activeFloor)} floorLabel={activeFloor.label} />
          ) : (
            <div
              className="flex min-h-[18rem] w-full flex-col items-center justify-center gap-4 rounded-[1.75rem] px-8 text-center text-[#241f1a] lg:h-[calc(100%-4.5rem)]"
              style={{ background: 'linear-gradient(160deg,#f8f1e3 0%,#efe3cc 100%)', border: '1px solid rgba(201,162,39,0.6)', boxShadow: 'inset 0 0 0 4px rgba(255,255,255,0.35), 0 2rem 5rem rgba(0,0,0,0.5)' }}
            >
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#b58a3a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 21V9l6-4v16" />
                <path d="M10 21V5l6 4v12" />
                <path d="M16 21v-8l4 2.2V21" />
              </svg>
              <h3 className="font-serif text-3xl font-medium text-[#1d1816]">Select a floor from the tower</h3>
              <p className="text-[0.6875rem] uppercase tracking-[0.2rem] text-[#6b5a3a]">To view the floor plan</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default FloorPlans
