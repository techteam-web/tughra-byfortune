import { useEffect, useRef, useState } from 'react'
import { gsap, EASE, REDUCED } from '../motion/index.js'

const PX_PER_FRAME = 16 // hand travel for one frame
const WHEEL_PER_FRAME = 90 // wheel travel for one frame
const EASE_TO = 0.22 // how quickly the view catches the hand
const DECAY = 0.93 // how quickly a flick runs down

// The isometric as a turntable: drag (or scroll) to sweep the residence through its
// frames. The frames are a partial sweep rather than a full turn, so it holds at either
// end instead of snapping back round. Every frame is stacked and the two either side of
// the current position are cross-faded, so the sweep reads as continuous rather than as
// fifteen separate pictures. Position is driven straight onto the DOM in a rAF loop - no
// React render per pointer move, which is what made it stutter.
// Mount it with a key per residence: it starts fresh rather than resetting its own state.
function IsoTurntable({ frames, poster, alt, className = '' }) {
  const [ready, setReady] = useState(false)
  const [spun, setSpun] = useState(false)
  const boxRef = useRef(null)
  const imgs = useRef([])
  const run = useRef({ pos: 0, target: 0, vel: 0, dragging: false, raf: 0, live: false })

  const n = frames.length
  const last = n - 1

  // Decode every frame before handing over from the poster, so the first sweep does not
  // stall while the browser catches up.
  useEffect(() => {
    let live = true
    Promise.all(
      frames.map((src) => {
        const img = new Image()
        img.src = src
        return img.decode?.().catch(() => {}) ?? Promise.resolve()
      }),
    ).then(() => live && setReady(true))
    return () => {
      live = false
    }
  }, [frames])

  // Paint: the two frames around the current position, cross-faded by the fraction between.
  const paint = () => {
    const p = gsap.utils.clamp(0, last, run.current.pos)
    const i0 = Math.floor(p)
    const i1 = Math.min(i0 + 1, last)
    const t = p - i0
    for (let i = 0; i < imgs.current.length; i++) {
      const el = imgs.current[i]
      if (!el) continue
      const o = i === i0 ? 1 - t : i === i1 ? t : 0
      if (el.dataset.o !== String(o)) {
        el.style.opacity = o
        el.dataset.o = String(o)
      }
    }
  }

  const tick = () => {
    const s = run.current
    if (!s.dragging) {
      s.target = gsap.utils.clamp(0, last, s.target + s.vel)
      s.vel *= DECAY
      if (Math.abs(s.vel) < 0.001 || s.target === 0 || s.target === last) s.vel = 0
      // once it has run down, come to rest on a whole frame rather than resting
      // half-way between two, which would leave both ghosted over each other
      if (s.vel === 0) s.target = Math.round(s.target)
    }
    s.pos += (s.target - s.pos) * EASE_TO
    paint()
    if (!s.dragging && s.vel === 0 && Math.abs(s.target - s.pos) < 0.0015) {
      s.pos = s.target
      paint()
      s.live = false
      return
    }
    s.raf = requestAnimationFrame(tick)
  }

  const kick = () => {
    const s = run.current
    if (s.live) return
    s.live = true
    s.raf = requestAnimationFrame(tick)
  }

  useEffect(() => {
    const s = run.current
    return () => cancelAnimationFrame(s.raf)
  }, [])

  const onPointerDown = (e) => {
    if (!ready) return
    const s = run.current
    s.dragging = true
    s.vel = 0
    s.grabX = e.clientX
    s.grabFrom = s.target
    s.lastX = e.clientX
    s.lastT = e.timeStamp
    e.currentTarget.setPointerCapture(e.pointerId)
    kick()
  }

  const onPointerMove = (e) => {
    const s = run.current
    if (!s.dragging) return
    const dt = e.timeStamp - s.lastT
    if (dt > 0) s.vel = (-(e.clientX - s.lastX) / PX_PER_FRAME / dt) * 16 // frames per frame-of-video
    s.lastX = e.clientX
    s.lastT = e.timeStamp
    s.target = gsap.utils.clamp(0, last, s.grabFrom - (e.clientX - s.grabX) / PX_PER_FRAME)
    if (!spun) setSpun(true)
    kick()
  }

  const onPointerUp = () => {
    const s = run.current
    if (!s.dragging) return
    s.dragging = false
    if (REDUCED) s.vel = 0
    kick()
  }

  const onWheel = (e) => {
    if (!ready) return
    const s = run.current
    s.vel = 0
    s.target = gsap.utils.clamp(0, last, s.target + e.deltaY / WHEEL_PER_FRAME)
    if (!spun) setSpun(true)
    kick()
  }

  // the hint fades away the first time it is swept
  useEffect(() => {
    if (!spun || REDUCED) return
    gsap.to('.iso-hint', { autoAlpha: 0, duration: 0.5, ease: EASE.soft, overwrite: 'auto' })
  }, [spun])

  return (
    <div
      ref={boxRef}
      // the wrapper is the positioning context for the stacked frames, so callers pass
      // sizing here (h-full, aspect-...) and never a position utility
      className={`relative touch-none select-none overflow-hidden ${ready ? 'cursor-ew-resize' : ''} ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
      role="img"
      aria-label={`${alt} - drag or scroll to turn`}
    >
      {poster && !ready && <img src={poster} alt={alt} className="absolute inset-0 h-full w-full object-cover" draggable={false} />}
      {frames.map((src, i) => (
        <img
          key={src}
          ref={(el) => (imgs.current[i] = el)}
          src={src}
          alt={i === 0 ? alt : ''}
          className="absolute inset-0 h-full w-full object-cover will-change-[opacity]"
          style={{ opacity: ready && i === 0 ? 1 : 0 }}
          draggable={false}
        />
      ))}

      <span className="iso-hint pointer-events-none absolute inset-x-0 bottom-20 flex justify-center">
        <span className="rounded-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--cream)_72%,transparent)] px-4 py-1.5 font-sans text-[0.62rem] uppercase tracking-[0.2em] text-[var(--ink-soft)] backdrop-blur-sm">
          {ready ? 'Drag or scroll to turn' : 'Loading the turntable'}
        </span>
      </span>
    </div>
  )
}

export default IsoTurntable
