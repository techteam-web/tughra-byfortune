import './../sections/Menu.css'

function BackButton({ onClick, label = 'Back', icon = 'arrow' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="lux-btn group flex items-center gap-2.5 rounded-full px-5 py-2.5 text-[0.625rem] uppercase tracking-[0.25rem] sm:px-6 md:py-3"
    >
      {icon === 'home' ? (
        <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
        </svg>
      ) : (
        <svg className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      )}
      {label}
    </button>
  )
}

export default BackButton
