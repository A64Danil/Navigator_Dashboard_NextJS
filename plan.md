# SDD Navigator Dashboard – План реализации

## 1. Контекст и решения архитектуры

Приложение представляет собой **Next.js монорепо** с интегрированным API (API Routes). Фронтенд загружает моковые данные через собственные endpoints, кэширует через TanStack Query, управляет состоянием Zustand. Все данные персистируются на клиенте через localStorage.

**Ключевое решение:** фильтрация и поиск реализованы на бэке (query params), что позволит в будущем легко подключить реальные источники данных и масштабировать.

---

## 2. Технологический стек

| Слой                      | Технология                   | Версия | Назначение                                                  |
| ------------------------- | ---------------------------- | ------ | ----------------------------------------------------------- |
| **Runtime**               | Node.js                      | 20 LTS | Сервер и инструменты сборки                                 |
| **Фреймворк**             | Next.js                      | 15+    | Фулстак приложение (API Routes + SSR/SSG)                   |
| **UI Фреймворк**          | React                        | 19+    | Компоненты и hooks                                          |
| **Стили**                 | Tailwind CSS                 | 4+     | Utility-first CSS                                           |
| **Состояние**             | Zustand                      | 5+     | Lightweight store (модальные окна, UI состояние)            |
| **Запросы к API**         | TanStack Query (React Query) | 5+     | Кэширование, синхронизация, управление серверным состоянием |
| **Графики**               | Recharts                     | 2.10+  | Линейные, столбчатые, круговые диаграммы                    |
| **Виртуализация списков** | react-window                 | 1.8+   | Оптимизация больших списков (виртуальная прокрутка)         |
| **Тестирование**          | Vitest + Testing Library     | latest | Unit + Integration тесты                                    |
| **Линтер**                | ESLint                       | 9+     | Проверка кода                                               |
| **Форматирование**        | Prettier                     | 4+     | Единообразный стиль                                         |
| **TypeScript**            | TypeScript                   | 5.3+   | Type-safety                                                 |

---

## 3. Архитектура и компоненты

### Структура проекта

```
sdd-navigator-dashboard/
├── app/
│   ├── api/
│   │   ├── metrics/
│   │   │   └── route.ts
│   │   ├── modules/
│   │   │   ├── route.ts (GET с фильтрами, поиском, пагинацией)
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   └── lib/
│   │       └── mockDataGenerator.ts (Faker с seed)
│   ├── layout.tsx
│   ├── page.tsx (главный дашборд S1)
│   └── modules/
│       └── [id]/
│           └── page.tsx (детали модуля S3)
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── MetricsCard.tsx
│   │   │   ├── CoverageChart.tsx
│   │   │   ├── StatusDistributionChart.tsx
│   │   │   └── SpecsCoverageChart.tsx
│   │   ├── ModulesList/
│   │   │   ├── ModulesList.tsx
│   │   │   ├── ModulesTable.tsx (с react-window виртуализация)
│   │   │   ├── ModuleSearchFilter.tsx (поле поиска, чекбоксы фильтров)
│   │   │   └── ModuleRow.tsx
│   │   ├── ModuleDetails/
│   │   │   ├── ModuleDetails.tsx
│   │   │   └── SpecificationsTable.tsx
│   │   └── common/
│   │       ├── LoadingSpinner.tsx
│   │       └── ErrorBoundary.tsx
│   ├── hooks/
│   │   ├── useMetrics.ts (TanStack Query)
│   │   ├── useModules.ts (TanStack Query с фильтрами)
│   │   └── useModuleDetails.ts (TanStack Query по ID)
│   ├── stores/
│   │   └── uiStore.ts (Zustand: фильтры, поиск, состояние UI)
│   ├── types/
│   │   └── index.ts (TypeScript интерфейсы)
│   └── utils/
│       └── apiClient.ts (wrapper fetch)
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── .eslintrc.json
├── .prettierrc.json
└── README.md
```

---

## 4. Модель данных

### API Response структуры

**GET /api/metrics**

```typescript
interface MetricsResponse {
  overallCoverage: number; // 0-100, одна дробь (e.g., 80.7)
  modulesCount: number;
  specsCovered: number;
  specsTotal: number;
  lastUpdated: string; // ISO 8601
  trend: number[]; // последние 14 дней, e.g., [75, 76, 78, ..., 80.7]
}
```

