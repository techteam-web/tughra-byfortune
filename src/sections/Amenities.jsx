import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, fx, EASE, PAGE_IN, REDUCED, revealOnScroll } from '../motion/index.js'
import { TopBar, BackControl, IconButton, Corners } from '../ui/controls.jsx'
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

function IconTile({ Icon, size = 'md' }) {
  const box = size === 'sm' ? 'h-10 w-10' : 'h-12 w-12'
  return (
    <span className={`flex ${box} shrink-0 items-center justify-center rounded-tile border border-bronze/50 bg-bronze/12 text-gold-pale`}>
      <Icon size={size === 'sm' ? 18 : 21} />
    </span>
  )
}

function Amenities({ onClose }) {
  const [index, setIndex] = useState(0)
  const [full, setFull] = useState(false) // picture only, in the app
  const [grid, setGrid] = useState(false)
  const sectionRef = useRef(null)
  const gridRef = useRef(null)
  const progRef = useRef(null)
  const touchX = useRef(0)
  const firstShow = useRef(true)
  const total = AMENITIES.length
  const item = AMENITIES[index]

  const goNext = useCallback(() => setIndex((i) => (i + 1) % total), [total])
  const goPrev = useCallback(() => setIndex((i) => (i - 1 + total) % total), [total])

  // Entrance
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: PAGE_IN })
      tl.add(fx.show('.am-stage', { duration: 1.1 }), 0)
      tl.add(fx.fade('.tb-anim', { y: -10 }), 0.15)
      tl.add(fx.fade('.am-chrome', { stagger: 0.08 }), 0.3)
      tl.add(fx.panel('.am-card'), 0.45)
      tl.add(fx.corners('.am-card .tr-corner'), 0.7)
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  // The chosen photograph crossfades in and drifts 3% while it is shown
  useLayoutEffect(() => {
    const root = sectionRef.current
    const on = root.querySelector(`[data-am="${index}"]`)
    root.querySelectorAll('[data-am]').forEach((el) => {
      if (el !== on) gsap.to(el, { opacity: 0, duration: REDUCED ? 0.2 : 1.1, ease: EASE.move, overwrite: 'auto' })
    })
    gsap.to(on, { opacity: 1, duration: firstShow.current ? 0 : REDUCED ? 0.2 : 1.1, ease: EASE.move, overwrite: 'auto' })
    firstShow.current = false
    if (!REDUCED) gsap.fromTo(on.querySelector('img'), { scale: 1 }, { scale: 1.03, duration: AUTOPLAY + 1, ease: 'power1.out', overwrite: 'auto' })
  }, [index])

  // The card's words change with a soft wipe; the line arrives late
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      fx.heading('.am-title', { delay: 0.1 })
      fx.fade('.am-count', { y: 6, duration: 0.5 })
      fx.fade('.am-icon', { y: 6, duration: 0.5, delay: 0.05 })
      fx.fade('.am-desc', { delay: 0.35, duration: 0.7 })
    }, sectionRef)
    return () => ctx.revert()
  }, [index])

  // Autoplay: the active progress line draws over seven seconds, then the next amenity comes in.
  // Paused while the picture-only view or the grid is open.
  useEffect(() => {
    const line = progRef.current?.querySelector(`[data-prog="${index}"]`)
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

  const hide = full ? 'pointer-events-none opacity-0' : ''

  return (
    <section
      ref={sectionRef}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (grid) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 50) (dx < 0 ? goNext : goPrev)()
      }}
      className="relative h-svh w-full overflow-hidden bg-espresso text-cream"
    >
      {/* The photograph is the page: every amenity stacked, the chosen one crossfades in */}
      <div className="am-stage absolute inset-0">
        {AMENITIES.map((a, i) => (
          <div key={a.title} data-am={i} className="absolute inset-0 overflow-hidden" style={{ opacity: 0 }}>
            <img src={a.image} alt={i === index ? a.title : ''} className={`absolute inset-0 h-full w-full transition-[opacity] duration-500 ${full ? 'object-contain' : 'object-cover'}`} draggable={false} />
          </div>
        ))}
      </div>

      {/* espresso at the top for the logo, and at the foot for the card */}
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${full ? 'opacity-0' : ''}`}
        style={{ background: 'linear-gradient(180deg, var(--scrim) 0%, transparent 34%), linear-gradient(0deg, var(--espresso) 0%, var(--scrim) 16%, transparent 48%)' }}
      />

      <TopBar onBrand={onClose}>
        <div className="am-chrome flex items-center gap-2.5 md:gap-3">
          <IconButton label="All amenities" onClick={() => setGrid(true)} className={`transition-opacity duration-500 ${hide}`}>
            <IcGrid size={18} />
          </IconButton>
          <IconButton label={full ? 'Show details' : 'Picture only (F)'} onClick={() => setFull((v) => !v)} active={full}>
            {full ? <IcCollapse size={18} /> : <IcExpand size={18} />}
          </IconButton>
          <span className="ml-1">
            <BackControl onClick={onClose} />
          </span>
        </div>
      </TopBar>

      {/* Arrows */}
      <div className="am-chrome pointer-events-none absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 items-center justify-between px-3 md:px-8">
        <IconButton label="Previous amenity" onClick={goPrev} className="pointer-events-auto">
          <IcPrev size={18} />
        </IconButton>
        <IconButton label="Next amenity" onClick={goNext} className="pointer-events-auto">
          <IcNext size={18} />
        </IconButton>
      </div>

      {/* The card on the left, the run of amenities on the right */}
      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className={`flex flex-col gap-4 px-4 pb-[max(1rem,var(--safe-b))] transition-opacity duration-500 sm:px-8 md:flex-row md:items-end md:justify-between md:gap-10 md:px-12 md:pb-9 short:flex-row short:items-end short:gap-5 short:pb-3 ${hide}`}>
          <article className="am-card tr-panel w-full p-5 md:w-[27rem] md:p-6 short:w-[22rem] short:p-3.5">
            <Corners />
            <div className="flex items-start gap-4">
              <span className="am-icon block">
                <IconTile Icon={item.Icon} />
              </span>
              <div className="min-w-0 flex-1">
                <span className="am-count tr-label flex items-center gap-3">
                  <span className="text-gold">{pad(index + 1)}</span>
                  <i className="tr-hair block w-7 bg-bronze" />
                  <span className="text-parchment/70">{pad(total)}</span>
                </span>
                <h2 className="mt-2 font-serif text-[clamp(1.6rem,2.2vw,2.15rem)] font-normal leading-[1.1] text-cream short:text-[1.2rem]">
                  <span className="am-title block truncate pb-0.5">{item.title}</span>
                </h2>
              </div>
            </div>
            <p className="am-desc mt-3 text-[0.875rem] leading-[1.7] text-parchment short:hidden">{item.description}</p>
          </article>

          <div ref={progRef} className="am-chrome flex items-center gap-1.5 self-center md:gap-2 md:self-end md:pb-2" role="tablist" aria-label="Amenities">
            {AMENITIES.map((a, i) => {
              const on = i === index
              return (
                <button
                  key={a.title}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-label={a.title}
                  onClick={() => setIndex(i)}
                  className="tr-focus flex h-7 items-center border-none bg-transparent p-0"
                >
                  <span
                    className="relative block h-px overflow-hidden bg-parchment/30 transition-[width] duration-700"
                    style={{ width: on ? 'clamp(1.8rem,3.2vw,2.8rem)' : 'clamp(0.75rem,1.4vw,1.4rem)' }}
                  >
                    {on && <span data-prog={i} className="absolute inset-0 origin-left bg-gold" />}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ---------- Every amenity, as cards ---------- */}
      {grid && (
        <div ref={gridRef} className="absolute inset-0 z-40 overflow-y-auto bg-espresso" role="dialog" aria-modal="true" aria-label="All amenities">
          <div className="sticky top-0 z-10 flex items-end justify-between gap-4 bg-espresso px-5 pb-5 pt-[max(1.5rem,var(--safe-t))] sm:px-8 md:px-12 md:pt-9">
            <div>
              <span className="ag-head tr-label block">Amenities</span>
              <h2 className="ag-head mt-2 font-serif text-[clamp(2rem,3vw,3rem)] font-normal leading-none text-cream">Refined luxury</h2>
            </div>
            <IconButton label="Close" onClick={() => closeGrid()}>
              <IcClose size={17} />
            </IconButton>
            <i className="ag-hair tr-hair absolute inset-x-5 bottom-0 sm:inset-x-8 md:inset-x-12" />
          </div>

          <div className="grid grid-cols-1 gap-4 px-5 pb-[max(2rem,var(--safe-b))] pt-8 sm:grid-cols-2 sm:px-8 md:gap-5 md:px-12 lg:grid-cols-3 xl:grid-cols-4">
            {AMENITIES.map((a, i) => (
              <button
                key={a.title}
                type="button"
                onClick={() => closeGrid(i)}
                className="ag-card tr-panel is-flat tr-focus group flex flex-col overflow-hidden p-0 text-left"
              >
                <span className="relative block aspect-[4/3] w-full overflow-hidden">
                  <img src={a.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]" draggable={false} />
                  <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-espresso/85 to-transparent" />
                  <span className="tr-label absolute bottom-3 right-4 text-gold-pale/80">{pad(i + 1)}</span>
                </span>
                <span className="flex items-start gap-4 p-5">
                  <IconTile Icon={a.Icon} size="sm" />
                  <span className="min-w-0">
                    <span className="block font-serif text-[1.35rem] leading-tight text-cream transition-colors duration-300 group-hover:text-gold-pale">{a.title}</span>
                    <span className="mt-1.5 block text-[0.8125rem] leading-[1.6] text-parchment/85">{a.description}</span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default Amenities
