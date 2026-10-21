import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, fx, EASE, PAGE_IN, REDUCED, revealOnScroll } from '../motion/index.js'
import { BackControl, IconButton, Lockup } from '../ui/controls.jsx'
import RibbonStage from '../components/RibbonStage.jsx'
import { CORNER } from '../ui/layout.js'
import { IcPrev, IcNext, IcExpand, IcCollapse, IcGrid, IcClose } from '../ui/icons.jsx'
import { glowAt } from '../ui/glow.js'

import extDay from '../assets/gallery/exterior/fortune-day-view-1.webp'
import extGolden from '../assets/gallery/exterior/cam-8-goldenhour-01-wm.webp'
import extEvening from '../assets/gallery/exterior/fortune-evenin01-1.webp'
import extEveningCrop from '../assets/gallery/exterior/fortune-evening-crop-1.webp'
import extMetro from '../assets/gallery/exterior/fortunemetro-01.webp'

import intBanquet1 from '../assets/amenities/banquet-hall-cam-03.webp'
import intBanquet2 from '../assets/amenities/banquet-hall-cam-08.webp'
import intGym1 from '../assets/amenities/gym-cam01.webp'
import intGym2 from '../assets/amenities/gym-cam02.webp'
import intGames1 from '../assets/amenities/img-20260922-wa0014.webp'
import intGames2 from '../assets/amenities/img-20260922-wa0016.webp'
import intPodiumAerial from '../assets/amenities/img-20260922-wa0019.webp'
import intPodium from '../assets/amenities/podium-cam-01.webp'
import intPool from '../assets/amenities/swimming-pool.webp'
import intTheatre from '../assets/amenities/theater.webp'

// Add more entries to either list as renders come in - the tabs, the strip
// and the counter all size themselves to the data.
const CATEGORIES = [
  {
    id: 'exterior',
    label: 'Exterior',
    slides: [
      { src: extDay, title: 'Tughra by Day', subtitle: 'A landmark in full light' },
      { src: extGolden, title: 'Golden Hour', subtitle: 'The facade catches the last sun' },
      { src: extEvening, title: 'Evening Glow', subtitle: 'Lit against the Mumbai dusk' },
      { src: extEveningCrop, title: 'Twilight Skyline', subtitle: 'Rising above the city' },
      { src: extMetro, title: 'Metro Connect', subtitle: 'Steps from Mumbai Central' },
    ],
  },
  {
    id: 'amenities',
    label: 'Amenities',
    slides: [
      { src: intPool, title: 'Swimming Pool', subtitle: 'Laps above the city' },
      { src: intGym1, title: 'Fitness Centre', subtitle: 'Train with a view' },
      { src: intGym2, title: 'Fitness Studio', subtitle: 'Equipped to the last detail' },
      { src: intBanquet1, title: 'Banquet Hall', subtitle: 'Celebrations, elevated' },
      { src: intBanquet2, title: 'Grand Hall', subtitle: 'Space for every occasion' },
      { src: intTheatre, title: 'Private Theatre', subtitle: 'Cinema at home' },
      { src: intGames1, title: 'Games Lounge', subtitle: 'Play, unwind, repeat' },
      { src: intGames2, title: 'Recreation Room', subtitle: 'Billiards, table tennis & more' },
      { src: intPodium, title: 'Podium Garden', subtitle: 'Green respite at the podium' },
      { src: intPodiumAerial, title: 'Podium Deck', subtitle: 'Amenities from above' },
    ],
  },
]

const pad = (n) => String(n).padStart(2, '0')

const FLAT = CATEGORIES.flatMap((c, ci) => c.slides.map((s, i) => ({ ...s, ci, i })))
const OFFSETS = CATEGORIES.map((c, ci) => CATEGORIES.slice(0, ci).reduce((n, x) => n + x.slides.length, 0))
const SRCS = FLAT.map((s) => s.src)

