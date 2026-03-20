import { NextRequest, NextResponse } from 'next/server';
import { generateModuleDetails } from '../../lib/mockDataGenerator';

/**
 * GET /api/modules/[id]
 *
 * Parameters:
 * - id: number (path parameter) — Module ID (1-12)
 *
 * Response: ModuleDetailsResponse (from src/types/index.ts)
 * Status: 200 (success) | 404 (module not found) | 500 (server error)
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const moduleId = parseInt(id);

    // Validation
    if (isNaN(moduleId) || moduleId < 1 || moduleId > 12) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const moduleDetails = generateModuleDetails(moduleId);
    return NextResponse.json(moduleDetails, { status: 200 });
  } catch (error) {
    console.error('Error fetching module details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
