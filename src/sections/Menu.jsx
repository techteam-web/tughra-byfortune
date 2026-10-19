import { useLayoutEffect, useRef, useState } from 'react'
import { gsap, fx, EASE, PAGE_IN, REDUCED } from '../motion/index.js'
import { IcArrow, IcDiamond } from '../ui/icons.jsx'
import BrandMark from '../components/BrandMark.jsx'
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

// The side frame line from src/assets/svg/tughrasvg.svg, in its own 420 x 900 space: a vertical
// line at x 82 that flows into one long, soft curve and leaves the screen at the bottom, with a
// second, finer line 9 units inside it. MID runs between the two (the glass of the ribbon), SWEEP
// is its curved part, where the ribbon catches the light; PANEL is the dark ground to the left.
const LINE = 'M82 -24 V622 C82 686 101 719 157 747 C209 773 272 789 306 824 C329 847 338 875 338 924'
const LINE_INNER = 'M91 -24 V620 C91 679 109 709 163 736 C216 763 279 779 313 814 C336 838 347 872 347 924'
const MID = 'M86.5 -24 V621 C86.5 682.5 105 714 160 741.5 C212.5 768 275.5 784 309.5 819 C332.5 842.5 342.5 873.5 342.5 924'
const SWEEP = 'M86.5 600 V621 C86.5 682.5 105 714 160 741.5 C212.5 768 275.5 784 309.5 819 C332.5 842.5 342.5 873.5 342.5 924'
const PANEL = `M-4000 -24 H82 V622 C82 686 101 719 157 747 C209 773 272 789 306 824 C329 847 338 875 338 924 H-4000 Z`

// Colours sampled from the reference, mapped onto the tokens
const ACTIVE = 'text-[color-mix(in_srgb,var(--gold-pale)_60%,var(--cream))]'

