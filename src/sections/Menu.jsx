import BrandMark from '../components/BrandMark.jsx'
import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import menuBg from '../assets/render/menu.png'
import menuLeaves from '../assets/decor/menu-leaves.png'
import extGolden from '../assets/gallery/exterior/cam-8-goldenhour-01-wm.webp'
import extEvening from '../assets/gallery/exterior/fortune-evenin01-1.webp'
import extEveningCrop from '../assets/gallery/exterior/fortune-evening-crop-1.webp'
import extMetro from '../assets/gallery/exterior/fortunemetro-01.webp'
import extDay from '../assets/gallery/exterior/fortune-day-view-1.webp'
import amPool from '../assets/amenities/swimming-pool.webp'
import './Menu.css'

// Each entry also owns a picture and a line about itself: pointing at it brings the
// room around to that subject, and the panel on the right tells you what is behind it.
const MENU_ITEMS = [
  { num: '01', title: 'GALLERY', subtitle: 'EXPLORE THE VISION', key: 'gallery', name: 'Gallery', tag: 'Explore the vision', line: 'Every render of the tower and its amenities, shown full screen.', bg: extGolden },
  { num: '02', title: 'FLOOR PLANS', subtitle: 'FIND YOUR PERFECT SPACE', key: 'floors', name: 'Floor Plans', tag: 'Find your perfect space', line: 'The 4, 5 and 6 BHK residences, laid out floor by floor.', bg: extEveningCrop },
  { num: '03', title: 'NEIGHBORHOOD', subtitle: 'AT THE HEART OF IT ALL', key: 'location', name: 'Neighborhood', tag: 'At the heart of it all', line: 'Steps from Mumbai Central, with the city and the sea around you.', bg: extMetro },
  { num: '04', title: '360° VIEW', subtitle: 'STEP INSIDE', key: 'views', name: '360° View', tag: 'Step inside', line: 'Look all the way round from the terrace, in a full panorama.', bg: extDay },
  { num: '05', title: 'AMENITIES', subtitle: 'REFINED LUXURY', key: 'amenities', name: 'Amenities', tag: 'Refined luxury', line: 'A pool, fitness studio, private theatre, banquet hall and more.', bg: amPool },
  { num: '06', title: 'ENQUIRE', subtitle: 'CONNECT WITH US', key: 'enquiry', name: 'Enquire', tag: 'Connect with us', line: 'Tell us what you are looking for, and begin the conversation.', bg: extEvening },
]

const GOLD = '#f0b866'
const GOLD_LIGHT = '#ffd58a'

const HomeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
  </svg>
)

const FACTS = [
  ['Floors', '24'],
  ['Residences', '4 · 5 · 6 BHK'],
  ['Address', 'Mumbai Central'],
]

