import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gsap, fx, EASE, PAGE_IN, REDUCED } from '../motion/index.js'
import { glowAt } from '../ui/glow.js'
import BrandMark from '../components/BrandMark.jsx'
import { IcArrow, IcPrev, IcExpand, IcClose, IcLayers as IcPlan } from '../ui/icons.jsx'
import { UNITS } from '../components/floorUnits.js'

const TBC = 'To be confirmed'

// A light "paper" take on the residence browser, built to the brief's reference
// almost stroke for stroke: a plain text sidebar (no tower, no floor picker - just
// the unit types), a torn sheet holding the render, and a layout table opposite it.
// Still Tughra's own tokens throughout (--cream/--ink/--bronze), not borrowed colours.
function FloorPlans({ onClose, onEnquire, onPrev, onNext }) {
  const [unitId, setUnitId] = useState(UNITS.find((u) => u.iso)?.id ?? UNITS[0].id)
  const [planView, setPlanView] = useState('iso')
  const [zoomOpen, setZoomOpen] = useState(false)
  const rootRef = useRef(null)
  const zoomRef = useRef(null)
  const unit = UNITS.find((u) => u.id === unitId)
  const activeSrc = unit[planView === '2d' ? 'plan2d' : 'iso']
  const planLabel = planView === '2d' ? 'floor plan' : 'isometric plan'

  // Entrance
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: PAGE_IN })
      tl.add(fx.fade('.fp2-top', { y: -10 }), 0)
      tl.add(fx.fade('.fp2-aside-l > *', { y: 10, stagger: 0.07 }), 0.15)
      tl.add(fx.panel('.fp2-card'), 0.25)
      tl.add(fx.fade('.fp2-aside-r > *', { y: 10, stagger: 0.07 }), 0.4)
      tl.add(fx.fade('.fp2-foot', { y: 10 }), 0.6)
    }, rootRef)
    return () => ctx.revert()
  }, [])

  // Unit or tab changed: the render and the table cross-fade in place
  useLayoutEffect(() => {
    gsap.fromTo('.fp2-plan img', { opacity: 0 }, { opacity: 1, duration: REDUCED ? 0.2 : 0.6, ease: EASE.move, overwrite: 'auto' })
    gsap.fromTo('.fp2-swap', { opacity: 0.2, y: 3 }, { opacity: 1, y: 0, duration: REDUCED ? 0.2 : 0.45, ease: EASE.soft, stagger: 0.02, overwrite: 'auto' })
  }, [unitId, planView])

  const closeZoom = () => gsap.to(zoomRef.current, { autoAlpha: 0, duration: REDUCED ? 0.1 : 0.4, ease: EASE.soft, onComplete: () => setZoomOpen(false) })

  useEffect(() => {
    if (!zoomOpen) return
    const onKey = (e) => e.key === 'Escape' && closeZoom()
    window.addEventListener('keydown', onKey)
    gsap.fromTo(zoomRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: REDUCED ? 0.15 : 0.5, ease: EASE.soft })
    gsap.fromTo(zoomRef.current.querySelector('.fz-frame'), { opacity: 0, scale: 0.985 }, { opacity: 1, scale: 1, duration: REDUCED ? 0.15 : 0.7, ease: EASE.soft, delay: 0.1 })
    return () => window.removeEventListener('keydown', onKey)
  }, [zoomOpen])

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

  return (
    <section ref={rootRef} className="relative isolate flex min-h-svh w-full flex-col bg-[var(--cream)] text-[var(--ink)]">
      {/* ---------- Top: menu, the seal, enquire ---------- */}
      <header className="fp2-top flex items-center justify-between px-5 pt-[max(1.25rem,var(--safe-t))] sm:px-10 sm:pt-8">
        <button type="button" onClick={onClose} onPointerMove={glowAt} className="mn-glow tr-focus flex items-center gap-2.5 rounded-md border-none bg-transparent p-1 font-sans text-[0.7rem] uppercase tracking-[0.2em] text-[var(--ink-soft)]">
          <span className="flex flex-col gap-[3px]" aria-hidden="true">
            <span className="block h-px w-4 bg-current" />
            <span className="block h-px w-4 bg-current" />
          </span>
          Menu
        </button>
        <BrandMark tone="dark" size="seal" credit={false} seal />
        <button type="button" onClick={onEnquire} onPointerMove={glowAt} className="mn-glow tr-focus rounded-md bg-[var(--bronze-deep)] px-5 py-2.5 font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[var(--cream)]">
          Enquire
        </button>
      </header>

      {/* ---------- Body: text sidebar, the render, the layout table ---------- */}
      <div className="grid min-h-0 flex-1 gap-10 px-5 pb-28 pt-10 sm:px-10 lg:grid-cols-[17rem_minmax(0,1fr)_17rem] lg:items-center lg:gap-12 xl:grid-cols-[19rem_minmax(0,1fr)_19rem]">
        {/* ---------- Left: what this is, and the unit types ---------- */}
        <aside className="fp2-aside-l">
          <span className="block font-sans text-[0.7rem] uppercase tracking-[0.24em] text-[var(--bronze-deep)]">Residences</span>
          <h1 className="mt-4 font-serif text-[clamp(2.2rem,3.2vw,2.9rem)] leading-[1.05]" style={{ color: 'var(--ink)' }}>
            Homes
            <br />
            Designed
            <br />
            to Inspire
          </h1>
          <p className="mt-5 max-w-[18rem] font-sans text-[0.85rem] leading-relaxed text-[var(--ink-soft)]">3, 4, 5 &amp; 6 BHK residences, each with panoramic views over the city skyline and the sea.</p>
          <ul className="mt-9 flex flex-col gap-5">
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

        {/* ---------- Middle: the render, on a torn sheet ---------- */}
        <div className="flex min-w-0 flex-col items-center">
          <div className="mb-5 flex items-center gap-1 rounded-full border border-[var(--ink)]/12 bg-white/60 p-1">
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
                className={`mn-glow tr-focus rounded-full px-4 py-1.5 font-sans text-[0.65rem] uppercase tracking-[0.14em] transition-colors duration-300 ${
                  planView === v ? 'bg-[var(--bronze-deep)] text-[var(--cream)]' : 'text-[var(--ink-soft)]'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            onPointerMove={glowAt}
            aria-label={activeSrc ? `View the ${unit.label} ${planLabel} larger` : `${unit.label} ${planLabel} coming soon`}
            className="fp2-card tr-torn tr-focus group relative w-full max-w-[30rem] overflow-hidden bg-white p-3 shadow-[0_1.75rem_3.5rem_-1.5rem_rgba(42,28,18,0.4)]"
          >
            <span className="fp2-plan block aspect-[4/5] w-full overflow-hidden">
              {activeSrc ? (
                <img src={activeSrc} alt={`${unit.label} ${planLabel}`} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]" draggable={false} />
              ) : (
                <span className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[color-mix(in_srgb,var(--cream)_60%,var(--parchment))] text-center">
                  <IcPlan size={24} className="text-[var(--ink-soft)]/50" />
                  <span className="font-sans text-[0.625rem] uppercase tracking-[0.18em] text-[var(--ink-soft)]/60">Coming soon</span>
                </span>
              )}
            </span>
            <span className="pointer-events-none absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-[var(--ink)] shadow-[0_0.3rem_0.8rem_rgba(42,28,18,0.18)]">
              <IcExpand size={14} />
            </span>
          </button>
        </div>

        {/* ---------- Right: the layout table ---------- */}
        <aside className="fp2-aside-r min-w-0">
          <div className="flex items-start justify-between gap-4">
            <h2 className="fp2-swap font-serif text-[1.4rem] leading-tight text-[var(--ink)]">
              {unit.label}
              <br />
              Flat Layout
            </h2>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-[var(--ink)]/15 text-[var(--bronze-deep)]">
              <IcPlan size={18} />
            </span>
          </div>
          <dl className="mt-6 divide-y divide-[var(--ink)]/10 border-t border-[var(--ink)]/10">
            {specRows.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="font-sans text-[0.8rem] text-[var(--ink-soft)]">{label}</dt>
                <dd className={`fp2-swap font-serif text-[0.9rem] ${value ? 'text-[var(--ink)]' : 'text-[var(--ink-soft)]/70'}`}>{value ?? TBC}</dd>
              </div>
            ))}
          </dl>
          <button type="button" onClick={onEnquire} onPointerMove={glowAt} className="mn-glow tr-focus mt-7 w-full rounded-md bg-[var(--bronze-deep)] py-3 text-center font-sans text-[0.7rem] uppercase tracking-[0.2em] text-[var(--cream)]">
            Request Price
          </button>
        </aside>
      </div>

      {/* ---------- Foot: where this sits, and the way through ---------- */}
      <div className="fp2-foot absolute inset-x-0 bottom-0 z-10 flex items-center justify-between px-5 pb-[max(1.5rem,var(--safe-b))] sm:px-10">
        <span className="flex items-center gap-3 font-sans text-[0.7rem] uppercase tracking-[0.2em] text-[var(--ink-soft)]">
          <span className="tabular-nums text-[var(--ink)]">04</span>
          <span className="h-px w-6 bg-[var(--ink)]/25" aria-hidden="true" />
          <span className="tabular-nums">07</span>
          <span className="ml-1">Residences</span>
        </span>
        <span className="flex items-center gap-3">
          <button type="button" onClick={onPrev} onPointerMove={glowAt} aria-label="Previous section" className="mn-glow tr-focus flex h-9 w-9 items-center justify-center rounded-full border border-[var(--ink)]/20 text-[var(--ink)]">
            <IcPrev size={14} />
          </button>
          <button
            type="button"
            onClick={onNext}
            onPointerMove={glowAt}
            className="mn-glow tr-focus flex items-center gap-2 rounded-full border border-[var(--ink)]/25 px-5 py-2 font-sans text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ink)]"
          >
            Neighborhood
            <IcArrow size={13} className="tr-arrow" />
          </button>
        </span>
      </div>

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
              <span className="hidden font-sans text-[0.7rem] uppercase tracking-[0.2em] text-cream/80 sm:inline">
                {unit.label} {planLabel}
              </span>
              <button type="button" onClick={closeZoom} aria-label="Close" className="tr-icon-btn mn-glow">
                <IcClose size={17} />
              </button>
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
    </section>
  )
}

export default FloorPlans
