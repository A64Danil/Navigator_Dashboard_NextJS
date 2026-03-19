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
          <SpecificationsTable specifications={module.specifications || []} isLoading={false} />
        </div>
      </div>
    </div>
  )
}
