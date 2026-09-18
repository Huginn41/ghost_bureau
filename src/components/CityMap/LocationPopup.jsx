export default function LocationPopup({ location, onClose }) {
  const fillRatio  = location.currentCount / location.capacity
  const fillPct    = Math.round(fillRatio * 100)
  const fillColor  = fillRatio >= 1 ? 'var(--red)' : fillRatio >= 0.7 ? 'var(--amber)' : 'var(--emerald)'

  const attrs = [
    ['🌡️', 'Температура', { cold: 'Холодно', warm: 'Тепло', mixed: 'Смешанно' }[location.temp]],
    ['💡', 'Освещение',   { dark: 'Темно', dim: 'Полутьма', bright: 'Светло' }[location.light]],
    ['🔊', 'Шум',         { low: 'Тихо', medium: 'Умеренно', high: 'Шумно' }[location.noise]],
    ['💧', 'Сырость',     location.dampness  ? 'Есть' : 'Нет'],
    ['🧍', 'Люди',        location.hasHumans ? 'Есть' : 'Нет'],
    ['🪜', 'Чердак',      location.hasAttic  ? 'Есть' : 'Нет'],
    ['🪞', 'Зеркала',     location.hasMirrors ? 'Есть' : 'Нет'],
    ['✨', 'Намоленное',  location.isHaunted  ? 'Да' : 'Нет'],
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl p-5 shadow-2xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-gold)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Закрыть — touch target 44×44px */}
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute top-2 right-2 w-11 h-11 flex items-center justify-center rounded-xl text-xl transition-colors"
          style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          ×
        </button>

        {/* Заголовок */}
        <div className="flex items-center gap-3 mb-1 pr-10">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-gold)' }}
          >
            {location.emoji}
          </div>
          <div>
            <h2 className="font-cinzel text-base font-semibold leading-tight" style={{ color: 'var(--gold)' }}>
              {location.name}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {location.description}
            </p>
          </div>
        </div>

        <div className="divider-gold my-3" />

        {/* Заполненность */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span style={{ color: 'var(--text-muted)' }}>Заполненность</span>
            <span className="font-semibold tabular-nums" style={{ color: fillColor }}>
              {location.currentCount} / {location.capacity}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(fillPct, 100)}%`, background: fillColor }}
            />
          </div>
          {fillRatio >= 1 && (
            <p className="text-xs mt-1" style={{ color: 'var(--red)' }}>Место заполнено</p>
          )}
        </div>

        {/* Характеристики */}
        <div className="grid grid-cols-2 gap-2">
          {attrs.map(([icon, label, value]) => (
            <div
              key={label}
              className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}
            >
              <span aria-hidden="true">{icon}</span>
              <span style={{ color: 'var(--text-muted)' }}>{label}</span>
              <span className="ml-auto font-medium" style={{ color: 'var(--text-primary)' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
