'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useModules } from '@/src/hooks/useModules'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { ModulesTable } from './ModulesTable'
import { ModuleStatus } from '@/src/types'

export function ModulesList() {
  const router = useRouter()

  // Локальное состояние для фильтров (как на главной странице)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<ModuleStatus[]>([])

  // Загружаем модули с фильтрами
  const { data: modulesResponse, isLoading, error } = useModules({
    search: searchQuery,
    statuses: selectedStatuses,
    page: 1,
    limit: 100,
  })

  const modules = modulesResponse?.data || []

  const handleModuleClick = (moduleId: number) => {
    router.push(`/modules/${moduleId}`)
  }

  const handleStatusToggle = (status: ModuleStatus) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    )
  }

  const handleReset = () => {
    setSearchQuery('')
    setSelectedStatuses([])
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">All Modules</h1>
        </div>

        {/* Фильтры — такой же стиль как на главной */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
          {/* Поиск */}
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Фильтры по статусу */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-wrap gap-4">
              {(['excellent', 'good', 'warning', 'critical'] as const).map((status) => (
                <label key={status} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(status)}
                    onChange={() => handleStatusToggle(status)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">{status}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Кнопка сброса */}
          <div className="p-4 bg-gray-50">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition text-sm"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Таблица */}
        <ModulesTable modules={modules} isLoading={isLoading} error={error} onModuleClick={handleModuleClick} />

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
