import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import BackButton from '../components/BackButton.jsx'
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

function Amenities({ onClose }) {
  const [index, setIndex] = useState(0)
  const [full, setFull] = useState(false)
  const sectionRef = useRef(null)
  const total = AMENITIES.length

  // Cinematic entrance on first mount, mirroring the site's other full-page views.
  useLayoutEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
    tl.fromTo(sectionRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 })
    tl.fromTo('.amenity-chrome', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.06 }, 0.2)
    tl.fromTo(
      '.amenity-panel',
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out' },
      0.15
    )
    return () => tl.kill()
  }, [])

  const openFull = (i) => {
    setIndex(i)
    setFull(true)
    document.documentElement.requestFullscreen?.().catch(() => {})
  }
  const closeFull = () => {
    setFull(false)
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
  }
  const goNext = () => setIndex((i) => (i + 1) % total)
  const goPrev = () => setIndex((i) => (i - 1 + total) % total)

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
    if (!full) return
    const onKey = (e) => {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'Escape') setFull(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [full])

  const ctrl =
    'flex h-[2.75rem] w-[2.75rem] items-center justify-center rounded-full border border-white/60 bg-black/30 text-white backdrop-blur-md transition-colors duration-300 hover:border-gold/60 hover:text-gold-light'

  return (
    <section ref={sectionRef} className="relative flex h-svh w-full flex-col overflow-hidden bg-bg text-cream">
      {/* Top bar */}
      <div className="amenity-chrome relative z-20 flex items-center justify-between px-6 py-6 md:px-12 md:py-8">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center border-none bg-transparent p-0 text-left"
        >
          <span>
            <strong className="block font-serif text-2xl tracking-[0.375rem] text-cream">TUGHRA</strong>
            <span className="mt-1.5 block text-[0.625rem] tracking-[0.1875rem] text-muted">MUMBAI CENTRAL</span>
          </span>
        </button>

        <div className="hidden items-center gap-3 text-[0.6875rem] uppercase tracking-[0.1875rem] text-gold md:flex">
          Amenities
          <span className="h-px w-8 bg-gold/50" />
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </div>

        <BackButton onClick={onClose} />
      </div>

      {/* Expanding panel accordion */}
      <div className="relative z-10 flex flex-1 gap-1.5 overflow-hidden px-4 pb-6 md:gap-2 md:px-10 md:pb-10">
        {AMENITIES.map((item, i) => {
          const isActive = i === index
          return (
            <button
              key={item.title}
              type="button"
              onClick={() => setIndex(i)}
              onMouseEnter={() => setIndex(i)}
              aria-label={item.title}
              className="amenity-panel group relative overflow-hidden rounded-2xl border border-white/10 text-left outline-none"
              style={{
                flexGrow: isActive ? 12 : 1,
                flexShrink: 1,
                flexBasis: 0,
                transition: 'flex-grow 0.7s cubic-bezier(0.65, 0, 0.35, 1)',
                minWidth: 0,
              }}
            >
              {/* Photo */}
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover transition-all duration-700"
                style={{
                  filter: isActive ? 'grayscale(0) brightness(1)' : 'grayscale(0.55) brightness(0.55)',
                  transform: isActive ? 'scale(1.02)' : 'scale(1.12)',
                }}
              />
              {/* Overlay gradient */}
              <div
                className="pointer-events-none absolute inset-0 transition-opacity duration-700"
                style={{
                  background: isActive
                    ? 'linear-gradient(0deg, rgba(10,9,8,0.88) 0%, rgba(10,9,8,0.15) 45%, rgba(10,9,8,0.35) 100%)'
                    : 'linear-gradient(0deg, rgba(10,9,8,0.75) 0%, rgba(10,9,8,0.35) 60%, rgba(10,9,8,0.55) 100%)',
                }}
              />
              <div
                className="pointer-events-none absolute inset-0 transition-colors duration-700"
                style={{ backgroundColor: isActive ? 'transparent' : 'rgba(10,9,8,0.25)' }}
              />

              {/* Number, top */}
              <span
                className="absolute left-0 right-0 top-5 text-center font-serif text-[0.8125rem] transition-colors duration-500 md:top-6"
                style={{ color: isActive ? '#e3c463' : 'rgba(243,236,217,0.55)' }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* Collapsed state: icon + upright label */}
              <div
                className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-t from-black/70 to-transparent px-2 pb-6 pt-10 transition-opacity duration-500"
                style={{ opacity: isActive ? 0 : 1 }}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white">
                  {ICONS[item.icon]}
                </span>
                <span
                  className="text-center text-[0.6875rem] font-semibold uppercase leading-tight tracking-[0.5px] text-white"
                  style={{ textShadow: '0 0.125rem 0.625rem rgba(0,0,0,0.9)' }}
                >
                  {item.title}
                </span>
              </div>

              {/* Full-screen toggle: appears on the open panel */}
              <span
                role="button"
                tabIndex={isActive ? 0 : -1}
                aria-label={'View ' + item.title + ' full screen'}
                title="Full screen"
                onClick={(e) => {
                  e.stopPropagation()
                  openFull(i)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation()
                    e.preventDefault()
                    openFull(i)
                  }
                }}
                className={ctrl + ' absolute right-4 top-4 z-10 cursor-pointer transition-opacity duration-500 md:right-6 md:top-5'}
                style={{ opacity: isActive ? 1 : 0, pointerEvents: isActive ? 'auto' : 'none' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
                </svg>
              </span>

              {/* Expanded state: full copy */}
              <div
                className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 transition-all duration-500 md:p-9"
                style={{
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'translateY(0)' : 'translateY(0.75rem)',
                  transitionDelay: isActive ? '0.25s' : '0s',
                }}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/50 text-gold-light">
                  {ICONS[item.icon]}
                </span>
                <h2 className="max-w-md font-serif text-[clamp(1.5rem,2.6vw,2.25rem)] font-medium leading-[1.1] text-cream">
                  {item.title}
                </h2>
                <p className="max-w-sm text-[0.8125rem] leading-relaxed text-muted">{item.description}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Progress line */}
      <div className="amenity-chrome relative z-20 px-6 pb-6 md:px-12 md:pb-8">
        <div className="mx-auto flex max-w-md items-center gap-1.5">
          {AMENITIES.map((_, i) => (
            <span
              key={i}
              className="h-[0.1875rem] flex-1 rounded-full transition-colors duration-500"
              style={{ backgroundColor: i === index ? '#c9a227' : 'rgba(243,236,217,0.2)' }}
            />
          ))}
        </div>
      </div>

      {/* Full-screen viewer */}
      {full && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <img src={AMENITIES[index].image} alt={AMENITIES[index].title} className="h-full w-full object-contain" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-6 py-5 md:px-12 md:py-8">
            <div className="text-[0.6875rem] uppercase tracking-[0.1875rem] text-gold">
              Amenities
              <span className="mx-3 inline-block h-px w-8 bg-gold/50 align-middle" />
              {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              <span className="ml-4 text-cream">{AMENITIES[index].title}</span>
            </div>
            <button type="button" onClick={closeFull} aria-label="Exit full screen" className={ctrl}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <button type="button" onClick={goPrev} aria-label="Previous photo" className={ctrl + ' absolute left-4 top-1/2 -translate-y-1/2 md:left-8'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button type="button" onClick={goNext} aria-label="Next photo" className={ctrl + ' absolute right-4 top-1/2 -translate-y-1/2 md:right-8'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      )}
    </section>
  )
}

export default Amenities
