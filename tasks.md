# SDD Navigator Dashboard – Декомпозиция задач (для ИИ-агентов)

**Важно:** Каждая задача сформулирована для ИИ-агента. Указаны точные пути файлов, импорты и связи между задачами.

---

## БЛОК 1: SETUP И FOUNDATION (3 часа)

### T0: Инициализация Next.js проекта с конфигурацией

**Цель:** Создать базовый Next.js проект со всеми зависимостями и конфигом.

**Точные действия:**

1. Выполнить команду для создания Next.js проекта (без интерактивных вопросов):
   ```bash
   npx create-next-app@latest sdd-navigator-dashboard \
     --typescript \
     --tailwind \
     --app \
     --eslint \
     --no-git \
     --import-alias '@/*'
   ```

2. Установить зависимости (одна команда для автоматизации):
   ```bash
   npm install zustand @tanstack/react-query @faker-js/faker recharts react-window && npm install --save-dev vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/dom prettier @types/node
   ```

3. Создать структуру папок:
   ```bash
   mkdir -p src/components/Dashboard
   mkdir -p src/components/ModulesList
   mkdir -p src/components/ModuleDetails
   mkdir -p src/components/common
   mkdir -p src/stores
   mkdir -p src/hooks
   mkdir -p src/types
   mkdir -p src/utils
   mkdir -p app/api/lib
   mkdir -p app/modules
   ```

4. Обновить `next.config.js` добавить:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     reactStrictMode: true,
   }
   module.exports = nextConfig
   ```

5. Создать `.prettierrc.json`:
   ```json
   {
     "printWidth": 100,
     "semi": true,
     "singleQuote": true,
     "trailingComma": "es5",
     "tabWidth": 2
   }
   ```

**Acceptance Criteria:**
- [ ] `npm run dev` запускается на `http://localhost:3000`
- [ ] Проект собирается: `npm run build`
- [ ] Все папки созданы как указано выше

**Зависимости:** Нет

**Время:** 30 минут

---

### T1: Создание TypeScript типов (единый источник истины)

**Цель:** Определить все TypeScript интерфейсы, которые будут использоваться везде (API, компоненты, hooks).

**Точные действия:**

Создать файл `src/types/index.ts` с содержимым:

```typescript
// Status enum для модулей
export type ModuleStatus = 'excellent' | 'good' | 'warning' | 'critical'

// Интерфейс для одной спецификации
export interface Specification {
  id: number
  name: string
  covered: boolean
  lastUpdated: string // ISO 8601, e.g., "2025-03-19T10:30:00Z"
}

// Интерфейс для модуля (используется в списке и деталях)
export interface Module {
  id: number
  name: string
  coverage: number // процент, e.g., 85.5
  covered: number // количество покрытых спецификаций
  total: number // всего спецификаций
  status: ModuleStatus // вычисляется: >=95 → excellent, 80-94 → good, 60-79 → warning, <60 → critical
  lastUpdated: string // ISO 8601
}

// Ответ для GET /api/metrics
export interface MetricsResponse {
  overallCoverage: number // процент, e.g., 80.7
  modulesCount: number
  specsCovered: number // всего покрытых спецификаций
  specsTotal: number // всего спецификаций
  lastUpdated: string // ISO 8601
  trend: number[] // массив из 14 дней, e.g., [75, 76, 78, 79, 80, 80.5, 80.7]
}

// Пагинация для списка модулей
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Ответ для GET /api/modules?search=&status=&page=&limit=
export interface ModulesListResponse {
  data: Module[]
  pagination: Pagination
}

// Ответ для GET /api/modules/[id]
export interface ModuleDetailsResponse extends Module {
  specifications: Specification[]
}

// Zustand store типы
export interface UIStore {
  searchQuery: string
  selectedStatuses: ModuleStatus[]
  setSearchQuery: (query: string) => void
  toggleStatus: (status: ModuleStatus) => void
  resetFilters: () => void
}
```

**Файл:** `src/types/index.ts`

**Acceptance Criteria:**
- [ ] Файл `src/types/index.ts` содержит все интерфейсы как выше
- [ ] TypeScript компилируется без ошибок: `npx tsc --noEmit`
- [ ] Все типы экспортируются из одного файла

**Зависимости:** T0

**Время:** 25 минут

---

### T2: Создание Mock Data Generator с Faker

**Цель:** Реализовать функции для генерации моковых данных с фиксированным seed (reproducible).

**Точные действия:**

Создать файл `app/api/lib/mockDataGenerator.ts`:

```typescript
import { faker } from '@faker-js/faker'
import {
  MetricsResponse,
  Module,
  ModuleDetailsResponse,
  Specification,
  ModuleStatus,
} from '@/src/types'

// Функция для сброса Faker с одинаковым seed
// ВАЖНО: seed это stateful, поэтому сбрасываем перед каждой основной генерацией
function resetFaker() {
  faker.seed(42)
}

resetFaker()

// Список из спецификации (план.md раздел 6)
const MODULE_NAMES = [
  'Authentication & Authorization',
  'User Profile & Account Management',
  'Dashboard & Analytics',
  'Projects & Workspaces',
  'Team Management',
  'File Management & Storage',
  'Notifications & Messaging',
  'Search & Filtering',
  'Integrations & Webhooks',
  'Billing & Subscription',
  'Admin Panel & Audit Logs',
  'Help, Support & Documentation',
]

/**
 * Вспомогательная функция: определить статус модуля по % покрытия
 * Правило из спецификации:
 * - excellent ≥95%
 * - good 80–94%
 * - warning 60–79%
 * - critical <60%
 */
function getStatusByPercentage(coverage: number): ModuleStatus {
  if (coverage >= 95) return 'excellent'
  if (coverage >= 80) return 'good'
  if (coverage >= 60) return 'warning'
  return 'critical'
}

/**
 * Генерирует одну спецификацию
 */
function generateSpecification(specId: number): Specification {
  const endpoints = [
    'POST /api/login',
    'POST /api/logout',
    'GET /api/profile',
    'PUT /api/profile',
    'GET /api/modules',
    'GET /api/modules/:id',
    'POST /api/search',
    'POST /api/filter',
    'GET /api/metrics',
    'POST /api/subscribe',
  ]

  return {
    id: specId,
    name: endpoints[specId % endpoints.length] + ` [spec-${specId}]`,
    covered: faker.datatype.boolean({ probability: 0.75 }), // 75% покрытия в среднем
    lastUpdated: faker.date.recent({ days: 30 }).toISOString(),
  }
}

/**
 * Генерирует один модуль с его спецификациями
 */
function generateModule(moduleId: number): Module {
  const name = MODULE_NAMES[moduleId - 1] || `Module ${moduleId}`
  const specCount = faker.number.int({ min: 15, max: 30 })
  const coveredCount = faker.number.int({ min: 0, max: specCount })
  const coverage = Math.round((coveredCount / specCount) * 1000) / 10 // одна дробь

  return {
    id: moduleId,
    name,
    coverage,
    covered: coveredCount,
    total: specCount,
    status: getStatusByPercentage(coverage),
    lastUpdated: faker.date.recent({ days: 30 }).toISOString(),
  }
}

/**
 * Кэш для модулей чтобы гарантировать что все функции возвращают одинаковые данные
 * Генерируется один раз с seed 42
 */
let modulesCache: Module[] | null = null

function getAllModulesCached(): Module[] {
  if (!modulesCache) {
    resetFaker()
    modulesCache = Array.from({ length: MODULE_NAMES.length }, (_, i) => generateModule(i + 1))
  }
  return modulesCache
}

/**
 * Генерирует метрики покрытия (общие статистики)
 */
export function generateMetrics(): MetricsResponse {
  // Используем кэшированные модули чтобы гарантировать consistency
  const modules = getAllModulesCached()

  const specsTotal = modules.reduce((sum, m) => sum + m.total, 0)
  const specsCovered = modules.reduce((sum, m) => sum + m.covered, 0)
  const overallCoverage = Math.round((specsCovered / specsTotal) * 1000) / 10

  // Генерируем тренд за 14 дней (постепенный рост)
  resetFaker()
  const trend: number[] = []
  let currentCoverage = overallCoverage - 5
  for (let i = 0; i < 14; i++) {
    trend.push(Math.round(currentCoverage * 10) / 10)
    currentCoverage += faker.number.float({ min: 0.3, max: 0.7 })
  }
  trend[13] = overallCoverage // последний день = текущее покрытие

  return {
    overallCoverage,
    modulesCount: MODULE_NAMES.length,
    specsCovered,
    specsTotal,
    lastUpdated: new Date().toISOString(),
    trend,
  }
}

/**
 * Генерирует список всех модулей
 * Используется для /api/modules и для моковых компонентов
 */
export function generateAllModules(): Module[] {
  return getAllModulesCached()
}

/**
 * Генерирует детали одного модуля со всеми его спецификациями
 */
export function generateModuleDetails(moduleId: number): ModuleDetailsResponse {
  // Используем кэшированный модуль чтобы гарантировать что data consistent
  const allModules = getAllModulesCached()
  const module = allModules.find(m => m.id === moduleId)
  
  if (!module) {
    throw new Error(`Module with id ${moduleId} not found`)
  }

  const specCount = module.total
  const specifications: Specification[] = Array.from({ length: specCount }, (_, i) => {
    resetFaker()
    const spec = generateSpecification(i + 1)
    
    // Переписываем covered по индексу чтобы гарантировать что
    // количество покрытых спец совпадает с module.covered
    if (i < module.covered) {
      spec.covered = true
    } else {
      spec.covered = false
    }
    return spec
  })

  return {
    ...module,
    specifications,
  }
}

/**
 * Фильтрует модули по поиску и статусу
 * Используется в /api/modules endpoint
 */
export function filterModules(
  modules: Module[],
  search: string,
  statuses: ModuleStatus[]
): Module[] {
  let filtered = modules

  if (search && search.trim()) {
    const searchLower = search.toLowerCase()
    filtered = filtered.filter(m => m.name.toLowerCase().includes(searchLower))
  }

  if (statuses && statuses.length > 0) {
    filtered = filtered.filter(m => statuses.includes(m.status))
  }

  return filtered
}
```

