'use client';

import { Specification } from '@/src/types';

interface SpecificationsTableProps {
  specifications: Specification[];
  isLoading: boolean;
  error?: Error | null;
}

export function SpecificationsTable({
  specifications,
  isLoading,
  error,
}: SpecificationsTableProps) {
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Failed to load specifications</p>
      </div>
    );
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
    );
  }

  if (!specifications || specifications.length === 0) {
    return (
      <div className="p-6 bg-white border border-gray-200 rounded-lg text-center text-gray-500">
        No specifications found
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 border-b border-gray-200 font-semibold text-sm">
        <div>Specification Name</div>
        <div className="text-center">Status</div>
        <div className="text-right">Last Updated</div>
      </div>

      {/* Rows */}
      {specifications.map((spec) => (
        <div
          key={spec.id}
          className="grid grid-cols-3 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50"
        >
          <div className="text-gray-900">{spec.name}</div>
          <div className="text-center">
            {spec.covered ? (
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Covered
              </span>
            ) : (
              <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                Not Covered
              </span>
            )}
          </div>
          <div className="text-right text-sm text-gray-500">
            {new Date(spec.lastUpdated).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}
