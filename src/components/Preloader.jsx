import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { TUGHRA, FORTUNE } from './logoPaths.js'

gsap.registerPlugin(DrawSVGPlugin)

// Both marks are traced outlines (see scratchpad/trace.cjs), so DrawSVG inks
// them contour by contour, in reading order, the way a hand would write them.
// Once a mark is written its strokes soften and the fill settles in behind.

// Brushed silver: a dark-to-bright-to-dark ramp gives the metal its body, and a
// narrow band of light (the "sheen") travels across the lettering as it appears.
// Liquid mercury: the fill is a height map (a soft dome of the lettering plus slowly
// drifting noise) run through a mirror-like tone curve, so the surface ripples and
// reflects like molten chrome. The curve alternates dark and bright to fake reflections.
const MIRROR = '0.08 0.95 0.22 1 0.05 0.7 0.96 0.12 0.8 1 0.18 0.9 0.04'
const MIRROR_B = '0.14 1 0.3 1 0.1 0.78 1 0.18 0.88 1 0.26 0.96 0.1'

// Plain silver for the pen strokes while the shape is being written
const METAL = [
  ['0', '#8d939b'],
  ['0.4', '#ffffff'],
  ['0.7', '#9aa0a8'],
  ['1', '#e9ecef'],
]

function Mark({ tag, logo, className, style }) {
  // One combined path carries the solid mark: even-odd keeps the counters and
  // the inside of every stroke open, exactly as the artwork has them.
  const solid = logo.d.join(' ')
  const pen = Math.round(logo.w / 340)
  const band = logo.w * 0.34
  const base = 2.6 / logo.w
  return (
    <svg viewBox={`0 0 ${logo.w} ${logo.h}`} className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id={`${tag}-metal`} gradientUnits="userSpaceOnUse" x1={logo.w * 0.12} y1="0" x2={logo.w * 0.02} y2={logo.h}>
          {METAL.map(([o, c]) => <stop key={o} offset={o} stopColor={c} />)}
        </linearGradient>
        <filter id={`${tag}-liquid`} filterUnits="userSpaceOnUse" x={-pen * 4} y={-pen * 4} width={logo.w + pen * 8} height={logo.h + pen * 8} colorInterpolationFilters="sRGB">
          {/* drifting noise, opaque grey */}
          <feTurbulence className={`${tag}-turb`} type="fractalNoise" baseFrequency={`${base} ${base * 1.4}`} numOctaves="2" seed="7" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" result="noiseGrey" />
          {/* domed lettering: alpha blurred into a grey height */}
          <feGaussianBlur in="SourceAlpha" stdDeviation={pen * 2.4} result="dome" />
          <feColorMatrix in="dome" type="matrix" values="0 0 0 1 0  0 0 0 1 0  0 0 0 1 0  0 0 0 0 1" result="domeGrey" />
          <feComposite in="domeGrey" in2="noiseGrey" operator="arithmetic" k1="0" k2="0.62" k3="0.5" k4="-0.06" result="height" />
          {/* mirror tone curve: height -> reflected light */}
          <feComponentTransfer in="height" result="chrome">
            <feFuncR type="table" tableValues={MIRROR} />
            <feFuncG type="table" tableValues={MIRROR} />
            <feFuncB type="table" tableValues={MIRROR_B} />
          </feComponentTransfer>
          {/* wet highlights from the same height map */}
          <feColorMatrix in="height" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="bump" />
          <feSpecularLighting in="bump" surfaceScale="9" specularConstant="1.2" specularExponent="34" lightingColor="#ffffff" result="spec">
            <feDistantLight azimuth="235" elevation="42" />
          </feSpecularLighting>
          <feComposite in="chrome" in2="spec" operator="arithmetic" k1="0" k2="1" k3="0.75" k4="0" result="lit" />
          <feComposite in="lit" in2="SourceAlpha" operator="in" />
        </filter>
        <linearGradient id={`${tag}-sheen`} className={`${tag}-sheen-grad`} gradientUnits="userSpaceOnUse" x1={-band} y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path className={`${tag}-fill`} d={solid} fill="#fff" fillRule="evenodd" fillOpacity="0" filter={`url(#${tag}-liquid)`} />
      <path className={`${tag}-sheen`} d={solid} fill={`url(#${tag}-sheen)`} fillRule="evenodd" opacity="0" />
      <g fill="none" stroke={`url(#${tag}-metal)`} strokeWidth={pen} strokeLinecap="round" strokeLinejoin="round">
        {logo.d.map((d, i) => (
          <path key={i} className={`${tag}-ink`} d={d} />
        ))}
      </g>
    </svg>
  )
}

