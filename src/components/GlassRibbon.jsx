// The menu's glass ribbon: a smoky, see-through panel whose right edge is the client's ribbon artwork
// (public/assets/fortune1.png and fortune2.png), running straight down and sweeping off the bottom.
//
// Drawn in a 420 x 900 space (one unit = 1/900 of the screen height) with the ribbon's core at x 82,
// so the page can place it with --rx; the geometry lives in glassRibbonGeometry.js.
import { LINE_EDGE, LINE_CURL, PANEL, GLASS, FLOOR, RIBBON_IMAGES } from './glassRibbonGeometry.js'

const glow = 'var(--ribbon-glow)'

export default function GlassRibbon({ className = '', style, ref }) {
  return (
    <svg ref={ref} className={`pointer-events-none overflow-visible ${className}`} style={{ aspectRatio: '420 / 900', ...style }} viewBox="0 0 420 900" aria-hidden="true">
      <defs>
        <clipPath id="gr-panel">
          <path d={PANEL} />
        </clipPath>
        {/* the panel is clearer glass between the curl and the ribbon */}
        <mask id="gr-thin" maskUnits="userSpaceOnUse" x="-4000" y="-100" width="4500" height="1100">
          <rect x="-4000" y="-100" width="4500" height="1100" fill="white" />
          <path d={GLASS} style={{ fill: 'url(#gr-thin-g)' }} />
        </mask>
        <linearGradient id="gr-thin-g" gradientUnits="userSpaceOnUse" x1="6" y1="0" x2="71" y2="0">
          <stop offset="0" style={{ stopColor: 'black', stopOpacity: 0.42 }} />
          <stop offset="1" style={{ stopColor: 'black', stopOpacity: 0.78 }} />
        </linearGradient>
        {/* wide screens: smoky, see-through glass (opacities: --menu-panel-* tokens), a little deeper at the foot */}
        <linearGradient id="gr-fill-side" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="900">
          <stop offset="0" style={{ stopColor: 'var(--espresso)', stopOpacity: 'var(--menu-panel-top)' }} />
          <stop offset="0.45" style={{ stopColor: 'var(--espresso)', stopOpacity: 'var(--menu-panel-mid)' }} />
          <stop offset="1" style={{ stopColor: 'var(--espresso)', stopOpacity: 'var(--menu-panel-low)' }} />
        </linearGradient>
        {/* phones and tablets: clear at the top so the tower shows, dark where the menu sits */}
        <linearGradient id="gr-fill-v" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="900">
          <stop offset="0" style={{ stopColor: 'var(--espresso)', stopOpacity: 0.15 }} />
          <stop offset="0.22" style={{ stopColor: 'var(--espresso)', stopOpacity: 0.2 }} />
          <stop offset="0.4" style={{ stopColor: 'var(--espresso)', stopOpacity: 0.9 }} />
          <stop offset="1" style={{ stopColor: 'var(--espresso)', stopOpacity: 0.95 }} />
        </linearGradient>
        {/* warm light from the ribbon into the panel */}
        <linearGradient id="gr-spill" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="900">
          <stop offset="0" style={{ stopColor: glow, stopOpacity: 0.1 }} />
          <stop offset="0.55" style={{ stopColor: glow, stopOpacity: 0.14 }} />
          <stop offset="0.7" style={{ stopColor: glow, stopOpacity: 0.05 }} />
          <stop offset="1" style={{ stopColor: glow, stopOpacity: 0.05 }} />
        </linearGradient>
        {/* the glass between the curl and the ribbon is lit, more so lower down */}
        <linearGradient id="gr-glass" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="500">
          <stop offset="0" style={{ stopColor: glow, stopOpacity: 0.04 }} />
          <stop offset="0.55" style={{ stopColor: glow, stopOpacity: 0.18 }} />
          <stop offset="1" style={{ stopColor: glow, stopOpacity: 0.3 }} />
        </linearGradient>
        <radialGradient id="gr-floor" gradientUnits="userSpaceOnUse" cx={FLOOR[0]} cy={FLOOR[1]} r="150">
          <stop offset="0" style={{ stopColor: glow, stopOpacity: 0.18 }} />
          <stop offset="1" style={{ stopColor: glow, stopOpacity: 0 }} />
        </radialGradient>
        <filter id="gr-blur-l" x="-100%" y="-10%" width="300%" height="120%">
          <feGaussianBlur stdDeviation="30" />
        </filter>
      </defs>

      {/* the panel */}
      <path className="mn-panel side:[mask:url(#gr-thin)]" d={PANEL} style={{ fill: 'var(--panel-fill)' }} />
      {/* the ribbon's warm light, spilling into the panel only */}
      <g className="mn-light" clipPath="url(#gr-panel)">
        <path d={LINE_EDGE} fill="none" strokeWidth="180" filter="url(#gr-blur-l)" style={{ stroke: 'url(#gr-spill)' }} />
      </g>
      <ellipse className="mn-light" cx={FLOOR[0]} cy={FLOOR[1]} rx="170" ry="80" style={{ fill: 'url(#gr-floor)' }} />
      <path className="mn-light hidden side:inline" d={GLASS} style={{ fill: 'url(#gr-glass)' }} />
      {/* the curl's faint edge */}
      <path className="mn-line hidden side:inline" d={LINE_CURL} fill="none" strokeWidth="1.3" style={{ stroke: 'var(--ribbon-champagne)', strokeOpacity: 0.24 }} />

      {/* the ribbon: fortune1 (soft glow where it leaves the screen) under fortune2 (richer glass) */}
      <g className="mn-ribbon">
        {RIBBON_IMAGES.map((r) => (
          <image key={r.href} href={r.href} x={r.x} y="0" width={r.width} height="900" preserveAspectRatio="none" />
        ))}
      </g>
    </svg>
  )
}
