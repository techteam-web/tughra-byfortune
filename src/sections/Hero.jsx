import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from 'gsap'
import BrandMark from '../components/BrandMark.jsx'
import PanoBackground from '../components/PanoBackground.jsx'

const COPPER_RULE_L = 'linear-gradient(90deg, rgba(232,160,102,0), #e8a066)'
const COPPER_RULE_R = 'linear-gradient(90deg, #e8a066, rgba(232,160,102,0))'

// One block of copy, drawn twice with identical layout. The 'text' pass lives inside
// the pano, behind the skyline, so buildings pass in front of the letters. The 'ui'
// pass is just the button, kept above everything so it can always be clicked.
function Copy({ mode, onExplore }) {
  const hideText = mode === 'ui' ? { visibility: 'hidden' } : undefined
  return (
    <div className="flex flex-col items-center px-6 text-center">
      <h1 style={{ marginTop: 'clamp(1.5rem, 4vh, 2.75rem)', ...hideText }} className="hr-depth font-serif text-[clamp(2.6rem,5.2vw,5.6rem)] font-medium uppercase leading-[1.04] tracking-[0.03em]">
        <span className="block overflow-hidden px-2 pb-3">
          <span className="hr-line hr-copper inline-block">A World</span>
        </span>
        <span className="block overflow-hidden px-2 pb-3">
          <span className="hr-line hr-copper inline-block italic">Without Ordinary</span>
        </span>
      </h1>

      <div className="hr-fade mt-3 flex items-center gap-3 md:mt-5" style={hideText}>
        <span className="hr-rule h-px w-14 origin-right md:w-20" style={{ background: COPPER_RULE_L }} />
        <span className="block h-2 w-2 rotate-45" style={{ background: 'linear-gradient(135deg,#ffd9a8,#c77b3f)' }} />
        <span className="hr-rule h-px w-14 origin-left md:w-20" style={{ background: COPPER_RULE_R }} />
      </div>

      <p className="hr-depth hr-fade mt-6 text-[0.6875rem] uppercase tracking-[0.4rem] hr-copy-text md:text-xs" style={hideText}>All within reach.</p>

      <button
        type="button"
        onClick={onExplore}
        tabIndex={mode === 'ui' ? 0 : -1}
        className={`${mode === 'ui' ? 'hr-btn pointer-events-auto' : ''} lux-btn group mt-10 inline-flex items-center gap-3.5 rounded-full py-2 pl-2 pr-7 text-sm uppercase tracking-[0.125rem] md:mt-12`}
        style={mode === 'text' ? { visibility: 'hidden' } : undefined}
      >
        <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gold transition-colors group-hover:bg-gold/15">
          <span className="absolute inset-0 animate-ping rounded-full border border-gold/60" />
          <i className="block h-px w-4 bg-gold" />
        </span>
        Click here to explore
      </button>
    </div>
  )
}

function Hero({ onExplore, ready = true }) {
  const rootRef = useRef(null)

  // The copy is not laid over the pano: it lives inside it. This element is handed to
  // the pano, which pins it to a spot in the scene, and the copy is portalled into it.
  const [copy] = useState(() => {
    const el = document.createElement('div')
    el.style.cssText = 'pointer-events:none;width:min(70rem,100vw);'
    return el
  })

  // Hold everything back until the preloader has opened, then bring it in
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
       gsap.set('.hr-line', { yPercent: 110})
      gsap.set('.hr-fade', { opacity: 0, y: 16 })
      gsap.set('.hr-rule', { scaleX: 0 })

    }, copy)
    const ui = gsap.context(() => gsap.set('.hr-btn', { opacity: 0, y: 16 }), rootRef)
    return () => {
      ctx.revert()
      ui.revert()
    }
  }, [copy])

  useLayoutEffect(() => {
    if (!ready) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.to('.hr-rule', { scaleX: 1, duration: 1.1, stagger: 0.1, ease: 'power3.inOut' }, 0.15)
      tl.to('.hr-fade', { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 }, 0.2)
      tl.to('.hr-line', { yPercent: 0, duration: 1.2, stagger: 0.14, ease: 'power4.out' }, 0.3)
    }, copy)
    // the button follows the last of the fades above
    const ui = gsap.context(() => gsap.to('.hr-btn', { opacity: 1, y: 0, duration: 0.9, delay: 0.44, ease: 'power3.out' }), rootRef)
    return () => {
      ctx.revert()
      ui.revert()
    }
  }, [ready, copy])

  return (
    <section ref={rootRef} className="relative h-svh w-full overflow-hidden text-cream">
      <style>{`
        .hr-copper {
          color: hsl(339, 71%, 10%);
        }
        .hr-copy-text { color: hsl(339, 71%, 10%); }
        /* the pano is soft; razor-sharp type is what makes copy look pasted on top of it */
        .hr-depth { filter: blur(0.45px); }
      `}</style>
      <div className="absolute inset-0">
        <PanoBackground copy={copy} />
        {/* Decorative frame — line_1.png you provided, converted to real per-pixel alpha
            (the source had an opaque black background). Stretched non-uniformly
            (width/height 100% with no object-fit) so it hits all four edges regardless
            of viewport ratio, matching the source image's own 1600x900 aspect. */}
        <img
          src="/assets/svg/line_1.png?v=3"
          alt=""
          aria-hidden="true"
          className="frame-draw-animate pointer-events-none absolute inset-0 z-10 hidden h-full w-full md:block"
        />
      </div>

      {/* Brand */}
      <div className="absolute left-6 top-6 z-10 md:left-12 md:top-10">
        <BrandMark />
      </div>

      {/* The title itself sits inside the pano, between the sky and the skyline */}
      {createPortal(<Copy mode="text" onExplore={onExplore} />, copy)}

      {/* The button, in the same place, above everything */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
        <Copy mode="ui" onExplore={onExplore} />
      </div>
    </section>
  )
}

export default Hero
