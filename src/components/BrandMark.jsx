import { useEffect, useRef, useState } from 'react'
import { cssRgb } from '../theme/tokens.js'

// Top-left brand lockup: the Tughra logo, with a small developer credit beneath. The PNG is
// brown artwork on a white background, so it is converted once in a canvas: darkness becomes
// opacity, the colour becomes the tone's token, and the empty margin is cropped away.
const TUGHRA = '/assets/logo/tughra.png'

// tone 'light' = the home page's logo, frozen as it was; 'gold' = every other page; 'dark' = on cream
const TONE = {
  light: { token: '--hero-logo', caption: 'text-[var(--hero-logo)]' },
  gold: { token: '--gold', caption: 'text-gold-pale/80' },
  pale: { token: '--gold-pale', caption: 'text-gold-pale/80' },
  dark: { token: '--ink', caption: 'text-ink' },
}

const SIZE = {
  hero: 'h-[3.25rem] md:h-[4.25rem] short:h-[2.4rem]',
  page: 'h-[2.75rem] md:h-[3.6rem] short:h-[2.1rem]',
  crown: 'h-[3.4rem] md:h-[4.6rem] short:h-[2.3rem]',
  seal: 'h-[2.6rem] side:h-[2.9rem] short:h-[2rem]',
}

const cache = {}

const SEAL_CUT = 0.605

// The artwork is hairline-thin. Drawn at the size the lockup actually occupies, a stroke covers
// well under a pixel, so whatever sits behind it - the hero's blue sky - bleeds through and the
// white mark reads blue. So it is rasterised at exactly the pixels it will take up, and the
// coverage is then lifted, so a thin stroke still prints as white rather than as a wash of sky.
// The mark is grown at this multiple of its final size, so a stroke gains a quarter of a
// finished pixel on each side: enough to carry a hairline, not enough to close up the seal.
const SUPER = 4
// how hard the coverage left after that is pushed back towards full tone
const SOLIDITY = 3

