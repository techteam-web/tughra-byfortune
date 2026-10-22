import { useLayoutEffect, useRef, useState } from 'react'
import { gsap, fx, EASE, PAGE_IN, REDUCED } from '../motion/index.js'
import GlassRibbon from './GlassRibbon.jsx'
import { panelClip } from './glassRibbonGeometry.js'

// The menu's setting, shared with Features and Enquire: a photograph edge to edge, and on its left a
// smoky glass panel whose right edge is the client's gold ribbon artwork. The panel is frosted on
// wide screens: a blurred copy of the photograph is clipped to the panel's exact shape, measured
// from the ribbon so it follows it at every size.
//
//   image      the photograph
//   frame      classes for the photograph's frame (how it is scaled and placed)
//   photo      classes for the photograph itself (object-position and the like)
//   panel      the content inside the panel (a <nav>, a form …)
//   children   anything over the photograph (Home, Back …)

export const RIBBON_RX = '[--rx:86vw] sm:[--rx:76vw] side:[--rx:max(23rem,28.6vw)] short:[--rx:21.5rem]'
export const PANEL_PAD =
  'px-6 pb-[max(1.5rem,var(--safe-b))] pt-[max(1.5rem,var(--safe-t))] sm:px-10 side:pb-[6.8svh] side:pl-[2.9rem] side:pr-6 side:pt-[3.4rem] short:pb-3 short:pl-6 short:pt-3'

export default function RibbonStage({ image, slides, active = 0, bare = false, frame = '', photo = '', panel, children, panelClass = '', className = '', label }) {
  const rootRef = useRef(null)
  const ribbonRef = useRef(null)
  const [clip, setClip] = useState(null)

  useLayoutEffect(() => {
    const sec = rootRef.current
    const svg = ribbonRef.current
    const measure = () => {
      const s = sec.getBoundingClientRect()
      const r = svg.getBoundingClientRect()
      setClip(panelClip(r.left - s.left, r.height))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(sec)
    return () => ro.disconnect()
  }, [])

  // Arrival: the photograph settles, the panel darkens in, the ribbon is revealed from the top down
  // the way the light would run along it, then its warm light follows.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: PAGE_IN })
      if (!REDUCED) tl.fromTo('.rs-photo', { scale: 1.06 }, { scale: 1, duration: 2.8, ease: 'power2.out' }, 0)
      tl.add(fx.show('.rs-bg', { duration: 1.2 }), 0)
      tl.add(fx.show('.mn-panel', { duration: 1 }), 0.15)
      if (REDUCED) tl.add(fx.show('.mn-ribbon', { duration: 0.3 }), 0.3)
      else tl.fromTo('.mn-ribbon', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% -2% 0%)', duration: 1.9, ease: EASE.move }, 0.3)
      tl.add(fx.show('.mn-light', { duration: 1.4 }), 1.2)
    }, rootRef)
    return () => ctx.revert()
  }, [])

  // with several photographs: the chosen one crossfades in and drifts 3% while it is shown
  const first = useRef(true)
  useLayoutEffect(() => {
    if (!slides) return
    const root = rootRef.current
    const dur = first.current ? 0 : REDUCED ? 0.2 : 1.1
    first.current = false
    root.querySelectorAll('[data-rs]').forEach((el) => {
      gsap.to(el, { opacity: Number(el.dataset.rs) === active ? 1 : 0, duration: dur, ease: EASE.move, overwrite: 'auto' })
    })
    if (!REDUCED) root.querySelectorAll(`.rs-sharp[data-rs="${active}"] img`).forEach((el) => gsap.fromTo(el, { scale: 1 }, { scale: 1.03, duration: 8, ease: 'power1.out', overwrite: 'auto' }))
  }, [slides, active])

  const img = (extra, eager, cls) =>
    slides ? (
      slides.map((src, i) => (
        <div key={src} data-rs={i} className={`${cls} absolute inset-0`} style={{ opacity: i === active ? 1 : 0 }}>
          <img src={src} alt="" draggable={false} className={`absolute inset-0 h-full w-full object-cover ${photo} ${extra}`} />
        </div>
      ))
    ) : (
      <img src={image} alt="" draggable={false} fetchPriority={eager ? 'high' : undefined} className={`rs-photo absolute inset-0 h-full w-full object-cover ${photo} ${extra}`} />
    )

  return (
    <section ref={rootRef} aria-label={label} className={`relative h-svh w-full overflow-hidden bg-espresso text-cream ${RIBBON_RX} ${className}`}>
      <div className="rs-bg absolute inset-0" aria-hidden="true">
        <div className={`absolute inset-0 ${frame}`}>{img('', true, 'rs-sharp')}</div>
        {clip && (
          <div className={`absolute inset-0 hidden transition-opacity duration-700 side:block ${bare ? 'opacity-0' : ''}`} style={{ clipPath: `path('${clip}')` }}>
            <div className={`absolute inset-0 ${frame}`}>{img('blur-[8px]', false, 'rs-frost')}</div>
          </div>
        )}
      </div>

      <GlassRibbon
        ref={ribbonRef}
        className={`absolute top-0 z-10 h-full transition-opacity duration-700 [--panel-fill:url(#gr-fill-v)] side:[--panel-fill:url(#gr-fill-side)] ${bare ? 'opacity-0' : ''}`}
        style={{ left: 'calc(var(--rx) - 100svh * 82 / 900)' }}
      />

      {children}

      <div className={`absolute inset-y-0 left-0 z-20 flex flex-col transition-opacity duration-700 ${PANEL_PAD} ${panelClass} ${bare ? 'pointer-events-none opacity-0' : ''}`} style={{ width: 'calc(var(--rx) - 0.75rem)' }}>
        {panel}
      </div>
    </section>
  )
}