**Файл:** `app/api/lib/mockDataGenerator.ts`

**Важные связи:**
- Импортирует типы из `src/types/index.ts`
- Использует фиксированный seed (42) для воспроизводимости
- Функции `generateMetrics()` и `generateAllModules()` будут использоваться:
  - В компонентах (T9-T16) как моки
  - В API routes (T3-T5) как данные для возврата

**Acceptance Criteria:**
- [ ] Файл `app/api/lib/mockDataGenerator.ts` содержит все функции
- [ ] `npm run dev` работает без ошибок
- [ ] Все типы импортируются из `src/types/index.ts`
- [ ] Фиксированный seed (42) используется везде

**Зависимости:** T1

**Время:** 45 минут

---

## БЛОК 2: API ROUTES (2 часа, параллельно с Блоком 3)

### T3: API Route `/api/metrics`

**Цель:** Создать GET endpoint для общих метрик покрытия.

**Точные действия:**

Создать файл `app/api/metrics/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { generateMetrics } from '../lib/mockDataGenerator'

/**
 * GET /api/metrics
 * Возвращает общие метрики покрытия спецификаций
 *
 * Response: MetricsResponse (из src/types/index.ts)
 * Status: 200 (успех) | 500 (ошибка сервера)
 */
export async function GET(request: NextRequest) {
  try {
    const metrics = generateMetrics()
    return NextResponse.json(metrics, { status: 200 })
  } catch (error) {
    console.error('Error generating metrics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Файл:** `app/api/metrics/route.ts`

**Важные связи:**
- Импортирует `generateMetrics` из `app/api/lib/mockDataGenerator.ts`
- Возвращает `MetricsResponse` (тип из `src/types/index.ts`)
- Используется компонентом Dashboard (T13) через hook (T7)

**Acceptance Criteria:**
- [ ] Файл `app/api/metrics/route.ts` создан
- [ ] `curl http://localhost:3000/api/metrics` возвращает 200 с valid JSON
- [ ] JSON соответствует структуре `MetricsResponse` из типов
- [ ] Нет ошибок в консоли

**Зависимости:** T0, T1, T2

**Время:** 25 минут

---

### T4: API Route `/api/modules` с фильтрацией и пагинацией

**Цель:** Создать GET endpoint для списка модулей с поддержкой поиска, фильтрации и пагинации.

**Точные действия:**

Создать файл `app/api/modules/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { generateAllModules, filterModules } from '../lib/mockDataGenerator'
import { ModuleStatus } from '@/src/types'

/**
 * GET /api/modules?search=&status=&page=&limit=
 *
 * Query параметры:
 * - search: string (опционально) — фильтр по названию модуля
 * - status: string (опционально) — comma-separated: excellent,good,warning,critical
 * - page: number (по умолчанию 1) — номер страницы
 * - limit: number (по умолчанию 50) — размер страницы
 *
 * Response: ModulesListResponse (из src/types/index.ts)
 * Status: 200 (успех) | 400 (плохие параметры) | 500 (ошибка сервера)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Парсим параметры
    const search = searchParams.get('search')?.trim() || ''
    const statusParam = searchParams.get('status') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '50')))

    // Парсим статусы (comma-separated)
    const statuses: ModuleStatus[] = statusParam
      .split(',')
      .map(s => s.trim())
      .filter(s => ['excellent', 'good', 'warning', 'critical'].includes(s)) as ModuleStatus[]

    // Генерируем все модули
    const allModules = generateAllModules()

    // Фильтруем
    const filtered = filterModules(allModules, search, statuses)

    // Пагинируем
    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const start = (page - 1) * limit
    const data = filtered.slice(start, start + limit)

    return NextResponse.json(
      {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching modules:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Файл:** `app/api/modules/route.ts`

**Важные связи:**
- Импортирует `generateAllModules`, `filterModules` из `app/api/lib/mockDataGenerator.ts`
- Возвращает `ModulesListResponse` (тип из `src/types/index.ts`)
- Используется компонентом ModulesList (T16) через hook (T7)

**Acceptance Criteria:**
- [ ] Файл `app/api/modules/route.ts` создан
- [ ] Тестовые запросы:
  - `curl "http://localhost:3000/api/modules"` → 200, all modules
  - `curl "http://localhost:3000/api/modules?search=auth"` → 200, filtered
  - `curl "http://localhost:3000/api/modules?status=excellent"` → 200, filtered
  - `curl "http://localhost:3000/api/modules?page=2&limit=5"` → 200, correct pagination
- [ ] JSON соответствует `ModulesListResponse`
- [ ] Нет ошибок в консоли

**Зависимости:** T0, T1, T2

**Время:** 40 минут

---

### T5: API Route `/api/modules/[id]`

**Цель:** Создать GET endpoint для деталей конкретного модуля со спецификациями.

**Точные действия:**

Создать файл `app/api/modules/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { generateModuleDetails } from '../../lib/mockDataGenerator'

