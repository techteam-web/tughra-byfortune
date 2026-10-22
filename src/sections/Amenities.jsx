import { useLayoutEffect, useRef } from 'react'
import { gsap, fx, PAGE_IN, REDUCED } from '../motion/index.js'
import { TopBar, MenuControl } from '../ui/controls.jsx'
import pool from '../assets/amenities/swimming-pool.webp'

// Placeholder page until the amenities content is provided: the pool edge to edge, and the
// same title, gold line and "Coming soon" as Features, centred on the screen.
function Amenities({ onClose }) {
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: PAGE_IN })
      if (!REDUCED) tl.fromTo('.am-photo', { scale: 1.22 }, { scale: 1.04, duration: 2.8, ease: 'expo.out' }, 0)
      tl.add(fx.fade('.tb-anim, .am-back', { y: -10 }), 0.4)
      tl.add(fx.fade('.am-num', { y: 8, duration: 0.5 }), 0.75)
      tl.add(fx.heading('.am-line'), 0.85)
      tl.add(fx.line('.am-hair'), 1.05)
      tl.add(fx.fade('.am-fade', { stagger: 0.12 }), 1.2)
      if (!REDUCED) tl.to('.am-photo', { scale: 1, duration: 14, ease: 'none' }, 3)
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative h-svh w-full overflow-hidden bg-espresso text-cream">
      <img src={pool} alt="" className="am-photo absolute inset-0 h-full w-full object-cover will-change-transform" draggable={false} />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: 'var(--grain), radial-gradient(ellipse 70% 60% at 50% 50%, color-mix(in srgb, var(--espresso) 72%, transparent) 0%, color-mix(in srgb, var(--espresso) 88%, transparent) 100%)' }}
      />

      <TopBar onBrand={onClose}>
        <span className="am-back">
          <MenuControl onClick={onClose} />
        </span>
      </TopBar>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <span className="am-num flex items-center gap-4">
          <span className="tr-num">03</span>
          <span className="tr-dash" />
          <span className="tr-label">Tughra Royale</span>
        </span>
        <h1 className="tr-display mt-6 text-[clamp(2.8rem,5.4vw,5.6rem)] short:mt-3 short:text-[2.2rem]">
          <span className="am-line block">Amenities</span>
        </h1>
        <i className="am-hair tr-hair mt-7 w-40 short:mt-3" />
        <span className="am-fade tr-label mt-7 text-[var(--ribbon-champagne)] short:mt-3">Coming soon</span>
      </div>
    </section>
  )
}

export default Amenities
