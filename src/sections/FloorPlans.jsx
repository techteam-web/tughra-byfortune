import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gsap, fx, EASE, PAGE_IN, REDUCED } from '../motion/index.js'
import { glowAt } from '../ui/glow.js'
import { Lockup, MenuControl } from '../ui/controls.jsx'
import IsoTurntable from '../components/IsoTurntable.jsx'
import TowerFloorPicker from '../components/TowerFloorPicker.jsx'
import { IcBack, IcLayers as IcPlan } from '../ui/icons.jsx'
import { UNITS } from '../components/floorUnits.js'
import { TOWER_FLOORS } from '../components/towerFloors.js'

// What each level of the tower is comes from towerFloors.js. Only residences open the plans
// (floor plan and isometric); the lobby, parking, amenities and the terrace show their name
// when pointed at, and nothing else.
const isResidence = (floor) => floor?.kind === 'residence'
const KIND_LABEL = { lobby: 'Entrance', parking: 'Parking', amenity: 'Amenities', terrace: 'Terrace', residence: 'Floor' }
const KIND_NOTE = {
  lobby: 'The entrance lobby. No residences on this level.',
  parking: 'Car parking for residents. No residences on this level.',
  amenity: 'Amenities for residents. No residences on this level.',
  terrace: 'The terrace, above the residences.',
}
const DEFAULT_FLOOR = '_17th'

// The tower as an orbit: /public/towerframes/001.webp ... 100.webp, the beauty pass of the
// "Fortune Day view" render (0000-0099; 0100 repeats 0000), at 1600px as WebP with the sky
// left transparent so the parchment shows behind it. Drag or scroll to fly round it; its
// floors are picked through the per-frame floor maps (see TowerFloorPicker).
const TOWER_FRAMES = Array.from({ length: 100 }, (_, i) => `/towerframes/${String(i + 1).padStart(3, '0')}.webp`)
// It never spins round and round: from the first frame it turns half way round either way, to the
// back of the tower, and stops there - one full turn end to end - so from either end it turns back
const TOWER_TURN = [-TOWER_FRAMES.length / 2, TOWER_FRAMES.length / 2]