/**
 * GET /api/modules/[id]
 *
 * Параметры:
 * - id: number (path parameter) — ID модуля (1-12)
 *
 * Response: ModuleDetailsResponse (из src/types/index.ts)
 * Status: 200 (успех) | 404 (модуль не найден) | 500 (ошибка сервера)
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const moduleId = parseInt(params.id)

    // Валидация
    if (isNaN(moduleId) || moduleId < 1 || moduleId > 12) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    const moduleDetails = generateModuleDetails(moduleId)
    return NextResponse.json(moduleDetails, { status: 200 })
  } catch (error) {
    console.error('Error fetching module details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Файл:** `app/api/modules/[id]/route.ts`

**Важные связи:**
- Импортирует `generateModuleDetails` из `app/api/lib/mockDataGenerator.ts`
- Возвращает `ModuleDetailsResponse` (тип из `src/types/index.ts`)
- Используется компонентом ModuleDetails (T18) через hook (T7)

**Acceptance Criteria:**
- [ ] Файл `app/api/modules/[id]/route.ts` создан
- [ ] Тестовые запросы:
  - `curl "http://localhost:3000/api/modules/1"` → 200, module details
  - `curl "http://localhost:3000/api/modules/12"` → 200, module details
  - `curl "http://localhost:3000/api/modules/999"` → 404, not found
- [ ] JSON соответствует `ModuleDetailsResponse`
- [ ] Каждый модуль имеет правильное количество спецификаций

**Зависимости:** T0, T1, T2

**Время:** 30 минут

---

## БЛОК 3: КОМПОНЕНТЫ С МОКАМИ (4 часа)

### T8: Layout с TanStack Query Provider и базовыми компонентами

**Цель:** Создать `app/layout.tsx` и базовые компоненты для loading и error состояний.

**Точные действия:**

1. Обновить `app/layout.tsx`:

```typescript
import type { Metadata } from 'next'
import { ReactNode } from 'react'
import QueryProvider from '@/src/providers/QueryProvider'
import '@/app/globals.css'

export const metadata: Metadata = {
  title: 'SDD Navigator Dashboard',
  description: 'Visualization and analysis of specification coverage metrics',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
```

2. Создать файл `src/providers/QueryProvider.tsx`:

```typescript
'use client'

import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 минут
      gcTime: 1000 * 60 * 10, // 10 минут (раньше cacheTime)
    },
  },
})

export default function QueryProvider({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
```

3. Создать `src/components/common/LoadingSpinner.tsx`:

```typescript
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin`} />
    </div>
  )
}
```

4. Создать `src/components/common/ErrorBoundary.tsx`:

```typescript
'use client'

import { ReactNode } from 'react'

export function ErrorMessage({ message }: { message?: string }) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
      <p className="text-red-800">
        {message || 'An error occurred. Please try again later.'}
      </p>
    </div>
  )
}
```

**Файлы:**
- `app/layout.tsx` (обновить)
- `src/providers/QueryProvider.tsx` (новый)
- `src/components/common/LoadingSpinner.tsx` (новый)
- `src/components/common/ErrorBoundary.tsx` (новый)

**Acceptance Criteria:**
- [ ] `npm run dev` работает без ошибок
- [ ] TanStack Query Provider обёрнут вокруг приложения
- [ ] LoadingSpinner и ErrorMessage компоненты работают
- [ ] Layout компилируется без ошибок

**Зависимости:** T0

**Время:** 30 минут

---

### T9: Dashboard компонент - MetricsCard

**Цель:** Создать компонент для отображения основной метрики покрытия.

**Точные действия:**

Создать файл `src/components/Dashboard/MetricsCard.tsx`:

```typescript
'use client'

import { MetricsResponse } from '@/src/types'

interface MetricsCardProps {
  metrics: MetricsResponse | null
  isLoading: boolean
  error?: Error | null
}

export function MetricsCard({ metrics, isLoading, error }: MetricsCardProps) {
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Failed to load metrics</p>
      </div>
    )
  }

  if (isLoading || !metrics) {
    return (
      <div className="p-6 bg-white border border-gray-200 rounded-lg animate-pulse">
        <div className="h-12 bg-gray-200 rounded w-20 mb-4" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-24" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
      <div className="mb-6">
        <p className="text-gray-600 text-sm font-medium mb-2">Overall Coverage</p>
        <p className="text-5xl font-bold text-blue-600">{metrics.overallCoverage}%</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-gray-600 text-sm">Modules</p>
          <p className="text-2xl font-semibold">{metrics.modulesCount}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">Specs Covered</p>
          <p className="text-2xl font-semibold">{metrics.specsCovered}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">Total Specs</p>
          <p className="text-2xl font-semibold">{metrics.specsTotal}</p>
        </div>
      </div>

      <p className="text-gray-500 text-xs mt-4">
        Last updated: {new Date(metrics.lastUpdated).toLocaleDateString()}
      </p>
    </div>
  )
}
```

**Файл:** `src/components/Dashboard/MetricsCard.tsx`

**Важные связи:**
- Импортирует `MetricsResponse` из `src/types/index.ts`
- Принимает `metrics`, `isLoading`, `error` как props
- Используется в Dashboard (T13) с моковыми данными на этом этапе

**Acceptance Criteria:**
- [ ] Компонент отображает % покрытия, количество модулей, спецификаций
- [ ] Состояние loading показывает skeleton
- [ ] Состояние error показывает сообщение об ошибке
- [ ] Компонент принимает props правильного типа

**Зависимости:** T1, T8

**Время:** 25 минут

---

### T10: Dashboard компонент - CoverageChart (линейный график)

**Цель:** Создать компонент для визуализации тренда покрытия за 14 дней.

**Точные действия:**

Создать файл `src/components/Dashboard/CoverageChart.tsx`:

```typescript
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface CoverageChartProps {
  trend: number[]
  isLoading: boolean
  error?: Error | null
}

export function CoverageChart({ trend, isLoading, error }: CoverageChartProps) {
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Failed to load chart</p>
      </div>
    )
  }

  if (isLoading || !trend || trend.length === 0) {
    return (
      <div className="p-6 bg-white border border-gray-200 rounded-lg h-80 animate-pulse">
        <div className="h-full bg-gray-200 rounded" />
      </div>
    )
  }

  // Преобразуем массив в объекты с датами для Recharts
  const data = trend.map((coverage, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (13 - index))
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      coverage,
    }
  })

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Coverage Trend (14 days)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} label={{ value: 'Coverage %', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="coverage"
            stroke="#3b82f6"
            name="Coverage %"
            dot={{ fill: '#3b82f6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

**Файл:** `src/components/Dashboard/CoverageChart.tsx`

**Важные связи:**
- Импортирует компоненты из `recharts`
- Принимает `trend` (массив чисел), `isLoading`, `error` как props
- Используется в Dashboard (T13) с моковыми данными

**Acceptance Criteria:**
- [ ] Компонент отображает LineChart с 14 точками
- [ ] X-ось показывает даты, Y-ось показывает %
- [ ] Интерактивен (hover показывает значение)
- [ ] Адаптивен на мобильных (ResponsiveContainer)

**Зависимости:** T0 (Recharts в dependencies), T8

**Время:** 30 минут

---

### T11: Dashboard компонент - StatusDistributionChart (столбчатая диаграмма)

**Цель:** Создать компонент для визуализации распределения модулей по статусам.

**Точные действия:**

Создать файл `src/components/Dashboard/StatusDistributionChart.tsx`:

```typescript
'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Module } from '@/src/types'

interface StatusDistributionChartProps {
  modules: Module[]
  isLoading: boolean
  error?: Error | null
}

export function StatusDistributionChart({ modules, isLoading, error }: StatusDistributionChartProps) {
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Failed to load chart</p>
      </div>
    )
  }

  if (isLoading || !modules || modules.length === 0) {
    return (
      <div className="p-6 bg-white border border-gray-200 rounded-lg h-80 animate-pulse">
        <div className="h-full bg-gray-200 rounded" />
      </div>
    )
  }

  // Считаем количество модулей по статусам
  const statuses = { excellent: 0, good: 0, warning: 0, critical: 0 }
  modules.forEach(m => {
    statuses[m.status]++
  })

  const data = [
    { name: 'Excellent', count: statuses.excellent, fill: '#10b981' },
    { name: 'Good', count: statuses.good, fill: '#84cc16' },
    { name: 'Warning', count: statuses.warning, fill: '#f59e0b' },
    { name: 'Critical', count: statuses.critical, fill: '#ef4444' },
  ]

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Modules by Status</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

**Файл:** `src/components/Dashboard/StatusDistributionChart.tsx`

**Важные связи:**
- Импортирует `Module` из `src/types/index.ts`
- Принимает массив модулей и сам считает распределение по статусам
- Используется в Dashboard (T13) с моковыми данными

**Acceptance Criteria:**
- [ ] Компонент отображает BarChart с 4 столбцами (excellent, good, warning, critical)
- [ ] Цвета: зелёный (excellent), жёлто-зелёный (good), жёлтый (warning), красный (critical)
- [ ] Интерактивен и адаптивен

**Зависимости:** T1, T8

**Время:** 30 минут

---

### T12: Dashboard компонент - SpecsCoverageChart (круговая диаграмма)

**Цель:** Создать компонент для визуализации доли покрытых спецификаций.

**Точные действия:**

Создать файл `src/components/Dashboard/SpecsCoverageChart.tsx`:

```typescript
'use client'

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'
import { MetricsResponse } from '@/src/types'

interface SpecsCoverageChartProps {
  metrics: MetricsResponse | null
  isLoading: boolean
  error?: Error | null
}

export function SpecsCoverageChart({ metrics, isLoading, error }: SpecsCoverageChartProps) {
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Failed to load chart</p>
      </div>
    )
  }

  if (isLoading || !metrics) {
    return (
      <div className="p-6 bg-white border border-gray-200 rounded-lg h-80 animate-pulse">
        <div className="h-full bg-gray-200 rounded" />
      </div>
    )
  }

  const covered = metrics.specsCovered
  const notCovered = metrics.specsTotal - metrics.specsCovered

  const data = [
    { name: 'Covered', value: covered },
    { name: 'Not Covered', value: notCovered },
  ]

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Specifications Coverage</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
            <Cell fill="#10b981" />
            <Cell fill="#d1d5db" />
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
```

**Файл:** `src/components/Dashboard/SpecsCoverageChart.tsx`

**Важные связи:**
- Импортирует `MetricsResponse` из `src/types/index.ts`
- Принимает `metrics` и сам считает соотношение covered/not covered
- Используется в Dashboard (T13) с моковыми данными

**Acceptance Criteria:**
- [ ] Компонент отображает PieChart с двумя сегментами (Covered, Not Covered)
- [ ] Цвета: зелёный (covered), серый (not covered)
- [ ] Интерактивен и адаптивен

**Зависимости:** T1, T8

**Время:** 25 минут

---

### T13: Dashboard страница - интеграция всех компонентов

**Цель:** Создать главную страницу приложения с моковыми данными и всеми графиками.

**Точные действия:**

1. Создать файл `src/components/Dashboard/Dashboard.tsx`:

```typescript
'use client'

import { generateMetrics, generateAllModules } from '@/app/api/lib/mockDataGenerator'
import { MetricsCard } from './MetricsCard'
import { CoverageChart } from './CoverageChart'
import { StatusDistributionChart } from './StatusDistributionChart'
import { SpecsCoverageChart } from './SpecsCoverageChart'

export function Dashboard() {
  // На этапе моков — используем данные напрямую
  // На этапе интеграции (T7) — будут заменены на hooks
  const metrics = generateMetrics()
  const modules = generateAllModules()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">SDD Navigator Dashboard</h1>

        {/* Главная метрика */}
        <div className="mb-8">
          <MetricsCard metrics={metrics} isLoading={false} />
        </div>

        {/* Три графика */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="lg:col-span-2">
            <CoverageChart trend={metrics.trend} isLoading={false} />
          </div>
          <StatusDistributionChart modules={modules} isLoading={false} />
          <SpecsCoverageChart metrics={metrics} isLoading={false} />
        </div>

        {/* Кнопка для перехода на список модулей */}
        <div className="mb-8">
          <a
            href="/modules"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            View All Modules
          </a>
        </div>
      </div>
    </div>
  )
}
```

2. Обновить `app/page.tsx`:

```typescript
import { Dashboard } from '@/src/components/Dashboard/Dashboard'

