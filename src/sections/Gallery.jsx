import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, fx, EASE, PAGE_IN, REDUCED } from '../motion/index.js'
import { TopBar, BackControl, IconButton, Segmented } from '../ui/controls.jsx'
import { IcPrev, IcNext } from '../ui/icons.jsx'
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

// Add more entries to either list as renders come in - the tabs, the strip,
// the rail and the counter all size themselves to the data.
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

const AUTOPLAY = 6 // seconds per render
const pad = (n) => String(n).padStart(2, '0')
const FLAT = CATEGORIES.flatMap((c, ci) => c.slides.map((s, i) => ({ ...s, ci, i })))
const OFFSETS = CATEGORIES.map((c, ci) => CATEGORIES.slice(0, ci).reduce((n, x) => n + x.slides.length, 0))
const TABS = CATEGORIES.map((c, i) => ({ value: i, label: c.label }))

// The title, one masked span per word and one span per letter, so the letters can rise in turn.
function SplitTitle({ text }) {
  return text.split(' ').map((word, w) => (
    <span key={w} className="mr-[0.28em] inline-block overflow-hidden pb-[0.08em] align-bottom last:mr-0">
      {[...word].map((ch, c) => (
        <span key={c} className="g-char inline-block will-change-transform">
          {ch}
        </span>
      ))}
    </span>
  ))
}

