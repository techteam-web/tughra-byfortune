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

const ExpandIcon = ({ on }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d={on ? 'M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5' : 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5'} />
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
  const [fs, setFs] = useState(false)
  const [idle, setIdle] = useState(false)
  const sectionRef = useRef(null)
  const tabRefs = useRef([])
  const [pill, setPill] = useState({ x: 0, w: 0 })
  const tabSmRefs = useRef([])
  const [pillSm, setPillSm] = useState({ x: 0, w: 0 })
  const touchX = useRef(0)
  const wheelAt = useRef(0)

  const category = CATEGORIES[cat]
  const slides = category.slides
  const total = slides.length
  const slide = slides[idx]

  // Entrance
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo(sectionRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8 })
      tl.fromTo('.g-chrome', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.4)
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

  // The picture drifts against the pointer, as if the room goes on past the edges
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const gx = gsap.quickTo('.gv-stage', 'x', { duration: 1.6, ease: 'power3.out' })
      const gy = gsap.quickTo('.gv-stage', 'y', { duration: 1.6, ease: 'power3.out' })
      const onMove = (e) => {
        gx((0.5 - e.clientX / window.innerWidth) * 36)
        gy((0.5 - e.clientY / window.innerHeight) * 24)
      }
      window.addEventListener('mousemove', onMove)
      return () => window.removeEventListener('mousemove', onMove)
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  // The interface steps back when nothing has moved for a few seconds
  useEffect(() => {
    let t
    const wake = () => {
      setIdle(false)
      clearTimeout(t)
      t = setTimeout(() => setIdle(true), 3800)
    }
    wake()
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart']
    events.forEach((e) => window.addEventListener(e, wake, { passive: true }))
    return () => {
      clearTimeout(t)
      events.forEach((e) => window.removeEventListener(e, wake))
    }
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

  const toggleFs = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    else document.documentElement.requestFullscreen?.().catch(() => {})
  }

  useEffect(() => {
    const onChange = () => setFs(!!document.fullscreenElement)
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
      if (e.key === 'f' || e.key === 'F') toggleFs()
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
      onWheel={(e) => {
        const now = Date.now()
        if (Math.abs(e.deltaY) < 20 || now - wheelAt.current < 900) return
        wheelAt.current = now
        step(e.deltaY > 0 ? 1 : -1)
      }}
      className={`gx-page ${idle ? 'is-idle' : ''}`}
    >
      {/* The render fills the whole window; every render is stacked, only one is lit */}
      <div className="gv-stage" aria-live="polite">
        {CATEGORIES.flatMap((c, ci) =>
          c.slides.map((s, i) => (
            <div key={c.id + i} className={`gv-slide ${ci === cat && i === idx ? 'is-on' : ''}`}>
              <img src={s.src} alt={ci === cat && i === idx ? s.title : ''} draggable={false} />
            </div>
          ))
        )}
      </div>
      <div className="gv-scrim" />

      {/* Logo, tabs, full screen, Back */}
      <div className="gv-ui gv-ui--top">
        <header className="g-chrome relative flex items-start justify-between gap-3 px-5 pt-5 sm:px-8 md:px-12 md:pt-9">
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
          <div className="flex items-center gap-2.5 md:gap-3">
            <button type="button" onClick={toggleFs} aria-label={fs ? 'Exit full screen' : 'Enter full screen'} className={ctrlClass}>
              <ExpandIcon on={fs} />
            </button>
            <BackButton onClick={onClose} />
          </div>
        </header>

        {/* Tabs for small screens */}
        <div className="g-chrome relative flex justify-center px-5 pt-4 lg:hidden">
          <div className="gl-tabs" role="tablist" aria-label="Collections">
            <span className="gl-pill" style={{ width: pillSm.w, transform: `translateX(${pillSm.x}px)` }} />
            {CATEGORIES.map((c, ci) => (
              <button key={c.id} ref={(el) => (tabSmRefs.current[ci] = el)} type="button" onClick={() => switchCategory(ci)} aria-pressed={ci === cat} className="gl-tab">
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Side arrows */}
      {total > 1 && (
        <div className="gv-ui pointer-events-none flex items-center justify-between px-4 md:px-8" style={{ top: '50%', transform: 'translateY(-50%)' }}>
          <button type="button" onClick={() => step(-1)} aria-label="Previous render" className={ctrlClass + ' pointer-events-auto'}><Chevron dir="left" /></button>
          <button type="button" onClick={() => step(1)} aria-label="Next render" className={ctrlClass + ' pointer-events-auto'}><Chevron dir="right" /></button>
        </div>
      )}

      {/* Caption on the left, every render in the collection on the right */}
      <div className="gv-ui gv-ui--bottom">
        <footer className="g-chrome relative flex flex-col gap-5 px-5 pb-6 sm:px-8 md:flex-row md:items-end md:justify-between md:gap-10 md:px-12 md:pb-9">
          <div className="min-w-0">
            <span className="flex items-center gap-3 text-[0.625rem] uppercase tracking-[0.35rem]" style={{ color: GOLD }}>
              {pad(idx + 1)} <span className="h-px w-7" style={{ background: GOLD }} /> {pad(total)}
            </span>
            <h2 className="mt-2 overflow-hidden font-serif text-[clamp(1.8rem,3.4vw,3.2rem)] font-normal leading-tight text-cream">
              <span className="g-line block truncate">{slide.title}</span>
            </h2>
            <p className="g-fade mt-1 truncate text-[0.75rem] uppercase tracking-[0.2rem] text-cream/70">{slide.subtitle}</p>
          </div>

          <div className="sc-noscroll gx-rail min-w-0 max-w-full md:max-w-[52%]" role="tablist" aria-label={`${category.label} renders`}>
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
        <div className="gv-progress"><i key={category.id + idx} /></div>
      </div>
    </section>
  )
}

export default Gallery