export default function Home() {
  return <Dashboard />
}
```

**Файлы:**
- `src/components/Dashboard/Dashboard.tsx` (новый)
- `app/page.tsx` (обновить)

**Важные связи:**
- Импортирует `generateMetrics`, `generateAllModules` из `app/api/lib/mockDataGenerator.ts`
- Импортирует компоненты MetricsCard, CoverageChart, StatusDistributionChart, SpecsCoverageChart
- На этом этапе использует моковые данные напрямую
- При T7 (интеграция) эти функции будут заменены на hooks

**Acceptance Criteria:**
- [ ] `npm run dev` открывает `http://localhost:3000` с дашбордом
- [ ] Видны все три графика и метрика
- [ ] Кнопка "View All Modules" работает (ссылается на `/modules`)
- [ ] Нет ошибок в консоли
- [ ] Адаптивен на мобильных

**Зависимости:** T2, T9, T10, T11, T12

**Время:** 35 минут

---

### T14: ModuleSearchFilter компонент

**Цель:** Создать компонент для поиска и фильтрации модулей.

**Точные действия:**

Создать файл `src/components/ModulesList/ModuleSearchFilter.tsx`:

```typescript
'use client'

import { ModuleStatus } from '@/src/types'

interface ModuleSearchFilterProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedStatuses: ModuleStatus[]
  onStatusToggle: (status: ModuleStatus) => void
  onReset: () => void
}

const STATUS_OPTIONS: { label: string; value: ModuleStatus }[] = [
  { label: 'Excellent', value: 'excellent' },
  { label: 'Good', value: 'good' },
  { label: 'Warning', value: 'warning' },
  { label: 'Critical', value: 'critical' },
]

export function ModuleSearchFilter({
  searchQuery,
  onSearchChange,
  selectedStatuses,
  onStatusToggle,
  onReset,
}: ModuleSearchFilterProps) {
  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg mb-6">
      <h3 className="text-lg font-semibold mb-4">Filter Modules</h3>

      {/* Поле поиска */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Search by name</label>
        <input
          type="text"
          placeholder="e.g., Authentication, User Profile..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Фильтры по статусу */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
        <div className="space-y-2">
          {STATUS_OPTIONS.map(option => (
            <label key={option.value} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedStatuses.includes(option.value)}
                onChange={() => onStatusToggle(option.value)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Кнопка reset */}
      <button
        onClick={onReset}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
      >
        Reset Filters
      </button>
    </div>
  )
}
```

**Файл:** `src/components/ModulesList/ModuleSearchFilter.tsx`

**Важные связи:**
- Импортирует `ModuleStatus` из `src/types/index.ts`
- Принимает props для управления поиском и фильтрами
- Вызывает callback'и при изменении
- На этапе моков используется просто для UI
- При T7 будет интегрирован с Zustand store

**Acceptance Criteria:**
- [ ] Компонент отображает поле поиска
- [ ] Компонент отображает 4 checkbox'а для статусов
- [ ] Компонент отображает кнопку "Reset Filters"
- [ ] Все callback'и вызываются правильно

**Зависимости:** T1, T8

**Время:** 30 минут

---

### T15: ModulesTable компонент с виртуализацией

**Цель:** Создать компонент таблицы модулей с react-window для виртуализации.

**Точные действия:**

Создать файл `src/components/ModulesList/ModulesTable.tsx`:

```typescript
'use client'

import { FixedSizeList as List } from 'react-window'
import { Module } from '@/src/types'
import { ModuleRow } from './ModuleRow'

interface ModulesTableProps {
  modules: Module[]
  isLoading: boolean
  error?: Error | null
  onModuleClick?: (moduleId: number) => void
}

export function ModulesTable({ modules, isLoading, error, onModuleClick }: ModulesTableProps) {
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Failed to load modules</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-6 bg-white border border-gray-200 rounded-lg animate-pulse">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (!modules || modules.length === 0) {
    return (
      <div className="p-6 bg-white border border-gray-200 rounded-lg text-center text-gray-500">
        No modules found
      </div>
    )
  }

  // Заголовок таблицы
  const TableHeader = () => (
    <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 border-b border-gray-200 font-semibold text-sm">
      <div>Module Name</div>
      <div className="text-right">Coverage</div>
      <div className="text-right">Specifications</div>
      <div className="text-center">Status</div>
    </div>
  )

  // Строка таблицы
  const Row = ({ index, style }: { index: number; style: any }) => (
    <div style={style}>
      <ModuleRow
        module={modules[index]}
        onClick={() => onModuleClick?.(modules[index].id)}
      />
    </div>
  )

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <TableHeader />
      <List height={600} itemCount={modules.length} itemSize={60} width="100%">
        {Row}
      </List>
    </div>
  )
}
```

2. Создать файл `src/components/ModulesList/ModuleRow.tsx`:

```typescript
'use client'

import { Module } from '@/src/types'

const STATUS_COLORS = {
  excellent: { bg: 'bg-green-100', text: 'text-green-800' },
  good: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  warning: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  critical: { bg: 'bg-red-100', text: 'text-red-800' },
}

interface ModuleRowProps {
  module: Module
  onClick?: () => void
}

export function ModuleRow({ module, onClick }: ModuleRowProps) {
  const colors = STATUS_COLORS[module.status]

  return (
    <div
      onClick={onClick}
      className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition"
    >
      <div className="font-medium text-gray-900">{module.name}</div>
      <div className="text-right text-gray-700">{module.coverage}%</div>
      <div className="text-right text-gray-700">
        {module.covered} / {module.total}
      </div>
      <div className="text-center">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
          {module.status}
        </span>
      </div>
    </div>
  )
}
```

**Файлы:**
- `src/components/ModulesList/ModulesTable.tsx` (новый)
- `src/components/ModulesList/ModuleRow.tsx` (новый)

**Важные связи:**
- Импортирует `Module` из `src/types/index.ts`
- Использует `FixedSizeList` из react-window для виртуализации
- Принимает callback `onModuleClick` для навигации
- Используется в ModulesList (T16)

**Acceptance Criteria:**
- [ ] Компонент отображает таблицу с модулями
- [ ] Используется react-window для виртуализации
- [ ] При скролле — только видимые строки в DOM
- [ ] Цвета статусов правильные
- [ ] Клик на строку вызывает callback

**Зависимости:** T1, T8, react-window в dependencies

**Время:** 45 минут

---

### T16: ModulesList страница - интеграция фильтра и таблицы

**Цель:** Создать полную страницу списка модулей с моковыми данными.

**Точные действия:**

1. Создать файл `src/components/ModulesList/ModulesList.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateAllModules, filterModules } from '@/app/api/lib/mockDataGenerator'
import { ModuleStatus } from '@/src/types'
import { ModuleSearchFilter } from './ModuleSearchFilter'
import { ModulesTable } from './ModulesTable'

export function ModulesList() {
  // На этапе моков — управляем состоянием локально
  // При T7 будет интегрирован с Zustand
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<ModuleStatus[]>([])
  const router = useRouter()

  // Генерируем и фильтруем модули
  const allModules = generateAllModules()
  const filteredModules = filterModules(allModules, searchQuery, selectedStatuses)

  const handleStatusToggle = (status: ModuleStatus) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    )
  }

  const handleReset = () => {
    setSearchQuery('')
    setSelectedStatuses([])
  }

  const handleModuleClick = (moduleId: number) => {
    router.push(`/modules/${moduleId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">All Modules</h1>

        {/* Фильтр */}
        <ModuleSearchFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedStatuses={selectedStatuses}
          onStatusToggle={handleStatusToggle}
          onReset={handleReset}
        />

        {/* Таблица */}
        <ModulesTable
          modules={filteredModules}
          isLoading={false}
          onModuleClick={handleModuleClick}
        />

        {/* Информация о результатах */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredModules.length} of {allModules.length} modules
        </div>
      </div>
    </div>
  )
}
```

2. Создать файл `app/modules/page.tsx`:

```typescript
import { ModulesList } from '@/src/components/ModulesList/ModulesList'

export default function ModulesPage() {
  return <ModulesList />
}
```

**Файлы:**
- `src/components/ModulesList/ModulesList.tsx` (новый)
- `app/modules/page.tsx` (новый)

**Важные связи:**
- Импортирует `generateAllModules`, `filterModules` из `app/api/lib/mockDataGenerator.ts`
- Импортирует `ModuleSearchFilter` и `ModulesTable`
- На этапе моков использует локальное состояние (`useState`)
- При T7 будет интегрирован с Zustand и useModules hook
- Клик на модуль навигирует на `/modules/[id]`

**Acceptance Criteria:**
- [ ] `http://localhost:3000/modules` отображает список модулей
- [ ] Фильтр и поиск работают и обновляют таблицу в реальном времени
- [ ] Таблица использует виртуализацию
- [ ] Клик на модуль навигирует на страницу деталей
- [ ] Кнопка reset очищает все фильтры

