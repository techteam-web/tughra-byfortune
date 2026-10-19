import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { gsap, fx, EASE, PAGE_IN, REDUCED } from '../motion/index.js'
import { HomeControl } from '../ui/controls.jsx'
import { IcArrow } from '../ui/icons.jsx'
import BrandMark from '../components/BrandMark.jsx'
import { PROJECT } from './locationData.js'
import tower from '../assets/render/menu-tower.webp'

// The hub of the application. Order and names are fixed by the brief.
const MENU_ITEMS = [
  { num: '01', key: 'features', name: 'Features', tag: 'Coming soon', line: 'The details will be added here.' },
  { num: '02', key: 'gallery', name: 'Gallery', tag: 'Explore the vision', line: 'Every render of the tower and its amenities, shown full screen.' },
  { num: '03', key: 'amenities', name: 'Amenities', tag: 'Refined luxury', line: 'A pool, fitness studio, private theatre, banquet hall and more.' },
  { num: '04', key: 'floors', name: 'Floor Plans', tag: 'Find your perfect space', line: 'The 4, 5 and 6 BHK residences, laid out floor by floor.' },
  { num: '05', key: 'location', name: 'Neighborhood', tag: 'At the heart of it all', line: 'Steps from Mumbai Central, with the city and the sea around you.' },
  { num: '06', key: 'views', name: '360° View', tag: 'Step inside', line: 'Look all the way round from the terrace, in a full panorama.' },
  { num: '07', key: 'enquiry', name: 'Enquire', tag: 'Connect with us', line: 'Tell us what you are looking for, and begin the conversation.' },
]

const FACTS = [
  ['Floors', '24'],
  ['Residences', '4 · 5 · 6 BHK'],
  ['Address', 'Mumbai Central'],
]

// The site, as the map knows it: 18.9723° N · 72.8224° E
const COORDS = `${PROJECT[1].toFixed(4)}° N · ${PROJECT[0].toFixed(4)}° E`
const mumbaiTime = () => new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }).format(new Date()).toLowerCase()

const SIDE = '(min-width: 1024px), (max-height: 520px) and (orientation: landscape)'
const SHORT = '(max-height: 520px) and (orientation: landscape)'

