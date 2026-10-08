import BrandMark from '../components/BrandMark.jsx'
import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import menuBg from '../assets/render/menu.png'
import menuLeaves from '../assets/decor/menu-leaves.png'
import './Menu.css'

const MENU_ITEMS = [
  { num: '01', title: 'GALLERY', subtitle: 'EXPLORE THE VISION', key: 'gallery' },
  { num: '02', title: 'FLOOR PLANS', subtitle: 'FIND YOUR PERFECT SPACE', key: 'floors' },
  { num: '03', title: 'LOCATION', subtitle: 'AT THE HEART OF IT ALL', key: 'location' },
  { num: '04', title: '360° VIEW', subtitle: 'STEP INSIDE', key: 'views' },
  { num: '05', title: 'AMENITIES', subtitle: 'REFINED LUXURY', key: 'amenities' },
  { num: '06', title: 'ENQUIRY', subtitle: 'CONNECT WITH US', key: 'enquiry' },
]

const GOLD = '#f0b866'
const GOLD_LIGHT = '#ffd58a'

const HomeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
  </svg>
)

function Menu({ onClose, onSelect }) {
  const [active, setActive] = useState(-1)
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo(rootRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 })
      tl.fromTo('.mn-bg', { scale: 1.05 }, { scale: 1, duration: 2.4 }, 0)
      tl.fromTo('.mn-side', { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 1.2 }, 0.1)
      tl.fromTo('.mn-brand', { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 0.9 }, 0.3)
      tl.fromTo('.mn-item', { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.7, stagger: 0.08 }, 0.6)
      tl.fromTo('.mn-home', { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 0.8 }, 0.6)
      tl.fromTo('.about-line', { yPercent: 115 }, { yPercent: 0, duration: 1.1, stagger: 0.12, ease: 'power4.out' }, 0.9)
      tl.fromTo('.about-fade', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 }, 1.2)
      tl.fromTo('.about-bar', { scaleY: 0 }, { scaleY: 1, duration: 1.2, ease: 'power3.inOut', transformOrigin: 'top' }, 1.3)

      // the photograph drifts a touch with the pointer
      const px = gsap.quickTo('.mn-bg', 'x', { duration: 1.4, ease: 'power3.out' })
      const onMove = (e) => px(-(e.clientX / window.innerWidth - 0.5) * 14)
      window.addEventListener('mousemove', onMove)
      return () => window.removeEventListener('mousemove', onMove)
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative h-svh w-full overflow-hidden bg-[#1a0a0c] text-cream">
      {/* Photograph, dimmed at the left edge where the menu sits and at the right where the text sits */}
      <div className="absolute inset-0 overflow-hidden">
        <img src={menuBg} alt="" className="mn-bg h-full w-full object-cover object-top" />
        <div className="absolute inset-0 bg-[rgba(14,6,10,0.3)]" />
        <div className="absolute inset-0 bg-[rgba(10,4,6,0.4)] lg:hidden" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 85% at 0% 50%, rgba(10,4,6,0.6) 0%, rgba(10,4,6,0.25) 55%, rgba(10,4,6,0) 100%), radial-gradient(ellipse 45% 70% at 100% 50%, rgba(10,4,6,0.4) 0%, rgba(10,4,6,0) 100%)' }} />
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
                    <span className="block font-serif text-[0.9375rem] font-semibold tracking-[0.1rem] transition-colors duration-500" style={{ color: on ? GOLD_LIGHT : '#f9e4d4' }}>{m.title}</span>
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

      {/* Right: about the building */}
      <aside className="absolute right-14 top-[24%] z-10 hidden w-[32rem] text-right lg:block xl:right-24" style={{ textShadow: '0 0.125rem 1.25rem rgba(0,0,0,0.5)' }}>
        <span className="about-bar absolute -right-8 top-[3.2rem] block h-[17.5rem] w-px xl:-right-10" style={{ background: 'rgba(240,184,102,0.7)' }} />
        <span className="about-fade block text-[0.625rem] uppercase tracking-[0.4rem] text-cream/90">Tughra Royale</span>
        <span className="about-fade ml-auto mt-3 block h-px w-24" style={{ background: GOLD }} />
        <h2 className="mt-9 font-serif text-[clamp(2.4rem,3.7vw,3.8rem)] font-normal leading-[1.12] text-cream">
          <span className="block overflow-hidden pb-1"><span className="about-line block">The Emperor&rsquo;s Seal,</span></span>
          <span className="block overflow-hidden pb-1"><span className="about-line block" style={{ color: GOLD_LIGHT }}>above Mumbai</span></span>
          <span className="block overflow-hidden pb-1"><span className="about-line block" style={{ color: GOLD_LIGHT }}>Central.</span></span>
        </h2>
        <p className="about-fade ml-auto mt-8 max-w-[21rem] text-[0.9375rem] leading-[1.75] text-cream/90">
          24 floors of 4, 5 and 6 BHK residences, crowned in copper and lifted above the city and sea.
        </p>
      </aside>
    </section>
  )
}

export default Menu
