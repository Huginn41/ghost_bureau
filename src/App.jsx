import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStorage } from './hooks/useStorage'
import { initialGhosts } from './data/ghosts'
import { initialLocations } from './data/locations'
import CityMap from './components/CityMap/CityMap'
import GhostList from './components/Ghosts/GhostList'
import CardFlipModal from './components/Ghosts/CardFlipModal'
import Report from './components/Report/Report'
import Worklog from './components/Worklog/Worklog'

const TABS = [
  { id: 'map',     label: 'Город',   icon: '🗺️' },
  { id: 'ghosts',  label: 'Заявки',  icon: '👻' },
  { id: 'report',  label: 'Отчёт',   icon: '📊' },
  { id: 'worklog', label: 'Дневник',  icon: '📜' },
]

export default function App() {
  const [tab, setTab] = useState('map')
  const [flippedGhost, setFlippedGhost] = useState(null)
  const [showReset, setShowReset] = useState(false)
  const [ghosts, setGhosts, resetGhosts] = useStorage('ghosts', initialGhosts)
  const [locations, setLocations, resetLocations] = useStorage('locations', initialLocations)
  const [assignments, setAssignments, resetAssignments] = useStorage('assignments', [])

  const pendingCount = ghosts.filter(g => g.status === 'pending').length
  const placedCount  = ghosts.filter(g => g.status === 'placed').length

  function handleAssign(ghost, location, result) {
    setLocations(prev =>
      prev.map(l => l.id === location.id ? { ...l, currentCount: l.currentCount + 1 } : l)
    )
    setGhosts(prev =>
      prev.map(g => g.id === ghost.id ? { ...g, status: 'placed' } : g)
    )
    setAssignments(prev => [
      ...prev.filter(a => a.ghostId !== ghost.id),
      {
        ghostId: ghost.id,
        locationId: location.id,
        isAuto: result.isAuto ?? true,
        score: result.score,
        explanation: result.explanation,
        conflicts: result.conflicts ?? [],
        status: result.conflicts?.length > 0 ? 'warning' : 'ok',
      },
    ])
  }

  function handleReset() {
    resetGhosts(); resetLocations(); resetAssignments()
    setFlippedGhost(null); setShowReset(false); setTab('map')
  }

  function handleSelectGhost(ghost) {
    setFlippedGhost(ghost)
  }

  return (
    <div className="relative flex flex-col h-svh" style={{ background: 'var(--bg-base)' }}>

      {/* ── Плавающая шапка (только на вкладке карты) ───────────── */}
      <div className="fixed top-3 left-0 right-0 z-50 flex justify-center items-start pointer-events-none" style={{ display: tab === 'map' ? 'flex' : 'none' }}>

        {/* Табличка с названием */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26, delay: 0.1 }}
          className="relative pointer-events-auto"
          style={{ width: 'clamp(231px, 57.75vw, 357px)' }}
        >
          <img
            src="/images/buro_place.png"
            alt=""
            draggable={false}
            className="w-full select-none"
            style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.7))' }}
          />
          {/* Текст поверх таблички */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ padding: '14% 20% 14% 20%' }}
          >
            <h1
              style={{
                fontFamily: 'Philosopher, serif',
                fontSize: 'clamp(0.75rem, 2.4vw, 1rem)',
                fontWeight: 700,
                color: '#1c0d03',
                letterSpacing: '0.03em',
                textAlign: 'center',
                lineHeight: 1,
                userSelect: 'none',
                width: '100%',
              }}
            >
              Бюро переселения привидений
            </h1>
          </div>
        </motion.div>

        {/* Кнопка сброса — справа */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => setShowReset(true)}
          aria-label="Сбросить данные"
          className="absolute right-3 top-0 pointer-events-auto flex items-center justify-center rounded-xl transition-all"
          style={{
            width: 38, height: 38,
            background: 'rgba(10,10,28,0.88)',
            border: '1px solid rgba(201,168,76,0.45)',
            backdropFilter: 'blur(14px)',
            color: 'var(--gold)',
            fontSize: '1.1rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 12px rgba(201,168,76,0.12)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(201,168,76,0.8)'
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5), 0 0 18px rgba(201,168,76,0.3)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(201,168,76,0.45)'
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5), 0 0 12px rgba(201,168,76,0.12)'
          }}
        >
          ↺
        </motion.button>
      </div>

      {/* ── Контент ───────────────────────────────────────────────── */}
      <main
        className="flex-1 overflow-hidden relative z-10"
      >
        {tab === 'map' && (
          <CityMap locations={locations} ghosts={ghosts} />
        )}
        {tab === 'ghosts' && (
          <GhostList
            ghosts={ghosts}
            locations={locations}
            assignments={assignments}
            onSelectGhost={handleSelectGhost}
          />
        )}
        {tab === 'report'  && <Report ghosts={ghosts} locations={locations} assignments={assignments} />}
        {tab === 'worklog' && <Worklog />}
      </main>

      {/* ── Парящая навигация (fixed, поверх контента) ───────────── */}
      <div className="fixed bottom-5 left-0 right-0 flex justify-center z-50 pointer-events-none">

        {/* Прогресс-полоска — отдельно, у самого низа экрана */}
        {placedCount > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-px" style={{ bottom: '-20px' }}>
            <div
              className="h-full transition-all duration-700"
              style={{ width: `${(placedCount / ghosts.length) * 100}%`, background: 'linear-gradient(90deg, var(--purple), var(--gold))' }}
            />
          </div>
        )}

        {/* Плавающая пилл-навигация */}
        <div className="relative" style={{ pointerEvents: 'auto' }}>

          {/* Дымовые орбы вокруг меню */}
          <span className="nav-smoke nav-smoke-1" aria-hidden="true" />
          <span className="nav-smoke nav-smoke-2" aria-hidden="true" />
          <span className="nav-smoke nav-smoke-3" aria-hidden="true" />

        <motion.nav
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0,  opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          role="navigation"
          aria-label="Навигация"
          className="relative flex items-center gap-1 p-1.5 rounded-full"
          style={{
            background: 'rgba(12,12,32,0.92)',
            border: '1px solid rgba(201,168,76,0.22)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.08), 0 0 30px rgba(139,92,246,0.15)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {TABS.map(t => {
            const isActive = tab === t.id
            const badge = t.id === 'ghosts' && pendingCount > 0 ? pendingCount : null

            return (
              <motion.button
                key={t.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTab(t.id)}
                aria-label={t.label}
                className="relative flex items-center rounded-full transition-colors duration-200 focus:outline-none"
                style={{
                  height: 40,
                  paddingLeft: 14,
                  paddingRight: 14,
                  color: isActive ? 'var(--gold)' : 'var(--text-muted)',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(139,92,246,0.1))'
                    : 'transparent',
                  border: isActive ? '1px solid rgba(201,168,76,0.25)' : '1px solid transparent',
                  boxShadow: isActive ? '0 0 14px rgba(201,168,76,0.15)' : 'none',
                  gap: 0,
                }}
              >
                {/* Иконка */}
                <span className="relative text-lg leading-none flex-shrink-0">
                  {t.icon}
                  {badge && (
                    <span
                      className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full text-[8px] flex items-center justify-center font-bold"
                      style={{ background: 'var(--purple)', color: '#fff' }}
                    >
                      {badge}
                    </span>
                  )}
                </span>

                {/* Лейбл — анимированная ширина */}
                <motion.span
                  initial={false}
                  animate={{
                    width: isActive ? 'auto' : 0,
                    opacity: isActive ? 1 : 0,
                    marginLeft: isActive ? 7 : 0,
                  }}
                  transition={{
                    width:      { type: 'spring', stiffness: 350, damping: 32 },
                    opacity:    { duration: 0.18 },
                    marginLeft: { duration: 0.18 },
                  }}
                  className="overflow-hidden whitespace-nowrap"
                  style={{
                    fontFamily: 'Philosopher, serif',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}
                >
                  {t.label}
                </motion.span>
              </motion.button>
            )
          })}
        </motion.nav>
        </div>{/* конец обёртки с дымом */}
      </div>

      {/* ── Модал карточки призрака (3D переворот) ───────────────── */}
      <AnimatePresence>
        {flippedGhost && (
          <CardFlipModal
            key={flippedGhost.id}
            ghost={ghosts.find(g => g.id === flippedGhost.id)}
            locations={locations}
            assignment={assignments.find(a => a.ghostId === flippedGhost.id)}
            onAssign={(ghost, location, result) => {
              handleAssign(ghost, location, result)
              setFlippedGhost(null)
            }}
            onClose={() => setFlippedGhost(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Модал сброса ──────────────────────────────────────────── */}
      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={() => setShowReset(false)}>
          <div
            className="w-full max-w-xs rounded-2xl p-6 shadow-2xl"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-gold)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">⚠️</div>
              <h3 className="font-cinzel mb-1" style={{ color: 'var(--text-primary)' }}>Сбросить данные?</h3>
              <div className="divider-gold mx-8 my-2" />
              <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                Все назначения и прогресс расселения будут удалены безвозвратно.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowReset(false)} className="btn-ghost flex-1">Отмена</button>
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
                style={{ background: 'rgba(239,68,68,0.8)', border: '1px solid rgba(239,68,68,0.4)' }}
              >
                Сбросить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
