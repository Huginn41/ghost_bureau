import { useMemo } from 'react'
import { findBestLocation } from '../../logic/matcher'

const GHOST_IMG = {
  1: '/images/g_1.png', 2: '/images/g_2.png', 3: '/images/g_3.png',
  4: '/images/g_4.png', 5: '/images/g_5.png', 6: '/images/g_6.png',
}

const STATUS_PRIORITY = { failed: 0, pending: 1, placed: 2 }

// ─── Вспомогательные компоненты ───────────────────────────────────────────────

function MiniStat({ value, label, color }) {
  return (
    <div
      className="rounded-xl px-3 py-2"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}
    >
      <div
        style={{
          fontSize: '1.35rem',
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1.1,
          color,
          fontFamily: 'Philosopher, serif',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
    </div>
  )
}

function StatCard({ icon, label, value, total, color, sub }) {
  const cfg = {
    emerald: { text: 'var(--emerald)', border: 'rgba(52,211,153,0.2)',  bg: 'rgba(52,211,153,0.06)',  icon: 'rgba(52,211,153,0.14)' },
    amber:   { text: 'var(--amber)',   border: 'rgba(251,191,36,0.2)',  bg: 'rgba(251,191,36,0.06)',  icon: 'rgba(251,191,36,0.14)' },
    orange:  { text: '#fb923c',        border: 'rgba(251,146,60,0.2)',  bg: 'rgba(251,146,60,0.06)',  icon: 'rgba(251,146,60,0.14)' },
    red:     { text: 'var(--red)',     border: 'rgba(248,113,113,0.2)', bg: 'rgba(248,113,113,0.06)', icon: 'rgba(248,113,113,0.14)' },
  }[color]

  const pct = total > 0 ? Math.min(Math.round((value / total) * 100), 100) : 0

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3 transition-shadow"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      {/* Icon row */}
      <div className="flex items-start justify-between">
        <div
          className="flex items-center justify-center rounded-xl text-xl"
          style={{ width: 40, height: 40, background: cfg.icon }}
        >
          {icon}
        </div>
        {/* Sparkline bar (mini) */}
        <div className="flex flex-col items-end gap-1 mt-1">
          <div
            className="h-1 rounded-full overflow-hidden"
            style={{ width: 48, background: 'rgba(255,255,255,0.07)' }}
          >
            <div
              className="h-full rounded-full"
              style={{ width: `${pct}%`, background: cfg.text }}
            />
          </div>
          <span style={{ fontSize: '0.58rem', color: cfg.text, fontVariantNumeric: 'tabular-nums' }}>
            {pct}%
          </span>
        </div>
      </div>

      {/* Number */}
      <div>
        <div
          style={{
            fontFamily: 'Philosopher, serif',
            fontSize: '2rem',
            fontWeight: 700,
            lineHeight: 1,
            color: cfg.text,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  )
}

function GhostRow({ ghost, locations, assignment, match }) {
  const assignedLoc = assignment ? locations.find(l => l.id === assignment.locationId) : null
  const bestLoc = match.status === 'ok' ? locations.find(l => l.id === match.locationId) : null
  const deadline = new Date(ghost.deadline)
  const isOverdue = deadline < new Date()
  const daysLeft = Math.ceil((deadline - new Date()) / 86400000)

  const statusCfg = {
    placed:  { label: 'Расселён',  color: 'var(--emerald)', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.28)' },
    pending: { label: 'Ожидает',   color: 'var(--amber)',   bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.28)' },
    failed:  { label: 'Проблема',  color: 'var(--red)',     bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.28)' },
  }
  const s = statusCfg[ghost.status] ?? statusCfg.pending

  const isImpossible = ghost.status === 'pending' && match.status === 'impossible'
  const hasConflict  = assignment?.conflicts?.length > 0

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 transition-colors"
      style={{
        borderTop: '1px solid var(--border-dim)',
        background: isImpossible || hasConflict ? 'rgba(248,113,113,0.03)' : 'transparent',
      }}
    >
      {/* Portrait */}
      <div
        className="flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center"
        style={{
          width: 38, height: 38,
          background: 'var(--bg-elevated)',
          border: `1.5px solid ${isImpossible || hasConflict ? 'rgba(248,113,113,0.35)' : 'var(--border-dim)'}`,
        }}
      >
        {GHOST_IMG[ghost.id]
          ? <img src={GHOST_IMG[ghost.id]} alt={ghost.name} className="w-full h-full object-contain" />
          : <span style={{ fontSize: '1.2rem' }}>👻</span>
        }
      </div>

      {/* Name + secondary */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="truncate"
            style={{ fontFamily: 'Philosopher, serif', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}
          >
            {ghost.name}
          </span>
          {(isImpossible || hasConflict) && (
            <span style={{ fontSize: '0.58rem', color: 'var(--red)' }}>⚠</span>
          )}
        </div>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }} className="truncate">
          {ghost.status === 'placed' && assignedLoc
            ? `${assignedLoc.emoji} ${assignedLoc.name} · ${assignment.score}%`
            : isImpossible
            ? 'Нет подходящих мест'
            : bestLoc
            ? `→ ${bestLoc.emoji} ${bestLoc.name} · ${match.score}%`
            : '—'
          }
        </div>
      </div>

      {/* Right: status badge + deadline */}
      <div className="flex-shrink-0 flex flex-col items-end gap-1">
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5"
          style={{
            fontSize: '0.58rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: s.color,
            background: s.bg,
            border: `1px solid ${s.border}`,
          }}
        >
          {s.label}
        </span>
        <span
          style={{
            fontSize: '0.6rem',
            color: isOverdue ? 'var(--red)' : daysLeft <= 14 ? 'var(--amber)' : 'var(--text-muted)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {isOverdue ? `−${Math.abs(daysLeft)} дн.` : `${daysLeft} дн.`}
        </span>
      </div>
    </div>
  )
}

// ─── Основной компонент ───────────────────────────────────────────────────────

export default function Report({ ghosts, locations, assignments }) {
  const placed        = ghosts.filter(g => g.status === 'placed')
  const pending       = ghosts.filter(g => g.status === 'pending')
  const withConflicts = assignments.filter(a => a.conflicts?.length > 0)
  const overloaded    = locations.filter(l => l.currentCount >= l.capacity)
  const total         = ghosts.length
  const placedPct     = total > 0 ? Math.round((placed.length / total) * 100) : 0
  const allDone       = placed.length === total && total > 0

  // Вычисляем match для каждого призрака один раз
  const ghostsWithMatch = useMemo(
    () => ghosts.map(g => ({ ghost: g, match: findBestLocation(g, locations) })),
    [ghosts, locations]
  )

  const impossible = ghostsWithMatch.filter(
    ({ ghost, match }) => ghost.status === 'pending' && match.status === 'impossible'
  )

  // Сортировка: проблемные → ожидающие → расселённые
  const sorted = useMemo(
    () =>
      [...ghostsWithMatch].sort((a, b) => {
        const aImp = a.ghost.status === 'pending' && a.match.status === 'impossible' ? -1 : 0
        const bImp = b.ghost.status === 'pending' && b.match.status === 'impossible' ? -1 : 0
        const aPriority = STATUS_PRIORITY[a.ghost.status] + aImp
        const bPriority = STATUS_PRIORITY[b.ghost.status] + bImp
        return aPriority - bPriority
      }),
    [ghostsWithMatch]
  )

  return (
    <div className="overflow-y-auto h-full pb-28">

      {/* ── Заголовок ─────────────────────────────────────────────── */}
      <div className="px-4 pt-5 pb-3">
        <h2
          style={{
            fontFamily: 'Philosopher, serif',
            fontSize: '1.3rem',
            fontWeight: 700,
            color: 'var(--gold)',
            letterSpacing: '0.03em',
            textShadow: '0 0 12px rgba(201,168,76,0.25)',
          }}
        >
          Отчёт по расселению
        </h2>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
          Текущее состояние Бюро переселения привидений
        </p>
      </div>

      {/* ── Главная карточка прогресса ────────────────────────────── */}
      <div className="px-4 mb-4">
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'var(--bg-surface)',
            border: `1px solid ${allDone ? 'rgba(52,211,153,0.4)' : 'var(--border-gold)'}`,
            boxShadow: allDone
              ? '0 0 40px rgba(52,211,153,0.08)'
              : '0 0 24px rgba(201,168,76,0.05)',
          }}
        >
          <div className="flex items-start gap-4 mb-4">
            {/* Большой процент */}
            <div className="flex-shrink-0">
              <div
                style={{
                  fontFamily: 'Philosopher, serif',
                  fontSize: 'clamp(3rem, 10vw, 4.5rem)',
                  fontWeight: 700,
                  lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                  color: allDone ? 'var(--emerald)' : 'var(--gold)',
                  textShadow: allDone
                    ? '0 0 24px rgba(52,211,153,0.45)'
                    : '0 0 24px rgba(201,168,76,0.35)',
                }}
              >
                {placedPct}%
              </div>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {placed.length} из {total} расселено
              </p>
            </div>

            {/* Мини-статистика справа */}
            <div className="flex-1 grid grid-cols-2 gap-2">
              <MiniStat value={pending.length}       label="Ожидают"    color="var(--amber)"  />
              <MiniStat value={impossible.length}    label="Невозможно" color="var(--red)"    />
              <MiniStat value={withConflicts.length} label="Конфликты"  color="#fb923c"       />
              <MiniStat value={overloaded.length}    label="Перегружено" color="var(--purple)" />
            </div>
          </div>

          {/* Прогресс-бар */}
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: 'var(--bg-elevated)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${placedPct}%`,
                background: allDone
                  ? 'var(--emerald)'
                  : 'linear-gradient(90deg, #6d28d9, var(--gold))',
              }}
            />
          </div>
          {allDone && (
            <p
              style={{
                fontFamily: 'Philosopher, serif',
                fontSize: '0.75rem',
                color: 'var(--emerald)',
                textAlign: 'center',
                marginTop: 10,
                letterSpacing: '0.06em',
              }}
            >
              ✦ Все привидения расселены ✦
            </p>
          )}
        </div>
      </div>

      {/* ── 4 стат-карточки ───────────────────────────────────────── */}
      <div className="px-4 grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard
          icon="✅" label="Расселено"
          value={placed.length} total={total}
          color="emerald" sub="привидений"
        />
        <StatCard
          icon="⏳" label="Ожидают"
          value={pending.length} total={total}
          color="amber" sub="без места"
        />
        <StatCard
          icon="⚠️" label="Конфликты"
          value={withConflicts.length} total={Math.max(assignments.length, 1)}
          color="orange" sub="при заселении"
        />
        <StatCard
          icon="📍" label="Перегружено"
          value={overloaded.length} total={locations.length}
          color="red" sub="мест"
        />
      </div>

      {/* ── Нижняя сетка: список заявок + загруженность ───────────── */}
      <div className="px-4 grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Список всех заявок (activity feed) */}
        <div className="lg:col-span-2">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
          >
            {/* Шапка списка */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid var(--border-dim)' }}
            >
              <h3
                style={{
                  fontFamily: 'Philosopher, serif',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}
              >
                Все заявки
              </h3>
              <span
                className="rounded-full px-2.5 py-0.5"
                style={{
                  fontSize: '0.62rem',
                  color: 'var(--text-muted)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-dim)',
                }}
              >
                {total} заявок
              </span>
            </div>

            {/* Строки призраков */}
            {sorted.map(({ ghost, match }) => (
              <GhostRow
                key={ghost.id}
                ghost={ghost}
                locations={locations}
                assignment={assignments.find(a => a.ghostId === ghost.id)}
                match={match}
              />
            ))}
          </div>
        </div>

        {/* Правая колонка */}
        <div className="flex flex-col gap-4">

          {/* Загруженность мест */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
          >
            <div
              className="px-4 py-3"
              style={{ borderBottom: '1px solid var(--border-dim)' }}
            >
              <h3
                style={{
                  fontFamily: 'Philosopher, serif',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}
              >
                Загруженность мест
              </h3>
            </div>
            <div className="px-4 py-3 space-y-3.5">
              {locations.map(loc => {
                const ratio     = loc.currentCount / loc.capacity
                const pct       = Math.round(ratio * 100)
                const barColor  = ratio >= 1 ? 'var(--red)' : ratio >= 0.7 ? 'var(--amber)' : 'var(--emerald)'
                return (
                  <div key={loc.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="flex items-center gap-1.5 truncate"
                        style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}
                      >
                        <span>{loc.emoji}</span>
                        <span className="truncate">{loc.name}</span>
                      </span>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          fontVariantNumeric: 'tabular-nums',
                          color: barColor,
                          flexShrink: 0,
                          marginLeft: 8,
                        }}
                      >
                        {loc.currentCount}/{loc.capacity}
                      </span>
                    </div>
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ background: 'var(--bg-elevated)' }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(pct, 100)}%`, background: barColor }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Проблемные заявки — только если есть */}
          {(impossible.length > 0 || withConflicts.length > 0) && (
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(251,191,36,0.04)',
                border: '1px solid rgba(251,191,36,0.2)',
              }}
            >
              <div
                className="px-4 py-3"
                style={{ borderBottom: '1px solid rgba(251,191,36,0.12)' }}
              >
                <h3
                  style={{
                    fontFamily: 'Philosopher, serif',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: 'var(--amber)',
                  }}
                >
                  ⚠️ Требуют внимания
                </h3>
              </div>
              <div className="px-4 py-3 space-y-2">
                {impossible.map(({ ghost, match }) => (
                  <div
                    key={ghost.id}
                    className="rounded-xl px-3 py-2.5"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}
                  >
                    <p
                      style={{
                        fontFamily: 'Philosopher, serif',
                        fontSize: '0.75rem',
                        color: 'var(--text-primary)',
                        marginBottom: 3,
                      }}
                    >
                      {ghost.name}
                    </p>
                    <p style={{ fontSize: '0.62rem', color: 'var(--red)' }}>
                      {new Date(ghost.deadline) < new Date()
                        ? 'Дедлайн истёк'
                        : 'Нет подходящих мест'}
                    </p>
                  </div>
                ))}
                {withConflicts.map(a => {
                  const g = ghosts.find(x => x.id === a.ghostId)
                  if (!g) return null
                  return (
                    <div
                      key={a.ghostId}
                      className="rounded-xl px-3 py-2.5"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}
                    >
                      <p
                        style={{
                          fontFamily: 'Philosopher, serif',
                          fontSize: '0.75rem',
                          color: 'var(--text-primary)',
                          marginBottom: 3,
                        }}
                      >
                        {g.name}
                      </p>
                      <p style={{ fontSize: '0.62rem', color: 'var(--amber)' }}>
                        {a.conflicts.join(' · ')}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
