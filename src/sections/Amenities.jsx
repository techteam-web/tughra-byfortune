import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import BackButton from '../components/BackButton.jsx'
import BrandMark from '../components/BrandMark.jsx'
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

// Add more entries here as amenity photos/copy come in - the panel count,
// the numbering and the progress line all size themselves to however many
// entries exist.
const AMENITIES = [
  {
    icon: 'pool',
    title: 'Swimming Pool',
    description: 'Laps and lazy afternoons, suspended above the city.',
    image: poolImg,
  },
  {
    icon: 'dumbbell',
    title: 'Fitness Centre',
    description: 'A fully equipped space to train, recover and stay at your best.',
    image: gym1Img,
  },
  {
    icon: 'dumbbell',
    title: 'Fitness Studio',
    description: 'Open, light-filled and built for every kind of workout.',
    image: gym2Img,
  },
  {
    icon: 'group',
    title: 'Banquet Hall',
    description: 'An elegant venue for celebrations, events and gatherings.',
    image: banquetImg,
  },
  {
    icon: 'group',
    title: 'Grand Hall',
    description: 'Flexible space that adapts to every occasion.',
    image: hallImg,
  },
  {
    icon: 'lounge',
    title: 'Private Theatre',
    description: 'Cinema-grade viewing, reserved for residents.',
    image: theatreImg,
  },
  {
    icon: 'play',
    title: 'Games Lounge',
    description: 'Chess, billiards and conversation in a relaxed social setting.',
    image: games1Img,
  },
  {
    icon: 'play',
    title: 'Recreation Room',
    description: 'Table tennis, pool and more for friendly rivalry.',
    image: games2Img,
  },
  {
    icon: 'leaf',
    title: 'Podium Garden',
    description: 'A landscaped retreat framed by open sky and greenery.',
    image: gardenImg,
  },
  {
    icon: 'leaf',
    title: 'Podium Deck',
    description: 'Gardens, courts and pools, all within the podium.',
    image: deckImg,
  },
]

const ICONS = {
  pool: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 17c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0" />
      <path d="M2 21c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0" />
      <path d="M7 13V5a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v8" />
    </svg>
  ),
  dumbbell: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9v6M2 10v4M20 9v6M22 10v4M7 12h10" />
      <rect x="4" y="7.5" width="3" height="9" rx="1" />
      <rect x="17" y="7.5" width="3" height="9" rx="1" />
    </svg>
  ),
  lounge: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13h5l3-4h8a2 2 0 0 1 2 2v2" />
      <path d="M3 13v6M21 13v2a2 2 0 0 1-2 2H5" />
    </svg>
  ),
  leaf: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 21c8 0 14-6 14-14V5h-2C9 5 5 11 5 19v2z" />
      <path d="M5 21c3.5-4.5 7-8.5 13.5-14.5" />
    </svg>
  ),
  play: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3c2.5 2.5 2.5 15.5 0 18M3 12c2.5-2.5 15.5-2.5 18 0" />
    </svg>
  ),
  group: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9.5" r="2.3" />
      <path d="M3.5 20c0-3.3 2.4-5.5 5.5-5.5s5.5 2.2 5.5 5.5" />
      <path d="M15 20c0-2.4 1-4 3.5-4.6" />
    </svg>
  ),
}

const AUTOPLAY_MS = 7000

