/**
 * Возвращает { status, score, explanation, conflicts, locationId? }
 * status: 'impossible' | 'blocked' | 'ok' | 'warning'
 */
export function matchGhost(ghost, location) {
  // Шаг 1 — блокер дедлайна
  if (new Date(ghost.deadline) < new Date()) {
    return {
      status: 'impossible',
      score: 0,
      explanation: 'Дедлайн истёк — переселение невозможно.',
      conflicts: ['Дедлайн истёк'],
    }
  }

  // Шаг 2 — жёсткие блокеры пары привидение + место
  const blockers = []

  if (location.currentCount >= location.capacity)
    blockers.push('Место переполнено')

  if (ghost.requirements.noHumans && location.hasHumans)
    blockers.push('В месте есть люди')

  if (ghost.requirements.fearsMirrors && location.hasMirrors)
    blockers.push('В месте есть зеркала')

  if (ghost.requirements.needsAttic && !location.hasAttic)
    blockers.push('Нет чердака')

  if (ghost.requirements.needsDampness && !location.dampness)
    blockers.push('Нет сырости')

  if (ghost.requirements.needsDarkness && location.light === 'bright')
    blockers.push('Слишком светло')

  if (ghost.requirements.noOtherGhosts && location.currentCount > 0)
    blockers.push('Уже есть жильцы')

  if (blockers.length > 0) {
    return { status: 'blocked', score: 0, explanation: blockers.join('; '), conflicts: blockers }
  }

  // Шаг 3 — скоринг
  let score = 0
  const reasons = []

  if (ghost.preferredTemp === location.temp || ghost.preferredTemp === 'any') {
    score += 25
    reasons.push('подходящая температура')
  }

  if (ghost.requirements.needsDarkness && location.light === 'dark') {
    score += 20
    reasons.push('достаточно темно')
  } else if (ghost.requirements.needsDarkness && location.light === 'dim') {
    score += 10
    reasons.push('полутёмное место')
  }

  if (ghost.requirements.needsDampness && location.dampness) {
    score += 15
    reasons.push('есть сырость')
  }

  if (location.isHaunted) {
    score += 10
    reasons.push('намоленное место')
  }

  const fillRatio = location.currentCount / location.capacity
  if (fillRatio < 0.5) {
    score += 10
    reasons.push('много свободного места')
  }

  // Модификатор тревожности
  if (ghost.anxiety >= 7) {
    if (location.noise === 'low') {
      score += 15
      reasons.push('тихая обстановка снижает тревогу')
    }
    if (location.noise === 'high') {
      score -= 20
      reasons.push('шум усиливает тревогу')
    }
    if (location.isHaunted) {
      score += 10 // уже учтено выше, доп. бонус для тревожных
      reasons.push('привычная атмосфера')
    }
  }

  // Модификатор возраста — старые привидения капризнее, штрафы удваиваются
  if (ghost.age > 200) {
    if (ghost.preferredTemp !== location.temp && ghost.preferredTemp !== 'any') {
      score -= 15
      reasons.push('неподходящая температура (строгий возрастной штраф)')
    }
  }

  score = Math.max(0, Math.min(100, score))

  const explanation = reasons.length > 0
    ? reasons.join(', ')
    : 'базовая совместимость'

  return { status: 'ok', score, explanation, conflicts: [] }
}

/**
 * Находит лучшее место для привидения среди всех локаций.
 * Возвращает { locationId, score, explanation, status, perLocation }
 */
export function findBestLocation(ghost, locations) {
  // Блокер дедлайна — проверяем до цикла
  if (new Date(ghost.deadline) < new Date()) {
    return {
      status: 'impossible',
      locationId: null,
      score: 0,
      explanation: 'Дедлайн истёк — переселение невозможно.',
      perLocation: [],
    }
  }

  const results = locations.map(loc => ({
    location: loc,
    ...matchGhost(ghost, loc),
  }))

  const viable = results.filter(r => r.status === 'ok').sort((a, b) => b.score - a.score)

  if (viable.length === 0) {
    const summary = results
      .map(r => `${r.location.name}: ${r.conflicts.join(', ')}`)
      .join('; ')
    return {
      status: 'impossible',
      locationId: null,
      score: 0,
      explanation: `Нет подходящих мест. ${summary}`,
      perLocation: results,
    }
  }

  const best = viable[0]
  return {
    status: 'ok',
    locationId: best.location.id,
    score: best.score,
    explanation: best.explanation,
    perLocation: results,
  }
}

/**
 * Проверяет ручное назначение — возвращает предупреждения, но не блокирует.
 */
export function checkManualAssignment(ghost, location) {
  const result = matchGhost(ghost, location)
  if (result.status === 'impossible') return result
  if (result.status === 'blocked') {
    return { ...result, status: 'warning' }
  }
  return result
}
