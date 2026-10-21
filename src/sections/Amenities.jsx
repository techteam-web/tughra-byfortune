import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, fx, EASE, PAGE_IN, REDUCED, revealOnScroll } from '../motion/index.js'
import { BackControl, IconButton, Lockup } from '../ui/controls.jsx'
import RibbonStage from '../components/RibbonStage.jsx'
import { CORNER } from '../ui/layout.js'
import { glowAt } from '../ui/glow.js'
import { IcPrev, IcNext, IcExpand, IcCollapse, IcGrid, IcClose, IcPool, IcGym, IcStudio, IcBanquet, IcHall, IcTheatre, IcChess, IcPaddle, IcLeaf, IcDeck } from '../ui/icons.jsx'
import poolImg from '../assets/amenities/swimming-pool.webp'
import gym1Img from '../assets/amenities/gym-cam01.webp'
import gym2Img from '../assets/amenities/gym-cam02.webp'
import banquetImg from '../assets/amenities/banquet-hall-cam-03.webp'
import hallImg from '../assets/amenities/banquet-hall-cam-08.webp'
import theatreImg from '../assets/amenities/theater.webp'
import games1Img from '../assets/amenities/img-20260922-wa0014.webp'
import games2Img from '../assets/amenities/img-20260922-wa0016.webp'
import gardenImg from '../assets/amenities/podium-cam-01.webp'
import deckImg from '../assets/amenities/img-20260922-wa0019.webp'

// Add more entries here as amenity photos/copy come in - the progress lines,
// the counter, the grid and the keyboard stepping all size themselves.
const AMENITIES = [
  { title: 'Swimming Pool', description: 'Laps and lazy afternoons, suspended above the city.', image: poolImg, Icon: IcPool },
  { title: 'Fitness Centre', description: 'A fully equipped space to train, recover and stay at your best.', image: gym1Img, Icon: IcGym },
  { title: 'Fitness Studio', description: 'Open, light-filled and built for every kind of workout.', image: gym2Img, Icon: IcStudio },
  { title: 'Banquet Hall', description: 'An elegant venue for celebrations, events and gatherings.', image: banquetImg, Icon: IcBanquet },
  { title: 'Grand Hall', description: 'Flexible space that adapts to every occasion.', image: hallImg, Icon: IcHall },
  { title: 'Private Theatre', description: 'Cinema-grade viewing, reserved for residents.', image: theatreImg, Icon: IcTheatre },
  { title: 'Games Lounge', description: 'Chess, billiards and conversation in a relaxed social setting.', image: games1Img, Icon: IcChess },
  { title: 'Recreation Room', description: 'Table tennis, pool and more for friendly rivalry.', image: games2Img, Icon: IcPaddle },
  { title: 'Podium Garden', description: 'A landscaped retreat framed by open sky and greenery.', image: gardenImg, Icon: IcLeaf },
  { title: 'Podium Deck', description: 'Gardens, courts and pools, all within the podium.', image: deckImg, Icon: IcDeck },
]

const AUTOPLAY = 7 // seconds per amenity
const pad = (n) => String(n).padStart(2, '0')
const IMAGES = AMENITIES.map((a) => a.image)

function IconTile({ Icon, size = 'md' }) {
  const box = size === 'sm' ? 'h-10 w-10' : 'h-12 w-12'
  return (
    <span className={`tr-tile ${box}`}>
      <Icon size={size === 'sm' ? 18 : 21} />
    </span>
  )
}

