import { useEffect, useRef, useState } from 'react'
import { gsap, EASE, REDUCED } from '../motion/index.js'

const PX_PER_FRAME = 18 // hand travel for one frame: the full sweep is about one screen wide
const WHEEL_PER_FRAME = 45 // wheel travel for one frame
const EASE_TO = 0.16 // how quickly the view catches the hand - lower is silkier
const DECAY = 0.93 // how quickly a flick runs down

// The isometric as a turntable: drag (or scroll) to sweep the residence through its frames.
//
// The frames are painted onto one canvas rather than stacked as <img> layers. That is what
// keeps it smooth and stops it flashing:
// - the canvas is never cleared, and the base frame is always drawn fully opaque over the
//   whole of it, so the page behind can never show through mid-blend;
// - a frame that has not arrived yet is simply not drawn - the last picture stays put,
//   where a stacked <img> would have gone blank for a moment;
// - one canvas is one layer for the browser to composite, not sixty.
//
// The two frames either side of the current position are blended - the next one drawn
// over the base at the fraction between them - so the sweep reads as continuous. The
// sweep is partial, not a full turn, so it holds at either end. Position runs in a rAF
// loop with easing; React never re-renders while it turns.
// Mount it with a key per residence: it starts fresh rather than resetting its own state.
function IsoTurntable({ frames, poster, alt, className = '' }) {
  const [ready, setReady] = useState(false)
  const [spun, setSpun] = useState(false)
  const boxRef = useRef(null)
  const canvasRef = useRef(null)
  const imgs = useRef([])
  const run = useRef({ pos: 0, target: 0, vel: 0, dragging: false, raf: 0, live: false })

  const n = frames.length
  const last = n - 1

  const loaded = (img) => img && img.complete && img.naturalWidth > 0

  // Fill the canvas the way object-cover would.
  const drawCover = (ctx, img, alpha) => {
    const cw = ctx.canvas.width
    const ch = ctx.canvas.height
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
    const w = img.naturalWidth * scale
    const h = img.naturalHeight * scale
    ctx.globalAlpha = alpha
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h)
  }

  // If the frame wanted has not arrived, fall back to the nearest one that has.
  const nearest = (i) => {
    for (let d = 0; d <= last; d++) {
      if (loaded(imgs.current[i - d])) return imgs.current[i - d]
      if (loaded(imgs.current[i + d])) return imgs.current[i + d]
    }
    return null
  }

  const paint = () => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const p = gsap.utils.clamp(0, last, run.current.pos)
    const i0 = Math.floor(p)
    const t = p - i0
    const base = nearest(i0)
    if (!base) return // nothing in yet: leave whatever is on the canvas
    drawCover(ctx, base, 1)
    const next = imgs.current[Math.min(i0 + 1, last)]
    if (t > 0.002 && next !== base && loaded(next)) drawCover(ctx, next, t)
    ctx.globalAlpha = 1
  }

  // Load every frame. The first one in hands over from the poster; each later one repaints,
  // in case it is the frame currently on show and a stand-in was drawn in its place.
  useEffect(() => {
    let live = true
    imgs.current = frames.map((src, i) => {
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => {
        if (!live) return
        if (i === 0) setReady(true)
        paint()
      }
      img.src = src
      return img
    })
    // Get every frame ready to draw before it is needed. The first time a frame is drawn it
    // has to be decoded and then uploaded to the graphics card, and doing that mid-sweep is
    // what caused the hitches. So, one after another: decode it off the main thread, then
    // draw it once and straight away repaint the frame actually on show. Both happen in the
    // same task, so only the right frame ever reaches the screen - but the upload is done.
    // The browser keeps these in its own cache, which it can trim, so nothing is pinned the
    // way held bitmaps would be.
    ;(async () => {
      for (const img of imgs.current) {
        if (!live) return
        try {
          await img.decode()
        } catch {
          continue // a frame that fails to decode is skipped; nearest() stands in for it
        }
        const ctx = canvasRef.current?.getContext('2d')
        if (!live || !ctx || !loaded(img)) continue
        drawCover(ctx, img, 1)
        paint()
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
    // paint reads only refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frames])

  // Keep the canvas sharp at the screen's own pixel density, and repaint on resize.
  useEffect(() => {
    const box = boxRef.current
    const canvas = canvasRef.current
    if (!box || !canvas) return
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(box.clientWidth * dpr)
      canvas.height = Math.round(box.clientHeight * dpr)
      paint()
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(box)
    return () => ro.disconnect()
    // paint reads only refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tick = () => {
    const s = run.current
    if (!s.dragging) {
      s.target = gsap.utils.clamp(0, last, s.target + s.vel)
      s.vel *= DECAY
      if (Math.abs(s.vel) < 0.001 || s.target === 0 || s.target === last) s.vel = 0
      // once it has run down, come to rest on a whole frame rather than between two
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
    // frames per animation frame, for the glide on release - smoothed so a single jittery
    // event (or a change of direction) cannot fling it
    if (dt > 0) s.vel = s.vel * 0.6 + ((-(e.clientX - s.lastX) / PX_PER_FRAME / dt) * 16) * 0.4
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
    if (REDUCED || e.timeStamp - s.lastT > 90) s.vel = 0
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
      {/* the still, until the first frame is in; the canvas paints over it from then on */}
      {poster && !ready && <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <span className="iso-hint pointer-events-none absolute inset-x-0 bottom-20 flex justify-center">
        <span className="rounded-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--cream)_92%,transparent)] px-4 py-1.5 font-sans text-[0.62rem] uppercase tracking-[0.2em] text-[var(--ink-soft)]">
          {ready ? 'Drag or scroll to turn' : 'Loading the turntable'}
        </span>
      </span>
    </div>
  )
}

export default IsoTurntable
