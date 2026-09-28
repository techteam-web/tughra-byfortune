import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import placeholderBg from '../assets/render/menu.png'
import BackButton from '../components/BackButton.jsx'

// Add more entries here as amenity photos/copy come in - the panel count,
// the numbering and the progress line all size themselves to however many
// entries exist.
const AMENITIES = [
  {
    icon: 'pool',
    title: 'Infinity Pool',
    description: 'A serene escape with panoramic views of the sea and the city skyline.',
    image: placeholderBg,
  },
  {
    icon: 'dumbbell',
    title: 'Fitness Centre',
    description: 'A fully equipped space to train, recover and stay at your best.',
    image: placeholderBg,
  },
  {
    icon: 'lounge',
    title: "Residents' Lounge",
    description: 'A refined common room for quiet evenings or hosting guests.',
    image: placeholderBg,
  },
  {
    icon: 'leaf',
    title: 'Sky Garden',
    description: 'A landscaped retreat high above the city, framed by open sky.',
    image: placeholderBg,
  },
  {
    icon: 'play',
    title: "Kids' Play Area",
    description: 'A safe, imaginative space designed for the youngest residents.',
    image: placeholderBg,
  },
  {
    icon: 'group',
    title: 'Multi-Purpose Hall',
    description: 'A versatile venue for celebrations, events and gatherings.',
    image: placeholderBg,
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
            <strong className="block font-serif text-2xl tracking-[6px] text-cream">TUGHRA</strong>
            <span className="mt-1.5 block text-[10px] tracking-[3px] text-muted">MUMBAI CENTRAL</span>
          </span>
        </button>

        <div className="hidden items-center gap-3 text-[11px] uppercase tracking-[3px] text-gold md:flex">
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
                className="absolute left-0 right-0 top-5 text-center font-serif text-[13px] transition-colors duration-500 md:top-6"
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
                  className="text-center text-[11px] font-semibold uppercase leading-tight tracking-[0.5px] text-white"
                  style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}
                >
                  {item.title}
                </span>
              </div>

              {/* Expanded state: full copy */}
              <div
                className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 transition-all duration-500 md:p-9"
                style={{
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'translateY(0)' : 'translateY(12px)',
                  transitionDelay: isActive ? '0.25s' : '0s',
                }}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/50 text-gold-light">
                  {ICONS[item.icon]}
                </span>
                <h2 className="max-w-md font-serif text-[clamp(24px,2.6vw,36px)] font-medium leading-[1.1] text-cream">
                  {item.title}
                </h2>
                <p className="max-w-sm text-[13px] leading-relaxed text-muted">{item.description}</p>
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
              className="h-[3px] flex-1 rounded-full transition-colors duration-500"
              style={{ backgroundColor: i === index ? '#c9a227' : 'rgba(243,236,217,0.2)' }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Amenities
