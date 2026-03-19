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
  const { searchQuery, selectedStatuses, setSearchQuery, toggleStatus, resetFilters } = useUIStore()

  // Загружаем модули с использованием фильтров из store
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
