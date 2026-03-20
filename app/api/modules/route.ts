import { NextRequest, NextResponse } from 'next/server';
import { generateAllModules, filterModules } from '../lib/mockDataGenerator';
import { ModuleStatus } from '@/src/types';

/**
 * GET /api/modules?search=&status=&page=&limit=
 *
 * Query parameters:
 * - search: string (optional) — filter by module name
 * - status: string (optional) — comma-separated: excellent,good,warning,critical
 * - page: number (default 1) — page number
 * - limit: number (default 50) — page size
 *
 * Response: ModulesListResponse (from src/types/index.ts)
 * Status: 200 (success) | 400 (bad params) | 500 (server error)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse parameters
    const search = searchParams.get('search')?.trim() || '';
    const statusParam = searchParams.get('status') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '50')));

    // Parse statuses (comma-separated)
    const statuses: ModuleStatus[] = statusParam
      .split(',')
      .map((s) => s.trim())
      .filter((s) => ['excellent', 'good', 'warning', 'critical'].includes(s)) as ModuleStatus[];

    // Generate all modules
    const allModules = generateAllModules();

    // Filter
    const filtered = filterModules(allModules, search, statuses);

    // Paginate
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return NextResponse.json(
      {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching modules:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