**Зависимости:** T2, T14, T15

**Время:** 35 минут

---

## БЛОК 4: ИНТЕГРАЦИЯ С API (2.5 часа)

### T6: Zustand store для UI состояния

**Цель:** Создать Zustand store для управления фильтрами и UI состоянием.

**Точные действия:**

Создать файл `src/stores/uiStore.ts`:

```typescript
import { create } from 'zustand'
import { UIStore, ModuleStatus } from '@/src/types'

export const useUIStore = create<UIStore>(set => ({
  searchQuery: '',
  selectedStatuses: [],

  setSearchQuery: (query: string) => set({ searchQuery: query }),

  toggleStatus: (status: ModuleStatus) =>
    set(state => ({
      selectedStatuses: state.selectedStatuses.includes(status)
        ? state.selectedStatuses.filter(s => s !== status)
        : [...state.selectedStatuses, status],
    })),

  resetFilters: () =>
    set({
      searchQuery: '',
      selectedStatuses: [],
    }),
}))
```

**Файл:** `src/stores/uiStore.ts`

**Важные связи:**
- Импортирует `UIStore`, `ModuleStatus` из `src/types/index.ts`
- Будет использоваться в ModulesList (T16 обновить) при интеграции
- При T7 ModulesList будет получать состояние из этого store'а

**Acceptance Criteria:**
- [ ] Файл `src/stores/uiStore.ts` создан
- [ ] `useUIStore()` экспортируется и работает как React hook
- [ ] Все методы (setSearchQuery, toggleStatus, resetFilters) работают
- [ ] Состояние обновляется корректно

**Зависимости:** T1

**Время:** 20 минут

---

### T7: TanStack Query hooks для управления API запросами

**Цель:** Создать custom hooks для загрузки данных через TanStack Query.

**Точные действия:**

1. Создать файл `src/hooks/useMetrics.ts`:

```typescript
import { useQuery } from '@tanstack/react-query'
import { MetricsResponse } from '@/src/types'

export function useMetrics() {
  return useQuery<MetricsResponse>({
    queryKey: ['metrics'],
    queryFn: async () => {
      const response = await fetch('/api/metrics')
      if (!response.ok) throw new Error('Failed to fetch metrics')
      return response.json()
    },
    staleTime: 1000 * 60 * 5, // 5 минут
  })
}
```

2. Создать файл `src/hooks/useModules.ts`:

```typescript
import { useQuery } from '@tanstack/react-query'
import { ModulesListResponse, ModuleStatus } from '@/src/types'

interface UseModulesProps {
  search: string
  statuses: ModuleStatus[]
  page: number
  limit: number
}

export function useModules({ search, statuses, page, limit }: UseModulesProps) {
  // Строим stable string для statuses чтобы избежать проблем с query key
  const statusesKey = statuses.length > 0 ? statuses.sort().join(',') : 'all'

  return useQuery<ModulesListResponse>({
    queryKey: ['modules', search || '', statusesKey, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search && search.trim()) params.append('search', search.trim())
      if (statuses.length > 0) params.append('status', statuses.join(','))
      params.append('page', page.toString())
      params.append('limit', limit.toString())

      const response = await fetch(`/api/modules?${params}`)
      if (!response.ok) throw new Error('Failed to fetch modules')
      return response.json()
    },
    staleTime: 1000 * 60 * 5,
  })
}
```

3. Создать файл `src/hooks/useModuleDetails.ts`:

```typescript
import { useQuery } from '@tanstack/react-query'
import { ModuleDetailsResponse } from '@/src/types'

export function useModuleDetails(moduleId: number) {
  return useQuery<ModuleDetailsResponse>({
    queryKey: ['moduleDetails', moduleId],
    queryFn: async () => {
      const response = await fetch(`/api/modules/${moduleId}`)
      if (!response.ok) {
        if (response.status === 404) throw new Error('Module not found')
        throw new Error('Failed to fetch module details')
      }
      return response.json()
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!moduleId,
  })
}
```

**Файлы:**
- `src/hooks/useMetrics.ts` (новый)
- `src/hooks/useModules.ts` (новый)
- `src/hooks/useModuleDetails.ts` (новый)

**Важные связи:**
- Импортируют типы из `src/types/index.ts`
- Делают запросы на API routes (T3-T5)
- Query ключи построены правильно для кэширования
- Будут использоваться в компонентах при обновлении (T13, T16, T18)

**Acceptance Criteria:**
- [ ] Все три hook'а созданы
- [ ] Каждый hook возвращает `{ data, isLoading, error }`
- [ ] Query ключи построены правильно для кэширования
- [ ] Ошибки обрабатываются корректно

