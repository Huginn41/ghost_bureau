import { useState } from 'react'
import SwipeCards from './SwipeCard'
import { findBestLocation } from '../../logic/matcher'

const FILTERS = [
  { id: 'all',        label: 'Все' },
  { id: 'pending',    label: 'Без места' },
  { id: 'placed',     label: 'Расселены' },
  { id: 'problematic', label: 'Проблемные' },
]

export default function GhostList({ ghosts, locations, assignments, onSelectGhost }) {
  const [filter, setFilter] = useState('all')

  const filtered = ghosts.filter(g => {
    if (filter === 'all')     return g.status !== 'placed'
    if (filter === 'pending') return g.status === 'pending'
    if (filter === 'placed')  return g.status === 'placed'
    if (filter === 'problematic') {
      const isOverdue    = new Date(g.deadline) < new Date()
      const isImpossible = g.status === 'pending' && findBestLocation(g, locations).status === 'impossible'
      const hasConflict  = assignments.find(a => a.ghostId === g.id && a.conflicts?.length > 0)
      return isOverdue || isImpossible || hasConflict
    }
    return true
  })

  return (
    <div className="flex flex-col h-full">

      {/* Заголовок */}
      <div className="flex-shrink-0 px-4 pt-5 pb-1 text-center">
        <h2 className="font-cinzel text-sm font-semibold tracking-widest" style={{ color: 'var(--gold)' }}>
          Активные заявки
        </h2>
        <div className="divider-gold mx-auto mt-1.5" style={{ width: '8rem' }} />
      </div>

      {/* Фильтры */}
      <div className="flex-shrink-0 px-4 pt-3 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full transition-all"
              style={filter === f.id ? {
                background: 'var(--purple-dim)',
                border: '1px solid rgba(139,92,246,0.4)',
                color: '#c4b5fd',
              } : {
                background: 'transparent',
                border: '1px solid var(--border-dim)',
                color: 'var(--text-muted)',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Счётчик */}
      <div className="flex-shrink-0 pb-2 text-center">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {filtered.length > 0 ? `${filtered.length} ${filtered.length === 1 ? 'заявка' : 'заявок'} · тяни карточку чтобы листать` : ''}
        </p>
      </div>

      {/* Стопка карточек */}
      <div className="flex-1 flex items-start justify-center pt-6 overflow-x-hidden" style={{ paddingBottom: '96px' }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-16 text-center">
            <span className="text-5xl mb-4">👻</span>
            <p className="font-cinzel text-sm" style={{ color: 'var(--text-muted)' }}>
              Нет заявок
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>в этой категории</p>
          </div>
        ) : (
          <SwipeCards
            ghosts={filtered}
            locations={locations}
            assignments={assignments}
            onSelectGhost={onSelectGhost}
          />
        )}
      </div>
    </div>
  )
}
