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
    <div className="p-6">
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