**Зависимости:** T1, T3, T4, T5, T8 (QueryProvider должен быть в layout'е)

**Время:** 45 минут

---

### T8-Updated: Обновить Dashboard для использования hooks вместо моков

**Цель:** Заменить моковые данные в Dashboard на реальные API запросы через hooks.

**Точные действия:**

Обновить файл `src/components/Dashboard/Dashboard.tsx`:

```typescript
'use client'

import { useMetrics } from '@/src/hooks/useMetrics'
import { useModules } from '@/src/hooks/useModules'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { ErrorMessage } from '../common/ErrorBoundary'
import { MetricsCard } from './MetricsCard'
import { CoverageChart } from './CoverageChart'
import { StatusDistributionChart } from './StatusDistributionChart'
import { SpecsCoverageChart } from './SpecsCoverageChart'

export function Dashboard() {
  // Используем hooks вместо прямого вызова generateMetrics()
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useMetrics()

  // Загружаем модули без фильтров для распределения по статусам
  const {
    data: modulesResponse,
    isLoading: modulesLoading,
    error: modulesError,
  } = useModules({
    search: '',
    statuses: [],
    page: 1,
    limit: 100,
  })

  const modules = modulesResponse?.data || []
  const isLoading = metricsLoading || modulesLoading

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Проверяем что все данные загружены перед рендером
  if (!metrics || !modules || modules.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <ErrorMessage message="Failed to load dashboard data" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">SDD Navigator Dashboard</h1>

        {/* Главная метрика */}
        <div className="mb-8">
          <MetricsCard metrics={metrics || null} isLoading={false} />
        </div>

        {/* Три графика */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="lg:col-span-2">
            <CoverageChart trend={metrics?.trend || []} isLoading={false} />
          </div>
          <StatusDistributionChart modules={modules} isLoading={false} />
          <SpecsCoverageChart metrics={metrics || null} isLoading={false} />
        </div>

        {/* Кнопка для перехода на список модулей */}
        <div className="mb-8">
          <a
            href="/modules"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            View All Modules
          </a>
        </div>
      </div>
    </div>
  )
}
```

**Файл:** `src/components/Dashboard/Dashboard.tsx` (обновить)

**Важные изменения:**
- Заменены `generateMetrics()` и `generateAllModules()` на `useMetrics()` и `useModules()` hooks
- Добавлена обработка loading и error состояний
- Данные теперь загружаются с реального API (T3-T5)
- TanStack Query автоматически кэширует результаты

**Acceptance Criteria:**
- [ ] Dashboard использует hooks вместо моков
- [ ] Данные загружаются с API (можно проверить в Network tab браузера)
- [ ] Loading и error состояния работают
- [ ] Графики отображают реальные данные

**Зависимости:** T7, T13

**Время:** 30 минут

---

### T16-Updated: Обновить ModulesList для использования Zustand и useModules hook

**Цель:** Интегрировать Zustand store и useModules hook в ModulesList.

**Точные действия:**

Обновить файл `src/components/ModulesList/ModulesList.tsx`:

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { useUIStore } from '@/src/stores/uiStore'
import { useModules } from '@/src/hooks/useModules'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { ModuleSearchFilter } from './ModuleSearchFilter'
import { ModulesTable } from './ModulesTable'

export function ModulesList() {
  const router = useRouter()

  // Получаем состояние из Zustand store
  const { searchQuery, selectedStatuses, setSearchQuery, toggleStatus, resetFilters } =
    useUIStore()

  // Загружаем модули с использованием фильтров из store
  // ВАЖНО: При изменении фильтров пагинация сбрасывается на page 1
  const { data: modulesResponse, isLoading, error } = useModules({
    search: searchQuery,
    statuses: selectedStatuses,
    page: 1, // Всегда начинаем с первой страницы при фильтрации
    limit: 100,
  })

  const modules = modulesResponse?.data || []

  const handleModuleClick = (moduleId: number) => {
    router.push(`/modules/${moduleId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">All Modules</h1>

        {/* Фильтр — состояние из Zustand */}
        <ModuleSearchFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedStatuses={selectedStatuses}
          onStatusToggle={toggleStatus}
          onReset={resetFilters}
        />

        {/* Таблица — данные из API */}
        <ModulesTable
          modules={modules}
          isLoading={isLoading}
          error={error}
          onModuleClick={handleModuleClick}
        />

        {/* Информация о результатах */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {modules.length} modules
          {searchQuery && ` matching "${searchQuery}"`}
          {selectedStatuses.length > 0 && ` with status ${selectedStatuses.join(', ')}`}
        </div>
      </div>
    </div>
  )
}
```

**Файл:** `src/components/ModulesList/ModulesList.tsx` (обновить)

**Важные изменения:**
- Используется `useUIStore()` для получения и управления фильтрами
- Используется `useModules()` hook для загрузки данных с API
- При изменении поиска или фильтров в store → автоматически переинициируется запрос
- TanStack Query кэширует результаты по ключам с фильтрами

**Acceptance Criteria:**
- [ ] ModulesList использует Zustand store для фильтров
- [ ] ModulesList использует useModules hook для загрузки
- [ ] При изменении фильтров → новый запрос к API
- [ ] Loading и error состояния работают
- [ ] Результаты фильтруются корректно на бэке

**Зависимости:** T6, T7, T16

**Время:** 30 минут

---

## БЛОК 5: ДЕТАЛИ МОДУЛЯ (1.5 часа)

### T17: SpecificationsTable компонент

**Цель:** Создать компонент таблицы спецификаций модуля.

**Точные действия:**

Создать файл `src/components/ModuleDetails/SpecificationsTable.tsx`:

```typescript
'use client'

import { Specification } from '@/src/types'

interface SpecificationsTableProps {
  specifications: Specification[]
  isLoading: boolean
  error?: Error | null
}

export function SpecificationsTable({
  specifications,
  isLoading,
  error,
}: SpecificationsTableProps) {
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Failed to load specifications</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-6 bg-white border border-gray-200 rounded-lg animate-pulse">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (!specifications || specifications.length === 0) {
    return (
      <div className="p-6 bg-white border border-gray-200 rounded-lg text-center text-gray-500">
        No specifications found
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Заголовок */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 border-b border-gray-200 font-semibold text-sm">
        <div>Specification Name</div>
        <div className="text-center">Status</div>
        <div className="text-right">Last Updated</div>
      </div>

      {/* Строки */}
      {specifications.map(spec => (
        <div key={spec.id} className="grid grid-cols-3 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50">
          <div className="text-gray-900">{spec.name}</div>
          <div className="text-center">
            {spec.covered ? (
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Covered
              </span>
            ) : (
              <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                Not Covered
              </span>
            )}
          </div>
          <div className="text-right text-sm text-gray-500">
            {new Date(spec.lastUpdated).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  )
}
```

**Файл:** `src/components/ModuleDetails/SpecificationsTable.tsx`

**Важные связи:**
- Импортирует `Specification` из `src/types/index.ts`
- Используется в ModuleDetails (T18)

**Acceptance Criteria:**
- [ ] Компонент отображает таблицу спецификаций
- [ ] Статус shown как badge (Covered = зелёный, Not Covered = красный)
- [ ] Дата форматируется понятно
- [ ] Пустое состояние обработано

**Зависимости:** T1, T8

**Время:** 25 минут

---

### T18: ModuleDetails компонент

**Цель:** Создать компонент для отображения полной информации о модуле.

**Точные действия:**

Создать файл `src/components/ModuleDetails/ModuleDetails.tsx`:

```typescript
'use client'

import Link from 'next/link'
import { useModuleDetails } from '@/src/hooks/useModuleDetails'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { ErrorMessage } from '../common/ErrorBoundary'
import { SpecificationsTable } from './SpecificationsTable'

interface ModuleDetailsProps {
  moduleId: number
}

const STATUS_COLORS = {
  excellent: { bg: 'bg-green-100', text: 'text-green-800' },
  good: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  warning: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  critical: { bg: 'bg-red-100', text: 'text-red-800' },
}

export function ModuleDetails({ moduleId }: ModuleDetailsProps) {
  const { data: module, isLoading, error } = useModuleDetails(moduleId)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !module) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/modules" className="text-blue-600 hover:underline mb-6 inline-block">
            ← Back to modules
          </Link>
          <ErrorMessage message={error?.message || 'Module not found'} />
        </div>
      </div>
    )
  }

  const colors = STATUS_COLORS[module.status]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <Link href="/modules" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Back to modules
        </Link>

        {/* Module header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{module.name}</h1>
            <span className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${colors.bg} ${colors.text}`}>
              {module.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-gray-600 text-sm">Coverage</p>
              <p className="text-3xl font-bold text-blue-600">{module.coverage}%</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Covered</p>
              <p className="text-3xl font-bold">{module.covered}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total</p>
              <p className="text-3xl font-bold">{module.total}</p>
            </div>
          </div>

          <p className="text-gray-500 text-sm mt-4">
            Last updated: {new Date(module.lastUpdated).toLocaleString()}
          </p>
        </div>

        {/* Specifications */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Specifications ({module.total})</h2>
          <SpecificationsTable
            specifications={module.specifications || []}
            isLoading={false}
          />
        </div>
      </div>
    </div>
  )
}
```

**Файл:** `src/components/ModuleDetails/ModuleDetails.tsx`

**Важные связи:**
- Импортирует `useModuleDetails` hook (T7)
- Использует `SpecificationsTable` компонент (T17)
- Загружает данные с `/api/modules/[id]` (T5)
- Импортирует типы из `src/types/index.ts`

**Acceptance Criteria:**
- [ ] Компонент загружает и отображает детали модуля
- [ ] Показывает метрики (coverage, covered, total)
- [ ] Отображает статус с правильными цветами
- [ ] Показывает таблицу спецификаций
- [ ] Back button работает

**Зависимости:** T7, T17, T8

**Время:** 30 минут

---

### T19: Маршрут `/modules/[id]` для страницы деталей

**Цель:** Создать страницу деталей модуля.

**Точные действия:**

Создать файл `app/modules/[id]/page.tsx`:

```typescript
'use client'

import { ModuleDetails } from '@/src/components/ModuleDetails/ModuleDetails'

interface ModulePageProps {
  params: { id: string }
}

export default function ModulePage({ params }: ModulePageProps) {
  const moduleId = parseInt(params.id)

  if (isNaN(moduleId)) {
    return <div className="p-6 text-red-600">Invalid module ID</div>
  }

  return <ModuleDetails moduleId={moduleId} />
}
```

**Файл:** `app/modules/[id]/page.tsx`

**Acceptance Criteria:**
- [ ] Маршрут `/modules/1`, `/modules/2` и т.д. работает
- [ ] Загружает и отображает детали модуля
- [ ] При несуществующем ID показывает ошибку

**Зависимости:** T18

**Время:** 15 минут

---

### T20: Навигация между дашбордом и модулями

**Цель:** Убедиться что навигация между страницами работает корректно.

**Точные действия:**

Проверить (не создавать, это уже сделано):
- В `Dashboard.tsx` кнопка "View All Modules" навигирует на `/modules` ✅ (T13)
- В `ModulesList.tsx` клик на модуль навигирует на `/modules/[id]` ✅ (T16)
- В `ModuleDetails.tsx` кнопка "Back to modules" навигирует на `/modules` ✅ (T18)

Тесты:
1. Открыть `http://localhost:3000/`
2. Кликнуть "View All Modules" → должно перейти на `/modules`
3. Кликнуть на любой модуль → должно перейти на `/modules/[id]`
4. Кликнуть "Back to modules" → должно вернуться на `/modules`

**Acceptance Criteria:**
- [ ] Навигация между страницами работает
- [ ] URL корректны
- [ ] Back button браузера работает

**Зависимости:** T13, T16, T18

**Время:** 10 минут

---

## БЛОК 6: КАЧЕСТВО, ТЕСТЫ, CI/CD (2.5 часа)

### T21: Unit тесты для критических функций

**Цель:** Написать unit тесты для hooks, store, утилит.

**Точные действия:**

1. Создать `src/stores/__tests__/uiStore.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react'
import { useUIStore } from '../uiStore'

describe('uiStore', () => {
  beforeEach(() => {
    useUIStore.setState({ searchQuery: '', selectedStatuses: [] })
  })

  it('should set search query', () => {
    const { result } = renderHook(() => useUIStore())
    act(() => result.current.setSearchQuery('auth'))
    expect(result.current.searchQuery).toBe('auth')
  })

  it('should toggle status', () => {
    const { result } = renderHook(() => useUIStore())
    act(() => result.current.toggleStatus('excellent'))
    expect(result.current.selectedStatuses).toContain('excellent')
    act(() => result.current.toggleStatus('excellent'))
    expect(result.current.selectedStatuses).not.toContain('excellent')
  })

  it('should reset filters', () => {
    const { result } = renderHook(() => useUIStore())
    act(() => {
      result.current.setSearchQuery('test')
      result.current.toggleStatus('excellent')
    })
    act(() => result.current.resetFilters())
    expect(result.current.searchQuery).toBe('')
    expect(result.current.selectedStatuses).toEqual([])
  })
})
```

2. Создать `app/api/lib/__tests__/mockDataGenerator.test.ts`:

```typescript
import { generateMetrics, generateAllModules, generateModuleDetails } from '../mockDataGenerator'

describe('mockDataGenerator', () => {
  it('should generate metrics with correct structure', () => {
    const metrics = generateMetrics()
    expect(metrics).toHaveProperty('overallCoverage')
    expect(metrics).toHaveProperty('modulesCount')
    expect(metrics).toHaveProperty('specsCovered')
    expect(metrics).toHaveProperty('specsTotal')
    expect(metrics).toHaveProperty('trend')
    expect(metrics.trend).toHaveLength(14)
    expect(metrics.overallCoverage).toBeGreaterThanOrEqual(0)
    expect(metrics.overallCoverage).toBeLessThanOrEqual(100)
  })

  it('should generate modules with correct status based on coverage', () => {
    const modules = generateAllModules()
    modules.forEach(module => {
      if (module.coverage >= 95) expect(module.status).toBe('excellent')
      if (module.coverage >= 80 && module.coverage < 95) expect(module.status).toBe('good')
      if (module.coverage >= 60 && module.coverage < 80) expect(module.status).toBe('warning')
      if (module.coverage < 60) expect(module.status).toBe('critical')
    })
  })

  it('should generate module details with specifications', () => {
    const moduleDetails = generateModuleDetails(1)
    expect(moduleDetails).toHaveProperty('specifications')
    expect(Array.isArray(moduleDetails.specifications)).toBe(true)
    expect(moduleDetails.specifications.length).toBe(moduleDetails.total)
  })

  it('should have reproducible data with seed', () => {
    // Модули должны быть одинаковыми при одном и том же seed
    // потому что используется кэш
    const metrics1 = generateMetrics()
    const metrics2 = generateMetrics()
    expect(metrics1.overallCoverage).toBe(metrics2.overallCoverage)
    expect(metrics1.modulesCount).toBe(metrics2.modulesCount)
  })

  it('should generate consistent data across calls', () => {
    const modules = generateAllModules()
    const metrics = generateMetrics()
    
    // Общее количество спецификаций должно совпадать
    const totalFromModules = modules.reduce((sum, m) => sum + m.total, 0)
    expect(totalFromModules).toBe(metrics.specsTotal)
    
    // Общее количество покрытых должно совпадать
    const coveredFromModules = modules.reduce((sum, m) => sum + m.covered, 0)
    expect(coveredFromModules).toBe(metrics.specsCovered)
  })
})
```

3. Обновить `vitest.config.ts` (создать если не существует):

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**ВАЖНО:** Alias в vitest должен совпадать с alias в tsconfig.json! Проверьте что в `tsconfig.json` есть:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

4. Обновить `package.json` scripts:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

**Файлы:**
- `src/stores/__tests__/uiStore.test.ts` (новый)
- `app/api/lib/__tests__/mockDataGenerator.test.ts` (новый)
- `vitest.config.ts` (новый)
- `package.json` (обновить scripts)

**Acceptance Criteria:**
- [ ] `npm run test` проходит все тесты
- [ ] Минимум 70% покрытие критических функций
- [ ] Тесты проверяют основной функционал

**Зависимости:** T6, T2, T0

**Время:** 40 минут

---

### T22: Integration тесты

**Цель:** Написать integration тесты для ключевых user flows.

**Точные действия:**

Создать `src/__tests__/integration.test.ts`:

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Dashboard } from '@/src/components/Dashboard/Dashboard'
import { ModulesList } from '@/src/components/ModulesList/ModulesList'

// Сброс Faker state перед каждым тестом
beforeEach(() => {
  // Очищаем кэш модулей чтобы Faker генерировал заново с seed 42
  jest.resetModules()
})

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }, // Отключаем retry для тестов
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('Integration Tests', () => {
  it('should load and display dashboard metrics', async () => {
    render(<Dashboard />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText(/SDD Navigator Dashboard/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/Overall Coverage/i)).toBeInTheDocument()
  })

  it('should load modules list', async () => {
    render(<ModulesList />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText(/All Modules/i)).toBeInTheDocument()
    })

    const moduleRows = screen.getAllByRole('button')
    expect(moduleRows.length).toBeGreaterThan(0)
  })

  it('should filter modules by search', async () => {
    const user = userEvent.setup()
    render(<ModulesList />, { wrapper: createWrapper() })

    const searchInput = screen.getByPlaceholderText(/Search by name/i)
    await user.type(searchInput, 'auth')

    await waitFor(() => {
      const text = screen.getByText(/Showing/i)
      expect(text).toBeInTheDocument()
    })
  })
})
```

**Файл:** `src/__tests__/integration.test.ts`

**Acceptance Criteria:**
- [ ] `npm run test` проходит все integration тесты
- [ ] Тесты проверяют основные user flows
- [ ] Используется React Testing Library best practices

**Зависимости:** T21, T13, T16

**Время:** 45 минут

---

### T23: ESLint и Prettier конфигурация

**Цель:** Убедиться что ESLint и Prettier настроены и работают корректно.

**Точные действия:**

1. Обновить или создать `.eslintrc.json`:

```json
{
  "extends": [
    "next/core-web-vitals",
    "next/typescript"
  ],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "@next/next/no-html-link-for-pages": "off",
    "react/no-unescaped-entities": "warn"
  },
  "ignorePatterns": [
    ".next",
    "out",
    "dist",
    "node_modules"
  ]
}
```

**Примечание:** `next/typescript` automatically includes type-aware linting rules.

2. Убедиться `.prettierrc.json` существует (создан в T0):

```json
{
  "printWidth": 100,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2
}
```

3. Создать `.prettierignore`:

```
node_modules
.next
out
dist
build
coverage
```

4. Обновить `package.json` scripts:

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

**Файлы:**
- `.eslintrc.json` (обновить)
- `.prettierrc.json` (проверить)
- `.prettierignore` (новый)
- `package.json` (обновить scripts)

**Acceptance Criteria:**
- [ ] `npm run lint` не выводит ошибок
- [ ] `npm run format:check` не выводит ошибок
- [ ] `npm run format` форматирует код автоматически
- [ ] `npm run lint:fix` исправляет простые ошибки

**Зависимости:** T0

**Время:** 20 минут

---

### T24: GitHub Actions CI/CD pipeline

**Цель:** Создать GitHub Actions workflow для автоматических проверок.

**Точные действия:**

Создать `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20.x]

    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Run ESLint
        run: npm run lint

      - name: Check formatting with Prettier
        run: npm run format:check

      - name: Type check with TypeScript
        run: npx tsc --noEmit

      - name: Run tests
        run: npm run test

      - name: Build Next.js
        run: npm run build
