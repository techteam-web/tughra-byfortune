import { useEffect, useRef, useState } from 'react'
import { gsap, EASE, REDUCED } from '../motion/index.js'

const PX_PER_FRAME = 14 // hand travel for one frame
const WHEEL_PER_FRAME = 40 // wheel travel for one frame
const FOLLOW = 0.42 // how closely the view tracks the hand: high enough to feel attached,
// low enough to iron out the jitter between pointer events
const DECAY = 0.9 // how quickly a flick runs down

// The isometric as a turntable: drag (or scroll) to sweep the residence through its frames.
//
// Built for smoothness, which mostly means doing less per frame:
// - One sharp frame is shown at a time. Sixty frames is dense enough that stepping
//   through them reads as continuous motion, the way scrubbing a video does; blending
//   two at once only ghosted them and doubled the drawing.
// - A frame is only drawn when it actually changes. Most animation frames draw nothing.
// - The canvas is never given more pixels than the frames themselves have. On a scaled
//   screen it would otherwise be drawing up to four times as many, every frame, for no
//   extra detail.
// - It paints to one opaque canvas, which is never cleared - a frame that has not arrived
//   yet is simply not drawn and the last picture stays, so nothing ever flashes through.
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
  const shown = useRef(null) // the image currently on the canvas, so it is never redrawn needlessly
  const run = useRef({ pos: 0, target: 0, vel: 0, dragging: false, raf: 0, live: false })

  const n = frames.length
  const last = n - 1

  const loaded = (img) => img && img.complete && img.naturalWidth > 0

  // If the frame wanted has not arrived, the nearest one that has stands in for it.
  const nearest = (i) => {
    for (let d = 0; d <= last; d++) {
      if (loaded(imgs.current[i - d])) return imgs.current[i - d]
      if (loaded(imgs.current[i + d])) return imgs.current[i + d]
    }
    return null
  }

  const draw = (img) => {
    const ctx = ctxRef.current
    if (!ctx) return
    const cw = ctx.canvas.width
    const ch = ctx.canvas.height
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
    const w = img.naturalWidth * scale
    const h = img.naturalHeight * scale
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h)
    shown.current = img
  }

  const paint = (force = false) => {
    const i = Math.round(gsap.utils.clamp(0, last, run.current.pos))
    const img = nearest(i)
    if (!img) return
    if (!force && img === shown.current) return
    draw(img)
  }

  // Size the canvas to the screen, but never past the frames' own resolution: beyond
  // that it would only be stretching the same pixels, at a real cost on every draw.
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
    const cover = Math.max(bw / iw, bh / ih) // CSS px per frame px
    const density = Math.min(window.devicePixelRatio || 1, 1 / cover)
    const w = Math.max(1, Math.round(bw * density))
    const h = Math.max(1, Math.round(bh * density))
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
      shown.current = null
    }
    paint(true)
  }

  // One context, made once, opaque: an opaque canvas is cheaper for the browser to
  // composite, since nothing behind it ever needs blending in.
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
        } else paint()
      }
      img.src = src
      return img
    })
    // Decode every frame ahead of time, off the main thread, and draw each once - then put
    // the right one straight back, in the same task, so only it reaches the screen. The
    // first draw of a frame is the expensive one; this keeps it out of the sweep.
    ;(async () => {
      for (const img of imgs.current) {
        if (!live) return
        try {
          await img.decode()
        } catch {
          continue // a frame that fails is skipped; nearest() stands in for it
        }
        if (!live || !loaded(img) || !ctxRef.current) continue
        draw(img)
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
      shown.current = null
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

  const tick = () => {
    const s = run.current
    if (!s.dragging) {
      s.target = gsap.utils.clamp(0, last, s.target + s.vel)
      s.vel *= DECAY
      if (Math.abs(s.vel) < 0.02 || s.target === 0 || s.target === last) s.vel = 0
    }
    s.pos += (s.target - s.pos) * FOLLOW
    paint()
    if (!s.dragging && s.vel === 0 && Math.abs(s.target - s.pos) < 0.01) {
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
    // frames per animation frame, for the glide on release - smoothed, so one jittery
    // event or a change of direction cannot fling it
    if (dt > 0) s.vel = s.vel * 0.5 + ((-(e.clientX - s.lastX) / PX_PER_FRAME / dt) * 16) * 0.5
    s.lastX = e.clientX
    s.lastT = e.timeStamp
    s.target = gsap.utils.clamp(0, last, s.grabFrom - (e.clientX - s.grabX) / PX_PER_FRAME)
    if (!spun) setSpun(true)
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
    const s = run.current
    s.vel = 0
    s.target = gsap.utils.clamp(0, last, s.target + e.deltaY / WHEEL_PER_FRAME)
    if (!spun) setSpun(true)
    kick()
  }

  // the hint fades away the first time it is swept
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
