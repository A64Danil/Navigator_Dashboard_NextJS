'use client';

import { ModuleStatus } from '@/src/types';

interface ModuleSearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStatuses: ModuleStatus[];
  onStatusToggle: (status: ModuleStatus) => void;
  onReset: () => void;
}

const STATUS_OPTIONS: { label: string; value: ModuleStatus }[] = [
  { label: 'Excellent', value: 'excellent' },
  { label: 'Good', value: 'good' },
  { label: 'Warning', value: 'warning' },
  { label: 'Critical', value: 'critical' },
];

export function ModuleSearchFilter({
  searchQuery,
  onSearchChange,
  selectedStatuses,
  onStatusToggle,
  onReset,
}: ModuleSearchFilterProps) {
  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg mb-6">
      <h3 className="text-lg font-semibold mb-4">Filter Modules</h3>

      {/* Search field */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Search by name</label>
        <input
          type="text"
          placeholder="e.g., Authentication, User Profile..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Status filters */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
        <div className="space-y-2">
          {STATUS_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedStatuses.includes(option.value)}
                onChange={() => onStatusToggle(option.value)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Reset button */}
      <button
        onClick={onReset}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
      >
        Reset Filters
      </button>
    </div>
  );
}
