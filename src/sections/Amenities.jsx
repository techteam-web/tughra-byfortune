import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import BrandMark from '../components/BrandMark.jsx'
import BackButton from '../components/BackButton.jsx'
import './Menu.css'
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

// Add more entries here as amenity photos/copy come in - the dashes, the
// counter and the keyboard stepping all size themselves to however many exist.
const AMENITIES = [
  { title: 'Swimming Pool', description: 'Laps and lazy afternoons, suspended above the city.', image: poolImg },
  { title: 'Fitness Centre', description: 'A fully equipped space to train, recover and stay at your best.', image: gym1Img },
  { title: 'Fitness Studio', description: 'Open, light-filled and built for every kind of workout.', image: gym2Img },
  { title: 'Banquet Hall', description: 'An elegant venue for celebrations, events and gatherings.', image: banquetImg },
  { title: 'Grand Hall', description: 'Flexible space that adapts to every occasion.', image: hallImg },
  { title: 'Private Theatre', description: 'Cinema-grade viewing, reserved for residents.', image: theatreImg },
  { title: 'Games Lounge', description: 'Chess, billiards and conversation in a relaxed social setting.', image: games1Img },
  { title: 'Recreation Room', description: 'Table tennis, pool and more for friendly rivalry.', image: games2Img },
  { title: 'Podium Garden', description: 'A landscaped retreat framed by open sky and greenery.', image: gardenImg },
  { title: 'Podium Deck', description: 'Gardens, courts and pools, all within the podium.', image: deckImg },
]