function Amenities({ onClose }) {
  const [index, setIndex] = useState(0)
  const [full, setFull] = useState(false) // picture only: the panel and ribbon step aside
  const [grid, setGrid] = useState(false)
  const rootRef = useRef(null)
  const gridRef = useRef(null)
  const touchX = useRef(0)
  const total = AMENITIES.length
  const item = AMENITIES[index]

  const goNext = useCallback(() => setIndex((i) => (i + 1) % total), [total])
  const goPrev = useCallback(() => setIndex((i) => (i - 1 + total) % total), [total])

  // the panel's words and controls arrive after the stage
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: PAGE_IN })
      tl.add(fx.fade('.am-top', { y: -10 }), 0.4)
      tl.add(fx.fade('.am-seal', { y: 10 }), 0.6)
      tl.add(fx.fade('.am-num', { y: 8, stagger: 0.05, duration: 0.5 }), 0.85)
      tl.add(fx.fade('.am-name', { y: 10, stagger: 0.05 }), 0.95)
      tl.add(fx.fade('.am-foot', { y: 10 }), 1.3)
    }, rootRef)
    return () => ctx.revert()
  }, [])

  // the caption changes with a soft wipe; the line arrives late
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      fx.heading('.am-title', { delay: 0.1 })
      fx.fade('.am-icon', { y: 6, duration: 0.5, delay: 0.05 })
      fx.fade('.am-desc', { delay: 0.35, duration: 0.7 })
    }, rootRef)
    return () => ctx.revert()
  }, [index])

  // Autoplay: a gold line draws over seven seconds, then the next amenity comes in.
  // Paused while the picture-only view or the grid is open.
  useEffect(() => {
    const line = rootRef.current?.querySelector('[data-prog]')
    if (!line) return
    if (full || grid) {
      gsap.set(line, { scaleX: 1 })
      return
    }
    const t = gsap.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: AUTOPLAY, ease: 'none', onComplete: goNext })
    return () => t.kill()
  }, [index, full, grid, goNext])

  const closeGrid = (to) => {
    const done = () => {
      if (to !== undefined) setIndex(to)
      setGrid(false)
    }
    if (REDUCED) return done()
    gsap.to(gridRef.current, { autoAlpha: 0, duration: 0.45, ease: EASE.soft, onComplete: done })
  }

  useLayoutEffect(() => {
    if (!grid) return
    const ctx = gsap.context(() => {
      fx.show(gridRef.current, { duration: 0.6 })
      fx.fade('.ag-head', { stagger: 0.08, delay: 0.1 })
      fx.line('.ag-hair', { delay: 0.2 })
      revealOnScroll('.ag-card', { scroller: gridRef.current, stagger: 0.07 })
    }, gridRef)
    return () => ctx.revert()
  }, [grid])

  useEffect(() => {
    const onKey = (e) => {
      if (grid) {
        if (e.key === 'Escape') closeGrid()
        return
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext()
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev()
      if (e.key === 'f' || e.key === 'F') setFull((v) => !v)
      if (e.key === 'Escape') setFull(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div
      ref={rootRef}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (grid) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 50) (dx < 0 ? goNext : goPrev)()
      }}
    >
      <RibbonStage
        slides={IMAGES}
        active={index}
        bare={full}
        label="Amenities"
        photo="object-center"
        panel={
          <>
            <button type="button" onClick={onClose} aria-label="Back to menu" className="am-seal tr-focus shrink-0 self-start border-none bg-transparent p-0">
              <Lockup compact />
            </button>

            <div className="flex min-h-0 flex-1 flex-col justify-end side:justify-center">
              <span className="am-num flex items-center gap-4">
                <span className="tr-num">03</span>
                <span className="tr-dash" />
                <span className="tr-label">Amenities</span>
              </span>

              {/* wide screens: the ten amenities as menu entries with the golden hover */}
              <ul className="mt-4 hidden flex-col gap-px side:flex short:mt-1">
                {AMENITIES.map((a, i) => {
                  const on = i === index
                  return (
                    <li key={a.title}>
                      <button
                        type="button"
                        onClick={() => setIndex(i)}
                        onPointerMove={glowAt}
                        aria-pressed={on}
                        className={`mn-glow tr-focus flex w-full max-w-[20rem] touch-manipulation items-center rounded-lg border-none bg-transparent py-[clamp(0.3rem,0.9svh,0.55rem)] pl-3 pr-2.5 text-left short:py-[0.12rem] ${on ? 'is-on' : ''}`}
                      >
                        <span className="am-num tr-num w-8 shrink-0">{pad(i + 1)}</span>
                        <span className={`tr-dash mr-6 transition-[width,background-color] duration-500 ${on ? 'w-6 bg-[var(--ribbon-champagne)]' : ''}`} />
                        <span className={`am-name min-w-0 flex-1 truncate font-sans text-[0.75rem] uppercase tracking-[0.18em] transition-colors duration-300 short:text-[0.625rem] ${on ? 'text-[var(--ribbon-champagne)]' : 'text-cream'}`}>{a.title}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>

              {/* the chosen amenity */}
              <div className="mt-5 min-w-0 side:mt-6 short:mt-1">
                <div className="flex items-center gap-4">
                  <span className="am-icon block short:hidden">
                    <IconTile Icon={item.Icon} />
                  </span>
                  <h2 className="tr-display min-w-0 text-[clamp(1.6rem,2.1vw,2.1rem)] short:text-[1.05rem]">
                    <span className="am-title block truncate pb-0.5">{item.title}</span>
                  </h2>
                </div>
                <p className="am-desc mt-3 max-w-[22rem] text-[0.875rem] leading-[1.7] text-cream/80 short:hidden">{item.description}</p>
              </div>
            </div>

            {/* arrows, the count, and the autoplay line */}
            <div className="am-foot mt-4 shrink-0 side:mt-0">
              <div className="flex items-center gap-3">
                <IconButton label="Previous amenity" onClick={goPrev} small>
                  <IcPrev size={16} />
                </IconButton>
                <IconButton label="Next amenity" onClick={goNext} small>
                  <IcNext size={16} />
                </IconButton>
                <span className="ml-2 flex items-center gap-3">
                  <span className="tr-num text-[var(--ribbon-champagne)]">{pad(index + 1)}</span>
                  <span className="tr-dash" />
                  <span className="tr-num">{pad(total)}</span>
                </span>
              </div>
              <span className="mt-4 block h-px w-full max-w-[20rem] bg-cream/25 short:mt-2">
                <span data-prog className="block h-full origin-left bg-[var(--ribbon-champagne)]" />
              </span>
            </div>
          </>
        }
      >
        <div className={`am-top ${CORNER}`}>
          {!full && (
            <IconButton label="All amenities" onClick={() => setGrid(true)}>
              <IcGrid size={18} />
            </IconButton>
          )}
          <IconButton label={full ? 'Show details (Esc)' : 'Picture only (F)'} onClick={() => setFull((v) => !v)} active={full}>
            {full ? <IcCollapse size={18} /> : <IcExpand size={18} />}
          </IconButton>
          <BackControl onClick={onClose} />
        </div>
      </RibbonStage>

      {/* ---------- Every amenity, as cards ---------- */}
      {grid && (
        <div ref={gridRef} className="fixed inset-0 z-[60] overflow-y-auto bg-[color-mix(in_srgb,var(--espresso)_74%,transparent)] backdrop-blur-xl" style={{ backgroundImage: 'var(--grain)' }} role="dialog" aria-modal="true" aria-label="All amenities">
          <div className="sticky top-0 z-10 flex items-end justify-between gap-4 bg-[color-mix(in_srgb,var(--espresso)_70%,transparent)] px-5 pb-5 pt-[max(1.5rem,var(--safe-t))] backdrop-blur-md sm:px-8 side:px-[2.9rem] side:pt-[2.7rem]">
            <div>
              <span className="ag-head flex items-center gap-4">
                <span className="tr-num">03</span>
                <span className="tr-dash" />
                <span className="tr-label">Amenities</span>
              </span>
              <h2 className="ag-head tr-display mt-3 text-[clamp(2rem,3vw,3rem)]">Refined luxury</h2>
            </div>
            <IconButton label="Close" onClick={() => closeGrid()}>
              <IcClose size={17} />
            </IconButton>
            <i className="ag-hair tr-hair absolute inset-x-5 bottom-0 sm:inset-x-8 side:inset-x-[2.9rem]" />
          </div>

          <div className="grid grid-cols-1 gap-4 px-5 pb-[max(2rem,var(--safe-b))] pt-8 sm:grid-cols-2 sm:px-8 md:gap-5 side:px-[2.9rem] lg:grid-cols-3 xl:grid-cols-4">
            {AMENITIES.map((a, i) => (
              <button
                key={a.title}
                type="button"
                onClick={() => closeGrid(i)}
                onPointerMove={glowAt}
                className="ag-card mn-glow tr-focus group flex touch-manipulation flex-col rounded-[0.9rem] bg-[color-mix(in_srgb,var(--espresso)_55%,transparent)] p-2.5 text-left shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--ribbon-main-gold)_22%,transparent)]"
              >
                <span className="relative block aspect-[4/3] w-full overflow-hidden rounded-[0.55rem]">
                  <img src={a.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]" draggable={false} />
                  <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-espresso/85 to-transparent" />
                  <span className="tr-num absolute bottom-3 right-4 text-[var(--ribbon-champagne)]">{pad(i + 1)}</span>
                </span>
                <span className="flex items-start gap-4 px-2.5 pb-3 pt-4">
                  <IconTile Icon={a.Icon} size="sm" />
                  <span className="min-w-0">
                    <span className="tr-display block text-[1.3rem] transition-colors duration-300 group-hover:text-[var(--ribbon-champagne)]">{a.title}</span>
                    <span className="mt-1.5 block text-[0.8125rem] leading-[1.6] text-cream/75">{a.description}</span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Amenities
