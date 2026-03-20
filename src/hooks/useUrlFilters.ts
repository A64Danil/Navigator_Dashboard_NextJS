'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ModuleStatus } from '@/src/types';

interface UseUrlFiltersProps {
  basePath?: string;
}

export function useUrlFilters({ basePath = '/modules' }: UseUrlFiltersProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Читаем фильтры из URL
  const searchQuery = searchParams.get('search') || '';
  const selectedStatuses = useMemo(
    () => (searchParams.get('status')?.split(',').filter(Boolean) || []) as ModuleStatus[],
    [searchParams]
  );

  // Обновляем URL при изменении фильтров
  const setSearchQuery = useCallback(
    (query: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set('search', query);
      } else {
        params.delete('search');
      }
      const queryString = params.toString();
      router.replace(`${basePath}${queryString ? `?${queryString}` : ''}`, { scroll: false });
    },
    [router, searchParams, basePath]
  );

  const toggleStatus = useCallback(
    (status: ModuleStatus) => {
      const params = new URLSearchParams(searchParams.toString());
      const currentStatuses = params.get('status')?.split(',').filter(Boolean) || [];

      if (currentStatuses.includes(status)) {
        const newStatuses = currentStatuses.filter((s) => s !== status);
        if (newStatuses.length > 0) {
          params.set('status', newStatuses.join(','));
        } else {
          params.delete('status');
        }
      } else {
        currentStatuses.push(status);
        params.set('status', currentStatuses.join(','));
      }

      const queryString = params.toString();
      router.replace(`${basePath}${queryString ? `?${queryString}` : ''}`, { scroll: false });
    },
    [router, searchParams, basePath]
  );

  const resetFilters = useCallback(() => {
    router.replace(basePath, { scroll: false });
  }, [router, basePath]);

  return {
    searchQuery,
    selectedStatuses,
    setSearchQuery,
    toggleStatus,
    resetFilters,
  };
}
