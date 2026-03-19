import { create } from 'zustand'
import { UIStore, ModuleStatus } from '@/src/types'

export const useUIStore = create<UIStore>((set) => ({
  searchQuery: '',
  selectedStatuses: [],

  setSearchQuery: (query: string) => set({ searchQuery: query }),

  toggleStatus: (status: ModuleStatus) =>
    set((state) => ({
      selectedStatuses: state.selectedStatuses.includes(status)
        ? state.selectedStatuses.filter((s) => s !== status)
        : [...state.selectedStatuses, status],
    })),

  resetFilters: () =>
    set({
      searchQuery: '',
      selectedStatuses: [],
    }),
}))
