# SDD Navigator Dashboard – Декомпозиция задач

Каждая задача:
- **Минимальна** (1-2 часа работы)
- **Проверяема** (четкий acceptance criteria)
- **Зависит** от предыдущих шагов
- **Изолирована** (не смешивает разные функции)

---

## T0: Инициализация проекта

**Описание:** Создать Next.js проект с базовой конфигурацией, зависимостями и структурой папок.

**Acceptance Criteria:**
- [ ] Next.js 15+ проект инициализирован (`npx create-next-app@latest`)
- [ ] TypeScript включен
- [ ] Tailwind CSS настроен
- [ ] Папки `app/`, `src/components/`, `src/stores/`, `src/hooks/`, `src/types/`, `src/utils/` созданы
- [ ] package.json содержит все зависимости из плана
- [ ] `npm run dev` работает и приложение открывается на localhost:3000
- [ ] ESLint и Prettier настроены (базовая конфигурация)

**Зависимости:** Нет

**Примерное время:** 30 минут

---

## T1: Настройка TypeScript типов и интерфейсов

**Описание:** Создать `src/types/index.ts` со всеми интерфейсами для API и компонентов.

**Acceptance Criteria:**
- [ ] `src/types/index.ts` содержит интерфейсы:
  - `MetricsResponse`
  - `Module`
  - `ModulesListResponse` (с pagination)
  - `ModuleDetailsResponse`
  - `Specification`
  - Enum для статусов: `'excellent' | 'good' | 'warning' | 'critical'`
- [ ] Все типы экспортируются из одного файла
- [ ] TypeScript компилируется без ошибок: `npm run type-check`

**Зависимости:** T0

**Примерное время:** 20 минут

---

## T2: Создание mock data generator с Faker

**Описание:** Реализовать `app/api/lib/mockDataGenerator.ts` для генерации тестовых данных.

**Acceptance Criteria:**
- [ ] Функция `generateMetrics()` возвращает `MetricsResponse` с:
  - `overallCoverage` между 50-95%
  - `trend` массив из 14 дней
  - `modulesCount`, `specsCovered`, `specsTotal`
- [ ] Функция `generateModules(count: number)` генерирует массив модулей:
  - Каждый модуль имеет `id`, `name`, `coverage`, `covered`, `total`, `status`, `lastUpdated`
  - Статус вычисляется правильно по покрытию (>=95 → excellent, etc.)
  - Все данные генерируются с фиксированным seed (reproducible)
- [ ] Функция `generateModuleDetails(moduleId: number)` возвращает модуль + его спецификации
- [ ] Каждый модуль имеет 15-30 спецификаций
- [ ] npm install @faker-js/faker выполнен

**Зависимости:** T1

**Примерное время:** 45 минут

---

## T3: API Route `/api/metrics`

**Описание:** Создать GET endpoint для общих метрик покрытия.

**Acceptance Criteria:**
- [ ] Файл `app/api/metrics/route.ts` создан
- [ ] GET запрос к `/api/metrics` возвращает 200 с корректной структурой `MetricsResponse`
- [ ] Данные приходят в правильном JSON формате
- [ ] Тестовый запрос: `curl http://localhost:3000/api/metrics` возвращает valid JSON

**Зависимости:** T2

**Примерное время:** 30 минут

---

## T4: API Route `/api/modules` с фильтрацией и пагинацией

**Описание:** Создать GET endpoint для списка модулей с поддержкой поиска, фильтрации по статусу и пагинации.

**Acceptance Criteria:**
- [ ] Файл `app/api/modules/route.ts` создан
- [ ] GET параметры поддерживаются:
  - `search` (фильтр по названию модуля)
  - `status` (comma-separated: excellent,good,warning,critical)
  - `page` (номер страницы, по умолчанию 1)
  - `limit` (размер страницы, по умолчанию 50)
