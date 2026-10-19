import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import BrandMark from '../components/BrandMark.jsx'
import BackButton from '../components/BackButton.jsx'
import { Specks } from '../components/Ornaments.jsx'
import waves from '../assets/decor/enquiry-waves.png'

const GOLD = '#c98b62'

// Placeholder page: the content for Features has not been provided yet, so this is the page's
// frame only, in the site's maroon with gold details, with room for the content to come.
function Features({ onClose }) {
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo(rootRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 })
      tl.fromTo('.ft-waves', { opacity: 0 }, { opacity: 1, duration: 2 }, 0.2)
      tl.fromTo('.ft-top', { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 0.9 }, 0.3)
      tl.fromTo('.ft-line', { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'power4.out' }, 0.5)
      tl.fromTo('.ft-fade', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, 0.7)
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={rootRef}
      className="relative h-svh w-full overflow-hidden text-cream"
      style={{ background: 'radial-gradient(60rem 38rem at 50% 38%, rgba(120,80,56,0.55) 0%, transparent 72%), radial-gradient(70rem 40rem at 50% 0%, rgba(201,139,98,0.08) 0%, transparent 62%), #1c1714' }}
    >
      <img
        src={waves}
        alt=""
        draggable={false}
        className="ft-waves pointer-events-none absolute -left-[4%] bottom-0 h-[62%] w-auto max-w-none select-none opacity-70 mix-blend-screen"
        style={{ WebkitMaskImage: 'radial-gradient(120% 105% at 0% 100%, #000 42%, transparent 82%)', maskImage: 'radial-gradient(120% 105% at 0% 100%, #000 42%, transparent 82%)' }}
      />
      <img
        src={waves}
        alt=""
        draggable={false}
        className="ft-waves pointer-events-none absolute -right-[4%] bottom-0 h-[62%] w-auto max-w-none -scale-x-100 select-none opacity-70 mix-blend-screen"
        style={{ WebkitMaskImage: 'radial-gradient(120% 105% at 100% 100%, #000 42%, transparent 82%)', maskImage: 'radial-gradient(120% 105% at 100% 100%, #000 42%, transparent 82%)' }}
      />
      <Specks className="z-[1]" />

      <button type="button" onClick={onClose} className="ft-top absolute left-5 top-5 z-20 border-none bg-transparent p-0 text-left sm:left-8 md:left-12 md:top-9">
        <BrandMark />
      </button>
      <div className="ft-top absolute right-5 top-5 z-20 sm:right-8 md:right-12 md:top-9">
        <BackButton onClick={onClose} />
      </div>

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
        <span className="ft-fade flex items-center gap-4 text-[0.625rem] uppercase tracking-[0.4rem] text-cream/80">
          <i className="block h-px w-10" style={{ background: `linear-gradient(90deg, transparent, ${GOLD})` }} />
          Tughra Royale
          <i className="block h-px w-10" style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
        </span>
        <div className="mt-5 overflow-hidden pb-2">
          <h1 className="ft-line font-serif text-[clamp(2.6rem,5vw,4.6rem)] font-normal uppercase leading-[1.05] tracking-[0.12em] text-cream">Features</h1>
        </div>
        <i className="ft-fade mt-3 block h-1.5 w-1.5 rotate-45" style={{ background: GOLD }} />
      </div>
    </section>
  )
}

export default Features