**GET /api/modules?search=&status=&page=&limit=**

```typescript
interface ModulesListResponse {
  data: Module[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface Module {
  id: number;
  name: string;
  coverage: number; // %
  covered: number; // кол-во покрытых спецификаций
  total: number; // всего спецификаций
  status: 'excellent' | 'good' | 'warning' | 'critical';
  lastUpdated: string; // ISO 8601
}
```

Query params (на бэке обработаны):

- `search=string` — фильтр по названию модуля
- `status=excellent,good,warning,critical` — comma-separated статусы
- `page=1` — номер страницы (для пагинации под капотом, но используется для виртуализации)
- `limit=50` — количество элементов на странице (оптимально для виртуализации)

**GET /api/modules/[id]**

```typescript
interface ModuleDetailsResponse {
  id: number;
  name: string;
  coverage: number;
  covered: number;
  total: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  specifications: Specification[];
}

interface Specification {
  id: number;
  name: string;
  covered: boolean;
  lastUpdated: string; // ISO 8601
}
```

### TypeScript интерфейсы (src/types/index.ts)

```typescript
// Экспортируем все типы отсюда
export interface Metric { ... }
export interface Module { ... }
export interface Specification { ... }
// и т.д.
```

---

## 5. Основные архитектурные решения

### 5.1 Генерация данных (мок)

**Файл:** `app/api/lib/mockDataGenerator.ts`

- Используем **@faker-js/faker** для генерации реалистичных данных
- **Фиксированный seed** для воспроизводимости (e.g., `faker.seed(42)`)
- Данные генерируются **на лету** при каждом запросе (в MVP)
- **Позже:** можно добавить Redis кэш или файловую систему для персистентности на сервере

**Персистентность на клиенте:**

- TanStack Query автоматически кэширует ответы в памяти браузера
- localStorage используется для сохранения состояния UI фильтров (опционально)
- При рефреше браузера: новая генерация данных (но то же значение благодаря seed)

### 5.2 Управление состоянием

**Zustand (src/stores/uiStore.ts):**

```typescript
interface UIStore {
  // Фильтры для модулей
  searchQuery: string;
  selectedStatuses: ('excellent' | 'good' | 'warning' | 'critical')[];

  // Методы
  setSearchQuery: (query: string) => void;
  toggleStatus: (status: string) => void;
  resetFilters: () => void;

  // Персистентность (опционально, сохраняем в localStorage)
  persist: (config: any) => any;
}
```

**TanStack Query (Custom Hooks):**

- `useMetrics()` — загружает метрики, автоматический кэш и refetch
- `useModules(searchQuery, selectedStatuses, page, limit)` — загружает модули с фильтрацией, кэширует по ключам
- `useModuleDetails(id)` — загружает детали модуля

### 5.3 Фильтрация и поиск (на бэке)

**Фронтенд:**

1. Пользователь вводит поиск → Zustand обновляет состояние
2. React Query trigger новый запрос: `/api/modules?search=auth&status=good`
3. Бэк фильтрует и возвращает результат
4. React Query кэширует результат по ключу `['modules', searchQuery, statuses, page, limit]`
5. UI обновляется

**Бэк (app/api/modules/route.ts):**

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status')?.split(',') || [];
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');

  // Генерируем все модули (или читаем из кэша)
  const allModules = generateAllModules();

  // Фильтруем на бэке
  let filtered = allModules;
  if (search)
    filtered = filtered.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));
  if (status.length > 0) filtered = filtered.filter((m) => status.includes(m.status));

  // Пагинируем
  const total = filtered.length;
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return Response.json({
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
```

### 5.4 Виртуализация (react-window)

**Компонент ModulesList:**

- Используем `FixedSizeList` из react-window
- Каждая строка имеет фиксированную высоту (~60px)
- При скролле — только видимые элементы в DOM
- Загружаем данные страницами (limit=50) → по мере скролла загружаем новые страницы

```typescript
import { FixedSizeList } from 'react-window'

<FixedSizeList
  height={600}
  itemCount={modules.length}
  itemSize={60}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <ModuleRow module={modules[index]} />
    </div>
  )}
