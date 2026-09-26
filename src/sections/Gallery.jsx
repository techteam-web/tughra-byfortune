import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import placeholder from '../assets/render/menu.webp'
import BackButton from '../components/BackButton.jsx'

// Add more entries here as gallery photos come in - the crossfade, Ken Burns
// zoom, and pagination (dots + counter) all scale to however many exist.
const SLIDES = [
  { src: placeholder, title: 'Outer Building', subtitle: 'A timeless welcome' },
]

function Gallery({ onClose }) {
  const [index, setIndex] = useState(0)
  const sectionRef = useRef(null)
  const imageRefs = useRef([])
  const copyRef = useRef(null)
  const total = SLIDES.length

  // Cinematic entrance for the chrome, once on mount.
  useLayoutEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
    tl.fromTo(sectionRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 })
    tl.fromTo('.gallery-chrome', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0.2)
    return () => tl.kill()
  }, [])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const activeImg = imageRefs.current[index]

      // Cinematic entrance: the photo settles in from a slight zoom
      gsap.fromTo(
        activeImg,
        { scale: 1.12, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.4, ease: 'power2.out' }
      )
      // Then a slow, continuous Ken Burns drift for as long as it's on screen
      gsap.to(activeImg, {
        scale: 1.08,
        duration: 10,
        ease: 'none',
        delay: 1.4,
      })

      gsap.fromTo(
        copyRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.9, delay: 0.5, ease: 'power2.out' }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [index])

  const goTo = (next) => {
    if (next === index) return
    setIndex(next)
  }
  const goNext = () => goTo((index + 1) % total)
  const goPrev = () => goTo((index - 1 + total) % total)

  // Left/right arrow keys browse the gallery too.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, total])

  const slide = SLIDES[index]

  return (
    <section ref={sectionRef} className="relative h-svh w-full overflow-hidden bg-bg text-cream">
      {/* Fullscreen photo, crossfading between slides */}
      {SLIDES.map((s, i) => (
        <img
          key={s.src + i}
          ref={(el) => (imageRefs.current[i] = el)}
          src={s.src}
          alt={s.title}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: i === index ? undefined : 0, zIndex: i === index ? 1 : 0 }}
        />
      ))}
      <div className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(180deg,rgba(10,9,8,0.55)_0%,rgba(10,9,8,0.05)_28%,rgba(10,9,8,0.1)_60%,rgba(10,9,8,0.78)_100%)]" />

      {/* Top bar */}
      <div className="gallery-chrome absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-6 md:px-12 md:py-10">
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
        <BackButton onClick={onClose} />
      </div>

      {/* Right-side numbered index, mirroring the Amenities picker */}
      {total > 1 && (
        <div className="gallery-chrome absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-end gap-4 md:right-12 md:flex">
          {SLIDES.map((s, i) => {
            const isActive = i === index
            return (
              <button
                key={s.src + i}
                type="button"
                onClick={() => goTo(i)}
                className="group flex items-center gap-3 border-none bg-transparent py-1 text-right"
              >
                <span
                  className="h-px transition-all duration-300"
                  style={{
                    width: isActive ? '28px' : '14px',
                    backgroundColor: isActive ? '#e3c463' : 'rgba(243,236,217,0.35)',
                  }}
                />
                <span
                  className="font-serif text-[13px] transition-colors duration-300"
                  style={{ color: isActive ? '#e3c463' : 'rgba(243,236,217,0.5)' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Edge navigation arrows */}
      <button
        type="button"
        onClick={goPrev}
        aria-label="Previous photo"
        className="gallery-chrome absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-black/30 text-white backdrop-blur-md transition-colors duration-300 hover:border-gold/60 hover:text-gold-light md:left-8"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={goNext}
        aria-label="Next photo"
        className="gallery-chrome absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-black/30 text-white backdrop-blur-md transition-colors duration-300 hover:border-gold/60 hover:text-gold-light md:right-8"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>

      {/* Bottom-left copy + pagination */}
      <div ref={copyRef} className="absolute inset-x-6 bottom-10 z-10 md:inset-x-12 md:bottom-14">
        <div className="gallery-chrome mb-4 flex items-center gap-3 text-[11px] uppercase tracking-[3px] text-gold">
          Gallery
          <span className="h-px w-8 bg-gold/50" />
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </div>
        <h2 className="font-serif text-[clamp(36px,5.5vw,64px)] font-light leading-[1.1] text-cream">
          {slide.title}
        </h2>
        <p className="mt-2 text-[13px] uppercase tracking-[2px] text-muted">{slide.subtitle}</p>

        {total > 1 && (
          <div className="mt-8 flex max-w-[360px] items-center gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="h-[3px] flex-1 rounded-full transition-colors duration-300"
                style={{ backgroundColor: i === index ? '#c9a227' : 'rgba(243,236,217,0.25)' }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Gallery
