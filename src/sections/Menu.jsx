import { useLayoutEffect, useRef, useState } from 'react'
import { gsap, fx, EASE, PAGE_IN, REDUCED } from '../motion/index.js'
import { TopBar, HomeControl, Corners } from '../ui/controls.jsx'
import { IcArrow } from '../ui/icons.jsx'
import menuBg from '../assets/render/menu.png'
import extGolden from '../assets/gallery/exterior/cam-8-goldenhour-01-wm.webp'
import extEvening from '../assets/gallery/exterior/fortune-evenin01-1.webp'
import extEveningCrop from '../assets/gallery/exterior/fortune-evening-crop-1.webp'
import extMetro from '../assets/gallery/exterior/fortunemetro-01.webp'
import extDay from '../assets/gallery/exterior/fortune-day-view-1.webp'
import amPool from '../assets/amenities/swimming-pool.webp'
import amTheater from '../assets/amenities/theater.webp'

// The hub of the application. Order and names are fixed by the brief.
// Each entry owns a picture and a line; pointing at it brings that picture into the frame.
const MENU_ITEMS = [
  { num: '01', key: 'features', name: 'Features', tag: 'Coming soon', line: 'The details will be added here.', bg: amTheater },
  { num: '02', key: 'gallery', name: 'Gallery', tag: 'Explore the vision', line: 'Every render of the tower and its amenities, shown full screen.', bg: extGolden },
  { num: '03', key: 'amenities', name: 'Amenities', tag: 'Refined luxury', line: 'A pool, fitness studio, private theatre, banquet hall and more.', bg: amPool },
  { num: '04', key: 'floors', name: 'Floor Plans', tag: 'Find your perfect space', line: 'The 4, 5 and 6 BHK residences, laid out floor by floor.', bg: extEveningCrop },
  { num: '05', key: 'location', name: 'Neighborhood', tag: 'At the heart of it all', line: 'Steps from Mumbai Central, with the city and the sea around you.', bg: extMetro },
  { num: '06', key: 'views', name: '360° View', tag: 'Step inside', line: 'Look all the way round from the terrace, in a full panorama.', bg: extDay },
  { num: '07', key: 'enquiry', name: 'Enquire', tag: 'Connect with us', line: 'Tell us what you are looking for, and begin the conversation.', bg: extEvening },
]

const FACTS = [
  ['Floors', '24'],
  ['Residences', '4 · 5 · 6 BHK'],
  ['Address', 'Mumbai Central'],
]