</FixedSizeList>
```

### 5.5 Графики

**Три графика на S1 (Dashboard.tsx):**

1. **Линейный график** (CoverageChart) — тренд за 14 дней
2. **Столбчатая диаграмма** (StatusDistributionChart) — распределение по статусам
3. **Круговая диаграмма** (SpecsCoverageChart) — доля covered vs not covered

Все используют **Recharts** с интерактивностью (hover, tooltip, legend).

---

## 6. Примерный набор модулей (MVP)

Для тестирования дашборда используем 12 модулей (Faker с разными покрытиями):

1. **Authentication & Authorization** — 85% (good)
2. **User Profile & Account Management** — 97% (excellent)
3. **Dashboard & Analytics** — 88% (good)
4. **Projects & Workspaces** — 72% (warning)
5. **Team Management** — 91% (excellent)
6. **File Management & Storage** — 65% (warning)
7. **Notifications & Messaging** — 79% (warning)
8. **Search & Filtering** — 52% (critical)
9. **Integrations & Webhooks** — 61% (warning)
10. **Billing & Subscription** — 68% (warning)
11. **Admin Panel & Audit Logs** — 82% (good)
12. **Help, Support & Documentation** — 76% (warning)

Каждый модуль имеет 15–30 спецификаций. Тренд за 14 дней генерируется с постепенным ростом или спадом покрытия.

---

## 7. API и HTTP коды

| Endpoint            | Метод | Статус успеха | Ошибки                  |
| ------------------- | ----- | ------------- | ----------------------- |
| `/api/metrics`      | GET   | 200           | 500 (сервер)            |
| `/api/modules`      | GET   | 200           | 400 (плохой query), 500 |
| `/api/modules/[id]` | GET   | 200           | 404 (не найден), 500    |

**Обработка ошибок:**

- 4xx на клиенте → TanStack Query выбросит ошибку, UI покажет error boundary
- 5xx на сервере → retry логика TanStack Query (по умолчанию 3 попытки)

---

## 8. CI/CD и качество

### GitHub Actions Pipeline

**На каждый PR и push:**

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: npm install
      - run: npm run lint # ESLint
      - run: npm run format:check # Prettier
      - run: npm run type-check # TypeScript
      - run: npm run test # Vitest (unit + integration)
      - run: npm run build # Next.js build
```

### Обязательные проверки:

- ✅ **ESLint** — code quality
- ✅ **Prettier** — consistent formatting
- ✅ **TypeScript** — type-safety (`tsc --noEmit`)
- ✅ **Unit + Integration тесты** — минимум 70% покрытия критических функций
- ✅ **Next.js build** — убедиться что всё собирается

### Тестирование (Vitest + Testing Library)

**Unit тесты:**

- Расчёт покрытия (формула)
- Определение статуса по % покрытия
- Фильтрация и поиск на бэке

**Integration тесты:**

- Загрузка дашборда (запрос `/api/metrics`)
- Загрузка списка модулей (запрос `/api/modules`)
- Клик на модуль → загрузка деталей (запрос `/api/modules/[id]`)
- Фильтрация модулей (API с query params)

---

## 9. Развертывание

### Локально

```bash
npm install
npm run dev  # http://localhost:3000
```

### GitHub Pages (статический экспорт)

Next.js экспортируется как статический сайт:

```bash
npm run build
npm run export
# Коммитим `out/` в gh-pages branch
```

### Собственный хостинг

Можно развернуть как Node.js приложение (без статического экспорта) для использования API Routes на боевом сервере.

---

## 10. Скрипты в package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "export": "next export"
  }
}
```

---

## 11. Зависимости (package.json)

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "zustand": "^5.0.0",
    "@tanstack/react-query": "^5.0.0",
    "recharts": "^2.10.0",
    "react-window": "^1.8.0",
    "tailwindcss": "^4.0.0",
    "@faker-js/faker": "^8.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "eslint": "^9.0.0",
    "prettier": "^4.0.0",
    "vitest": "^2.0.0",
    "@testing-library/react": "^15.0.0",
    "@testing-library/user-event": "^15.0.0"
  }
}
```

---

## 12. Дальнейшее развитие (не в MVP)

- Подключение реального API (Jira, TestRail) вместо моков
- Сохранение истории трендов в БД
- E2E тесты (Cypress, Playwright)
- PWA и offline mode
- Сравнение версий спецификаций
- Экспорт отчётов (PDF)
