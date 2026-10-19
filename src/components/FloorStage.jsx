import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from 'gsap'

import { UNITS } from './floorUnits.js'

const TBC = 'To be confirmed'
const GOLD = '#a8724e'
const INK = '#2a1a14'

const Ico = ({ children, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

const floorTitle = (f) => (f.num === 'G' ? 'Ground Floor' : f.num === 'T' ? 'Terrace' : `Floor ${parseInt(f.num, 10)}`)

// Right-hand column: the residence card for the chosen floor and unit, and the strip of facts beneath it.
// Keyed by floor and unit in the parent, so the entrance plays on every change.
function FloorStage({ floor, unitId, setUnitId }) {
  const [zoom, setZoom] = useState(false)
  const rootRef = useRef(null)
  const unit = UNITS.find((u) => u.id === unitId)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo('.fs-line', { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: 'power4.out' }, 0)
      tl.fromTo('.fs-rise', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.06 }, 0.15)
      tl.fromTo('.fs-plan', { clipPath: 'inset(0 100% 0 0 round 0.75rem)' }, { clipPath: 'inset(0 0% 0 0 round 0.75rem)', duration: 1, ease: 'power3.inOut' }, 0.1)
    }, rootRef)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (!zoom) return
    const onKey = (e) => e.key === 'Escape' && setZoom(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoom])

  const specs = [
    [<path key="a" d="M4 9V4h5M4 4l6 6M20 15v5h-5M20 20l-6-6M20 4v5M4 20v-5" />, 'Approx. area', unit.carpetArea ?? TBC, unit.carpetArea == null],
    [<path key="b" d="M2 16c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0M2 11c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0" />, 'View', 'City + Sea', false],
    [<path key="c" d="M4 12V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M3 12h18v5H3zM5 17v2M19 17v2" />, 'Configuration', `${unit.bedrooms} Bedrooms`, false],
    [<path key="d" d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5" />, 'Status', 'Choose a floor on the tower to see its residence.', false],
  ]

  const highlights = [
    [<path key="h1" d="M4 12V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M3 12h18v5H3z" />, 'Ensuite bedrooms', 'Every bedroom with its own bath.'],
    [<path key="h2" d="M3 20V9l9-5 9 5v11M9 20v-6h6v6" />, 'Spacious living and dining', 'Open, generous rooms for modern living.'],
    [<><circle key="h3a" cx="12" cy="12" r="4" /><path key="h3b" d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>, 'Panoramic views', 'Over the city skyline and the sea.'],
  ]

  const facts = [
    [<path key="f1" d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />, 'Unit', `Signature ${unit.label} residence`],
    [<><circle key="f2a" cx="12" cy="12" r="9" /><path key="f2b" d="M15.5 8.5l-2 5-5 2 2-5z" /></>, 'Facing', TBC],
    [<path key="f3" d="M2 16c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0M2 11c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0" />, 'Views', 'City skyline & the sea'],
    [<circle key="f4" cx="12" cy="12" r="8" />, 'Availability', 'Enquire to check availability'],
  ]

  return (
    <div ref={rootRef} className="col-span-2 flex min-h-0 min-w-0 flex-col gap-4 lg:col-span-1 lg:justify-center">
      {/* ---------- The residence card ---------- */}
      <div
        className="relative min-w-0 rounded-[1.25rem] p-5 text-[#2a1a14] sm:p-7"
        style={{ background: 'linear-gradient(160deg, #f8eee2 0%, #efe0cd 100%)', border: '1px solid rgba(201,139,98,0.55)', boxShadow: '0 2rem 4rem rgba(0,0,0,0.5)' }}
      >
        {/* header: the floor, and the residence type */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="fs-rise flex items-center gap-3 text-[0.5625rem] font-medium uppercase tracking-[0.3rem] text-[#6b5a3a]">
              Residence <i className="block h-px w-8" style={{ background: GOLD }} />
            </span>
            <div className="overflow-hidden pb-1">
              <h2 className="fs-line mt-1 font-serif text-[clamp(2.4rem,4vw,3.6rem)] font-medium leading-none" style={{ color: INK }}>
                {floorTitle(floor)}
              </h2>
            </div>
            <p className="fs-rise mt-1.5 text-[0.6875rem] uppercase tracking-[0.3rem] text-[#3d2c22]">Signature {unit.label} residence</p>
          </div>

          {/* the unit types */}
          <div className="fs-rise flex items-center gap-1 rounded-full border border-[#a8724e]/30 bg-white/40 p-1">
            {UNITS.map((u) => {
              const on = u.id === unitId
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setUnitId(u.id)}
                  aria-pressed={on}
                  className="rounded-full border-none px-3.5 py-2 text-[0.625rem] font-medium uppercase tracking-[0.15rem] transition-all duration-500"
                  style={{ background: on ? '#1d1012' : 'transparent', color: on ? '#e8b48f' : '#4a3f30' }}
                >
                  {u.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* the specs */}
        <dl className="fs-rise mt-5 grid grid-cols-2 overflow-hidden rounded-xl border border-[#a8724e]/25 bg-white/35 md:grid-cols-4">
          {specs.map(([icon, label, value, muted], i) => (
            <div key={label} className={`px-4 py-3.5 ${i % 2 ? 'border-l border-[#a8724e]/20' : ''} ${i > 1 ? 'border-t border-[#a8724e]/20 md:border-t-0' : ''} ${i === 2 ? 'md:border-l md:border-[#a8724e]/20' : ''}`}>
              <span className="text-[#8f5f40]"><Ico size={18}>{icon}</Ico></span>
              <dt className="mt-2 text-[0.5rem] font-medium uppercase tracking-[0.22rem] text-[#6b5a3a]">{label}</dt>
              <dd className={`mt-1 font-serif leading-snug ${i === 3 ? 'text-[0.8125rem] text-[#6b5a3a]' : 'text-[1.125rem]'} ${muted ? 'text-[#2a1a14]/45' : ''}`}>{value}</dd>
            </div>
          ))}
        </dl>

        {/* the plan, and what makes the residence */}
        <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <button
            type="button"
            onClick={() => setZoom(true)}
            aria-label={`View the ${unit.label} plan larger`}
            className="fs-plan group relative aspect-[3/2] min-w-0 overflow-hidden rounded-xl border-none p-0"
            style={{ background: '#bdb2a8' }}
          >
            <img src={unit.iso} alt={`${unit.label} isometric plan`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" draggable={false} />
          </button>

          <div className="flex min-w-0 flex-col justify-between gap-4">
            <div>
              <span className="fs-rise flex items-center gap-3 text-[0.5625rem] font-medium uppercase tracking-[0.3rem] text-[#3d2c22]">
                Residence highlights <i className="block h-px w-8" style={{ background: GOLD }} />
              </span>
              <ul className="mt-4 space-y-3.5">
                {highlights.map(([icon, main, sub]) => (
                  <li key={main} className="fs-rise flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#fff1d9]" style={{ background: 'linear-gradient(145deg,#b07a3c,#7a4a24)' }}>
                      <Ico size={17}>{icon}</Ico>
                    </span>
                    <span className="min-w-0 leading-tight">
                      <span className="block font-serif text-[1rem]" style={{ color: INK }}>{main}</span>
                      <span className="mt-0.5 block text-[0.6875rem] text-[#6b5a3a]">{sub}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setZoom(true)}
              className="fs-rise group flex items-center justify-between gap-3 self-start rounded-full px-7 py-3.5 text-[0.625rem] font-medium uppercase tracking-[0.22rem] text-[#efe2d4] shadow-[0_0.75rem_1.5rem_rgba(18,15,13,0.35)] transition-colors duration-300 hover:text-[#e8b48f]"
              style={{ background: 'linear-gradient(180deg,#2a1519,#13100e)' }}
            >
              View floor plan
              <svg className="transition-transform duration-300 group-hover:translate-x-1" width="16" height="11" viewBox="0 0 16 12" fill="none" aria-hidden="true"><path d="M1 6h13M9 1l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* ---------- The facts strip ---------- */}
      <dl className="fs-rise grid grid-cols-2 rounded-[1.25rem] border border-[#c98b62]/30 md:grid-cols-4" style={{ background: 'linear-gradient(180deg, rgba(44,35,30,0.55) 0%, rgba(20,16,14,0.7) 100%)' }}>
        {facts.map(([icon, label, value], i) => (
          <div key={label} className={`flex items-start gap-3 px-5 py-4 ${i ? 'md:border-l md:border-[#c98b62]/20' : ''} ${i % 2 ? 'border-l border-[#c98b62]/20' : ''} ${i > 1 ? 'border-t border-[#c98b62]/20 md:border-t-0' : ''}`}>
            <span className="mt-0.5 text-[#c98b62]"><Ico size={20}>{icon}</Ico></span>
            <span className="min-w-0">
              <dt className="text-[0.5rem] font-medium uppercase tracking-[0.22rem] text-cream/60">{label}</dt>
              <dd className={`mt-1 font-serif text-[0.875rem] leading-snug ${value === TBC ? 'text-cream/45' : 'text-cream'}`}>{value}</dd>
            </span>
          </div>
        ))}
      </dl>

      {/* Larger view - portalled to <body> so nothing on the page can overlap it */}
      {zoom &&
        createPortal(
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 pt-20 sm:p-10 sm:pt-24" style={{ background: 'rgba(14,11,10,0.94)' }} onClick={() => setZoom(false)}>
            <button
              type="button"
              onClick={() => setZoom(false)}
              aria-label="Close"
              className="lux-btn absolute right-5 top-5 z-10 flex items-center gap-2.5 rounded-full px-5 py-2.5 text-[0.625rem] uppercase tracking-[0.25rem] sm:right-8 sm:top-8"
            >
              <Ico size={14}><path d="M6 6l12 12M18 6L6 18" /></Ico>
              Close
            </button>
            <div className="relative h-full w-full max-w-[80rem] overflow-hidden rounded-2xl border border-[#c98b62]/40" style={{ background: '#bdb2a8' }} onClick={(e) => e.stopPropagation()}>
              <img src={unit.iso} alt={`${unit.label} isometric plan`} className="h-full w-full object-contain" draggable={false} />
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}

export default FloorStage
