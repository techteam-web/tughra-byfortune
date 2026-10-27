import { useLayoutEffect, useRef } from 'react'
import { gsap, REDUCED } from '../motion/index.js'
import { TUGHRA, FORTUNE } from './logoPaths.js'

// Both marks are accurate outlines traced from the logo artwork (logoPaths.js), so GSAP's
// DrawSVG draws every contour of each one - the seal, the calligraphy, the small "Emperor's
// Seal" lettering and the name - all together, the way a pen would trace them. Once a mark is
// drawn the fill settles in behind and the pen lines fade. Then a gold hairline opens across
// the screen and the espresso curtain parts along it. Waits for `play` (the full-screen tap).

// a contour's bounding box, in the mark's own units
const bbox = (d) => {
  const n = d.match(/-?\d+\.?\d*/g).map(Number)
  const xs = n.filter((_, i) => i % 2 === 0)
  const ys = n.filter((_, i) => i % 2 === 1)
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) }
}

// Splits a mark into the large strokes (drawn with the pen) and the small lettering - the seal's
// "Emperor's Seal" - grouped letter by letter, each letter with its counters (O, R, P, A) cut out.
function splitMark(logo) {
  const boxes = logo.d.map(bbox)
  const small = boxes.map((b) => Math.max(b.x1 - b.x0, b.y1 - b.y0) < logo.w * 0.025)
  const inside = (a, b) => a.x0 >= b.x0 && a.y0 >= b.y0 && a.x1 <= b.x1 && a.y1 <= b.y1
  const letters = []
  logo.d.forEach((d, i) => {
    if (!small[i]) return
    const host = logo.d.findIndex((_, j) => j !== i && small[j] && inside(boxes[i], boxes[j]))
    if (host === -1) letters.push({ i, d: [d] })
  })
  logo.d.forEach((d, i) => {
    if (!small[i]) return
    const host = logo.d.findIndex((_, j) => j !== i && small[j] && inside(boxes[i], boxes[j]))
    if (host !== -1) letters.find((l) => l.i === host)?.d.push(d)
  })
  return { strokes: logo.d.filter((_, i) => !small[i]), letters: letters.map((l) => l.d.join(' ')) }
}

function Mark({ tag, logo, className, style }) {
  // One combined path carries the solid mark: even-odd keeps the counters and
  // the inside of every stroke open, exactly as the artwork has them.
  const solid = logo.d.join(' ')
  const pen = logo.w / 210
  const { strokes, letters } = splitMark(logo)
  return (
    <svg viewBox={`0 0 ${logo.w} ${logo.h}`} className={className} style={style} aria-hidden="true">
      <path className={`${tag}-fill`} d={solid} fill="currentColor" fillRule="evenodd" fillOpacity="0" />
      <g fill="none" stroke="currentColor" strokeWidth={pen} strokeLinecap="round" strokeLinejoin="round">
        {strokes.map((d, i) => (
          <path key={i} className={`${tag}-ink`} d={d} />
        ))}
      </g>
      {/* the small lettering is written with its own fine pen - each letter traced with DrawSVG,
          one after another around the seal - then filled, so it stays crisp at small sizes */}
      {letters.map((d, i) => (
        <path key={i} className={`${tag}-letter`} d={d} fill="currentColor" fillOpacity="0" fillRule="evenodd" stroke="currentColor" strokeWidth={logo.w / 1400} strokeLinecap="round" strokeLinejoin="round" />
      ))}
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
      gsap.set(['.pt-ink', '.pf-ink', '.pt-letter', '.pf-letter'], { drawSVG: '0%' })
      gsap.set(['.pt-fill', '.pf-fill'], { fillOpacity: 0 })
      gsap.set(['.pl-fortune', '.pl-by'], { opacity: 0 })
      gsap.set(lineRef.current, { drawSVG: '50% 50%' })

      const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: () => onComplete?.() })
      if (REDUCED) tl.timeScale(2.5)

      // 1. The Tughra Royale mark is drawn: every outline traced at once, from top to bottom
      tl.to('.pt-ink', { drawSVG: '100%', duration: 1.8, ease: 'power1.inOut', stagger: { each: 0.025 } }, 0.3)
      // the seal's small lettering is written in, letter by letter, while the strokes draw
      tl.to('.pt-letter', { drawSVG: '100%', duration: 0.45, ease: 'power1.inOut', stagger: 0.07 }, 0.6)
      tl.to('.pt-letter', { fillOpacity: 1, duration: 0.3, ease: 'power2.out', stagger: 0.07 }, 0.95)
      tl.to('.pt-fill', { fillOpacity: 1, duration: 1, ease: 'power1.inOut' }, '-=0.9')
      tl.to('.pt-ink', { opacity: 0, duration: 0.6 }, '<0.2')

      // 2. It holds, then clears
      tl.to('.pl-tughra', { opacity: 0, y: -16, duration: 0.6 }, '+=0.6')

      // 3. "An initiative by"
      tl.to('.pl-by', { opacity: 1, duration: 0.6 }, '-=0.2')

      // 4. Fortune Square is drawn the same way
      tl.set('.pl-fortune', { opacity: 1 })
      tl.to('.pf-ink', { drawSVG: '100%', duration: 1.5, ease: 'power1.inOut', stagger: { each: 0.03 } }, '-=0.1')
      tl.to('.pf-letter', { drawSVG: '100%', duration: 0.45, ease: 'power1.inOut', stagger: 0.07 }, '<0.3')
      tl.to('.pf-letter', { fillOpacity: 1, duration: 0.3, stagger: 0.07 }, '<0.35')
      tl.to('.pf-fill', { fillOpacity: 1, duration: 0.9, ease: 'power1.inOut' }, '-=0.8')
      tl.to('.pf-ink', { opacity: 0, duration: 0.5 }, '<0.2')

      // 5. A gold hairline opens out from the centre of the screen
      tl.to('.pl-stage', { opacity: 0, duration: 0.5 }, '+=0.6')
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
        <Mark tag="pt" logo={TUGHRA} className="pl-tughra absolute h-auto w-[clamp(14.7rem,65vw,23.1rem)] md:w-[clamp(13.65rem,33.6vw,23.1rem)]" />

        <span className="pl-by tr-label md:text-[0.75rem]">An initiative by</span>
        <Mark tag="pf" logo={FORTUNE} className="pl-fortune h-auto w-[clamp(10rem,46vw,14rem)] md:w-[clamp(9rem,21vw,14rem)]" />
      </div>
    </div>
  )
}

export default Preloader
