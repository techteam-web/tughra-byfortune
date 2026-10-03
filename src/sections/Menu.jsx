import BrandMark from '../components/BrandMark.jsx'
import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import menuBg from '../assets/render/menu.png'
import BackButton from '../components/BackButton.jsx'
import './Menu.css'

const MENU_ITEMS = [
  { num: '01', title: 'GALLERY', subtitle: 'EXPLORE THE VISION', key: 'gallery' },

  { num: '02', title: 'FLOOR PLANS', subtitle: 'FIND YOUR PERFECT SPACE', key: 'floors' },
  { num: '03', title: 'LOCATION', subtitle: 'AT THE CENTRE OF IT ALL', key: 'location' },
  { num: '04', title: '360° VIEW', subtitle: 'STEP INSIDE', key: 'views' },
  { num: '05', title: 'AMENITIES', subtitle: 'REFINED LEISURE', key: 'amenities' },

   { num: '06', title: 'ENQUIRY', subtitle: 'CONTACT FORM', key: 'enquiry' },


]

function Menu({ onClose, onSelect }) {
  const [activeIndex, setActiveIndex] = useState(-1)
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
    tl.fromTo(rootRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 })
    tl.fromTo('.about-line', { yPercent: 115 }, { yPercent: 0, duration: 1.1, stagger: 0.12, ease: 'power4.out' }, 0.5)
    tl.fromTo('.about-fade', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 }, 0.9)
    tl.fromTo('.about-rule', { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'power3.inOut' }, 0.7)
    gsap.utils.toArray('.about-count').forEach((el) => {
      const target = Number(el.dataset.count)
      const o = { v: 0 }
      tl.to(o, { v: target, duration: 1.8, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v) } }, 1.1)
    })
    tl.fromTo(
      '.menu-item',
      { opacity: 0, x: -24 },
      { opacity: 1, x: 0, duration: 0.6, stagger: 0.07 },
      0.15
    )
    return () => tl.kill()
  }, [])

  return (
    <section ref={rootRef} className="relative h-svh w-full overflow-hidden text-cream">
      <div className="absolute inset-0">
        <img src={menuBg} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(10,9,8,0.35)_70%,_rgba(10,9,8,0.75)_100%,_rgba(10,9,8,0.92)_100%)]" />
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[rgba(10,9,8,0.55)] via-[rgba(10,9,8,0.15)] to-transparent" />
      </div>

      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-5 sm:px-6 sm:py-6 md:px-12 md:py-10">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center border-none bg-transparent p-0 text-left"
        >
          <BrandMark />
        </button>

        <div className="flex items-center gap-6">
          <BackButton onClick={onClose} label="Home" icon="home" />
        </div>
      </div>

      {/* Menu list */}
      <nav
        className="absolute left-4 right-4 top-1/2 z-10 max-w-[17.5rem] -translate-y-1/2 rounded-2xl p-3.5 sm:left-6 sm:right-auto sm:w-full sm:max-w-[20rem] md:left-24"
        style={{ backdropFilter: 'blur(1px)', WebkitBackdropFilter: 'blur(0.125rem)' }}
      >
        <ul className="flex flex-col gap-2 sm:gap-2.5" onMouseLeave={() => setActiveIndex(-1)}>
          {MENU_ITEMS.map((item, i) => {
            const active = i === activeIndex
            return (
              <li key={item.num} className="menu-item flex items-start gap-3">
                <span className="pt-1.5 text-[0.53125rem] tracking-[1px] text-muted/70 sm:text-[0.5625rem]">{item.num}</span>
                <button
                  type="button"
                  onClick={() => item.key && onSelect?.(item.key)}
                  onMouseEnter={() => setActiveIndex(i)}
                  onFocus={() => setActiveIndex(i)}
                  onPointerMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = ((e.clientX - rect.left) / rect.width) * 100
                    const clampedX = Math.max(4, Math.min(96, x))
                    e.currentTarget.style.setProperty('--mx', `${clampedX}%`)
                  }}
                  onPointerLeave={(e) => e.currentTarget.style.setProperty('--mx', '82%')}
                  className={`group flex w-full items-center justify-between gap-2 rounded-lg border text-left transition-all duration-300 ${
                    active
                      ? 'luxury-btn border-transparent bg-black/35 px-3 py-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.25)]'
                      : 'border-transparent bg-transparent px-3 py-1.5'
                  }`}
                >
                  <span>
                    <span
                      className={`block font-serif text-sm font-semibold tracking-[0.075rem] text-cream transition-colors sm:text-base ${
                        active ? 'text-gold-light' : ''
                      }`}
                    >
                      {item.title}
                    </span>
                    <span
                      className={`mt-0.5 block text-[0.46875rem] tracking-[1px] transition-colors sm:text-[0.5625rem] ${
                        active ? 'text-muted' : 'text-muted/70'
                      }`}
                    >
                      {item.subtitle}
                    </span>
                  </span>
                  <span
                    className={`luxury-arrow flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                      active ? 'opacity-100' : 'pointer-events-none opacity-0'
                    }`}
                  >
                    <svg width="11" height="8" viewBox="0 0 16 12" fill="none" aria-hidden="true">
                      <path
                        d="M1 6h13M9 1l5 5-5 5"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Right side: about the building - a quiet line of type on the render */}
      <div className="pointer-events-none absolute inset-y-0 right-0 z-[5] hidden w-[45%] bg-gradient-to-l from-[rgba(10,9,8,0.6)] to-transparent lg:block" />
      <aside
        className="absolute right-10 top-[56%] z-10 hidden w-[22rem] -translate-y-1/2 text-right lg:block xl:right-24 xl:w-[26rem]"
        style={{ textShadow: '0 0.125rem 1.25rem rgba(0,0,0,0.6)' }}
      >
        <span className="about-fade block text-[0.625rem] uppercase tracking-[0.3rem] text-gold">Tughra Royale</span>
        <h2 className="mt-5 font-serif text-[clamp(2rem,3.2vw,3.25rem)] font-medium leading-[1.08] text-cream">
          <span className="block overflow-hidden pb-1"><span className="about-line block">The Emperor&rsquo;s Seal,</span></span>
          <span className="block overflow-hidden pb-1"><span className="about-line block italic text-gold-light">above Mumbai Central.</span></span>
        </h2>
        <span className="about-rule mt-6 ml-auto block h-px w-24 origin-right bg-gold/70" />
        <p className="about-fade mt-5 ml-auto max-w-[19rem] text-[0.875rem] leading-[1.8] text-cream/75">
          24 floors of 4, 5 and 6 BHK residences, crowned in copper and lifted above the city and sea.
        </p>
      </aside>
    </section>
  )
}

export default Menu
