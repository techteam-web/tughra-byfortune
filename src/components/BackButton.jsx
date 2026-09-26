import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import '../sections/Menu.css'

function BackButton({ onClick, label = 'Back', icon = 'arrow' }) {
  const [isHovered, setIsHovered] = useState(false)
  const btnRef = useRef(null)
  const iconRef = useRef(null)
  const quickX = useRef(null)
  const quickY = useRef(null)

  useLayoutEffect(() => {
    quickX.current = gsap.quickTo(btnRef.current, 'x', { duration: 0.5, ease: 'power3.out' })
    quickY.current = gsap.quickTo(btnRef.current, 'y', { duration: 0.5, ease: 'power3.out' })
  }, [])

  const handlePointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const clampedX = Math.max(4, Math.min(96, x))
    e.currentTarget.style.setProperty('--mx', `${clampedX}%`)

    // Subtle magnetic pull toward the cursor.
    const relX = e.clientX - (rect.left + rect.width / 2)
    const relY = e.clientY - (rect.top + rect.height / 2)
    quickX.current?.(relX * 0.18)
    quickY.current?.(relY * 0.35)
  }

  const handlePointerLeave = (e) => {
    e.currentTarget.style.setProperty('--mx', '82%')
    quickX.current?.(0)
    quickY.current?.(0)
    setIsHovered(false)
    gsap.to(iconRef.current, { x: 0, duration: 0.4, ease: 'power3.out' })
  }

  const handlePointerEnter = () => {
    setIsHovered(true)
    gsap.to(iconRef.current, { x: icon === 'home' ? 0 : -3, duration: 0.4, ease: 'power3.out' })
  }

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerEnter={handlePointerEnter}
      className={`group relative flex items-center gap-2.5 rounded-full border border-white/70 bg-black/30 px-4.5 py-2.5 text-white backdrop-blur-md transition-colors duration-300${isHovered ? ' luxury-btn' : ''}`}
    >
      {icon === 'home' && (
        <svg ref={iconRef} className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"
          />
        </svg>
      )}
      {icon === 'arrow' && (
        <svg ref={iconRef} className="h-3.5 w-3.5 shrink-0 text-white transition-colors duration-300 group-hover:text-gold-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      )}
      <span className="relative text-[11px] uppercase tracking-[2px]">
        {label}
        <span
          className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-gold-light transition-transform duration-300 ease-out group-hover:scale-x-100"
          aria-hidden="true"
        />
      </span>
    </button>
  )
}

export default BackButton
