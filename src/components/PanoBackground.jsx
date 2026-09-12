import { useEffect, useRef } from 'react'
import Marzipano from 'marzipano'
import { APP_DATA } from '../pano/data.js'
import './PanoBackground.css'

const TILE_BASE = '/assets/mainpano/tiles'

function PanoBackground() {
  const containerRef = useRef(null)

  useEffect(() => {
    const scene = APP_DATA.scenes[0]
    const settings = APP_DATA.settings

    const viewer = new Marzipano.Viewer(containerRef.current, {
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
    const view = new Marzipano.RectilinearView(scene.initialViewParameters, limiter)

    const markerScene = viewer.createScene({ source, geometry, view, pinFirstLevel: true })
    markerScene.switchTo()

    let stopAutorotate = () => {}
    if (settings.autorotateEnabled) {
      const autorotate = Marzipano.autorotate({
        yawSpeed: 0.03,
        targetPitch: 0,
        targetFov: Math.PI / 2,
      })
      viewer.setIdleMovement(2000, autorotate)
      stopAutorotate = () => viewer.setIdleMovement(Infinity)
    }

    return () => {
      stopAutorotate()
      viewer.destroy()
    }
  }, [])

  return <div className="pano-bg" ref={containerRef} />
}

export default PanoBackground