function Menu({ onClose, onSelect }) {
  const [active, setActive] = useState(-1)
  const rootRef = useRef(null)

  // Opening: the tower settles, the panel darkens in, the gold ribbon comes down from the top and
  // sweeps away, its glow and sheen follow, then the seal, the numbers, dashes and names in turn.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: PAGE_IN })
      if (!REDUCED) tl.fromTo('.mn-photo', { scale: 1.06 }, { scale: 1, duration: 2.8, ease: 'power2.out' }, 0)
      tl.add(fx.show('.mn-bg', { duration: 1.2 }), 0)
      tl.add(fx.show('.mn-panel', { duration: 1 }), 0.15)
      tl.add(fx.draw('.mn-line', { duration: 1.9, ease: EASE.move }), 0.3)
      tl.add(fx.show('.mn-light', { duration: 1.4 }), 1.2)
      tl.add(fx.fade('.mn-home', { y: -10 }), 0.4)
      tl.add(fx.fade('.mn-seal', { y: 10, duration: 0.8 }), 0.6)
      tl.add(fx.fade('.mn-num', { y: 8, stagger: 0.07, duration: 0.5 }), 0.85)
      tl.add(fx.line('.mn-dash', { stagger: 0.07, duration: 0.6 }), 0.9)
      tl.add(fx.fade('.mn-name', { y: 12, stagger: 0.07 }), 0.95)
      tl.add(fx.fade('.mn-cta', { y: 10 }), 1.45)
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
        <div className="absolute inset-0 side:origin-top-left side:scale-[1.12] short:translate-x-[14vw] short:scale-100">
          <img
            src={tower}
            alt=""
            width={1920}
            height={1080}
            fetchPriority="high"
            draggable={false}
            className="mn-photo absolute inset-0 h-full w-full translate-y-[12svh] object-cover object-[46%_center] [mask-image:linear-gradient(180deg,transparent_0,black_3.5svh)] [-webkit-mask-image:linear-gradient(180deg,transparent_0,black_3.5svh)] side:translate-y-0 side:object-[0%_center] side:[mask-image:none] side:[-webkit-mask-image:none]"
          />
        </div>
      </div>

      {/* ---------- The panel and its glass ribbon (geometry: src/assets/svg/tughrasvg.svg) ---------- */}
      <svg
        className="pointer-events-none absolute top-0 z-10 h-full overflow-visible [--panel-fill:url(#mn-fill-v)] side:[--panel-fill:url(#mn-fill-side)]"
        style={{ aspectRatio: '420 / 900', left: 'calc(var(--rx) - 100svh * 82 / 900)' }}
        viewBox="0 0 420 900"
        aria-hidden="true"
      >
        <defs>
          <mask id="mn-thin" maskUnits="userSpaceOnUse" x="-4000" y="-100" width="4500" height="1100">
            <rect x="-4000" y="-100" width="4500" height="1100" fill="white" />
            <path d={LINE} fill="none" stroke="url(#mn-thin-g)" strokeWidth="150" filter="url(#mn-spill)" />
          </mask>
          {/* the see-through edge and the warm light belong to the straight part of the ribbon; both
              die away where it starts to curve, so the foot of the panel stays dark as in the reference */}
          <linearGradient id="mn-thin-g" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="900">
            <stop offset="0" style={{ stopColor: 'black', stopOpacity: 0.6 }} />
            <stop offset="0.6" style={{ stopColor: 'black', stopOpacity: 0.55 }} />
            <stop offset="0.8" style={{ stopColor: 'black', stopOpacity: 0 }} />
          </linearGradient>
          <linearGradient id="mn-spill-g" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="900">
            <stop offset="0" style={{ stopColor: 'color-mix(in srgb, var(--bronze) 72%, var(--parchment))', stopOpacity: 0.36 }} />
            <stop offset="0.6" style={{ stopColor: 'color-mix(in srgb, var(--bronze) 72%, var(--parchment))', stopOpacity: 0.34 }} />
            <stop offset="0.78" style={{ stopColor: 'color-mix(in srgb, var(--bronze) 72%, var(--parchment))', stopOpacity: 0 }} />
          </linearGradient>
          <clipPath id="mn-clip">
            <path d={PANEL} />
          </clipPath>
          {/* wide screens: cocoa, see-through enough that the trees show faintly, deepening toward the foot */}
          <linearGradient id="mn-fill-side" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="900">
            <stop offset="0" style={{ stopColor: 'var(--cocoa)', stopOpacity: 0.8 }} />
            <stop offset="0.3" style={{ stopColor: 'var(--cocoa)', stopOpacity: 0.84 }} />
            <stop offset="0.72" style={{ stopColor: 'var(--cocoa)', stopOpacity: 0.87 }} />
            <stop offset="1" style={{ stopColor: 'var(--espresso)', stopOpacity: 0.92 }} />
          </linearGradient>
          {/* phones and tablets: clear at the top so the tower shows, dark where the menu sits */}
          <linearGradient id="mn-fill-v" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="900">
            <stop offset="0" style={{ stopColor: 'var(--espresso)', stopOpacity: 0.15 }} />
            <stop offset="0.22" style={{ stopColor: 'var(--espresso)', stopOpacity: 0.2 }} />
            <stop offset="0.4" style={{ stopColor: 'var(--espresso)', stopOpacity: 0.9 }} />
            <stop offset="1" style={{ stopColor: 'var(--espresso)', stopOpacity: 0.95 }} />
          </linearGradient>
          {/* the ribbon's metal: warm gold, a near-white highlight at the middle, copper lower down */}
          <linearGradient id="mn-gold" x1="72" y1="0" x2="330" y2="900" gradientUnits="userSpaceOnUse">
            <stop offset="0" style={{ stopColor: 'color-mix(in srgb, var(--gold) 55%, var(--gold-pale))' }} />
            <stop offset="0.48" style={{ stopColor: 'color-mix(in srgb, var(--cream) 55%, var(--gold-pale))' }} />
            <stop offset="0.76" style={{ stopColor: 'color-mix(in srgb, var(--gold) 50%, var(--bronze))' }} />
            <stop offset="1" style={{ stopColor: 'color-mix(in srgb, var(--gold) 40%, var(--gold-pale))' }} />
          </linearGradient>
          {/* where the ribbon turns, it catches the light */}
          <linearGradient id="mn-sheen-g" gradientUnits="userSpaceOnUse" x1="0" y1="600" x2="0" y2="924">
            <stop offset="0" style={{ stopColor: 'var(--gold-pale)', stopOpacity: 0 }} />
            <stop offset="0.45" style={{ stopColor: 'var(--gold-pale)', stopOpacity: 0.55 }} />
            <stop offset="1" style={{ stopColor: 'var(--gold)', stopOpacity: 0.3 }} />
          </linearGradient>
          <filter id="mn-glow" x="-50%" y="-20%" width="200%" height="140%">
            <feGaussianBlur stdDeviation="3.2" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0.9  0 1 0 0 0.55  0 0 1 0 0.2  0 0 0 0.7 0" result="tint" />
            <feMerge>
              <feMergeNode in="tint" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="mn-spill" x="-100%" y="-10%" width="300%" height="120%">
            <feGaussianBlur stdDeviation="30" />
          </filter>
          <filter id="mn-soft" x="-50%" y="-10%" width="200%" height="120%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {/* the dark ground, see-through enough that the trees show faintly */}
        <path className="mn-panel" d={PANEL} mask="url(#mn-thin)" style={{ fill: 'var(--panel-fill)' }} />
        {/* the ribbon's warm light spilling into the panel, and only into the panel */}
        <g className="mn-light" clipPath="url(#mn-clip)">
          <path d={LINE} fill="none" strokeWidth="180" filter="url(#mn-spill)" style={{ stroke: 'url(#mn-spill-g)' }} />
        </g>
        {/* the glass ribbon: a soft halo, the translucent band, the bright edge and the fine inner edge */}
        <path className="mn-line" d={LINE} fill="none" strokeWidth="18" strokeLinecap="round" style={{ stroke: 'var(--bronze)', strokeOpacity: 0.32 }} />
        <path className="mn-line" d={MID} fill="none" strokeWidth="9" style={{ stroke: 'url(#mn-gold)', strokeOpacity: 0.55 }} />
        <path className="mn-light" d={SWEEP} fill="none" strokeWidth="26" strokeLinecap="round" filter="url(#mn-soft)" style={{ stroke: 'url(#mn-sheen-g)' }} />
        <path className="mn-line" d={LINE} fill="none" stroke="url(#mn-gold)" strokeWidth="4.5" strokeLinecap="round" filter="url(#mn-glow)" />
        <path className="mn-line" d={LINE_INNER} fill="none" strokeWidth="2.8" strokeLinecap="round" style={{ stroke: 'url(#mn-gold)', strokeOpacity: 0.95 }} />
      </svg>

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

        <ul className="flex shrink-0 flex-col side:flex-1 side:justify-center" onMouseLeave={() => setActive(-1)}>
          {MENU_ITEMS.map((m, i) => {
            const on = i === active
            return (
              <li key={m.key}>
                <button
                  type="button"
                  onClick={() => onSelect?.(m.key)}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(-1)}
                  className="tr-focus flex w-full touch-manipulation items-center border-none bg-transparent py-[clamp(0.55rem,1.55svh,0.9rem)] text-left side:h-[8.08svh] side:py-0 short:h-auto short:py-[0.32rem]"
                >
                  <span className="mn-num w-[2.5rem] shrink-0 font-sans text-[max(0.8rem,10.5px)] font-normal tabular-nums tracking-[0.04em] text-gold-pale/55 short:w-8 short:text-[0.75rem]">
                    {m.num}
                  </span>
                  <span
                    className={`mn-dash block h-px w-[1.3rem] shrink-0 origin-left bg-gold-pale/45 transition-[scale,background-color] duration-500 short:w-4 ${on ? 'scale-x-[1.6] bg-gold-pale/80' : ''}`}
                    aria-hidden="true"
                  />
                  <span
                    className={`mn-name ml-[1.7rem] min-w-0 font-sans text-[1.05rem] font-normal uppercase leading-tight tracking-[0.18em] transition-colors duration-300 sm:text-[1.15rem] side:text-[clamp(1rem,2.4svh,1.4rem)] short:ml-5 short:text-[0.8rem] ${on ? ACTIVE : 'text-cream'}`}
                  >
                    {m.name}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        {/* the one action: square corners, a fine gold border */}
        <div className="mn-cta mt-6 shrink-0 side:mt-0 short:hidden">
          <button
            type="button"
            onClick={() => onSelect?.('enquiry')}
            className="tr-focus group inline-flex touch-manipulation items-center gap-[1.1rem] border border-gold/70 bg-transparent px-[2.2rem] py-[0.78rem] font-sans text-[max(0.75rem,10px)] font-normal uppercase tracking-[0.22em] text-cream transition-colors duration-300 hover:border-gold hover:bg-gold/10 active:scale-[0.98]"
          >
            Enquire now
            <IcArrow size={15} className="text-gold transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </nav>
    </section>
  )
}

export default Menu
