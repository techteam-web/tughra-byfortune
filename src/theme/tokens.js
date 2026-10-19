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

const rgb = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  return [n >> 16, (n >> 8) & 255, n & 255]
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
