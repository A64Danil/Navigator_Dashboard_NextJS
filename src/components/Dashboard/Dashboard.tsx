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
  // Используем хуки вместо моков
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useMetrics()

  // Загружаем модули без фильтров для распределения по статусам
  const { data: modulesResponse, isLoading: modulesLoading, error: modulesError } = useModules({
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
        {/* Главная метрика */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-8 text-gray-900">SDD Navigator Dashboard</h1>
        </div>

        {/* Coverage Trend - полная ширина */}
        <div className="mb-8">
          <CoverageChart trend={metrics?.trend || []} isLoading={false} />
        </div>

        {/* Три карточки в одну строку - Overall Coverage, Modules by Status, Specifications Coverage */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 p-6 bg-white border border-gray-200 rounded-lg">
          <MetricsCard metrics={metrics || null} isLoading={false} />
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
