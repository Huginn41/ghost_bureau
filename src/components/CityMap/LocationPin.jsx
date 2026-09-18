export default function LocationPin({ location, onClick }) {
  const fillRatio = location.currentCount / location.capacity

  const [primary, glow, dimGlow] =
    fillRatio >= 1
      ? ['#f87171', 'rgba(248,113,113,0.7)', 'rgba(248,113,113,0.15)']
      : fillRatio >= 0.7
      ? ['#fbbf24', 'rgba(251,191,36,0.7)',  'rgba(251,191,36,0.15)']
      : ['#c9a84c', 'rgba(201,168,76,0.65)', 'rgba(201,168,76,0.12)']

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 group z-10"
      style={{ left: `${location.xPercent}%`, top: `${location.yPercent}%` }}
    >
      <button
        onClick={() => onClick(location)}
        aria-label={`${location.name} — ${location.currentCount} из ${location.capacity}`}
        className="relative flex items-center justify-center focus:outline-none"
        style={{ width: 56, height: 56, WebkitTapHighlightColor: 'transparent' }}
      >
        {/* ── Большой размытый орб-свечение ─────────────────────── */}
        <span
          aria-hidden="true"
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: '-14px',
            background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
            animation: 'orb-breathe 3s ease-in-out infinite',
            filter: 'blur(6px)',
          }}
        />

        {/* ── Вращающаяся коническая дуга (наружная) ────────────── */}
        <span
          aria-hidden="true"
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: '-6px',
            background: `conic-gradient(from var(--rune-angle), transparent 65%, ${primary} 82%, ${glow} 88%, transparent 95%)`,
            animation: 'rune-spin 5s linear infinite',
            filter: `drop-shadow(0 0 5px ${glow})`,
          }}
        />

        {/* ── Вращающаяся коническая дуга (внутренняя, обратная) ── */}
        <span
          aria-hidden="true"
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: '-2px',
            background: `conic-gradient(from var(--rune-angle), transparent 70%, ${primary}88 90%, transparent 100%)`,
            animation: 'rune-spin-rev 8s linear infinite',
          }}
        />

        {/* ── Орбитальная частица 1 ──────────────────────────────── */}
        <span
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{
            top: '50%', left: '50%',
            width: 5, height: 5,
            marginTop: -2.5, marginLeft: -2.5,
            borderRadius: '50%',
            background: primary,
            boxShadow: `0 0 6px 2px ${glow}`,
            animation: 'orbit 4s linear infinite',
          }}
        />

        {/* ── Орбитальная частица 2 (сдвинута по фазе) ─────────── */}
        <span
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{
            top: '50%', left: '50%',
            width: 3, height: 3,
            marginTop: -1.5, marginLeft: -1.5,
            borderRadius: '50%',
            background: '#fff',
            opacity: 0.8,
            boxShadow: `0 0 4px 1px ${primary}`,
            animation: 'orbit-rev 6s linear infinite',
          }}
        />

        {/* ── Маркер ────────────────────────────────────────────── */}
        <span
          className="relative flex items-center justify-center rounded-full text-2xl transition-transform duration-150 group-hover:scale-110 active:scale-110"
          style={{
            width: 48, height: 48,
            background: 'rgba(8,8,26,0.92)',
            border: `1.5px solid ${primary}`,
            boxShadow: `0 0 0 1px ${dimGlow}, 0 0 18px ${glow} inset`,
          }}
        >
          {location.emoji}
        </span>

        {/* ── Подпись ───────────────────────────────────────────── */}
        <span
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-0.5 rounded text-xs whitespace-nowrap pointer-events-none
                     opacity-0 group-hover:opacity-100 md:transition-opacity md:duration-200"
          style={{
            fontFamily: 'Cinzel, serif',
            color: '#e9d5ff',
            background: 'rgba(8,8,26,0.9)',
            border: '1px solid rgba(201,168,76,0.3)',
          }}
        >
          {location.name}
        </span>
      </button>

      {/* Мобиле: подпись всегда видна */}
      <style>{`
        @media (max-width: 767px) {
          .group button > span:last-child { opacity: 1 !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .group button span[aria-hidden] { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
