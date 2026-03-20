'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUIStore } from '@/src/stores/uiStore'
import { ModuleStatus } from '@/src/types'

export function useFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Zustand store для состояния
  const { searchQuery, selectedStatuses, setSearchQuery, toggleStatus, resetFilters } = useUIStore()
  
  // Флаг для отслеживания первой загрузки
  const isInitialized = useRef(false)

  // При первой загрузке читаем из URL
  useEffect(() => {
    if (!isInitialized.current) {
      const urlSearch = searchParams.get('search') || ''
      const urlStatuses = (searchParams.get('status')?.split(',').filter(Boolean) || []) as ModuleStatus[]
      
      // Устанавливаем только если в store пусто и в URL есть данные
      if (!searchQuery && urlSearch) {
        setSearchQuery(urlSearch)
      }
      if (selectedStatuses.length === 0 && urlStatuses.length > 0) {
        urlStatuses.forEach(status => {
          if (!selectedStatuses.includes(status)) {
            toggleStatus(status)
          }
        })
      }
      
      isInitialized.current = true
    }
  }, [searchParams, searchQuery, selectedStatuses, setSearchQuery, toggleStatus])

  // Обновляем URL при изменении Zustand state (без перезагрузки)
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (selectedStatuses.length > 0) params.set('status', selectedStatuses.join(','))
    
    const newQueryString = params.toString()
    const currentPath = window.location.pathname
    const currentQueryString = window.location.search.slice(1)
    
    // Не обновляем если URL уже соответствует
    if (newQueryString === currentQueryString) return
    if (!newQueryString && !currentQueryString) return
    
    router.replace(newQueryString ? `?${newQueryString}` : '/', { scroll: false })
  }, [router, searchQuery, selectedStatuses])

  // Оборачиваем setSearchQuery чтобы обновлять URL
  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query)
  }, [setSearchQuery])

  // Оборачиваем toggleStatus чтобы обновлять URL
  const handleToggleStatus = useCallback((status: ModuleStatus) => {
    toggleStatus(status)
  }, [toggleStatus])

  // Оборачиваем resetFilters чтобы обновлять URL
  const handleResetFilters = useCallback(() => {
    resetFilters()
  }, [resetFilters])

  return {
    searchQuery,
    selectedStatuses,
    setSearchQuery: handleSetSearchQuery,
    toggleStatus: handleToggleStatus,
    resetFilters: handleResetFilters,
    updateUrl, // вызывать после изменения state
  }
}
