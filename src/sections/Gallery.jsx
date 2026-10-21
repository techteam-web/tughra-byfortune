import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, fx, EASE, PAGE_IN, REDUCED, revealOnScroll } from '../motion/index.js'
import { TopBar, BackControl, IconButton, Segmented } from '../ui/controls.jsx'
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
const TABS = CATEGORIES.map((c, i) => ({ value: i, label: c.label }))

// An immersive viewer: the render fills the screen; a slim glass dock, the caption and a gold
// timeline are the only things on it, and even they step back when nothing moves.
function Gallery({ onClose }) {
  const [cat, setCat] = useState(0)
  const [idx, setIdx] = useState(0)
  const [full, setFull] = useState(false) // picture only: everything steps aside
  const [grid, setGrid] = useState(false)
  const rootRef = useRef(null)
  const stripRef = useRef(null)
  const gridRef = useRef(null)
  const touchX = useRef(0)
  const wheelAt = useRef(0)
  const firstShow = useRef(true)

  const category = CATEGORIES[cat]
  const slides = category.slides
  const total = slides.length
  const slide = slides[idx]
  const flat = OFFSETS[cat] + idx
  const key = `${cat}-${idx}`

  // arrival
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: PAGE_IN })
      tl.add(fx.show('.gv-stage', { duration: 1.2 }), 0)
      tl.add(fx.fade('.tb-anim', { y: -10 }), 0.3)
      tl.add(fx.fade('.g-chrome', { y: 12, stagger: 0.08 }), 0.5)
      tl.add(fx.line('.g-timeline'), 0.8)
    }, rootRef)
    return () => ctx.revert()
  }, [])

  // the chosen render crossfades in and drifts 3% while it is shown
  useLayoutEffect(() => {
    const root = rootRef.current
    const on = root.querySelector(`[data-slide="${flat}"]`)
    root.querySelectorAll('[data-slide]').forEach((el) => {
      if (el !== on) gsap.to(el, { opacity: 0, duration: REDUCED ? 0.2 : 1.1, ease: EASE.move, overwrite: 'auto' })
    })
    if (!on) return
    gsap.to(on, { opacity: 1, duration: firstShow.current ? 0 : REDUCED ? 0.2 : 1.1, ease: EASE.move, overwrite: 'auto' })
    firstShow.current = false
    const img = on.querySelector('img')
    if (img && !REDUCED) gsap.fromTo(img, { scale: 1 }, { scale: 1.04, duration: 9, ease: 'power1.out', overwrite: 'auto' })
  }, [flat])

  // the gold timeline marks where you are in the collection
  useLayoutEffect(() => {
    gsap.to('.g-progress', { scaleX: (idx + 1) / total, duration: REDUCED ? 0 : 0.8, ease: EASE.enter, overwrite: 'auto' })
  }, [idx, total, cat])

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

  // the interface steps back when nothing has moved for a few seconds
  useEffect(() => {
    let t
    let idle = false
    const setIdle = (v) => {
      if (v === idle) return
      idle = v
      rootRef.current?.classList.toggle('cursor-none', v)
      gsap.to(rootRef.current?.querySelectorAll('.gv-ui'), { autoAlpha: v ? 0 : 1, duration: v ? 0.9 : 0.4, ease: EASE.soft, overwrite: 'auto' })
    }
    const wake = () => {
      setIdle(false)
      clearTimeout(t)
      t = setTimeout(() => setIdle(true), 4500)
    }
    wake()
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart']
    events.forEach((e) => window.addEventListener(e, wake, { passive: true }))
    return () => {
      clearTimeout(t)
      events.forEach((e) => window.removeEventListener(e, wake))
    }
  }, [])

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

  const hide = full ? 'pointer-events-none opacity-0' : ''

  return (
    <div
      ref={rootRef}
      className="relative h-svh w-full overflow-hidden bg-espresso text-cream"
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
      {/* every render stacked, edge to edge; only the current one is lit */}
      <div className="gv-stage absolute inset-0" aria-live="polite">
        {FLAT.map((s, i) => (
          <div key={s.src} data-slide={i} className="absolute inset-0 overflow-hidden" style={{ opacity: 0 }}>
            <img src={s.src} alt={i === flat ? s.title : ''} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
          </div>
        ))}
      </div>

      {/* shade where the words sit: a smoky gradient with a faint grain */}
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${full ? 'opacity-0' : ''}`}
        style={{
          backgroundImage:
            'var(--grain), linear-gradient(180deg, color-mix(in srgb, var(--espresso) 70%, transparent) 0%, transparent 26%), linear-gradient(0deg, color-mix(in srgb, var(--espresso) 92%, transparent) 0%, color-mix(in srgb, var(--espresso) 55%, transparent) 24%, transparent 55%)',
        }}
      />

      {/* ---------- Top: seal, collections, round controls ---------- */}
      <div className="gv-ui">
        <div className={`transition-opacity duration-500 ${hide}`}>
        <TopBar onBrand={onClose} compact>
          <div className="g-chrome flex items-center gap-3">
            <div className="mr-2 hidden lg:block short:block">
              <Segmented options={TABS} value={cat} onChange={switchCategory} label="Collections" />
            </div>
            <IconButton label="All renders" onClick={() => setGrid(true)}>
              <IcGrid size={18} />
            </IconButton>
            <IconButton label="Picture only (F)" onClick={() => setFull(true)}>
              <IcExpand size={18} />
            </IconButton>
            <BackControl onClick={onClose} />
          </div>
        </TopBar>
        <div className="g-chrome absolute inset-x-0 top-[6.25rem] z-20 flex justify-center px-5 lg:hidden short:hidden">
          <Segmented options={TABS} value={cat} onChange={switchCategory} label="Collections" />
        </div>
        </div>
      </div>

      {/* picture only: one small way back */}
      {full && (
        <div className="gv-ui absolute right-3 top-[max(1rem,var(--safe-t))] z-30 sm:right-6 side:right-[2.8rem] side:top-[2.7rem]">
          <IconButton label="Show details (Esc)" onClick={() => setFull(false)} active>
            <IcCollapse size={18} />
          </IconButton>
        </div>
      )}

      {/* side arrows */}
      {total > 1 && (
        <div className="gv-ui pointer-events-none absolute inset-x-0 top-1/2 z-20 -translate-y-1/2 px-3 sm:px-6 side:px-[2.8rem]">
          <div className={`flex items-center justify-between transition-opacity duration-500 ${hide}`}>
          <IconButton label="Previous render" onClick={() => step(-1)} className="pointer-events-auto">
            <IcPrev size={18} />
          </IconButton>
          <IconButton label="Next render" onClick={() => step(1)} className="pointer-events-auto">
            <IcNext size={18} />
          </IconButton>
          </div>
        </div>
      )}

      {/* ---------- Foot: caption left, glass dock right, a gold timeline along the edge ---------- */}
      <div className="gv-ui absolute inset-x-0 bottom-0 z-20">
        <div className={`transition-opacity duration-500 ${hide}`}>
        <div className="flex flex-col gap-5 px-5 pb-[max(1.4rem,var(--safe-b))] sm:px-8 md:flex-row md:items-end md:justify-between md:gap-10 side:px-[2.9rem] side:pb-[3.2rem] short:flex-row short:items-end short:gap-6 short:pb-4">
          <div className="g-chrome min-w-0 md:max-w-[36rem]">
            <span className="g-count flex items-center gap-4">
              <span className="tr-num text-[var(--ribbon-champagne)]">{pad(idx + 1)}</span>
              <span className="tr-dash" />
              <span className="tr-num">{pad(total)}</span>
              <span className="tr-label ml-2">{category.label}</span>
            </span>
            <h2 className="tr-display mt-4 text-[clamp(2.1rem,3.6vw,3.6rem)] short:mt-1 short:text-[1.4rem]">
              <span className="g-title block truncate pb-1">{slide.title}</span>
            </h2>
            <p className="g-sub tr-label mt-2 text-cream/75 short:hidden">{slide.subtitle}</p>
          </div>

          {/* the dock: every render in the collection, in smoky glass */}
          <div className="g-chrome tr-panel shrink-0 rounded-[0.9rem] p-2 md:max-w-[min(30rem,46vw)] short:max-w-[40vw]">
            <div ref={stripRef} className="tr-noscroll flex gap-2 overflow-x-auto" role="tablist" aria-label={`${category.label} renders`}>
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
                    className={`mn-glow tr-focus relative h-[3rem] w-[4.4rem] shrink-0 touch-manipulation rounded-md border p-[3px] transition-[opacity,border-color,box-shadow] duration-300 short:h-[2.2rem] short:w-[3.2rem] ${on ? 'border-[var(--ribbon-champagne)] opacity-100 shadow-[0_0_1.1rem_color-mix(in_srgb,var(--ribbon-main-gold)_35%,transparent)]' : 'border-[color-mix(in_srgb,var(--ribbon-main-gold)_25%,transparent)] opacity-60 hover:opacity-100'}`}
                  >
                    <img src={sl.src} alt="" className="h-full w-full rounded-[3px] object-cover" draggable={false} />
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* the gold timeline */}
        <div className="g-timeline relative h-px w-full bg-cream/20">
          <span className="g-progress absolute inset-y-0 left-0 w-full origin-left bg-[linear-gradient(90deg,var(--ribbon-deep-bronze),var(--ribbon-main-gold),var(--ribbon-champagne))] shadow-[0_0_0.8rem_var(--ribbon-main-gold)]" style={{ transform: 'scaleX(0)' }} />
        </div>
        </div>
      </div>

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
