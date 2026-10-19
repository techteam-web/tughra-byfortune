import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, fx, EASE, PAGE_IN, REDUCED, revealOnScroll } from '../motion/index.js'
import { TopBar, BackControl, IconButton, Segmented } from '../ui/controls.jsx'
import { IcPrev, IcNext, IcExpand, IcCollapse, IcGrid, IcClose } from '../ui/icons.jsx'

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
const TABS = CATEGORIES.map((c, i) => ({ value: i, label: c.label }))

// Picture-only view: the whole render, in a fine frame, clear of the controls around it.
const frameMargins = (w, h) => (h < 520 && w > h ? { top: 64, bottom: 24, side: 72 } : w < 768 ? { top: 96, bottom: 48, side: 16 } : { top: 112, bottom: 56, side: 112 })

function Gallery({ onClose }) {
  const [cat, setCat] = useState(0)
  const [idx, setIdx] = useState(0)
  const [full, setFull] = useState(false) // picture only (in the app; never leaves browser full screen)
  const [grid, setGrid] = useState(false)
  const [aspects, setAspects] = useState({})
  const [vp, setVp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  const sectionRef = useRef(null)
  const stripRef = useRef(null)
  const gridRef = useRef(null)
  const touchX = useRef(0)
  const wheelAt = useRef(0)
  const firstShow = useRef(true)

  const category = CATEGORIES[cat]
  const slides = category.slides
  const total = slides.length
  const slide = slides[idx]
  const key = `${cat}-${idx}`

  // Entrance
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: PAGE_IN })
      tl.add(fx.show('.gv-stage', { duration: 1.1 }), 0)
      tl.add(fx.fade('.tb-anim', { y: -10 }), 0.15)
      tl.add(fx.fade('.g-chrome', { stagger: 0.08 }), 0.3)
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  // The chosen render crossfades in and drifts 3% over seven seconds
  useLayoutEffect(() => {
    const root = sectionRef.current
    const on = root.querySelector(`[data-slide="${key}"]`)
    root.querySelectorAll('[data-slide]').forEach((el) => {
      if (el !== on) gsap.to(el, { opacity: 0, duration: REDUCED ? 0.2 : 1, ease: EASE.move, overwrite: 'auto' })
    })
    if (!on) return
    gsap.to(on, { opacity: 1, duration: firstShow.current ? 0 : REDUCED ? 0.2 : 1, ease: EASE.move, overwrite: 'auto' })
    firstShow.current = false
    const img = on.querySelector('.gv-img')
    if (img && !REDUCED) gsap.fromTo(img, { scale: 1 }, { scale: 1.03, duration: 7.5, ease: 'power1.out', overwrite: 'auto' })
  }, [key])

  // Caption: title wipes up, the subtitle arrives late
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      fx.heading('.g-title', { delay: 0.1 })
      fx.fade('.g-count', { y: 6, duration: 0.5 })
      fx.fade('.g-sub', { delay: 0.45, duration: 0.7 })
    }, sectionRef)
    return () => ctx.revert()
  }, [key])

  // Keep the current thumbnail in view
  useEffect(() => {
    const strip = stripRef.current
    const chip = strip?.querySelector('[aria-current="true"]')
    if (!chip) return
    const target = chip.offsetLeft - strip.clientWidth / 2 + chip.clientWidth / 2
    gsap.to(strip, { scrollLeft: Math.max(0, target), duration: REDUCED ? 0 : 0.6, ease: EASE.soft, overwrite: 'auto' })
  }, [key])

  // The controls step back when nothing has moved for a few seconds
  useEffect(() => {
    let t
    let idle = false
    const ui = () => sectionRef.current?.querySelectorAll('.gv-ui')
    const setIdle = (v) => {
      if (v === idle) return
      idle = v
      sectionRef.current?.classList.toggle('cursor-none', v)
      gsap.to(ui(), { autoAlpha: v ? 0 : 1, duration: v ? 0.8 : 0.4, ease: EASE.soft, overwrite: 'auto' })
    }
    const wake = () => {
      setIdle(false)
      clearTimeout(t)
      t = setTimeout(() => setIdle(true), 4000)
    }
    wake()
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart']
    events.forEach((e) => window.addEventListener(e, wake, { passive: true }))
    return () => {
      clearTimeout(t)
      events.forEach((e) => window.removeEventListener(e, wake))
    }
  }, [])

  useEffect(() => {
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Warm the cache for the big renders so switching feels instant.
  useEffect(() => {
    const t = setTimeout(() => CATEGORIES.forEach((c) => c.slides.forEach((x) => { new Image().src = x.src })), 1200)
    return () => clearTimeout(t)
  }, [])

  const noteAspect = (src, img) => {
    if (!img.naturalWidth) return
    setAspects((a) => (a[src] ? a : { ...a, [src]: { w: img.naturalWidth, h: img.naturalHeight } }))
  }
  const frameBox = (src) => {
    const a = aspects[src]
    if (!a) return null
    const m = frameMargins(vp.w, vp.h)
    const mat = 8
    const k = Math.min((vp.w - m.side * 2 - mat * 2) / a.w, (vp.h - m.top - m.bottom - mat * 2) / a.h)
    return { w: Math.round(a.w * k + mat * 2), h: Math.round(a.h * k + mat * 2), dy: Math.round((m.top - m.bottom) / 2) }
  }

  const switchCategory = (c) => {
    if (c === cat) return
    setCat(c)
    setIdx(0)
  }
  const step = (d) => total > 1 && setIdx((i) => (i + d + total) % total)

  // Grid overview: opens over the viewer; a tile returns to the viewer on that render
  const openGrid = () => setGrid(true)
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

  const box = full ? frameBox(slide.src) : null

  return (
    <section
      ref={sectionRef}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (grid) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1)
      }}
      onWheel={(e) => {
        if (grid) return
        const now = Date.now()
        if (Math.abs(e.deltaY) < 20 || now - wheelAt.current < 900) return
        wheelAt.current = now
        step(e.deltaY > 0 ? 1 : -1)
      }}
      className="relative h-svh w-full overflow-hidden bg-espresso text-cream"
    >
      {/* Every render stacked; only the current one is lit */}
      <div className="gv-stage absolute inset-0" aria-live="polite">
        {CATEGORIES.flatMap((c, ci) =>
          c.slides.map((s, i) => {
            const on = ci === cat && i === idx
            return (
              <div key={c.id + i} data-slide={`${ci}-${i}`} className="absolute inset-0 overflow-hidden" style={{ opacity: 0 }}>
                <img
                  className={`gv-img absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${full ? 'opacity-0' : 'opacity-100'}`}
                  src={s.src}
                  alt={on ? s.title : ''}
                  draggable={false}
                  onLoad={(e) => noteAspect(s.src, e.currentTarget)}
                />
              </div>
            )
          }),
        )}
      </div>

      {/* Picture only: the whole render in a fine bronze frame on espresso */}
      {full && box && (
        <div
          className="absolute left-1/2 top-1/2 z-[1] border border-bronze/55 bg-cocoa p-2"
          style={{ width: box.w, height: box.h, transform: `translate(-50%, calc(-50% + ${box.dy}px))` }}
        >
          <img src={slide.src} alt={slide.title} className="h-full w-full object-contain" draggable={false} />
        </div>
      )}

      {/* just enough shade for the words to sit on the picture */}
      <div
        className={`pointer-events-none absolute inset-0 z-[2] transition-opacity duration-500 ${full ? 'opacity-0' : 'opacity-100'}`}
        style={{ background: 'linear-gradient(180deg, var(--scrim) 0%, transparent 34%), linear-gradient(0deg, var(--espresso) 0%, var(--scrim) 18%, transparent 52%)' }}
      />

      {/* ---------- Top: logo, collections, grid, picture only, back ---------- */}
      <div className="gv-ui">
        <TopBar onBrand={onClose}>
          <div className="g-chrome flex items-center gap-2.5 md:gap-3">
            <div className={`mr-3 hidden transition-opacity duration-500 lg:block short:block ${full ? 'pointer-events-none opacity-0' : ''}`}>
              <Segmented options={TABS} value={cat} onChange={switchCategory} label="Collections" />
            </div>
            <IconButton label="All renders" onClick={openGrid} className={`transition-opacity duration-500 ${full ? 'pointer-events-none opacity-0' : ''}`}>
              <IcGrid size={18} />
            </IconButton>
            <IconButton label={full ? 'Show captions' : 'Picture only (F)'} onClick={() => setFull((v) => !v)} active={full}>
              {full ? <IcCollapse size={18} /> : <IcExpand size={18} />}
            </IconButton>
            <span className="ml-1">
              <BackControl onClick={onClose} />
            </span>
          </div>
        </TopBar>

        {/* collections, on narrow screens */}
        <div className="g-chrome absolute inset-x-0 top-[6.25rem] z-20 md:top-[7.5rem] lg:hidden short:hidden">
          <div className={`flex justify-center px-5 transition-opacity duration-500 ${full ? 'pointer-events-none opacity-0' : ''}`}>
            <Segmented options={TABS} value={cat} onChange={switchCategory} label="Collections" />
          </div>
        </div>
      </div>

      {/* ---------- Arrows ---------- */}
      {total > 1 && (
        <div className="gv-ui pointer-events-none absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 items-center justify-between px-3 md:px-8">
          <IconButton label="Previous render" onClick={() => step(-1)} className="pointer-events-auto">
            <IcPrev size={18} />
          </IconButton>
          <IconButton label="Next render" onClick={() => step(1)} className="pointer-events-auto">
            <IcNext size={18} />
          </IconButton>
        </div>
      )}

      {/* ---------- Caption and the thumbnail strip ---------- */}
      <div className="gv-ui absolute inset-x-0 bottom-0 z-20">
        <div className={`transition-opacity duration-500 ${full ? 'pointer-events-none opacity-0' : ''}`}>
        <footer className="g-chrome flex flex-col gap-5 px-5 pb-[max(1.5rem,var(--safe-b))] sm:px-8 md:flex-row md:items-end md:justify-between md:gap-10 md:px-12 md:pb-9 short:flex-row short:items-end short:gap-6 short:pb-3">
          <div className="min-w-0 md:max-w-[34rem]">
            <span className="g-count tr-label flex items-center gap-3">
              <span className="text-gold">{pad(idx + 1)}</span>
              <i className="tr-hair block w-8 bg-bronze" />
              <span className="text-parchment/70">{pad(total)}</span>
              <span className="ml-2 text-gold-pale/70">{category.label}</span>
            </span>
            <h2 className="mt-3 font-serif text-[clamp(1.9rem,2.8vw,2.75rem)] font-normal leading-[1.08] text-cream short:mt-1 short:text-[1.35rem]">
              <span className="g-title block truncate pb-1">{slide.title}</span>
            </h2>
            <p className="g-sub mt-1 truncate text-[0.875rem] tracking-[0.02em] text-gold-pale/90 short:hidden">{slide.subtitle}</p>
          </div>

          <div ref={stripRef} className="tr-noscroll -mx-1 flex max-w-full gap-2 overflow-x-auto px-1 py-1 md:max-w-[min(46rem,55vw)]" role="tablist" aria-label={`${category.label} renders`}>
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
                  className={`tr-focus relative h-[3.1rem] w-[4.6rem] shrink-0 overflow-hidden rounded-[0.55rem] border p-0 transition-[opacity,border-color] duration-300 md:h-[3.6rem] md:w-[5.4rem] short:h-[2.4rem] short:w-[3.6rem] ${on ? 'border-gold opacity-100' : 'border-bronze/35 opacity-55 hover:opacity-90'}`}
                >
                  <img src={sl.src} alt="" className="h-full w-full object-cover" draggable={false} />
                </button>
              )
            })}
          </div>
        </footer>
        </div>
      </div>

      {/* ---------- Grid overview ---------- */}
      {grid && (
        <div ref={gridRef} className="absolute inset-0 z-40 overflow-y-auto bg-espresso" role="dialog" aria-modal="true" aria-label="All renders">
          <div className="sticky top-0 z-10 flex items-end justify-between gap-4 bg-espresso px-5 pb-5 pt-[max(1.5rem,var(--safe-t))] sm:px-8 md:px-12 md:pt-9">
            <div>
              <span className="gg-head tr-label block">Gallery</span>
              <h2 className="gg-head mt-2 font-serif text-[clamp(2rem,3vw,3rem)] font-normal leading-none text-cream">Every render</h2>
            </div>
            <IconButton label="Close" onClick={() => closeGrid()}>
              <IcClose size={17} />
            </IconButton>
            <i className="gg-hair tr-hair absolute inset-x-5 bottom-0 sm:inset-x-8 md:inset-x-12" />
          </div>

          <div className="px-5 pb-[max(2rem,var(--safe-b))] pt-8 sm:px-8 md:px-12">
            {CATEGORIES.map((c, ci) => (
              <section key={c.id} className="mb-12">
                <div className="mb-5 flex items-center gap-4">
                  <span className="tr-label">{c.label}</span>
                  <i className="gg-hair tr-hair flex-1" />
                  <span className="tr-label text-gold-pale/60">{pad(c.slides.length)}</span>
                </div>
                {/* editorial grid; the 1px gaps are the bronze hairline gutters */}
                <div className="grid grid-cols-1 gap-px overflow-hidden rounded-card border border-bronze/25 bg-bronze/25 sm:grid-cols-2 lg:grid-cols-3">
                  {c.slides.map((s, i) => (
                    <button
                      key={s.src}
                      type="button"
                      onClick={() => closeGrid([ci, i])}
                      className={`gg-tile tr-focus group flex flex-col bg-espresso p-3 text-left md:p-4 ${i === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}`}
                    >
                      <span className={`block w-full overflow-hidden rounded-[0.6rem] ${i === 0 ? 'aspect-[4/3] lg:aspect-auto lg:flex-1' : 'aspect-[4/3]'}`}>
                        <img src={s.src} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]" draggable={false} />
                      </span>
                      <span className="mt-3 flex items-baseline gap-3 px-1">
                        <span className="tr-label text-gold-pale/70">{pad(i + 1)}</span>
                        <span className="min-w-0">
                          <span className="block truncate font-serif text-[1.2rem] leading-tight text-cream transition-colors duration-300 group-hover:text-gold-pale">{s.title}</span>
                          <span className="mt-0.5 block truncate text-[0.75rem] text-parchment/65">{s.subtitle}</span>
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
    </section>
  )
}

export default Gallery
