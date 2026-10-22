import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Marzipano from 'marzipano'
import { gsap, fx, EASE, PAGE_IN, REDUCED } from '../motion/index.js'
import { APP_DATA } from '../data'
import { TopBar, MenuControl, HomeControl, IconButton } from '../ui/controls.jsx'
import { IcSun, IcDusk, IcMoon, IcRotate, IcUp, IcDown } from '../ui/icons.jsx'

// --- DATA MAPPING ---
// Floors mapped to their scene IDs by time of day.
const FLOOR_DATA = [
  { label: 'Terrace', short: 'TER', height: '108.9m', day: '18-day_0003_terrace---1089m', evening: '19-evening_0086_terrace---1089m', night: '38-night_0090_terrace---1089m' },
  { label: '17th Floor', short: '17', height: '104.7m', day: '17-day_0004_17th-floor---1047m', evening: '20-evening_0085_17th-floor---1047m', night: '39-night_0091_17th-floor---1047m' },
  { label: '16th Floor', short: '16', height: '100.5m', day: '16-day_0005_16th-floor-1005m', evening: '21-evening_0084_16th-floor---1005m', night: '40-night_0092_16th-floor---1005m' },
  { label: '15th Floor', short: '15', height: '96.6m', day: '15-day_0007_15th-floor---966m', evening: '22-evening_0083_15th-floor---966m', night: '41-night_0093_15th-floor---966m' },
  { label: '14th Floor', short: '14', height: '92.7m', day: '14-day_0008_14th-floor---927m', evening: '23-evening_0082_14th-floor---927m', night: '42-night_0094_14th-floor---927m' },
  { label: '13th Floor', short: '13', height: '88.8m', day: '13-day_0009_13th-floor---888', evening: '24-evening_0081_13th-floor---888m', night: '43-night_0095_13th-floor---888m' },
  { label: '12th Floor', short: '12', height: '84.9m', day: '12-day_0010_12th-floor---849m', evening: '25-evening_0080_12th-floor---849m', night: '44-night_0096_12th-floor---849m' },
  { label: '11th Floor', short: '11', height: '81m', day: '11-day_0011_11th-floor---81m', evening: '26-evening_0079_11th-floor---81m', night: '45-night_0097_11th-floor---81m' },
  { label: '10th Floor', short: '10', height: '77.1m', day: '10-day_0012_10th-floor---771m', evening: '27-evening_0078_10th-floor---771m', night: '46-night_0098_10th-floor---771m' },
  { label: '9th Floor', short: '9', height: '73.2m', day: '9-day_0013_9th-floor---732m', evening: '28-evening_0077_9th-floor---732m', night: '47-night_0099_9th-floor---732m' },
  { label: '8th Floor', short: '8', height: '69.3m', day: '8-day_0014_8th-floor---693m', evening: '29-evening_0076_8th-floor---693m', night: '48-night_0100_8th-floor--693m' },
  { label: '7th Floor', short: '7', height: '65.4m', day: '7-day_0016_7th-floor---654m', evening: '30-evening_0075_7th-floor---654m', night: '49-night_0101_7th-floor---654m' },
  { label: '6th Floor', short: '6', height: '61.5m', day: '6-day_0021_6th-floor---615m', evening: '31-evening_0074_6th-floor---615m', night: '50-night_0102_6th-floor---615m' },
  { label: '5th Floor', short: '5', height: '57.6m', day: '5-day_0022_5th-floor---576m', evening: '32-evening_0073_5th-floor---576m', night: '51-night_0103_5th-floor---576m' },
  { label: '4th Floor', short: '4', height: '53.7m', day: '4-day_0023_4th-floor---537m', evening: '33-evening_0072_4th-floor---537m', night: '52-night_0104_4th-floor---537m' },
  { label: '3rd Floor', short: '3', height: '49.8m', day: '3-day_0024_3rd-floor---498m', evening: '34-evening_0071_3rd-floor---498m', night: '53-night_0105_3rd-floor---498m' },
  { label: '2nd Floor', short: '2', height: '45.9m', day: '2-day_0025_2nd-floor----459m', evening: '35-evening_0070_2nd-floor---459m', night: '54-night_0106_2nd-floor---459m' },
  { label: '1st Floor', short: '1', height: '42m', day: '1-day_0026_1st-floor----42m', evening: '36-evening_0069_1st-floor---42m', night: '55-night_0107_1st-floor---42m' },
  { label: 'Podium', short: 'POD', height: '37.65m', day: '0-day_0027_podium-hight-3765m', evening: '37-evening_0068_podium-3765m', night: '56-night_0108_podium---3765m' },
]

