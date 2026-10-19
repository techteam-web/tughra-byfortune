import { useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Flip } from 'gsap/Flip'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'

// One motion language for the whole app: slow, weighted, silk-like.
// Nothing bounces, springs, spins or flashes. Transform and opacity only,
// except the heading mask (a clip-path on short lines of type).
gsap.registerPlugin(ScrollTrigger, Flip, DrawSVGPlugin)

export { gsap, ScrollTrigger, Flip }

export const REDUCED = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const EASE = {
  enter: 'power3.out', // entrances
  soft: 'power2.out', // fades, small rises
  move: 'power2.inOut', // transitions, glides, lines drawing
}

export const DUR = {
  page: 1, // route curtain
  panel: 0.8, // panels opening
  reveal: 0.6, // element reveals
  glide: 0.55, // indicators gliding
  micro: 0.25, // hover / press
}

// When the curtain lifts, pages start their own entrance this far in
export const PAGE_IN = 0.25

gsap.defaults({ ease: EASE.enter, duration: DUR.reveal })

// Reduced motion: every reveal becomes a short fade, nothing travels.
const tw = (targets, from, to) => {
  if (REDUCED) {
    const { delay, stagger } = to
    return gsap.fromTo(targets, { opacity: 0 }, { opacity: 1, duration: 0.2, delay, stagger: stagger ? 0.02 : 0, overwrite: 'auto' })
  }
  return gsap.fromTo(targets, from, { overwrite: 'auto', ...to })
}

export const fx = {
  // headings: a soft mask wipes up while the line rises 18px
  heading: (t, o = {}) =>
    tw(
      t,
      { opacity: 0, y: 18, clipPath: 'inset(0% 0% 100% 0%)' },
      { opacity: 1, y: 0, clipPath: 'inset(0% 0% -20% 0%)', duration: 0.8, ease: EASE.enter, clearProps: 'clipPath', ...o },
    ),
  // paragraphs, labels, cards: fade with a slight rise
  fade: (t, o = {}) => tw(t, { opacity: 0, y: o.y ?? 14 }, { opacity: 1, y: 0, duration: DUR.reveal, ease: EASE.soft, ...without(o, 'y') }),
  // plain fade, no travel
  show: (t, o = {}) => tw(t, { opacity: 0 }, { opacity: 1, duration: DUR.reveal, ease: EASE.soft, ...o }),
  // bronze hairlines drawing on
  line: (t, o = {}) => tw(t, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: EASE.move, ...o }),
  lineY: (t, o = {}) => tw(t, { scaleY: 0 }, { scaleY: 1, duration: 1, ease: EASE.move, ...o }),
  // corner marks landing
  corners: (t, o = {}) => tw(t, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.7, ease: EASE.enter, stagger: 0.05, ...o }),
  // svg strokes drawing on
  draw: (t, o = {}) => tw(t, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.1, ease: EASE.move, ...o }),
  // panels opening: a measured scale-and-fade
  panel: (t, o = {}) => tw(t, { opacity: 0, scale: 0.985, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: DUR.panel, ease: EASE.soft, ...o }),
}

function without(o, key) {
  const c = { ...o }
  delete c[key]
  return c
}

// Reveal items as they scroll into view, once. `scroller` is the element that scrolls.
export function revealOnScroll(targets, { scroller, stagger = 0.08, y = 16, start = 'top 94%' } = {}) {
  const els = gsap.utils.toArray(targets)
  if (!els.length) return
  if (REDUCED) {
    gsap.set(els, { opacity: 1 })
    return
  }
  gsap.set(els, { opacity: 0, y })
  ScrollTrigger.batch(els, {
    scroller,
    start,
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: DUR.reveal, ease: EASE.soft, stagger, overwrite: 'auto' }),
  })
}

// Glide an indicator element onto a target element (both inside the same positioned parent).
export function glideTo(indicator, target, { axis = 'both', immediate = false, size = true } = {}) {
  if (!indicator || !target) return
  const vars = {}
  if (axis !== 'y') vars.x = target.offsetLeft
  if (axis !== 'x') vars.y = target.offsetTop
  if (size) {
    vars.width = target.offsetWidth
    vars.height = target.offsetHeight
  }
  if (immediate || REDUCED) gsap.set(indicator, vars)
  else gsap.to(indicator, { ...vars, duration: DUR.glide, ease: EASE.enter, overwrite: 'auto' })
}

// gsap.context bound to a scope element; everything inside is reverted (and its
// ScrollTriggers killed) on unmount or when deps change.
export function useGsap(scopeRef, fn, deps = []) {
  useLayoutEffect(() => {
    const ctx = gsap.context(() => fn({ reduced: REDUCED }), scopeRef.current || undefined)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
