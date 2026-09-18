import { useState, useRef, useEffect } from 'react'
import LocationPin from './LocationPin'
import LocationPopup from './LocationPopup'
import WanderingGhost from './WanderingGhost'

export default function CityMap({ locations, ghosts = [] }) {
  const pending = ghosts.filter(g => g.status === 'pending')
  const [selected, setSelected] = useState(null)
  const mobileScrollRef = useRef(null)

  useEffect(() => {
    if (mobileScrollRef.current) {
      const el = mobileScrollRef.current
      el.scrollLeft = Math.max(0, (1280 - el.offsetWidth) / 2)
    }
  }, [])

  return (
    <div className="h-full">
      {/* Десктоп — карта на весь экран */}
      <div className="hidden md:block relative w-full h-full overflow-hidden">
        <img
          src="/images/city-map.webp"
          alt="Карта города"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-indigo-950/20" />
        {pending.map((ghost, i) => (
          <WanderingGhost key={ghost.id} ghost={ghost} index={i} />
        ))}
        {locations.map(loc => (
          <LocationPin key={loc.id} location={loc} onClick={setSelected} />
        ))}
      </div>

      {/* Мобильный — панорамируемая карта (свайп пальцем) */}
      <div
        ref={mobileScrollRef}
        className="md:hidden w-full h-full overflow-auto"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="relative" style={{ width: '1280px', height: '720px' }}>
          <img
            src="/images/city-map.webp"
            alt="Карта города"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-indigo-950/20" />
          {pending.map((ghost, i) => (
            <WanderingGhost key={ghost.id} ghost={ghost} index={i} />
          ))}
          {locations.map(loc => (
            <LocationPin
              key={loc.id}
              location={{
                ...loc,
                xPercent: loc.xPercentMobile ?? loc.xPercent,
                yPercent: loc.yPercentMobile ?? loc.yPercent,
              }}
              onClick={setSelected}
            />
          ))}
        </div>
      </div>

      {selected && <LocationPopup location={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
