import { useState } from 'react'
import { findBestLocation } from '../../logic/matcher'
import AssignModal from '../Assignment/AssignModal'

const GHOST_IMG  = { 1:'/images/g_1.png', 2:'/images/g_2.png', 3:'/images/g_3.png', 4:'/images/g_4.png', 5:'/images/g_5.png', 6:'/images/g_6.png' }
const TEMP_LABEL = { cold: 'Холод', warm: 'Тепло', any: 'Любая' }

const REQ_LABELS = [
  ['needsAttic',    '🪜', 'Чердак'],
  ['fearsMirrors',  '🪞', 'Боится зеркал'],
  ['noHumans',      '🧍', 'Без людей'],
  ['needsDampness', '💧', 'Сырость'],
  ['needsDarkness', '🌑', 'Темнота'],
  ['noOtherGhosts', '👻', 'Уединение'],
  ['needsSilence',  '🔇', 'Тишина'],
]

function Section({ title, children }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
      {title && (
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
          {title}
        </p>
      )}
      {children}
    </div>
  )
}

export default function GhostDetail({ ghost, locations, assignment, onAssign, onBack }) {
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
    <div className="flex flex-col h-full overflow-y-auto pb-24">

      {/* ── Назад ───────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          ← Назад к заявкам
        </button>
      </div>

      <div className="px-4 space-y-3">

        {/* ── Портрет + имя ───────────────────────────────────────── */}
        <Section>
          <div className="flex items-center gap-4">
            {/* Портрет */}
            <div
              className="flex-shrink-0 w-20 h-20 rounded-full overflow-hidden flex items-center justify-center"
              style={{ background: 'var(--bg-elevated)', border: '2px solid var(--border-gold)' }}
            >
              {GHOST_IMG[ghost.id] ? (
                <img src={GHOST_IMG[ghost.id]} alt={ghost.name} className="w-full h-full object-contain" />
              ) : (
                <span className="text-4xl">👻</span>
              )}
            </div>

            {/* Имя и статус */}
            <div className="flex-1 min-w-0">
              <h2 className="font-cinzel font-semibold text-base leading-tight mb-1 text-wrap-balance"
                  style={{ color: 'var(--gold)' }}>
                {ghost.name}
              </h2>
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{ghost.age} лет от роду</p>
              {/* Дедлайн */}
              <div
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs"
                style={{
                  background: isOverdue ? 'rgba(248,113,113,0.1)' : daysLeft <= 14 ? 'rgba(251,191,36,0.1)' : 'var(--bg-elevated)',
                  border: `1px solid ${isOverdue ? 'rgba(248,113,113,0.3)' : daysLeft <= 14 ? 'rgba(251,191,36,0.3)' : 'var(--border-dim)'}`,
                  color: isOverdue ? 'var(--red)' : daysLeft <= 14 ? 'var(--amber)' : 'var(--text-secondary)',
                }}
              >
                📅 {isOverdue ? `Просрочен (${Math.abs(daysLeft)} дн.)` : `${daysLeft} дн. до срока`}
              </div>
            </div>
          </div>

          <div className="divider-gold my-3" />

          {/* Характеристики */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)' }}>
              <p className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Тревожность</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-highlight)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${ghost.anxiety * 10}%`,
                      background: ghost.anxiety >= 8 ? 'var(--red)' : ghost.anxiety >= 5 ? 'var(--amber)' : 'var(--emerald)',
                    }}
                  />
                </div>
                <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                  {ghost.anxiety}/10
                </span>
              </div>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Температура</p>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {TEMP_LABEL[ghost.preferredTemp]}
              </p>
            </div>
          </div>
        </Section>

        {/* ── Требования ──────────────────────────────────────────── */}
        {reqList.length > 0 && (
          <Section title="Требования">
            <div className="flex flex-wrap gap-1.5">
              {reqList.map(([key, emoji, label]) => (
                <span
                  key={key}
                  className="stamp"
                  style={{ background: 'var(--purple-dim)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd' }}
                >
                  {emoji} {label}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* ── Уже расселён ────────────────────────────────────────── */}
        {ghost.status === 'placed' && assignedLocation && (
          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.25)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--emerald)' }}>
              ✓ Расселён
            </p>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{assignedLocation.emoji}</span>
              <div>
                <p className="font-cinzel text-sm" style={{ color: 'var(--emerald)' }}>{assignedLocation.name}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  Совместимость: <strong>{assignment.score}%</strong>
                </p>
              </div>
            </div>
            {assignment.conflicts?.length > 0 && (
              <p className="text-xs mt-2 pl-1" style={{ color: 'var(--amber)' }}>
                ⚠️ С конфликтами: {assignment.conflicts.join(', ')}
              </p>
            )}
          </div>
        )}

        {/* ── Рекомендация алгоритма ──────────────────────────────── */}
        {ghost.status === 'pending' && (
          <Section>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
              Рекомендация алгоритма
            </p>

            {match.status === 'impossible' ? (
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--red)' }}>Переселение невозможно</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{match.explanation}</p>
                <button onClick={() => setShowManual(true)} className="btn-ghost w-full mt-4">
                  Выбрать место вручную
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-gold)' }}
                  >
                    {bestLocation?.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="font-cinzel text-sm" style={{ color: 'var(--text-primary)' }}>{bestLocation?.name}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-highlight)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${match.score}%`,
                            background: 'linear-gradient(90deg, var(--purple), var(--gold))',
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--gold)' }}>
                        {match.score}%
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                  💡 {match.explanation}
                </p>

                <div className="flex gap-2">
                  <button onClick={handleAutoAssign} className="btn-primary flex-1">Заселить</button>
                  <button onClick={() => setShowManual(true)} className="btn-ghost flex-1">Вручную</button>
                </div>
              </div>
            )}
          </Section>
        )}
      </div>

      {showManual && (
        <AssignModal
          ghost={ghost}
          locations={locations}
          onAssign={(g, loc, result) => {
            onAssign(g, loc, { isAuto: false, ...result })
            setShowManual(false)
          }}
          onClose={() => setShowManual(false)}
        />
      )}
    </div>
  )
}
