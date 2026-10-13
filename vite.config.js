import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { readFileSync } from 'node:fs'

// MapLibre loads its web worker from "maplibre-gl-worker.mjs" next to the script
// that imports it. The bundler never copies that file (or the shared chunk it
// imports) into dist/, so in production the worker 404s and the map never starts.
// Ship both ourselves; Location.jsx points MapLibre at them via setWorkerUrl().
function maplibreWorker() {
  const dist = new URL('./node_modules/maplibre-gl/dist/', import.meta.url)
  return {
    name: 'maplibre-worker',
    apply: 'build',
    generateBundle() {
      for (const file of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) {
        this.emitFile({ type: 'asset', fileName: `maplibre/${file}`, source: readFileSync(new URL(file, dist)) })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    maplibreWorker(),
  ],
  optimizeDeps: {
    exclude: ['maplibre-gl'],
  },
})