```

**Файл:** `.github/workflows/ci.yml`

**Acceptance Criteria:**
- [ ] Файл `.github/workflows/ci.yml` создан
- [ ] Workflow запускается на push и PR
- [ ] Все проверки проходят перед мержем
- [ ] Workflow видно в GitHub UI

**Зависимости:** T23, T21, T0

**Время:** 25 минут

---

### T25: README и документация

**Цель:** Написать полный README с инструкциями и описанием проекта.

**Точные действия:**

Создать `README.md`:

```markdown
# SDD Navigator Dashboard

A specification coverage visualization dashboard built with Next.js, React, and TanStack Query.

## Overview

This application displays metrics for specification coverage across modules, helping teams track and analyze documentation and testing completeness.

## Requirements

- Node.js 20 LTS or higher
- npm 10+

## Installation

```bash
npm install
```

## Running the Application

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm start` — Start production server
- `npm run lint` — Run ESLint
- `npm run lint:fix` — Fix ESLint errors
- `npm run format` — Format code with Prettier
- `npm run format:check` — Check formatting
- `npm run test` — Run unit tests
- `npm run test:ui` — Run tests with UI
- `npm run test:coverage` — Generate coverage report

## Project Structure

```
sdd-navigator-dashboard/
├── app/
│   ├── api/              # API routes
│   │   ├── metrics/      # GET /api/metrics
│   │   ├── modules/      # GET /api/modules
│   │   └── lib/          # Mock data generator
│   ├── modules/          # Module pages
│   │   └── [id]/         # Module details page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page (Dashboard)
├── src/
│   ├── components/       # React components
│   │   ├── Dashboard/    # Dashboard components
│   │   ├── ModulesList/  # Modules list components
│   │   ├── ModuleDetails/# Module details components
│   │   └── common/       # Shared components
│   ├── hooks/            # Custom React hooks
│   │   ├── useMetrics.ts
│   │   ├── useModules.ts
│   │   └── useModuleDetails.ts
│   ├── stores/           # Zustand stores
│   │   └── uiStore.ts
│   ├── types/            # TypeScript types
│   │   └── index.ts
│   ├── providers/        # Context providers
│   │   └── QueryProvider.tsx
│   ├── utils/            # Utility functions
│   └── __tests__/        # Integration tests
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

## API Endpoints

### GET /api/metrics

Returns overall coverage metrics.

**Response:**
```json
{
  "overallCoverage": 80.7,
  "modulesCount": 12,
  "specsCovered": 48,
  "specsTotal": 60,
  "lastUpdated": "2025-03-19T10:30:00Z",
  "trend": [75, 76, 78, 79, 80, 80.5, 80.7]
}
```

