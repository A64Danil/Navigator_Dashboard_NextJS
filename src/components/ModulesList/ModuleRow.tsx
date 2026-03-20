'use client';

import { Module } from '@/src/types';
import { STATUS_COLORS } from '@/src/constants';

interface ModuleRowProps {
  module: Module;
  onClick?: () => void;
}

export function ModuleRow({ module, onClick }: ModuleRowProps) {
  const colors = STATUS_COLORS[module.status];

  return (
    <div
      onClick={onClick}
      className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition"
    >
      <div className="font-medium text-gray-900">{module.name}</div>
      <div className="text-right text-gray-700">{module.coverage}%</div>
      <div className="text-right text-gray-700">
        {module.covered} / {module.total}
      </div>
      <div className="text-center">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
        >
          {module.status}
        </span>
      </div>
    </div>
  );
}
