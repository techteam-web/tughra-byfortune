import { useLayoutEffect, useRef } from 'react'
import { gsap, fx, PAGE_IN } from '../motion/index.js'
import { TopBar, BackControl, Corners } from '../ui/controls.jsx'
import theatre from '../assets/amenities/theater.webp'

// Placeholder page: the content for Features has not been provided yet, so this is the page's
// frame only - the title, a "coming soon" mark and the picture the menu shows for it.
function Features({ onClose }) {
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: PAGE_IN })
      tl.add(fx.fade('.tb-anim, .ft-back', { y: -10 }), 0)
      tl.add(fx.panel('.ft-frame'), 0.1)
      tl.add(fx.corners('.ft-frame .tr-corner'), 0.4)
      tl.fromTo('.ft-photo', { scale: 1.04 }, { scale: 1, duration: 2.4, ease: 'power2.out' }, 0.1)
      tl.add(fx.fade('.ft-label'), 0.35)
      tl.add(fx.heading('.ft-line'), 0.45)
      tl.add(fx.line('.ft-hair'), 0.6)
      tl.add(fx.fade('.ft-fade', { stagger: 0.1 }), 0.7)
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative flex min-h-svh w-full flex-col bg-espresso text-cream side:h-svh side:overflow-hidden">
      <TopBar onBrand={onClose}>
        <span className="ft-back">
          <BackControl onClick={onClose} />
        </span>
      </TopBar>

      <div className="flex flex-1 flex-col gap-8 px-5 pb-[max(2rem,var(--safe-b))] pt-[7.25rem] sm:px-8 md:pt-[8.5rem] side:flex-row side:items-stretch side:gap-14 side:px-12 side:pb-10 side:pt-[8.25rem] xl:pl-[4.5rem] short:gap-6 short:px-5 short:pb-3 short:pt-[3.6rem]">
        {/* the words */}
        <div className="flex flex-col justify-end side:w-[34%] side:pb-6">
          <span className="ft-label tr-label flex items-center gap-4">
            01 · Tughra Royale
            <i className="tr-hair is-pale block w-12" />
          </span>
          <h1 className="mt-5 font-serif text-[clamp(3rem,5.4vw,5.4rem)] font-normal leading-[0.98] text-cream short:mt-2 short:text-[2.4rem]">
            <span className="ft-line block pb-1">Features</span>
          </h1>
          <i className="ft-hair tr-hair mt-7 w-24 short:mt-3" />
          <span className="ft-fade tr-label mt-7 text-gold short:mt-3">Coming soon</span>
          <p className="ft-fade mt-3 max-w-[24rem] text-[0.9375rem] leading-[1.75] text-parchment/85 short:text-[0.8125rem]">The details will be added here.</p>
        </div>

        {/* the picture, in a bronze frame */}
        <div className="ft-frame relative min-h-[18rem] flex-1 side:min-h-0">
          <span className="pointer-events-none absolute inset-0 rounded-card border border-bronze/35" aria-hidden="true" />
          <Corners inset="0.35rem" />
          <div className="absolute inset-[0.7rem] overflow-hidden rounded-[0.75rem] bg-cocoa">
            <img src={theatre} alt="" className="ft-photo h-full w-full object-cover" draggable={false} />
            <div className="pointer-events-none absolute inset-0 bg-espresso/25" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Features
