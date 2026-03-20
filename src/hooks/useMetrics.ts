import { useQuery } from '@tanstack/react-query';
import { MetricsResponse } from '@/src/types';

export function useMetrics() {
  return useQuery<MetricsResponse>({
    queryKey: ['metrics'],
    queryFn: async () => {
      const response = await fetch('/api/metrics');
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
