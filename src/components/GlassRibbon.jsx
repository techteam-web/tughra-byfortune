// The menu's glass ribbon: a dark panel whose right edge is a ribbon of lit glass that runs straight
// down and then sweeps off the bottom of the screen.
//
// Every line was traced from the reference artwork (750 px tall) and is drawn in a 420 x 900 space
// (one unit = 1/900 of the screen height) with the ribbon's bright core at x 82, so the page can
// place it with --rx. Parts, left to right:
//   CURL  a faint edge where the dark panel turns into clearer glass (top half only)
//   I     the inner, bronze edge of the ribbon
//   A     its bright core
//   B, C  its outer edge, which splits in two where the ribbon turns and shows its glossy face
import { LINE_I, LINE_A, LINE_B, LINE_C, LINE_CURL, PANEL, BODY, CORE, FACE, GLASS, FLOOR, SWEEP_I, FACE_FROM, FACE_TO } from './glassRibbonGeometry.js'

// colours: the --ribbon-* tokens (src/styles/tokens.css), sampled from the reference artwork
const peach = 'var(--ribbon-edge-in)'
const amber = 'var(--ribbon-amber)'
const shell = 'var(--ribbon-glass)'
const pale = 'var(--ribbon-edge-out)'
const apricot = 'var(--ribbon-face)'
const copper = 'var(--ribbon-copper)'
const rose = 'color-mix(in srgb, var(--ribbon-glass) 60%, var(--ribbon-copper))'
const ember = 'var(--ribbon-ember)'
const core = 'var(--ribbon-core)'
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
        {/* warm light from the ribbon, strongest in its lower half */}
        <linearGradient id="gr-spill" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="900">
          <stop offset="0" style={{ stopColor: glow, stopOpacity: 0.1 }} />
          <stop offset="0.55" style={{ stopColor: glow, stopOpacity: 0.14 }} />
          <stop offset="0.7" style={{ stopColor: glow, stopOpacity: 0.05 }} />
          <stop offset="1" style={{ stopColor: glow, stopOpacity: 0.05 }} />
        </linearGradient>
        {/* the glass between the core and the outer edge: pale at the top, amber lower down, then thinner in the sweep */}
        <linearGradient id="gr-core" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="900">
          <stop offset="0" style={{ stopColor: shell, stopOpacity: 0.45 }} />
          <stop offset="0.33" style={{ stopColor: shell, stopOpacity: 0.72 }} />
          <stop offset="0.6" style={{ stopColor: amber, stopOpacity: 0.95 }} />
          <stop offset="0.76" style={{ stopColor: amber, stopOpacity: 0.4 }} />
          <stop offset="1" style={{ stopColor: amber, stopOpacity: 0.3 }} />
        </linearGradient>
        {/* the ribbon's face where it turns: bright cream fading to gold */}
        <linearGradient id="gr-face" gradientUnits="userSpaceOnUse" x1={FACE_FROM[0]} y1={FACE_FROM[1]} x2={FACE_TO[0]} y2={FACE_TO[1]}>
          <stop offset="0" style={{ stopColor: apricot, stopOpacity: 0.85 }} />
          <stop offset="0.25" style={{ stopColor: ember, stopOpacity: 0.72 }} />
          <stop offset="0.65" style={{ stopColor: rose, stopOpacity: 0.6 }} />
          <stop offset="1" style={{ stopColor: copper, stopOpacity: 0.5 }} />
        </linearGradient>
        {/* the glass between the curl and the ribbon is lit, more so lower down */}
        <linearGradient id="gr-glass" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="500">
          <stop offset="0" style={{ stopColor: peach, stopOpacity: 0.04 }} />
          <stop offset="0.55" style={{ stopColor: peach, stopOpacity: 0.22 }} />
          <stop offset="1" style={{ stopColor: peach, stopOpacity: 0.36 }} />
        </linearGradient>
        {/* the edges: cream in the straight run, apricot then copper through the sweep */}
        <linearGradient id="gr-line-i" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="900">
          <stop offset="0" style={{ stopColor: peach, stopOpacity: 0.9 }} />
          <stop offset="0.62" style={{ stopColor: peach, stopOpacity: 0.9 }} />
          <stop offset="0.77" style={{ stopColor: ember, stopOpacity: 0 }} />
        </linearGradient>
        <linearGradient id="gr-line-a" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="900">
          <stop offset="0" style={{ stopColor: core }} />
          <stop offset="0.66" style={{ stopColor: core }} />
          <stop offset="0.78" style={{ stopColor: apricot, stopOpacity: 0.85 }} />
          <stop offset="1" style={{ stopColor: ember, stopOpacity: 0.75 }} />
        </linearGradient>
        <linearGradient id="gr-line-b" gradientUnits="userSpaceOnUse" x1="0" y1="560" x2="0" y2="920">
          <stop offset="0" style={{ stopColor: core }} />
          <stop offset="0.3" style={{ stopColor: pale }} />
          <stop offset="0.5" style={{ stopColor: apricot }} />
          <stop offset="1" style={{ stopColor: ember, stopOpacity: 0.9 }} />
        </linearGradient>
        <linearGradient id="gr-line-c" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="900">
          <stop offset="0" style={{ stopColor: pale }} />
          <stop offset="0.62" style={{ stopColor: pale }} />
          <stop offset="0.8" style={{ stopColor: ember, stopOpacity: 0.35 }} />
          <stop offset="1" style={{ stopColor: copper, stopOpacity: 0.25 }} />
        </linearGradient>
        <radialGradient id="gr-floor" gradientUnits="userSpaceOnUse" cx={FLOOR[0]} cy={FLOOR[1]} r="150">
          <stop offset="0" style={{ stopColor: glow, stopOpacity: 0.22 }} />
          <stop offset="1" style={{ stopColor: glow, stopOpacity: 0 }} />
        </radialGradient>
        {/* the glow around the bright lines, tinted --ribbon-main-gold (#E4AA7A as 0.894 0.667 0.478: filters can't read CSS variables) */}
        <filter id="gr-glow" x="-50%" y="-10%" width="200%" height="120%">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.894  0 0 0 0 0.667  0 0 0 0 0.478  0 0 0 0.75 0" result="tint" />
          <feMerge>
            <feMergeNode in="tint" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="gr-blur-l" x="-100%" y="-10%" width="300%" height="120%">
          <feGaussianBlur stdDeviation="30" />
        </filter>
        <filter id="gr-blur-s" x="-50%" y="-10%" width="200%" height="120%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id="gr-blur-m" x="-60%" y="-30%" width="220%" height="160%">
          <feGaussianBlur stdDeviation="13" />
        </filter>
      </defs>

      {/* the dark panel */}
      <path className="mn-panel side:[mask:url(#gr-thin)]" d={PANEL} style={{ fill: 'var(--panel-fill)' }} />
      {/* the ribbon's warm light, spilling into the panel only */}
      <g className="mn-light" clipPath="url(#gr-panel)">
        <path d={LINE_A} fill="none" strokeWidth="180" filter="url(#gr-blur-l)" style={{ stroke: 'url(#gr-spill)' }} />
      </g>
      <ellipse className="mn-light" cx={FLOOR[0]} cy={FLOOR[1]} rx="170" ry="80" style={{ fill: 'url(#gr-floor)' }} />
      <path className="mn-light hidden side:inline" d={GLASS} style={{ fill: 'url(#gr-glass)' }} />
      <path className="mn-light" d={SWEEP_I} fill="none" strokeWidth="22" filter="url(#gr-blur-s)" style={{ stroke: ember, strokeOpacity: 0.55 }} />
      {/* the curl's faint edge */}
      <path className="mn-line hidden side:inline" d={LINE_CURL} fill="none" strokeWidth="1.3" style={{ stroke: shell, strokeOpacity: 0.24 }} />

      {/* the glass body, its core, its glossy face */}
      <g className="mn-light">
        <path d={BODY} style={{ fill: shell, fillOpacity: 0.42 }} />
        <path d={CORE} style={{ fill: 'url(#gr-core)' }} />
        <path d={FACE} style={{ fill: 'url(#gr-face)' }} />
        <path d={LINE_A} fill="none" strokeWidth="16" filter="url(#gr-blur-s)" style={{ stroke: glow, strokeOpacity: 0.4 }} />
        <path d={LINE_A} fill="none" strokeWidth="7" filter="url(#gr-blur-s)" style={{ stroke: ember, strokeOpacity: 0.6 }} />
        <path d={LINE_B} fill="none" strokeWidth="9" filter="url(#gr-blur-s)" style={{ stroke: apricot, strokeOpacity: 0.65 }} />
      </g>

      {/* the edges */}
      <path className="mn-line" d={LINE_I} fill="none" strokeWidth="1.4" style={{ stroke: 'url(#gr-line-i)' }} />
      <path className="mn-line" d={LINE_C} fill="none" strokeWidth="1.8" style={{ stroke: 'url(#gr-line-c)' }} />
      <path className="mn-line" d={LINE_B} fill="none" strokeWidth="2.4" strokeLinecap="round" filter="url(#gr-glow)" style={{ stroke: 'url(#gr-line-b)' }} />
      <path className="mn-line" d={LINE_A} fill="none" strokeWidth="2.6" strokeLinecap="round" filter="url(#gr-glow)" style={{ stroke: 'url(#gr-line-a)' }} />
    </svg>
  )
}