const TIMES = [
  { key: 'day', label: 'Day', Icon: IcSun },
  { key: 'evening', label: 'Evening', Icon: IcDusk },
  { key: 'night', label: 'Night', Icon: IcMoon },
]
const TILE_BASE_PATH = '/Fortune-panos/app-files/tiles'
const SLIDER_HEIGHT = 'clamp(8rem, calc(100svh - 30rem), 18.75rem)' // shared by the slider track and its floor-number ruler

// Real elevation profile of the tower, so the slider represents the actual
// roofline-to-podium travel rather than just a flat list index.
const FLOOR_HEIGHTS = FLOOR_DATA.map((f) => parseFloat(f.height))
const MIN_HEIGHT = Math.min(...FLOOR_HEIGHTS)
const MAX_HEIGHT = Math.max(...FLOOR_HEIGHTS)
// 0 at the roofline, 1 at the podium
const railFractionFor = (idx) => (MAX_HEIGHT - FLOOR_HEIGHTS[idx]) / (MAX_HEIGHT - MIN_HEIGHT)

const ViewsPage = ({ onClose, onHome }) => {
  const rootRef = useRef(null)
  const panoElementRef = useRef(null)
  const viewerRef = useRef(null)
  const scenesRef = useRef({})
  const autorotateRef = useRef(null)
  const dipRef = useRef(null) // espresso dip between scenes
  const toastRef = useRef(null)
  const toastTimeoutRef = useRef(null)
  const timeIndRef = useRef(null)
  const fillRef = useRef(null)
  const thumbRef = useRef(null)
  const sliderRef = useRef(null)
  const draggingRef = useRef(false)
  const lastWheelRef = useRef(0)

  const [currentTime, setCurrentTime] = useState('day')
  const [currentFloorIdx, setCurrentFloorIdx] = useState(0) // 0 is the Terrace
  const [isAutoRotating, setIsAutoRotating] = useState(false)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const viewer = new Marzipano.Viewer(panoElementRef.current, { controls: { mouseViewMode: 'drag' } })
    viewerRef.current = viewer
    autorotateRef.current = Marzipano.autorotate({ yawSpeed: 0.05, targetPitch: 0, targetFov: Math.PI / 2 })

    const scenes = {}
    APP_DATA.scenes.forEach((sceneData) => {
      const source = Marzipano.ImageUrlSource.fromString(`${TILE_BASE_PATH}/${sceneData.id}/{z}/{f}/{y}/{x}.jpg`)
      const geometry = new Marzipano.CubeGeometry(sceneData.levels)
      const limiter = Marzipano.RectilinearView.limit.traditional(sceneData.faceSize, (100 * Math.PI) / 180, (120 * Math.PI) / 180)
      const view = new Marzipano.RectilinearView(sceneData.initialViewParameters, limiter)
      scenes[sceneData.id] = viewer.createScene({ source, geometry, view, pinFirstLevel: true })
    })
    scenesRef.current = scenes

    // Terrace, by day
    scenes[FLOOR_DATA[0].day].switchTo()

    return () => viewer.destroy()
  }, [])

  // The controls step back after a few still seconds, so the panorama is the page
  useEffect(() => {
    let timer
    let idle = false
    const chrome = () => rootRef.current?.querySelectorAll('.v-chrome')
    const setIdle = (v) => {
      if (v === idle) return
      idle = v
      gsap.to(chrome(), { opacity: v ? 0.16 : 1, duration: v ? 0.8 : 0.4, ease: EASE.soft, overwrite: 'auto' })
    }
    const wake = () => {
      setIdle(false)
      clearTimeout(timer)
      timer = setTimeout(() => setIdle(true), 4200)
    }
    window.addEventListener('pointermove', wake)
    window.addEventListener('pointerdown', wake)
    window.addEventListener('wheel', wake)
    wake()
    return () => {
      window.removeEventListener('pointermove', wake)
      window.removeEventListener('pointerdown', wake)
      window.removeEventListener('wheel', wake)
      clearTimeout(timer)
    }
  }, [])

  // Entrance
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: PAGE_IN })
      tl.add(fx.fade('.tb-anim, .v-top', { y: -10 }), 0)
      tl.add(fx.panel('.v-dock'), 0.2)
      tl.add(fx.fade('.v-dock-item', { y: 8, stagger: 0.06 }), 0.4)
    }, rootRef)
    return () => ctx.revert()
  }, [])

  // The time-of-day ring glides to the chosen time
  useLayoutEffect(() => {
    const i = TIMES.findIndex((t) => t.key === currentTime)
    const vars = { y: `${i * 100}%` }
    if (REDUCED) gsap.set(timeIndRef.current, vars)
    else gsap.to(timeIndRef.current, { ...vars, duration: 0.5, ease: EASE.enter, overwrite: 'auto' })
  }, [currentTime])

  // The slider's fill and thumb glide to the floor (instantly while being dragged)
  useLayoutEffect(() => {
    const pos = `${(1 - railFractionFor(currentFloorIdx)) * 100}%`
    const d = dragging || REDUCED ? 0 : 0.55
    gsap.to(fillRef.current, { height: pos, duration: d, ease: EASE.enter, overwrite: 'auto' })
    gsap.to(thumbRef.current, { bottom: pos, duration: d, ease: EASE.enter, overwrite: 'auto' })
  }, [currentFloorIdx, dragging])

  // A short dip to espresso, so every floor or time change reads as a deliberate cut
  const sceneTransition = () => {
    if (!dipRef.current || REDUCED) return
    gsap.fromTo(dipRef.current, { opacity: 0.55 }, { opacity: 0, duration: 0.6, ease: EASE.soft, overwrite: 'auto' })
  }

  // "Now viewing", briefly, when the scene changes
  const showToast = (floorIdx, time) => {
    const el = toastRef.current
    if (!el) return
    el.textContent = `${FLOOR_DATA[floorIdx].label}  ·  ${time}`
    gsap.killTweensOf(el)
    gsap.fromTo(el, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.45, ease: EASE.soft })
    clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => gsap.to(el, { opacity: 0, y: -6, duration: 0.5, ease: EASE.soft }), 1900)
  }

  const switchSceneSynced = (newTime, newFloorIdx) => {
    const viewer = viewerRef.current
    const oldScene = viewer.scene()
    const newScene = scenesRef.current[FLOOR_DATA[newFloorIdx][newTime]]
    if (!oldScene || !newScene) return
    const oldView = oldScene.view()
    newScene.view().setParameters({ yaw: oldView.yaw(), pitch: oldView.pitch(), fov: oldView.fov() })
    newScene.switchTo()
    sceneTransition()
    showToast(newFloorIdx, newTime)
    setCurrentTime(newTime)
    setCurrentFloorIdx(newFloorIdx)
  }

  const toggleAutoRotate = () => {
    const viewer = viewerRef.current
    if (isAutoRotating) {
      viewer.stopMovement()
      viewer.setIdleMovement(Infinity, null)
    } else {
      viewer.startMovement(autorotateRef.current)
      viewer.setIdleMovement(3000, autorotateRef.current) // resumes 3s after the guest stops dragging
    }
    setIsAutoRotating(!isAutoRotating)
  }

  // --- Elevation slider: dragged or tapped directly, roofline at the top, podium at the bottom.
  const floorFromPointer = (clientY) => {
    const el = sliderRef.current
    if (!el) return currentFloorIdx
    const rect = el.getBoundingClientRect()
    const fraction = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height))
    let best = 0
    let bestDist = Infinity
    FLOOR_DATA.forEach((_, idx) => {
      const dist = Math.abs(railFractionFor(idx) - fraction)
      if (dist < bestDist) {
        bestDist = dist
        best = idx
      }
    })
    return best
  }

  const onSliderDown = (e) => {
    draggingRef.current = true
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
    const idx = floorFromPointer(e.clientY)
    if (idx !== currentFloorIdx) switchSceneSynced(currentTime, idx)
  }
  const onSliderMove = (e) => {
    if (!draggingRef.current) return
    const idx = floorFromPointer(e.clientY)
    if (idx !== currentFloorIdx) switchSceneSynced(currentTime, idx)
  }
  const onSliderUp = () => {
    draggingRef.current = false
    setDragging(false)
  }
  const onSliderWheel = (e) => {
    const now = e.timeStamp
    if (now - lastWheelRef.current < 90) return
    lastWheelRef.current = now
    stepFloor(e.deltaY > 0 ? 1 : -1)
  }

  const stepFloor = (dir) => {
    const next = Math.min(FLOOR_DATA.length - 1, Math.max(0, currentFloorIdx + dir))
    if (next !== currentFloorIdx) switchSceneSynced(currentTime, next)
  }


  return (
    <div ref={rootRef} className="relative h-svh w-full overflow-hidden bg-espresso">
      {/* The 360 canvas */}
      <div ref={panoElementRef} className="absolute inset-0" />

      {/* espresso dip on every scene change */}
      <div ref={dipRef} className="pointer-events-none absolute inset-0 z-[6] bg-espresso opacity-0" />
      {/* a touch of shade at the top for the logo */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[7] h-56" style={{ background: 'linear-gradient(180deg, var(--scrim) 0%, transparent 100%)' }} />

      <div className="v-chrome">
        <TopBar onBrand={onClose}>
          <div className="v-top flex items-center gap-4 md:gap-6">
            <HomeControl onClick={onHome} />
            <MenuControl onClick={onClose} />
          </div>
        </TopBar>
      </div>

      {/* "Now viewing" — appears only when the scene changes */}
      <div
        ref={toastRef}
        className="tr-label pointer-events-none absolute left-1/2 top-[max(6.5rem,calc(var(--safe-t)+5.5rem))] z-20 -translate-x-1/2 whitespace-nowrap rounded-lg tr-panel px-5 py-2.5 opacity-0 md:top-10 short:top-3"
        aria-live="polite"
      />

      {/* Right dock: time of day, auto-rotate, and the elevation slider - centred in the space
          below the top bar, so it never runs up under Home and Menu */}
      <div className="pointer-events-none absolute bottom-[max(1rem,var(--safe-b))] right-[max(1rem,var(--safe-r))] top-[max(7.25rem,calc(var(--safe-t)+6.5rem))] z-20 flex items-center md:right-6 short:top-3">
        <div className="v-chrome short:origin-right short:scale-[0.72]">
          <div className="v-dock tr-panel pointer-events-auto flex w-[4.5rem] flex-col items-center gap-3 py-4 short:py-3">
            {/* time of day: a vertical segmented control, the gold ring glides */}
            <div className="v-dock-item relative flex flex-col rounded-full border border-[color-mix(in_srgb,var(--ribbon-main-gold)_35%,transparent)] p-[3px]" role="group" aria-label="Time of day">
              <span ref={timeIndRef} className="pointer-events-none absolute left-[3px] top-[3px] h-9 w-9 rounded-full border border-[var(--ribbon-champagne)] bg-[color-mix(in_srgb,var(--ribbon-main-gold)_20%,transparent)] shadow-[0_0_0.9rem_color-mix(in_srgb,var(--ribbon-main-gold)_35%,transparent)]" aria-hidden="true" />
              {TIMES.map(({ key, label, Icon }) => {
                const on = currentTime === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => switchSceneSynced(key, currentFloorIdx)}
                    aria-label={label}
                    aria-pressed={on}
                    title={label}
                    className={`tr-focus relative flex h-9 w-9 items-center justify-center rounded-full border-none bg-transparent transition-colors duration-300 ${on ? 'text-[var(--ribbon-champagne)]' : 'text-cream/60 hover:text-cream'}`}
                  >
                    <Icon size={16} />
                  </button>
                )
              })}
            </div>

            <i className="v-dock-item tr-hair w-8 short:hidden" />

            {/* auto-rotate: shown by colour, never by spinning */}
            <span className="v-dock-item">
              <IconButton small label={isAutoRotating ? 'Stop turning' : 'Turn slowly'} onClick={toggleAutoRotate} active={isAutoRotating}>
                <IcRotate size={16} />
              </IconButton>
            </span>

            <i className="v-dock-item tr-hair w-8 short:hidden" />

            <IconButton small label="Next floor up" onClick={() => stepFloor(-1)} disabled={currentFloorIdx === 0} className="v-dock-item short:hidden">
              <IcUp size={15} />
            </IconButton>

            {/* the elevation slider, with every floor's number marked beside it */}
            <div className="v-dock-item flex items-center gap-1.5">
              <div className="relative w-6 shrink-0" style={{ height: SLIDER_HEIGHT }}>
                {FLOOR_DATA.map((floor, idx) => {
                  const on = currentFloorIdx === idx
                  return (
                    <button
                      key={floor.label}
                      type="button"
                      onClick={() => switchSceneSynced(currentTime, idx)}
                      aria-label={`${floor.label}, ${floor.height}`}
                      className={`absolute right-0 translate-y-1/2 border-none bg-transparent px-0.5 py-px font-sans leading-none tabular-nums transition-colors duration-300 ${
                        on ? 'text-[0.5625rem] font-semibold text-[var(--ribbon-champagne)]' : 'text-[0.4375rem] text-cream/45 hover:text-cream'
                      }`}
                      style={{ bottom: `${(1 - railFractionFor(idx)) * 100}%` }}
                    >
                      {floor.short}
                    </button>
                  )
                })}
              </div>

              <div
                ref={sliderRef}
                role="slider"
                aria-label="Floor"
                aria-valuemin={0}
                aria-valuemax={FLOOR_DATA.length - 1}
                aria-valuenow={FLOOR_DATA.length - 1 - currentFloorIdx}
                aria-valuetext={FLOOR_DATA[currentFloorIdx].label}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp') stepFloor(-1)
                  if (e.key === 'ArrowDown') stepFloor(1)
                }}
                onPointerDown={onSliderDown}
                onPointerMove={onSliderMove}
                onPointerUp={onSliderUp}
                onPointerLeave={onSliderUp}
                onWheel={onSliderWheel}
                className="tr-focus relative w-4 shrink-0 cursor-grab touch-none"
                style={{ height: SLIDER_HEIGHT }}
              >
                {/* the track */}
                <span className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[color-mix(in_srgb,var(--ribbon-main-gold)_35%,transparent)]" />
                {/* bronze fill: height mirrors the floor's real elevation */}
                <span ref={fillRef} className="pointer-events-none absolute bottom-0 left-1/2 h-full w-[2px] -translate-x-1/2 bg-[linear-gradient(0deg,var(--ribbon-deep-bronze),var(--ribbon-main-gold),var(--ribbon-champagne))]" />
                {/* the thumb: a gold-pale ring */}
                <span ref={thumbRef} className="pointer-events-none absolute bottom-full left-1/2 h-3.5 w-3.5 -translate-x-1/2 translate-y-1/2 rounded-full border border-[var(--ribbon-champagne)] bg-espresso shadow-[0_0_0.7rem_color-mix(in_srgb,var(--ribbon-main-gold)_55%,transparent)]" />
              </div>
            </div>

            <IconButton small label="Next floor down" onClick={() => stepFloor(1)} disabled={currentFloorIdx === FLOOR_DATA.length - 1} className="v-dock-item short:hidden">
              <IcDown size={15} />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewsPage
