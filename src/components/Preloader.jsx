import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'

gsap.registerPlugin(DrawSVGPlugin)

const WORDMARK = 'TUGHRA'

function Preloader({ onComplete }) {
  const rootRef = useRef(null)
  const leftPanelRef = useRef(null)
  const rightPanelRef = useRef(null)
  const letterRefs = useRef([])
  const lineRef = useRef(null)

  useLayoutEffect(() => {
    const letters = letterRefs.current
    // Each letter is its own <text>, so its dash pattern only ever covers
    // its own glyph - drawn in sequence, left to right, like it's being written.
    const lengths = letters.map((el) => el.getComputedTextLength())

    const ctx = gsap.context(() => {
      letters.forEach((el, i) => {
        gsap.set(el, { strokeDasharray: lengths[i], strokeDashoffset: lengths[i], fillOpacity: 0 })
      })
      gsap.set(lineRef.current, { drawSVG: '0%' })

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        onComplete: () => onComplete?.(),
      })

      // "TUGHRA" is written letter by letter, stroke first, then filled in
      tl.to(letters, { strokeDashoffset: 0, duration: 0.45, stagger: 0.16, ease: 'power1.inOut' }, 0.15)
        .to(letters, { fillOpacity: 1, duration: 0.35, stagger: 0.16, ease: 'power1.out' }, 0.35)
        // A straight gold line draws from the very top down to the bottom
        .to(lineRef.current, { drawSVG: '100%', duration: 1.1, ease: 'power2.inOut' }, '+=0.2')
        // The moment the line lands, everything happens at once: it flares,
        // it and the letters clear out, and the curtain opens - no gap
        .addLabel('open')
        .to(lineRef.current, { attr: { 'stroke-width': 3 }, filter: 'drop-shadow(0 0 1.125rem rgba(201,162,39,0.9))', duration: 0.15 }, 'open')
        .to([letters, lineRef.current], { opacity: 0, duration: 0.4 }, 'open')
        .to(leftPanelRef.current, { xPercent: -100, duration: 1.1, ease: 'power4.inOut' }, 'open')
        .to(rightPanelRef.current, { xPercent: 100, duration: 1.1, ease: 'power4.inOut' }, 'open')
        .to(rootRef.current, { autoAlpha: 0, duration: 0.2 })
    }, rootRef)

    return () => ctx.revert()
  }, [onComplete])

  return (
    <div ref={rootRef} className="fixed inset-0 z-[100]" aria-hidden="true">
      <div ref={leftPanelRef} className="absolute inset-y-0 left-0 w-1/2" style={{ background: '#0a0908' }} />
      <div ref={rightPanelRef} className="absolute inset-y-0 right-0 w-1/2" style={{ background: '#0a0908' }} />

      {/* Straight line, drawn top to bottom through dead centre */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <line ref={lineRef} x1="50%" y1="0" x2="50%" y2="100%" stroke="#c9a227" strokeWidth="1.5" />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div className="flex">
          {WORDMARK.split('').map((letter, i) => (
            <svg key={i} viewBox="0 0 70 100" style={{ width: 'clamp(1.75rem, 6vw, 3.5rem)', height: 'auto' }}>
              <text
                ref={(el) => (letterRefs.current[i] = el)}
                x="50%"
                y="68"
                textAnchor="middle"
                className="font-serif"
                fontSize="70"
                fill="#f3ecd9"
                stroke="#f3ecd9"
                strokeWidth="1"
              >
                {letter}
              </text>
            </svg>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Preloader