- [ ] Ответ содержит `{ data: Module[], pagination: { page, limit, total, totalPages } }`
- [ ] Фильтрация работает корректно (тестовые запросы):
  - `/api/modules?search=auth` — возвращает только модули с "auth" в названии
  - `/api/modules?status=excellent` — возвращает только модули со статусом excellent
  - `/api/modules?page=2&limit=5` — возвращает правильную страницу
- [ ] HTTP статус 200 при успехе, 400 при плохих параметрах

**Зависимости:** T2

**Примерное время:** 45 минут

---

## T5: API Route `/api/modules/[id]`

**Описание:** Создать GET endpoint для деталей конкретного модуля со списком его спецификаций.

**Acceptance Criteria:**
- [ ] Файл `app/api/modules/[id]/route.ts` создан
- [ ] GET `/api/modules/1` возвращает 200 с `ModuleDetailsResponse`
- [ ] Ответ содержит:
  - Модуль: `id`, `name`, `coverage`, `covered`, `total`, `status`
  - Массив спецификаций: `id`, `name`, `covered`, `lastUpdated`
- [ ] GET `/api/modules/999` (несуществующий ID) возвращает 404
- [ ] Спецификации генерируются правильно (каждый модуль имеет свои спеки)

**Зависимости:** T2

**Примерное время:** 30 минут

---

## T6: Zustand store для UI состояния

**Описание:** Создать `src/stores/uiStore.ts` для управления фильтрами и состоянием UI.

**Acceptance Criteria:**
- [ ] Файл `src/stores/uiStore.ts` создан
- [ ] Store содержит state:
  - `searchQuery: string`
  - `selectedStatuses: ('excellent' | 'good' | 'warning' | 'critical')[]`
- [ ] Store содержит actions:
  - `setSearchQuery(query: string)`
  - `toggleStatus(status: string)` (добавляет/удаляет статус)
  - `resetFilters()` (очищает поиск и фильтры)
- [ ] Store работает с React hooks
- [ ] Простой тест: создание store, изменение состояния, чтение обновленного значения

**Зависимости:** T0 (Zustand уже в dependencies)

**Примерное время:** 30 минут

---

## T7: TanStack Query hooks для API запросов

**Описание:** Создать custom hooks в `src/hooks/` для управления загрузкой данных через TanStack Query.

**Acceptance Criteria:**
- [ ] Файл `src/hooks/useMetrics.ts`:
  - Экспортирует hook `useMetrics()`
  - Возвращает `{ data, isLoading, error }`
  - Автоматически загружает `/api/metrics`
  - Кэширует результат
- [ ] Файл `src/hooks/useModules.ts`:
  - Экспортирует hook `useModules(searchQuery, statuses, page, limit)`
  - Динамически подстраивается под параметры (переинициирует запрос при изменении)
  - Возвращает `{ data, isLoading, error, pagination }`
  - Query ключ строится как `['modules', searchQuery, statuses, page, limit]` (правильный кэширование)
- [ ] Файл `src/hooks/useModuleDetails.ts`:
  - Экспортирует hook `useModuleDetails(moduleId)`
  - Загружает `/api/modules/[moduleId]`
  - Возвращает `{ data, isLoading, error }`
- [ ] Все hooks используют правильную конфигурацию TanStack Query (retry, staleTime, etc.)

**Зависимости:** T1, T3, T4, T5 (API routes готовы)

**Примерное время:** 50 минут

---

## T8: Layout и базовые компоненты

**Описание:** Создать `app/layout.tsx`, базовый хедер, компонент LoadingSpinner.

**Acceptance Criteria:**
- [ ] `app/layout.tsx` содержит:
  - Metadata: title "SDD Navigator Dashboard"
  - TanStack Query Provider обёрнут вокруг `{children}`
  - Tailwind классы для базовых стилей
- [ ] `src/components/common/LoadingSpinner.tsx` создан:
  - Экспортирует компонент с простой CSS анимацией (spinner)
  - Может принимать props для размера/цвета
