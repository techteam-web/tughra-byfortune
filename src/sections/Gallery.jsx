import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import BackButton from '../components/BackButton.jsx'

import extDay from '../assets/gallery/exterior/fortune-day-view-1.webp'
import extGolden from '../assets/gallery/exterior/cam-8-goldenhour-01-wm.webp'
import extEvening from '../assets/gallery/exterior/fortune-evenin01-1.webp'
import extEveningCrop from '../assets/gallery/exterior/fortune-evening-crop-1.webp'
import extMetro from '../assets/gallery/exterior/fortunemetro-01.webp'

import intBanquet1 from '../assets/gallery/interior/banquet-hall-cam-03.webp'
import intBanquet2 from '../assets/gallery/interior/banquet-hall-cam-08.webp'
import intGym1 from '../assets/gallery/interior/gym-cam01.webp'
import intGym2 from '../assets/gallery/interior/gym-cam02.webp'
import intGames1 from '../assets/gallery/interior/img-20260922-wa0014.webp'
import intGames2 from '../assets/gallery/interior/img-20260922-wa0016.webp'
import intPodiumAerial from '../assets/gallery/interior/img-20260922-wa0019.webp'
import intPodium from '../assets/gallery/interior/podium-cam-01.webp'
import intPool from '../assets/gallery/interior/swimming-pool.webp'
import intTheatre from '../assets/gallery/interior/theater.webp'

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
    id: 'interior',
    label: 'Interior',
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

const STRIPS = 6

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
  'flex h-[2.75rem] w-[2.75rem] items-center justify-center rounded-full border border-cream/30 bg-black/25 text-cream backdrop-blur-md transition-all duration-300 hover:border-gold hover:text-gold-light'

