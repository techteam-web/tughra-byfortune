import BrandMark from '../components/BrandMark.jsx'
import PanoBackground from '../components/PanoBackground.jsx'

function Hero({ onExplore }) {
  return (
    <section className="relative h-svh w-full overflow-hidden text-cream">
      <div className="absolute inset-0">
        <PanoBackground />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 78%, rgba(0,0,0,0.55) 100%), linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 22%, rgba(0,0,0,0) 52%)',
          }}
        />
        {/* Decorative frame — line_1.png you provided, converted to real per-pixel alpha
            (the source had an opaque black background). Stretched non-uniformly
            (width/height 100% with no object-fit) so it hits all four edges regardless
            of viewport ratio, matching the source image's own 1600x900 aspect. */}
        <img
          src="/assets/svg/line_1.png?v=3"
          alt=""
          aria-hidden="true"
          className="frame-draw-animate pointer-events-none absolute inset-0 z-10 hidden h-full w-full md:block"
        />
      </div>

      {/* Brand */}
      <div className="absolute left-6 top-6 z-10 md:left-12 md:top-10">
        <BrandMark />
      </div>

   

      {/* Main copy */}
      <div className="absolute left-6 top-1/2 z-10 max-w-[23.75rem] -translate-y-1/2 md:left-[14%]">
        <span className="mb-3 block text-xs uppercase tracking-[0.15625rem] text-cream/85">
          City. Sea. Opportunity.
        </span>
        <h1 className="font-serif text-[clamp(2.375rem,4.4vw,3.625rem)] font-normal uppercase leading-[1.12] tracking-[0.5px] text-cream">
          A HIGHER
          <br />
          <span className="text-gold-light">PERSPECTIVE</span>
        </h1>
        <p className="mt-4 flex items-center gap-3 text-xs uppercase tracking-[0.09375rem] text-muted">
          <span className="h-px w-6 bg-muted/60" />
          All within reach.
        </p>
        <button
          type="button"
          onClick={onExplore}
          className="group mt-8 inline-flex items-center gap-3.5 border-none bg-transparent p-0 text-sm uppercase tracking-[0.125rem] text-cream"
        >
          <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gold transition-colors group-hover:bg-gold/15">
            <span className="absolute inset-0 animate-ping rounded-full border border-gold/60" />
            <i className="block h-px w-4 bg-gold" />
          </span>
          Click here to explore
        </button>
      </div>


    </section>
  )
}

export default Hero
