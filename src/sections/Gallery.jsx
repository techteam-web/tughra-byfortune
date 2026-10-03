import BrandMark from '../components/BrandMark.jsx'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import BackButton from '../components/BackButton.jsx'

import isoA from '../assets/gallery/iso/Fortune_4BHK_ISO.jpeg'
import isoB from '../assets/gallery/iso/Fortune_5BHK_ISO.jpeg'
import isoC from '../assets/gallery/iso/Fortune_6BHK_ISO.jpg'
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

// Add more entries to either list as renders come in - the switcher counts,
// thumbnails, pagination and transitions all size themselves to the data.
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
  {
    id: 'isometric',
    label: 'Isometric',
    caption: 'View',
    fit: 'contain', // line-art plans should never be cropped
    slides: [
      { src: isoA, title: '4 BHK Residence', subtitle: 'Isometric floor view' },
      { src: isoB, title: '5 BHK Residence', subtitle: 'Isometric floor view' },
      { src: isoC, title: '6 BHK Residence', subtitle: 'Isometric floor view' },
    ],
  },
]

const PLACEHOLDER = { src: null, title: 'Isometric Views', subtitle: 'Unveiling soon' }

const pad = (n) => String(n).padStart(2, '0')

const ExpandIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
  </svg>
)
const Chevron = ({ dir }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d={dir === 'left' ? 'M15 18l-6-6 6-6' : 'M9 6l6 6-6 6'} />
  </svg>
)

const ctrlClass =
  'flex h-[2.75rem] w-[2.75rem] items-center justify-center rounded-full border border-white/50 bg-black/30 text-white backdrop-blur-md transition-all duration-300 hover:border-gold/70 hover:bg-gold/20 hover:text-gold-light'


