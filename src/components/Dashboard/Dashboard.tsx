'use client'

import { useState } from 'react'
import { useMetrics } from '@/src/hooks/useMetrics'
import { useModules } from '@/src/hooks/useModules'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { ErrorMessage } from '../common/ErrorBoundary'
import { MetricsCard } from './MetricsCard'
import { CoverageChart } from './CoverageChart'
import { StatusDistributionChart } from './StatusDistributionChart'
import { SpecsCoverageChart } from './SpecsCoverageChart'
import { ModulesTable } from '../ModulesList/ModulesTable'
import Link from 'next/link'
import { ModuleStatus } from '@/src/types'

export function Dashboard() {
  // Высота для карточек с графиками
  const chartHeight = 200

  // Используем хуки вместо моков
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useMetrics()

  // Загружаем модули без фильтров для распределения по статусам
  const { data: modulesResponse, isLoading: modulesLoading, error: modulesError } = useModules({
    search: '',
    statuses: [],
    page: 1,
    limit: 100,
  })

  // Состояние для фильтрации на клиенте
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<ModuleStatus[]>([])

  const allModules = modulesResponse?.data || []
  
  // Клиентская фильтрация модулей
  const filteredModules = allModules.filter((module) => {
    const matchesSearch = searchQuery
      ? module.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    const matchesStatus = selectedStatuses.length > 0
      ? selectedStatuses.includes(module.status)
      : true
    return matchesSearch && matchesStatus
  })

  const isLoading = metricsLoading || modulesLoading

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Проверяем что все данные загружены перед рендером
  if (!metrics || !allModules || allModules.length === 0) {
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
        </div>

        {/* Grid: первая строка - CoverageChart, вторая строка - три равномерных элемента */}
        <div className="mb-8 p-4 bg-white border border-gray-200 rounded-lg">
          {/* Первая строка: CoverageChart на 100% */}
          <div className="border-b border-gray-200 pb-2 mb-4">
            <CoverageChart trend={metrics?.trend || []} isLoading={false} />
          </div>
          
          {/* Вторая строка: три равномерных элемента */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <MetricsCard metrics={metrics || null} isLoading={false} />
            <StatusDistributionChart modules={allModules} isLoading={false} height={chartHeight} />
            <SpecsCoverageChart metrics={metrics || null} isLoading={false} height={chartHeight} />
          </div>
        </div>

        {/* Секция модулей с фильтрами */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Modules</h2>
            <Link
              href="/modules"
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              View All Modules →
            </Link>
          </div>
          
          {/* Фильтры и таблица модулей */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Поиск и фильтры по статусу */}
            <div className="p-4 border-b border-gray-200">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Фильтры по статусу */}
              <div className="flex flex-wrap gap-4">
                {(['excellent', 'good', 'warning', 'critical'] as const).map((status) => (
                  <label key={status} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes(status)}
                      onChange={() => {
                        setSelectedStatuses((prev) =>
                          prev.includes(status)
                            ? prev.filter((s) => s !== status)
                            : [...prev, status]
                        )
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">{status}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Таблица модулей */}
            <ModulesTable
              modules={filteredModules.slice(0, 10)}
              isLoading={false}
              onModuleClick={(moduleId) => {
                window.location.href = `/modules/${moduleId}`
              }}
            />
            
            {/* Информация о количестве */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
              Showing {Math.min(10, filteredModules.length)} of {allModules.length} modules
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
