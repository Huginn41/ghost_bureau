import { findBestLocation } from '../../logic/matcher'

const statusConfig = {
  pending:  { text: 'Ожидает',    color: 'text-amber-300',   glow: '#f59e0b' },
  placed:   { text: 'Расселён',   color: 'text-emerald-300', glow: '#34d399' },
  failed:   { text: 'Проблема',   color: 'text-red-400',     glow: '#f87171' },
}

const GHOST_EMOJI = {
  1: '🧊', // Граф Морозий
  2: '🌫️', // Мадам Шёпот
  3: '💨', // Профессор Туман
  4: '❄️', // Баронесса Иней
  5: '🎭', // Пьеро Бродячий
  6: '🌑', // Сестра Мрак
}

export default function GhostCard({ ghost, locations, assignment, onClick }) {
  const match   = ghost.status === 'pending' ? findBestLocation(ghost, locations) : null
  const s       = statusConfig[ghost.status]
  const deadline = new Date(ghost.deadline)
  const daysLeft = Math.ceil((deadline - new Date()) / 86400000)
  const isOverdue = daysLeft < 0

  const placedAt = ghost.status === 'placed' && assignment
    ? locations.find(l => l.id === assignment.locationId)?.name
    : null

  const hint = ghost.status === 'placed' && placedAt
    ? `${placedAt} · ${assignment.score}%`
    : match?.status === 'impossible'
    ? 'Нет подходящих мест'
    : match
    ? `→ ${locations.find(l => l.id === match.locationId)?.name}`
    : null

  return (
    <button
      onClick={() => onClick(ghost)}
      className="relative focus:outline-none group"
      style={{ aspectRatio: '2/3', width: '100%' }}
    >
      {/* Фоновая карточка */}
      <img
        src="/images/ghost_card.webp"
        alt=""
        className="absolute inset-0 w-full h-full object-cover rounded-lg"
        draggable={false}
      />

      {/* Свечение по краям при hover/active */}
      <div
        className="absolute inset-0 rounded-lg transition-opacity duration-300 opacity-0 group-hover:opacity-100 group-active:opacity-100"
        style={{ boxShadow: `0 0 20px 4px ${s.glow}55, inset 0 0 20px 2px ${s.glow}22` }}
      />

      {/* Эмодзи-заглушка в круге */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
        style={{ top: '12%', fontSize: 'clamp(2rem, 8vw, 3.5rem)', lineHeight: 1, width: '55%', aspectRatio: '1/1' }}
      >
        {GHOST_EMOJI[ghost.id] ?? '👻'}
      </div>

      {/* Статус-бейдж над именем */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 text-center text-[10px] font-semibold tracking-widest uppercase ${s.color}`}
        style={{ top: '62%' }}
      >
        {s.text}
      </div>

      {/* Имя */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[80%] text-center"
        style={{ fontFamily: 'Cinzel, serif', top: '67%', color: '#e9d5ff', fontSize: 'clamp(0.6rem, 2vw, 0.85rem)', lineHeight: 1.2 }}
      >
        {ghost.name}
      </div>

      {/* Характеристики */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[80%] flex justify-center gap-3 text-slate-400"
        style={{ top: '77%', fontSize: 'clamp(0.55rem, 1.5vw, 0.7rem)' }}
      >
        <span>{ghost.age} лет</span>
        <span>·</span>
        <span className={isOverdue ? 'text-red-400' : daysLeft <= 14 ? 'text-amber-400' : ''}>
          {isOverdue ? 'Просрочен' : `${daysLeft} дн.`}
        </span>
      </div>

      {/* Подсказка: куда назначен / лучшее место */}
      {hint && (
        <div
          className="absolute left-1/2 -translate-x-1/2 w-[80%] text-center leading-tight"
          style={{
            top: '84%',
            fontSize: 'clamp(0.5rem, 1.3vw, 0.65rem)',
            color: ghost.status === 'placed' ? '#6ee7b7' : match?.status === 'impossible' ? '#f87171' : '#94a3b8',
          }}
        >
          {hint}
        </div>
      )}
    </button>
  )
}