function Amenities({ onClose }) {
  const [index, setIndex] = useState(0)
  const [full, setFull] = useState(false)
  const sectionRef = useRef(null)
  const parRef = useRef(null)
  const total = AMENITIES.length
  const item = AMENITIES[index]
  const pad = (n) => String(n).padStart(2, '0')

  // Cinematic entrance on first mount.
  useLayoutEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.fromTo(sectionRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8 })
    tl.fromTo('.amenity-chrome', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.35)
    tl.fromTo('.amenity-index-row', { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.7, stagger: 0.05 }, 0.5)
    return () => tl.kill()
  }, [])

  // Mouse parallax across the whole stage.
  useLayoutEffect(() => {
    const el = parRef.current
    const qx = gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3.out' })
    const qy = gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3.out' })
    const onMove = (e) => {
      qx((0.5 - e.clientX / window.innerWidth) * 40)
      qy((0.5 - e.clientY / window.innerHeight) * 26)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  // Title lines and ghost numeral rise in on every change.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.amenity-line', { yPercent: 115 }, { yPercent: 0, duration: 1.1, stagger: 0.1, ease: 'power4.out', delay: 0.2 })
    }, sectionRef)
    return () => ctx.revert()
  }, [index])

  const openFull = () => {
    setFull(true)
    document.documentElement.requestFullscreen?.().catch(() => {})
  }
  const closeFull = () => {
    setFull(false)
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
  }
  const goNext = () => setIndex((i) => (i + 1) % total)
  const goPrev = () => setIndex((i) => (i - 1 + total) % total)

  // Autoplay: restarts on every change, pauses behind the full-screen viewer.
  useEffect(() => {
    if (full) return
    const t = setTimeout(goNext, AUTOPLAY_MS)
    return () => clearTimeout(t)
  }, [index, full])

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
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext()
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev()
      if (e.key === 'Escape' && full) closeFull()
      if ((e.key === 'f' || e.key === 'F') && !full) openFull()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [full])

  const ctrl =
    'flex h-[2.75rem] w-[2.75rem] items-center justify-center rounded-full border border-white/50 bg-black/30 text-white backdrop-blur-md transition-all duration-300 hover:border-gold/70 hover:bg-gold/20 hover:text-gold-light'

  return (
    <section ref={sectionRef} className="relative h-svh w-full overflow-hidden bg-[#14110f] text-cream">
      <style>{`@keyframes amenityFill { from { transform: scaleX(0) } to { transform: scaleX(1) } }`}</style>

      {/* Full-bleed stage: every photo stacked, the active one crossfades and settles */}
      <div ref={parRef} className="absolute -inset-[3%]">
        {AMENITIES.map((a, i) => {
          const on = i === index
          return (
            <img
              key={a.title}
              src={a.image}
              alt={on ? a.title : ''}
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                opacity: on ? 1 : 0,
                transform: on ? 'scale(1)' : 'scale(1.18)',
                filter: on ? 'blur(0px)' : 'blur(6px)',
                transition: on
                  ? 'opacity 1.4s ease, transform 2.4s cubic-bezier(0.22,1,0.36,1), filter 1.4s ease'
                  : 'opacity 1.4s ease, transform 0s linear 1.4s, filter 0s linear 1.4s',
                zIndex: on ? 1 : 0,
              }}
            />
          )
        })}
      </div>

      {/* Cinematic grading */}
      <div className="pointer-events-none absolute inset-0 z-[3] bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(10,8,7,0.7)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-[3] bg-[linear-gradient(90deg,rgba(14,11,10,0.85)_0%,rgba(14,11,10,0.35)_40%,transparent_70%),linear-gradient(0deg,rgba(14,11,10,0.85)_0%,transparent_40%),linear-gradient(180deg,rgba(14,11,10,0.65)_0%,transparent_20%)]" />
      <div className="pointer-events-none absolute inset-0 z-[3] bg-[radial-gradient(circle_at_100%_0%,rgba(201,162,39,0.18)_0%,transparent_40%)] mix-blend-screen" />

      {/* Top bar */}
      <div className="amenity-chrome absolute inset-x-0 top-0 z-20 flex items-center justify-between px-7 py-7 md:px-14 md:py-9">
        <button type="button" onClick={onClose} className="flex items-center border-none bg-transparent p-0 text-left">
          <BrandMark />
        </button>

        <div className="hidden items-center gap-3 text-[0.6875rem] uppercase tracking-[0.1875rem] text-gold md:flex">
          Amenities
          <span className="h-px w-8 bg-gold/50" />
          {pad(index + 1)} / {pad(total)}
        </div>

        <BackButton onClick={onClose} />
      </div>

      {/* Index list, left (desktop) */}
      <nav className="absolute left-14 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-1 [@media(min-width:1024px)_and_(min-height:620px)]:flex" aria-label="Amenities">
        <div className="amenity-chrome mb-4 flex items-center gap-2 text-[0.5625rem] uppercase tracking-[0.25rem] text-muted">
          <span className="h-px w-4 bg-gold/60" />
          The Collection
        </div>
        {AMENITIES.map((a, i) => {
          const on = i === index
          return (
            <button
              key={a.title}
              type="button"
              onClick={() => setIndex(i)}
              onMouseEnter={() => setIndex(i)}
              className="amenity-index-row group flex items-center gap-3 border-none bg-transparent p-0 py-[0.3125rem] text-left"
            >
              <span className="w-5 font-serif text-[0.75rem] transition-colors duration-500" style={{ color: on ? '#e3c463' : 'rgba(243,236,217,0.4)' }}>
                {pad(i + 1)}
              </span>
              <span
                className="h-px bg-gold transition-all duration-700"
                style={{ width: on ? '2.5rem' : '0.75rem', opacity: on ? 1 : 0.35 }}
              />
              <span
                className="text-[0.75rem] uppercase tracking-[0.2rem] transition-all duration-500 group-hover:text-cream"
                style={{ color: on ? '#f3ecd9' : 'rgba(243,236,217,0.5)', transform: on ? 'translateX(0.25rem)' : 'none' }}
              >
                {a.title}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Title block */}
      <div className="pointer-events-none absolute bottom-[9.5rem] left-7 right-7 z-10 md:left-14 md:right-14 lg:bottom-[7rem] lg:left-auto lg:max-w-[34rem]">
        <div className="mb-4 flex items-center gap-3 text-[0.6875rem] uppercase tracking-[0.25rem] text-gold">
          <span className="h-px w-10 bg-gold/70" />
          Residents' Club
        </div>
        <div className="overflow-hidden pb-2">
          <h2 key={'t' + index} className="amenity-line font-serif text-[clamp(1.875rem,min(5vw,9vh),5rem)] font-medium leading-[1.05] text-cream">
            {item.title}
          </h2>
        </div>
        <div className="overflow-hidden">
          <p key={"d" + index} className="amenity-line max-w-md [@media(max-height:480px)]:hidden text-[0.9375rem] leading-relaxed text-cream/75">
            {item.description}
          </p>
        </div>
      </div>

      {/* Controls, lower right */}
      <div className="amenity-chrome absolute bottom-0 right-0 z-20 flex flex-col items-end gap-5 px-7 pb-9 md:px-14 md:pb-12">
        <div className="flex items-center gap-2">
          <button type="button" onClick={goPrev} aria-label="Previous amenity" className={ctrl}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button type="button" onClick={goNext} aria-label="Next amenity" className={ctrl}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
          </button>
          <button type="button" onClick={openFull} aria-label={'View ' + item.title + ' full screen'} title="Full screen (F)" className={ctrl}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
          </button>
        </div>
      </div>

      {/* Mobile: icon chips */}
      <div className="amenity-chrome absolute inset-x-0 bottom-[5.5rem] z-20 flex gap-2 overflow-x-auto px-7 md:px-14 [@media(min-width:1024px)_and_(min-height:620px)]:hidden">
        {AMENITIES.map((a, i) => (
          <button
            key={a.title}
            type="button"
            onClick={() => setIndex(i)}
            className="flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[0.625rem] uppercase tracking-[0.15rem] backdrop-blur-md"
            style={{
              borderColor: i === index ? 'rgba(201,162,39,0.8)' : 'rgba(255,255,255,0.2)',
              background: i === index ? 'rgba(201,162,39,0.25)' : 'rgba(0,0,0,0.3)',
              color: i === index ? '#f3ecd9' : 'rgba(243,236,217,0.65)',
            }}
          >
            {ICONS[a.icon]}
            {a.title}
          </button>
        ))}
      </div>

      {/* Autoplay progress */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[0.1875rem] bg-white/10">
        <div
          key={index + (full ? 'f' : '')}
          className="h-full origin-left bg-gradient-to-r from-gold to-gold-light"
          style={{ animation: full ? 'none' : `amenityFill ${AUTOPLAY_MS}ms linear forwards` }}
        />
      </div>

      {/* Full-screen viewer */}
      {full && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <img src={item.image} alt={item.title} className="h-full w-full object-contain" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-6 py-5 md:px-12 md:py-8">
            <div className="text-[0.6875rem] uppercase tracking-[0.1875rem] text-gold">
              Amenities
              <span className="mx-3 inline-block h-px w-8 bg-gold/50 align-middle" />
              {pad(index + 1)} / {pad(total)}
              <span className="ml-4 text-cream">{item.title}</span>
            </div>
            <button type="button" onClick={closeFull} aria-label="Exit full screen" className={ctrl}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
          <button type="button" onClick={goPrev} aria-label="Previous photo" className={ctrl + ' absolute left-4 top-1/2 -translate-y-1/2 md:left-8'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button type="button" onClick={goNext} aria-label="Next photo" className={ctrl + ' absolute right-4 top-1/2 -translate-y-1/2 md:right-8'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
          </button>
        </div>
      )}
    </section>
  )
}

export default Amenities
