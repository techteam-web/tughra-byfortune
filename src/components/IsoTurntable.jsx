import { useEffect, useRef, useState } from 'react'
import { gsap, EASE, REDUCED } from '../motion/index.js'

const PX_PER_FRAME = 14 // hand travel for one frame
const WHEEL_PER_FRAME = 40 // wheel travel for one frame
const FOLLOW = 0.42 // how closely the view tracks the hand
const DECAY = 0.9 // how quickly a flick runs down
const AUTO_PASS = 7000 // ms for the automatic turn to cross the sweep once
const AUTO_RESUME = 2500 // ms of stillness before the automatic turn picks up again

// The isometric as a turntable. It turns by itself, swinging slowly from one end of the
// sweep to the other and easing round at each end; drag or scroll and it is yours, and a
// moment after you let go it carries on from wherever you left it.
//
// Smoothness, which mostly means doing less per frame:
// - The position is fractional, and the two frames either side of it are blended so the
//   turn is continuous rather than stepped. The base frame is always drawn solid and only
//   the next one is laid over it at the fraction between them, so the page behind can
//   never show through - an earlier version faded both, which is what flashed.
// - The canvas is never given more pixels than the frames themselves have: on a scaled
//   screen it would otherwise draw up to four times as many, every frame, for no detail.
// - It is opaque, cheaper for the browser to composite, and only redrawn when the
//   position has actually moved.
// - A frame not yet arrived is not drawn: the last picture stays put.
// - Position runs in a rAF loop; React never re-renders while it turns.
//
// Mount it with a key per residence: it starts fresh rather than resetting its own state.
function IsoTurntable({ frames, poster, alt, className = '' }) {
  const [ready, setReady] = useState(false)
  const [touched, setTouched] = useState(false)
  const boxRef = useRef(null)
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  const imgs = useRef([])
  const resume = useRef(0)
  const run = useRef({ pos: 0, target: 0, vel: 0, dragging: false, raf: 0, live: false, auto: !REDUCED, phase: 0, dir: 1, painted: -1, at: 0 })

  const n = frames.length
  const last = n - 1

  const loaded = (img) => img && img.complete && img.naturalWidth > 0

  // If a frame wanted has not arrived, the nearest one that has stands in for it.
  const nearest = (i) => {
    for (let d = 0; d <= last; d++) {
      if (loaded(imgs.current[i - d])) return imgs.current[i - d]
      if (loaded(imgs.current[i + d])) return imgs.current[i + d]
    }
    return null
  }

  const draw = (img, alpha) => {
    const ctx = ctxRef.current
    if (!ctx) return
    const cw = ctx.canvas.width
    const ch = ctx.canvas.height
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
    const w = img.naturalWidth * scale
    const h = img.naturalHeight * scale
    ctx.globalAlpha = alpha
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h)
    ctx.globalAlpha = 1
  }

  const paint = (force = false) => {
    const s = run.current
    const p = gsap.utils.clamp(0, last, s.pos)
    if (!force && Math.abs(p - s.painted) < 0.002) return
    const i0 = Math.floor(p)
    const t = p - i0
    const base = nearest(i0)
    if (!base) return
    draw(base, 1)
    const next = imgs.current[Math.min(i0 + 1, last)]
    if (t > 0.002 && next !== base && loaded(next)) draw(next, t)
    s.painted = p
  }

  // Size the canvas to the screen, but never past the frames' own resolution.
  const fit = () => {
    const box = boxRef.current
    const canvas = canvasRef.current
    if (!box || !canvas) return
    const bw = box.clientWidth
    const bh = box.clientHeight
    if (!bw || !bh) return
    const ref = imgs.current.find(loaded)
    const iw = ref?.naturalWidth || 1764
    const ih = ref?.naturalHeight || 1172
    const density = Math.min(window.devicePixelRatio || 1, 1 / Math.max(bw / iw, bh / ih))
    const w = Math.max(1, Math.round(bw * density))
    const h = Math.max(1, Math.round(bh * density))
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
    paint(true)
  }

  const tick = (now) => {
    const s = run.current
    const dt = Math.min(now - (s.at || now), 64)
    s.at = now
    if (s.auto) {
      // a slow swing: cosine-eased so it slows into each end and turns round there
      s.phase += (dt * Math.PI) / AUTO_PASS
      s.pos = s.target = last * (0.5 - 0.5 * Math.cos(s.phase))
      paint()
      s.raf = requestAnimationFrame(tick)
      return
    }
    if (!s.dragging) {
      s.target = gsap.utils.clamp(0, last, s.target + s.vel)
      s.vel *= DECAY
      if (Math.abs(s.vel) < 0.02 || s.target === 0 || s.target === last) s.vel = 0
      if (s.vel === 0) s.target = Math.round(s.target) // rest on a whole frame
    }
    const before = s.pos
    s.pos += (s.target - s.pos) * FOLLOW
    if (s.pos !== before) s.dir = s.pos > before ? 1 : -1
    paint()
    if (!s.dragging && s.vel === 0 && Math.abs(s.target - s.pos) < 0.01) {
      s.pos = s.target
      paint()
      s.live = false
      scheduleResume()
      return
    }
    s.raf = requestAnimationFrame(tick)
  }

  const kick = () => {
    const s = run.current
    if (s.live) return
    s.live = true
    s.at = 0
    s.raf = requestAnimationFrame(tick)
  }

  // Hand the turn back to the automatic swing, picking up exactly where it was left and
  // carrying on the way it was last going, so there is no jump.
  const scheduleResume = () => {
    clearTimeout(resume.current)
    if (REDUCED) return
    resume.current = setTimeout(() => {
      const s = run.current
      if (s.dragging) return
      const a = Math.acos(gsap.utils.clamp(-1, 1, 1 - (2 * s.pos) / last))
      s.phase = s.dir >= 0 ? a : 2 * Math.PI - a
      s.auto = true
      kick()
    }, AUTO_RESUME)
  }

  // Any hand on it stops the automatic turn.
  const takeOver = () => {
    const s = run.current
    clearTimeout(resume.current)
    s.auto = false
    s.target = s.pos
  }

  // One opaque context, made once.
  useEffect(() => {
    ctxRef.current = canvasRef.current?.getContext('2d', { alpha: false, desynchronized: true }) ?? null
  }, [])

  // Load every frame. The first one in hands over from the poster and starts the turn;
  // each later one repaints, in case it is the frame on show and a stand-in was drawn.
  useEffect(() => {
    let live = true
    imgs.current = frames.map((src, i) => {
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => {
        if (!live) return
        if (i === 0) {
          fit()
          setReady(true)
          if (run.current.auto) kick()
        } else paint(true)
      }
      img.src = src
      return img
    })
    // Decode every frame ahead of time, off the main thread, and draw each once - then put
    // the right picture straight back, in the same task, so only it reaches the screen.
    // The first draw of a frame is the expensive one; this keeps it out of the turn.
    ;(async () => {
      for (const img of imgs.current) {
        if (!live) return
        try {
          await img.decode()
        } catch {
          continue // a frame that fails is skipped; nearest() stands in for it
        }
        if (!live || !loaded(img) || !ctxRef.current) continue
        draw(img, 1)
        paint(true)
      }
    })()
    return () => {
      live = false
      imgs.current.forEach((img) => {
        img.onload = null
        img.src = ''
      })
      imgs.current = []
    }
    // draw/paint/fit/kick read only refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frames])

  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    const ro = new ResizeObserver(() => fit())
    ro.observe(box)
    return () => ro.disconnect()
    // fit reads only refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const s = run.current
    return () => {
      cancelAnimationFrame(s.raf)
      clearTimeout(resume.current)
    }
  }, [])

  const onPointerDown = (e) => {
    if (!ready) return
    takeOver()
    const s = run.current
    s.dragging = true
    s.vel = 0
    s.grabX = e.clientX
    s.grabFrom = s.target
    s.lastX = e.clientX
    s.lastT = e.timeStamp
    e.currentTarget.setPointerCapture(e.pointerId)
    if (!touched) setTouched(true)
    kick()
  }

  const onPointerMove = (e) => {
    const s = run.current
    if (!s.dragging) return
    const dt = e.timeStamp - s.lastT
    // frames per animation frame, for the glide on release - smoothed, so one jittery
    // event or a change of direction cannot fling it
    if (dt > 0) s.vel = s.vel * 0.5 + ((-(e.clientX - s.lastX) / PX_PER_FRAME / dt) * 16) * 0.5
    s.lastX = e.clientX
    s.lastT = e.timeStamp
    s.target = gsap.utils.clamp(0, last, s.grabFrom - (e.clientX - s.grabX) / PX_PER_FRAME)
    kick()
  }

  const onPointerUp = (e) => {
    const s = run.current
    if (!s.dragging) return
    s.dragging = false
    // a pause before letting go means a placed stop, not a flick
    if (REDUCED || e.timeStamp - s.lastT > 80) s.vel = 0
    kick()
  }

  const onWheel = (e) => {
    if (!ready) return
    takeOver()
    const s = run.current
    s.vel = 0
    s.target = gsap.utils.clamp(0, last, s.target + e.deltaY / WHEEL_PER_FRAME)
    if (!touched) setTouched(true)
    kick()
  }

  // the hint fades away the first time it is taken in hand
  useEffect(() => {
    if (!touched || REDUCED) return
    gsap.to('.iso-hint', { autoAlpha: 0, duration: 0.4, ease: EASE.soft, overwrite: 'auto' })
  }, [touched])

  return (
    <div
      ref={boxRef}
      // the wrapper is the positioning context, so callers pass sizing here (h-full, ...)
      // and never a position utility
      className={`relative touch-none select-none overflow-hidden ${ready ? 'cursor-grab active:cursor-grabbing' : ''} ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
      role="img"
      aria-label={`${alt} - turning; drag or scroll to turn it yourself`}
    >
      {/* the still, until the first frame is in */}
      {poster && !ready && <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />}
      {/* opaque, so it stays hidden until the first frame is on it rather than showing black */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ visibility: ready ? 'visible' : 'hidden' }} />

      <span className="iso-hint pointer-events-none absolute inset-x-0 bottom-20 flex justify-center">
        <span className="rounded-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--cream)_92%,transparent)] px-4 py-1.5 font-sans text-[0.62rem] uppercase tracking-[0.2em] text-[var(--ink-soft)]">
          {ready ? 'Drag or scroll to turn' : 'Loading the turntable'}
        </span>
      </span>
    </div>
  )
}

export default IsoTurntable
