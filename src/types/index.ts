// Status enum for modules
export type ModuleStatus = 'excellent' | 'good' | 'warning' | 'critical'

// Interface for one specification
export interface Specification {
  id: number
  name: string
  covered: boolean
  lastUpdated: string // ISO 8601, e.g., "2025-03-19T10:30:00Z"
}

// Interface for module (used in list and details)
export interface Module {
  id: number
  name: string
  coverage: number // percentage, e.g., 85.5
  covered: number // number of covered specifications
  total: number // total specifications
  status: ModuleStatus // computed: >=95 → excellent, 80-94 → good, 60-79 → warning, <60 → critical
  lastUpdated: string // ISO 8601
}

// Response for GET /api/metrics
export interface MetricsResponse {
  overallCoverage: number // percentage, e.g., 80.7
  modulesCount: number
  specsCovered: number // total covered specifications
  specsTotal: number // total specifications
  lastUpdated: string // ISO 8601
  trend: number[] // array of 14 days, e.g., [75, 76, 78, 79, 80, 80.5, 80.7]
}

// Pagination for modules list
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Response for GET /api/modules?search=&status=&page=&limit=
export interface ModulesListResponse {
  data: Module[]
  pagination: Pagination
}

// Response for GET /api/modules/[id]
export interface ModuleDetailsResponse extends Module {
  specifications: Specification[]
}

// Zustand store types
export interface UIStore {
  searchQuery: string
  selectedStatuses: ModuleStatus[]
  setSearchQuery: (query: string) => void
  toggleStatus: (status: ModuleStatus) => void
  resetFilters: () => void
}
