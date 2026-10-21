import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gsap, fx, EASE, PAGE_IN, REDUCED } from '../motion/index.js'
import { IconButton, Segmented } from '../ui/controls.jsx'
import { glowAt } from '../ui/glow.js'
import { IcSea, IcBed, IcLiving, IcView, IcUnit, IcCompass, IcKey, IcArrow, IcClose, IcExpand, IcLayers as IcPlan } from '../ui/icons.jsx'
import { UNITS } from './floorUnits.js'

const TBC = 'To be confirmed'

// the residence-type switch: a numbered row, serif labels, a gold hairline under the
// active one - the same "01 / 02 / 03" rhythm the floor picker rail uses
function UnitList({ value, onChange }) {
  return (
    <ul className="flex flex-wrap items-baseline gap-x-5 gap-y-2" role="group" aria-label="Residence type">
      {UNITS.map((u, i) => {
        const on = u.id === value
        return (
          <li key={u.id}>
            <button
              type="button"
              onClick={() => onChange(u.id)}
              onPointerMove={glowAt}
              aria-pressed={on}
              className="mn-glow tr-focus group flex touch-manipulation items-baseline gap-2 rounded-md border-none bg-transparent py-1 text-left"
            >
              <span className={`font-sans text-[0.625rem] tabular-nums tracking-[0.1em] transition-colors duration-300 ${on ? 'text-[var(--ribbon-champagne)]' : 'text-cream/35'}`}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="flex flex-col">
                <span className={`font-serif text-[1.05rem] leading-none transition-colors duration-300 ${on ? 'text-cream' : 'text-cream/55 group-hover:text-cream/80'}`}>{u.label}</span>
                <span
                  className={`mt-1.5 block h-px w-full origin-left bg-gold-pale/40 transition-[transform,background-color] duration-500 ${on ? 'scale-x-100 bg-[var(--ribbon-champagne)]' : 'scale-x-0'}`}
                  aria-hidden="true"
                />
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

// The plan card: a floor-plan / isometric toggle, the render itself, and its own
// full-screen view. Mounted fresh per unit (keyed by unitId) so its tab always
// starts back on the real isometric render rather than carrying over a stale tab.
function PlanPanel({ unit }) {
  const [planView, setPlanView] = useState('iso')
  const [zoomOpen, setZoomOpen] = useState(false)
  const zoomRef = useRef(null)
  const activeSrc = unit[planView === '2d' ? 'plan2d' : 'iso']
  const planLabel = planView === '2d' ? 'floor plan' : 'isometric plan'

  useLayoutEffect(() => {
    gsap.fromTo('.fs-plan img', { opacity: 0 }, { opacity: 1, duration: REDUCED ? 0.2 : 0.6, ease: EASE.move, overwrite: 'auto' })
  }, [planView])

  const closeZoom = useCallback(() => gsap.to(zoomRef.current, { autoAlpha: 0, duration: REDUCED ? 0.1 : 0.4, ease: EASE.soft, onComplete: () => setZoomOpen(false) }), [])

  useEffect(() => {
    if (!zoomOpen) return
    const onKey = (e) => e.key === 'Escape' && closeZoom()
    window.addEventListener('keydown', onKey)
    gsap.fromTo(zoomRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: REDUCED ? 0.15 : 0.5, ease: EASE.soft })
    gsap.fromTo(zoomRef.current.querySelector('.fz-frame'), { opacity: 0, scale: 0.985 }, { opacity: 1, scale: 1, duration: REDUCED ? 0.15 : 0.7, ease: EASE.soft, delay: 0.1 })
    return () => window.removeEventListener('keydown', onKey)
  }, [zoomOpen, closeZoom])

  return (
    <div className="flex min-w-0 flex-col">
      <div className="fs-rise mb-3 min-w-0">
        <Segmented
          label="Plan view"
          value={planView}
          onChange={setPlanView}
          options={[
            { value: '2d', label: 'Floor plan' },
            { value: 'iso', label: 'Isometric' },
          ]}
        />
      </div>
      <button
        type="button"
        onClick={() => setZoomOpen(true)}
        onPointerMove={glowAt}
        aria-label={activeSrc ? `View the ${unit.label} ${planLabel} larger` : `${unit.label} ${planLabel} coming soon`}
        className="fs-rise fs-plan mn-glow tr-focus group relative block aspect-[4/5] min-w-0 overflow-hidden rounded-[0.9rem] border border-[color-mix(in_srgb,var(--ribbon-main-gold)_30%,transparent)] bg-[color-mix(in_srgb,var(--espresso)_40%,transparent)] p-1.5"
      >
        <span className="block h-full w-full overflow-hidden rounded-[0.6rem]">
          {activeSrc ? (
            <img
              src={activeSrc}
              alt={`${unit.label} ${planLabel}`}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              draggable={false}
            />
          ) : (
            <span className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
              <IcPlan size={22} className="text-cream/35" />
              <span className="font-sans text-[0.625rem] uppercase tracking-[0.18em] text-cream/40">Coming soon</span>
            </span>
          )}
        </span>
        <span className="tr-icon-btn is-sm pointer-events-none absolute right-3 top-3 opacity-90" aria-hidden="true">
          <IcExpand size={14} />
        </span>
      </button>

      {/* Larger view - portalled to <body> so nothing on the page can overlap it */}
      {zoomOpen &&
        createPortal(
          <div
            ref={zoomRef}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-[var(--scrim)] p-4 pt-20 backdrop-blur-md sm:p-10 sm:pt-24"
            style={{ visibility: 'hidden' }}
            onClick={closeZoom}
            role="dialog"
            aria-modal="true"
            aria-label={`${unit.label} ${planLabel}`}
          >
            <div className="absolute right-5 top-[max(1.25rem,var(--safe-t))] z-10 flex items-center gap-3 sm:right-8 sm:top-8">
              <span className="tr-label hidden sm:inline">
                {unit.label} {planLabel}
              </span>
              <IconButton label="Close" onClick={closeZoom}>
                <IcClose size={17} />
              </IconButton>
            </div>
            <div className="fz-frame tr-panel relative h-full w-full max-w-[80rem] p-2" onClick={(e) => e.stopPropagation()}>
              {activeSrc ? (
                <img src={activeSrc} alt={`${unit.label} ${planLabel}`} className="h-full w-full rounded-[0.75rem] object-contain" draggable={false} />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-[0.75rem] text-center">
                  <span className="tr-label">Coming soon</span>
                  <p className="max-w-xs font-serif text-lg text-cream/70">
                    The {unit.label} {planLabel} is on its way.
                  </p>
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}

const floorTitle = (f) => (f.num === 'G' ? 'Ground Floor' : f.num === 'T' ? 'Terrace' : `Floor ${parseInt(f.num, 10)}`)

// Right-hand column: the residence card for the chosen floor and unit (cream, as in the
// "Floor 17" creative), and the strip of facts beneath it. The card stays mounted; when the
// floor or unit changes its contents cross-fade.
function FloorStage({ floor, unitId, setUnitId, onEnquire }) {
  const rootRef = useRef(null)
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

  // Floor or unit changed: the words cross-fade in place
  useLayoutEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    const ctx = gsap.context(() => {
      fx.heading('.fs-title', { duration: 0.6 })
      gsap.fromTo('.fs-swap', { opacity: 0.15, y: 4 }, { opacity: 1, y: 0, duration: REDUCED ? 0.2 : 0.5, ease: EASE.soft, stagger: 0.03, overwrite: 'auto' })
    }, rootRef)
    return () => ctx.revert()
  }, [floor.id, unitId])

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

  // The room-by-room layout table, as on a flat's spec sheet. Room count follows the
  // bedroom count; sizes read "To be confirmed" until real dimensions are supplied.
  const roomRows = [
    { label: 'Drawing room' },
    { label: 'Dining' },
    { label: 'Kitchen' },
    ...Array.from({ length: unit.bedrooms }, (_, i) => ({ label: `Bedroom ${String(i + 1).padStart(2, '0')}` })),
    { label: 'Balcony' },
  ]
  const specRows = [{ label: 'Carpet area', value: unit.carpetArea }, ...roomRows.map((r) => ({ ...r, value: null }))]

  return (
    <div ref={rootRef} className="col-span-2 flex min-h-0 min-w-0 flex-col gap-4 lg:col-span-1 lg:overflow-y-auto lg:py-2 lg:pr-1">
      {/* ---------- The residence card ---------- */}
      <div className="fs-card tr-panel min-w-0 p-5 sm:p-7">
        {/* header: the floor, and the residence type */}
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

        {/* the residence types, numbered */}
        <div className="fs-rise mt-5 border-t border-[color-mix(in_srgb,var(--ribbon-main-gold)_16%,transparent)] pt-5">
          <UnitList value={unitId} onChange={setUnitId} />
        </div>

        {/* the plan, and its layout table, side by side */}
        <div className="mt-6 grid gap-6 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <PlanPanel key={unitId} unit={unit} />

          {/* ---------- the layout table ---------- */}
          <div className="flex min-w-0 flex-col">
            <h3 className="fs-rise fs-swap font-serif text-[1.15rem] leading-tight text-cream">{unit.label} Flat Layout</h3>
            <dl className="fs-rise mt-4 divide-y divide-[color-mix(in_srgb,var(--ribbon-main-gold)_16%,transparent)] border-t border-[color-mix(in_srgb,var(--ribbon-main-gold)_16%,transparent)]">
              {specRows.map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-4 py-1.5">
                  <dt className="font-sans text-[0.8rem] text-cream/65">{label}</dt>
                  <dd className={`fs-swap font-serif text-[0.9rem] tabular-nums ${value ? 'text-cream' : 'text-cream/40'}`}>{value ?? TBC}</dd>
                </div>
              ))}
            </dl>
            <button type="button" onClick={onEnquire} onPointerMove={glowAt} className="fs-rise tr-btn tr-btn--gold mn-glow mt-6 w-full justify-center text-[0.6875rem]">
              Request Price
              <IcArrow size={14} className="tr-arrow" />
            </button>
          </div>
        </div>

        {/* what makes the residence */}
        <div className="mt-6">
          <span className="fs-rise flex items-center gap-4">
            <span className="tr-dash" />
            <span className="tr-label">Residence highlights</span>
          </span>
          <ul className="mt-4 grid gap-x-6 gap-y-3.5 sm:grid-cols-3">
            {highlights.map(([Ic, main, sub]) => (
              <li key={main} className="fs-rise flex items-center gap-3.5">
                <span className="tr-tile h-10 w-10 shrink-0">
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
    </div>
  )
}

export default FloorStage