- [ ] `src/components/common/ErrorBoundary.tsx` создан:
  - Ловит ошибки и показывает fallback UI
- [ ] `npm run dev` работает, приложение загружается без ошибок

**Зависимости:** T0, T7

**Примерное время:** 35 минут

---

## T9: Главный дашборд - MetricsCard

**Описание:** Создать компонент `src/components/Dashboard/MetricsCard.tsx` для отображения основной метрики.

**Acceptance Criteria:**
- [ ] Компонент `MetricsCard` отображает:
  - Большое число: общий процент покрытия (e.g., "80.7%")
  - Три показателя: количество модулей, всего спецификаций, покрытых спецификаций
- [ ] Использует Tailwind для стилей (card с фоном, border, spacing)
- [ ] Получает данные из props (или из hook)
- [ ] Состояние загрузки показывает spinner
- [ ] Состояние ошибки показывает сообщение об ошибке

**Зависимости:** T8

**Примерное время:** 30 минут

---

## T10: Главный дашборд - CoverageChart (линия)

**Описание:** Создать компонент `src/components/Dashboard/CoverageChart.tsx` для отображения тренда.

**Acceptance Criteria:**
- [ ] Компонент `CoverageChart` отображает LineChart из Recharts
- [ ] X-ось: 14 дней
- [ ] Y-ось: процент покрытия (0-100)
- [ ] Получает массив `trend` из props
- [ ] Интерактивен: hover показывает значение
- [ ] Адаптивен на мобильных (responsive)

**Зависимости:** T9, Recharts в dependencies

**Примерное время:** 30 минут

---

## T11: Главный дашборд - StatusDistributionChart (столбцы)

**Описание:** Создать компонент `src/components/Dashboard/StatusDistributionChart.tsx` для распределения модулей по статусам.

**Acceptance Criteria:**
- [ ] Компонент отображает BarChart из Recharts
- [ ] Показывает количество модулей в каждом статусе (excellent, good, warning, critical)
- [ ] Получает array модулей, сам считает распределение
- [ ] X-ось: статусы, Y-ось: количество модулей
- [ ] Интерактивен и адаптивен

**Зависимости:** T9, Recharts

**Примерное время:** 30 минут

---

## T12: Главный дашборд - SpecsCoverageChart (круг)

**Описание:** Создать компонент `src/components/Dashboard/SpecsCoverageChart.tsx` для доли покрытых спецификаций.

**Acceptance Criteria:**
- [ ] Компонент отображает PieChart или DonutChart из Recharts
- [ ] Показывает две части: покрытые спецификации, непокрытые
- [ ] Получает `specsCovered` и `specsTotal` из props
- [ ] Цвета: green для covered, gray для not covered
- [ ] Интерактивен (hover, legend)

**Зависимости:** T9, Recharts

**Примерное время:** 25 минут

---

## T13: Страница Dashboard - интеграция всех графиков

**Описание:** Создать `src/components/Dashboard/Dashboard.tsx` и `app/page.tsx` для главной страницы.

**Acceptance Criteria:**
- [ ] `app/page.tsx` импортирует `Dashboard`
- [ ] `Dashboard.tsx` содержит:
  - `useMetrics()` hook для загрузки данных
  - `MetricsCard`, `CoverageChart`, `StatusDistributionChart`, `SpecsCoverageChart`
  - Все расположены логично (сверху вниз)
  - Состояния loading/error обработаны
- [ ] Страница `/` отображается корректно
- [ ] Все три графика видны без скролла (если экран достаточно большой)
- [ ] Tailwind grid/flex используется для layout

**Зависимости:** T9, T10, T11, T12

**Примерное время:** 40 минут

---

## T14: ModuleSearchFilter компонент

**Описание:** Создать `src/components/ModulesList/ModuleSearchFilter.tsx` для поиска и фильтрации.

**Acceptance Criteria:**
- [ ] Компонент содержит:
  - Текстовое поле для поиска (по названию модуля)
  - Четыре checkboxes для статусов: excellent, good, warning, critical
