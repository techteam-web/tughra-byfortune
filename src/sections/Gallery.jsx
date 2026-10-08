import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import BrandMark from '../components/BrandMark.jsx'
import BackButton from '../components/BackButton.jsx'
import './Menu.css'
import './Showcase.css'

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

// Add more entries to either list as renders come in - the tabs, the ticks
// and the counter all size themselves to the data.
const CATEGORIES = [
  {
    id: 'exterior',
    label: 'Exterior',
    caption: 'Render',
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
    caption: 'Render',
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
const GOLD = '#f0b866'
const GOLD_LIGHT = '#ffd58a'

const ExpandIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
  </svg>
)
const Chevron = ({ dir, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d={dir === 'left' ? 'M15 18l-6-6 6-6' : 'M9 6l6 6-6 6'} />
  </svg>
)

const ctrlClass = 'lux-btn flex h-10 w-10 items-center justify-center rounded-full md:h-11 md:w-11'

function Gallery({ onClose }) {
  const [cat, setCat] = useState(0)
  const [idx, setIdx] = useState(0)
  const [full, setFull] = useState(false)
  const sectionRef = useRef(null)
  const tabRefs = useRef([])
  const [pill, setPill] = useState({ x: 0, w: 0 })
  const tabSmRefs = useRef([])
  const [pillSm, setPillSm] = useState({ x: 0, w: 0 })
  const touchX = useRef(0)

  const category = CATEGORIES[cat]
  const slides = category.slides
  const total = slides.length
  const slide = slides[idx]

  // Entrance
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo(sectionRef.current, { opacity: 0 }, { opacity: 1, duration: 0.7 })
      tl.fromTo('.g-chrome', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.3)
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  // The title and copy rise on every change
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.g-line', { yPercent: 115 }, { yPercent: 0, duration: 0.9, ease: 'power4.out' })
      gsap.fromTo('.g-fade', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, delay: 0.25, ease: 'power3.out' })
    }, sectionRef)
    return () => ctx.revert()
  }, [cat, idx])

  // The render drifts against the pointer, and the light follows it
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const gx = gsap.quickTo('.gl-light', 'x', { duration: 1.1, ease: 'power3.out' })
      const gy = gsap.quickTo('.gl-light', 'y', { duration: 1.1, ease: 'power3.out' })
      const onMove = (e) => {
        gx(e.clientX)
        gy(e.clientY)
        gsap.to('.gl-light', { opacity: 1, duration: 0.8, overwrite: 'auto' })
      }
      window.addEventListener('mousemove', onMove)
      return () => window.removeEventListener('mousemove', onMove)
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  // The tab pill slides to the active tab
  useLayoutEffect(() => {
    const place = () => {
      const el = tabRefs.current[cat]
      if (el) setPill({ x: el.offsetLeft, w: el.offsetWidth })
      const sm = tabSmRefs.current[cat]
      if (sm) setPillSm({ x: sm.offsetLeft, w: sm.offsetWidth })
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [cat])

  const switchCategory = (c) => {
    if (c === cat) return
    setCat(c)
    setIdx(0)
  }
  const step = (d) => total > 1 && setIdx((i) => (i + d + total) % total)

  const openFull = () => {
    setFull(true)
    document.documentElement.requestFullscreen?.().catch(() => {})
  }
  const closeFull = () => {
    setFull(false)
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
  }

  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement) setFull(false)
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    }
  }, [])

  // Warm the cache for the big renders so switching feels instant.
  useEffect(() => {
    const t = setTimeout(() => CATEGORIES.forEach((c) => c.slides.forEach((x) => { new Image().src = x.src })), 1200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') step(1)
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') step(-1)
      if (e.key === 'Escape' && full) closeFull()
      if ((e.key === 'f' || e.key === 'F') && !full) openFull()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <section
      ref={sectionRef}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1)
      }}
      className="gx-page"
    >
      {/* The room takes its colour from whatever render is hanging */}
      <div className="gx-wash">
        {CATEGORIES.flatMap((c, ci) =>
          c.slides.map((s, i) => <img key={c.id + i} src={s.src} alt="" aria-hidden="true" className={ci === cat && i === idx ? 'is-on' : ''} />)
        )}
      </div>
      <div className="gx-veil" />
      <div className="gl-light pointer-events-none absolute left-0 top-0 z-[2] opacity-0" />

      {/* Logo, tabs, Back */}
      <header className="g-chrome relative z-20 flex shrink-0 items-start justify-between gap-3 px-5 pt-5 sm:px-8 md:px-12 md:pt-9">
        <button type="button" onClick={onClose} className="border-none bg-transparent p-0 text-left">
          <BrandMark />
        </button>
        <div className="mt-1 hidden lg:block">
        <div className="gl-tabs" role="tablist" aria-label="Collections">
          <span className="gl-pill" style={{ width: pill.w, transform: `translateX(${pill.x}px)` }} />
          {CATEGORIES.map((c, ci) => (
            <button key={c.id} ref={(el) => (tabRefs.current[ci] = el)} type="button" onClick={() => switchCategory(ci)} aria-pressed={ci === cat} className="gl-tab">
              {c.label}
            </button>
          ))}
        </div>
        </div>
        <BackButton onClick={onClose} />
      </header>

      {/* Tabs for small screens */}
      <div className="g-chrome relative z-20 flex shrink-0 justify-center px-5 pt-4 lg:hidden">
        <div className="gl-tabs" role="tablist" aria-label="Collections">
          <span className="gl-pill" style={{ width: pillSm.w, transform: `translateX(${pillSm.x}px)` }} />
          {CATEGORIES.map((c, ci) => (
            <button key={c.id} ref={(el) => (tabSmRefs.current[ci] = el)} type="button" onClick={() => switchCategory(ci)} aria-pressed={ci === cat} className="gl-tab">
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* The hung render */}
      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-5 py-4 sm:px-8 md:px-12 md:py-5">
        <button
          type="button"
          onClick={openFull}
          aria-label={`View ${slide.title} full screen`}
          className="gx-frame"
          key={category.id + idx}
        >
          <img src={slide.src} alt={slide.title} />
          <span className="gx-mark"><ExpandIcon /></span>
        </button>
      </div>

      {/* Caption, then every render in the collection on one rail */}
      <footer className="g-chrome relative z-20 shrink-0 px-5 pb-5 sm:px-8 md:px-12 md:pb-7">
        <div className="flex items-end justify-between gap-5">
          <div className="min-w-0">
            <span className="flex items-center gap-3 text-[0.625rem] uppercase tracking-[0.35rem]" style={{ color: GOLD }}>
              {pad(idx + 1)} <span className="h-px w-7" style={{ background: GOLD }} /> {pad(total)}
            </span>
            <h2 className="mt-2 overflow-hidden font-serif text-[clamp(1.35rem,2.4vw,2.2rem)] font-normal leading-tight text-cream">
              <span className="g-line block truncate">{slide.title}</span>
            </h2>
            <p className="g-fade mt-1 truncate text-[0.75rem] uppercase tracking-[0.2rem] text-cream/65">{slide.subtitle}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2.5 md:gap-3">
            <button type="button" onClick={() => step(-1)} aria-label="Previous render" className={ctrlClass}><Chevron dir="left" /></button>
            <button type="button" onClick={() => step(1)} aria-label="Next render" className={ctrlClass}><Chevron dir="right" /></button>
          </div>
        </div>

        <div className="sc-noscroll gx-rail" role="tablist" aria-label={`${category.label} renders`}>
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              role="tab"
              aria-selected={i === idx}
              aria-label={s.title}
              onClick={() => setIdx(i)}
              className={`gx-chip ${i === idx ? 'is-on' : ''}`}
            >
              <img src={s.src} alt="" loading="lazy" />
              <span className="gx-chip-no">{pad(i + 1)}</span>
            </button>
          ))}
        </div>
      </footer>

      {/* Full-screen viewer */}
      {full && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2a0713]">
          <img src={slide.src} alt={slide.title} className="h-full w-full object-contain" />
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-6 py-5 md:px-12 md:py-8 [&_button]:pointer-events-auto">
            <div className="text-[0.6875rem] uppercase tracking-[0.1875rem]" style={{ color: GOLD, textShadow: '0 0.125rem 1rem rgba(0,0,0,0.65)' }}>
              {category.label} {category.caption}
              <span className="mx-3 inline-block h-px w-8 align-middle" style={{ background: GOLD }} />
              {pad(idx + 1)} / {pad(total)}
              <span className="ml-4 text-cream">{slide.title}</span>
            </div>
            <button type="button" onClick={closeFull} aria-label="Exit full screen" className={ctrlClass}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <button type="button" onClick={() => step(-1)} aria-label="Previous render" className={ctrlClass + ' absolute left-4 top-1/2 -translate-y-1/2 md:left-8'}><Chevron dir="left" /></button>
          <button type="button" onClick={() => step(1)} aria-label="Next render" className={ctrlClass + ' absolute right-4 top-1/2 -translate-y-1/2 md:right-8'}><Chevron dir="right" /></button>
        </div>
      )}
    </section>
  )
}

export default Gallery