// The reference's paper sidebar and layout table, with the tower in the middle. Clicking
// a floor on the tower opens the plan page: a big plan, a small residence list on its
// left, and the floor plan / isometric switch underneath - all on the same beige ground.
function FloorPlans({ onClose }) {
  const floors = TOWER_FLOORS
  const [selectedFloor, setSelectedFloor] = useState(DEFAULT_FLOOR)
  const [hoveredFloor, setHoveredFloor] = useState(null)
  const [unitId, setUnitId] = useState(UNITS.find((u) => u.iso)?.id ?? UNITS[0].id)
  const [planView, setPlanView] = useState('2d') // '2d' (floor plan) or 'iso' (isometric)
  const [zoomOpen, setZoomOpen] = useState(false)
  const rootRef = useRef(null)
  const zoomRef = useRef(null)
  const unit = UNITS.find((u) => u.id === unitId)
  const activeSrc = unit[planView === '2d' ? 'plan2d' : 'iso']
  const planLabel = planView === '2d' ? 'floor plan' : 'isometric plan'

  // Entrance: the tower rises from the ground up, as it was built; then its floor reads out
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: PAGE_IN })
      tl.add(fx.fade('.fp2-top', { y: -10 }), 0)
      tl.add(fx.fade('.fp2-aside-l > *', { y: 10, stagger: 0.07 }), 0.15)
      tl.add(fx.show('.fp2-stage', { duration: 0.6 }), 0.2)
      if (!REDUCED) tl.fromTo('.fp2-tower', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.3)
      tl.add(fx.fade('.fp2-read > *', { y: 18, stagger: 0.09 }), 1.3)
      tl.add(fx.fade('.fp2-strip > *', { y: -10, stagger: 0.1 }), 1.1)
      tl.add(fx.fade('.fp2-aside-r > *', { y: 10, stagger: 0.07 }), 0.5)
      tl.add(fx.fade('.fp2-foot', { y: 10 }), 0.7)
    }, rootRef)
    return () => ctx.revert()
  }, [])

  // The floor read-out: the floor under the cursor, or the one last chosen
  const readId = hoveredFloor ?? selectedFloor
  const readFloor = floors.find((f) => f.id === readId)
  const readNum = readFloor?.num ?? ''
  const openable = floors.filter(isResidence).length
  const readKind = readFloor?.kind ?? 'residence'

  // moving between floors, the numeral rolls over to the new one
  useLayoutEffect(() => {
    if (!readId || REDUCED) return
    gsap.fromTo('.fp2-num', { yPercent: 22, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: EASE.enter, overwrite: 'auto' })
  }, [readId])

  // Unit or tab changed: the plan and the table cross-fade in place
  useLayoutEffect(() => {
    // direct children only: the turntable owns the opacity of its own stacked frames
    gsap.fromTo('.fp2-big > img', { opacity: 0 }, { opacity: 1, duration: REDUCED ? 0.2 : 0.6, ease: EASE.move, overwrite: 'auto' })
    gsap.fromTo('.fp2-swap', { opacity: 0.2, y: 3 }, { opacity: 1, y: 0, duration: REDUCED ? 0.2 : 0.45, ease: EASE.soft, stagger: 0.02, overwrite: 'auto' })
  }, [unitId, planView])

  const openFloor = (id) => {
    if (!isResidence(floors.find((f) => f.id === id))) return
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

  return (
    <section ref={rootRef} className="relative isolate flex h-svh w-full flex-col overflow-hidden bg-[var(--cream)] text-[var(--ink)]">
      {/* ---------- Top: the logo on the left exactly where the home page has it (back to the menu) ---------- */}
      <header className="fp2-top flex items-start justify-between px-6 pt-6 md:px-12 md:pt-10">
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
          <p className="mt-5 hidden max-w-[18rem] font-sans text-[0.85rem] leading-relaxed text-[var(--ink-soft)] lg:block">4 &amp; 5 BHK residences, each with panoramic views over the city skyline and the sea.</p>
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
            {/* ---- the tower on a parchment field - a step in tone, not an outline or a shadow -
                 with its floors as switches, and the floor under the cursor read out beside it ---- */}
            <div className="absolute inset-0 overflow-hidden bg-[var(--parchment)] p-3">
              {/* the left of the card: the tower in figures at the top, then the read-out - the
                  floor number at poster size, live as the cursor moves, its name and the way in; the
                  hand passes through it to the tower, which runs in under its right side, bar the button */}
              <div className="pointer-events-none absolute inset-y-8 left-10 z-10 hidden w-[44%] flex-col lg:flex">
                <div className="fp2-strip flex flex-col">
                  <span className="font-sans text-[0.68rem] uppercase tracking-[0.2em] text-[var(--bronze-deep)]">Elevation</span>
                  <span className="mt-1.5 font-serif text-[1.2rem] leading-none text-[var(--ink)]">
                    {floors.length || ''} levels<span className="text-[var(--ink-soft)]"> · {openable || ''} to explore</span>
                  </span>
                </div>

                <div className="fp2-read my-auto ml-[clamp(2rem,5vw,5rem)] flex flex-col items-start" aria-live="polite">
                  <span className="font-sans text-[0.9rem] text-[var(--ink-soft)]">{readKind === 'residence' ? 'Floor' : KIND_LABEL[readKind]}</span>
                  <span className="overflow-hidden">
                    <span key={readId} className="fp2-num block font-serif text-[clamp(5.5rem,9vw,9rem)] leading-[0.9] tracking-[-0.03em] text-[var(--bronze-deep)]">
                      {readNum}
                    </span>
                  </span>
                  {readKind === 'residence' ? (
                    <>
                      <span className="mt-6 font-sans text-[0.9rem] leading-snug text-[var(--ink-soft)]">
                        Choose a floor on the tower
                        <br />
                        to see its plans.
                      </span>
                      <button
                        type="button"
                        onClick={() => readFloor && openFloor(readFloor.id)}
                        onPointerMove={glowAt}
                        className="mn-glow tr-focus pointer-events-auto mt-5 rounded-full bg-[var(--ink)] px-5 py-2.5 font-sans text-[0.85rem] text-[var(--cream)] transition-colors duration-300 hover:bg-[var(--bronze-deep)]"
                      >
                        Open plans
                      </button>
                    </>
                  ) : (
                    <span className="mt-6 max-w-[12rem] font-sans text-[0.9rem] leading-snug text-[var(--ink-soft)]">{KIND_NOTE[readKind]}</span>
                  )}
                </div>
              </div>

              {/* the tower: centred on small screens, on the right of the card from lg */}
              <div className="flex h-full w-full items-center justify-center overflow-hidden lg:justify-end lg:pr-[11%]">
                {/* the city around the tower fades out at the sides and below rather than stopping at a
                    hard edge; from lg the tower is lifted a little, its street dissolving into the card,
                    and its field kept to the right of the read-out - narrowing it only trims the city */}
                <div
                  className="fp2-tower relative h-full max-w-full select-none overflow-hidden lg:max-w-[56%] lg:-translate-y-[5%]"
                  style={{
                    aspectRatio: '3 / 4',
                    maskImage: 'linear-gradient(to right, transparent, #000 14%, #000 86%, transparent), linear-gradient(to bottom, #000 82%, transparent)',
                    maskComposite: 'intersect',
                    WebkitMaskComposite: 'source-in',
                  }}
                >
                  <TowerFloorPicker
                    frames={TOWER_FRAMES}
                    range={TOWER_TURN}
                    floors={floors}
                    selected={selectedFloor}
                    hovered={hoveredFloor}
                    pickable={isResidence}
                    onHover={setHoveredFloor}
                    onPick={openFloor}
                    alt="Tughra tower"
                    fill="var(--parchment)"
                    className="h-full w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Right: the layout, kept small and held in its own card ---------- */}
        <aside className="fp2-aside-r min-h-0 min-w-0 lg:self-center">
          {/* a step darker than the page, so it reads as its own surface without an outline */}
          <div className="rounded-lg bg-[var(--parchment)] px-5 py-4">
            <h2 className="fp2-swap font-serif text-[1.15rem] leading-none text-[var(--ink)]">{unit.label} layout</h2>
            <dl className="mt-3 divide-y divide-[var(--ink)]/10">
              {specRows.map(({ label, value }) => (
                <div key={label} className="flex items-baseline justify-between gap-3 py-[0.42rem]">
                  <dt className="font-sans text-[0.82rem] text-[var(--ink)]">{label}</dt>
                  <dd className={`fp2-swap shrink-0 font-sans text-[0.82rem] ${value ? 'text-[var(--ink)]' : 'text-[var(--ink-soft)]'}`}>{value ?? 'To be confirmed'}</dd>
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
              <button type="button" onClick={closeZoom} onPointerMove={glowAt} aria-label="Back to the tower" className="mn-glow tr-focus flex h-10 w-10 items-center justify-center rounded-full border border-[var(--ink)]/20 bg-[color-mix(in_srgb,var(--cream)_92%,transparent)] text-[var(--ink)]">
                <IcBack size={16} />
              </button>
              <MenuControl onClick={onClose} />
            </header>

            {/* the residence types, over the plan on the left */}
            <aside className="relative z-10 mt-auto mb-auto w-fit px-5 sm:px-8 side:px-[2.9rem]">
              <div className="rounded-lg border border-[var(--bronze)]/25 bg-[color-mix(in_srgb,var(--cream)_92%,transparent)] px-4 py-3">
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
              <div className="flex items-center gap-1 rounded-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--cream)_92%,transparent)] p-1">
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