- [ ] Изменение поля/checkboxes обновляет Zustand store
- [ ] Кнопка "Reset filters" очищает все
- [ ] Tailwind стили для красивого внешнего вида
- [ ] Компонент read-only (не управляет API, только UI состояние)

**Зависимости:** T6, T8

**Примерное время:** 35 минут

---

## T15: ModulesTable с виртуализацией

**Описание:** Создать `src/components/ModulesList/ModulesTable.tsx` для отображения списка модулей с react-window.

**Acceptance Criteria:**
- [ ] Компонент использует `FixedSizeList` из react-window
- [ ] Столбцы: Название, Покрытие %, Спецификаций, Статус
- [ ] Каждая строка высота ~60px
- [ ] При скролле — только видимые элементы в DOM
- [ ] Клик на строку выбирает модуль (callback)
- [ ] Цвета статусов: excellent (зелёный), good (светло-зелёный), warning (жёлтый), critical (красный)
- [ ] Пустое состояние: показывает сообщение "No modules found"

**Зависимости:** T1, react-window в dependencies

**Примерное время:** 50 минут

---

## T16: ModulesList - полная страница

**Описание:** Создать `src/components/ModulesList/ModulesList.tsx` для объединения фильтра и таблицы.

**Acceptance Criteria:**
- [ ] Компонент содержит:
  - `ModuleSearchFilter` сверху
  - `ModulesTable` снизу
- [ ] Использует `useModules(searchQuery, statuses, page, limit)` hook
- [ ] При изменении фильтров в Zustand store → новый запрос к API
- [ ] Состояния loading/error обработаны
- [ ] При скролле таблицы → загружает новые страницы (если есть пагинация)
- [ ] Клик на строку сохраняет выбранный модуль или навигирует на деталь

**Зависимости:** T14, T15, T7

**Примерное время:** 40 минут

---

## T17: Страница модуля - компонент SpecificationsTable

**Описание:** Создать `src/components/ModuleDetails/SpecificationsTable.tsx` для списка спецификаций модуля.

**Acceptance Criteria:**
- [ ] Компонент отображает таблицу спецификаций:
  - Столбцы: Название спецификации, Статус (covered/not covered), Дата проверки
  - Статус показан значком или текстом с цветом (зелёный/красный)
- [ ] Получает `specifications` из props
- [ ] Tailwind стили (похожий стиль на ModulesTable)
- [ ] Пустое состояние: "No specifications"

**Зависимости:** T1, T8

**Примерное время:** 30 минут

---

## T18: Страница модуля - ModuleDetails компонент

**Описание:** Создать `src/components/ModuleDetails/ModuleDetails.tsx` для отображения деталей модуля.

**Acceptance Criteria:**
- [ ] Компонент содержит:
  - Название модуля + метрики (покрытие %, количество спецификаций)
  - `SpecificationsTable` со списком спецификаций
  - Кнопка "Back to modules" для возврата
- [ ] Использует `useModuleDetails(id)` hook
- [ ] Состояния loading/error обработаны
- [ ] Клик "Back" навигирует на `/modules` (или используется browser back)

**Зависимости:** T17, T7

**Примерное время:** 30 минут

---

## T19: Маршрут для страницы модуля `/modules/[id]`

**Описание:** Создать `app/modules/[id]/page.tsx` для отображения деталей модуля.

**Acceptance Criteria:**
- [ ] Файл `app/modules/[id]/page.tsx` создан
- [ ] Страница получает параметр `id` из URL
- [ ] Импортирует `ModuleDetails` компонент
- [ ] Передаёт `id` в компонент
- [ ] Навигация работает: `/modules/1`, `/modules/2` и т.д.
- [ ] Страница отображается корректно

**Зависимости:** T18

**Примерное время:** 20 минут

---

## T20: Главная страница - добавить ссылку на модули

