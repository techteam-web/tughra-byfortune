const TOWER_IMG = '/assets/img/menu_crop.png'

const UNIT = { name: '3 BHK Residence', area: '2150 SQ FT' }

function FloorPlans({ onClose }) {
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
      <div className="absolute inset-0 flex items-center justify-center px-6 pt-16 pb-20 md:px-12">
        <div className="flex w-full max-w-[1320px] flex-col items-center gap-12 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          {/* Left: tower image */}
          <div className="flex w-full shrink-0 flex-col items-center lg:w-auto lg:items-start lg:ml-32">
            <img
              src={TOWER_IMG}
              alt="Tughra tower elevation"
              className="pointer-events-none h-[46vh] w-auto select-none lg:h-[64vh]"
              draggable={false}
            />
            <span className="mx-auto mt-5 block h-px w-10 bg-gold/50 lg:mx-0" />
          </div>

          {/* Right: floor plan card */}
          <div className="flex w-[720px] max-w-full flex-col items-center">
            <div className="aspect-[3/2] w-full rounded-3xl bg-[#f7f5f1]" />
            <div className="mt-8 flex w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-[1.5px] text-gold">
              <span>{UNIT.name}</span>
              <span className="h-3 w-px shrink-0 bg-gold/50" />
              <span>{UNIT.area}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Curved accent line — anchored to the true bottom-left corner of the page */}
      <img
        src="/assets/svg/line_5_crop.png"
        alt=""
        aria-hidden="true"
        className="frame-draw-animate pointer-events-none absolute bottom-0 left-0 hidden w-72 lg:block"
        style={{ animationDuration: '2s, 0.6s' }}
      />
    </section>
  )
}

export default FloorPlans
