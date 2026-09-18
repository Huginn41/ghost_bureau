import { useState } from 'react'
import { motion } from 'framer-motion'
import { findBestLocation } from '../../logic/matcher'
import AssignModal from '../Assignment/AssignModal'

const GHOST_IMG = {
  1: '/images/g_1.png', 2: '/images/g_2.png', 3: '/images/g_3.png',
  4: '/images/g_4.png', 5: '/images/g_5.png', 6: '/images/g_6.png',
}
const TEMP_LABEL = { cold: 'Холод', warm: 'Тепло', any: 'Любая' }
const REQ_LABELS = [
  ['needsAttic',    '🪜', 'Чердак'],
  ['fearsMirrors',  '🪞', 'Зеркала'],
  ['noHumans',      '🧍', 'Без людей'],
  ['needsDampness', '💧', 'Сырость'],
  ['needsDarkness', '🌑', 'Темнота'],
  ['noOtherGhosts', '👻', 'Уединение'],
  ['needsSilence',  '🔇', 'Тишина'],
]

export default function CardFlipModal({ ghost, locations, assignment, onAssign, onClose }) {
  const [showManual, setShowManual] = useState(false)

  const match = findBestLocation(ghost, locations)
  const bestLocation = locations.find(l => l.id === match.locationId)
  const assignedLocation = assignment ? locations.find(l => l.id === assignment.locationId) : null
  const deadline = new Date(ghost.deadline)
  const isOverdue = deadline < new Date()
  const daysLeft = Math.ceil((deadline - new Date()) / 86400000)
  const reqList = REQ_LABELS.filter(([key]) => ghost.requirements[key])

  function handleAutoAssign() {
    if (match.status !== 'ok') return
    onAssign(ghost, bestLocation, { isAuto: true, score: match.score, explanation: match.explanation, conflicts: [] })
  }

  return (
    <>
      {/* ── Фон (затемнение + blur) ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.28 }}
        className="fixed inset-0 z-[60]"
        style={{
          background: 'rgba(3,3,14,0.88)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
        onClick={onClose}
      />

      {/* ── Карточка (3D flip) ───────────────────────────────────── */}
      <div
        className="fixed inset-0 z-[61] flex items-center justify-center p-4"
        style={{ perspective: '1400px', pointerEvents: 'none' }}
      >
        <motion.div
          initial={{ rotateY: -90, scale: 0.72 }}
          animate={{ rotateY: 0,   scale: 1 }}
          exit={{   rotateY:  90, scale: 0.72, opacity: 0 }}
          transition={{
            rotateY: { type: 'spring', stiffness: 180, damping: 22 },
            scale:   { type: 'spring', stiffness: 180, damping: 22 },
            opacity: { duration: 0.18 },
          }}
          style={{
            width: 'clamp(280px, 88vw, 334px)',
            borderRadius: 18,
            overflow: 'hidden',
            pointerEvents: 'auto',
            position: 'relative',
            boxShadow:
              '0 40px 100px rgba(0,0,0,0.92), 0 0 0 1.5px rgba(201,168,76,0.32), 0 0 70px rgba(201,168,76,0.12)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Фоновое изображение карты */}
          <img
            src="/images/card_back.jpeg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            draggable={false}
          />

          {/* Полупрозрачный градиент поверх фона для читаемости */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, rgba(4,4,20,0.52) 0%, rgba(4,4,20,0.28) 35%, rgba(4,4,20,0.56) 65%, rgba(4,4,20,0.84) 100%)',
            }}
          />

          {/* ── Контент ────────────────────────────────────────────── */}
          <div className="relative flex flex-col" style={{ minHeight: 478, padding: '18px 18px 16px' }}>

            {/* Кнопка закрыть */}
            <button
              onClick={onClose}
              aria-label="Закрыть"
              className="absolute top-3 right-3 flex items-center justify-center rounded-full text-base leading-none transition-colors"
              style={{
                width: 28, height: 28,
                background: 'rgba(8,8,26,0.82)',
                border: '1px solid rgba(201,168,76,0.28)',
                color: 'rgba(232,224,212,0.5)',
                zIndex: 2,
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(232,224,212,0.5)'}
            >
              ×
            </button>

            {/* ── Портрет ── */}
            <div className="flex justify-center mt-2 mb-3">
              <div
                className="rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
                style={{
                  width: 96, height: 96,
                  background: 'rgba(8,8,26,0.72)',
                  border: '2px solid rgba(201,168,76,0.55)',
                  boxShadow: '0 0 24px rgba(201,168,76,0.18)',
                }}
              >
                {GHOST_IMG[ghost.id] ? (
                  <img src={GHOST_IMG[ghost.id]} alt={ghost.name} className="w-full h-full object-contain" />
                ) : (
                  <span style={{ fontSize: '2.5rem' }}>👻</span>
                )}
              </div>
            </div>

            {/* ── Имя + возраст ── */}
            <div className="text-center mb-2">
              <h2
                style={{
                  fontFamily: 'Philosopher, serif',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: 'var(--gold)',
                  letterSpacing: '0.04em',
                  lineHeight: 1.25,
                  textShadow: '0 0 16px rgba(201,168,76,0.45)',
                  textWrap: 'balance',
                }}
              >
                {ghost.name}
              </h2>
              <p style={{ fontSize: '0.62rem', color: 'rgba(232,224,212,0.45)', marginTop: 3 }}>
                {ghost.age} лет от роду
              </p>
            </div>

            {/* ── Дедлайн ── */}
            <div className="flex justify-center mb-3">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5"
                style={{
                  fontSize: '0.62rem',
                  background: isOverdue
                    ? 'rgba(248,113,113,0.14)'
                    : daysLeft <= 14
                    ? 'rgba(251,191,36,0.12)'
                    : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${isOverdue ? 'rgba(248,113,113,0.38)' : daysLeft <= 14 ? 'rgba(251,191,36,0.38)' : 'rgba(255,255,255,0.14)'}`,
                  color: isOverdue ? '#f87171' : daysLeft <= 14 ? '#fbbf24' : 'rgba(232,224,212,0.52)',
                }}
              >
                📅{' '}
                {isOverdue
                  ? `Просрочен (${Math.abs(daysLeft)} дн.)`
                  : `${daysLeft} дн. до срока`}
              </span>
            </div>

            {/* ── Разделитель ── */}
            <div className="divider-gold mb-3" style={{ opacity: 0.45 }} />

            {/* ── Требования ── */}
            {reqList.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-center mb-3">
                {reqList.map(([key, emoji, label]) => (
                  <span
                    key={key}
                    className="stamp"
                    style={{
                      background: 'rgba(139,92,246,0.16)',
                      border: '1px solid rgba(139,92,246,0.32)',
                      color: '#c4b5fd',
                      fontSize: '0.57rem',
                    }}
                  >
                    {emoji} {label}
                  </span>
                ))}
              </div>
            )}

            {/* ── Тревожность + Температура ── */}
            <div className="flex gap-2 mb-3">
              <div
                className="flex-1 rounded-xl p-2.5"
                style={{ background: 'rgba(8,8,26,0.62)', border: '1px solid rgba(120,100,220,0.18)' }}
              >
                <p style={{ fontSize: '0.58rem', color: 'var(--text-muted)', marginBottom: 5 }}>Тревожность</p>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${ghost.anxiety * 10}%`,
                        background: ghost.anxiety >= 8 ? 'var(--red)' : ghost.anxiety >= 5 ? 'var(--amber)' : 'var(--emerald)',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {ghost.anxiety}/10
                  </span>
                </div>
              </div>
              <div
                className="flex-1 rounded-xl p-2.5"
                style={{ background: 'rgba(8,8,26,0.62)', border: '1px solid rgba(120,100,220,0.18)' }}
              >
                <p style={{ fontSize: '0.58rem', color: 'var(--text-muted)', marginBottom: 5 }}>Температура</p>
                <p style={{ fontSize: '0.68rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {TEMP_LABEL[ghost.preferredTemp]}
                </p>
              </div>
            </div>

            {/* ── Уже расселён ── */}
            {ghost.status === 'placed' && assignedLocation && (
              <div
                className="rounded-xl p-3 mb-3"
                style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.24)' }}
              >
                <p style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--emerald)', marginBottom: 6 }}>
                  ✓ Расселён
                </p>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '1.25rem' }}>{assignedLocation.emoji}</span>
                  <div>
                    <p style={{ fontFamily: 'Philosopher, serif', fontSize: '0.72rem', color: 'var(--emerald)' }}>
                      {assignedLocation.name}
                    </p>
                    <p style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      Совместимость: <strong>{assignment.score}%</strong>
                    </p>
                  </div>
                </div>
                {assignment.conflicts?.length > 0 && (
                  <p style={{ fontSize: '0.6rem', color: 'var(--amber)', marginTop: 6 }}>
                    ⚠️ {assignment.conflicts.join(', ')}
                  </p>
                )}
              </div>
            )}

            {/* ── Рекомендация алгоритма (только для pending) ── */}
            {ghost.status === 'pending' && (
              <div
                className="rounded-xl p-3 mb-4"
                style={{ background: 'rgba(8,8,26,0.62)', border: '1px solid rgba(201,168,76,0.18)' }}
              >
                <p style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 6 }}>
                  Рекомендация
                </p>

                {match.status === 'impossible' ? (
                  <p style={{ fontSize: '0.7rem', color: 'var(--red)' }}>Переселение невозможно</p>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <div
                      className="rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        width: 32, height: 32,
                        background: 'rgba(8,8,26,0.8)',
                        border: '1px solid rgba(201,168,76,0.25)',
                        fontSize: '1rem',
                      }}
                    >
                      {bestLocation?.emoji}
                    </div>
                    <div className="flex-1">
                      <p style={{ fontFamily: 'Philosopher, serif', fontSize: '0.72rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                        {bestLocation?.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <div
                            style={{
                              width: `${match.score}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, var(--purple), var(--gold))',
                              borderRadius: 999,
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--gold)' }}>
                          {match.score}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Кнопки действий ── */}
            <div className="flex gap-2 mt-auto">
              {ghost.status === 'pending' ? (
                match.status === 'impossible' ? (
                  <button onClick={() => setShowManual(true)} className="btn-ghost flex-1" style={{ fontSize: '0.78rem', padding: '0.5rem 0.75rem' }}>
                    Выбрать место
                  </button>
                ) : (
                  <>
                    <button onClick={handleAutoAssign} className="btn-primary flex-1" style={{ fontSize: '0.78rem', padding: '0.5rem 0.75rem' }}>
                      Заселить
                    </button>
                    <button onClick={() => setShowManual(true)} className="btn-ghost flex-1" style={{ fontSize: '0.78rem', padding: '0.5rem 0.75rem' }}>
                      Вручную
                    </button>
                  </>
                )
              ) : (
                <button onClick={onClose} className="btn-ghost flex-1" style={{ fontSize: '0.78rem', padding: '0.5rem 0.75rem' }}>
                  Закрыть
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Модал ручного назначения (выше flip-карточки) ────────── */}
      {showManual && (
        <AssignModal
          ghost={ghost}
          locations={locations}
          onAssign={(g, loc, result) => {
            onAssign(g, loc, { isAuto: false, ...result })
            setShowManual(false)
          }}
          onClose={() => setShowManual(false)}
          zIndex={70}
        />
      )}
    </>
  )
}