**Описание:** Обновить `app/page.tsx` для добавления навигации на список модулей.

**Acceptance Criteria:**
- [ ] Главная страница содержит кнопку/ссылку "View all modules"
- [ ] Клик навигирует на `/modules` (или где находится ModulesList)
- [ ] Или добавить ModulesList на отдельной странице `/modules`
- [ ] Навигация между дашбордом и списком модулей работает

**Зависимости:** T13, T16, T19

**Примерное время:** 20 минут

---

## T21: Unit тесты для утилит и хуков

**Описание:** Написать unit тесты для критических функций.

**Acceptance Criteria:**
- [ ] Файл `src/hooks/__tests__/useMetrics.test.ts` — тесты для hook
  - Проверяет что hook возвращает правильную структуру
  - Проверяет loading и error состояния
- [ ] Файл `src/stores/__tests__/uiStore.test.ts` — тесты для Zustand store
  - Проверяет setSearchQuery, toggleStatus, resetFilters
- [ ] Файл `src/utils/__tests__/calculateStatus.test.ts` — тесты для вычисления статуса
  - Проверяет что >=95% → excellent, 80-94% → good, и т.д.
- [ ] Все тесты проходят: `npm run test`
- [ ] Минимум 70% покрытие критических функций

**Зависимости:** T6, T7, T8

**Примерное время:** 45 минут

---

## T22: Integration тесты

**Описание:** Написать integration тесты для ключевых сценариев.

**Acceptance Criteria:**
- [ ] Тест T22.1: Загрузка главного дашборда
  - Проверяет что `/api/metrics` вызывается
  - Проверяет что данные отображаются корректно
- [ ] Тест T22.2: Загрузка списка модулей
  - Проверяет что `/api/modules` вызывается
  - Проверяет что таблица отображается
- [ ] Тест T22.3: Клик на модуль → загрузка деталей
  - Проверяет что `/api/modules/[id]` вызывается
  - Проверяет что детали отображаются
- [ ] Тест T22.4: Фильтрация модулей
  - Вводит поиск в SearchFilter
  - Проверяет что API вызывается с query params
- [ ] Все тесты проходят: `npm run test`

**Зависимости:** T13, T16, T18, T21

**Примерное время:** 60 минут

---

## T23: ESLint и Prettier конфигурация

**Описание:** Убедиться что ESLint и Prettier настроены и работают.

**Acceptance Criteria:**
- [ ] `.eslintrc.json` или `.eslintrc.js` содержит:
  - `next/core-web-vitals` конфиг
  - Rules для TypeScript
  - Правила для React hooks
- [ ] `.prettierrc.json` содержит:
  - `printWidth: 100`
  - `singleQuote: true`
  - Остальные стандартные опции
- [ ] `npm run lint` не выводит ошибок для кода
- [ ] `npm run format` форматирует код автоматически
- [ ] Оба скрипта работают корректно

**Зависимости:** T0

**Примерное время:** 25 минут

---

## T24: GitHub Actions CI/CD pipeline

**Описание:** Создать `.github/workflows/ci.yml` для автоматических проверок.

**Acceptance Criteria:**
- [ ] Файл `.github/workflows/ci.yml` создан с этапами:
  - Checkout кода
  - Установка Node.js 20
  - npm install
  - ESLint (npm run lint)
  - Prettier check (npm run format:check)
  - TypeScript (npm run type-check)
  - Тесты (npm run test)
  - Next.js build (npm run build)
- [ ] Workflow запускается на push и PR
- [ ] Все проверки должны пройти перед мержем
- [ ] Workflow отображается в GitHub UI

**Зависимости:** T23, T22

**Примерное время:** 30 минут

---

## T25: README и документация

**Описание:** Написать `README.md` с описанием проекта и инструкциями.

