import { useLayoutEffect, useRef, useState } from 'react'
import { gsap, fx, PAGE_IN } from '../motion/index.js'
import { IcArrow } from '../ui/icons.jsx'
import { HomeControl, Lockup, BRAND_SPOT } from '../ui/controls.jsx'
import { glowAt } from '../ui/glow.js'
import RibbonStage from '../components/RibbonStage.jsx'
import { TOWER_FRAME, TOWER_PHOTO, CORNER } from '../ui/layout.js'
import tower from '../assets/render/menu-tower.webp'

// The hub of the application. Order and names are fixed by the brief.
// tag and line are the words on the right of the page while the entry is pointed at.
const MENU_ITEMS = [
  { num: '01', key: 'features', name: 'Features', tag: 'Crafted in every detail', line: 'The finishes, systems and touches that set the residences apart.' },
  { num: '02', key: 'gallery', name: 'Gallery', tag: 'Explore the vision', line: 'Every render of the tower and its amenities, shown full screen.' },
  { num: '03', key: 'amenities', name: 'Amenities', tag: 'Refined luxury', line: 'A pool, fitness studio, private theatre, banquet hall and more.' },
  { num: '04', key: 'floors', name: 'Floor Plans', tag: 'Find your perfect space', line: 'The 4 and 5 BHK residences, laid out floor by floor.' },
  { num: '05', key: 'location', name: 'Neighborhood', tag: 'At the heart of it all', line: 'Steps from Mumbai Central, with the city and the sea around you.' },
  { num: '06', key: 'views', name: '360° View', tag: 'Step inside', line: 'Look all the way round from the terrace, in a full panorama.' },
  { num: '07', key: 'enquiry', name: 'Enquire', tag: 'Connect with us', line: 'Tell us what you are looking for, and begin the conversation.' },
]
// what the right of the page says when nothing is pointed at
const RESTING = {
  tag: 'Tughra Royale',
  title: ['The Emperor’s Seal,', 'above Mumbai Central.'],
  line: 'Residences of 4 and 5 BHK, crowned in copper and lifted above the city and the sea.',
}

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
      tl.add(fx.fade('.mn-say > *', { y: 12, stagger: 0.08 }), 1.1)
    }, rootRef)
    return () => ctx.revert()
  }, [])

  // the words on the right change with the entry pointed at: the new ones rise in, line by line
  const first = useRef(true)
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const ctx = gsap.context(() => fx.fade('.mn-say > *', { y: 10, stagger: 0.06, duration: 0.45 }), rootRef)
    return () => ctx.revert()
  }, [active])

  const item = MENU_ITEMS[active]

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
            {/* the logo where the home page puts it */}
            <div className={`mn-seal ${BRAND_SPOT}`}>
              <Lockup />
            </div>

            {/* phones and tablets: the tower shows through here */}
            <div className="min-h-6 flex-1 side:hidden" />

            {/* the list sits centred in the space between the seal and the foot */}
            <div className="side:flex side:flex-1 side:items-center">
              <ul className="flex w-full shrink-0 flex-col gap-1 short:gap-0" onMouseLeave={() => setActive(-1)}>
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
            </div>
          </nav>
        }
      >
        <div className={`mn-home ${CORNER}`}>
          <HomeControl onClick={onClose} />
        </div>

        {/* the right of the page: what the pointed-at entry is (wide screens only) */}
        <aside className="pointer-events-none absolute right-[2.8rem] top-1/2 z-10 hidden w-[min(32rem,32vw)] -translate-y-1/2 text-right side:block short:hidden" aria-live="polite">
          {/* in the site's own type: the heading in Marcellus (as on every page), the label and the line in
              Roboto Condensed; the menu list's number, dash and champagne */}
          <div key={item ? item.key : 'rest'} className="mn-say [text-shadow:0_1px_16px_rgba(14,9,6,0.85),0_0_3px_rgba(14,9,6,0.6)]">
            <span className="inline-flex items-center gap-4">
              {item && <span className="tr-num">{item.num}</span>}
              {item && <i className="block h-px w-4 bg-gold-pale/70" />}
              <span className="font-sans text-[max(0.75rem,11px)] font-normal uppercase tracking-[0.2em] text-cream/85">{item ? item.name : RESTING.tag}</span>
            </span>
            <h2 className="mt-4 font-serif text-[clamp(2rem,3vw,3rem)] font-normal leading-[1.1] tracking-[0.01em] text-[var(--ribbon-champagne)] [text-wrap:balance]">
              {item ? item.tag : RESTING.title.map((t) => <span key={t} className="block">{t}</span>)}
            </h2>
            <i className="ml-auto mt-5 block h-px w-12 bg-[var(--ribbon-main-gold)]" />
            <p className="ml-auto mt-5 max-w-[21rem] font-sans text-[max(0.875rem,13px)] font-normal leading-[1.7] tracking-[0.04em] text-cream/85">{item ? item.line : RESTING.line}</p>
          </div>
        </aside>
      </RibbonStage>
    </div>
  )
}

export default Menu