function Gallery({ onClose }) {
  // `cur` is what's on screen; `incoming` is the slide currently opening up.
  const [cur, setCur] = useState({ cat: 0, idx: 0 })
  const [incoming, setIncoming] = useState(null)
  const [full, setFull] = useState(false)
  const sectionRef = useRef(null)
  const parRef = useRef(null)
  const baseRef = useRef(null)
  const stripsRef = useRef(null)
  const busy = useRef(false)
  const touchX = useRef(0)

  const category = CATEGORIES[cur.cat]
  const slides = category.slides.length ? category.slides : [PLACEHOLDER]
  const slide = slides[cur.idx]
  const total = category.slides.length
  const nextSlide = incoming ? CATEGORIES[incoming.cat].slides[incoming.idx] || PLACEHOLDER : null
  const nextFit = incoming ? CATEGORIES[incoming.cat].fit : null
  const activeCat = incoming ? incoming.cat : cur.cat
  const fitClass = category.fit === 'contain' ? 'object-contain' : 'object-cover'

  // Entrance: the room fades up, chrome slides in.
  useLayoutEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.fromTo(sectionRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8 })
    tl.fromTo('.g-chrome', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, stagger: 0.1 }, 0.4)
    return () => tl.kill()
  }, [])

  // Mouse parallax: the photo drifts against the pointer for depth.
  useLayoutEffect(() => {
    const el = parRef.current
    const qx = gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3.out' })
    const qy = gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3.out' })
    const onMove = (e) => {
      qx((0.5 - e.clientX / window.innerWidth) * 36)
      qy((0.5 - e.clientY / window.innerHeight) * 24)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  // Slow push-in on the photo, title lines and ghost numeral rising in.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(baseRef.current, { scale: 1 }, { scale: 1.08, duration: 16, ease: 'none' })
      gsap.fromTo('.g-line', { yPercent: 115 }, { yPercent: 0, duration: 1.1, stagger: 0.1, ease: 'power4.out', delay: 0.15 })
    }, sectionRef)
    return () => ctx.revert()
  }, [cur])

  // The transition: the next photo opens as an expanding circle from the
  // lower right while the old photo sinks back and dims.
  useLayoutEffect(() => {
    if (!incoming) return
    const layer = stripsRef.current
    const img = layer.querySelector('.g-in')
    const tl = gsap.timeline({
      onComplete: () => {
        busy.current = false
        setCur(incoming)
        setIncoming(null)
      },
    })
    tl.to('.g-line', { yPercent: -115, opacity: 0, duration: 0.55, stagger: 0.05, ease: 'power2.in' }, 0)
    tl.to(baseRef.current, { scale: 1.2, filter: 'brightness(0.4) blur(4px)', duration: 1.5, ease: 'power2.inOut' }, 0)
    tl.fromTo(layer, { clipPath: 'circle(0% at 82% 84%)' }, { clipPath: 'circle(150% at 82% 84%)', duration: 1.5, ease: 'power3.inOut' }, 0)
    tl.fromTo(img, { scale: 1.35 }, { scale: 1, duration: 1.8, ease: 'power3.out' }, 0)
    return () => tl.kill()
  }, [incoming])

  const go = (cat, idx) => {
    if (cat === cur.cat && idx === cur.idx) return
    if (full) {
      setCur({ cat, idx }) // no choreography behind the viewer
      return
    }
    if (busy.current) return
    busy.current = true
    // Large renders: wait until the photo is decoded so the reveal never shows a blank frame.
    const target = CATEGORIES[cat].slides[idx]
    if (!target || !target.src) return setIncoming({ cat, idx })
    const pre = new Image()
    pre.src = target.src
    const start = () => setIncoming({ cat, idx })
    pre.decode ? pre.decode().then(start, start) : (pre.onload = pre.onerror = start)
  }
  const step = (d) => total > 1 && go(cur.cat, (cur.idx + d + total) % total)
  const switchCategory = (c) => {
    if (c !== cur.cat) go(c, 0)
  }

  const openFull = () => {
    if (!slide.src) return
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

  // Warm the cache for the big renders so switching tabs feels instant.
  useEffect(() => {
    const t = setTimeout(() => CATEGORIES.forEach((c) => c.slides.forEach((x) => { new Image().src = x.src })), 1500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
      if (e.key === 'Escape' && full) setFull(false)
      if ((e.key === 'f' || e.key === 'F') && !full) openFull()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const emptyBg = 'bg-[radial-gradient(ellipse_at_70%_40%,#2a2218_0%,#0a0908_70%)]'

  return (
    <section
      ref={sectionRef}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1)
      }}
      className="relative h-svh w-full overflow-hidden bg-[#14110f] text-cream"
    >
      {/* Full-bleed photo stage (parallax) */}
      <div ref={parRef} className="absolute -inset-[3%]">
        <div className="absolute inset-0 bg-[#14110f]" />
        {slide.src ? (
          <img key={slide.src} ref={baseRef} src={slide.src} alt={slide.title} className={`absolute inset-0 h-full w-full ${fitClass}`} />
        ) : (
          <div ref={baseRef} className={`absolute inset-0 ${emptyBg}`} />
        )}
        {nextSlide && (
          <div ref={stripsRef} className="pointer-events-none absolute inset-0 z-[2] overflow-hidden bg-[#14110f]">
            {nextSlide.src ? (
              <img src={nextSlide.src} alt="" className={`g-in absolute inset-0 h-full w-full ${nextFit === 'contain' ? 'object-contain' : 'object-cover'}`} />
            ) : (
              <div className={`g-in absolute inset-0 ${emptyBg}`} />
            )}
          </div>
        )}
      </div>

      {/* Cinematic grading: vignette + bottom and top falloff + gold bloom */}
      <div className="pointer-events-none absolute inset-0 z-[3] bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(10,8,7,0.65)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-[3] bg-[linear-gradient(0deg,rgba(14,11,10,0.92)_0%,rgba(14,11,10,0.25)_38%,transparent_60%),linear-gradient(180deg,rgba(14,11,10,0.7)_0%,transparent_22%)]" />
      <div className="pointer-events-none absolute inset-0 z-[3] bg-[radial-gradient(circle_at_100%_0%,rgba(201,162,39,0.18)_0%,transparent_40%)] mix-blend-screen" />

      {/* Top bar */}
      <div className="g-chrome absolute inset-x-0 top-0 z-20 flex items-center justify-between px-7 py-7 md:px-14 md:py-9">
        <button type="button" onClick={onClose} className="flex items-center border-none bg-transparent p-0 text-left">
          <BrandMark />
        </button>

        {/* Floating category switcher */}
        <div className="absolute left-1/2 top-[5.5rem] flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/15 bg-black/35 p-1 backdrop-blur-xl md:top-8">
          {CATEGORIES.map((c, ci) => {
            const on = ci === activeCat
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => switchCategory(ci)}
                aria-pressed={on}
                className="rounded-full border-none px-3 py-2 text-[0.625rem] font-medium uppercase tracking-[0.125rem] transition-all duration-500 md:px-6"
                style={{
                  background: on ? 'linear-gradient(135deg,#e3c463,#c9a227)' : 'transparent',
                  color: on ? '#1d1816' : 'rgba(243,236,217,0.75)',
                }}
              >
                {c.label}
              </button>
            )
          })}
        </div>

        <BackButton onClick={onClose} />
      </div>

      {/* Caption */}
      <div className="pointer-events-none absolute bottom-[5.5rem] left-7 z-10 right-24 max-w-[44rem] md:bottom-[7rem] md:left-14">
        <div className="mb-4 flex items-center gap-3 text-[0.6875rem] uppercase tracking-[0.25rem] text-gold">
          <span className="h-px w-10 bg-gold/70" />
          {category.label} {category.caption}
        </div>
        <div className="overflow-hidden pb-2">
          <h2 className="g-line font-serif text-[clamp(1.875rem,min(5.5vw,9vh),5.5rem)] font-medium leading-[1.05] text-cream">{slide.title}</h2>
        </div>
        <div className="overflow-hidden">
          <p className="g-line mt-1 text-[0.75rem] [@media(max-height:480px)]:hidden uppercase tracking-[0.25rem] text-cream/70">{slide.subtitle}</p>
        </div>
      </div>

      {/* Controls + film strip, lower right */}
      <div className="g-chrome absolute bottom-0 right-0 z-20 flex max-w-full flex-col items-end gap-4 px-7 pb-9 md:px-14 md:pb-12" style={{ visibility: total ? 'visible' : 'hidden' }}>
        <div className="flex items-center gap-2">
          <span className="mr-3 hidden font-serif text-sm tracking-[0.2rem] text-cream/70 md:block">
            {pad(cur.idx + 1)} <span className="text-gold">/</span> {pad(total)}
          </span>
          <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className={ctrlClass}><Chevron dir="left" /></button>
          <button type="button" onClick={() => step(1)} aria-label="Next photo" className={ctrlClass}><Chevron dir="right" /></button>
          <button type="button" onClick={openFull} aria-label="View full screen" title="Full screen (F)" className={ctrlClass}><ExpandIcon /></button>
        </div>
        <div className="hidden max-w-[34rem] gap-2 overflow-x-auto p-1 md:flex">
          {slides.map((s, i) => {
            const on = i === (incoming && incoming.cat === cur.cat ? incoming.idx : cur.idx)
            return (
              <button
                key={s.src || s.title}
                type="button"
                onClick={() => go(cur.cat, i)}
                aria-label={s.title}
                className="relative h-14 shrink-0 overflow-hidden rounded-lg border bg-transparent p-0 transition-all duration-700"
                style={{
                  width: on ? '5.5rem' : '2.75rem',
                  borderColor: on ? '#e3c463' : 'rgba(255,255,255,0.2)',
                  opacity: on ? 1 : 0.6,
                }}
              >
                {s.src && <img src={s.src} alt="" loading="lazy" className="h-full w-full object-cover" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Progress line */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[0.1875rem] bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-gold to-gold-light transition-all duration-1000"
          style={{ width: `${total ? ((cur.idx + 1) / total) * 100 : 0}%` }}
        />
      </div>

      {/* Full-screen viewer */}
      {full && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <img src={slide.src} alt={slide.title} className="h-full w-full object-contain" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-6 py-5 md:px-12 md:py-8">
            <div className="text-[0.6875rem] uppercase tracking-[0.1875rem] text-gold">
              {category.label} {category.caption}
              <span className="mx-3 inline-block h-px w-8 bg-gold/50 align-middle" />
              {pad(cur.idx + 1)} / {pad(total)}
              <span className="ml-4 text-cream">{slide.title}</span>
            </div>
            <button type="button" onClick={closeFull} aria-label="Exit full screen" className={ctrlClass}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className={ctrlClass + ' absolute left-4 top-1/2 -translate-y-1/2 md:left-8'}><Chevron dir="left" /></button>
          <button type="button" onClick={() => step(1)} aria-label="Next photo" className={ctrlClass + ' absolute right-4 top-1/2 -translate-y-1/2 md:right-8'}><Chevron dir="right" /></button>
        </div>
      )}
    </section>
  )
}

export default Gallery
