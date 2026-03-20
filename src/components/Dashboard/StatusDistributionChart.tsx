'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Module } from '@/src/types'

interface StatusDistributionChartProps {
  modules: Module[]
  isLoading: boolean
  error?: Error | null
  height?: number
}

export function StatusDistributionChart({ modules, isLoading, error, height = 300 }: StatusDistributionChartProps) {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Failed to load chart</p>
      </div>
    )
  }

  if (isLoading || !modules || modules.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg h-80 animate-pulse">
        <div className="h-full bg-gray-200 rounded" />
      </div>
    )
  }

  // Count modules by status
  const statuses = { excellent: 0, good: 0, warning: 0, critical: 0 }
  modules.forEach((m) => {
    statuses[m.status]++
  })

  const data = [
    { name: 'Excellent', count: statuses.excellent, fill: '#10b981' },
    { name: 'Good', count: statuses.good, fill: '#84cc16' },
    { name: 'Warning', count: statuses.warning, fill: '#f59e0b' },
    { name: 'Critical', count: statuses.critical, fill: '#ef4444' },
  ]

  return (
    <div className="">
      <h3 className="text-lg font-semibold mb-4">Modules by Status</h3>
      <ResponsiveContainer width="100%" height={height}>
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
