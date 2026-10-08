import { useEffect, useState } from 'react'

// Top-left brand lockup: the Tughra logo in white, with a small developer credit beneath. The PNG is brown artwork on a white background, so it is
// converted once in a canvas: darkness becomes opacity, the colour becomes
// white, and the empty margin is cropped away.
const TUGHRA = '/assets/logo/tughra.png'

// tone 'light' = white logo for dark pages, 'dark' = deep brown logo for light pages
const TINT = { light: [255, 255, 255], dark: [92, 62, 40] }

const cache = {}

function whiteLogo(src, tone = 'light') {
  const key = src + tone
  if (cache[key]) return cache[key]
  cache[key] = new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
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
          const a = Math.min(255, (255 - lum) * 1.6) * (px[i + 3] / 255)
          px[i] = TINT[tone][0]
          px[i + 1] = TINT[tone][1]
          px[i + 2] = TINT[tone][2]
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
      resolve({ url: out.toDataURL('image/png'), ratio: cw / ch })
    }
    img.onerror = reject
    img.src = src
  })
  return cache[key]
}

function BrandMark({ tone = 'light' }) {
  const [logo, setLogo] = useState(null)

  useEffect(() => {
    let live = true
    whiteLogo(TUGHRA, tone).then((l) => live && setLogo(l), () => {})
    return () => {
      live = false
    }
  }, [tone])

  return (
    <span className="flex flex-col items-center gap-1">
      <span className="flex items-end">
        <span className="block h-[3.25rem] md:h-[4.25rem]" style={{ aspectRatio: logo ? logo.ratio : 0.75 }}>
          {logo && <img src={logo.url} alt="Tughra Royale" className="h-full w-full object-contain" draggable={false} />}
        </span>
      </span>
      <span className={`block text-center text-[0.5rem] uppercase tracking-[0.12rem] ${tone === 'dark' ? 'text-[#470d21]' : 'text-cream/80'} md:text-[0.5625rem]`}>
        An Initiative by Fortune Square
      </span>
    </span>
  )
}

export default BrandMark
