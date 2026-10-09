import { useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig } from 'framer-motion'
import Inner from './components/Inner.jsx'
import Hero from './sections/Hero.jsx'
import Menu from './sections/Menu.jsx'
import Gallery from './sections/Gallery.jsx'
import FloorPlans from './sections/FloorPlans.jsx'
import Location from './sections/Location.jsx'
import Amenities from './sections/Amenities.jsx'
import ViewsPage from './components/ViewsPage.jsx'
import Enquiry from './sections/Enquiry.jsx'
import Preloader from './components/Preloader.jsx'

function App() {
  // lets every .lux-btn light up around the cursor
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

  const [view, setView] = useState('hero')
  const [isLoading, setIsLoading] = useState(true)

  return (
    
    <MotionConfig reducedMotion="never">
      {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
      <AnimatePresence mode="wait">
        {view === 'hero' && (
          <Inner key="hero">
            <Hero ready={!isLoading} onExplore={() => setView('menu')} />
          </Inner>
        )}
        {view === 'menu' && (
          <Inner key="menu">
            <Menu onClose={() => setView('hero')} onSelect={(key) => setView(key)} />
          </Inner>
        )}
        {view === 'gallery' && (
          <Inner key="gallery">
            <Gallery onClose={() => setView('menu')} />
          </Inner>
        )}
        {view === 'floors' && (
          <Inner key="floors">
            <FloorPlans onClose={() => setView('menu')} />
          </Inner>
        )}
        {view === 'location' && (
          <Inner key="location">
            <Location onClose={() => setView('menu')} />
          </Inner>
        )}
        {view === 'views' && (
          <Inner key="views">
            <ViewsPage onClose={() => setView('menu')} onHome={() => setView('hero')} />
          </Inner>
        )}
        {view === 'amenities' && (
          <Inner key="amenities">
            <Amenities onClose={() => setView("menu")} onNavigate={(k) => setView(k)} />
          </Inner>
        )}
        {view === 'enquiry' && (
          <Inner key="enquiry">
            <Enquiry onClose={() => setView('menu')} />
          </Inner>
        )}
      </AnimatePresence>


    </MotionConfig>
  )
}

export default App
