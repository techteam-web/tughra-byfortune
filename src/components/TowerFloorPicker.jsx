import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, EASE, REDUCED } from '../motion/index.js'
import IsoTurntable from './IsoTurntable.jsx'
import MAP from './towerFloorMaps.json'

const mapUrl = (f) => `/towerframes/floors/${String(f + 1).padStart(3, '0')}.png`
const CLICK_SLOP = 6 // px the hand may move and still count as a click, not a turn

// The tower orbit with its floors as switches. Each frame of the orbit has a floor map (made by
// tools/tower-floor-maps.mjs from the render's world position pass): every pixel of the tower
// holds the level it shows. When the tower comes to rest, the map for that frame tells what is
// under the pointer, and the floors are painted over the frame from the same map - so they fit
// the building exactly from every side, trees in front included. While it turns, they fade out.
//
// Floors read as faintly darkened bands with a fine pale line between them; the one under the
// pointer and the chosen one warm to bronze. Only the levels `pickable` accepts open anything;
// the rest still report themselves to `onHover`, so their name can be read out.
function TowerFloorPicker({ frames, range, floors, selected, hovered, pickable, onHover, onPick, alt, fill, className = '' }) {
  const boxRef = useRef(null)
  const overlayRef = useRef(null)
  const maps = useRef(new Map()) // frame -> level index per pixel
  const frameRef = useRef(0)
  const [frame, setFrame] = useState(null) // the frame at rest, null while turning
  const [mapTick, setMapTick] = useState(0)
  const [box, setBox] = useState({ w: 0, h: 0 })
  const press = useRef(null)
  const lastPt = useRef(null)
  const colors = useRef(null)

  // every frame's map, fetched once - they are small
  useEffect(() => {
    let live = true
    for (let f = 0; f < MAP.frames; f++) {
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => {
        if (!live) return
        const c = document.createElement('canvas')
        c.width = MAP.width
        c.height = MAP.height
        const ctx = c.getContext('2d', { willReadFrequently: true })
        ctx.drawImage(img, 0, 0)
        const d = ctx.getImageData(0, 0, MAP.width, MAP.height).data
        const ids = new Uint8Array(MAP.width * MAP.height)
        for (let i = 0; i < ids.length; i++) ids[i] = d[i * 4]
        maps.current.set(f, ids)
        if (f === frameRef.current) setMapTick((t) => t + 1)
      }
      img.src = mapUrl(f)
    }
    return () => {
      live = false
    }
  }, [])

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // the frames are drawn to cover the box, centred: the same scale and offset place the maps
  const scale = Math.max(box.w / MAP.frameWidth, box.h / MAP.frameHeight)
  const offX = (box.w - MAP.frameWidth * scale) / 2
  const offY = (box.h - MAP.frameHeight * scale) / 2

  const floorAt = (clientX, clientY) => {
    const ids = frame === null ? null : maps.current.get(frame)
    const el = boxRef.current
    if (!ids || !el || !scale) return null
    const r = el.getBoundingClientRect()
    const fx = (clientX - r.left - offX) / scale
    const fy = (clientY - r.top - offY) / scale
    const mx = Math.floor((fx - MAP.x) / MAP.step)
    const my = Math.floor((fy - MAP.y) / MAP.step)
    if (mx < 0 || my < 0 || mx >= MAP.width || my >= MAP.height) return null
    const id = ids[my * MAP.width + mx]
    return id ? floors[id - 1] ?? null : null
  }

  const hoverAt = (pt) => {
    const f = pt ? floorAt(pt.x, pt.y) : null
    const id = f?.id ?? null
    if (id !== hovered) onHover(id)
  }

  // at rest with its map in: the floor under a pointer that is already there lights up
  useEffect(() => {
    if (frame !== null && lastPt.current) hoverAt(lastPt.current)
    // hoverAt reads the latest render's values; it runs when the frame or its map arrives
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame, mapTick])

  // paint the floors for the frame at rest
  useLayoutEffect(() => {
    const canvas = overlayRef.current
    const ids = frame === null ? null : maps.current.get(frame)
    if (!canvas || !ids) return
    const ctx = canvas.getContext('2d')
    if (!colors.current) {
      const rgb = (v) => {
        canvas.style.color = v
        return getComputedStyle(canvas).color.match(/[\d.]+/g).slice(0, 3).map(Number)
      }
      colors.current = { espresso: rgb('var(--espresso)'), bronze: rgb('var(--bronze-deep)'), cream: rgb('var(--cream)') }
    }
    const { espresso, bronze, cream } = colors.current
    const w = MAP.width
    const img = ctx.createImageData(w, MAP.height)
    const px = img.data
    const style = floors.map((f) => {
      const on = pickable(f)
      if (on && f.id === selected) return [bronze, 0.6, on]
      if (f.id === hovered) return on ? [bronze, 0.45, on] : [espresso, 0.18, on]
      return on ? [espresso, 0.2, on] : null
    })
    for (let p = 0; p < ids.length; p++) {
      const id = ids[p]
      if (!id) continue
      const s = style[id - 1]
      const up = p >= w ? ids[p - w] : 0
      // the fine pale line between one level and the next, where either opens
      const line = up && up !== id && (s?.[2] || style[up - 1]?.[2])
      const [c, a] = line ? [cream, 0.45] : s ?? []
      if (!c) continue
      const k = p * 4
      px[k] = c[0]
      px[k + 1] = c[1]
      px[k + 2] = c[2]
      px[k + 3] = Math.round(a * 255)
    }
    ctx.putImageData(img, 0, 0)
    gsap.to(canvas, { autoAlpha: 1, duration: REDUCED ? 0.15 : 0.35, ease: EASE.soft, overwrite: 'auto' })
  }, [frame, mapTick, hovered, selected, floors, pickable])

  const onTurn = () => {
    if (frame === null) return
    setFrame(null)
    if (hovered) onHover(null)
    gsap.to(overlayRef.current, { autoAlpha: 0, duration: REDUCED ? 0.1 : 0.2, ease: EASE.soft, overwrite: 'auto' })
  }

  const onSettle = (f) => {
    frameRef.current = f
    setFrame(f)
  }

  const hoveredFloor = floors.find((f) => f.id === hovered)
  const cursor = frame !== null && hoveredFloor && pickable(hoveredFloor) ? 'pointer' : undefined

  return (
    <div
      ref={boxRef}
      className={`relative ${className}`}
      onPointerMove={(e) => {
        lastPt.current = { x: e.clientX, y: e.clientY }
        if (!press.current) hoverAt(lastPt.current)
      }}
      onPointerLeave={() => {
        lastPt.current = null
        if (hovered) onHover(null)
      }}
      onPointerDown={(e) => {
        press.current = { x: e.clientX, y: e.clientY }
      }}
      onPointerUp={(e) => {
        const p = press.current
        press.current = null
        if (!p || Math.hypot(e.clientX - p.x, e.clientY - p.y) > CLICK_SLOP) return
        const f = floorAt(e.clientX, e.clientY)
        if (f && pickable(f)) onPick(f.id)
      }}
      onPointerCancel={() => {
        press.current = null
      }}
    >
      <IsoTurntable frames={frames} poster={frames[0]} alt={alt} loop range={range} fill={fill} hintClassName="bottom-[20%]" onTurn={onTurn} onSettle={onSettle} cursor={cursor} className="h-full w-full" />
      <canvas
        ref={overlayRef}
        width={MAP.width}
        height={MAP.height}
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          visibility: 'hidden',
          left: offX + MAP.x * scale,
          top: offY + MAP.y * scale,
          width: MAP.width * MAP.step * scale,
          height: MAP.height * MAP.step * scale,
        }}
      />
    </div>
  )
}

export default TowerFloorPicker
