import { useEffect, useRef, useState } from 'react'
import { gsap, EASE, REDUCED } from '../motion/index.js'

const PX_PER_FRAME = 14 // hand travel for one frame
const WHEEL_PER_FRAME = 40 // wheel travel for one frame
const FOLLOW_MS = 55 // time constant for the view catching the hand - feels attached, irons out jitter
const GLIDE_MS = 420 // time constant for a flick running down
const SETTLE_MS = 140 // time constant for coming to rest on a whole frame
const VEL_WINDOW = 90 // ms of recent movement a flick's speed is measured over

// The isometric as a turntable: drag (or scroll) to sweep the residence through its frames.
//
// As smooth as sixty frames allow:
// - The position is fractional, and the frame either side of it are blended, so the turn is
//   continuous rather than stepping from picture to picture. The base frame is always drawn
//   solid and only the next one is laid over it at the fraction between them, so the page
//   behind can never show through. At rest it settles onto a single, crisp frame.
// - All easing is by elapsed time, not per animation frame, so it moves the same on a
//   60Hz, 120Hz or 144Hz screen.
// - The hand is read at full resolution: the in-between positions the browser coalesces
//   into one event are all used, so a fast mouse is not sampled coarsely.
// - A flick's speed is taken over the last stretch of movement, not one event, so a single
//   jittery reading or a change of direction cannot fling it; the glide fades out smoothly.
// - The canvas is opaque, never given more pixels than the frames have, and only redrawn
//   when the position has moved. A frame not yet arrived is not drawn - the last picture
//   stays put.
// - Position runs in a rAF loop; React never re-renders while it turns.
//
// The frames are a partial sweep, not a full turn, so it holds at either end.
// Mount it with a key per residence: it starts fresh rather than resetting its own state.
function IsoTurntable({ frames, poster, alt, className = '' }) {
  const [ready, setReady] = useState(false)
  const [spun, setSpun] = useState(false)
  const boxRef = useRef(null)
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  const imgs = useRef([])
  const run = useRef({ pos: 0, target: 0, vel: 0, dragging: false, raf: 0, live: false, painted: -1, at: 0, trail: [] })

  const n = frames.length
  const last = n - 1
  const clampPos = (v) => gsap.utils.clamp(0, last, v)

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
    const p = clampPos(s.pos)
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

  // ease `from` towards `to` by elapsed time: the same feel at any refresh rate
  const approach = (from, to, dt, tau) => to + (from - to) * Math.exp(-dt / tau)

  const tick = (now) => {
    const s = run.current
    const dt = Math.min(now - (s.at || now - 16), 64)
    s.at = now
    if (!s.dragging) {
      if (s.vel) {
        // the flick carries on, fading out smoothly
        s.target = clampPos(s.target + s.vel * dt)
        s.vel = approach(s.vel, 0, dt, GLIDE_MS)
        if (Math.abs(s.vel) < 0.0004 || s.target === 0 || s.target === last) s.vel = 0
      } else {
        // run down: settle onto the nearest whole frame, so it rests crisp
        s.target = approach(s.target, Math.round(s.target), dt, SETTLE_MS)
      }
    }
    s.pos = approach(s.pos, s.target, dt, FOLLOW_MS)
    paint()
    const resting = !s.dragging && s.vel === 0 && Math.abs(s.target - Math.round(s.target)) < 0.002 && Math.abs(s.pos - s.target) < 0.002
    if (resting) {
      s.pos = s.target = Math.round(s.target)
      paint(true)
      s.live = false
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

  // One opaque context, made once.
  useEffect(() => {
    ctxRef.current = canvasRef.current?.getContext('2d', { alpha: false, desynchronized: true }) ?? null
  }, [])

  // Load every frame. The first one in hands over from the poster; each later one repaints,
  // in case it is the frame on show and a stand-in was drawn in its place.
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
    // draw/paint/fit read only refs
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
    return () => cancelAnimationFrame(s.raf)
  }, [])

  const onPointerDown = (e) => {
    if (!ready) return
    const s = run.current
    s.dragging = true
    s.vel = 0
    s.grabX = e.clientX
    s.grabFrom = s.target
    s.trail = [{ x: e.clientX, t: e.timeStamp }]
    e.currentTarget.setPointerCapture(e.pointerId)
    kick()
  }

  const onPointerMove = (e) => {
    const s = run.current
    if (!s.dragging) return
    // every position the browser saw, not just the one it reported
    const pts = e.nativeEvent.getCoalescedEvents?.() ?? []
    for (const p of pts.length ? pts : [e.nativeEvent]) s.trail.push({ x: p.clientX, t: p.timeStamp })
    const cutoff = e.timeStamp - VEL_WINDOW
    while (s.trail.length > 2 && s.trail[0].t < cutoff) s.trail.shift()
    s.target = clampPos(s.grabFrom - (e.clientX - s.grabX) / PX_PER_FRAME)
    if (!spun) setSpun(true)
    kick()
  }

  const onPointerUp = (e) => {
    const s = run.current
    if (!s.dragging) return
    s.dragging = false
    // the flick's speed over the last stretch of movement, in frames per ms; a pause
    // before letting go means a placed stop, not a flick
    const a = s.trail[0]
    const b = s.trail[s.trail.length - 1]
    const span = b && a ? b.t - a.t : 0
    const still = e.timeStamp - (b?.t ?? 0) > 70
    s.vel = REDUCED || still || span < 8 ? 0 : -(b.x - a.x) / PX_PER_FRAME / span
    s.trail = []
    kick()
  }

  const onWheel = (e) => {
    if (!ready) return
    const s = run.current
    s.vel = 0
    s.target = clampPos(s.target + e.deltaY / WHEEL_PER_FRAME)
    if (!spun) setSpun(true)
    kick()
  }

  // the hint fades away the first time it is turned
  useEffect(() => {
    if (!spun || REDUCED) return
    gsap.to('.iso-hint', { autoAlpha: 0, duration: 0.4, ease: EASE.soft, overwrite: 'auto' })
  }, [spun])

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
      aria-label={`${alt} - drag or scroll to turn`}
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