function Gallery({ onClose }) {
  // `cur` is what's on screen; `incoming` is the slide currently wiping in.
  const [cur, setCur] = useState({ cat: 0, idx: 0 })
  const [incoming, setIncoming] = useState(null)
  const [full, setFull] = useState(false)
  const sectionRef = useRef(null)
  const baseRef = useRef(null)
  const stripsRef = useRef(null)
  const busy = useRef(false)

  const category = CATEGORIES[cur.cat]
  const slides = category.slides
  const slide = slides[cur.idx]
  const total = slides.length
  const nextSlide = incoming ? CATEGORIES[incoming.cat].slides[incoming.idx] : null
  const activeCat = incoming ? incoming.cat : cur.cat

  // Entrance: frame draws in, chrome fades up.
  useLayoutEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.fromTo(sectionRef.current, { opacity: 0 }, { opacity: 1, duration: 0.7 })
    tl.fromTo('.g-frame', { clipPath: 'inset(0 100% 100% 0)' }, { clipPath: 'inset(0 0% 0% 0)', duration: 1.6, ease: 'power3.inOut' }, 0.1)
    tl.fromTo('.g-chrome', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.09 }, 0.35)
    return () => tl.kill()
  }, [])

  // Slow drift on the photo, and the title lines rising out of their masks.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(baseRef.current, { scale: 1 }, { scale: 1.07, duration: 14, ease: 'none' })
      gsap.fromTo('.g-line', { yPercent: 115 }, { yPercent: 0, duration: 1, stagger: 0.1, ease: 'power4.out', delay: 0.1 })
      gsap.fromTo('.g-count', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
    }, sectionRef)
    return () => ctx.revert()
  }, [cur])

  // The transition: six vertical blinds alternate up/down over the old photo
  // while the old title slides out of its mask.
  useLayoutEffect(() => {
    if (!incoming) return
    const strips = stripsRef.current.querySelectorAll('.g-strip')
    const imgs = stripsRef.current.querySelectorAll('.g-strip img')
    const tl = gsap.timeline({
      onComplete: () => {
        busy.current = false
        setCur(incoming)
        setIncoming(null)
      },
    })
    tl.to('.g-line', { yPercent: -115, duration: 0.5, stagger: 0.05, ease: 'power3.in' }, 0)
    tl.to(baseRef.current, { scale: 1.14, duration: 1.3, ease: 'power2.inOut' }, 0)
    strips.forEach((el, i) => {
      tl.fromTo(
        el,
        { clipPath: i % 2 ? 'inset(0 0 100% 0)' : 'inset(100% 0 0 0)' },
        { clipPath: 'inset(0% 0 0% 0)', duration: 1.05, ease: 'power4.inOut' },
        0.05 + i * 0.09
      )
    })
    tl.fromTo(imgs, { scale: 1.25 }, { scale: 1, duration: 1.4, ease: 'power3.out', stagger: 0.09 }, 0.05)
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
    setIncoming({ cat, idx })
  }
  const step = (d) => go(cur.cat, (cur.idx + d + total) % total)
  const switchCategory = (c) => {
    if (c !== cur.cat) go(c, 0)
  }

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

  return (
    <section ref={sectionRef} className="relative h-svh w-full overflow-hidden bg-bg text-cream">
      {/* Current photo */}
      <img
        key={slide.src}
        ref={baseRef}
        src={slide.src}
        alt={slide.title}
        className="absolute inset-0 z-[1] h-full w-full object-cover"
      />

      {/* Incoming photo, sliced into blinds */}
      {nextSlide && (
        <div ref={stripsRef} className="pointer-events-none absolute inset-0 z-[2]">
          {Array.from({ length: STRIPS }, (_, i) => (
            <div
              key={i}
              className="g-strip absolute inset-y-0 overflow-hidden"
              style={{ left: `${(i * 100) / STRIPS}%`, width: `${100 / STRIPS}%` }}
            >
              <img
                src={nextSlide.src}
                alt=""
                className="absolute inset-y-0 h-full object-cover"
                style={{ width: `${STRIPS * 100}%`, left: `${-i * 100}%` }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Quiet vignette so type always reads */}
      <div className="pointer-events-none absolute inset-0 z-[3] bg-[linear-gradient(180deg,rgba(10,9,8,0.55)_0%,transparent_26%,transparent_52%,rgba(10,9,8,0.88)_100%),linear-gradient(90deg,rgba(10,9,8,0.5)_0%,transparent_30%)]" />

      {/* Hairline gold frame */}
      <div className="g-frame pointer-events-none absolute inset-4 z-[4] border border-gold/30 md:inset-6" />

      {/* Top bar */}
      <div className="g-chrome absolute inset-x-0 top-0 z-10 flex items-center justify-between px-9 py-8 md:px-16 md:py-12">
        <button type="button" onClick={onClose} className="flex items-center border-none bg-transparent p-0 text-left">
          <span>
            <strong className="block font-serif text-2xl tracking-[0.375rem] text-cream">TUGHRA</strong>
            <span className="mt-1.5 block text-[0.625rem] tracking-[0.1875rem] text-muted">MUMBAI CENTRAL</span>
          </span>
        </button>
        <BackButton onClick={onClose} />
      </div>

      {/* Exterior / Interior */}
      <div className="g-chrome absolute left-9 top-28 z-10 flex gap-6 md:left-16 md:top-1/2 md:-translate-y-1/2 md:flex-col md:gap-9">
        {CATEGORIES.map((c, ci) => {
          const on = ci === activeCat
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => switchCategory(ci)}
              aria-pressed={on}
              className="group flex flex-col items-start gap-2 border-none bg-transparent p-0 text-left"
            >
              <span className="text-[0.625rem] tracking-[0.3rem] text-gold/80">{pad(ci + 1)}</span>
              <span
                className="font-serif text-[1.375rem] font-light uppercase tracking-[0.25rem] transition-colors duration-500 md:text-[clamp(1.5rem,1.9vw,2.25rem)]"
                style={{ color: on ? '#f3ecd9' : 'rgba(243,236,217,0.4)' }}
              >
                {c.label}
              </span>
              <span className="h-px bg-gold transition-all duration-700 ease-out" style={{ width: on ? '3.5rem' : '0.75rem', opacity: on ? 1 : 0.4 }} />
            </button>
          )
        })}
      </div>

      {/* Caption: counter, mask-revealed title */}
      <div className="absolute inset-x-9 bottom-32 z-10 md:inset-x-16 md:bottom-16 md:right-auto md:max-w-[48%]">
        <div className="g-count mb-5 flex items-baseline gap-3 font-serif">
          <span className="text-[clamp(3rem,5vw,5.5rem)] font-light leading-none text-gold-light">{pad(cur.idx + 1)}</span>
          <span className="text-[0.8125rem] tracking-[0.25rem] text-cream/50">/ {pad(total)}</span>
          <span className="ml-3 hidden text-[0.6875rem] uppercase tracking-[0.3rem] text-gold sm:inline">{category.label} {category.caption}</span>
        </div>
        <div className="overflow-hidden pb-1">
          <h2 className="g-line font-serif text-[clamp(2.25rem,4.6vw,4.5rem)] font-light leading-[1.08] text-cream">{slide.title}</h2>
        </div>
        <div className="overflow-hidden">
          <p className="g-line mt-2 text-[0.8125rem] uppercase tracking-[0.2rem] text-muted">{slide.subtitle}</p>
        </div>
      </div>

      {/* Controls: arrows, full screen, progress hairlines */}
      <div className="g-chrome absolute inset-x-9 bottom-10 z-10 flex flex-col gap-5 md:inset-x-auto md:bottom-16 md:right-16 md:w-[min(30vw,28rem)]">
        <div className="flex items-center gap-3 md:justify-end">
          <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className={ctrlClass}><Chevron dir="left" /></button>
          <button type="button" onClick={() => step(1)} aria-label="Next photo" className={ctrlClass}><Chevron dir="right" /></button>
          <button type="button" onClick={openFull} aria-label="View full screen" title="Full screen (F)" className={ctrlClass}><ExpandIcon /></button>
        </div>
        <div className="flex gap-1.5">
          {slides.map((s, i) => {
            const on = i === (incoming && incoming.cat === cur.cat ? incoming.idx : cur.idx)
            return (
              <button
                key={s.src}
                type="button"
                onClick={() => go(cur.cat, i)}
                aria-label={s.title}
                className="group relative flex-1 border-none bg-transparent py-3"
              >
                <span className="block h-px w-full bg-cream/25" />
                <span
                  className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 bg-gold transition-all duration-700 ease-out"
                  style={{ width: on ? '100%' : '0%' }}
                />
              </button>
            )
          })}
        </div>
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
