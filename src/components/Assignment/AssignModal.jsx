import { useState } from 'react'
import { checkManualAssignment } from '../../logic/matcher'

export default function AssignModal({ ghost, locations, onAssign, onClose, zIndex = 50 }) {
  const [selectedId, setSelectedId] = useState(null)
  const [confirmConflict, setConfirmConflict] = useState(false)

  const selected = locations.find(l => l.id === selectedId)
  const check    = selected ? checkManualAssignment(ghost, selected) : null

  function handlePlace() {
    if (!selected) return
    if (check.status === 'warning' && !confirmConflict) { setConfirmConflict(true); return }
    onAssign(ghost, selected, check)
  }

  return (
    <div
      className="fixed inset-0 flex items-end md:items-center justify-center"
      style={{ zIndex, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="w-full md:max-w-md rounded-t-2xl md:rounded-2xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-gold)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-cinzel text-sm font-semibold" style={{ color: 'var(--gold)' }}>
            Выбрать место вручную
          </h3>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-colors"
            style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            ×
          </button>
        </div>
        <div className="divider-gold mb-3" />
        <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
          Место для <span style={{ color: 'var(--text-primary)', fontFamily: 'Cinzel, serif' }}>{ghost.name}</span>
        </p>

        {/* Список мест */}
        <div className="space-y-2 mb-4">
          {locations.map(loc => {
            const result   = checkManualAssignment(ghost, loc)
            const isBlocked = result.status === 'blocked' || result.status === 'impossible'
            const isSelected = selectedId === loc.id
            const fillRatio = loc.currentCount / loc.capacity
            const fillColor = fillRatio >= 1 ? 'var(--red)' : fillRatio >= 0.7 ? 'var(--amber)' : 'var(--emerald)'

            return (
              <button
                key={loc.id}
                onClick={() => { setSelectedId(loc.id); setConfirmConflict(false) }}
                className="w-full text-left rounded-xl px-3 py-3 transition-all"
                style={isSelected
                  ? { background: 'var(--purple-dim)', border: '1px solid rgba(139,92,246,0.5)' }
                  : { background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }
                }
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{loc.emoji}</span>
                  <span className="flex-1 text-sm" style={{ color: isBlocked ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                    {loc.name}
                  </span>
                  <span
                    className="text-xs font-semibold tabular-nums"
                    style={{ color: isBlocked ? 'var(--red)' : 'var(--emerald)' }}
                  >
                    {isBlocked ? '✗' : `${result.score}%`}
                  </span>
                </div>

                {/* Заполненность */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-highlight)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.min(Math.round(fillRatio * 100), 100)}%`, background: fillColor }}
                    />
                  </div>
                  <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
                    {loc.currentCount}/{loc.capacity}
                  </span>
                </div>

                {isBlocked && (
                  <p className="text-xs mt-1.5" style={{ color: 'rgba(248,113,113,0.7)' }}>
                    {result.conflicts.join(' · ')}
                  </p>
                )}
              </button>
            )
          })}
        </div>

        {/* Предупреждение о конфликте */}
        {confirmConflict && check?.conflicts?.length > 0 && (
          <div
            className="mb-4 p-3 rounded-xl text-xs"
            style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)' }}
          >
            <p className="font-semibold mb-2" style={{ color: 'var(--amber)' }}>⚠️ Конфликт при заселении:</p>
            <ul className="space-y-0.5 mb-2" style={{ color: 'var(--text-secondary)' }}>
              {check.conflicts.map(c => <li key={c}>— {c}</li>)}
            </ul>
            <p style={{ color: 'var(--amber)' }}>Всё равно заселить?</p>
          </div>
        )}

        {/* Кнопки */}
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-ghost flex-1">Отмена</button>
          <button
            onClick={handlePlace}
            disabled={!selectedId}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
            style={!selectedId
              ? { background: 'var(--bg-elevated)', color: 'var(--text-muted)', cursor: 'not-allowed' }
              : confirmConflict
              ? { background: 'rgba(245,158,11,0.8)', border: '1px solid rgba(245,158,11,0.4)' }
              : { background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', border: '1px solid rgba(139,92,246,0.4)', boxShadow: '0 0 12px rgba(109,40,217,0.35)' }
            }
          >
            {confirmConflict ? 'Всё равно заселить' : 'Заселить'}
          </button>
        </div>
      </div>
    </div>
  )
}
