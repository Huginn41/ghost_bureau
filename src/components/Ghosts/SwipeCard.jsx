import React, { useState } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { findBestLocation } from '../../logic/matcher'

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
const S = {
  width:           isMobile ? 204 : 240,
  height:          isMobile ? 306 : 360,
  radius:          isMobile ? 14  : 16,
  swipeThreshold:  100,
  stackRotation:   6,
  stackScale:      0.04,
  tiltStrength:    20,
  springStiffness: 300,
  springDamping:   30,
  scale:           isMobile ? 0.85 : 1,
}

// ─── Одна карточка в стопке ───────────────────────────────────────────────────
function DraggableCard({ children, isFront, index, total, onSendToBack }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-200, 200], [S.tiltStrength, -S.tiltStrength])
  const rotateY = useTransform(x, [-200, 200], [-S.tiltStrength, S.tiltStrength])

  function handleDragEnd(_, info) {
    const swiped =
      Math.abs(info.offset.x) > S.swipeThreshold ||
      Math.abs(info.offset.y) > S.swipeThreshold
    if (swiped) onSendToBack()
    else { x.set(0); y.set(0) }
  }

  return (
    <motion.div
      className="absolute cursor-grab active:cursor-grabbing select-none"
      style={{
        width: S.width,
        height: S.height,
        x: isFront ? x : 0,
        y: isFront ? y : 0,
        rotateX: isFront ? rotateX : 0,
        rotateY: isFront ? rotateY : 0,
        zIndex: total - index,
      }}
      drag={isFront}
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.5}
      onDragEnd={handleDragEnd}
      whileHover={isFront ? { scale: 1.03 } : {}}
      transition={{ type: 'spring', stiffness: S.springStiffness, damping: S.springDamping }}
    >
      {/* Этот div отвечает за веер стопки */}
      <motion.div
        className="w-full h-full overflow-hidden shadow-2xl"
        style={{
          borderRadius: S.radius,
          transformOrigin: '85% 85%',   // ← ключ: поворот от нижнего правого угла
        }}
        animate={{
          rotateZ: index * S.stackRotation,
          scale: 1 - index * S.stackScale,
          y: index * 10,
        }}
        initial={false}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

// ─── Визуал одной карточки-таро ───────────────────────────────────────────────
const statusConfig = {
  pending: { text: 'Ожидает',  color: '#fcd34d', glow: '#f59e0b33' },
  placed:  { text: 'Расселён', color: '#6ee7b7', glow: '#34d39933' },
  failed:  { text: 'Проблема', color: '#f87171', glow: '#f8717133' },
}
const GHOST_EMOJI = { 1:'🔥', 2:'👑', 3:'🚁', 4:'🟢', 5:'🧊', 6:'❄️' }
const GHOST_IMG   = { 1:'/images/g_1.png', 2:'/images/g_2.png', 3:'/images/g_3.png', 4:'/images/g_4.png', 5:'/images/g_5.png', 6:'/images/g_6.png' }

function TarotCard({ ghost, locations, assignment, isFront, onClick }) {
  const match = ghost.status === 'pending' ? findBestLocation(ghost, locations) : null
  const s = statusConfig[ghost.status]
  const daysLeft = Math.ceil((new Date(ghost.deadline) - new Date()) / 86400000)
  const isOverdue = daysLeft < 0

  const placedAt = ghost.status === 'placed' && assignment
    ? locations.find(l => l.id === assignment.locationId)?.name : null

  const hint = placedAt
    ? `${placedAt} · ${assignment.score}%`
    : match?.status === 'impossible' ? 'Нет подходящих мест'
    : match ? `→ ${locations.find(l => l.id === match.locationId)?.name}`
    : null

  return (
    <button
      className="relative w-full h-full text-left focus:outline-none"
      onClick={isFront ? onClick : undefined}
      tabIndex={isFront ? 0 : -1}
    >
      <img
        src="/images/ghost_card.webp"
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        draggable={false}
      />

      {/* Свечение по краям */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: `inset 0 0 30px 8px ${s.glow}`, borderRadius: S.radius }}
      />

      {/* Портрет призрака в круге */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none overflow-hidden"
        style={{ top: '11%', width: '55%', aspectRatio: '1/1', borderRadius: '50%' }}
      >
        {GHOST_IMG[ghost.id] ? (
          <img
            src={GHOST_IMG[ghost.id]}
            alt={ghost.name}
            className="w-full h-full object-contain"
            onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }}
          />
        ) : null}
        <span
          style={{ fontSize: '3rem', lineHeight: 1, display: GHOST_IMG[ghost.id] ? 'none' : 'flex' }}
        >
          {GHOST_EMOJI[ghost.id] ?? '👻'}
        </span>
      </div>

      {/* Статус */}
      <div
        className="absolute left-1/2 -translate-x-1/2 font-bold tracking-widest uppercase pointer-events-none"
        style={{ top: '62%', color: s.color, fontSize: isMobile ? '0.5rem' : '9px' }}
      >
        {s.text}
      </div>

      {/* Имя */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-4/5 text-center leading-snug pointer-events-none"
        style={{ fontFamily: 'Cinzel, serif', top: '67%', color: '#e9d5ff', fontSize: isMobile ? '0.66rem' : '0.78rem' }}
      >
        {ghost.name}
      </div>

      {/* Возраст / дедлайн */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-4/5 flex justify-center gap-2 text-slate-400 pointer-events-none"
        style={{ top: '77%', fontSize: isMobile ? '0.51rem' : '0.6rem' }}
      >
        <span>{ghost.age} лет</span>
        <span>·</span>
        <span style={{ color: isOverdue ? '#f87171' : daysLeft <= 14 ? '#fbbf24' : undefined }}>
          {isOverdue ? 'Просрочен' : `${daysLeft} дн.`}
        </span>
      </div>

      {/* Место */}
      {hint && (
        <div
          className="absolute left-1/2 -translate-x-1/2 w-4/5 text-center leading-tight pointer-events-none"
          style={{
            top: '84%',
            fontSize: isMobile ? '0.49rem' : '0.58rem',
            color: ghost.status === 'placed' ? '#6ee7b7' : match?.status === 'impossible' ? '#f87171' : '#94a3b8',
          }}
        >
          {hint}
        </div>
      )}

      {/* Подсказка «тяни» */}
      {isFront && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 text-[8px] text-purple-400/50 tracking-widest uppercase whitespace-nowrap pointer-events-none">
          ↔ тяни
        </div>
      )}
    </button>
  )
}

