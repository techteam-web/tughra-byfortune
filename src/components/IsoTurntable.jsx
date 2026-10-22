import { useEffect, useRef, useState } from 'react'
import { gsap, EASE, REDUCED } from '../motion/index.js'

// The isometric as a turntable: drag sideways to spin the residence through its frames.
// Every frame is stacked and only the current one is shown, so a spin never waits on a
// fetch. The still `poster` holds the view until enough frames are in. Mount it with a
// key per residence - it starts fresh rather than resetting its own state.
function IsoTurntable({ frames, poster, alt, className = '' }) {
  const [frame, setFrame] = useState(0)
  const [ready, setReady] = useState(false)
  const [spun, setSpun] = useState(false) // the hint goes once it has been turned
  const boxRef = useRef(null)
  const drag = useRef(null)

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

  // A drag across the full width turns the residence once round, so it tracks the hand
  // at any size. Pointer events cover mouse, pen and touch alike.
  const onPointerDown = (e) => {
    if (!ready) return
    const width = boxRef.current?.clientWidth || 1
    drag.current = { id: e.pointerId, x: e.clientX, frame, step: width / frames.length }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const moved = Math.round((e.clientX - d.x) / d.step)
    if (!moved) return
    const n = frames.length
    setFrame((((d.frame - moved) % n) + n) % n)
    if (!spun) setSpun(true)
  }

  const onPointerUp = (e) => {
    if (drag.current?.id === e.pointerId) drag.current = null
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
      className={`relative touch-none select-none ${ready ? 'cursor-ew-resize' : ''} ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="img"
      aria-label={`${alt} - drag to turn`}
    >
      {/* the still, until the first frame is in */}
      {poster && !ready && <img src={poster} alt={alt} className="absolute inset-0 h-full w-full object-contain" draggable={false} />}
      {ready &&
        frames.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={i === frame ? alt : ''}
            className="absolute inset-0 h-full w-full object-contain"
            style={{ visibility: i === frame ? 'visible' : 'hidden' }}
            draggable={false}
          />
        ))}

      <span className="iso-hint pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
        <span className="rounded-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--cream)_72%,transparent)] px-4 py-1.5 font-sans text-[0.62rem] uppercase tracking-[0.2em] text-[var(--ink-soft)] backdrop-blur-sm">
          {ready ? 'Drag to turn' : 'Loading the turntable'}
        </span>
      </span>
    </div>
  )
}

export default IsoTurntable