function Menu({ onClose, onSelect }) {
  const [active, setActive] = useState(-1)
  const rootRef = useRef(null)
  const item = MENU_ITEMS[active]

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo(rootRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 })
      tl.fromTo('.mn-bg', { scale: 1.05 }, { scale: 1, duration: 2.4 }, 0)
      tl.fromTo('.mn-side', { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 1.2 }, 0.1)
      tl.fromTo('.mn-brand', { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 0.9 }, 0.3)
      tl.fromTo('.mn-item', { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.7, stagger: 0.08 }, 0.6)
      tl.fromTo('.mn-home', { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 0.8 }, 0.6)

      // the room drifts a touch against the pointer
      const px = gsap.quickTo('.mn-drift', 'x', { duration: 1.6, ease: 'power3.out' })
      const py = gsap.quickTo('.mn-drift', 'y', { duration: 1.6, ease: 'power3.out' })
      const onMove = (e) => {
        px(-(e.clientX / window.innerWidth - 0.5) * 34)
        py(-(e.clientY / window.innerHeight - 0.5) * 20)
      }
      window.addEventListener('mousemove', onMove)
      return () => window.removeEventListener('mousemove', onMove)
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative h-svh w-full overflow-hidden bg-[#1a0a0c] text-cream">
      {/* The room: every picture stacked, the one being pointed at is brought forward */}
      <div className="mn-bg absolute inset-0 overflow-hidden">
        <div className="mn-drift absolute -inset-[2.5%]">
          <div className={`mn-layer ${active < 0 ? 'is-on' : ''}`}>
            <img src={menuBg} alt="" className="object-top" />
          </div>
          {MENU_ITEMS.map((m, i) => (
            <div key={m.key} className={`mn-layer ${i === active ? 'is-on' : ''}`}>
              <img src={m.bg} alt="" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-[rgba(14,6,10,0.3)]" />
        <div className="absolute inset-0 bg-[rgba(10,4,6,0.4)] lg:hidden" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 85% at 0% 50%, rgba(10,4,6,0.6) 0%, rgba(10,4,6,0.25) 55%, rgba(10,4,6,0) 100%), radial-gradient(ellipse 55% 80% at 100% 50%, rgba(10,4,6,0.62) 0%, rgba(10,4,6,0) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(10,4,6,0.45) 0%, rgba(10,4,6,0) 22%, rgba(10,4,6,0) 70%, rgba(10,4,6,0.5) 100%)' }} />
      </div>

      {/* Left side: the dark leaf artwork, easing into the photograph */}
      <div
        className="mn-side pointer-events-none absolute inset-y-0 left-0 z-[5] w-[88%] max-w-[30rem] lg:w-[34%] lg:max-w-[36rem]"
        style={{
          background: `url(${menuLeaves}) left top / cover, #080506`,
          WebkitMaskImage: 'radial-gradient(ellipse 100% 78% at 0% 50%, #000 0%, #000 45%, rgba(0,0,0,0.55) 70%, transparent 100%)',
          maskImage: 'radial-gradient(ellipse 100% 78% at 0% 50%, #000 0%, #000 45%, rgba(0,0,0,0.55) 70%, transparent 100%)',
          filter: 'blur(2.5px)',
          transform: 'scale(1.04)',
          transformOrigin: 'left center',
        }}
      />

      {/* Logo: fixed to the top-left corner */}
      <button type="button" onClick={onClose} className="mn-brand absolute left-5 top-5 z-20 border-none bg-transparent p-0 text-left sm:left-8 md:left-12 md:top-9">
        <BrandMark />
      </button>

      {/* Home */}
      <button
        type="button"
        onClick={onClose}
        className="mn-home lux-btn absolute right-5 top-5 z-20 flex items-center gap-3 rounded-full px-6 py-2.5 text-[0.625rem] uppercase tracking-[0.3rem] sm:right-8 md:right-12 md:top-9"
      >
        <HomeIcon /> Home
      </button>

      {/* Left column: brand, then the six entries as plain type on the photograph */}
      <nav className="absolute inset-y-0 left-0 z-10 flex w-full max-w-[26rem] flex-col px-6 pb-10 pt-6 sm:px-10 lg:max-w-[28rem] lg:pl-14 xl:pl-[4.5rem]" aria-label="Main menu">
        <ul className="my-auto flex w-full max-w-[21rem] flex-col gap-[clamp(0.2rem,0.9svh,0.5rem)]" onMouseLeave={() => setActive(-1)}>
          {MENU_ITEMS.map((m, i) => {
            const on = i === active
            return (
              <li key={m.num} className="mn-item flex items-start gap-3">
                <span className="w-6 pt-3.5 text-[0.5625rem] tracking-[0.1rem] text-cream/60">{m.num}</span>
                <button
                  type="button"
                  onClick={() => onSelect?.(m.key)}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(-1)}
                  onPointerMove={(e) => {
                    const r = e.currentTarget.getBoundingClientRect()
                    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
                    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
                  }}
                  className={`mn-glow flex flex-1 items-center justify-between gap-2 rounded-lg border-none bg-transparent px-3.5 py-[clamp(0.4rem,1.3svh,0.6rem)] text-left ${on ? 'is-on' : ''}`}
                >
                  <span className="relative">
                    <span className="block text-[0.8125rem] font-medium tracking-[0.18rem] transition-colors duration-500" style={{ color: on ? GOLD_LIGHT : '#f9e4d4' }}>{m.title}</span>
                    <span className="mt-1 block text-[0.5rem] tracking-[0.12rem] text-cream/65">{m.subtitle}</span>
                  </span>
                  <span
                    className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-500"
                    style={{ borderColor: 'rgba(240,184,102,0.7)', color: GOLD_LIGHT, opacity: on ? 1 : 0, transform: on ? 'none' : 'translateX(-0.4rem)' }}
                  >
                    <svg width="11" height="8" viewBox="0 0 16 12" fill="none" aria-hidden="true">
                      <path d="M1 6h13M9 1l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Right: a panel that always says what you are looking at. Re-keyed on every change so it re-sets itself. */}
      <aside className="pointer-events-none absolute inset-y-0 right-14 z-10 hidden w-[34rem] items-center lg:flex xl:right-24" aria-live="polite">
        <div key={item ? item.key : 'home'} className="mn-panel relative w-full text-right">
          {/* the section's number, drawn as a ghost behind the words */}
          {item && <span className="mn-ghost" aria-hidden="true">{item.num}</span>}

          <span className="mn-rise block" style={{ '--d': '0s' }}>
            <span className="inline-flex items-center gap-4 text-[0.625rem] uppercase tracking-[0.4rem] text-cream/85">
              {item ? `${item.num} — Tughra Royale` : 'Tughra Royale'}
              <i className="block h-px w-14" style={{ background: GOLD }} />
            </span>
          </span>

          <h2 className="relative mt-8 font-serif font-normal leading-[1.04] text-cream" style={{ fontSize: 'clamp(2.8rem, 4.4vw, 4.8rem)' }}>
            {item ? (
              <>
                <span className="mn-rise block pb-1" style={{ '--d': '0.08s' }}>{item.name}</span>
                <span className="mn-rise block pb-1" style={{ '--d': '0.18s', color: GOLD_LIGHT, fontSize: '0.5em', letterSpacing: '0.02em' }}>{item.tag}</span>
              </>
            ) : (
              <>
                <span className="mn-rise block pb-1" style={{ '--d': '0.08s' }}>The Emperor&rsquo;s Seal,</span>
                <span className="mn-rise block pb-1" style={{ '--d': '0.18s', color: GOLD_LIGHT }}>above Mumbai</span>
                <span className="mn-rise block pb-1" style={{ '--d': '0.28s', color: GOLD_LIGHT }}>Central.</span>
              </>
            )}
          </h2>

          <p className="mn-rise ml-auto mt-7 block max-w-[22rem] text-[0.9375rem] leading-[1.8] text-cream/85" style={{ '--d': '0.34s' }}>
            {item ? item.line : '24 floors of 4, 5 and 6 BHK residences, crowned in copper and lifted above the city and sea.'}
          </p>

          {/* default: the building in three facts. Pointing at an entry: a cue to step through. */}
          <div className="mn-rise mt-10 block" style={{ '--d': '0.44s' }}>
            {item ? (
              <span className="inline-flex items-center gap-4 text-[0.625rem] font-medium uppercase tracking-[0.35rem]" style={{ color: GOLD_LIGHT }}>
                Enter
                <svg width="38" height="12" viewBox="0 0 38 12" fill="none" aria-hidden="true"><path d="M0 6h36M31 1l5 5-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            ) : (
              <dl className="inline-flex items-stretch">
                {FACTS.map(([k, v], i) => (
                  <div key={k} className="whitespace-nowrap text-right" style={{ borderLeft: i ? '1px solid rgba(240,184,102,0.35)' : 'none', paddingLeft: i ? '1.4rem' : 0, paddingRight: i < FACTS.length - 1 ? '1.4rem' : 0 }}>
                    <dt className="text-[0.5625rem] uppercase tracking-[0.25rem] text-cream/55">{k}</dt>
                    <dd className="mt-2 text-[0.9375rem] font-medium tracking-[0.05rem] text-cream">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </aside>
    </section>
  )
}

export default Menu
