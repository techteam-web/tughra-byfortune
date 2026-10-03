import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from 'gsap'

import iso4 from '../assets/gallery/iso/Fortune_4BHK_ISO.jpeg'
import iso5 from '../assets/gallery/iso/Fortune_5BHK_ISO.jpeg'
import iso6 from '../assets/gallery/iso/Fortune_6BHK_ISO.jpg'

// Edit the figures here. null renders as "To be confirmed" - no numbers are
// invented. Drop 2D plan renders into /public/assets/plans/ and they appear
// automatically.
const UNITS = [
  { id: '4bhk', label: '4 BHK', bedrooms: 4, iso: iso4, plan2d: '/assets/plans/4bhk-2d.jpg', carpetArea: null, floorToFloor: null, facing: null },
  { id: '5bhk', label: '5 BHK', bedrooms: 5, iso: iso5, plan2d: '/assets/plans/5bhk-2d.jpg', carpetArea: null, floorToFloor: null, facing: null },
  { id: '6bhk', label: '6 BHK', bedrooms: 6, iso: iso6, plan2d: '/assets/plans/6bhk-2d.jpg', carpetArea: null, floorToFloor: null, facing: null },
]

const VIEW = 'City + Sea'

const HIGHLIGHTS = [
  { title: 'Private foyer entry', text: 'A more private, elevated arrival experience.', icon: <path d="M7 3h10v18H7zM14 12h.01" /> },
  { title: 'Wide living-dining layout', text: 'Expansive spaces designed for modern living.', icon: <path d="M4 12V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M3 12h18v5H3zM5 17v2M19 17v2" /> },
  { title: 'Large deck with panoramic views', text: 'Uninterrupted views of the city skyline and sea.', icon: <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5" /> },
]

const tbc = (v, suffix = '') => (v == null ? 'To be confirmed' : v + suffix)

const Ico = ({ children, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)

function Plan2D({ src, label }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-6 text-center">
        <span className="text-[#b58a3a]"><Ico size={34}><rect x="3" y="3" width="18" height="18" rx="1" /><path d="M3 9h18M9 21V9M14 9v6h7" /></Ico></span>
        <h4 className="font-serif text-2xl text-[#241f1a]">{label} Floor Plan</h4>
        <p className="text-[0.625rem] uppercase tracking-[0.125rem] text-[#8a7a5c]">Rendered plan to be added</p>
      </div>
    )
  }
  return <img src={src} alt={`${label} floor plan`} onError={() => setFailed(true)} className="h-full w-full object-contain" draggable={false} />
}

const stat = 'flex flex-col gap-0.5 px-5 py-2.5'

