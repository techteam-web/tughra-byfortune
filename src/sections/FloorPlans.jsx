import { useEffect, useState } from 'react'
import BackButton from '../components/BackButton.jsx'

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

const UNIT = { name: '3 BHK Residence', area: '2150 SQ FT' }

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

  // Building.svg has one bad shape ("_24th" is traced with coordinates that
  // overlap where floors ~19-20 actually sit, out of sequence with its
  // neighbours), so the picker list can't trust each shape's raw Y position -
  // it walks the shapes in their guaranteed-correct file order instead. Rows
  // are spaced evenly rather than by each floor's real (very uneven) height,
  // since the real heights bunch many rows together illegibly.
  const pickerRows = floors.map((floor, i) => {
    const t = floors.length > 1 ? i / (floors.length - 1) : 0
    return { ...floor, pickerCy: t }
  })

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
      className="relative h-svh w-full overflow-hidden text-cream"
      style={{
        background:
          'radial-gradient(circle at 0% 0%, #322824 0%, #211c1a 35%, #171413 65%, #0f0d0c 100%)',
      }}
    >
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

      {/* Body */}
      <div className="absolute inset-0 flex items-start justify-center overflow-y-auto px-6 pt-24 pb-20 md:items-center md:pt-16 md:px-12">
        <div className="flex w-full max-w-[82.5rem] flex-col items-center gap-12 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          {/* Left: floor picker + interactive tower diagram */}
          <div className="flex w-full shrink-0 items-end gap-5 lg:-mt-[3.875rem] lg:ml-20 lg:w-auto">
            {/* Floor picker list - each row sits at the same proportional
                height as its floor on the tower, not evenly spaced, since
                the real floor-to-floor heights in the render aren't uniform */}
            <div className="relative hidden shrink-0 sm:block" style={{ width: '4rem', height: 'min(64vh, 38.75rem)' }}>
              <div className="absolute bottom-full left-0 mb-3 flex items-center gap-2 text-[0.5625rem] uppercase tracking-[0.125rem] text-muted">
                <span className="h-px w-4 bg-gold/50" />
                Floor Picker
              </div>
              <div className="relative h-full">
                {pickerRows.map((floor) => {
                  const isActive = selectedFloor === floor.id
                  const topPercent = floor.pickerCy * 100
                  return (
                    <button
                      key={floor.id}
                      type="button"
                      onClick={() => setSelectedFloor(floor.id)}
                      onMouseEnter={() => setHoveredFloor(floor.id)}
                      onMouseLeave={() => setHoveredFloor(null)}
                      className="group absolute left-0 flex -translate-y-1/2 items-center gap-2 border-none bg-transparent pr-1 text-left"
                      style={{ top: `${topPercent}%` }}
                    >
                      <span
                        className="w-5 font-serif text-[0.75rem] transition-colors duration-200"
                        style={{ color: isActive ? '#e3c463' : 'rgba(243,236,217,0.45)', fontWeight: isActive ? 600 : 400 }}
                      >
                        {floor.num}
                      </span>
                      <span
                        className="h-px transition-all duration-200"
                        style={{
                          width: isActive ? '1.125rem' : '0.625rem',
                          backgroundColor: isActive || hoveredFloor === floor.id ? '#e3c463' : 'rgba(243,236,217,0.3)',
                        }}
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tower diagram */}
            <div className="relative">
              <div
                className="relative select-none overflow-hidden"
                style={{ height: 'min(64vh, 38.75rem)', aspectRatio: `${CROP.width} / ${CROP.height}` }}
              >
                <div style={innerStyle}>
                  <img
                    src={TOWER_IMG}
                    alt="Tughra tower elevation"
                    className="pointer-events-none absolute inset-0 h-full w-full select-none"
                    draggable={false}
                  />

                  <svg viewBox={`0 0 ${CANVAS.width} ${CANVAS.height}`} className="absolute inset-0 h-full w-full">
                    {floors.map((floor) => {
                      const isHovered = hoveredFloor === floor.id
                      const shapeProps = {
                        onClick: () => setSelectedFloor(floor.id),
                        onMouseEnter: () => setHoveredFloor(floor.id),
                        onMouseLeave: () => setHoveredFloor(null),
                        style: {
                          cursor: 'pointer',
                          pointerEvents: 'all',
                          transition: 'fill 0.2s ease',
                          fill: isHovered ? 'rgba(227,196,99,0.22)' : 'rgba(227,196,99,0.01)',
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
              <span className="absolute left-1/2 top-full mt-5 block h-px w-10 -translate-x-1/2 bg-gold/50 lg:left-0 lg:translate-x-0" />
            </div>
          </div>

          {/* Right: floor plan card */}
          <div className="flex w-[45rem] max-w-full flex-col items-center">
            <div className="mb-4 flex min-h-[1rem] items-center gap-3 text-[0.6875rem] uppercase tracking-[0.125rem] text-gold">
              {activeFloor && (
                <>
                  <span className="h-px w-6 bg-gold/50" />
                  {activeFloor.label}
                </>
              )}
            </div>
            <div className="flex aspect-[3/2] w-full flex-col items-center justify-center gap-3 rounded-3xl bg-[#f7f5f1] px-8 text-center">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 21V9l6-4v16" />
                <path d="M10 21V5l6 4v12" />
                <path d="M16 21v-8l4 2.2V21" />
              </svg>
              <h3 className="font-serif text-2xl font-medium text-[#241f1a]">Select a floor from the tower</h3>
              <p className="text-[0.625rem] uppercase tracking-[0.125rem] text-[#8a7a5c]">To view the floor plan.</p>
            </div>
            <div className="mt-8 flex w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[0.6875rem] uppercase tracking-[0.09375rem] text-gold">
              <span>{UNIT.name}</span>
              <span className="h-3 w-px shrink-0 bg-gold/50" />
              <span>{UNIT.area}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Curved accent line — anchored to the true bottom-left corner of the page */}
      <img
        src="/assets/svg/line_5_crop.png"
        alt=""
        aria-hidden="true"
        className="frame-draw-animate pointer-events-none absolute bottom-0 left-0 hidden w-72 lg:block"
        style={{ animationDuration: '2s, 0.6s' }}
      />
    </section>
  )
}

export default FloorPlans
