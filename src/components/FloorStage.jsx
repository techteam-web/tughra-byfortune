import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from 'gsap'

import { UNITS } from './floorUnits.js'

const TBC = 'To be confirmed'
const Ico = ({ children, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)

function Plan2D({ src, label }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-6 text-center">
        <span className="text-[#b58a3a]"><Ico size={32}><rect x="3" y="3" width="18" height="18" rx="1" /><path d="M3 9h18M9 21V9M14 9v6h7" /></Ico></span>
        <h4 className="font-serif text-xl text-[#241f1a]">{label} Floor Plan</h4>
        <p className="text-[0.625rem] uppercase tracking-[0.15rem] text-[#8a7a5c]">Rendered plan to be added</p>
      </div>
    )
  }
  return <img src={src} alt={`${label} floor plan`} onError={() => setFailed(true)} className="h-full w-full object-contain" draggable={false} />
}

const floorTitle = (f) => (f.num === 'G' ? 'Ground Floor' : f.num === 'T' ? 'Terrace' : `Floor ${parseInt(f.num, 10)}`)
const pad = (n) => String(n).padStart(2, '0')

// Centre column (title, unit tabs, plan, specs) and right column (floor thumbnails).
// Keyed by floor in the parent, so the entrance plays on every floor change.
function FloorStage({ floor, floors, onSelect, unitId, setUnitId }) {
  const [iso, setIso] = useState(false)
  const [zoom, setZoom] = useState(false)
  const rootRef = useRef(null)
  const unit = UNITS.find((u) => u.id === unitId)
  const idx = floors.findIndex((f) => f.id === floor.id)

  // four floors starting at the selected one, wrapping round
  const thumbs = Array.from({ length: Math.min(4, floors.length) }, (_, i) => floors[(idx + i) % floors.length])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo('.fs-plan', { clipPath: 'inset(0 100% 0 0 round 16px)' }, { clipPath: 'inset(0 0% 0 0 round 16px)', duration: 1, ease: 'power3.inOut' }, 0)
      tl.fromTo('.fs-plan > *', { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 1 }, 0.35)
      tl.fromTo('.fs-line', { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.08, ease: 'power4.out' }, 0.2)
      tl.fromTo('.fs-rise', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.07 }, 0.45)
      tl.fromTo('.fs-thumb', { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.7, stagger: 0.09 }, 0.5)
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
    [<path key="a" d="M4 4h7v4H8v12H4zM13 4h7v16h-7z" />, unit.carpetArea ?? TBC, 'Carpet area', unit.carpetArea == null],
    [<path key="b" d="M4 12V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M3 12h18v5H3zM5 17v2M19 17v2" />, `${unit.bedrooms} Bedrooms`, 'With ensuites', false],
    [<path key="c" d="M2 16c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0M2 11c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0" />, 'City + Sea View', 'Panoramic views', false],
    [<path key="d" d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5" />, 'Spacious Living', 'And dining', false],
  ]

  return (
    <div ref={rootRef} className="contents">
      {/* ---------- Centre ---------- */}
      <div className="flex min-h-0 min-w-0 flex-col gap-4 lg:overflow-hidden">
        <div className="text-center">
          <div className="overflow-hidden pb-1">
            <h1 className="fs-line font-serif text-[clamp(1.625rem,2.4vw,2.25rem)] font-medium uppercase tracking-[0.12rem]" style={{ color: '#470d21' }}>Floor Plans</h1>
          </div>
          <p className="fs-rise mt-1 text-[0.625rem] uppercase tracking-[0.3rem] text-[#6b5a3a]">Designed for modern living</p>
        </div>

        <div className="fs-rise mx-auto flex w-full max-w-md items-center gap-1 rounded-full border border-white/70 bg-white/75 p-1 shadow-[0_0.5rem_1.5rem_rgba(120,70,40,0.1)]">
          {UNITS.map((u) => {
            const on = u.id === unitId
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => setUnitId(u.id)}
                aria-pressed={on}
                className="flex-1 rounded-full border-none px-3 py-2 text-[0.6875rem] font-medium uppercase tracking-[0.15rem] transition-all duration-500"
                style={{ background: on ? '#470d21' : 'transparent', color: on ? '#f3ecd9' : '#4a3f30' }}
              >
                {u.label}
              </button>
            )
          })}
        </div>

        <div className="fs-plan relative min-h-[16rem] flex-1 overflow-hidden rounded-[1.5rem] bg-[#fffaf4]/70 lg:min-h-[9rem] ring-1 ring-white/80 shadow-[0_1rem_2.5rem_rgba(120,70,40,0.12)] backdrop-blur-sm">
          <div className="h-full w-full">
            {iso ? <img src={unit.iso} alt={`${unit.label} isometric view`} className="h-full w-full object-contain" draggable={false} /> : <Plan2D key={unit.id} src={unit.plan2d} label={unit.label} />}
          </div>
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-[#8a4a52]/85 px-3.5 py-1.5 text-[0.5rem] uppercase tracking-[0.2rem] text-[#fbe9d8] backdrop-blur-md">
            {floorTitle(floor)} · {iso ? 'Isometric' : 'Floor plan'}
          </span>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div className="fs-rise">
            <h2 className="font-serif text-[1.625rem] font-medium leading-none text-[#470d21]">{unit.label}</h2>
            <p className="mt-1.5 text-[0.5625rem] uppercase tracking-[0.25rem] text-[#6b5a3a]">Signature residence</p>
          </div>

          <ul className="grid min-w-0 basis-full grid-cols-2 gap-x-4 gap-y-2.5 sm:min-w-[18rem] sm:max-w-md sm:flex-1 sm:basis-auto">
            {specs.map(([icon, main, sub, muted], i) => (
              <li key={i} className="fs-rise flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#b58a3a]/12 text-[#9a6f25]"><Ico size={16}>{icon}</Ico></span>
                <span className="min-w-0 leading-tight">
                  <span className={`block text-[0.8125rem] font-medium ${muted ? 'text-[#241f1a]/40' : 'text-[#241f1a]'}`}>{main}</span>
                  <span className="block text-[0.625rem] text-[#6b5a3a]">{sub}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="fs-rise flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIso((v) => !v)}
              className="lux-btn flex items-center gap-3 rounded-full px-6 py-3.5 text-[0.625rem] font-medium uppercase tracking-[0.2rem] shadow-[0_0.5rem_1.25rem_rgba(71,13,33,0.28)]" style={{ background: '#470d21' }}
            >
              {iso ? 'View floor plan' : 'View isometric'}
              <svg width="14" height="10" viewBox="0 0 16 12" fill="none"><path d="M1 6h13M9 1l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button
              type="button"
              onClick={() => setZoom(true)}
              aria-label="View larger"
              title="View larger"
              className="lux-btn lux-light flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
            >
              <Ico size={16}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></Ico>
            </button>
          </div>
        </div>
      </div>

      {/* ---------- Right: floor thumbnails ---------- */}
      <div className="flex min-h-0 min-w-0 flex-col gap-3 md:col-start-2 lg:col-start-auto lg:overflow-hidden">
        <div className="fs-rise flex items-baseline justify-between text-[0.625rem] uppercase tracking-[0.25rem] text-[#6b5a3a]">
          <span>{floorTitle(floor)}</span>
          <span className="text-sm tracking-[0.15rem] text-[#470d21]/60">{pad(idx + 1)} / {pad(floors.length)}</span>
        </div>
        <div className="grid min-h-0 grid-cols-4 gap-3 lg:flex-1 lg:grid-cols-1 lg:grid-rows-[repeat(4,minmax(0,1fr))]">
          {thumbs.map((f, i) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onSelect(f.id)}
              aria-label={floorTitle(f)}
              aria-pressed={i === 0}
              className="fs-thumb group relative aspect-square min-h-0 overflow-hidden lg:aspect-auto rounded-xl border-none bg-white/60 p-0 ring-1 transition-all duration-500 hover:-translate-y-0.5"
              style={{ ['--tw-ring-color']: i === 0 ? '#b58a3a' : 'rgba(181,138,58,0.25)', boxShadow: i === 0 ? '0 0.5rem 1.25rem rgba(120,90,40,0.2)' : undefined }}
            >
              <img src={unit.iso} alt="" loading="lazy" className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" draggable={false} />
              <span className="absolute inset-x-0 bottom-0 bg-[#470d21]/80 px-2.5 py-1.5 text-left text-[0.5625rem] uppercase tracking-[0.18rem] text-[#f3ecd9]">
                {f.num === 'G' || f.num === 'T' ? floorTitle(f) : `Floor ${parseInt(f.num, 10)}`}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Larger view - portalled to <body> so nothing on the page can overlap it */}
      {zoom &&
        createPortal(
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 pt-20 backdrop-blur-sm sm:p-10 sm:pt-24" onClick={() => setZoom(false)}>
            <button
              type="button"
              onClick={() => setZoom(false)}
              aria-label="Close"
              className="absolute right-5 top-5 z-10 flex items-center gap-3 rounded-full border border-white/30 bg-black/60 py-2 pl-5 pr-2 text-[0.6875rem] font-medium uppercase tracking-[0.2rem] text-[#f3ecd9] backdrop-blur-md transition-colors hover:border-[#d67d3e] sm:right-8 sm:top-8"
            >
              Close
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d67d3e] text-[#470d21]">
                <Ico size={16}><path d="M6 6l12 12M18 6L6 18" /></Ico>
              </span>
            </button>
            <div className="relative h-full w-full max-w-[80rem] overflow-hidden rounded-2xl bg-[#faf6ee]" onClick={(e) => e.stopPropagation()}>
              {iso ? <img src={unit.iso} alt={`${unit.label} isometric view`} className="h-full w-full object-contain" draggable={false} /> : <Plan2D src={unit.plan2d} label={unit.label} />}
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}

export default FloorStage
