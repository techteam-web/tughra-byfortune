import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap, glideTo, EASE, REDUCED } from '../motion/index.js'
import BrandMark from '../components/BrandMark.jsx'
import { IcBack, IcDiamond, IcMenu } from './icons.jsx'
import { glowAt } from './glow.js'

// Round control, as on the menu: a dark circle with a gold icon and the golden hover.
export function IconButton({ label, onClick, children, active, small, className = '', ...rest }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerMove={glowAt}
      aria-label={label}
      title={label}
      aria-pressed={active === undefined ? undefined : active}
      className={`tr-icon-btn mn-glow touch-manipulation ${small ? 'is-sm' : ''} ${active ? 'is-active' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

// Back to the menu, and Home: the same dark circles the menu uses.
export const BackControl = ({ onClick, label = 'Back' }) => (
  <IconButton label={label} onClick={onClick}>
    <IcBack size={17} />
  </IconButton>
)
export const HomeControl = ({ onClick }) => (
  <IconButton label="Home" onClick={onClick}>
    <IcDiamond size={13} strokeWidth={1.6} />
  </IconButton>
)
export const MenuControl = ({ onClick }) => (
  <IconButton label="Menu" onClick={onClick}>
    <IcMenu size={18} />
  </IconButton>
)

// The Tughra Royale logo exactly as the home page sets it: the seal and name with "An Initiative
// by Fortune Square" beneath, the same size on every page. `dark` is the same logo in ink, for
// the cream pages (white would vanish there).
export function Lockup({ className = '', dark = false }) {
  return (
    <span className={`flex items-center ${className}`}>
      <BrandMark tone={dark ? 'dark' : 'light'} size="hero" />
    </span>
  )
}

// Where the home page puts its logo; every page puts it in the same spot.
export const BRAND_SPOT = 'absolute left-6 top-6 z-30 md:left-12 md:top-10'

// The logo in that spot, as a button back to the menu.
export function BrandCorner({ onClick, dark = false, label = 'Back to menu', className = '' }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className={`tr-focus border-none bg-transparent p-0 text-left ${BRAND_SPOT} ${className}`}>
      <Lockup dark={dark} />
    </button>
  )
}

// Segmented control: glass, the active option lit in gold; the light glides between options.
export function Segmented({ options, value, onChange, label, grid = 0, className = '' }) {
  const indRef = useRef(null)
  const optRefs = useRef([])
  const first = useRef(true)
  const index = Math.max(0, options.findIndex((o) => o.value === value))

  useLayoutEffect(() => {
    const place = (immediate) => glideTo(indRef.current, optRefs.current[index], { immediate })
    place(first.current)
    first.current = false
    const onResize = () => place(true)
    window.addEventListener('resize', onResize)
    // fonts settling can shift widths after first paint
    document.fonts?.ready.then(() => place(true))
    return () => window.removeEventListener('resize', onResize)
  }, [index, options.length])

  return (
    <div role="group" aria-label={label} className={`tr-seg ${grid ? 'is-grid' : ''} ${className}`} style={grid ? { gridTemplateColumns: `repeat(${grid}, minmax(0, 1fr))` } : undefined}>
      <span ref={indRef} className="tr-seg__ind" aria-hidden="true" />
      {options.map((o, i) => (
        <button key={o.value} ref={(el) => (optRefs.current[i] = el)} type="button" className="tr-seg__opt touch-manipulation" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

// Top bar shared by every page: the lockup left (returns to the menu), round controls right.
// On screens that scroll it turns to smoky glass with a gold hairline.
export function TopBar({ onBrand, children, aside, sticky = false, fixed = false, className = '', brandLabel = 'Back to menu' }) {
  const barRef = useRef(null)
  const bgRef = useRef(null)

  useEffect(() => {
    if (!sticky) return
    const bar = barRef.current
    const scroller = bar?.closest('.app-view')
    if (!scroller) return
    let solid = false
    const onScroll = () => {
      const next = scroller.scrollTop > 8
      if (next === solid) return
      solid = next
      gsap.to(bgRef.current, { opacity: next ? 1 : 0, duration: REDUCED ? 0 : 0.4, ease: EASE.soft, overwrite: 'auto' })
    }
    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => scroller.removeEventListener('scroll', onScroll)
  }, [sticky])

  return (
    <header
      ref={barRef}
      className={`${fixed ? 'fixed' : sticky ? 'sticky' : 'absolute'} isolate inset-x-0 top-0 z-30 flex items-center justify-between gap-4 px-5 pb-3 pt-[max(1.25rem,var(--safe-t))] sm:px-8 side:px-[2.9rem] side:pt-[2.7rem] short:px-5 short:pt-3 pointer-events-none ${className}`}
    >
      {sticky && (
        <span ref={bgRef} className="tr-panel pointer-events-none absolute inset-0 -z-10 rounded-none opacity-0 before:hidden" aria-hidden="true">
          <span className="tr-hair absolute inset-x-0 bottom-0" />
        </span>
      )}
      {/* the bar itself lets clicks through everywhere except its own content, so page
          content sitting in the same band (a card's own header row, say) stays clickable */}
      {/* the logo sits where the home page puts it; the bar keeps only the controls in its flow */}
      <div className={`tb-anim pointer-events-auto flex min-w-0 items-start gap-5 ${BRAND_SPOT}`}>
        <button type="button" onClick={onBrand} aria-label={brandLabel} className="tr-focus shrink-0 border-none bg-transparent p-0 text-left">
          <Lockup />
        </button>
        {aside}
      </div>
      <span aria-hidden="true" />
      <div className="pointer-events-auto flex items-center">{children}</div>
    </header>
  )
}