// The words in the frame, set afresh for whatever is being pointed at.
function PreviewCopy({ item }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      fx.fade('.pc-label', { y: 8, duration: 0.5 })
      fx.heading('.pc-head', { stagger: 0.08, delay: 0.06 })
      fx.fade('.pc-late', { delay: 0.28, stagger: 0.08 })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref} className="max-w-[34rem]">
      <span className="pc-label tr-label flex items-center gap-4 short:text-[0.5625rem]">
        {item ? `${item.num} · ${item.tag}` : 'Tughra Royale · Mumbai Central'}
        <i className="tr-hair is-pale block w-12 short:hidden" />
      </span>
      {item ? (
        <h2 className="mt-5 font-serif text-[clamp(2.6rem,3.7vw,4.2rem)] font-normal leading-[1.02] text-cream short:mt-2 short:text-[1.9rem]">
          <span className="pc-head block pb-1">{item.name}</span>
        </h2>
      ) : (
        <h2 className="mt-5 font-serif text-[clamp(2.3rem,3.2vw,3.6rem)] font-normal leading-[1.06] text-cream short:mt-2 short:text-[1.6rem]">
          <span className="pc-head block pb-1">The Emperor&rsquo;s Seal,</span>
          <span className="pc-head block pb-1 text-gold-pale">above Mumbai Central.</span>
        </h2>
      )}
      <p className="pc-late mt-4 max-w-[26rem] text-[0.9375rem] leading-[1.75] text-parchment/90 short:mt-1 short:text-[0.75rem]">
        {item ? item.line : '24 floors of 4, 5 and 6 BHK residences, crowned in copper and lifted above the city and sea.'}
      </p>
      <div className="pc-late mt-7 short:mt-3">
        {item ? (
          <span className="tr-label inline-flex items-center gap-3 text-gold">
            Enter <IcArrow size={16} />
          </span>
        ) : (
          <dl className="flex items-stretch short:hidden">
            {FACTS.map(([k, v], i) => (
              <div key={k} className={`whitespace-nowrap ${i ? 'border-l border-bronze/35 pl-6' : ''} ${i < FACTS.length - 1 ? 'pr-6' : ''}`}>
                <dt className="tr-label text-[0.625rem] text-gold-pale/80">{k}</dt>
                <dd className="mt-2 font-serif text-[1.25rem] leading-none text-cream">{v}</dd>
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
  const rootRef = useRef(null)
  const listRef = useRef(null)
  const indRef = useRef(null)
  const layerRefs = useRef([])
  const rowRefs = useRef([])
  const nameRefs = useRef([])
  const item = MENU_ITEMS[active]

  // Opening: the column scales in, its frame lines draw, the numbers land a beat before the names
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: PAGE_IN })
      tl.add(fx.fade('.tb-anim', { y: -10, duration: 0.8 }), 0)
      tl.add(fx.panel('.mn-rail'), 0.05)
      tl.add(fx.corners('.mn-rail .tr-corner'), 0.35)
      tl.add(fx.line('.mn-hair', { stagger: 0.05 }), 0.3)
      tl.add(fx.fade('.mn-num', { y: 8, stagger: 0.07, duration: 0.5 }), 0.4)
      tl.add(fx.fade('.mn-label', { y: 14, stagger: 0.07 }), 0.52)
      tl.add(fx.show('.mn-preview', { duration: 1.1 }), 0.25)
      tl.add(fx.corners('.mn-preview .tr-corner'), 0.6)
      tl.add(fx.fade('.mn-home', { y: -10 }), 0.35)
    }, rootRef)
    return () => ctx.revert()
  }, [])

  // The pointed-at picture crossfades into the frame and settles with a slow 3% drift
  useLayoutEffect(() => {
    const layers = layerRefs.current
    const on = layers[active + 1]
    layers.forEach((el) => {
      if (el && el !== on) gsap.to(el, { opacity: 0, duration: REDUCED ? 0.2 : 0.9, ease: EASE.move, overwrite: 'auto' })
    })
    if (!on) return
    gsap.to(on, { opacity: 1, duration: REDUCED ? 0.2 : 0.9, ease: EASE.move, overwrite: 'auto' })
    if (!REDUCED) gsap.fromTo(on.firstChild, { scale: 1.035 }, { scale: 1, duration: 7, ease: 'power1.out', overwrite: 'auto' })
  }, [active])

  // The thin gold underline glides to whichever entry is pointed at
  useLayoutEffect(() => {
    const ind = indRef.current
    const row = rowRefs.current[active]
    const name = nameRefs.current[active]
    if (!ind) return
    if (!row || !name) {
      gsap.to(ind, { opacity: 0, duration: 0.3, ease: EASE.soft, overwrite: 'auto' })
      return
    }
    // it sits on the row's own hairline, from the name to the arrow
    const list = listRef.current.getBoundingClientRect()
    const n = name.getBoundingClientRect()
    const r = row.getBoundingClientRect()
    const vars = { x: n.left - list.left, y: r.bottom - list.top - 1, width: Math.max(n.width, r.right - n.left - 4) }
    const visible = gsap.getProperty(ind, 'opacity') > 0.5
    if (!visible || REDUCED) gsap.set(ind, vars)
    gsap.to(ind, { ...(visible && !REDUCED ? vars : {}), opacity: 1, duration: 0.5, ease: EASE.enter, overwrite: 'auto' })
  }, [active])

  return (
    <section ref={rootRef} className="relative min-h-svh w-full bg-espresso text-cream side:h-svh side:overflow-hidden">
      <TopBar
        onBrand={onClose}
        brandLabel="Home"
        aside={
          <span className="hidden border-l border-bronze/35 pl-5 md:block short:hidden">
            <span className="tr-label block">Tughra Royale</span>
            <span className="tr-label mt-1 block text-gold-pale/75">Mumbai Central</span>
          </span>
        }
      >
        <span className="mn-home">
          <HomeControl onClick={onClose} />
        </span>
      </TopBar>

      <div className="flex min-h-svh flex-col gap-6 px-5 pb-[max(1.5rem,var(--safe-b))] pt-[7.25rem] sm:px-8 md:pt-[8.5rem] side:h-full side:min-h-0 side:flex-row side:gap-[3.25rem] side:px-12 side:pb-10 side:pt-[8.25rem] xl:pl-[4.5rem] short:gap-5 short:px-5 short:pb-3 short:pt-[3.6rem]">
        {/* ---------- The destinations ---------- */}
        <nav aria-label="Menu" className="mn-rail tr-panel flex flex-1 shrink-0 flex-col side:flex-none px-5 pb-4 pt-5 sm:px-7 side:w-[28.5rem] side:pb-5 side:pt-6 short:w-[50%] short:px-4 short:pb-2 short:pt-3">
          <Corners />
          <div className="flex items-center justify-between px-1 short:hidden">
            <span className="tr-label">Explore</span>
            <span className="tr-label text-gold-pale/60">01 — 07</span>
          </div>
          <i className="mn-hair tr-hair mt-4 short:hidden" />

          <ul ref={listRef} className="relative mt-1 flex flex-1 flex-col" onMouseLeave={() => setActive(-1)}>
            <span ref={indRef} className="pointer-events-none absolute left-0 top-0 h-px w-0 bg-gold opacity-0" aria-hidden="true" />
            {MENU_ITEMS.map((m, i) => (
              <li key={m.key} ref={(el) => (rowRefs.current[i] = el)} className="relative flex flex-1 flex-col justify-center">
                <button
                  type="button"
                  onClick={() => onSelect?.(m.key)}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className="mn-row tr-focus group flex min-h-[3.5rem] w-full items-center gap-4 rounded-tile border-none bg-transparent px-1 py-2 text-left short:min-h-0 short:py-[0.2rem]"
                >
                  <span className={`mn-num w-7 shrink-0 font-sans text-[0.75rem] tabular-nums tracking-[0.12em] transition-colors duration-300 ${i === active ? 'text-gold' : 'text-gold-pale/75'}`}>{m.num}</span>
                  <span className="mn-label min-w-0 flex-1">
                    <span ref={(el) => (nameRefs.current[i] = el)} className="inline-block font-serif text-[1.65rem] leading-[1.1] text-cream sm:text-[1.85rem] side:text-[clamp(1.45rem,1.95vw,2rem)] short:text-[1.05rem]">
                      {m.name}
                    </span>
                    <span className="mt-1 block font-sans text-[0.5625rem] uppercase tracking-[0.2em] text-parchment/55 short:hidden">{m.tag}</span>
                  </span>
                  {/* phones: the picture beside the entry */}
                  <span className="block h-12 w-16 shrink-0 overflow-hidden rounded-[0.6rem] border border-bronze/40 side:hidden">
                    <img src={m.bg} alt="" className="h-full w-full object-cover" draggable={false} />
                  </span>
                  <span
                    className={`hidden shrink-0 text-gold transition-[opacity,transform] duration-300 side:block ${i === active ? 'translate-x-0 opacity-100' : '-translate-x-1.5 opacity-0'}`}
                    aria-hidden="true"
                  >
                    <IcArrow size={18} />
                  </span>
                </button>
                {i < MENU_ITEMS.length - 1 && <i className="mn-hair tr-hair absolute inset-x-1 bottom-0 bg-bronze/15" />}
              </li>
            ))}
          </ul>
        </nav>

        {/* ---------- The preview, in a bronze frame ---------- */}
        <div className="mn-preview relative hidden min-w-0 flex-1 side:block" aria-live="polite">
          <span className="pointer-events-none absolute inset-0 rounded-card border border-bronze/35" aria-hidden="true" />
          <Corners inset="0.35rem" />
          <div className="absolute inset-[0.7rem] overflow-hidden rounded-[0.75rem] bg-cocoa">
            {[{ key: 'home', bg: menuBg }, ...MENU_ITEMS].map((m, i) => (
              <div key={m.key} ref={(el) => (layerRefs.current[i] = el)} className="absolute inset-0" style={{ opacity: i === 0 ? 1 : 0 }}>
                <img src={m.bg} alt="" className={`h-full w-full object-cover ${i === 0 ? 'object-[50%_30%]' : ''}`} draggable={false} />
              </div>
            ))}
            {/* warm espresso scrim at the foot, for the words */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[72%]" style={{ background: 'linear-gradient(0deg, var(--espresso) 0%, var(--scrim) 38%, transparent 100%)' }} />
            <div className="absolute inset-x-0 bottom-0 px-10 pb-10 xl:px-12 xl:pb-12 short:px-5 short:pb-4">
              <PreviewCopy key={item ? item.key : 'home'} item={item} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Menu
