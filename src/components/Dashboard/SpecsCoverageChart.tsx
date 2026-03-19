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
