import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap, glideTo, EASE, REDUCED } from '../motion/index.js'
import BrandMark from '../components/BrandMark.jsx'
import { IcBack, IcHome } from './icons.jsx'

// Circular control: outline bronze, gold icon.
export function IconButton({ label, onClick, children, active, small, className = '', ...rest }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active === undefined ? undefined : active}
      className={`tr-icon-btn ${small ? 'is-sm' : ''} ${active ? 'is-active' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

// Circle with a caps label beside it. Used for Back and Home on every page.
export function LabelledControl({ label, onClick, icon, hideLabelOnPhone = true, className = '' }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className={`tr-ctl tr-focus ${className}`}>
      <span className={`tr-label ${hideLabelOnPhone ? 'hidden sm:inline' : ''}`}>{label}</span>
      <span className="tr-icon-btn">{icon}</span>
    </button>
  )
}

export const BackControl = ({ onClick, label = 'Back' }) => <LabelledControl label={label} onClick={onClick} icon={<IcBack size={17} />} />
export const HomeControl = ({ onClick }) => <LabelledControl label="Home" onClick={onClick} icon={<IcHome size={16} />} />

// Bronze corner marks, like the frame lines in the brand creatives.
export function Corners({ inset, className = '' }) {
  const style = inset ? { '--ci': inset } : undefined
  return (
    <>
      {['tl', 'tr', 'bl', 'br'].map((c) => (
        <span key={c} className={`tr-corner ${c} ${className}`} style={style} aria-hidden="true" />
      ))}
    </>
  )
}

// Segmented control: outline bronze, the active option ringed in gold; the ring glides between options.
export function Segmented({ options, value, onChange, label, light = false, grid = 0, className = '' }) {
  const rootRef = useRef(null)
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
    <div
      ref={rootRef}
      role="group"
      aria-label={label}
      className={`tr-seg ${light ? 'is-light' : ''} ${grid ? 'is-grid' : ''} ${className}`}
      style={grid ? { gridTemplateColumns: `repeat(${grid}, minmax(0, 1fr))` } : undefined}
    >
      <span ref={indRef} className="tr-seg__ind" aria-hidden="true" />
      {options.map((o, i) => (
        <button
          key={o.value}
          ref={(el) => (optRefs.current[i] = el)}
          type="button"
          className="tr-seg__opt"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// Top bar shared by every page: gold logo left (returns to the menu), actions right.
// On screens that scroll it turns from transparent to espresso with a bronze hairline.
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
      className={`${fixed ? 'fixed' : sticky ? 'sticky' : 'absolute'} isolate inset-x-0 top-0 z-30 flex items-start justify-between gap-4 px-5 pb-3 pt-[max(1.25rem,var(--safe-t))] sm:px-8 md:px-12 md:pt-9 short:pt-3 ${className}`}
    >
      {sticky && (
        <span ref={bgRef} className="pointer-events-none absolute inset-0 -z-10 bg-espresso opacity-0" aria-hidden="true">
          <span className="tr-hair absolute inset-x-0 bottom-0" />
        </span>
      )}
      <div className="tb-anim flex min-w-0 items-center gap-5">
        <button type="button" onClick={onBrand} aria-label={brandLabel} className="tr-focus shrink-0 border-none bg-transparent p-0 text-left">
          <BrandMark tone="gold" size="page" />
        </button>
        {aside}
      </div>
      {children}
    </header>
  )
}
