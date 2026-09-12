import placeholder from '../assets/render/menu.webp'

const slide = { src: placeholder, title: 'GRAND ENTRANCE LOBBY', subtitle: 'A TIMELESS WELCOME' }

function Gallery({ onClose }) {
  return (
    <section
      className="relative h-svh w-full overflow-hidden text-cream"
      style={{
        background:
          'radial-gradient(circle at 0% 0%, #322824 0%, #211c1a 35%, #171413 65%, #0f0d0c 100%)',
      }}
    >
      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-6 md:px-12 md:py-10">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center border-none bg-transparent p-0 text-left"
        >
          <span>
            <strong className="block font-serif text-2xl tracking-[6px] text-cream">TUGHRA</strong>
            <span className="mt-1.5 block text-[10px] tracking-[3px] text-muted">MUMBAI CENTRAL</span>
          </span>
        </button>
      </div>

      {/* Body */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pt-24 pb-28 md:px-12 md:pt-28 lg:flex-row lg:items-center lg:gap-10">
        {/* Left copy */}
        <div className="relative w-full shrink-0 lg:max-w-[380px]">
          <span className="mb-5 block h-px w-12 bg-gold/50" />

          <h2 className="font-serif text-[clamp(40px,5vw,60px)] font-light leading-[1.15] text-cream">
            Spaces
            <br />
            That Inspire
          </h2>

          <p className="mt-5 max-w-[320px] font-serif text-[17px] leading-relaxed text-muted">
            Refined homes for a more extraordinary tomorrow.
          </p>
        </div>

        {/* Curved accent line — line_5.png, drawn in the same top-to-bottom
            reveal used for line_1.png on the Hero. Anchored to the true
            bottom-left corner of the page. */}
        <img
          src="/assets/svg/line_5_crop.png"
          alt=""
          aria-hidden="true"
          className="frame-draw-animate pointer-events-none absolute bottom-0 left-0 hidden w-72 lg:block"
          style={{ animationDuration: '2s, 0.6s' }}
        />

        {/* Main image */}
        <div className="mt-8 w-full max-w-[720px] flex-1 lg:mt-0">
          <div className="relative">
            <div
              className="relative aspect-[536/346] w-full overflow-hidden rounded-2xl"
              style={{ border: '1px solid rgba(243,236,217,0.25)' }}
            >
              <img src={slide.src} alt={slide.title} className="h-full w-full object-cover" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(10,9,8,0.15)_0%,rgba(10,9,8,0)_30%,rgba(10,9,8,0.35)_100%)]" />
            </div>

            <button
              type="button"
              aria-label="Full screen"
              className="absolute right-5 top-5 z-10 flex h-8 w-8 items-center justify-center text-cream/85 transition-colors hover:text-cream"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M1 5V1h4M15 5V1h-4M1 11v4h4M15 11v4h-4"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Gallery
