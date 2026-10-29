// Floor maps for the floor-plans tower: for each of the 100 orbit frames, which level of the tower
// every pixel shows. Run from the project root:
//
//   node tools/tower-floor-maps.mjs [renders dir] [world pass dir]
//
// The renders dir holds the Corona passes ("Fortune Day view_CMasking_Mask_object0000.tif", the
// tower in blue), the world pass dir the world positions ("..._CGeometry_WorldPosition0000.exr",
// height in blue). Both default to their folders in /public. ffmpeg must be on the PATH.
//
// Writes /public/towerframes/floors/001.png ... 100.png: 8-bit grey, half the render's size,
// cropped to the area the tower ever covers, each pixel the 1-based index of its level in
// TOWER_FLOORS (0 for anything that is not the tower), and src/components/towerFloorMaps.json
// with the crop, which the page needs to line the maps up with the frames.
import { execFile } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import sharp from 'sharp'
import { TOWER_FLOORS } from '../src/components/towerFloors.js'

const run = promisify(execFile)
const root = path.resolve(import.meta.dirname, '..')
const renders = path.resolve(process.argv[2] ?? path.join(root, 'public/fortunebuildingframes'))
const world = path.resolve(process.argv[3] ?? path.join(root, 'public/world pass'))
const outDir = path.join(root, 'public/towerframes/floors')
const metaFile = path.join(root, 'src/components/towerFloorMaps.json')

const W = 1920
const H = 1080
const N = W * H
const STEP = 2 // the maps are half the render's size
const FRAMES = 100 // 0000-0099; 0100 repeats 0000
const PARALLEL = 4

const decode = async (file, fmt) => (await run('ffmpeg', ['-v', 'error', '-i', file, '-f', 'rawvideo', '-pix_fmt', fmt, '-'], { encoding: 'buffer', maxBuffer: 1 << 28 })).stdout

const levelAt = (z) => {
  for (let k = 0; k < TOWER_FLOORS.length; k++) if (z < TOWER_FLOORS[k].z1) return k + 1
  return TOWER_FLOORS.length
}

// one frame: the level under every pixel, at half size
const frameMap = async (f) => {
  const id = String(f).padStart(4, '0')
  const [wb, mb] = await Promise.all([
    decode(path.join(world, `Fortune Day view_CGeometry_WorldPosition${id}.exr`), 'gbrapf32le'),
    decode(path.join(renders, `Fortune Day view_CMasking_Mask_object${id}.tif`), 'rgb24'),
  ])
  const z = new Float32Array(wb.buffer, wb.byteOffset + N * 4, N) // planes are G, B, R, A: B is height
  const w = W / STEP
  const h = H / STEP
  const map = new Uint8Array(w * h)
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * STEP + 1) * W + x * STEP + 1 // the centre of the 2x2 block
      const tower = mb[i * 3 + 2] > 128 && mb[i * 3] < 100 && mb[i * 3 + 1] < 100
      if (tower) map[y * w + x] = levelAt(z[i])
    }
  return map
}

const maps = new Array(FRAMES)
let next = 0
await Promise.all(
  Array.from({ length: PARALLEL }, async () => {
    while (next < FRAMES) {
      const f = next++
      maps[f] = await frameMap(f)
      process.stdout.write('.')
    }
  }),
)
console.log()

// the area the tower ever covers, over the whole orbit
const w = W / STEP
const h = H / STEP
let x0 = w
let y0 = h
let x1 = 0
let y1 = 0
for (const map of maps)
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (map[y * w + x]) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
const cw = x1 - x0 + 1
const ch = y1 - y0 + 1

mkdirSync(outDir, { recursive: true })
await Promise.all(
  maps.map((map, f) => {
    const crop = Buffer.alloc(cw * ch)
    for (let y = 0; y < ch; y++) crop.set(map.subarray((y0 + y) * w + x0, (y0 + y) * w + x0 + cw), y * cw)
    return sharp(crop, { raw: { width: cw, height: ch, channels: 1 } })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(path.join(outDir, `${String(f + 1).padStart(3, '0')}.png`))
  }),
)

// x, y, width, height in the render's own pixels (1920 x 1080); each map pixel covers step x step
const meta = { frameWidth: W, frameHeight: H, step: STEP, x: x0 * STEP, y: y0 * STEP, width: cw, height: ch, frames: FRAMES }
writeFileSync(metaFile, JSON.stringify(meta, null, 2) + '\n')
console.log('floor maps', meta)
