import { useState } from 'react'
import { AnimatePresence, MotionConfig } from 'framer-motion'
import Inner from './components/Inner.jsx'
import Hero from './sections/Hero.jsx'
import Menu from './sections/Menu.jsx'
import Gallery from './sections/Gallery.jsx'
import FloorPlans from './sections/FloorPlans.jsx'
import Location from './sections/Location.jsx'

function App() {
  const [view, setView] = useState('hero')

  return (
    <MotionConfig reducedMotion="never">
      <AnimatePresence mode="wait">
        {view === 'hero' && (
          <Inner key="hero">
            <Hero onExplore={() => setView('menu')} />
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
      </AnimatePresence>
    </MotionConfig>
  )
}

export default App
