import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap, glideTo, EASE, REDUCED } from '../motion/index.js'
import BrandMark from '../components/BrandMark.jsx'
import { IcBack, IcDiamond } from './icons.jsx'
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

// The seal and the name, side by side, as on the menu. `dark` is the same lockup in ink, for
// the beige pages.
export function Lockup({ className = '', compact = false, dark = false }) {
  return (
    <span className={`flex items-center gap-4 ${className}`}>
      <BrandMark tone={dark ? 'dark' : 'pale'} size="seal" credit={false} seal />
      <span className={`font-sans text-[1.05rem] font-normal uppercase leading-none tracking-[0.1em] side:text-[1.15rem] short:text-[0.85rem] ${dark ? 'text-[var(--ink)]' : 'text-cream'} ${compact ? 'hidden sm:inline' : ''}`}>Tughra Royale</span>
    </span>
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
export function TopBar({ onBrand, children, aside, sticky = false, fixed = false, compact = false, className = '', brandLabel = 'Back to menu' }) {
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
      <div className="tb-anim pointer-events-auto flex min-w-0 items-center gap-5">
        <button type="button" onClick={onBrand} aria-label={brandLabel} className="tr-focus shrink-0 border-none bg-transparent p-0 text-left">
          <Lockup compact={compact} />
        </button>
        {aside}
      </div>
      <div className="pointer-events-auto flex items-center">{children}</div>
    </header>
  )
}
