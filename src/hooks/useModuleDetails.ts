import { useQuery } from '@tanstack/react-query';
import { ModuleDetailsResponse } from '@/src/types';

export function useModuleDetails(moduleId: number) {
  return useQuery<ModuleDetailsResponse>({
    queryKey: ['moduleDetails', moduleId],
    queryFn: async () => {
      const response = await fetch(`/api/modules/${moduleId}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error('Module not found');
        throw new Error('Failed to fetch module details');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!moduleId,
  });
}
