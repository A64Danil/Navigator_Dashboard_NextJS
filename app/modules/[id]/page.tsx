'use client';

import { ModuleDetails } from '@/src/components/ModuleDetails/ModuleDetails';
import { use } from 'react';

interface ModulePageProps {
  params: Promise<{ id: string }>;
}

export default function ModulePage({ params }: ModulePageProps) {
  // Next.js 15: params is a Promise
  const { id } = use(params);
  const moduleId = parseInt(id);

  if (isNaN(moduleId)) {
    return <div className="p-6 text-red-600">Invalid module ID</div>;
  }

  return <ModuleDetails moduleId={moduleId} />;
}
