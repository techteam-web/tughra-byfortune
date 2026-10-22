import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, EASE, DUR, REDUCED } from './motion/index.js'
import Hero from './sections/Hero.jsx'
import Menu from './sections/Menu.jsx'
import Gallery from './sections/Gallery.jsx'
import FloorPlans from './sections/FloorPlans.jsx'
import Location from './sections/Location.jsx'
import Amenities from './sections/Amenities.jsx'
import ViewsPage from './components/ViewsPage.jsx'
import Enquiry from './sections/Enquiry.jsx'
import Features from './sections/Features.jsx'
import Preloader from './components/Preloader.jsx'
import FullscreenGate from './components/FullscreenGate.jsx'
import menuTower from './assets/render/menu-tower.webp'

function App() {
  // The home page's button lights up around the cursor (kept exactly as it was)
  useEffect(() => {
    const onMove = (e) => {
      const b = e.target.closest?.('.lux-btn')
      if (!b) return
      const r = b.getBoundingClientRect()
      b.style.setProperty('--mx', `${e.clientX - r.left}px`)
      b.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
    document.addEventListener('pointermove', onMove)
    return () => document.removeEventListener('pointermove', onMove)
  }, [])

  const [view, setView] = useState('hero') // what is on screen
  const [started, setStarted] = useState(false) // past the full-screen tap
  const [isLoading, setIsLoading] = useState(true)
  const curtainRef = useRef(null)
  const lineRef = useRef(null)
  const busy = useRef(false)
  const queued = useRef(null)
  const shown = useRef('hero')
  const swapped = useRef(false)

  // Every route change is the same: espresso settles over the page while a gold hairline
  // draws across, the view changes underneath, then the curtain lifts and the page reveals.
  const navigate = useCallback((next) => {
    if (busy.current) {
      queued.current = next
      return
    }
    if (next === shown.current) return
    busy.current = true
    const tl = gsap.timeline()
    tl.set(curtainRef.current, { autoAlpha: 1, opacity: 0 })
    tl.to(curtainRef.current, { opacity: 1, duration: REDUCED ? 0.15 : DUR.page * 0.55, ease: EASE.move }, 0)
    if (!REDUCED) tl.fromTo(lineRef.current, { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: DUR.page * 0.8, ease: EASE.move }, 0.05)
    tl.add(() => {
      shown.current = next
      swapped.current = true
      setView(next)
    })
  }, [])

  // the new view is in the DOM: lift the curtain
  useLayoutEffect(() => {
    if (!swapped.current) return
    swapped.current = false
    const tl = gsap.timeline({
      onComplete: () => {
        busy.current = false
        if (queued.current) {
          const q = queued.current
          queued.current = null
          navigate(q)
        }
      },
    })
    tl.to(lineRef.current, { opacity: 0, duration: 0.35, ease: EASE.soft }, 0)
    tl.to(curtainRef.current, { opacity: 0, duration: REDUCED ? 0.15 : 0.75, ease: EASE.soft }, REDUCED ? 0 : 0.1)
    tl.set(curtainRef.current, { autoAlpha: 0 })
  }, [view, navigate])

  // the menu's photograph and ribbon artwork are fetched while the intro plays, so they are there on arrival
  useEffect(() => {
    if (!started) return
    for (const src of [menuTower, '/assets/fortune1.png', '/assets/fortune2.png']) new Image().src = src
  }, [started])

  const toMenu = () => navigate('menu')
  const onEnter = useCallback(() => setStarted(true), [])
  const onLoaded = useCallback(() => setIsLoading(false), [])

  let page
  switch (view) {
    case 'menu':
      page = <Menu onClose={() => navigate('hero')} onSelect={navigate} />
      break
    case 'gallery':
      page = <Gallery onClose={toMenu} />
      break
    case 'floors':
      page = <FloorPlans onClose={toMenu} />
      break
    case 'location':
      page = <Location onClose={toMenu} />
      break
    case 'views':
      page = <ViewsPage onClose={toMenu} onHome={() => navigate('hero')} />
      break
    case 'amenities':
      page = <Amenities onClose={toMenu} />
      break
    case 'features':
      page = <Features onClose={toMenu} />
      break
    case 'enquiry':
      page = <Enquiry onClose={toMenu} />
      break
    default:
      page = <Hero ready={!isLoading} onExplore={() => navigate('menu')} />
  }

  return (
    <>
      <div key={view} className={`app-view ${view === 'hero' ? 'is-hero' : ''}`}>
        {page}
      </div>

      {/* route curtain */}
      <div ref={curtainRef} className="pointer-events-none fixed inset-0 z-[150] bg-espresso" style={{ visibility: 'hidden', opacity: 0 }} aria-hidden="true">
        <span ref={lineRef} className="tr-hair is-gold absolute inset-x-0 top-1/2 origin-center opacity-0" />
      </div>

      {isLoading && <Preloader play={started} onComplete={onLoaded} />}
      <FullscreenGate onEnter={onEnter} />
    </>
  )
}

export default App
