import { useLayoutEffect, useRef, useState } from 'react'
import { gsap, fx, PAGE_IN } from '../motion/index.js'
import { IcArrow } from '../ui/icons.jsx'
import { HomeControl, Lockup } from '../ui/controls.jsx'
import { glowAt } from '../ui/glow.js'
import RibbonStage from '../components/RibbonStage.jsx'
import { TOWER_FRAME, TOWER_PHOTO, CORNER } from '../ui/layout.js'
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

function Menu({ onClose, onSelect }) {
  const [active, setActive] = useState(-1)
  const rootRef = useRef(null)

  // the seal, then the numbers, their dashes and the names in turn
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: PAGE_IN })
      tl.add(fx.fade('.mn-home', { y: -10 }), 0.4)
      tl.add(fx.fade('.mn-seal', { y: 10, duration: 0.8 }), 0.6)
      tl.add(fx.fade('.mn-num', { y: 8, stagger: 0.07, duration: 0.5 }), 0.85)
      tl.add(fx.line('.mn-dash', { stagger: 0.07, duration: 0.6 }), 0.9)
      tl.add(fx.fade('.mn-name', { y: 12, stagger: 0.07 }), 0.95)
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={rootRef}>
      <RibbonStage
        image={tower}
        frame={TOWER_FRAME}
        photo={TOWER_PHOTO}
        label="Menu"
        panel={
          <nav aria-label="Menu" className="flex flex-1 flex-col">
            <h1 className="sr-only">Tughra Royale — menu</h1>
            <div className="mn-seal shrink-0 self-start">
              <Lockup />
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
                      <span className="mn-num tr-num w-8 shrink-0 short:w-7">{m.num}</span>
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
        }
      >
        <div className={`mn-home ${CORNER}`}>
          <HomeControl onClick={onClose} />
        </div>
      </RibbonStage>
    </div>
  )
}

export default Menu
