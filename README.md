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
- `npm run start` — Start production server
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
│   │   ├── ModulesList/   # Modules list components
│   │   ├── ModuleDetails/ # Module details components
│   │   └── common/        # Shared components
│   ├── hooks/             # Custom React hooks
│   │   ├── useMetrics.ts
│   │   ├── useModules.ts
│   │   └── useModuleDetails.ts
│   ├── stores/            # Zustand stores
│   │   └── uiStore.ts
│   ├── types/             # TypeScript types
│   │   └── index.ts
│   ├── providers/         # Context providers
│   │   └── QueryProvider.tsx
│   ├── utils/             # Utility functions
│   └── __tests__/         # Integration tests
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
2. **Frontend Filtering** — Filters are applied on API backend (query params)
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