function tintedLogo(src, tone, sealOnly = false, targetH = 0) {
  const key = src + tone + (sealOnly ? ':seal' : '') + ':' + targetH
  if (cache[key]) return cache[key]
  cache[key] = new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const tint = cssRgb(TONE[tone].token)
      const scale = 900 / img.naturalWidth
      const w = Math.round(img.naturalWidth * scale)
      const h = Math.round(img.naturalHeight * scale)
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const ctx = c.getContext('2d', { willReadFrequently: true })
      ctx.drawImage(img, 0, 0, w, h)
      const data = ctx.getImageData(0, 0, w, h)
      const px = data.data
      let minX = w, minY = h, maxX = 0, maxY = 0
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4
          const lum = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]
          const a = sealOnly && y > h * SEAL_CUT ? 0 : Math.min(255, (255 - lum) * 1.6) * (px[i + 3] / 255)
          px[i] = tint[0]
          px[i + 1] = tint[1]
          px[i + 2] = tint[2]
          px[i + 3] = a
          if (a > 24) {
            if (x < minX) minX = x
            if (x > maxX) maxX = x
            if (y < minY) minY = y
            if (y > maxY) maxY = y
          }
        }
      }
      ctx.putImageData(data, 0, 0)
      const cw = maxX - minX + 1
      const ch = maxY - minY + 1
      const out = document.createElement('canvas')
      out.width = cw
      out.height = ch
      out.getContext('2d').drawImage(c, minX, minY, cw, ch, 0, 0, cw, ch)

      const ratio = cw / ch
      if (!targetH || targetH >= ch) {
        resolve({ url: out.toDataURL('image/png'), ratio })
        return
      }

      // down to the exact pixels it is drawn at, then the coverage lifted back to full tone
      const fh = Math.max(1, Math.round(targetH))
      const fw = Math.max(1, Math.round(fh * ratio))

      // First a working copy a few times the final size, where every stroke is grown by one of
      // those pixels, so that no line ends up thinner than the pixel it has to print on and
      // left half sky - while the growth stays small enough not to clog the seal.
      const mw = fw * SUPER
      const mh = fh * SUPER
      const mid = document.createElement('canvas')
      mid.width = mw
      mid.height = mh
      const mctx = mid.getContext('2d', { willReadFrequently: true })
      mctx.imageSmoothingEnabled = true
      mctx.imageSmoothingQuality = 'high'
      mctx.drawImage(out, 0, 0, mw, mh)
      const md = mctx.getImageData(0, 0, mw, mh)
      const mpx = md.data
      const n = mw * mh
      const src0 = new Uint8ClampedArray(n)
      const row = new Uint8ClampedArray(n)
      for (let j = 0; j < n; j++) src0[j] = mpx[j * 4 + 3]
      for (let y = 0; y < mh; y++) {
        const o = y * mw
        for (let x = 0; x < mw; x++) {
          const j = o + x
          let v = src0[j]
          if (x > 0 && src0[j - 1] > v) v = src0[j - 1]
          if (x < mw - 1 && src0[j + 1] > v) v = src0[j + 1]
          row[j] = v
        }
      }
      for (let y = 0; y < mh; y++) {
        const o = y * mw
        for (let x = 0; x < mw; x++) {
          const j = o + x
          let v = row[j]
          if (y > 0 && row[j - mw] > v) v = row[j - mw]
          if (y < mh - 1 && row[j + mw] > v) v = row[j + mw]
          mpx[j * 4] = tint[0]
          mpx[j * 4 + 1] = tint[1]
          mpx[j * 4 + 2] = tint[2]
          mpx[j * 4 + 3] = v
        }
      }
      mctx.putImageData(md, 0, 0)

      const fin = document.createElement('canvas')
      fin.width = fw
      fin.height = fh
      const fctx = fin.getContext('2d', { willReadFrequently: true })
      fctx.imageSmoothingEnabled = true
      fctx.imageSmoothingQuality = 'high'
      fctx.drawImage(mid, 0, 0, fw, fh)
      const fd = fctx.getImageData(0, 0, fw, fh)
      const fpx = fd.data
      for (let i = 0; i < fpx.length; i += 4) {
        fpx[i] = tint[0]
        fpx[i + 1] = tint[1]
        fpx[i + 2] = tint[2]
        fpx[i + 3] = Math.round(255 * (1 - Math.pow(1 - fpx[i + 3] / 255, SOLIDITY)))
      }
      fctx.putImageData(fd, 0, 0)
      resolve({ url: fin.toDataURL('image/png'), ratio })
    }
    img.onerror = reject
    img.src = src
  })
  return cache[key]
}

function BrandMark({ tone = 'light', size = 'hero', credit = true, seal = false }) {
  const boxRef = useRef(null)
  const [logo, setLogo] = useState(null)
  // the height the mark is actually drawn at, in device pixels
  const [px, setPx] = useState(0)

  useEffect(() => {
    const box = boxRef.current
    if (!box) return undefined
    const read = () => {
      const h = box.getBoundingClientRect().height
      if (h) setPx(Math.round(h * (window.devicePixelRatio || 1)))
    }
    read()
    const ro = new ResizeObserver(read)
    ro.observe(box)
    window.addEventListener('resize', read)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', read)
    }
  }, [])

  useEffect(() => {
    if (!px) return undefined
    let live = true
    tintedLogo(TUGHRA, tone, seal, px).then((l) => live && setLogo(l), () => {})
    return () => {
      live = false
    }
  }, [tone, seal, px])

  return (
    <span className="flex flex-col items-center gap-1">
      <span className="flex items-end">
        <span ref={boxRef} className={`block ${SIZE[size]}`} style={{ aspectRatio: logo ? logo.ratio : 0.75 }}>
          {logo && <img src={logo.url} alt={seal ? '' : 'Tughra Royale'} className="h-full w-full object-contain" draggable={false} />}
        </span>
      </span>
      {credit && (
        <span className={`block text-center text-[0.5rem] uppercase tracking-[0.12rem] ${TONE[tone].caption} md:text-[0.5625rem] short:hidden`}>
          An Initiative by Fortune Square
        </span>
      )}
    </span>
  )
}

export default BrandMark
