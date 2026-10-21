import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, fx, EASE, REDUCED } from '../motion/index.js'
import BrandMark from './BrandMark.jsx'
import { IcExpand } from '../ui/icons.jsx'

// The application only runs full screen. Browsers allow full screen only from a click or tap,
// so this screen asks for one: anywhere on it enters full screen. Leaving full screen (Esc, F11,
// a swipe) brings it back over whatever page is open; one tap returns to the same place.
// Where the browser cannot go full screen at all (iPhone Safari), the screen never shows, so the
// site still opens.

const doc = typeof document !== 'undefined' ? document : null
const root = doc?.documentElement

const canFullscreen = () =>
  !!(doc && (doc.fullscreenEnabled || doc.webkitFullscreenEnabled) && (root.requestFullscreen || root.webkitRequestFullscreen))

const isFullscreen = () => !!(doc && (doc.fullscreenElement || doc.webkitFullscreenElement))

function enterFullscreen() {
  const req = root.requestFullscreen || root.webkitRequestFullscreen
  try {
    const p = req.call(root, { navigationUI: 'hide' })
    if (p && p.catch) p.catch(() => {})
  } catch {
    // refused (no user activation, or policy) - the screen simply stays up
  }
}

export default function FullscreenGate({ onEnter }) {
  const [supported] = useState(canFullscreen)
  const [full, setFull] = useState(() => !supported || isFullscreen())
  const rootRef = useRef(null)
  const first = useRef(true)

  // the first time we are full screen (or can never be), the app starts
  useEffect(() => {
    if (full) onEnter?.()
  }, [full, onEnter])

  useEffect(() => {
    if (!supported) return
    const onChange = () => setFull(isFullscreen())
    doc.addEventListener('fullscreenchange', onChange)
    doc.addEventListener('webkitfullscreenchange', onChange)
    return () => {
      doc.removeEventListener('fullscreenchange', onChange)
      doc.removeEventListener('webkitfullscreenchange', onChange)
    }
  }, [supported])

  // in and out
  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el) return
    const ctx = gsap.context(() => {
      if (full) {
        gsap.to(el, { autoAlpha: 0, duration: first.current || REDUCED ? 0 : 0.6, ease: EASE.soft })
      } else {
        const tl = gsap.timeline()
        tl.set(el, { autoAlpha: 1 })
        if (!first.current) tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: EASE.soft })
        tl.add(fx.fade('.fg-mark', { y: 10, duration: 0.8 }), 0.15)
        tl.add(fx.line('.fg-line'), 0.35)
        tl.add(fx.fade('.fg-copy', { stagger: 0.1 }), 0.5)
        el.focus({ preventScroll: true })
      }
    }, el)
    first.current = false
    return () => ctx.revert()
  }, [full])

  if (!supported) return null

  const onKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      enterFullscreen()
    }
  }

  return (
    <div
      ref={rootRef}
      role="button"
      tabIndex={0}
      aria-label="Enter full screen"
      onClick={enterFullscreen}
      onKeyDown={onKey}
      className="fixed inset-0 z-[300] flex cursor-pointer select-none items-center justify-center bg-espresso px-6 text-center outline-none"
      style={{ visibility: full ? 'hidden' : 'visible', backgroundImage: 'var(--grain), radial-gradient(60rem 36rem at 50% 42%, color-mix(in srgb, var(--ribbon-main-gold) 12%, transparent), transparent 70%)' }}
    >
      <div className="flex flex-col items-center">
        <span className="fg-mark block">
          <BrandMark tone="pale" size="hero" />
        </span>
        <span className="fg-line tr-hair mt-9 w-24 origin-center" />
        <span className="fg-copy mt-9 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--circle-fill)] text-[var(--circle-ink)] shadow-[0_0_1.6rem_color-mix(in_srgb,var(--ribbon-main-gold)_25%,transparent)]">
          <IcExpand size={20} />
        </span>
        <span className="fg-copy tr-label mt-6">Tap anywhere to enter full screen</span>
        <span className="fg-copy mt-3 max-w-[22rem] text-[0.8125rem] leading-relaxed text-cream/70">
          Tughra Royale is designed to be seen full screen.
        </span>
      </div>
    </div>
  )
}
