import { NextRequest, NextResponse } from 'next/server';
import { generateMetrics } from '../lib/mockDataGenerator';

/**
 * GET /api/metrics
 * Returns overall specification coverage metrics
 *
 * Response: MetricsResponse (from src/types/index.ts)
 * Status: 200 (success) | 500 (server error)
 */
export async function GET(_request: NextRequest) {
  try {
    const metrics = generateMetrics();
    return NextResponse.json(metrics, { status: 200 });
  } catch (error) {
    console.error('Error generating metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