### GET /api/modules

Returns list of modules with optional filtering.

**Query Parameters:**
- `search` (string) — Filter by module name
- `status` (string) — Comma-separated: excellent,good,warning,critical
- `page` (number) — Page number (default: 1)
- `limit` (number) — Items per page (default: 50)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Authentication & Authorization",
      "coverage": 85,
      "covered": 17,
      "total": 20,
      "status": "good",
      "lastUpdated": "2025-03-15T14:20:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 12,
    "totalPages": 1
  }
}
```

### GET /api/modules/[id]

Returns detailed information about a specific module.

**Response:**
```json
{
  "id": 1,
  "name": "Authentication & Authorization",
  "coverage": 85,
  "covered": 17,
  "total": 20,
  "status": "good",
  "lastUpdated": "2025-03-15T14:20:00Z",
  "specifications": [
    {
      "id": 101,
      "name": "POST /auth/login",
      "covered": true,
      "lastUpdated": "2025-03-15T14:20:00Z"
    }
  ]
}
```

## Architecture

### Technology Stack

- **Next.js 15+** — React framework
- **React 19+** — UI library
- **TypeScript 5.3+** — Type safety
- **Tailwind CSS 4+** — Styling
- **Zustand 5+** — State management (UI filters)
- **TanStack Query 5+** — Server state & caching
- **Recharts 2.10+** — Charts and graphs
- **react-window 1.8+** — Virtual scrolling
- **Vitest** — Unit testing
- **Testing Library** — Component testing

### Key Decisions

1. **Moking with Faker** — Uses Faker with fixed seed for reproducible mock data
2. **Frontend Filtering** — Initially supports filtering on API backend (query params)
3. **Virtual Scrolling** — Uses react-window for efficient rendering of long module lists
4. **Zustand for UI State** — Lightweight store for search and filter state
5. **TanStack Query** — Automatic caching, deduplication, and background refetching

## Future Enhancements

- [ ] Real API integration (Jira, TestRail)
- [ ] Historical data and trend analysis
- [ ] E2E tests (Cypress)
- [ ] PWA support
- [ ] Dark mode
- [ ] Specification version comparison
- [ ] Report export (PDF)

## Testing

### Unit Tests

```bash
npm run test
```

Tests are located in `__tests__` directories throughout the project.

### Test Coverage

```bash
npm run test:coverage
```

Minimum 70% coverage for critical functions.

## Deployment

### GitHub Pages

```bash
npm run build
npm run export
# Commit `out/` to gh-pages branch
```

### Vercel

Connect your GitHub repository to Vercel — deployment happens automatically on push.

## Contributing

1. Create a feature branch: `git checkout -b feature/name`
2. Make your changes
3. Run checks: `npm run lint && npm run test && npm run build`
4. Create a pull request

## License

MIT
```

**Файл:** `README.md`

**Acceptance Criteria:**
- [ ] `README.md` содержит все необходимые разделы
- [ ] Примеры API четкие и работают
- [ ] Структура проекта описана
- [ ] Инструкции по установке и запуску полные

**Зависимости:** T25 (последний перед финальной проверкой)

**Время:** 35 минут

---

### T26: Финальная проверка и cleanup

**Цель:** Финальная проверка всего проекта и cleanup кода.

**Точные действия:**

Выполнить все проверки в порядке:

```bash
# 1. Убедиться что проект запускается
npm run dev
# (открыть http://localhost:3000, проверить что дашборд загружается)
# (перейти на http://localhost:3000/modules, проверить что список загружается)
# (кликнуть на модуль, проверить что деталь загружается)

# 2. Собрать для production
npm run build

# 3. Проверить тип
npx tsc --noEmit

# 4. Запустить линтер
npm run lint

# 5. Проверить форматирование
npm run format:check

# 6. Запустить тесты
npm run test

# 7. Проверить консоль браузера на ошибки
# (открыть DevTools → Console, должна быть пусто)

# 8. Cleanup код
npm run lint:fix
npm run format

# 9. Проверить git историю
git log --oneline
# (должны быть логичные коммиты для каждой задачи)
```

**Checklist:**

- [ ] `npm run dev` работает без ошибок
- [ ] Дашборд отображается корректно (S1)
- [ ] Список модулей отображается корректно (S2)
- [ ] Детали модуля отображается корректно (S3)
- [ ] Поиск и фильтры работают (S4)
- [ ] Навигация между страницами работает (S5)
- [ ] `npm run build` проходит успешно
- [ ] `npx tsc --noEmit` не выводит ошибок
- [ ] `npm run lint` не выводит ошибок
- [ ] `npm run format:check` не выводит ошибок
- [ ] `npm run test` все тесты проходят
- [ ] Console браузера чиста (no errors/warnings)
- [ ] Нет `console.log`, временного кода, commented code
- [ ] Git история логична (по одному коммиту на задачу)
- [ ] README полный и актуальный
- [ ] Все файлы сохранены и закоммичены

**Файлы для cleanup:**
- Удалить любые `.ts` files в `src/` с `console.log()`
- Удалить commented code
- Убедиться что все imports используются

**Acceptance Criteria:**
- [ ] Все проверки выше пройдены
- [ ] Проект готов к сдаче
- [ ] Код чист и профессионален

**Зависимости:** Все T1-T25

**Время:** 45 минут

---

## 📊 ФИНАЛЬНАЯ СВОДКА ЗАДАЧ

| Блок | № | Задача | Время |
|------|---|--------|-------|
| **Setup** | T0 | Инициализация проекта | 30 мин |
| | T1 | TypeScript типы | 25 мин |
| | T2 | Mock Data Generator | 45 мин |
| **API** | T3 | `/api/metrics` | 25 мин |
| | T4 | `/api/modules` | 40 мин |
| | T5 | `/api/modules/[id]` | 30 мин |
| **Компоненты** | T8 | Layout + базовые компоненты | 30 мин |
| | T9 | MetricsCard | 25 мин |
| | T10 | CoverageChart | 30 мин |
| | T11 | StatusDistributionChart | 30 мин |
| | T12 | SpecsCoverageChart | 25 мин |
| | T13 | Dashboard интеграция | 35 мин |
| | T14 | ModuleSearchFilter | 30 мин |
| | T15 | ModulesTable | 45 мин |
| | T16 | ModulesList страница | 35 мин |
| **Интеграция** | T6 | Zustand store | 20 мин |
| | T7 | TanStack Query hooks | 45 мин |
| | T8-U | Dashboard обновить | 30 мин |
| | T16-U | ModulesList обновить | 30 мин |
| **Детали** | T17 | SpecificationsTable | 25 мин |
| | T18 | ModuleDetails | 30 мин |
| | T19 | Маршрут `/modules/[id]` | 15 мин |
| | T20 | Навигация | 10 мин |
| **Качество** | T21 | Unit тесты | 40 мин |
| | T22 | Integration тесты | 45 мин |
| | T23 | ESLint + Prettier | 20 мин |
| | T24 | GitHub Actions | 25 мин |
| | T25 | README | 35 мин |
| | T26 | Финальная проверка | 45 мин |

**ИТОГО: ~14.5 часов работы**

---

## 🎯 РЕКОМЕНДУЕМЫЙ ПОРЯДОК ВЫПОЛНЕНИЯ

### День 1: Setup, API, Компоненты (8 часов)
```
T0 (30м) → T1 (25м) → T2 (45м)
          ↓
    T3 (25м) + T4 (40м) + T5 (30м) = 95м [параллельно]
          ↓
T8 (30м) → T9 (25м) → T10 (30м) → T11 (30м) → T12 (25м) → T13 (35м)
          ↓
T14 (30м) → T15 (45м) → T16 (35м)
```

### День 2: Интеграция, Детали, Финализация (6.5 часов)
```
T6 (20м) → T7 (45м)
         ↓
T8-U (30м) + T16-U (30м)
         ↓
T17 (25м) → T18 (30м) → T19 (15м) → T20 (10м)
         ↓
T21 (40м) → T22 (45м) → T23 (20м) → T24 (25м) → T25 (35м) → T26 (45м)
```

---

## ⚙️ ВАЖНЫЕ СВЯЗИ МЕЖДУ ЗАДАЧАМИ

```
T1 (типы)
├── Используется везде
│
T2 (моки)
├── T3, T4, T5 (API routes возвращают эти данные)
├── T9-T16 (компоненты используют для моков)
│
T3-T5 (API routes)
├── T7 (hooks делают запросы на эти routes)
│
T6 (Zustand store)
├── T16-U (ModulesList использует store)
│
T7 (hooks)
├── T8-U (Dashboard использует useMetrics)
├── T16-U (ModulesList использует useModules)
├── T18 (ModuleDetails использует useModuleDetails)
│
T13 (Dashboard)
├── T20 (навигация из Dashboard)
│
T16 (ModulesList)
├── T20 (навигация из ModulesList)
│
T18 (ModuleDetails)
├── T20 (навигация из ModuleDetails)
```