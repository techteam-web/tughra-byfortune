import { useLayoutEffect, useRef, useState } from 'react'
import { gsap, fx, EASE, PAGE_IN, REDUCED } from '../motion/index.js'
import { IcArrow, IcDiamond } from '../ui/icons.jsx'
import BrandMark from '../components/BrandMark.jsx'
import GlassRibbon from '../components/GlassRibbon.jsx'
import { panelClip } from '../components/glassRibbonGeometry.js'
import tower from '../assets/render/menu-tower.webp'

// The hub of the application. Order and names are fixed by the brief.
const MENU_ITEMS = [
  { num: '01', key: 'features', name: 'Features' },
  { num: '02', key: 'gallery', name: 'Gallery' },
  { num: '03', key: 'amenities', name: 'Amenities' },
  { num: '04', key: 'floors', name: 'Floor Plans' },
  { num: '05', key: 'location', name: 'Neighborhood' },
  { num: '06', key: 'views', name: '360° View' },
  { num: '07', key: 'enquiry', name: 'Enquire' },
]

// the golden hover follows the pointer across each menu button
const glowAt = (e) => {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

const FRAME = 'absolute inset-0 side:origin-top-left side:scale-[1.12] short:translate-x-[14vw] short:scale-100'
const PHOTO =
  'mn-photo absolute inset-0 h-full w-full translate-y-[12svh] object-cover object-[46%_center] [mask-image:linear-gradient(180deg,transparent_0,black_3.5svh)] [-webkit-mask-image:linear-gradient(180deg,transparent_0,black_3.5svh)] side:translate-y-0 side:object-[0%_center] side:[mask-image:none] side:[-webkit-mask-image:none]'

function Menu({ onClose, onSelect }) {
  const [active, setActive] = useState(-1)
  const rootRef = useRef(null)
  const ribbonRef = useRef(null)
  const [clip, setClip] = useState(null)

  // The panel is frosted glass on wide screens: a blurred copy of the photograph is clipped to the
  // panel's exact shape, measured from the ribbon so it follows it at every size.
  useLayoutEffect(() => {
    const sec = rootRef.current
    const svg = ribbonRef.current
    const measure = () => {
      const s = sec.getBoundingClientRect()
      const r = svg.getBoundingClientRect()
      setClip(panelClip(r.left - s.left, r.height))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(sec)
    return () => ro.disconnect()
  }, [])

  // Opening: the tower settles, the panel darkens in, the gold ribbon comes down from the top and
  // sweeps away, its glow and sheen follow, then the seal, the numbers, dashes and names in turn.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: PAGE_IN })
      if (!REDUCED) tl.fromTo('.mn-photo', { scale: 1.06 }, { scale: 1, duration: 2.8, ease: 'power2.out' }, 0)
      tl.add(fx.show('.mn-bg', { duration: 1.2 }), 0)
      tl.add(fx.show('.mn-panel', { duration: 1 }), 0.15)
      tl.add(fx.draw('.mn-line', { duration: 1.9, ease: EASE.move }), 0.3)
      // the ribbon is revealed from the top down, the way the light would run along it
      if (REDUCED) tl.add(fx.show('.mn-ribbon', { duration: 0.3 }), 0.3)
      else tl.fromTo('.mn-ribbon', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% -2% 0%)', duration: 1.9, ease: EASE.move }, 0.3)
      tl.add(fx.show('.mn-light', { duration: 1.4 }), 1.2)
      tl.add(fx.fade('.mn-home', { y: -10 }), 0.4)
      tl.add(fx.fade('.mn-seal', { y: 10, duration: 0.8 }), 0.6)
      tl.add(fx.fade('.mn-num', { y: 8, stagger: 0.07, duration: 0.5 }), 0.85)
      tl.add(fx.line('.mn-dash', { stagger: 0.07, duration: 0.6 }), 0.9)
      tl.add(fx.fade('.mn-name', { y: 12, stagger: 0.07 }), 0.95)
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={rootRef}
      className="relative h-svh w-full overflow-hidden bg-espresso text-cream [--rx:86vw] sm:[--rx:76vw] side:[--rx:max(23rem,28.6vw)] short:[--rx:21.5rem]"
    >
      <h1 className="sr-only">Tughra Royale — menu</h1>

      {/* ---------- The tower at dusk, edge to edge ---------- */}
      <div className="mn-bg absolute inset-0" aria-hidden="true">
        {/* wide screens: the photograph is set a touch larger from its top-left so the tower stands clear of the ribbon */}
        <div className={FRAME}>
          <img src={tower} alt="" width={1920} height={1080} fetchPriority="high" draggable={false} className={PHOTO} />
        </div>
        {/* the same photograph, frosted, seen through the panel (wide screens) */}
        {clip && (
          <div className="absolute inset-0 hidden side:block" style={{ clipPath: `path('${clip}')` }}>
            <div className={FRAME}>
              <img src={tower} alt="" draggable={false} className={`${PHOTO} blur-[8px]`} />
            </div>
          </div>
        )}
      </div>

      {/* ---------- The panel and its glass ribbon (traced from the reference) ---------- */}
      <GlassRibbon
        ref={ribbonRef}
        className="absolute top-0 z-10 h-full [--panel-fill:url(#gr-fill-v)] side:[--panel-fill:url(#gr-fill-side)]"
        style={{ left: 'calc(var(--rx) - 100svh * 82 / 900)' }}
      />

      {/* Home: a dark circle with a small gold diamond, top right over the photograph */}
      <div className="mn-home absolute right-3 top-[max(1rem,var(--safe-t))] z-30 sm:right-6 side:right-[2.8rem] side:top-[2.7rem] short:right-4 short:top-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Home"
          title="Home"
          className="tr-focus flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border-none bg-[color-mix(in_srgb,var(--espresso)_78%,var(--cream))]/90 text-[color-mix(in_srgb,var(--gold)_50%,var(--gold-pale))] transition-colors duration-300 hover:bg-espresso/90 hover:text-gold-pale active:scale-[0.98] side:h-[2.4rem] side:w-[2.4rem]"
        >
          <IcDiamond size={13} strokeWidth={1.6} />
        </button>
      </div>

      {/* ---------- The menu, inside the panel ---------- */}
      <nav
        aria-label="Menu"
        className="absolute inset-y-0 left-0 z-20 flex flex-col px-6 pb-[max(1.5rem,var(--safe-b))] pt-[max(1.5rem,var(--safe-t))] sm:px-10 side:pb-[6.8svh] side:pl-[2.9rem] side:pr-6 side:pt-[3.4rem] short:pb-3 short:pl-6 short:pt-3"
        style={{ width: 'calc(var(--rx) - 0.75rem)' }}
      >
        {/* the seal and the name, side by side */}
        <div className="mn-seal flex shrink-0 items-center gap-4 self-start">
          <BrandMark tone="pale" size="seal" credit={false} seal />
          <span className="font-sans text-[1.1rem] font-normal uppercase leading-none tracking-[0.1em] text-cream side:text-[1.15rem] short:text-[0.85rem]">Tughra Royale</span>
        </div>

        {/* phones and tablets: the tower shows through here */}
        <div className="min-h-6 flex-1 side:hidden" />

        <ul className="flex shrink-0 flex-col gap-1 side:flex-1 side:justify-center short:gap-0" onMouseLeave={() => setActive(-1)}>
          {MENU_ITEMS.map((m, i) => {
            const on = i === active
            return (
              <li key={m.key}>
                {/* small entries with the golden hover: border and fill light up around the cursor */}
                <button
                  type="button"
                  onClick={() => onSelect?.(m.key)}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(-1)}
                  onPointerMove={glowAt}
                  className={`mn-glow tr-focus flex w-full max-w-[20rem] touch-manipulation items-center rounded-lg border-none bg-transparent py-[0.7rem] pl-3 pr-2.5 text-left side:py-[clamp(0.5rem,1.35svh,0.85rem)] short:py-[0.22rem] ${on ? 'is-on' : ''}`}
                >
                  <span className="mn-num w-8 shrink-0 font-sans text-[max(0.6875rem,10px)] tabular-nums tracking-[0.06em] text-gold-pale/55 short:w-7">{m.num}</span>
                  <span
                    className={`mn-dash block h-px w-4 shrink-0 origin-left bg-gold-pale/45 transition-[scale,background-color] duration-500 ${on ? 'scale-x-[1.6] bg-[var(--ribbon-champagne)]' : ''}`}
                    aria-hidden="true"
                  />
                  <span
                    className={`mn-name ml-6 min-w-0 flex-1 font-sans text-[0.8125rem] font-normal uppercase leading-tight tracking-[0.2em] transition-colors duration-300 sm:text-[0.875rem] short:ml-4 short:text-[0.6875rem] ${on ? 'text-[var(--ribbon-champagne)]' : 'text-cream'}`}
                  >
                    {m.name}
                  </span>
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--ribbon-main-gold)_70%,transparent)] text-[var(--ribbon-champagne)] transition-[opacity,translate] duration-500 short:h-5 short:w-5 ${on ? 'translate-x-0 opacity-100' : '-translate-x-1.5 opacity-0'}`}
                    aria-hidden="true"
                  >
                    <IcArrow size={11} />
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </section>
  )
}

export default Menu
