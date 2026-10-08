import { useId, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import goldLeaves from '../assets/decor/gold-leaves.png'
import marble from '../assets/decor/panel-marble.png'

gsap.registerPlugin(DrawSVGPlugin)

// Shared dressing for the dark pages: marble ground, the gold leaf corner and drifting gold specks.
// Menu, Amenities and Gallery all use these so the site reads as one piece.

// Pen strokes along the stem and each midrib, in the leaf image's own 1536x1024 space
const LEAF_STROKES = [
  ['M25 1000C110 880 160 760 210 680C280 590 350 560 430 490C470 460 500 455 540 458', 130],
  ['M250 560C262 400 275 280 285 165', 250],
  ['M430 420C520 280 700 140 860 25', 270],
  ['M540 458C700 420 860 390 1015 415', 230],
  ['M330 575C430 560 520 590 575 642', 150],
  ['M175 690C120 640 60 650 20 700', 200],
  ['M100 900C200 790 300 690 380 625', 230],
  ['M335 860C500 800 700 790 940 1000', 300],
]

// The gold leaves, uncovered by DrawSVG strokes inside a mask as if they were being drawn.
// `flip` mirrors them for a right-hand corner.
export function Leaves({ className = '', flip = false, delay = 1.2 }) {
  const root = useRef(null)
  const id = 'lf' + useId().replace(/\W/g, '')

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set('.lf-dr', { drawSVG: '0%' })
      gsap.to('.lf-dr', { drawSVG: '100%', duration: 1.5, ease: 'power2.inOut', stagger: 0.28, delay })
    }, root)
    return () => ctx.revert()
  }, [delay])

  return (
    <div ref={root} className={`pointer-events-none absolute ${className}`} style={{ transformOrigin: flip ? '100% 100%' : '0% 100%', transform: flip ? 'scaleX(-1)' : undefined }} aria-hidden="true">
      <svg viewBox="0 0 1536 1024" className="block h-auto w-full" style={{ mixBlendMode: 'screen' }}>
        <defs>
          <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024">
            {LEAF_STROKES.map(([d, w], i) => (
              <path key={i} className="lf-dr" d={d} fill="none" stroke="#fff" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
            ))}
          </mask>
        </defs>
        <image href={goldLeaves} width="1536" height="1024" mask={`url(#${id})`} />
      </svg>
    </div>
  )
}

export function MarbleBg({ tint = 0.25 }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="absolute inset-0" style={{ background: `url(${marble}) center / cover, #2a0710` }} />
      <div className="absolute inset-0" style={{ background: `rgba(20,4,9,${tint})` }} />
    </div>
  )
}

const SPECKS = Array.from({ length: 14 }, (_, i) => ({ x: (i * 37 + 11) % 97, s: 2 + (i % 3), d: 14 + (i % 5) * 4, t: -((i * 7) % 18) }))

export function Specks({ className = 'z-[4]' }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <style>{`@keyframes orRise { 0% { transform: translateY(0); opacity: 0 } 15% { opacity: .7 } 85% { opacity: .5 } 100% { transform: translateY(-105svh) translateX(2rem); opacity: 0 } }`}</style>
      {SPECKS.map((p, i) => (
        <span key={i} className="absolute rounded-full" style={{ left: p.x + '%', bottom: '-2%', width: p.s, height: p.s, background: '#ffd58a', boxShadow: '0 0 6px #f0b866', opacity: 0, animation: `orRise ${p.d}s linear ${p.t}s infinite` }} />
      ))}
    </div>
  )
}