const Svg = ({ children, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)

const AUTOPLAY_MS = 7000
const pad = (n) => String(n).padStart(2, '0')
const GOLD = '#f0b866'
const GOLD_LIGHT = '#ffd58a'

function Amenities({ onClose }) {
  const [index, setIndex] = useState(0)
  const [full, setFull] = useState(false)
  const sectionRef = useRef(null)
  const total = AMENITIES.length
  const item = AMENITIES[index]

  // Entrance, and a gentle pointer drift on the photograph
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo(sectionRef.current, { opacity: 0 }, { opacity: 1, duration: 0.7 })
      tl.fromTo('.am-top', { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.3)
      tl.fromTo('.am-bot', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9 }, 0.9)

      // the photograph drifts against the pointer, and the light follows it
      const px = gsap.quickTo('.am-stage', 'x', { duration: 1.6, ease: 'power3.out' })
      const py = gsap.quickTo('.am-stage', 'y', { duration: 1.6, ease: 'power3.out' })
      const gx = gsap.quickTo('.am-light', 'x', { duration: 1.1, ease: 'power3.out' })
      const gy = gsap.quickTo('.am-light', 'y', { duration: 1.1, ease: 'power3.out' })
      const onMove = (e) => {
        const nx = e.clientX / window.innerWidth - 0.5
        const ny = e.clientY / window.innerHeight - 0.5
        px(-nx * 34)
        py(-ny * 20)
        gx(e.clientX)
        gy(e.clientY)
        gsap.to('.am-light', { opacity: 1, duration: 0.8, overwrite: 'auto' })
      }
      window.addEventListener('mousemove', onMove)
      return () => window.removeEventListener('mousemove', onMove)
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  // Counter, title and copy rise in on every change
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.am-line', { yPercent: 115 }, { yPercent: 0, duration: 1, ease: 'power4.out', delay: 0.1 })
      gsap.fromTo('.am-fade', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, delay: 0.3, ease: 'power3.out' })
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

  const roundBtn = 'lux-btn flex h-11 w-11 items-center justify-center rounded-full md:h-14 md:w-14'

  return (
    <section ref={sectionRef} className="relative h-svh w-full overflow-hidden bg-[#2a0713] text-cream">
      <style>{`@keyframes amenityFill { from { transform: scaleX(0) } to { transform: scaleX(1) } } @keyframes amKen { from { transform: scale(1.12) translate3d(1.2%, 0.8%, 0) } to { transform: scale(1) translate3d(0, 0, 0) } }`}</style>

      {/* The photograph is the page: every amenity stacked, the chosen one crossfades in */}
      <div className="am-stage absolute -inset-[3%]">
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
                filter: on ? 'blur(0px)' : 'blur(10px)',
                transform: on ? undefined : 'scale(1.1)',
                animation: on ? `amKen ${AUTOPLAY_MS + 4000}ms cubic-bezier(0.25,0.1,0.25,1) forwards` : 'none',
                transition: on ? 'opacity 1.4s ease, filter 1.6s ease' : 'opacity 1.4s ease, filter 1.4s ease, transform 0s linear 1.4s',
              }}
            />
          )
        })}
      </div>

      {/* Grading: dark at the foot where the type sits, a touch at the top for the logo */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(0deg, rgba(28,4,13,0.92) 0%, rgba(28,4,13,0.55) 30%, rgba(28,4,13,0) 60%), linear-gradient(180deg, rgba(28,4,13,0.55) 0%, rgba(28,4,13,0) 22%)' }}
      />

      {/* Depth: a soft vignette pulls the eye to the centre, and a warm light trails the cursor */}
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 75% 70% at 50% 45%, rgba(28,4,13,0) 55%, rgba(28,4,13,0.55) 100%)' }} />
      <div className="am-light pointer-events-none absolute left-0 top-0 z-[2] h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 opacity-0" style={{ background: 'radial-gradient(closest-side, rgba(255,200,130,0.16), rgba(255,200,130,0.05) 55%, transparent 100%)', mixBlendMode: 'screen' }} />

      {/* Logo, top-left, and Back, top-right */}
      <button type="button" onClick={onClose} className="am-top absolute left-5 top-5 z-20 border-none bg-transparent p-0 text-left sm:left-8 md:left-12 md:top-9">
        <BrandMark />
      </button>
      <div className="am-top absolute right-5 top-5 z-20 sm:right-8 md:right-12 md:top-9">
        <BackButton onClick={onClose} />
      </div>

      {/* Centre foot: counter, title, copy, then the controls */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-5 pb-8 text-center md:pb-12" style={{ textShadow: '0 0.125rem 1.25rem rgba(0,0,0,0.5)' }}>
        <span className="am-fade font-serif text-[0.9375rem] tracking-[0.3rem]" style={{ color: GOLD_LIGHT }}>
          {pad(index + 1)} <span className="mx-1 opacity-60">/</span> {pad(total)}
        </span>
        <h2 className="mt-3 block overflow-hidden pb-2 font-serif text-[clamp(2.4rem,5vw,4.6rem)] font-normal leading-[1.1] text-cream">
          <span className="am-line block">{item.title}</span>
        </h2>
        <p className="am-fade mt-1 max-w-[34rem] text-[clamp(0.9375rem,1.3vw,1.125rem)] leading-[1.7] text-cream/90">{item.description}</p>

        <div className="am-bot mt-7 flex w-full items-center justify-center gap-4 md:mt-9 md:gap-10">
          <button type="button" onClick={goPrev} aria-label="Previous amenity" className={roundBtn}><Svg size={20}><path d="M15 18l-6-6 6-6" /></Svg></button>

          <div className="flex items-center gap-1.5 md:gap-2" role="tablist" aria-label="Amenities">
            {AMENITIES.map((a, i) => {
              const on = i === index
              return (
                <button
                  key={a.title}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-label={a.title}
                  onClick={() => setIndex(i)}
                  className="flex h-6 items-center border-none bg-transparent p-0"
                >
                  <span className="relative block h-[3px] overflow-hidden rounded-full transition-all duration-700" style={{ width: on ? 'clamp(1.6rem,3vw,2.6rem)' : 'clamp(0.7rem,1.5vw,1.5rem)', background: 'rgba(249,228,212,0.3)' }}>
                    {on && (
                      <span
                        key={index + (full ? 'f' : '')}
                        className="absolute inset-0 origin-left"
                        style={{ background: GOLD, animation: full ? 'none' : `amenityFill ${AUTOPLAY_MS}ms linear forwards` }}
                      />
                    )}
                  </span>
                </button>
              )
            })}
          </div>

          <button type="button" onClick={goNext} aria-label="Next amenity" className={roundBtn}><Svg size={20}><path d="M9 6l6 6-6 6" /></Svg></button>
        </div>
      </div>

      {/* Full screen, bottom-right */}
      <button
        type="button"
        onClick={openFull}
        aria-label={`View ${item.title} full screen`}
        title="Full screen (F)"
        className="lux-btn am-bot absolute bottom-8 right-5 z-20 hidden h-11 w-11 items-center justify-center rounded-full sm:flex md:bottom-12 md:right-12 md:h-14 md:w-14"
      >
        <Svg size={20}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></Svg>
      </button>

      {/* Full-screen viewer */}
      {full && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2a0713]">
          <img src={item.image} alt={item.title} className="h-full w-full object-contain" />
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-6 py-5 md:px-12 md:py-8 [&_button]:pointer-events-auto">
            <div className="text-[0.6875rem] uppercase tracking-[0.1875rem]" style={{ color: GOLD }}>
              Amenities
              <span className="mx-3 inline-block h-px w-8 align-middle" style={{ background: GOLD }} />
              {pad(index + 1)} / {pad(total)}
              <span className="ml-4 text-cream">{item.title}</span>
            </div>
            <button type="button" onClick={closeFull} aria-label="Exit full screen" className={roundBtn}><Svg><path d="M6 6l12 12M18 6L6 18" /></Svg></button>
          </div>
          <button type="button" onClick={goPrev} aria-label="Previous photo" className={roundBtn + ' absolute left-4 top-1/2 -translate-y-1/2 md:left-8'}><Svg><path d="M15 18l-6-6 6-6" /></Svg></button>
          <button type="button" onClick={goNext} aria-label="Next photo" className={roundBtn + ' absolute right-4 top-1/2 -translate-y-1/2 md:right-8'}><Svg><path d="M9 6l6 6-6 6" /></Svg></button>
        </div>
      )}
    </section>
  )
}

export default Amenities
