import { useLayoutEffect, useRef } from 'react'
import { gsap, REDUCED } from '../motion/index.js'
import { TUGHRA, FORTUNE } from './logoPaths.js'

// Both marks are traced outlines, so DrawSVG inks them contour by contour, in reading
// order, the way a hand would write them. Once a mark is written its strokes soften and
// the fill settles in behind. Then a gold hairline opens across the screen and the
// espresso curtain parts along it. Waits for `play` (the full-screen tap) before it starts.

function Mark({ tag, logo, className, style }) {
  // One combined path carries the solid mark: even-odd keeps the counters and
  // the inside of every stroke open, exactly as the artwork has them.
  const solid = logo.d.join(' ')
  const pen = Math.round(logo.w / 340)
  return (
    <svg viewBox={`0 0 ${logo.w} ${logo.h}`} className={className} style={style} aria-hidden="true">
      <path className={`${tag}-fill`} d={solid} fill="currentColor" fillRule="evenodd" fillOpacity="0" />
      <g fill="none" stroke="currentColor" strokeWidth={pen} strokeLinecap="round" strokeLinejoin="round">
        {logo.d.map((d, i) => (
          <path key={i} className={`${tag}-ink`} d={d} />
        ))}
      </g>
    </svg>
  )
}

function Preloader({ onComplete, play = true }) {
  const rootRef = useRef(null)
  const topRef = useRef(null)
  const bottomRef = useRef(null)
  const lineRef = useRef(null)

  useLayoutEffect(() => {
    if (!play) return
    const ctx = gsap.context(() => {
      gsap.set(['.pt-ink', '.pf-ink'], { drawSVG: '0%' })
      gsap.set(['.pt-fill', '.pf-fill'], { fillOpacity: 0 })
      gsap.set(['.pl-fortune', '.pl-by'], { opacity: 0 })
      gsap.set(lineRef.current, { drawSVG: '50% 50%' })

      const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: () => onComplete?.() })
      if (REDUCED) tl.timeScale(2.5)

      // 1. The seal is written, contour by contour
      tl.to('.pt-ink', { drawSVG: '100%', duration: 0.5, stagger: 0.055 }, 0.3)
      tl.to('.pt-fill', { fillOpacity: 1, duration: 0.7 }, '-=0.5')
      tl.to('.pt-ink', { opacity: 0, duration: 0.5 }, '<')

      // 2. It holds, then clears
      tl.to('.pl-tughra', { opacity: 0, y: -16, duration: 0.6 }, '+=0.55')

      // 3. "An initiative by"
      tl.to('.pl-by', { opacity: 1, duration: 0.6 }, '-=0.2')

      // 4. Fortune Square is written the same way
      tl.set('.pl-fortune', { opacity: 1 })
      tl.to('.pf-ink', { drawSVG: '100%', duration: 0.45, stagger: 0.05 }, '-=0.1')
      tl.to('.pf-fill', { fillOpacity: 1, duration: 0.6 }, '-=0.45')
      tl.to('.pf-ink', { opacity: 0, duration: 0.45 }, '<')

      // 5. A gold hairline opens out from the centre of the screen
      tl.to('.pl-stage', { opacity: 0, duration: 0.5 }, '+=0.5')
      tl.to(lineRef.current, { drawSVG: '0% 100%', duration: 0.9 }, '-=0.3')

      // 6. The curtain parts along that line
      tl.addLabel('open')
      tl.to(topRef.current, { yPercent: -100, duration: 1.1, ease: 'power3.inOut' }, 'open')
      tl.to(bottomRef.current, { yPercent: 100, duration: 1.1, ease: 'power3.inOut' }, 'open')
      tl.to(lineRef.current, { opacity: 0, duration: 0.5 }, 'open+=0.25')
      tl.to(rootRef.current, { autoAlpha: 0, duration: 0.2 })
    }, rootRef)

    return () => ctx.revert()
  }, [onComplete, play])

  return (
    <div ref={rootRef} className="fixed inset-0 z-[100] overflow-hidden" aria-hidden="true">
      <div ref={topRef} className="absolute inset-x-0 top-0 h-1/2 bg-espresso" />
      <div ref={bottomRef} className="absolute inset-x-0 bottom-0 h-1/2 bg-espresso" />

      {/* The line that opens across the middle, then the curtain parts along it */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full text-gold" preserveAspectRatio="none">
        <line ref={lineRef} x1="0" y1="50%" x2="100%" y2="50%" stroke="currentColor" strokeWidth="1" style={{ opacity: play ? 1 : 0 }} />
      </svg>

      <div className="pl-stage absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-gold" style={{ visibility: play ? 'visible' : 'hidden' }}>
        <Mark tag="pt" logo={TUGHRA} className="pl-tughra absolute h-auto w-[clamp(14rem,62vw,22rem)] md:w-[clamp(13rem,32vw,22rem)]" />

        <span className="pl-by tr-label md:text-[0.75rem]">An initiative by</span>
        <Mark tag="pf" logo={FORTUNE} className="pl-fortune h-auto w-[clamp(10rem,46vw,14rem)] md:w-[clamp(9rem,21vw,14rem)]" />
      </div>
    </div>
  )
}

export default Preloader