// Measures the menu column against the page, so the copper frame can be drawn around it.
function useFrame(sectionRef, navRef, contentRef) {
  const [g, setG] = useState(null)
  useLayoutEffect(() => {
    const sec = sectionRef.current
    const nav = navRef.current
    const content = contentRef.current
    const side = window.matchMedia(SIDE)
    const short = window.matchMedia(SHORT)
    const measure = () => {
      const s = sec.getBoundingClientRect()
      const n = nav.getBoundingClientRect()
      const c = content.getBoundingClientRect()
      setG({
        w: s.width,
        h: s.height,
        L: n.left - s.left,
        Xr: n.right - s.left,
        Y: n.bottom - s.top,
        contentTop: c.top - s.top,
        rem: parseFloat(getComputedStyle(document.documentElement).fontSize) || 16,
        side: side.matches,
        short: short.matches,
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(sec)
    ro.observe(nav)
    ro.observe(content)
    side.addEventListener('change', measure)
    return () => {
      ro.disconnect()
      side.removeEventListener('change', measure)
    }
  }, [sectionRef, navRef, contentRef])
  return g
}

// The home page's frame line, redrawn around the menu.
// Wide screens: a dark column hangs from the top edge. Its left line drops, turns one soft corner and
// runs on along the ground under the tower before dipping off the screen, as on the home page. Its
// right edge flares out into that ground line, the way the tower's copper loops curve out at its
// base, and is doubled by a glowing line, like the home page's right-hand curve.
// Phones: the same lines wrap the whole screen; the tower shows through the top of the frame.
function framePaths(g) {
  const { w, h, L, Xr, Y, rem, side, short, contentTop } = g
  if (!side) {
    const R = 2.25 * rem
    const d = 0.6 * rem
    const fadeTo = Math.max(0, contentTop - 1 * rem)
    const fadeFrom = Math.max(0, contentTop - 7 * rem)
    return {
      fill: `M${L} 0 H${Xr} V${Y - R} A${R} ${R} 0 0 1 ${Xr - R} ${Y} H${L + R} A${R} ${R} 0 0 1 ${L} ${Y - R} Z`,
      fillStops: [
        [0, 'var(--espresso)', 0],
        [fadeFrom / Y, 'var(--espresso)', 0],
        [fadeTo / Y, 'var(--espresso)', 0.9],
        [1, 'var(--espresso)', 0.94],
      ],
      lines: [`M${L} -2 V${Y - R} A${R} ${R} 0 0 0 ${L + R} ${Y} H${Xr - R} A${R} ${R} 0 0 0 ${Xr} ${Y - R} V-2`],
      glow: `M${Xr - d} -2 V${Y - R} A${R - d} ${R - d} 0 0 1 ${Xr - R} ${Y - d} H${L + (Xr - L) * 0.35}`,
      glowFrom: Xr,
      glowTo: L + (Xr - L) * 0.3,
    }
  }
  const R = (short ? 1.6 : 3.5) * rem
  const R2 = (short ? 1.4 : 2.5) * rem
  const d = (short ? 0.45 : 0.6) * rem
  const capLeft = w - (w >= 1280 ? 4.5 : 3) * rem - 32 * rem
  const E = short ? Math.max(Xr + R2 + 5 * rem, w * 0.6) : Math.max(Xr + R2 + 7 * rem, Math.min(w * 0.56, capLeft - 4 * rem))
  const room = h - Y
  const r2 = Math.min(1.75 * rem, room - 2)
  const dip = r2 > 6 ? `A${r2} ${r2} 0 0 1 ${E + r2} ${Y + r2} V${h + 2}` : `H${w + 2}`
  return {
    fill: `M${L} 0 H${Xr} V${Y - R2} A${R2} ${R2} 0 0 0 ${Xr + R2} ${Y} H${L + R} A${R} ${R} 0 0 1 ${L} ${Y - R} Z`,
    fillStops: [
      [0, 'var(--cocoa)', 0.94],
      [0.45, 'var(--espresso)', 0.9],
      [1, 'var(--espresso)', 0.94],
    ],
    lines: [`M${L} -2 V${Y - R} A${R} ${R} 0 0 0 ${L + R} ${Y} H${E} ${dip}`, `M${Xr} -2 V${Y - R2} A${R2} ${R2} 0 0 0 ${Xr + R2} ${Y}`],
    glow: `M${Xr + d} -2 V${Y - R2} A${R2 - d} ${R2 - d} 0 0 0 ${Xr + R2} ${Y - d} H${E - 2.5 * rem}`,
    glowFrom: Xr + R2,
    glowTo: E - 2.5 * rem,
    foot: { left: Xr + R2 + 1.5 * rem, bottom: room + 1 * rem, maxWidth: E - (Xr + R2 + 3 * rem) },
  }
}

// The words over the photograph, set afresh for whatever is being pointed at.
function Caption({ item }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      fx.fade('.cp-label', { y: 8, duration: 0.5 })
      fx.heading('.cp-head', { stagger: 0.08, delay: 0.05 })
      fx.fade('.cp-late', { delay: 0.25, stagger: 0.08 })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref}>
      <span className="cp-label tr-label flex items-center gap-4">
        <i className="tr-hair is-pale block w-10" />
        {item ? `${item.num} · ${item.tag}` : 'Tughra Royale · Mumbai Central'}
      </span>
      {item ? (
        <p className="mt-5 font-serif text-[2.6rem] font-normal leading-[1.08] text-cream">
          <span className="cp-head block">{item.line}</span>
        </p>
      ) : (
        <h2 className="mt-5 font-serif text-[3.1rem] font-normal leading-[1.04] text-cream">
          <span className="cp-head block">The Emperor&rsquo;s Seal,</span>
          <span className="cp-head block text-gold-pale">above Mumbai Central.</span>
        </h2>
      )}
      <div className="cp-late mt-7">
        {item ? (
          <span className="tr-label inline-flex items-center gap-3 text-gold">
            Enter {item.name} <IcArrow size={16} />
          </span>
        ) : (
          <dl className="flex items-stretch">
            {FACTS.map(([k, v], i) => (
              <div key={k} className={`whitespace-nowrap ${i ? 'border-l border-gold-pale/30 pl-6' : ''} ${i < FACTS.length - 1 ? 'pr-6' : ''}`}>
                <dt className="tr-label text-[0.625rem] text-gold-pale/85">{k}</dt>
                <dd className="mt-2 font-serif text-[1.3rem] leading-none text-cream">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  )
}

function Menu({ onClose, onSelect }) {
  const [active, setActive] = useState(-1)
  const [time, setTime] = useState(mumbaiTime)
  const rootRef = useRef(null)
  const navRef = useRef(null)
  const contentRef = useRef(null)
  const listRef = useRef(null)
  const indRef = useRef(null)
  const rowRefs = useRef([])
  const nameRefs = useRef([])
  const uid = useId().replace(/\W/g, '')
  const g = useFrame(rootRef, navRef, contentRef)
  const frame = g ? framePaths(g) : null
  const ready = !!frame
  const item = MENU_ITEMS[active]

  // the time in Mumbai, kept current
  useEffect(() => {
    const t = setInterval(() => setTime(mumbaiTime()), 20000)
    return () => clearInterval(t)
  }, [])

  // Opening: the tower settles; the copper lines come down from the top edge and run along the
  // ground; the column darkens in behind them; the seal appears; the numbers land a beat before the names.
  useLayoutEffect(() => {
    if (!ready) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: PAGE_IN })
      if (!REDUCED) tl.fromTo('.mn-photo', { scale: 1.06 }, { scale: 1, duration: 2.8, ease: 'power2.out' }, 0)
      tl.add(fx.show('.mn-bg', { duration: 1.2 }), 0)
      tl.add(fx.fade('.mn-home', { y: -10 }), 0.3)
      tl.add(fx.draw('.mn-line', { duration: 2, ease: EASE.move, stagger: 0.12 }), 0.2)
      tl.add(fx.draw('.mn-glow', { duration: 2.2, ease: EASE.move }), 0.45)
      tl.add(fx.show('.mn-fill', { duration: 1.1 }), 0.35)
      tl.add(fx.fade('.mn-seal', { y: 10, duration: 0.8 }), 0.75)
      tl.add(fx.line('.mn-rule', { stagger: 0.05 }), 0.9)
      tl.add(fx.corners('.mn-diamond'), 1.05)
      tl.add(fx.line('.mn-hair', { stagger: 0.05 }), 1)
      tl.add(fx.fade('.mn-num', { y: 8, stagger: 0.07, duration: 0.5 }), 1.05)
      tl.add(fx.fade('.mn-label', { y: 14, stagger: 0.07 }), 1.15)
      tl.add(fx.fade('.mn-foot', { y: 6, stagger: 0.1 }), 1.6)
      tl.add(fx.fade('.mn-caption', { y: 16, duration: 0.9 }), 1)
    }, rootRef)
    return () => ctx.revert()
  }, [ready])

  // The thin gold underline glides to whichever entry is pointed at, along its own hairline
  useLayoutEffect(() => {
    const ind = indRef.current
    const row = rowRefs.current[active]
    const name = nameRefs.current[active]
    if (!ind) return
    if (!row || !name) {
      gsap.to(ind, { opacity: 0, duration: 0.3, ease: EASE.soft, overwrite: 'auto' })
      return
    }
    const list = listRef.current.getBoundingClientRect()
    const n = name.getBoundingClientRect()
    const r = row.getBoundingClientRect()
    const vars = { x: n.left - list.left, y: r.bottom - list.top - 1, width: Math.max(n.width, r.right - n.left) }
    const visible = gsap.getProperty(ind, 'opacity') > 0.5
    if (!visible || REDUCED) gsap.set(ind, vars)
    gsap.to(ind, { ...(visible && !REDUCED ? vars : {}), opacity: 1, duration: 0.5, ease: EASE.enter, overwrite: 'auto' })
  }, [active])

  const footText = (
    <>
      <span className="block">{COORDS}</span>
      <span className="block">
        {time} <span className="text-parchment/55">in Mumbai</span>
      </span>
    </>
  )

  return (
    <section ref={rootRef} className="relative h-svh w-full overflow-hidden bg-espresso text-cream">
      <h1 className="sr-only">Tughra Royale — menu</h1>

      {/* ---------- The tower at dusk, edge to edge ---------- */}
      <div className="mn-bg absolute inset-0" aria-hidden="true">
        <img
          src={tower}
          alt=""
          width={1920}
          height={1080}
          fetchPriority="high"
          draggable={false}
          className="mn-photo absolute inset-0 h-full w-full translate-y-[12svh] object-cover object-[46%_center] [mask-image:linear-gradient(180deg,transparent_0,black_3.5svh)] [-webkit-mask-image:linear-gradient(180deg,transparent_0,black_3.5svh)] side:translate-y-0 side:[mask-image:none] side:[-webkit-mask-image:none] side:object-[18%_center] short:object-[28%_center]"
        />
        {/* phones and tablets: the photograph sits a little lower, its top edge fading into espresso, so the tower's crown clears the seal */}
        {/* shade: a little everywhere, deeper at the foot, a touch at the top for the seal and Home */}
        <div className="absolute inset-0 bg-espresso/20" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg, var(--scrim) 0%, transparent 44%), linear-gradient(180deg, color-mix(in srgb, var(--espresso) 60%, transparent) 0%, transparent 24%)' }} />
      </div>

      {/* ---------- The copper frame (drawn over the photograph, under the words) ---------- */}
      {frame && (
        <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full" viewBox={`0 0 ${g.w} ${g.h}`} preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id={`${uid}f`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={g.Y}>
              {frame.fillStops.map(([o, c, a], i) => (
                <stop key={i} offset={Math.min(1, Math.max(0, o))} style={{ stopColor: c, stopOpacity: a }} />
              ))}
            </linearGradient>
            <linearGradient id={`${uid}g`} gradientUnits="userSpaceOnUse" x1={frame.glowFrom} y1="0" x2={frame.glowTo} y2="0">
              <stop offset="0" style={{ stopColor: 'var(--gold-pale)', stopOpacity: 1 }} />
              <stop offset="0.55" style={{ stopColor: 'var(--gold)', stopOpacity: 0.85 }} />
              <stop offset="1" style={{ stopColor: 'var(--gold)', stopOpacity: 0 }} />
            </linearGradient>
            <filter id={`${uid}b`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation={g.rem * 0.28} />
            </filter>
          </defs>
          <path className="mn-fill" d={frame.fill} style={{ fill: `url(#${uid}f)` }} />
          {/* the copper light strip: a soft glow under a bright line */}
          <path className="mn-glow" d={frame.glow} fill="none" style={{ stroke: `url(#${uid}g)`, strokeWidth: g.rem * 0.22, opacity: 0.55, filter: `url(#${uid}b)` }} />
          <path className="mn-glow" d={frame.glow} fill="none" style={{ stroke: `url(#${uid}g)`, strokeWidth: Math.max(1.5, g.rem * 0.1) }} strokeLinecap="round" />
          {frame.lines.map((d) => (
            <path key={d.slice(0, 24)} className="mn-line" d={d} fill="none" style={{ stroke: 'var(--bronze)', strokeOpacity: 0.9, strokeWidth: 1 }} vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
      )}

      {/* Home, top right */}
      <div className="mn-home absolute right-5 top-[max(1.25rem,var(--safe-t))] z-30 sm:right-8 md:right-12 md:top-9 short:right-5 short:top-3">
        <HomeControl onClick={onClose} />
      </div>

      {/* ---------- The menu column ---------- */}
      <nav
        ref={navRef}
        aria-label="Menu"
        className="absolute inset-x-4 bottom-[max(1rem,var(--safe-b))] top-0 z-20 mx-auto flex flex-col sm:inset-x-0 sm:w-[min(34rem,calc(100%-4rem))] side:bottom-8 side:left-8 side:right-auto side:mx-0 side:w-[29rem] xl:left-10 short:bottom-3 short:left-4 short:w-[19.5rem]"
        style={{ opacity: ready ? 1 : 0 }}
      >
        {/* the seal, at the top of the column */}
        <div className="mn-seal flex shrink-0 justify-start px-6 pt-[max(1.5rem,var(--safe-t))] sm:px-9 side:justify-center side:px-10 side:pt-10 short:px-5 short:pt-3">
          {/* phones and tablets: top-left, clear of the tower's crown; wide screens: centred in the column */}
          <span className="inline-flex">
            <BrandMark tone="gold" size="crown" />
          </span>
        </div>

        {/* on phones the tower shows through the frame here */}
        <div className="min-h-4 flex-1 side:hidden" />

        <div ref={contentRef} className="flex min-h-0 flex-col side:flex-1">
          {/* rule, diamond, rule */}
          <div className="flex shrink-0 items-center gap-3 px-6 pb-2 pt-3 sm:px-9 side:px-10 side:pt-6 short:px-5 short:pt-2 short:pb-1" aria-hidden="true">
            <i className="mn-rule tr-hair flex-1 origin-right bg-bronze/70" />
            <i className="mn-diamond block h-1.5 w-1.5 rotate-45 bg-gold" />
            <i className="mn-rule tr-hair flex-1 bg-bronze/70" />
          </div>

          {/* the destinations */}
          <ul ref={listRef} className="relative flex min-h-0 flex-col px-6 sm:px-9 side:flex-1 side:px-10 side:pb-6 short:px-5 short:pb-2" onMouseLeave={() => setActive(-1)}>
            <span ref={indRef} className="pointer-events-none absolute left-0 top-0 h-px w-0 bg-gold opacity-0" aria-hidden="true" />
            {MENU_ITEMS.map((m, i) => (
              <li key={m.key} ref={(el) => (rowRefs.current[i] = el)} className="relative flex min-h-[3.4rem] flex-col justify-center side:min-h-0 side:flex-1">
                <button
                  type="button"
                  onClick={() => onSelect?.(m.key)}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className="mn-row tr-focus group flex w-full touch-manipulation items-center gap-4 border-none bg-transparent py-2 text-left short:py-0.5"
                >
                  <span className={`mn-num w-7 shrink-0 font-sans text-[max(0.6875rem,10px)] tabular-nums tracking-[0.14em] transition-colors duration-300 ${i === active ? 'text-gold' : 'text-gold-pale/70'}`}>{m.num}</span>
                  <span className={`mn-label min-w-0 flex-1 transition-transform duration-500 ${i === active ? 'translate-x-1.5' : ''}`}>
                    <span
                      ref={(el) => (nameRefs.current[i] = el)}
                      className={`inline-block font-serif text-[1.65rem] font-normal leading-[1.1] transition-colors duration-500 side:text-[clamp(1.5rem,3.9vh,2.15rem)] short:text-[1rem] ${i === active ? 'text-gold-pale' : 'text-cream'}`}
                    >
                      {m.name}
                    </span>
                    <span className={`mt-1 block font-sans text-[max(0.5625rem,9px)] uppercase tracking-[0.22em] transition-colors duration-500 short:hidden ${i === active ? 'text-gold-pale/90' : 'text-parchment/55'}`}>{m.tag}</span>
                  </span>
                  <span className={`shrink-0 text-gold transition-[opacity,translate] duration-300 ${i === active ? 'translate-x-0 opacity-100' : 'opacity-60 side:-translate-x-1.5 side:opacity-0'}`} aria-hidden="true">
                    <IcArrow size={18} />
                  </span>
                </button>
                {i < MENU_ITEMS.length - 1 && <i className="mn-hair tr-hair absolute inset-x-0 bottom-0 bg-bronze/20" />}
              </li>
            ))}
          </ul>

          {/* phones: where it stands, and the time there now, at the foot of the frame */}
          <div className="mn-foot flex shrink-0 items-end justify-between gap-3 px-6 pb-5 pt-3 font-sans text-[max(0.625rem,9.5px)] tabular-nums tracking-[0.12em] text-gold-pale/80 sm:px-9 side:hidden [&>span:last-child]:text-right">
            {footText}
          </div>
        </div>
      </nav>

      {/* wide screens: the same, sitting on the ground line beside the column */}
      {frame?.foot && (
        <div
          className="mn-foot pointer-events-none absolute z-20 hidden font-sans text-[max(0.625rem,9.5px)] leading-[1.9] tabular-nums tracking-[0.12em] text-gold-pale/85 side:block short:hidden"
          style={{ left: frame.foot.left, bottom: frame.foot.bottom, maxWidth: frame.foot.maxWidth }}
        >
          {footText}
        </div>
      )}

      {/* ---------- The words over the photograph (wide screens) ---------- */}
      <div className="mn-caption pointer-events-none absolute bottom-[4.5rem] right-12 z-20 hidden w-[32rem] side:block xl:right-[4.5rem] short:hidden" aria-live="polite">
        <Caption key={item ? item.key : 'home'} item={item} />
      </div>
    </section>
  )
}

export default Menu
