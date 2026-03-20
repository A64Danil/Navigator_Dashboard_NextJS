import { faker } from '@faker-js/faker';
import {
  MetricsResponse,
  Module,
  ModuleDetailsResponse,
  Specification,
  ModuleStatus,
} from '@/src/types';

// Function to reset Faker with the same seed
// IMPORTANT: seed is stateful, so we reset before each main generation
function resetFaker() {
  faker.seed(42);
}

resetFaker();

// List from specification (plan.md section 6)
const MODULE_NAMES = [
  'Authentication & Authorization',
  'User Profile & Account Management',
  'Dashboard & Analytics',
  'Projects & Workspaces',
  'Team Management',
  'File Management & Storage',
  'Notifications & Messaging',
  'Search & Filtering',
  'Integrations & Webhooks',
  'Billing & Subscription',
  'Admin Panel & Audit Logs',
  'Help, Support & Documentation',
];

/**
 * Helper function: determine module status by coverage percentage
 * Rule from specification:
 * - excellent ≥95%
 * - good 80–94%
 * - warning 60–79%
 * - critical <60%
 */
function getStatusByPercentage(coverage: number): ModuleStatus {
  if (coverage >= 95) return 'excellent';
  if (coverage >= 80) return 'good';
  if (coverage >= 60) return 'warning';
  return 'critical';
}

/**
 * Generate one specification
 */
function generateSpecification(specId: number): Specification {
  const endpoints = [
    'POST /api/login',
    'POST /api/logout',
    'GET /api/profile',
    'PUT /api/profile',
    'GET /api/modules',
    'GET /api/modules/:id',
    'POST /api/search',
    'POST /api/filter',
    'GET /api/metrics',
    'POST /api/subscribe',
  ];

  return {
    id: specId,
    name: endpoints[specId % endpoints.length] + ` [spec-${specId}]`,
    covered: faker.datatype.boolean({ probability: 0.75 }), // 75% coverage on average
    lastUpdated: faker.date.recent({ days: 30 }).toISOString(),
  };
}

/**
 * Generate one module with its specifications
 */
function generateModule(moduleId: number): Module {
  const name = MODULE_NAMES[moduleId - 1] || `Module ${moduleId}`;
  const specCount = faker.number.int({ min: 15, max: 30 });
  const coveredCount = faker.number.int({ min: 0, max: specCount });
  const coverage = Math.round((coveredCount / specCount) * 1000) / 10; // one decimal

  return {
    id: moduleId,
    name,
    coverage,
    covered: coveredCount,
    total: specCount,
    status: getStatusByPercentage(coverage),
    lastUpdated: faker.date.recent({ days: 30 }).toISOString(),
  };
}

/**
 * Cache for modules to guarantee that all functions return the same data
 * Generated once with seed 42
 */
let modulesCache: Module[] | null = null;

function getAllModulesCached(): Module[] {
  if (!modulesCache) {
    resetFaker();
    modulesCache = Array.from({ length: MODULE_NAMES.length }, (_, i) => generateModule(i + 1));
  }
  return modulesCache;
}

/**
 * Generate coverage metrics (overall statistics)
 */
export function generateMetrics(): MetricsResponse {
  // Use cached modules to guarantee consistency
  const modules = getAllModulesCached();

  const specsTotal = modules.reduce((sum, m) => sum + m.total, 0);
  const specsCovered = modules.reduce((sum, m) => sum + m.covered, 0);
  const overallCoverage = Math.round((specsCovered / specsTotal) * 1000) / 10;

  // Generate 14-day trend (volatile growth with occasional dips)
  resetFaker();
  const trend: number[] = [];
  let currentCoverage = overallCoverage - 25; // Start 25% lower
  for (let i = 0; i < 14; i++) {
    trend.push(Math.round(currentCoverage * 10) / 10);
    // Randomly go up or down with overall upward bias
    const change = faker.number.float({ min: -4.5, max: 7.5 }); // Can drop or rise
    currentCoverage += change;
    // Clamp to valid range and ensure overall progress
    if (currentCoverage > overallCoverage) currentCoverage = overallCoverage;
  }
  trend[13] = overallCoverage; // last day = current coverage

  return {
    overallCoverage,
    modulesCount: MODULE_NAMES.length,
    specsCovered,
    specsTotal,
    lastUpdated: new Date().toISOString(),
    trend,
  };
}

/**
 * Generate list of all modules
 * Used for /api/modules and for mock components
 */
export function generateAllModules(): Module[] {
  return getAllModulesCached();
}

/**
 * Generate details of one module with all its specifications
 */
export function generateModuleDetails(moduleId: number): ModuleDetailsResponse {
  // Use cached module to guarantee that data is consistent
  const allModules = getAllModulesCached();
  const mod = allModules.find((m) => m.id === moduleId);

  if (!mod) {
    throw new Error(`Module with id ${moduleId} not found`);
  }

  const specCount = mod.total;
  const specifications: Specification[] = Array.from({ length: specCount }, (_, i) => {
    resetFaker();
    const spec = generateSpecification(i + 1);

    // Overwrite covered by index to guarantee that
    // number of covered specs matches mod.covered
    if (i < mod.covered) {
      spec.covered = true;
    } else {
      spec.covered = false;
    }
    return spec;
  });

  return {
    ...mod,
    specifications,
  };
}

/**
 * Filter modules by search and status
 * Used in /api/modules endpoint
 */
export function filterModules(
  modules: Module[],
  search: string,
  statuses: ModuleStatus[]
): Module[] {
  let filtered = modules;

  if (search && search.trim()) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter((m) => m.name.toLowerCase().includes(searchLower));
  }

  if (statuses && statuses.length > 0) {
    filtered = filtered.filter((m) => statuses.includes(m.status));
  }

  return filtered;
}
