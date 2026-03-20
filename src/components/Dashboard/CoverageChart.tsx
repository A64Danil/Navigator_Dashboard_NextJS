'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface CoverageChartProps {
  trend: number[]
  isLoading: boolean
  error?: Error | null
}

export function CoverageChart({ trend, isLoading, error }: CoverageChartProps) {
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Failed to load chart</p>
      </div>
    )
  }

  if (isLoading || !trend || trend.length === 0) {
    return (
      <div className="p-6 bg-white border border-gray-200 rounded-lg h-80 animate-pulse">
        <div className="h-full bg-gray-200 rounded" />
      </div>
    )
  }

  // Convert array to objects with dates for Recharts
  const data = trend.map((coverage, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (13 - index))
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      coverage,
    }
  })

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Coverage Trend (14 days)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis 
            domain={[0, 100]} 
            tickMargin={10}
            label={{ value: 'Coverage %', angle: -90, position: 'outside', dx: -20 }}
          />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="coverage" stroke="#3b82f6" name="Coverage %" dot={{ fill: '#3b82f6' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
