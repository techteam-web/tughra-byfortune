import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import menuBg from '../assets/render/menu.webp'
import BackButton from '../components/BackButton.jsx'
import './Menu.css'

const MENU_ITEMS = [
  { num: '01', title: 'GALLERY', subtitle: 'EXPLORE THE VISION', key: 'gallery' },

  { num: '02', title: 'FLOOR PLANS', subtitle: 'FIND YOUR PERFECT SPACE', key: 'floors' },
  { num: '03', title: 'LOCATION', subtitle: 'AT THE CENTRE OF IT ALL', key: 'location' },
  { num: '04', title: '360° VIEW', subtitle: 'STEP INSIDE', key: 'views' },
  { num: '05', title: 'AMENITIES', subtitle: 'REFINED LEISURE', key: 'amenities' },


]

function Menu({ onClose, onSelect }) {
  const [activeIndex, setActiveIndex] = useState(-1)
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
    tl.fromTo(rootRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 })
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(10,9,8,0.35)_90%,_rgba(10,9,8,0.75)_100%,_rgba(10,9,8,0.92)_100%)]" />
      </div>

      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-6 md:px-12 md:py-10">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center border-none bg-transparent p-0 text-left"
        >
          <span>
            <strong className="block font-serif text-2xl tracking-[6px] text-cream">TUGHRA</strong>
            <span className="mt-1.5 block text-[10px] tracking-[3px] text-muted">MUMBAI CENTRAL</span>
          </span>
        </button>

        <div className="flex items-center gap-6">
          <BackButton onClick={onClose} label="Home" icon="home" />
        </div>
      </div>

      {/* Menu list */}
      <nav className="absolute left-6 top-1/2 z-10 w-full max-w-[300px] -translate-y-1/2 md:left-24">
        <ul className="flex flex-col gap-2.5" onMouseLeave={() => setActiveIndex(-1)}>
          {MENU_ITEMS.map((item, i) => {
            const active = i === activeIndex
            return (
              <li key={item.num} className="menu-item flex items-start gap-3">
                <span className="pt-2 text-[9px] tracking-[1px] text-muted/70 md:pt-2.5">{item.num}</span>
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
                  className={`group flex w-full items-center justify-between gap-2.5 rounded-xl border text-left transition-all duration-300 ${
                    active
                      ? 'luxury-btn border-transparent bg-black/35 px-3 py-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.25)]'
                      : 'border-transparent bg-transparent px-3 py-1.5'
                  }`}
                >
                  <span>
                    <span
                      className={`block font-serif text-sm tracking-[1.5px] transition-colors md:text-base ${
                        active ? 'text-cream' : 'text-cream/40'
                      }`}
                    >
                      {item.title}
                    </span>
                    <span
                      className={`mt-0.5 block text-[8px] tracking-[1.2px] transition-colors ${
                        active ? 'text-muted' : 'text-muted/40'
                      }`}
                    >
                      {item.subtitle}
                    </span>
                  </span>
                  <span
                    className={`luxury-arrow flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                      active ? 'opacity-100' : 'pointer-events-none opacity-0'
                    }`}
                  >
                    <svg width="12" height="9" viewBox="0 0 16 12" fill="none" aria-hidden="true">
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

      {/* Right side copy */}
      <div className="absolute right-6 top-[46%] z-10 hidden -translate-y-1/2 text-right md:right-44 md:block">
        <h2 className="font-serif text-[clamp(23px,2.52vw,33.6px)] uppercase leading-[1.25] tracking-[1px] text-cream/90">
          More than
          <br />
          a residence
        </h2>
        <p className="mt-3 flex items-center justify-end gap-3 text-[10px] uppercase tracking-[2px] text-muted">
          A brighter tomorrow
          <span className="h-px w-6 bg-muted/60" />
        </p>
      </div>

  
    </section>
  )
}

export default Menu