function Preloader({ onComplete }) {
  const rootRef = useRef(null)
  const topRef = useRef(null)
  const bottomRef = useRef(null)
  const lineRef = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(['.pt-ink', '.pf-ink'], { drawSVG: '0%' })
      gsap.set(['.pt-fill', '.pf-fill'], { fillOpacity: 0 })
      gsap.set(['.pt-sheen', '.pf-sheen'], { opacity: 0 })
      gsap.set(['.pl-fortune', '.pl-by'], { opacity: 0 })
      gsap.set(lineRef.current, { drawSVG: '50% 50%' })

      // The metal never sits still: the noise field drifts so the surface keeps flowing
      ;[['.pt-turb', TUGHRA.w], ['.pf-turb', FORTUNE.w]].forEach(([sel, w], i) => {
        const f = 2.6 / w
        gsap.fromTo(sel, { attr: { baseFrequency: `${f} ${f * 1.4}` } }, { attr: { baseFrequency: `${f * 1.25} ${f * 1.1}` }, duration: 3.2 + i, ease: 'sine.inOut', repeat: -1, yoyo: true })
      })

      const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: () => onComplete?.() })

      // 1. The seal is written, contour by contour
      tl.to('.pt-ink', { drawSVG: '100%', duration: 0.5, stagger: 0.055, ease: 'power1.inOut' }, 0.3)
      tl.to('.pt-fill', { fillOpacity: 1, duration: 0.7 }, '-=0.5')
      tl.to('.pt-ink', { opacity: 0, duration: 0.5 }, '<')
      tl.set('.pt-sheen', { opacity: 1 }, '<')
      tl.fromTo('.pt-sheen-grad', { attr: { x1: -TUGHRA.w * 0.34, x2: 0 } }, { attr: { x1: TUGHRA.w, x2: TUGHRA.w * 1.34 }, duration: 1.5, ease: 'power2.inOut' }, '<')

      // 2. It holds, then clears
      tl.to('.pl-tughra', { opacity: 0, y: -16, duration: 0.6 }, '+=0.55')

      // 3. "An initiative by"
      tl.to('.pl-by', { opacity: 1, duration: 0.6 }, '-=0.2')

      // 4. Fortune Square is written the same way
      tl.set('.pl-fortune', { opacity: 1 })
      tl.to('.pf-ink', { drawSVG: '100%', duration: 0.45, stagger: 0.05, ease: 'power1.inOut' }, '-=0.1')
      tl.to('.pf-fill', { fillOpacity: 1, duration: 0.6 }, '-=0.45')
      tl.to('.pf-ink', { opacity: 0, duration: 0.45 }, '<')
      tl.set('.pf-sheen', { opacity: 1 }, '<')
      tl.fromTo('.pf-sheen-grad', { attr: { x1: -FORTUNE.w * 0.34, x2: 0 } }, { attr: { x1: FORTUNE.w, x2: FORTUNE.w * 1.34 }, duration: 1.4, ease: 'power2.inOut' }, '<')

      // 5. A gold line opens out from the centre of the screen
      tl.to('.pl-stage', { opacity: 0, duration: 0.5 }, '+=0.5')
      tl.to(lineRef.current, { drawSVG: '0% 100%', duration: 0.8, ease: 'power3.inOut' }, '-=0.3')

      // 6. The curtain parts along that line
      tl.addLabel('open')
      tl.to(topRef.current, { yPercent: -100, duration: 1.05, ease: 'power4.inOut' }, 'open')
      tl.to(bottomRef.current, { yPercent: 100, duration: 1.05, ease: 'power4.inOut' }, 'open')
      tl.to(lineRef.current, { opacity: 0, duration: 0.5 }, 'open+=0.25')
      tl.to(rootRef.current, { autoAlpha: 0, duration: 0.2 })
    }, rootRef)

    return () => ctx.revert()
  }, [onComplete])

  return (
    <div ref={rootRef} className="fixed inset-0 z-[100] overflow-hidden" aria-hidden="true">
      <div ref={topRef} className="absolute inset-x-0 top-0 h-1/2" style={{ background: '#2a0713' }} />
      <div ref={bottomRef} className="absolute inset-x-0 bottom-0 h-1/2" style={{ background: '#2a0713' }} />

      {/* The line that opens across the middle, then the curtain parts along it */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <line ref={lineRef} x1="0" y1="50%" x2="100%" y2="50%" stroke="#f0b866" strokeWidth="1.5" />
      </svg>

      <div className="pl-stage absolute inset-0 flex flex-col items-center justify-center gap-5 px-6">
        <Mark tag="pt" logo={TUGHRA} className="pl-tughra absolute" style={{ width: 'clamp(13rem, 32vw, 22rem)', height: 'auto' }} />

        <span className="pl-by text-[0.625rem] uppercase tracking-[0.4rem] text-cream/85 md:text-[0.6875rem]">An initiative by</span>
        <Mark tag="pf" logo={FORTUNE} className="pl-fortune" style={{ width: 'clamp(9rem, 21vw, 14rem)', height: 'auto' }} />
      </div>
    </div>
  )
}

export default Preloader
