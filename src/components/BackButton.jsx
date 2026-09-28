import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import '../sections/Menu.css'

function BackButton({ onClick, label = 'Back', icon = 'arrow', variant = 'menu' }) {
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

  const isGold = variant === 'gold'
  const isMenu = variant === 'menu'

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerEnter={handlePointerEnter}
      className={`group relative flex items-center gap-2 sm:gap-2.5 md:gap-3 border transition-all duration-300 ease-out${isHovered ? ' luxury-btn' : ''}${
        isGold
          ? ' rounded-full px-4.5 py-2.5 sm:px-5 sm:py-3 md:px-6 md:py-3.5 backdrop-blur-md border-transparent text-[#1a1610]'
          : isMenu
            ? ` rounded-xl px-3.5 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 border-transparent text-cream backdrop-blur-md${isHovered ? ' bg-black/35 shadow-[0_10px_35px_rgba(0,0,0,0.25)]' : ' bg-black/10'}`
            : ' rounded-full px-4.5 py-2.5 sm:px-5 sm:py-3 md:px-6 md:py-3.5 backdrop-blur-md border-white/70 bg-black/30 text-white'
      }`}
      style={
        isGold
          ? {
              background: 'linear-gradient(135deg, #e9cf94, #b48a3e)',
              boxShadow: isHovered ? '0 10px 28px rgba(205, 168, 102, 0.6)' : '0 4px 14px rgba(205, 168, 102, 0.45)',
              transform: isHovered ? 'translateY(-2px) scale(1.03)' : 'translateY(0) scale(1)',
            }
          : {
              boxShadow: isHovered && !isMenu ? '0 10px 28px rgba(0, 0, 0, 0.35)' : undefined,
              transform: isHovered ? 'translateY(-2px) scale(1.03)' : 'translateY(0) scale(1)',
            }
      }
    >
      {icon === 'home' && (
        <svg
          ref={iconRef}
          className={`h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 transition-colors duration-300 ${isMenu ? (isHovered ? 'text-gold-light' : 'text-cream') : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"
          />
        </svg>
      )}
      {icon === 'arrow' && (
        <svg
          ref={iconRef}
          className={`h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 shrink-0 transition-colors duration-300 ${
            isGold ? '' : isMenu ? (isHovered ? 'text-gold-light' : 'text-cream') : 'text-white group-hover:text-gold-light'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      )}
      <span
        className={`relative text-[11px] font-semibold uppercase tracking-[2px] transition-colors duration-300 sm:text-xs md:text-sm ${
          isMenu ? (isHovered ? 'text-gold-light' : 'text-cream') : ''
        }`}
      >
        {label}
      </span>
    </button>
  )
}

export default BackButton