// ─── Кнопка навигации ─────────────────────────────────────────────────────────
function NavBtn({ onClick, label, children, className = '', zIndex }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`w-11 h-11 rounded-full items-center justify-center flex-shrink-0 transition-all duration-200 ${className}`}
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
        color: 'var(--text-secondary)',
        fontSize: '1.4rem',
        lineHeight: 1,
        position: 'relative',
        zIndex: zIndex ?? 'auto',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--gold)'
        e.currentTarget.style.color = 'var(--gold)'
        e.currentTarget.style.boxShadow = '0 0 12px rgba(201,168,76,0.25)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-default)'
        e.currentTarget.style.color = 'var(--text-secondary)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {children}
    </button>
  )
}

// ─── Основной компонент ───────────────────────────────────────────────────────
export default function SwipeCards({ ghosts, locations, assignments, onSelectGhost }) {
  const [cards, setCards] = useState(ghosts)
  const [currentIdx, setCurrentIdx] = useState(0)

  React.useEffect(() => { setCards(ghosts); setCurrentIdx(0) }, [ghosts])

  const total = ghosts.length

  function moveToBack() {
    setCards(prev => {
      const arr = [...prev]
      const [first] = arr.splice(0, 1)
      arr.push(first)
      return arr
    })
    setCurrentIdx(i => (i + 1) % total)
  }
  function moveToFront() {
    setCards(prev => {
      const arr = [...prev]
      const last = arr.pop()
      arr.unshift(last)
      return arr
    })
    setCurrentIdx(i => (i - 1 + total) % total)
  }

  return (
    <div className="flex flex-col items-center">
      {/* Обёртка — кнопки по бокам на десктопе */}
      <div className="relative flex items-center" style={{ gap: '24px' }}>

        {/* Кнопка «назад» — слева на md+, z-index выше карточек */}
        {total > 1 && (
          <NavBtn onClick={moveToFront} label="Предыдущая карточка" className="hidden md:flex" zIndex={50}>
            ‹
          </NavBtn>
        )}

        {/* Стопка */}
        <div
          className="relative flex-shrink-0"
          style={{ width: S.width, height: S.height, perspective: 1200 }}
        >
          {cards.map((ghost, index) => (
            <DraggableCard
              key={ghost.id}
              isFront={index === 0}
              index={index}
              total={cards.length}
              onSendToBack={moveToBack}
            >
              <TarotCard
                ghost={ghost}
                locations={locations}
                assignment={assignments.find(a => a.ghostId === ghost.id)}
                isFront={index === 0}
                onClick={() => onSelectGhost(ghost)}
              />
            </DraggableCard>
          ))}
        </div>

        {/* Кнопка «вперёд» — справа на md+, z-index выше карточек */}
        {total > 1 && (
          <NavBtn onClick={moveToBack} label="Следующая карточка" className="hidden md:flex" zIndex={50}>
            ›
          </NavBtn>
        )}
      </div>

      {/* Индикаторы + мобильные кнопки */}
      {total > 1 && (
        <div className="flex items-center gap-4 mt-5" role="group" aria-label="Листать карточки">
          <NavBtn onClick={moveToFront} label="Предыдущая" className="md:hidden">‹</NavBtn>

          {/* Точки — отслеживают реальный currentIdx */}
          <div className="flex gap-2 items-center" aria-hidden="true">
            {Array.from({ length: total }).map((_, i) => {
              const active = i === currentIdx
              return (
                <span
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: active ? 20 : 6,
                    height: 6,
                    background: active ? 'var(--gold)' : 'var(--bg-highlight)',
                    boxShadow: active ? '0 0 8px var(--gold)' : 'none',
                  }}
                />
              )
            })}
          </div>

          <NavBtn onClick={moveToBack} label="Следующая" className="md:hidden">›</NavBtn>
        </div>
      )}
    </div>
  )
}