function UnitPanel({ floorTitle, floorLabel }) {
  const [unitId, setUnitId] = useState(UNITS[0].id)
  const [iso, setIso] = useState(false)
  const [zoom, setZoom] = useState(false)
  const stageRef = useRef(null)
  const rootRef = useRef(null)
  const unit = UNITS.find((u) => u.id === unitId)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      // the card is revealed by a wipe, led by a gold light sweeping across it
      tl.fromTo('.up-card', { clipPath: 'inset(0 100% 0 0 round 28px)' }, { clipPath: 'inset(0 0% 0 0 round 28px)', duration: 1, ease: 'power3.inOut' }, 0)
      tl.fromTo('.up-sweep', { xPercent: -120, opacity: 1 }, { xPercent: 1100, duration: 1.05, ease: 'power3.inOut' }, 0)
      tl.to('.up-sweep', { opacity: 0, duration: 0.2 }, 1)
      tl.fromTo('.up-line', { yPercent: 115 }, { yPercent: 0, duration: 0.9, ease: 'power4.out' }, 0.35)
      tl.fromTo('.up-fade', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.07 }, 0.5)
      tl.fromTo('.up-stat', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0.6)
      tl.fromTo('.up-plan', { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 1, ease: 'power3.out' }, 0.6)
      tl.fromTo('.up-hl', { opacity: 0, x: 22 }, { opacity: 1, x: 0, duration: 0.7, stagger: 0.1 }, 0.8)
      tl.fromTo('.up-strip', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8 }, 0.9)
    }, rootRef)
    return () => ctx.revert()
  }, [])

  useLayoutEffect(() => {
    gsap.fromTo(stageRef.current, { opacity: 0, scale: 0.985 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' })
  }, [unitId, iso])

  useEffect(() => {
    if (!zoom) return
    const onKey = (e) => e.key === 'Escape' && setZoom(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoom])

  return (
    <div ref={rootRef} className="flex h-full min-h-0 w-full min-w-0 flex-col gap-3">
      {/* Ivory card */}
      <div
        className="up-card relative flex min-h-0 flex-1 flex-col rounded-[1.75rem] p-4 text-[#241f1a] sm:p-6 lg:overflow-y-auto"
        style={{ background: 'linear-gradient(160deg,#f8f1e3 0%,#efe3cc 100%)', border: '1px solid rgba(201,162,39,0.6)', boxShadow: 'inset 0 0 0 4px rgba(255,255,255,0.35), 0 2rem 5rem rgba(0,0,0,0.5)' }}
      >
        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[1.75rem]">
          <div className="up-sweep absolute inset-y-0 left-0 w-24 opacity-0" style={{ background: 'linear-gradient(90deg, transparent, rgba(227,196,99,0.55) 50%, transparent)', filter: 'blur(6px)' }} />
        </div>

        {/* Heading */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="flex items-center gap-3 text-[0.625rem] uppercase tracking-[0.25rem] text-[#6b5a3a]">
              Residence
              <span className="h-px w-9 bg-[#b58a3a]" />
            </span>
            <div className="mt-2 overflow-hidden pb-1"><h2 className="up-line font-serif text-[clamp(1.75rem,min(3.2vw,5svh),2.75rem)] font-medium leading-none text-[#1d1816]">{floorTitle}</h2></div>
            <p className="mt-2 text-[0.6875rem] uppercase tracking-[0.3rem] text-[#3a3128] sm:text-[0.8125rem]">Signature {unit.label} Residence</p>
          </div>
          <div className="flex flex-col items-end gap-3">
          {/* Residence type */}
          <div className="ml-auto flex w-fit items-center gap-1 rounded-full border border-[#b58a3a]/40 bg-white/40 p-1">
            {UNITS.map((u) => {
              const on = u.id === unitId
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setUnitId(u.id)}
                  aria-pressed={on}
                  className="rounded-full border-none px-4 py-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.15rem] transition-all duration-500 sm:px-5"
                  style={{ background: on ? '#1d1816' : 'transparent', color: on ? '#f3ecd9' : '#4a3f30' }}
                >
                  {u.label}
                </button>
              )
            })}
          </div>
  
            <div className="hidden text-right text-[0.5625rem] uppercase leading-loose tracking-[0.3rem] text-[#6b5a3a] sm:block">
            Elevated Living
            <br />
            Above the City
            <span className="mt-1 ml-auto block h-px w-9 bg-[#b58a3a]" />
          </div>
        </div>
        </div>

        {/* Stats strip */}
        <div className="mt-4 grid shrink-0 grid-cols-2 divide-x divide-[#b58a3a]/25 rounded-xl border border-[#b58a3a]/25 bg-white/35 px-4 sm:grid-cols-4">
          {[
            ['Approx. Area', tbc(unit.carpetArea), <path key="a" d="M4 4h7v4H8v12H4zM13 4h7v16h-7z" />],
            ['View', VIEW, <path key="b" d="M2 16c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0M2 11c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0" />],
            ['Configuration', `${unit.bedrooms} Bed Residence`, <path key="c" d="M4 12V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M3 12h18v5H3zM5 17v2M19 17v2" />],
            ['Floor-to-Floor', tbc(unit.floorToFloor), <path key="d" d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5" />],
          ].map(([label, value, icon], i) => (
            <div key={label} className={`up-stat ${stat} ${i % 2 === 0 ? 'pl-0 sm:pl-5' : ''} ${i === 0 ? 'sm:!pl-1' : ''} ${i >= 2 ? 'border-t border-[#b58a3a]/25 sm:border-t-0' : ''}`}>
              <span className="text-[#b58a3a]"><Ico>{icon}</Ico></span>
              <span className="text-[0.5625rem] uppercase tracking-[0.2rem] text-[#6b5a3a]">{label}</span>
              <span className={`whitespace-nowrap font-serif text-[1.0625rem] leading-tight sm:text-[1.125rem] ${value === 'To be confirmed' ? 'text-[#241f1a]/40' : 'text-[#1d1816]'}`}>{value}</span>
            </div>
          ))}
        </div>

        {/* Plan + highlights */}
        <div className="mt-4 flex min-h-0 flex-1 flex-col gap-5 lg:flex-row">
          <div ref={stageRef} className="up-plan relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-2xl bg-[#faf6ee] shadow-inner ring-1 ring-[#b58a3a]/20 lg:aspect-auto lg:h-full lg:min-h-[10rem] lg:w-[46%]">
            {iso ? (
              <img src={unit.iso} alt={`${unit.label} isometric view`} className="h-full w-full object-contain" draggable={false} />
            ) : (
              <Plan2D key={unit.id} src={unit.plan2d} label={unit.label} />
            )}
            <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-[#1d1816]/80 px-3 py-1 text-[0.5rem] uppercase tracking-[0.2rem] text-gold-light backdrop-blur-md">
              {iso ? 'Isometric View' : 'Floor Plan'}
            </span>
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <span className="flex items-center gap-3 text-[0.625rem] uppercase tracking-[0.2rem] text-[#3a3128]">
              Residence Highlights
              <span className="h-px w-9 bg-[#b58a3a]" />
            </span>
            <ul className="mt-3 flex flex-col gap-2.5">
              {HIGHLIGHTS.map((h) => (
                <li key={h.title} className="up-hl flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#f8f1e3]" style={{ background: 'linear-gradient(135deg,#b58a3a,#7a5a22)' }}>
                    <Ico size={18}>{h.icon}</Ico>
                  </span>
                  <span>
                    <span className="block font-serif text-[1.0625rem] leading-tight text-[#1d1816]">{h.title}</span>
                    <span className="block text-[0.75rem] leading-snug text-[#6b5a3a]">{h.text}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-auto flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIso((v) => !v)}
                className="flex flex-1 items-center justify-between gap-3 rounded-full border-none bg-[#1d1816] px-6 py-3.5 text-[0.6875rem] font-medium uppercase tracking-[0.2rem] text-[#f3ecd9] shadow-[0_0.5rem_1.5rem_rgba(0,0,0,0.3)] transition-colors duration-300 hover:bg-[#2c2420]"
              >
                {iso ? 'View Floor Plan' : 'View Isometric'}
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M1 6h13M9 1l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button
                type="button"
                onClick={() => setZoom(true)}
                aria-label="View larger"
                title="View larger"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-none text-[#f8f1e3] shadow-[0_0.5rem_1.5rem_rgba(0,0,0,0.3)] transition-transform duration-300 hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#b58a3a,#7a5a22)' }}
              >
                <Ico size={18}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></Ico>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="up-strip grid grid-cols-2 divide-x divide-white/10 rounded-2xl border border-gold/25 bg-black/35 px-2 py-2.5 backdrop-blur-xl sm:grid-cols-4">
        {[
          ['Unit', `${unit.bedrooms} Bedroom Residence`, <path key="a" d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />],
          ['Facing', tbc(unit.facing), <path key="b" d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM15.5 8.5l-2 5-5 2 2-5z" />],
          ['Views', 'City Skyline & Arabian Sea', <path key="c" d="M2 16c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0M2 11c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0" />],
          ['Location', floorLabel, <path key="d" d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />],
        ].map(([label, value, icon]) => (
          <div key={label} className="flex items-center gap-3 px-4 py-2">
            <span className="text-gold"><Ico size={22}>{icon}</Ico></span>
            <span className="min-w-0">
              <span className="block text-[0.5625rem] uppercase tracking-[0.2rem] text-muted">{label}</span>
              <span className={`block text-[0.8125rem] leading-snug ${value === 'To be confirmed' ? 'text-cream/40' : 'text-cream'}`}>{value}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Larger view - portalled to <body> so the page's own buttons cannot overlap it */}
      {zoom &&
        createPortal(
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 pt-20 backdrop-blur-sm sm:p-10 sm:pt-24" onClick={() => setZoom(false)}>
            <button
              type="button"
              onClick={() => setZoom(false)}
              aria-label="Close"
              className="absolute right-5 top-5 z-10 flex items-center gap-3 rounded-full border border-white/30 bg-black/60 py-2 pl-5 pr-2 text-[0.6875rem] font-medium uppercase tracking-[0.2rem] text-[#f3ecd9] backdrop-blur-md transition-colors hover:border-gold sm:right-8 sm:top-8"
            >
              Close
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-[#1d1816]">
                <Ico size={16}><path d="M6 6l12 12M18 6L6 18" /></Ico>
              </span>
            </button>
            <div className="relative h-full w-full max-w-[80rem] overflow-hidden rounded-2xl bg-[#faf6ee]" onClick={(e) => e.stopPropagation()}>
              {iso ? (
                <img src={unit.iso} alt={`${unit.label} isometric view`} className="h-full w-full object-contain" draggable={false} />
              ) : (
                <Plan2D src={unit.plan2d} label={unit.label} />
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}

export default UnitPanel