function Gallery({ onClose }) {
  const [cat, setCat] = useState(0)
  const [idx, setIdx] = useState(0)
  const [full, setFull] = useState(false) // picture only: the panel and ribbon step aside
  const [grid, setGrid] = useState(false)
  const rootRef = useRef(null)
  const stripRef = useRef(null)
  const gridRef = useRef(null)
  const touchX = useRef(0)
  const wheelAt = useRef(0)

  const category = CATEGORIES[cat]
  const slides = category.slides
  const total = slides.length
  const slide = slides[idx]
  const flat = OFFSETS[cat] + idx
  const key = `${cat}-${idx}`

  // the panel's words and controls arrive after the stage
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: PAGE_IN })
      tl.add(fx.fade('.g-top', { y: -10 }), 0.4)
      tl.add(fx.fade('.g-seal', { y: 10 }), 0.6)
      tl.add(fx.fade('.g-rise', { stagger: 0.08 }), 0.85)
    }, rootRef)
    return () => ctx.revert()
  }, [])

  // the title wipes up on every change; the subtitle arrives late
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      fx.heading('.g-title', { delay: 0.1 })
      fx.fade('.g-count', { y: 6, duration: 0.5 })
      fx.fade('.g-sub', { delay: 0.4, duration: 0.7 })
    }, rootRef)
    return () => ctx.revert()
  }, [key])

  // keep the current thumbnail in view
  useEffect(() => {
    const strip = stripRef.current
    const chip = strip?.querySelector('[aria-current="true"]')
    if (!chip) return
    const target = chip.offsetLeft - strip.clientWidth / 2 + chip.clientWidth / 2
    gsap.to(strip, { scrollLeft: Math.max(0, target), duration: REDUCED ? 0 : 0.6, ease: EASE.soft, overwrite: 'auto' })
  }, [key])

  // warm the cache for the big renders so switching feels instant
  useEffect(() => {
    const t = setTimeout(() => SRCS.forEach((src) => { new Image().src = src }), 1200)
    return () => clearTimeout(t)
  }, [])

  const switchCategory = (c) => {
    if (c === cat) return
    setCat(c)
    setIdx(0)
  }
  const step = (d) => total > 1 && setIdx((i) => (i + d + total) % total)

  // grid overview: opens over the viewer; a tile returns to the viewer on that render
  const closeGrid = (to) => {
    const done = () => {
      if (to) {
        setCat(to[0])
        setIdx(to[1])
      }
      setGrid(false)
    }
    if (REDUCED) return done()
    gsap.to(gridRef.current, { autoAlpha: 0, duration: 0.45, ease: EASE.soft, onComplete: done })
  }

  useLayoutEffect(() => {
    if (!grid) return
    const ctx = gsap.context(() => {
      fx.show(gridRef.current, { duration: 0.6 })
      fx.fade('.gg-head', { stagger: 0.08, delay: 0.1 })
      fx.line('.gg-hair', { delay: 0.2, stagger: 0.1 })
      revealOnScroll('.gg-tile', { scroller: gridRef.current, stagger: 0.07 })
    }, gridRef)
    return () => ctx.revert()
  }, [grid])

  useEffect(() => {
    const onKey = (e) => {
      if (grid) {
        if (e.key === 'Escape') closeGrid()
        return
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') step(1)
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') step(-1)
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
        if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1)
      }}
      onWheel={(e) => {
        if (grid) return
        const now = e.timeStamp
        if (Math.abs(e.deltaY) < 20 || now - wheelAt.current < 900) return
        wheelAt.current = now
        step(e.deltaY > 0 ? 1 : -1)
      }}
    >
      <RibbonStage
        slides={SRCS}
        active={flat}
        bare={full}
        label="Gallery"
        photo="object-center"
        panel={
          <>
            <button type="button" onClick={onClose} aria-label="Back to menu" className="g-seal tr-focus shrink-0 self-start border-none bg-transparent p-0">
              <Lockup compact />
            </button>

            <div className="flex flex-1 flex-col justify-end side:justify-center">
              <span className="g-rise flex items-center gap-4">
                <span className="tr-num">02</span>
                <span className="tr-dash" />
                <span className="tr-label">Gallery</span>
              </span>

              {/* the collections, as menu entries */}
              <div className="g-rise mt-5 flex flex-col gap-1" role="group" aria-label="Collections">
                {CATEGORIES.map((c, ci) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => switchCategory(ci)}
                    onPointerMove={glowAt}
                    aria-pressed={ci === cat}
                    className={`mn-glow tr-focus flex w-full max-w-[20rem] touch-manipulation items-center rounded-lg border-none bg-transparent py-[0.6rem] pl-3 pr-2.5 text-left ${ci === cat ? 'is-on' : ''}`}
                  >
                    <span className="tr-num w-8 shrink-0">{pad(ci + 1)}</span>
                    <span className={`tr-dash mr-6 transition-colors duration-500 ${ci === cat ? 'bg-[var(--ribbon-champagne)]' : ''}`} />
                    <span className={`flex-1 font-sans text-[0.8125rem] uppercase tracking-[0.2em] transition-colors duration-300 ${ci === cat ? 'text-[var(--ribbon-champagne)]' : 'text-cream'}`}>{c.label}</span>
                    <span className="tr-num">{pad(c.slides.length)}</span>
                  </button>
                ))}
              </div>

              <i className="g-rise tr-hair mt-6 w-40 short:hidden" />

              <div className="mt-6 min-w-0 short:mt-2">
                <span className="g-count flex items-center gap-4">
                  <span className="tr-num text-[var(--ribbon-champagne)]">{pad(idx + 1)}</span>
                  <span className="tr-dash" />
                  <span className="tr-num">{pad(total)}</span>
                </span>
                <h2 className="tr-display mt-3 text-[clamp(1.8rem,2.4vw,2.5rem)] short:text-[1.3rem]">
                  <span className="g-title block pb-1">{slide.title}</span>
                </h2>
                <p className="g-sub tr-label mt-2 text-cream/75 short:hidden">{slide.subtitle}</p>
              </div>
            </div>

            {/* arrows and the thumbnail strip */}
            <div className="g-rise shrink-0">
              <div className="mb-3 flex items-center gap-3">
                <IconButton label="Previous render" onClick={() => step(-1)} small>
                  <IcPrev size={16} />
                </IconButton>
                <IconButton label="Next render" onClick={() => step(1)} small>
                  <IcNext size={16} />
                </IconButton>
              </div>
              <div ref={stripRef} className="tr-noscroll -mx-1 flex max-w-full gap-2 overflow-x-auto px-1 py-1" role="tablist" aria-label={`${category.label} renders`}>
                {slides.map((sl, i) => {
                  const on = i === idx
                  return (
                    <button
                      key={sl.src}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      aria-current={on}
                      aria-label={sl.title}
                      onClick={() => setIdx(i)}
                      onPointerMove={glowAt}
                      className={`mn-glow tr-focus relative h-[2.7rem] w-[4rem] shrink-0 touch-manipulation rounded-md border p-[3px] transition-[opacity,border-color,box-shadow] duration-300 short:h-[2.1rem] short:w-[3.1rem] ${on ? 'border-[var(--ribbon-champagne)] opacity-100 shadow-[0_0_1.1rem_color-mix(in_srgb,var(--ribbon-main-gold)_35%,transparent)]' : 'border-[color-mix(in_srgb,var(--ribbon-main-gold)_25%,transparent)] opacity-60 hover:opacity-100'}`}
                    >
                      <img src={sl.src} alt="" className="h-full w-full rounded-[3px] object-cover" draggable={false} />
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        }
      >
        {/* round controls, top right over the photograph */}
        <div className={`g-top ${CORNER}`}>
          {!full && (
            <IconButton label="All renders" onClick={() => setGrid(true)}>
              <IcGrid size={18} />
            </IconButton>
          )}
          <IconButton label={full ? 'Show details (Esc)' : 'Picture only (F)'} onClick={() => setFull((v) => !v)} active={full}>
            {full ? <IcCollapse size={18} /> : <IcExpand size={18} />}
          </IconButton>
          <BackControl onClick={onClose} />
        </div>
      </RibbonStage>

      {/* ---------- Grid overview ---------- */}
      {grid && (
        <div ref={gridRef} className="fixed inset-0 z-[60] overflow-y-auto bg-[color-mix(in_srgb,var(--espresso)_74%,transparent)] backdrop-blur-xl" style={{ backgroundImage: 'var(--grain)' }} role="dialog" aria-modal="true" aria-label="All renders">
          <div className="sticky top-0 z-10 flex items-end justify-between gap-4 bg-[color-mix(in_srgb,var(--espresso)_70%,transparent)] px-5 pb-5 pt-[max(1.5rem,var(--safe-t))] backdrop-blur-md sm:px-8 side:px-[2.9rem] side:pt-[2.7rem]">
            <div>
              <span className="gg-head flex items-center gap-4">
                <span className="tr-num">02</span>
                <span className="tr-dash" />
                <span className="tr-label">Gallery</span>
              </span>
              <h2 className="gg-head tr-display mt-3 text-[clamp(2rem,3vw,3rem)]">Every render</h2>
            </div>
            <IconButton label="Close" onClick={() => closeGrid()}>
              <IcClose size={17} />
            </IconButton>
            <i className="gg-hair tr-hair absolute inset-x-5 bottom-0 sm:inset-x-8 side:inset-x-[2.9rem]" />
          </div>

          <div className="px-5 pb-[max(2rem,var(--safe-b))] pt-8 sm:px-8 side:px-[2.9rem]">
            {CATEGORIES.map((c, ci) => (
              <section key={c.id} className="mb-12">
                <div className="mb-5 flex items-center gap-4">
                  <span className="tr-label">{c.label}</span>
                  <i className="gg-hair tr-hair flex-1" />
                  <span className="tr-num">{pad(c.slides.length)}</span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {c.slides.map((s, i) => (
                    <button
                      key={s.src}
                      type="button"
                      onClick={() => closeGrid([ci, i])}
                      onPointerMove={glowAt}
                      className={`gg-tile mn-glow tr-focus group flex touch-manipulation flex-col rounded-[0.9rem] bg-[color-mix(in_srgb,var(--espresso)_55%,transparent)] p-2.5 text-left shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--ribbon-main-gold)_22%,transparent)] md:p-3 ${i === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}`}
                    >
                      <span className={`block w-full overflow-hidden rounded-[0.55rem] ${i === 0 ? 'aspect-[4/3] lg:aspect-auto lg:flex-1' : 'aspect-[4/3]'}`}>
                        <img src={s.src} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]" draggable={false} />
                      </span>
                      <span className="mt-3 flex items-baseline gap-3 px-1.5 pb-1">
                        <span className="tr-num">{pad(i + 1)}</span>
                        <span className="min-w-0">
                          <span className="tr-display block truncate text-[1.25rem] transition-colors duration-300 group-hover:text-[var(--ribbon-champagne)]">{s.title}</span>
                          <span className="mt-1 block truncate font-sans text-[0.625rem] uppercase tracking-[0.18em] text-cream/60">{s.subtitle}</span>
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Gallery
