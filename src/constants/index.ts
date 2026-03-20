import { ModuleStatus } from '@/src/types'

export const STATUS_COLORS: Record<ModuleStatus, { bg: string; text: string }> = {
  excellent: { bg: 'bg-green-500', text: 'text-white' },
  good: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  warning: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  critical: { bg: 'bg-red-100', text: 'text-red-800' },
}
