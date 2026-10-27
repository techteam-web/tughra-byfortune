import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, REDUCED } from '../motion/index.js'
import { cssRgb } from '../theme/tokens.js'
import { FORTUNE } from './logoPaths.js'

// The Tughra Royale logo is drawn from the original artwork, not a traced outline: the small
// "Emperor's Seal" lettering around the seal is too fine to trace and broke apart. The PNG
// (brown on white) is turned gold once in a canvas - darkness becomes opacity - at a size that
// stays sharp on large and high-density screens.
const TUGHRA_PNG = '/assets/logo/tughra.png'
const TUGHRA_RATIO = 3300 / 2550

function TughraMark({ className }) {
  const [src, setSrc] = useState(null)
  useEffect(() => {
    let live = true
    const img = new Image()
    img.onload = () => {
      const w = 2200
      const h = Math.round(w / TUGHRA_RATIO)
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const ctx = c.getContext('2d', { willReadFrequently: true })
      ctx.drawImage(img, 0, 0, w, h)
      const data = ctx.getImageData(0, 0, w, h)
      const px = data.data
      const [r, g, b] = cssRgb('--gold')
      for (let i = 0; i < px.length; i += 4) {
        const lum = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]
        px[i + 3] = Math.min(255, (255 - lum) * 1.6) * (px[i + 3] / 255)
        px[i] = r
        px[i + 1] = g
        px[i + 2] = b
      }
      ctx.putImageData(data, 0, 0)
      if (live) setSrc(c.toDataURL('image/png'))
    }
    img.src = TUGHRA_PNG
    return () => {
      live = false
    }
  }, [])
  return (
    <span className={`block ${className}`} style={{ aspectRatio: `${TUGHRA_RATIO}` }} aria-hidden="true">
      {src && <img src={src} alt="" draggable={false} className="h-full w-full select-none" />}
    </span>
  )
}

// Each mark rises into view whole - a soft wipe from its foot up, with a fade - so it is
// never seen part-drawn. Then a gold hairline opens across the screen and the
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
      // the marks are shown whole, never as part-drawn outlines: the outline strokes stay hidden
      gsap.set('.pf-ink', { opacity: 0 })
      gsap.set('.pf-fill', { fillOpacity: 1 })
      gsap.set(['.pl-tughra', '.pl-fortune'], { opacity: 0, clipPath: 'inset(100% 0% 0% 0%)', y: 10 })
      gsap.set('.pl-by', { opacity: 0 })
      gsap.set(lineRef.current, { drawSVG: '50% 50%' })

      const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: () => onComplete?.() })
      if (REDUCED) tl.timeScale(2.5)

      // 1. The seal rises into view whole: a soft wipe from the foot up, with a fade
      tl.to('.pl-tughra', { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.4, ease: 'power3.out' }, 0.3)

      // 2. It holds, then clears
      tl.to('.pl-tughra', { opacity: 0, y: -16, duration: 0.6 }, '+=0.55')

      // 3. "An initiative by"
      tl.to('.pl-by', { opacity: 1, duration: 0.6 }, '-=0.2')

      // 4. Fortune Square rises into view the same way
      tl.to('.pl-fortune', { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.2, ease: 'power3.out' }, '-=0.1')

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
        <TughraMark className="pl-tughra absolute w-[clamp(14rem,62vw,22rem)] md:w-[clamp(13rem,32vw,22rem)]" />

        <span className="pl-by tr-label md:text-[0.75rem]">An initiative by</span>
        <Mark tag="pf" logo={FORTUNE} className="pl-fortune h-auto w-[clamp(10rem,46vw,14rem)] md:w-[clamp(9rem,21vw,14rem)]" />
      </div>
    </div>
  )
}

export default Preloader
