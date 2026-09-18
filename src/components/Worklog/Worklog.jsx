import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SECTIONS = [
  {
    id: 'tools',
    icon: '🤖',
    title: 'AI-инструменты',
    content: `Claude Code (claude-sonnet-4-6) - основной инструмент разработки: генерация компонентов, логики, отладка.\n\nGigaChat / Kandinsky - генерация иллюстраций призраков.\n\nIdeogram 3.0 - генерация фоновой картинки карты города.\n\n21.dev - компоненты и UI-референсы.\n\nui-ux-pro-max skill - аудит UX, дизайн-система, типографика, анимации.`,
  },
  {
    id: 'time',
    icon: '⏱️',
    title: 'Время разработки',
    content: `1. Изучение ТЗ и планирование - ~23 мин\n2. Scaffold проекта (Vite + React + Tailwind) - ~15 мин\n3. Данные и логика (matcher.js) - ~30 мин\n4. Карта города с маркерами - ~38 мин\n5. Список заявок и детальный экран - ~45 мин\n6. Отчёт и Worklog - ~23 мин\n7. Деплой и финальная проверка - ~23 мин`,
  },
  {
    id: 'stages',
    icon: '📋',
    title: 'Этапы разработки',
    content: `ТЗ - Архитектура\n  Я: прочитал бриф, выявил edge cases, составил план.\n  AI: предложил структуру файлов и стек.\n\nДанные и логика\n  Я: проверил алгоритм подбора на всех 6 привидениях, убедился что edge cases работают.\n  AI: написал matcher.js по описанию из ТЗ.\n\nUI - Карта\n  Я: скорректировал позиции маркеров под финальную картинку, проверил на мобильном.\n  AI: сгенерировал компоненты LocationPin, LocationPopup, CityMap.\n\nUI - Заявки\n  Я: протестировал ручное назначение с конфликтами, проверил двухшаговое подтверждение.\n  AI: написал GhostDetail, GhostList, AssignModal.\n\nДеплой\n  Я: решил проблему с Google Fonts (заменил на self-hosted), настроил бакет.\n  AI: нашёл информацию об ограничениях Yandex Object Storage.`,
  },
  {
    id: 'prompts',
    icon: '💬',
    title: 'Ключевые промпты',
    content: `1. «Прочитай md файл» - AI разобрал ТЗ и дал резюме структуры.\n\n2. «Составь план» - получили пошаговый план из 7 этапов.\n\n3. «Проведи крупную работу с UI и UX» - полный редизайн всех экранов.`,
  },
  {
    id: 'decisions',
    icon: '🧠',
    title: 'Решения принятые самостоятельно',
    content: `1. Tab-навигация вместо React Router - избежали проблем с 404 на static hosting.\n\n2. Self-hosted шрифты - заменил Google Fonts CDN на локальные файлы до деплоя.\n\n3. Двухшаговое подтверждение в AssignModal - при конфликте кнопка показывает предупреждение, и только второй клик подтверждает.\n\n4. useStorage hook - localStorage в единый хук с функциональным обновлением.\n\n5. xPercentMobile в данных локаций - отдельное поле для коррекции координат на мобильном.`,
  },
  {
    id: 'mistakes',
    icon: '❌',
    title: 'Где AI ошибся',
    content: `- CityMap без высоты: использовал фрагмент, карта не заполняла экран - обернул в div с h-full.\n\n- transformOrigin в animate: нельзя анимировать через framer-motion animate, стек карт не раскрывался - перенёс в style.\n\n- useless ternary в handleAssign: status === 'placed' ? 'placed' : 'placed' - упростил.`,
  },
  {
    id: 'improvements',
    icon: '🚀',
    title: 'Что улучшить в реальном продукте',
    content: `1. Бэкенд + БД - заменить localStorage на реальное хранилище, добавить API.\n2. Drag & drop на десктопе - перетаскивание привидений прямо на карте.\n3. История назначений - лог всех переселений с временными метками.\n4. Уведомления о дедлайнах - предупреждать заранее о приближающихся сроках.\n5. Расширенный алгоритм - учитывать совместимость привидений между собой.\n6. Анимации переходов - между экранами, анимация заселения на карте.`,
  },
]

export default function Worklog() {
  const [open, setOpen] = useState(null)

  return (
    <div className="overflow-y-auto h-full px-4 pt-5 pb-24">
      {/* Заголовок */}
      <div className="text-center mb-5">
        <h2 className="font-cinzel text-sm font-semibold tracking-widest" style={{ color: 'var(--gold)' }}>
          AI Worklog
        </h2>
        <div className="divider-gold mx-auto mt-1.5 mb-2" style={{ width: '8rem' }} />
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Дневник разработки с AI-ассистентом
        </p>
      </div>

      <div className="space-y-2">
        {SECTIONS.map(section => {
          const isOpen = open === section.id
          return (
            <div
              key={section.id}
              className="rounded-2xl overflow-hidden transition-all duration-200"
              style={{
                background: 'var(--bg-surface)',
                border: isOpen ? '1px solid var(--border-gold)' : '1px solid var(--border-dim)',
              }}
            >
              <button
                onClick={() => setOpen(isOpen ? null : section.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors"
                style={{ background: isOpen ? 'var(--gold-dim)' : 'transparent' }}
              >
                <span className="text-base">{section.icon}</span>
                <span
                  className="flex-1 font-cinzel text-sm font-medium"
                  style={{ color: isOpen ? 'var(--gold)' : 'var(--text-primary)' }}
                >
                  {section.title}
                </span>
                <span
                  className="text-sm transition-transform duration-300"
                  style={{
                    color: 'var(--text-muted)',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    display: 'inline-block',
                  }}
                >
                  ⌄
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div
                      className="px-4 pt-0 pb-4"
                      style={{ borderTop: '1px solid var(--border-dim)' }}
                    >
                      <pre
                        className="text-xs leading-relaxed font-sans whitespace-pre-wrap pt-3"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {section.content}
                      </pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
