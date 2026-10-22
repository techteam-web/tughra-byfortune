import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, fx, EASE, PAGE_IN, REDUCED } from '../motion/index.js'
import { TopBar, BackControl, IconButton, Segmented } from '../ui/controls.jsx'
import { IcPrev, IcNext, IcExpand, IcCollapse } from '../ui/icons.jsx'

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

// Add more entries to either list as renders come in - the tabs, the counter and the
// progress all size themselves to the data.
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

// The frame the picture sits in on the page, and edge to edge in the full-screen view
const FRAME = { top: '9.5rem', right: '2.9rem', bottom: '5.25rem', left: '2.9rem' }
const BLEED = { top: '0rem', right: '0rem', bottom: '0rem', left: '0rem' }

// A framed gallery: each render sits in a clean frame on the espresso ground, with a single
// quiet line of words beneath it. A new render is uncovered by a panel that slides across
// as the picture settles out of a slow zoom. One button lets the frame open out to the
// whole screen, with nothing else on it.
function Gallery({ onClose }) {
  const [cat, setCat] = useState(0)
  const [idx, setIdx] = useState(0)
  const [full, setFull] = useState(false)
  const [inset, setInset] = useState({ top: 0, right: 0 }) // the letterbox gap around the fitted render
  const rootRef = useRef(null)
  const frameRef = useRef(null)
  const prevFlat = useRef(null)
  const dir = useRef(1)
  const touchX = useRef(0)
  const wheelAt = useRef(0)
  const firstFull = useRef(true)

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

  // Arrival: the frame opens from a thin line, the picture settles, then the words come in
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(frameRef.current, FRAME)
      const tl = gsap.timeline({ delay: PAGE_IN })
      if (REDUCED) {
        tl.add(fx.show('.g-frame, .g-ui'), 0)
        return
      }
      tl.fromTo('.g-frame', { clipPath: 'inset(50% 0% 50% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' }, 0)
      tl.fromTo('.g-zoom', { scale: 1.18 }, { scale: 1, duration: 2.4, ease: 'expo.out' }, 0.3)
      tl.add(fx.fade('.tb-anim', { y: -10 }), 0.9)
      tl.add(fx.fade('.g-ui', { y: 10, stagger: 0.08 }), 1.1)
    }, rootRef)
    return () => ctx.revert()
  }, [])

  // The change of render: a panel of the page's own espresso slides across, and the new
  // picture is uncovered behind it while easing out of a slow zoom
  useLayoutEffect(() => {
    const root = rootRef.current
    const inEl = root.querySelector(`[data-slide="${flat}"]`)
    const outEl = prevFlat.current === null ? null : root.querySelector(`[data-slide="${prevFlat.current}"]`)
    prevFlat.current = flat
    if (!inEl) return
    const inImg = inEl.querySelector('img')

    if (!outEl || outEl === inEl || REDUCED) {
      root.querySelectorAll('[data-slide]').forEach((el) => gsap.set(el, { autoAlpha: el === inEl ? 1 : 0 }))
      return
    }

    const d = dir.current
    const tl = gsap.timeline({ onComplete: () => gsap.set('.g-wipe', { autoAlpha: 0 }) })
    tl.set('.g-wipe', { xPercent: d > 0 ? -101 : 101, autoAlpha: 1 })
    tl.to('.g-wipe', { xPercent: 0, duration: 0.6, ease: 'power3.in' }, 0)
    tl.add(() => {
      gsap.set(outEl, { autoAlpha: 0 })
      gsap.set(inEl, { autoAlpha: 1 })
    })
    tl.to('.g-wipe', { xPercent: d > 0 ? 101 : -101, duration: 0.9, ease: 'expo.out' })
    tl.fromTo(inImg, { scale: 1.12, xPercent: d * 3 }, { scale: 1, xPercent: 0, duration: 2.2, ease: 'expo.out' }, '<')
    return () => tl.progress(1).kill()
  }, [flat])

  // The words beneath change with a short rise
  useLayoutEffect(() => {
    if (REDUCED) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.g-caption > *', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.7, ease: EASE.soft, stagger: 0.06, delay: 0.55 })
    }, rootRef)
    return () => ctx.revert()
  }, [flat])

  // Full screen: the frame opens out to the edges and everything else steps away
  useLayoutEffect(() => {
    if (firstFull.current) {
      firstFull.current = false
      return
    }
    const d = REDUCED ? 0 : 1.1
    gsap.to(frameRef.current, { ...(full ? BLEED : FRAME), duration: d, ease: 'expo.inOut', overwrite: 'auto' })
    gsap.to(rootRef.current.querySelectorAll('.g-chrome'), { autoAlpha: full ? 0 : 1, duration: full ? 0.35 : 0.6, delay: full ? 0 : d * 0.6, ease: EASE.soft, overwrite: 'auto' })
    gsap.to(rootRef.current.querySelector('.g-exit'), { autoAlpha: full ? 1 : 0, duration: 0.5, delay: full ? d * 0.8 : 0, ease: EASE.soft, overwrite: 'auto' })
  }, [full])

  // The renders run from tall portrait to very wide, so each one is letterboxed in the frame
  // by a different amount. Measure where the fitted picture's own top-right corner lands, so
  // the full-screen button can sit on the picture rather than in the gap beside it. A
  // ResizeObserver covers both window resizes and the frame opening out to full screen.
  useLayoutEffect(() => {
    const frame = frameRef.current
    const img = frame?.querySelector(`[data-slide="${flat}"] img`)
    if (!frame || !img) return
    const place = () => {
      const { clientWidth: fw, clientHeight: fh } = frame
      const { naturalWidth: nw, naturalHeight: nh } = img
      if (!nw || !nh || !fw || !fh) return
      const scale = Math.min(fw / nw, fh / nh)
      setInset({ top: Math.round((fh - nh * scale) / 2), right: Math.round((fw - nw * scale) / 2) })
    }
    place()
    img.addEventListener('load', place)
    const ro = new ResizeObserver(place)
    ro.observe(frame)
    return () => {
      img.removeEventListener('load', place)
      ro.disconnect()
    }
  }, [flat])

  // Autoplay: a gold hairline fills under the picture, then the next render comes in
  useEffect(() => {
    const line = rootRef.current?.querySelector('.g-progress')
    if (!line) return
    const t = gsap.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: AUTOPLAY, ease: 'none', onComplete: () => step(1) })
    return () => t.kill()
  }, [flat, step])

  // warm the cache so every render is ready when it is called
  useEffect(() => {
    const t = setTimeout(() => FLAT.forEach((s) => (new Image().src = s.src)), 1200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') step(1)
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') step(-1)
      if (e.key === 'f' || e.key === 'F') setFull((v) => !v)
      if (e.key === 'Escape') setFull(false)
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
      {/* ---------- the frame, and every render stacked in it ---------- */}
      <div ref={frameRef} className="g-frame absolute overflow-clip" aria-live="polite">
        <div className="g-zoom absolute inset-0">
          {FLAT.map((s, i) => (
            <div key={s.src} data-slide={i} className="invisible absolute inset-0 overflow-clip">
              {/* contain, not cover: every render is shown whole, never cropped to the frame */}
              <img src={s.src} alt={i === flat ? s.title : ''} className="absolute inset-0 h-full w-full object-contain will-change-transform" draggable={false} />
            </div>
          ))}
        </div>
        {/* The panel that crosses between renders. Its transform is GSAP's alone - an inline
            transform here would be re-applied on every render and fight the tween. */}
        <span className="g-wipe pointer-events-none invisible absolute inset-0 z-10 bg-espresso" aria-hidden="true">
          <span className="absolute inset-y-0 right-0 w-px bg-[var(--ribbon-main-gold)]/60" />
        </span>
        {/* in the full-screen view, the picture's halves step back and forth */}
        {full && (
          <>
            <button type="button" aria-label="Previous render" onClick={() => step(-1)} className="absolute inset-y-0 left-0 z-20 w-1/3 cursor-w-resize border-none bg-transparent" />
            <button type="button" aria-label="Next render" onClick={() => step(1)} className="absolute inset-y-0 right-0 z-20 w-1/3 cursor-e-resize border-none bg-transparent" />
          </>
        )}
        {/* full screen, in the picture's own top-right corner */}
        <div className="g-chrome absolute z-30" style={{ top: inset.top + 16, right: inset.right + 16 }}>
          <IconButton label="Full screen (F)" onClick={() => setFull(true)} small>
            <IcExpand size={15} />
          </IconButton>
        </div>
      </div>

      {/* ---------- top: the logo, the collections, back ---------- */}
      <div className="g-chrome relative z-30">
        <TopBar onBrand={onClose}>
          <div className="g-ui flex items-center gap-3">
            <div className="mr-1 hidden md:block">
              <Segmented options={TABS} value={cat} onChange={switchCategory} label="Collections" />
            </div>
            <BackControl onClick={onClose} />
          </div>
        </TopBar>
      </div>

      {/* ---------- beneath the frame: one quiet line, the arrows, the progress ---------- */}
      <div className="g-chrome absolute inset-x-0 bottom-0 z-30 px-5 pb-[max(1.4rem,var(--safe-b))] sm:px-8 side:px-[2.9rem]" style={{ height: FRAME.bottom }}>
        <span className="absolute inset-x-5 top-0 block h-px bg-cream/12 sm:inset-x-8 side:inset-x-[2.9rem]">
          <span className="g-progress absolute inset-0 origin-left bg-[var(--ribbon-main-gold)]" style={{ transform: 'scaleX(0)' }} />
        </span>
        <div className="g-ui flex h-full items-center justify-between gap-6">
          <div className="g-caption flex min-w-0 items-baseline gap-4">
            <span className="tr-num shrink-0 text-[var(--ribbon-champagne)]">
              {pad(idx + 1)} <span className="text-cream/40">/ {pad(total)}</span>
            </span>
            <span className="truncate font-serif text-[1.25rem] leading-none text-cream">{slide.title}</span>
            <span className="hidden truncate font-sans text-[0.72rem] uppercase tracking-[0.18em] text-cream/55 lg:inline">{slide.subtitle}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <IconButton label="Previous render" onClick={() => step(-1)} small>
              <IcPrev size={15} />
            </IconButton>
            <IconButton label="Next render" onClick={() => step(1)} small>
              <IcNext size={15} />
            </IconButton>
          </div>
        </div>
      </div>

      {/* collections on small screens */}
      <div className="g-chrome g-ui absolute inset-x-0 top-[5.25rem] z-30 flex justify-center md:hidden">
        <Segmented options={TABS} value={cat} onChange={switchCategory} label="Collections" />
      </div>

      {/* ---------- full screen: the only thing left is the way out ---------- */}
      <div className="g-exit absolute right-4 top-[max(1rem,var(--safe-t))] z-40 opacity-0 sm:right-6" style={{ visibility: 'hidden' }}>
        <IconButton label="Exit full screen (Esc)" onClick={() => setFull(false)}>
          <IcCollapse size={17} />
        </IconButton>
      </div>
    </div>
  )
}

export default Gallery
