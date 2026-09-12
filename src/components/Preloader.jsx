import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { TOWER_VIEWBOX, TOWER_OUTLINE_PATH } from './towerOutline.js'
import './Preloader.css'

gsap.registerPlugin(DrawSVGPlugin)

const OUTLINE_DURATION = 1.8
const IMAGE_FADE_DURATION = 0.7
const HOLD_DURATION = 0.4
const EXIT_DURATION = 0.7

function Preloader({ onComplete }) {
  const rootRef = useRef(null)
  const outlineRef = useRef(null)
  const imageRef = useRef(null)
  const barRef = useRef(null)
  const percentRef = useRef(null)

  useLayoutEffect(() => {
    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onComplete: () => onComplete?.(),
    })

    tl.set(outlineRef.current, { drawSVG: '0%' })

    // Draw the traced outline, then dissolve into the real tower render.
    tl.to(outlineRef.current, { drawSVG: '100%', duration: OUTLINE_DURATION }, 0)
    tl.to(imageRef.current, { opacity: 1, duration: IMAGE_FADE_DURATION }, OUTLINE_DURATION - 0.3)
    tl.to(outlineRef.current, { opacity: 0, duration: IMAGE_FADE_DURATION }, OUTLINE_DURATION - 0.3)

    // Percentage counter + progress bar run the whole time the tower is
    // being revealed, reaching 100% exactly as the image finishes fading in.
    const counter = { value: 0 }
    tl.to(
      counter,
      {
        value: 100,
        duration: OUTLINE_DURATION + IMAGE_FADE_DURATION - 0.3,
        ease: 'power1.inOut',
        onUpdate: () => {
          const pct = Math.round(counter.value)
          if (percentRef.current) percentRef.current.textContent = `${pct}%`
          if (barRef.current) barRef.current.style.width = `${pct}%`
        },
      },
      0
    )

    tl.to({ v: 0 }, { v: 1, duration: HOLD_DURATION })
    tl.to(rootRef.current, { opacity: 0, duration: EXIT_DURATION })

    return () => tl.kill()
  }, [onComplete])

  return (
    <div className="preloader" ref={rootRef}>
      <div className="preloader__glow" />

      <div className="preloader__brand">
        <strong className="preloader__wordmark">TUGHRA</strong>
        <span className="preloader__place">MUMBAI CENTRAL</span>
      </div>

      <div className="preloader__tower">
        <svg
          className="preloader__tower-svg"
          viewBox={TOWER_VIEWBOX}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="preloader-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            ref={outlineRef}
            d={TOWER_OUTLINE_PATH}
            fill="none"
            stroke="#c17f45"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#preloader-glow)"
          />
        </svg>
        <img
          ref={imageRef}
          src="/assets/img/menu_crop.png"
          alt=""
          aria-hidden="true"
          className="preloader__tower-img"
        />
      </div>

      <div className="preloader__progress">
        <span className="preloader__percent" ref={percentRef}>
          0%
        </span>
        <div className="preloader__bar-track">
          <div className="preloader__bar-fill" ref={barRef} />
        </div>
        <span className="preloader__caption">Loading Elevated Living</span>
      </div>
    </div>
  )
}

export default Preloader
