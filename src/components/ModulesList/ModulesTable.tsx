'use client'

import { FixedSizeList as List } from 'react-window'
import { Module } from '@/src/types'
import { ModuleRow } from './ModuleRow'

interface ModulesTableProps {
  modules: Module[]
  isLoading: boolean
  error?: Error | null
  onModuleClick?: (moduleId: number) => void
}

export function ModulesTable({ modules, isLoading, error, onModuleClick }: ModulesTableProps) {
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Failed to load modules</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-6 bg-white border border-gray-200 rounded-lg animate-pulse">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (!modules || modules.length === 0) {
    return (
      <div className="p-6 bg-white border border-gray-200 rounded-lg text-center text-gray-500">
        No modules found
      </div>
    )
  }

  // Table header
  const TableHeader = () => (
    <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 border-b border-gray-200 font-semibold text-sm">
      <div>Module Name</div>
      <div className="text-right">Coverage</div>
      <div className="text-right">Specifications</div>
      <div className="text-center">Status</div>
    </div>
  )

  // Table row
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <ModuleRow module={modules[index]} onClick={() => onModuleClick?.(modules[index].id)} />
    </div>
  )

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <TableHeader />
      <List height={600} itemCount={modules.length} itemSize={60} width="100%">
        {Row}
      </List>
    </div>
  )
}
