import { useEffect, useRef } from 'react'
import Marzipano from 'marzipano'
import { APP_DATA } from '../pano/data.js'
import './PanoBackground.css'

const TILE_BASE = '/assets/mainpano/tiles'
// The skyline cut out of the pano (buildings opaque, sky clear), one image per cube face
const FG_URL = '/assets/mainpano/fg/{f}.webp'

// Where the home pano starts, in degrees. Yaw turns left/right (positive = right),
// pitch tilts up/down (positive = up), fov is the zoom (smaller = closer).
const START_VIEW = { yaw: 45, pitch: 0, fov: 90 }
const rad = (deg) => (deg * Math.PI) / 180

// `copy` is an optional DOM element that lives inside the scene itself, between the
// sky and the city: the pano is drawn once behind it, then again on top as just the
// skyline, so buildings pass in front of the copy as the view turns.
function PanoBackground({ copy }) {
  const containerRef = useRef(null)
  const fgRef = useRef(null)

  useEffect(() => {
    const scene = APP_DATA.scenes[0]
    const settings = APP_DATA.settings
    const container = containerRef.current

    const viewer = new Marzipano.Viewer(container, {
      controls: { mouseViewMode: settings.mouseViewMode },
    })

    const source = Marzipano.ImageUrlSource.fromString(
      `${TILE_BASE}/${scene.id}/{z}/{f}/{y}/{x}.jpg`
    )
    const geometry = new Marzipano.CubeGeometry(scene.levels)
    const limiter = Marzipano.RectilinearView.limit.traditional(
      scene.faceSize,
      (120 * Math.PI) / 180
    )
    const view = new Marzipano.RectilinearView(
      { yaw: rad(START_VIEW.yaw), pitch: rad(START_VIEW.pitch), fov: rad(START_VIEW.fov) },
      limiter
    )

    const markerScene = viewer.createScene({ source, geometry, view, pinFirstLevel: true })
    markerScene.switchTo()

    // Second viewer, stacked above and locked to the first: the skyline cut-out only
    const fgViewer = new Marzipano.Viewer(fgRef.current)
    const fgView = new Marzipano.RectilinearView(view.parameters())
    const fgScene = fgViewer.createScene({
      source: Marzipano.ImageUrlSource.fromString(FG_URL),
      geometry: new Marzipano.CubeGeometry([{ tileSize: 2048, size: 2048 }]),
      view: fgView,
    })
    fgScene.switchTo()
    const syncView = () => fgView.setParameters(view.parameters())
    view.addEventListener('change', syncView)

    // Pin the copy into the scene. The radius is chosen so it renders at its natural
    // size at the start zoom, whatever the window size.
    let hotspot = null
    let resizeObserver = null
    if (copy) {
      const radius = () => (0.5 * container.clientHeight) / Math.tan(rad(START_VIEW.fov) / 2)
      hotspot = markerScene
        .hotspotContainer()
        .createHotspot(copy, { yaw: rad(START_VIEW.yaw), pitch: rad(START_VIEW.pitch) }, { perspective: { radius: radius() } })
      resizeObserver = new ResizeObserver(() => hotspot.setPerspective({ radius: radius() }))
      resizeObserver.observe(container)
    }

    // The pano turns fully, as it always did. While it turns, the pinned copy glides
    // along with it so it stays in view; once the viewer drags, it is left in the world.
    let stopIdle = () => {}
    if (settings.autorotateEnabled) {
      const autorotate = Marzipano.autorotate({
        yawSpeed: 0.03,
        targetPitch: 0,
        targetFov: Math.PI / 2,
      })
      const turn = () => {
        const step = autorotate()
        let last = null
        let copyYaw = null
        return (params, now) => {
          const out = step(params, now)
          if (hotspot) {
            const dt = last === null ? 0 : Math.min((now - last) / 1000, 0.1)
            if (copyYaw === null) copyYaw = hotspot.position().yaw
            // ease toward the view's yaw by the shortest way round
            const gap = Math.atan2(Math.sin(out.yaw - copyYaw), Math.cos(out.yaw - copyYaw))
            copyYaw += gap * Math.min(1, dt * 2.5)
            hotspot.setPosition({ yaw: copyYaw, pitch: rad(START_VIEW.pitch) })
          }
          last = now
          return out
        }
      }
      viewer.setIdleMovement(2000, turn)
      stopIdle = () => viewer.setIdleMovement(Infinity)
    }

    return () => {
      stopIdle()
      resizeObserver?.disconnect()
      if (hotspot) markerScene.hotspotContainer().destroyHotspot(hotspot)
      view.removeEventListener('change', syncView)
      fgViewer.destroy()
      viewer.destroy()
    }
  }, [copy])

  return (
    <>
      <div className="pano-bg" ref={containerRef} />
      <div className="pano-fg" ref={fgRef} />
    </>
  )
}

export default PanoBackground
