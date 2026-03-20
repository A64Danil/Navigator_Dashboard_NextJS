import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ModulesListResponse, ModuleStatus } from '@/src/types';

interface UseModulesProps {
  search: string;
  statuses: ModuleStatus[];
  page: number;
  limit: number;
}

export function useModules({ search, statuses, page, limit }: UseModulesProps) {
  // Build stable string for statuses to avoid query key issues
  const statusesKey = statuses.length > 0 ? statuses.sort().join(',') : 'all';

  return useQuery<ModulesListResponse>({
    queryKey: ['modules', search || '', statusesKey, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search && search.trim()) params.append('search', search.trim());
      if (statuses.length > 0) params.append('status', statuses.join(','));
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await fetch(`/api/modules?${params}`);
      if (!response.ok) throw new Error('Failed to fetch modules');
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData, // Keep previous data while fetching new one
  });
}