// A cinematic viewer: every render fills the screen, and each new one is wiped in over the
// last while it settles from a slow zoom. The title rises letter by letter, a gold line counts
// down to the next render, and the picture drifts a touch with the cursor.
function Gallery({ onClose }) {
  const [cat, setCat] = useState(0)
  const [idx, setIdx] = useState(0)
  const [hold, setHold] = useState(false) // autoplay paused while the pointer is on the controls
  const rootRef = useRef(null)
  const stageRef = useRef(null)
  const stripRef = useRef(null)
  const prevFlat = useRef(null)
  const dir = useRef(1)
  const touchX = useRef(0)
  const wheelAt = useRef(0)

  const category = CATEGORIES[cat]
  const slides = category.slides
  const total = slides.length
  const slide = slides[idx]
  const flat = OFFSETS[cat] + idx

  const go = useCallback(
    (to, d) => {
      dir.current = d
      setIdx(((to % total) + total) % total)
    },
    [total],
  )
  const step = useCallback((d) => go(idx + d, d), [go, idx])

  // Arrival: an espresso curtain lifts off the first render as it settles from a deep zoom,
  // then the words and controls come in.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: PAGE_IN })
      if (REDUCED) {
        tl.set('.g-curtain', { autoAlpha: 0 })
        tl.add(fx.show('.g-chrome', { stagger: 0.05 }), 0)
        return
      }
      tl.fromTo('.g-curtain', { scaleY: 1 }, { scaleY: 0, duration: 1.4, ease: 'expo.inOut' }, 0)
      tl.fromTo('.g-curtain-line', { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: EASE.move }, 0)
      tl.fromTo('.gv-zoom', { scale: 1.28 }, { scale: 1, duration: 2.6, ease: 'expo.out' }, 0.25)
      tl.add(fx.fade('.tb-anim', { y: -12 }), 0.9)
      tl.add(fx.fade('.g-chrome', { y: 18, stagger: 0.09, duration: 0.9 }), 1.0)
      tl.fromTo('.g-tick', { scaleY: 0 }, { scaleY: 1, duration: 0.6, stagger: 0.04, ease: EASE.enter }, 1.1)
    }, rootRef)
    return () => ctx.revert()
  }, [])

  // The change of render: the new one is wiped in from the side you are heading towards while
  // it eases out of a zoom; the old one slides a little the other way under it.
  useLayoutEffect(() => {
    const root = rootRef.current
    const all = root.querySelectorAll('[data-slide]')
    const inEl = root.querySelector(`[data-slide="${flat}"]`)
    const outEl = prevFlat.current === null ? null : root.querySelector(`[data-slide="${prevFlat.current}"]`)
    prevFlat.current = flat
    if (!inEl) return

    all.forEach((el) => {
      if (el !== inEl && el !== outEl) gsap.set(el, { autoAlpha: 0, zIndex: 0 })
    })
    const inImg = inEl.querySelector('img')

    if (!outEl || outEl === inEl || REDUCED) {
      gsap.set(inEl, { autoAlpha: 1, zIndex: 2, clipPath: 'inset(0% 0% 0% 0%)' })
      if (outEl && outEl !== inEl) gsap.set(outEl, { autoAlpha: 0 })
      if (!REDUCED) gsap.fromTo(inImg, { scale: 1.08 }, { scale: 1, duration: 9, ease: 'power1.out', overwrite: 'auto' })
      return
    }

    const d = dir.current
    gsap.set(outEl, { autoAlpha: 1, zIndex: 1 })
    gsap.set(inEl, { autoAlpha: 1, zIndex: 2 })
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(outEl, { autoAlpha: 0, zIndex: 0 })
        gsap.set(outEl.querySelector('img'), { xPercent: 0, scale: 1 })
      },
    })
    tl.fromTo(inEl, { clipPath: d > 0 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.35, ease: 'expo.inOut' }, 0)
    tl.fromTo(inImg, { scale: 1.3, xPercent: d * 8 }, { scale: 1.06, xPercent: 0, duration: 1.8, ease: 'expo.out' }, 0.15)
    tl.to(inImg, { scale: 1, duration: 8, ease: 'power1.out' }, 1.95)
    tl.to(outEl.querySelector('img'), { xPercent: -d * 12, scale: 1.08, duration: 1.35, ease: 'expo.inOut' }, 0)
    return () => tl.progress(1).kill()
  }, [flat])

  // The title rises letter by letter; the count rolls; the line under it follows.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (REDUCED) {
        fx.show('.g-char, .g-sub, .g-roll')
        return
      }
      gsap.fromTo('.g-char', { yPercent: 115, rotate: 6 }, { yPercent: 0, rotate: 0, duration: 1.1, ease: 'expo.out', stagger: 0.022, delay: 0.35 })
      gsap.fromTo('.g-roll', { yPercent: dir.current * 100 }, { yPercent: 0, duration: 0.9, ease: 'expo.out', delay: 0.2 })
      gsap.fromTo('.g-sub', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.9, ease: EASE.soft, delay: 0.7 })
      gsap.fromTo('.g-rule', { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: EASE.move, delay: 0.5 })
    }, rootRef)
    return () => ctx.revert()
  }, [flat])

  // A new collection: its thumbnails and rail ticks come in one after another
  useLayoutEffect(() => {
    if (REDUCED) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.g-thumb', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.7, ease: EASE.enter, stagger: 0.05, delay: 0.15 })
    }, rootRef)
    return () => ctx.revert()
  }, [cat])

  // Autoplay: the gold line fills over six seconds, then the next render comes in
  useEffect(() => {
    const line = rootRef.current?.querySelector('.g-progress')
    if (!line) return
    if (hold) return
    const t = gsap.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: AUTOPLAY, ease: 'none', onComplete: () => step(1) })
    return () => t.kill()
  }, [flat, hold, step])

  // keep the current thumbnail in view
  useEffect(() => {
    const strip = stripRef.current
    const chip = strip?.querySelector('[aria-current="true"]')
    if (!chip) return
    const target = chip.offsetLeft - strip.clientWidth / 2 + chip.clientWidth / 2
    gsap.to(strip, { scrollLeft: Math.max(0, target), duration: REDUCED ? 0 : 0.7, ease: EASE.soft, overwrite: 'auto' })
  }, [flat])

  // the picture drifts a touch against the cursor
  useEffect(() => {
    if (REDUCED || !stageRef.current) return
    const xTo = gsap.quickTo(stageRef.current, 'x', { duration: 1.4, ease: 'power3.out' })
    const yTo = gsap.quickTo(stageRef.current, 'y', { duration: 1.4, ease: 'power3.out' })
    const onMove = (e) => {
      xTo((e.clientX / window.innerWidth - 0.5) * -26)
      yTo((e.clientY / window.innerHeight - 0.5) * -18)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  // warm the cache so every render is ready when it is called
  useEffect(() => {
    const t = setTimeout(() => FLAT.forEach((s) => (new Image().src = s.src)), 1200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') step(1)
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step])

  const switchCategory = (c) => {
    if (c === cat) return
    dir.current = 1
    setCat(c)
    setIdx(0)
  }

  return (
    <div
      ref={rootRef}
      className="relative h-svh w-full overflow-clip bg-espresso text-cream"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1)
      }}
      onWheel={(e) => {
        const now = e.timeStamp
        if (Math.abs(e.deltaY) < 20 || now - wheelAt.current < 1100) return
        wheelAt.current = now
        step(e.deltaY > 0 ? 1 : -1)
      }}
    >
      {/* ---------- every render, stacked edge to edge ---------- */}
      {/* overflow-clip, not hidden: the stage is oversized for the cursor drift, and a hidden
          overflow would let focus scroll the whole page sideways */}
      <div className="gv-zoom absolute inset-0 overflow-clip">
        <div ref={stageRef} className="absolute -inset-6" aria-live="polite">
          {FLAT.map((s, i) => (
            <div key={s.src} data-slide={i} className="absolute inset-0 overflow-hidden">
              <img src={s.src} alt={i === flat ? s.title : ''} className="absolute inset-0 h-full w-full object-cover will-change-transform" draggable={false} />
            </div>
          ))}
        </div>
      </div>

      {/* smoky shade where the words sit, with the faint grain */}
      <div
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{
          backgroundImage:
            'var(--grain), linear-gradient(180deg, color-mix(in srgb, var(--espresso) 72%, transparent) 0%, transparent 24%), linear-gradient(0deg, color-mix(in srgb, var(--espresso) 94%, transparent) 0%, color-mix(in srgb, var(--espresso) 55%, transparent) 26%, transparent 58%), linear-gradient(90deg, color-mix(in srgb, var(--espresso) 55%, transparent) 0%, transparent 45%)',
        }}
      />

      {/* ---------- top: the seal, the collections, back ---------- */}
      <div className="relative z-20">
        <TopBar onBrand={onClose} compact>
          <div className="g-chrome flex items-center gap-3">
            <div className="mr-2 hidden md:block">
              <Segmented options={TABS} value={cat} onChange={switchCategory} label="Collections" />
            </div>
            <BackControl onClick={onClose} />
          </div>
        </TopBar>
        <div className="g-chrome absolute inset-x-0 top-[6rem] flex justify-center px-5 md:hidden">
          <Segmented options={TABS} value={cat} onChange={switchCategory} label="Collections" />
        </div>
      </div>

      {/* ---------- the rail: one tick per render, the current one long and gold ---------- */}
      <nav className="absolute right-5 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-end gap-2.5 sm:flex side:right-[2.9rem]" aria-label={`${category.label} renders`}>
        {slides.map((s, i) => {
          const on = i === idx
          return (
            <button
              key={s.src}
              type="button"
              onClick={() => i !== idx && go(i, i > idx ? 1 : -1)}
              aria-label={s.title}
              aria-current={on}
              className="g-tick tr-focus group flex h-3 origin-top items-center border-none bg-transparent p-0"
            >
              <span
                className={`block h-px transition-[width,background-color] duration-500 ${on ? 'w-10 bg-[var(--ribbon-champagne)] shadow-[0_0_0.6rem_var(--ribbon-main-gold)]' : 'w-4 bg-cream/40 group-hover:w-6 group-hover:bg-cream/80'}`}
              />
            </button>
          )
        })}
      </nav>

      {/* ---------- foot: the caption, the arrows and the strip ---------- */}
      <div className="absolute inset-x-0 bottom-0 z-20">
        <div className="flex flex-col gap-6 px-5 pb-[max(1.6rem,var(--safe-b))] sm:px-8 md:flex-row md:items-end md:justify-between md:gap-10 side:px-[2.9rem] side:pb-[2.6rem]">
          {/* caption */}
          <div className="g-chrome min-w-0 md:max-w-[44rem]">
            <span className="flex items-center gap-4">
              <span className="inline-block h-[1.1em] overflow-hidden">
                <span key={flat} className="g-roll tr-num inline-block text-[var(--ribbon-champagne)]">
                  {pad(idx + 1)}
                </span>
              </span>
              <span className="tr-dash" />
              <span className="tr-num">{pad(total)}</span>
              <span className="tr-label ml-2">{category.label}</span>
            </span>
            <h2 key={`t-${flat}`} className="tr-display mt-4 text-[clamp(2.4rem,5.2vw,5.4rem)] leading-[0.98] short:text-[1.8rem]">
              <SplitTitle text={slide.title} />
            </h2>
            <span key={`r-${flat}`} className="g-rule mt-5 block h-px w-24 origin-left bg-[linear-gradient(90deg,var(--ribbon-champagne),var(--ribbon-main-gold),transparent)]" />
            <p key={`s-${flat}`} className="g-sub tr-label mt-4 text-cream/80 short:hidden">
              {slide.subtitle}
            </p>
          </div>

          {/* arrows and the strip */}
          <div className="g-chrome flex shrink-0 items-end gap-4" onPointerEnter={() => setHold(true)} onPointerLeave={() => setHold(false)}>
            <div className="flex gap-2">
              <IconButton label="Previous render" onClick={() => step(-1)}>
                <IcPrev size={18} />
              </IconButton>
              <IconButton label="Next render" onClick={() => step(1)}>
                <IcNext size={18} />
              </IconButton>
            </div>
            <div className="tr-panel rounded-[0.9rem] p-2 md:max-w-[min(28rem,40vw)]">
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
                      onClick={() => i !== idx && go(i, i > idx ? 1 : -1)}
                      onPointerMove={glowAt}
                      className={`g-thumb mn-glow tr-focus relative h-[3.2rem] w-[4.8rem] shrink-0 touch-manipulation overflow-hidden rounded-md border p-[3px] transition-[opacity,border-color,box-shadow] duration-300 short:h-[2.2rem] short:w-[3.2rem] ${on ? 'border-[var(--ribbon-champagne)] opacity-100 shadow-[0_0_1.1rem_color-mix(in_srgb,var(--ribbon-main-gold)_35%,transparent)]' : 'border-[color-mix(in_srgb,var(--ribbon-main-gold)_25%,transparent)] opacity-55 hover:opacity-100'}`}
                    >
                      <img src={sl.src} alt="" className="h-full w-full rounded-[3px] object-cover" draggable={false} />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* the gold line counting down to the next render */}
        <div className="g-chrome relative h-px w-full bg-cream/15">
          <span className="g-progress absolute inset-y-0 left-0 w-full origin-left bg-[linear-gradient(90deg,var(--ribbon-deep-bronze),var(--ribbon-main-gold),var(--ribbon-champagne))] shadow-[0_0_0.8rem_var(--ribbon-main-gold)]" style={{ transform: 'scaleX(0)' }} />
        </div>
      </div>

      {/* ---------- the arrival curtain ---------- */}
      <div className="g-curtain pointer-events-none absolute inset-0 z-40 origin-top bg-espresso" aria-hidden="true">
        <span className="g-curtain-line tr-hair is-gold absolute inset-x-0 bottom-0 origin-center" />
      </div>
    </div>
  )
}

export default Gallery
