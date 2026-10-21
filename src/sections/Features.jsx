import { useLayoutEffect, useRef } from 'react'
import { gsap, fx, PAGE_IN } from '../motion/index.js'
import { BackControl, Lockup } from '../ui/controls.jsx'
import { CORNER } from '../ui/layout.js'
import RibbonStage from '../components/RibbonStage.jsx'
import theatre from '../assets/amenities/theater.webp'

// Placeholder page: the content for Features has not been provided yet. It sits in the menu's
// setting - the private theatre edge to edge, the title in the ribbon panel.
function Features({ onClose }) {
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: PAGE_IN })
      tl.add(fx.fade('.ft-top', { y: -10 }), 0.4)
      tl.add(fx.fade('.ft-num', { y: 8, duration: 0.5 }), 0.75)
      tl.add(fx.heading('.ft-line'), 0.85)
      tl.add(fx.line('.ft-hair'), 1)
      tl.add(fx.fade('.ft-fade', { stagger: 0.1 }), 1.1)
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={rootRef}>
      <RibbonStage
        image={theatre}
        photo="object-[60%_center] side:object-center"
        label="Features"
        panel={
          <>
            <button type="button" onClick={onClose} aria-label="Back to menu" className="ft-top tr-focus shrink-0 self-start border-none bg-transparent p-0">
              <Lockup />
            </button>

            <div className="flex flex-1 flex-col justify-end pb-2 side:justify-center side:pb-0">
              <span className="ft-num flex items-center gap-4">
                <span className="tr-num">01</span>
                <span className="tr-dash" />
                <span className="tr-label">Tughra Royale</span>
              </span>
              <h1 className="tr-display mt-6 text-[clamp(2.8rem,4.2vw,4.4rem)] short:mt-3 short:text-[2.2rem]">
                <span className="ft-line block">Features</span>
              </h1>
              <i className="ft-hair tr-hair mt-7 w-40 short:mt-3" />
              <span className="ft-fade tr-label mt-7 text-[var(--ribbon-champagne)] short:mt-3">Coming soon</span>
              <p className="ft-fade mt-3 max-w-[22rem] text-[0.9375rem] leading-[1.75] text-cream/80 short:text-[0.8125rem]">The details will be added here.</p>
            </div>
          </>
        }
      >
        <div className={`ft-top ${CORNER}`}>
          <BackControl onClick={onClose} />
        </div>
      </RibbonStage>
    </div>
  )
}

export default Features
