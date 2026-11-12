// JS mirror of src/styles/tokens.css, for the places CSS variables can't reach:
// MapLibre paint properties and canvas tinting. Keep the two files in step.
export const T = {
  espresso: '#1C130D',
  cocoa: '#2A1C12',
  bronze: '#B5763C',
  bronzeDeep: '#8E5A2B',
  gold: '#D9AE62',
  goldPale: '#E9CF9A',
  cream: '#F2E9D8',
  parchment: '#E6D9C2',
  ink: '#2A1C12',
}

// A colour as [r, g, b]. It has to take whatever a stylesheet hands back, not just the
// six-digit hex these tokens are written in: the build minifies #ffffff to #fff, and a
// browser may return a colour as rgb(...) - read either as six digits and white came back
// blue, which is how the Tughra mark on the home page turned blue once built.
const rgb = (colour) => {
  const s = String(colour).trim()
  if (s[0] === '#') {
    const h = s.slice(1)
    const six = h.length < 6 ? h.slice(0, 3).replace(/./g, (d) => d + d) : h.slice(0, 6)
    const n = parseInt(six, 16)
    return Number.isNaN(n) ? [255, 255, 255] : [n >> 16, (n >> 8) & 255, n & 255]
  }
  const parts = s.match(/[\d.]+%?/g)
  if (parts && parts.length >= 3) {
    return parts.slice(0, 3).map((v) => {
      const f = parseFloat(v)
      return Math.max(0, Math.min(255, Math.round(v.endsWith('%') ? (f * 255) / 100 : f)))
    })
  }
  return [255, 255, 255]
}

// a token at an opacity, as an rgba() string
export const alpha = (hex, a) => `rgba(${rgb(hex).join(',')},${a})`

// `t` of token a over token b, as a hex string (for derived map shades)
export const mix = (a, b, t) => {
  const pa = rgb(a)
  const pb = rgb(b)
  return '#' + pa.map((v, i) => Math.round(v * t + pb[i] * (1 - t)).toString(16).padStart(2, '0')).join('')
}

// read a token straight from the stylesheet as [r, g, b] (canvas tinting)
export const cssRgb = (name) => rgb(getComputedStyle(document.documentElement).getPropertyValue(name).trim())
