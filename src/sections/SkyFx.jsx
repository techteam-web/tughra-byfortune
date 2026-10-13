// Birds you actually see over Mumbai — house crows, rock pigeons and black
// kites — crossing the sky above the map. Pure CSS transforms; nothing here
// touches the map.

// Only small birds, in black and white. sp: 'black' | 'white'. y: height on
// screen (%), size: px, dur: s per crossing, delay: s before the first pass.
// Generated with fixed arithmetic (no randomness) so the layout is stable.
const FLIGHTS = Array.from({ length: 16 }, (_, i) => ({
  sp: i % 2 ? 'white' : 'black',
  y: 6 + ((i * 37) % 26),
  size: 8 + ((i * 5) % 5),
  dur: 24 + ((i * 7) % 14),
  delay: 1 + i * 1.7,
  rev: i % 5 === 4,
}))

// Distant silhouettes, drawn facing right; reversed flights are mirrored in CSS.
// Kites hold their long wings out and glide; crows and pigeons flap.
function Bird({ sp, size }) {
  const kite = sp === 'kite'
  return (
    <svg className={`sky-bird sp-${sp}`} width={size} height={size * 0.5} viewBox="0 0 40 20" aria-hidden="true">
      {kite ? (
        <>
          <path className="tail" d="M14 11 L4 8 L7 11.5 L4 15 Z" />
          <path className="wing wing-l" d="M20 11 C15 6 8 4 0 7 C8 6.6 13 9 20 12 Z" />
          <path className="wing wing-r" d="M20 11 C25 6 32 4 40 7 C32 6.6 27 9 20 12 Z" />
        </>
      ) : (
        <>
          <path className="tail" d="M15 11 L9 9.6 L9 13 Z" />
          <path className="wing wing-l" d="M20 11 C16 4 9 3 4 6 C10 6 15 9 20 12 Z" />
          <path className="wing wing-r" d="M20 11 C24 4 31 3 36 6 C30 6 25 9 20 12 Z" />
        </>
      )}
      <ellipse className="body" cx="20.5" cy="11.6" rx={kite ? 7 : 6} ry="2.2" />
      <circle className="body" cx="27" cy="11" r="1.9" />
    </svg>
  )
}

export default function SkyFx({ open }) {
  return (
    <div className={`sky-fx pointer-events-none absolute inset-0 z-[5] overflow-hidden ${open ? 'is-open' : ''}`} aria-hidden="true">
      {FLIGHTS.map((b, i) => (
        <span
          key={i}
          className={`sky-flight ${b.sp} ${b.rev ? 'rev' : ''}`}
          style={{ top: `${b.y}%`, '--dur': `${b.dur}s`, '--delay': `${b.delay}s` }}
        >
          <Bird sp={b.sp} size={b.size} />
        </span>
      ))}
    </div>
  )
}
