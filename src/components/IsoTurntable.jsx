import { useEffect, useRef, useState } from 'react'
import { gsap, EASE, REDUCED } from '../motion/index.js'

// How far the hand travels to advance one frame, and how far a flick carries on turning.
const PX_PER_FRAME = 26
const GLIDE = 0.9

// The isometric as a turntable: drag sideways to spin the residence through its frames.
// Every frame is stacked and only the current one is shown, so a spin never waits on a
// fetch. The still `poster` holds the view until the first frame is in. Mount it with a
// key per residence - it starts fresh rather than resetting its own state.
function IsoTurntable({ frames, poster, alt, className = '' }) {
  const [frame, setFrame] = useState(0)
  const [ready, setReady] = useState(false)
  const [spun, setSpun] = useState(false) // the hint goes once it has been turned
  const boxRef = useRef(null)
  const drag = useRef(null)
  const pos = useRef(0) // the turn, carried as a fraction so a slow drag still moves it
  const glide = useRef(null)

  const n = frames.length
  const show = (p) => {
    pos.current = p
    setFrame((((Math.round(p) % n) + n) % n))
  }

  // Pull the frames in: the first one decides when the turntable can take over from the
  // poster, the rest keep arriving behind it.
  useEffect(() => {
    let live = true
    const imgs = frames.map((src) => {
      const img = new Image()
      img.src = src
      return img
    })
    const first = imgs[0]
    if (!first) return
    const done = () => live && setReady(true)
    if (first.complete) done()
    else first.addEventListener('load', done, { once: true })
    return () => {
      live = false
      first.removeEventListener('load', done)
    }
  }, [frames])

  useEffect(() => () => glide.current?.kill(), [])

  const onPointerDown = (e) => {
    if (!ready) return
    glide.current?.kill()
    drag.current = { id: e.pointerId, x: e.clientX, lastX: e.clientX, from: pos.current, at: e.timeStamp, vx: 0 }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const dt = e.timeStamp - d.at
    if (dt > 0) d.vx = (e.clientX - d.lastX) / dt // px per ms, for the glide on release
    d.lastX = e.clientX
    d.at = e.timeStamp
    show(d.from - (e.clientX - d.x) / PX_PER_FRAME)
    if (!spun) setSpun(true)
  }

  // Letting go hands the turn over to a glide that eases down, so a flick keeps spinning
  // instead of stopping dead under the finger.
  const onPointerUp = (e) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    drag.current = null
    const carry = (-d.vx * 1000 * GLIDE) / PX_PER_FRAME
    if (REDUCED || Math.abs(carry) < 0.6) return
    const spin = { p: pos.current }
    glide.current = gsap.to(spin, {
      p: pos.current + gsap.utils.clamp(-14, 14, carry),
      duration: 1.1,
      ease: 'power3.out',
      onUpdate: () => show(spin.p),
    })
  }

  // the hint fades away the first time it is turned
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
      role="img"
      aria-label={`${alt} - drag to turn`}
    >
      {/* the still, until the first frame is in */}
      {poster && !ready && <img src={poster} alt={alt} className="absolute inset-0 h-full w-full object-cover" draggable={false} />}
      {ready &&
        frames.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={i === frame ? alt : ''}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ visibility: i === frame ? 'visible' : 'hidden' }}
            draggable={false}
          />
        ))}

      <span className="iso-hint pointer-events-none absolute inset-x-0 bottom-20 flex justify-center">
        <span className="rounded-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--cream)_72%,transparent)] px-4 py-1.5 font-sans text-[0.62rem] uppercase tracking-[0.2em] text-[var(--ink-soft)] backdrop-blur-sm">
          {ready ? 'Drag to turn' : 'Loading the turntable'}
        </span>
      </span>
    </div>
  )
}

export default IsoTurntable
