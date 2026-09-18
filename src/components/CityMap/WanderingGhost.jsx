import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

function rand(min, max) {
  return min + Math.random() * (max - min)
}

// Стартовые точки — разбросаны по краям карты, откуда призраки «приходят»
const SPAWN_ZONES = [
  { x: [4, 20],  y: [10, 35] },  // верхний левый
  { x: [75, 94], y: [8, 30]  },  // верхний правый
  { x: [4, 18],  y: [60, 88] },  // нижний левый
  { x: [78, 94], y: [62, 90] },  // нижний правый
  { x: [35, 65], y: [5, 18]  },  // верхний центр
  { x: [35, 65], y: [82, 95] },  // нижний центр
]

function spawnPoint(index) {
  const zone = SPAWN_ZONES[index % SPAWN_ZONES.length]
  return { x: rand(...zone.x), y: rand(...zone.y) }
}

function nextWaypoint() {
  return { x: rand(8, 88), y: rand(10, 88) }
}

export default function WanderingGhost({ ghost, index }) {
  const [pos,  setPos]  = useState(() => spawnPoint(index))
  const [flip, setFlip] = useState(false)
  const [dur,  setDur]  = useState(() => rand(15, 26))

  useEffect(() => {
    const t = setTimeout(() => {
      setPos(prev => {
        const next = nextWaypoint()
        setFlip(next.x < prev.x)
        setDur(rand(16, 28))
        return next
      })
    }, dur * 1000)
    return () => clearTimeout(t)
  }, [pos, dur])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        left:    `${pos.x}%`,
        top:     `${pos.y}%`,
        opacity: 0.82,
      }}
      transition={{
        left:    { duration: dur, ease: 'easeInOut' },
        top:     { duration: dur, ease: 'easeInOut' },
        opacity: { duration: 2, delay: index * 0.65 },
      }}
      style={{
        position:      'absolute',
        marginLeft:    -14,
        marginTop:     -14,
        pointerEvents: 'none',
        zIndex:        4,
      }}
    >
      {/* Боб-контейнер (плавание вверх-вниз) */}
      <div
        className="ghost-wander-bob"
        style={{
          animation:      `ghost-bob 3.6s ease-in-out infinite`,
          animationDelay: `${index * 0.7 + rand(0, 1.2)}s`,
        }}
      >
        <img
          src={`/images/g_${ghost.id}.png`}
          alt=""
          draggable={false}
          style={{
            width:      28,
            height:     28,
            objectFit:  'contain',
            transform:  flip ? 'scaleX(-1)' : 'scaleX(1)',
            transition: 'transform 0.4s ease',
            filter:
              'drop-shadow(0 2px 6px rgba(139,92,246,0.7)) ' +
              'drop-shadow(0 0 10px rgba(201,168,76,0.25))',
          }}
        />
      </div>
    </motion.div>
  )
}
