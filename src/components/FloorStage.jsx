import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gsap, fx, EASE, PAGE_IN, REDUCED } from '../motion/index.js'
import { Segmented, IconButton } from '../ui/controls.jsx'
import { glowAt } from '../ui/glow.js'
import { IcArea, IcSea, IcBed, IcLayers, IcLiving, IcView, IcUnit, IcCompass, IcKey, IcArrow, IcClose } from '../ui/icons.jsx'
import { UNITS } from './floorUnits.js'

const TBC = 'To be confirmed'
const UNIT_OPTIONS = UNITS.map((u) => ({ value: u.id, label: u.label }))

const floorTitle = (f) => (f.num === 'G' ? 'Ground Floor' : f.num === 'T' ? 'Terrace' : `Floor ${parseInt(f.num, 10)}`)

// Right-hand column: the residence card for the chosen floor and unit (cream, as in the
// "Floor 17" creative), and the strip of facts beneath it. The card stays mounted; when the
// floor or unit changes its contents cross-fade.
function FloorStage({ floor, unitId, setUnitId }) {
  const [zoom, setZoom] = useState(false)
  const rootRef = useRef(null)
  const zoomRef = useRef(null)
  const mounted = useRef(false)
  const unit = UNITS.find((u) => u.id === unitId)

  // First arrival
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: PAGE_IN + 0.2 })
      tl.add(fx.panel('.fs-card'), 0)
      tl.add(fx.corners('.fs-card .tr-corner'), 0.3)
      tl.add(fx.heading('.fs-title'), 0.2)
      tl.add(fx.fade('.fs-rise', { stagger: 0.06 }), 0.3)
      tl.add(fx.fade('.fs-facts', { y: 12 }), 0.55)
    }, rootRef)
    return () => ctx.revert()
  }, [])

  // Floor or unit changed: the words and the plan cross-fade in place
  useLayoutEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    const ctx = gsap.context(() => {
      fx.heading('.fs-title', { duration: 0.6 })
      gsap.fromTo('.fs-swap', { opacity: 0.15, y: 4 }, { opacity: 1, y: 0, duration: REDUCED ? 0.2 : 0.5, ease: EASE.soft, stagger: 0.03, overwrite: 'auto' })
      gsap.fromTo('.fs-plan img', { opacity: 0 }, { opacity: 1, duration: REDUCED ? 0.2 : 0.7, ease: EASE.move, overwrite: 'auto' })
    }, rootRef)
    return () => ctx.revert()
  }, [floor.id, unitId])

  const closeZoom = useCallback(() => gsap.to(zoomRef.current, { autoAlpha: 0, duration: REDUCED ? 0.1 : 0.4, ease: EASE.soft, onComplete: () => setZoom(false) }), [])

  useEffect(() => {
    if (!zoom) return
    const onKey = (e) => e.key === 'Escape' && closeZoom()
    window.addEventListener('keydown', onKey)
    gsap.fromTo(zoomRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: REDUCED ? 0.15 : 0.5, ease: EASE.soft })
    gsap.fromTo(zoomRef.current.querySelector('.fz-frame'), { opacity: 0, scale: 0.985 }, { opacity: 1, scale: 1, duration: REDUCED ? 0.15 : 0.7, ease: EASE.soft, delay: 0.1 })
    return () => window.removeEventListener('keydown', onKey)
  }, [zoom, closeZoom])

  const specs = [
    [IcArea, 'Approx. area', unit.carpetArea ?? TBC, unit.carpetArea == null],
    [IcSea, 'View', 'City + Sea', false],
    [IcBed, 'Configuration', `${unit.bedrooms} Bedrooms`, false],
    [IcLayers, 'Status', 'Choose a floor on the tower to see its residence.', false],
  ]

  const highlights = [
    [IcBed, 'Ensuite bedrooms', 'Every bedroom with its own bath.'],
    [IcLiving, 'Spacious living and dining', 'Open, generous rooms for modern living.'],
    [IcView, 'Panoramic views', 'Over the city skyline and the sea.'],
  ]

  const facts = [
    [IcUnit, 'Unit', `Signature ${unit.label} residence`],
    [IcCompass, 'Facing', TBC],
    [IcSea, 'Views', 'City skyline & the sea'],
    [IcKey, 'Availability', 'Enquire to check availability'],
  ]

  return (
    <div ref={rootRef} className="col-span-2 flex min-h-0 min-w-0 flex-col gap-4 lg:col-span-1 lg:justify-center">
      {/* ---------- The residence card ---------- */}
      <div className="fs-card tr-panel min-w-0 p-5 sm:p-7">
        {/* header: the floor, and the residence type */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="fs-rise flex items-center gap-4">
              <span className="tr-num">04</span>
              <span className="tr-dash" />
              <span className="tr-label">Residence</span>
            </span>
            <h2 className="tr-display mt-3 text-[clamp(2.4rem,3.6vw,3.4rem)] leading-none">
              <span className="fs-title block pb-1">{floorTitle(floor)}</span>
            </h2>
            <p className="fs-rise fs-swap mt-2 font-sans text-[0.6875rem] uppercase tracking-[0.22em] text-cream/65">Signature {unit.label} residence</p>
          </div>
          <div className="fs-rise">
            <Segmented options={UNIT_OPTIONS} value={unitId} onChange={setUnitId} label="Residence type" />
          </div>
        </div>

        {/* the four specs */}
        <dl className="fs-rise mt-6 grid grid-cols-2 overflow-hidden rounded-[0.75rem] border border-[color-mix(in_srgb,var(--ribbon-main-gold)_22%,transparent)] bg-[color-mix(in_srgb,var(--espresso)_35%,transparent)] md:grid-cols-4">
          {specs.map(([Ic, label, value, muted], i) => (
            <div
              key={label}
              className={`border-[color-mix(in_srgb,var(--ribbon-main-gold)_16%,transparent)] px-4 py-4 ${i % 2 ? 'border-l' : ''} ${i > 1 ? 'border-t md:border-t-0' : ''} ${i === 2 ? 'md:border-l' : ''}`}
            >
              <span className="block text-[var(--ribbon-champagne)]">
                <Ic size={19} />
              </span>
              <dt className="tr-label mt-2.5 text-[0.5625rem]">{label}</dt>
              <dd className={`fs-swap mt-1 font-serif leading-snug ${i === 3 ? 'text-[0.875rem]' : 'text-[1.2rem]'} ${i === 3 || muted ? 'text-cream/60' : 'text-cream'}`}>{value}</dd>
            </div>
          ))}
        </dl>

        {/* the plan, and what makes the residence */}
        <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <button
            type="button"
            onClick={() => setZoom(true)}
            aria-label={`View the ${unit.label} plan larger`}
            onPointerMove={glowAt}
            className="fs-rise fs-plan mn-glow tr-focus group relative min-w-0 rounded-[0.75rem] border border-[color-mix(in_srgb,var(--ribbon-main-gold)_30%,transparent)] bg-[color-mix(in_srgb,var(--espresso)_40%,transparent)] p-1.5"
          >
            <span className="block aspect-[3/2] overflow-hidden rounded-[0.55rem]">
              <img src={unit.iso} alt={`${unit.label} isometric plan`} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]" draggable={false} />
            </span>
          </button>

          <div className="flex min-w-0 flex-col justify-between gap-5">
            <div>
              <span className="fs-rise flex items-center gap-4">
                <span className="tr-dash" />
                <span className="tr-label">Residence highlights</span>
              </span>
              <ul className="mt-4 space-y-3.5">
                {highlights.map(([Ic, main, sub]) => (
                  <li key={main} className="fs-rise flex items-center gap-3.5">
                    <span className="tr-tile h-10 w-10">
                      <Ic size={18} />
                    </span>
                    <span className="min-w-0 leading-tight">
                      <span className="block font-serif text-[1.05rem] text-cream">{main}</span>
                      <span className="mt-0.5 block text-[0.75rem] text-cream/65">{sub}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <button type="button" onClick={() => setZoom(true)} onPointerMove={glowAt} className="fs-rise tr-btn tr-btn--gold mn-glow self-start">
              View floor plan
              <IcArrow size={15} className="tr-arrow" />
            </button>
          </div>
        </div>
      </div>

      {/* ---------- The facts strip ---------- */}
      <dl className="fs-facts tr-panel is-flat grid grid-cols-2 md:grid-cols-4">
        {facts.map(([Ic, label, value], i) => (
          <div
            key={label}
            className={`flex items-start gap-3 border-[color-mix(in_srgb,var(--ribbon-main-gold)_16%,transparent)] px-5 py-4 ${i ? 'md:border-l' : ''} ${i % 2 ? 'border-l' : ''} ${i > 1 ? 'border-t md:border-t-0' : ''}`}
          >
            <span className="mt-0.5 text-[var(--ribbon-champagne)]">
              <Ic size={19} />
            </span>
            <span className="min-w-0">
              <dt className="tr-label text-[0.5625rem]">{label}</dt>
              <dd className={`fs-swap mt-1 font-serif text-[0.95rem] leading-snug ${value === TBC ? 'text-cream/55' : 'text-cream'}`}>{value}</dd>
            </span>
          </div>
        ))}
      </dl>

      {/* Larger view - portalled to <body> so nothing on the page can overlap it */}
      {zoom &&
        createPortal(
          <div
            ref={zoomRef}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-[var(--scrim)] p-4 pt-20 backdrop-blur-md sm:p-10 sm:pt-24"
            style={{ visibility: 'hidden' }}
            onClick={closeZoom}
            role="dialog"
            aria-modal="true"
            aria-label={`${unit.label} plan`}
          >
            <div className="absolute right-5 top-[max(1.25rem,var(--safe-t))] z-10 flex items-center gap-3 sm:right-8 sm:top-8">
              <span className="tr-label hidden sm:inline">{unit.label} plan</span>
              <IconButton label="Close" onClick={closeZoom}>
                <IcClose size={17} />
              </IconButton>
            </div>
            <div className="fz-frame tr-panel relative h-full w-full max-w-[80rem] p-2" onClick={(e) => e.stopPropagation()}>
              <img src={unit.iso} alt={`${unit.label} isometric plan`} className="h-full w-full rounded-[0.75rem] object-contain" draggable={false} />
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}

export default FloorStage