**Acceptance Criteria:**
- [ ] `README.md` содержит:
  - Краткое описание проекта
  - Требования (Node.js 20+)
  - Инструкции по установке: `npm install`
  - Инструкции по запуску: `npm run dev`
  - Инструкции по сборке: `npm run build`
  - Структура проекта (папки и что в них)
- [ ] Раздел "API" с примерами запросов:
  - GET /api/metrics
  - GET /api/modules?search=&status=
  - GET /api/modules/[id]
- [ ] Раздел "Scripts" с описанием npm команд
- [ ] Раздел "Дальнейшее развитие" (из плана)

**Зависимости:** T24

**Примерное время:** 40 минут

---

## T26: Финальная проверка и cleanup

**Описание:** Финальная проверка всего приложения, cleanup кода, рефакторинг.

**Acceptance Criteria:**
- [ ] `npm run dev` работает без ошибок и warnings
- [ ] `npm run build` проходит успешно
- [ ] `npm run lint` не выводит ошибок
- [ ] `npm run test` все тесты проходят
- [ ] Все соответствие спецификации (S1-S5) проверено вручную
- [ ] Нет console.log, commented code, временных переменных
- [ ] Git история clean (логичные коммиты)

**Зависимости:** Все T1-T25

**Примерное время:** 45 минут

---

## 📊 Сводка задач

| № | Задача | Время | Статус |
|---|--------|-------|--------|
| T0 | Инициализация проекта | 30 мин | ⬜ |
| T1 | TypeScript типы | 20 мин | ⬜ |
| T2 | Mock Data Generator | 45 мин | ⬜ |
| T3 | `/api/metrics` | 30 мин | ⬜ |
| T4 | `/api/modules` | 45 мин | ⬜ |
| T5 | `/api/modules/[id]` | 30 мин | ⬜ |
| T6 | Zustand store | 30 мин | ⬜ |
| T7 | TanStack Query hooks | 50 мин | ⬜ |
| T8 | Layout и базовые компоненты | 35 мин | ⬜ |
| T9 | MetricsCard | 30 мин | ⬜ |
| T10 | CoverageChart | 30 мин | ⬜ |
| T11 | StatusDistributionChart | 30 мин | ⬜ |
| T12 | SpecsCoverageChart | 25 мин | ⬜ |
| T13 | Dashboard интеграция | 40 мин | ⬜ |
| T14 | ModuleSearchFilter | 35 мин | ⬜ |
| T15 | ModulesTable | 50 мин | ⬜ |
| T16 | ModulesList страница | 40 мин | ⬜ |
| T17 | SpecificationsTable | 30 мин | ⬜ |
| T18 | ModuleDetails | 30 мин | ⬜ |
| T19 | Маршрут `/modules/[id]` | 20 мин | ⬜ |
| T20 | Навигация дашборд → модули | 20 мин | ⬜ |
| T21 | Unit тесты | 45 мин | ⬜ |
| T22 | Integration тесты | 60 мин | ⬜ |
| T23 | ESLint + Prettier | 25 мин | ⬜ |
| T24 | GitHub Actions | 30 мин | ⬜ |
| T25 | README | 40 мин | ⬜ |
| T26 | Финальная проверка | 45 мин | ⬜ |

**Итого: ~13.5 часов работы**

---

## 🎯 Рекомендуемый порядок выполнения

**Блок 1 (Setup & API):** T0 → T1 → T2 → T3 → T4 → T5 (базис)  
**Блок 2 (State & Hooks):** T6 → T7 (управление данными)  
**Блок 3 (Dashboard):** T8 → T9 → T10 → T11 → T12 → T13 (главная страница)  
**Блок 4 (ModulesList):** T14 → T15 → T16 (список)  
**Блок 5 (ModuleDetails):** T17 → T18 → T19 (детали)  
**Блок 6 (Navigation):** T20 (связь между страницами)  
**Блок 7 (Quality):** T21 → T22 → T23 → T24 → T25 → T26 (тесты, docs, CI/CD)

Каждый блок может быть выполнен параллельно, если готовы зависимости.