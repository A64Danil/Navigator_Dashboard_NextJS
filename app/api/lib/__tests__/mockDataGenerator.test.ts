import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateMetrics,
  generateAllModules,
  generateModuleDetails,
  filterModules,
} from '../mockDataGenerator';

describe('mockDataGenerator', () => {
  beforeEach(() => {
    // Faker использует фиксированный seed, поэтому данные воспроизводимы
  });

  describe('generateMetrics', () => {
    it('should generate metrics with correct structure', () => {
      const metrics = generateMetrics();

      expect(metrics).toHaveProperty('overallCoverage');
      expect(metrics).toHaveProperty('modulesCount');
      expect(metrics).toHaveProperty('specsCovered');
      expect(metrics).toHaveProperty('specsTotal');
      expect(metrics).toHaveProperty('lastUpdated');
      expect(metrics).toHaveProperty('trend');
    });

    it('should generate trend with 14 days', () => {
      const metrics = generateMetrics();
      expect(metrics.trend).toHaveLength(14);
    });

    it('should have coverage between 0 and 100', () => {
      const metrics = generateMetrics();
      expect(metrics.overallCoverage).toBeGreaterThanOrEqual(0);
      expect(metrics.overallCoverage).toBeLessThanOrEqual(100);
    });

    it('should have positive counts', () => {
      const metrics = generateMetrics();
      expect(metrics.modulesCount).toBeGreaterThan(0);
      expect(metrics.specsTotal).toBeGreaterThan(0);
      expect(metrics.specsCovered).toBeGreaterThanOrEqual(0);
    });
  });

  describe('generateAllModules', () => {
    it('should generate modules with correct structure', () => {
      const modules = generateAllModules();

      expect(Array.isArray(modules)).toBe(true);
      expect(modules.length).toBeGreaterThan(0);

      const firstModule = modules[0];
      expect(firstModule).toHaveProperty('id');
      expect(firstModule).toHaveProperty('name');
      expect(firstModule).toHaveProperty('coverage');
      expect(firstModule).toHaveProperty('covered');
      expect(firstModule).toHaveProperty('total');
      expect(firstModule).toHaveProperty('status');
      expect(firstModule).toHaveProperty('lastUpdated');
    });

    it('should generate modules with valid statuses', () => {
      const modules = generateAllModules();
      const validStatuses = ['excellent', 'good', 'warning', 'critical'];

      modules.forEach((module) => {
        expect(validStatuses).toContain(module.status);
      });
    });

    it('should calculate coverage correctly', () => {
      const modules = generateAllModules();

      modules.forEach((module) => {
        const calculatedCoverage = (module.covered / module.total) * 100;
        const roundedCalculated = Math.round(calculatedCoverage * 10) / 10;
        expect(module.coverage).toBe(roundedCalculated);
      });
    });
  });

  describe('generateModuleDetails', () => {
    it('should generate module details with specifications', () => {
      const details = generateModuleDetails(1);

      expect(details).toHaveProperty('specifications');
      expect(Array.isArray(details.specifications)).toBe(true);
      expect(details.specifications.length).toBe(details.total);
    });

    it('should generate correct number of covered specs', () => {
      const details = generateModuleDetails(1);
      const coveredCount = details.specifications.filter((s) => s.covered).length;

      expect(coveredCount).toBe(details.covered);
    });

    it('should have reproducible data with seed', () => {
      const details1 = generateModuleDetails(1);
      const details2 = generateModuleDetails(1);

      expect(details1.id).toBe(details2.id);
      expect(details1.name).toBe(details2.name);
      expect(details1.total).toBe(details2.total);
    });
  });

  describe('filterModules', () => {
    it('should filter by search query', () => {
      const modules = generateAllModules();
      const filtered = filterModules(modules, 'auth', []);

      expect(filtered.length).toBeLessThanOrEqual(modules.length);
      filtered.forEach((module) => {
        expect(module.name.toLowerCase()).toContain('auth');
      });
    });

    it('should filter by status', () => {
      const modules = generateAllModules();
      const filtered = filterModules(modules, '', ['excellent']);

      filtered.forEach((module) => {
        expect(module.status).toBe('excellent');
      });
    });

    it('should filter by multiple statuses', () => {
      const modules = generateAllModules();
      const filtered = filterModules(modules, '', ['excellent', 'good']);

      filtered.forEach((module) => {
        expect(['excellent', 'good']).toContain(module.status);
      });
    });

    it('should combine search and status filters', () => {
      const modules = generateAllModules();
      const filtered = filterModules(modules, 'user', ['good']);

      filtered.forEach((module) => {
        expect(module.name.toLowerCase()).toContain('user');
        expect(module.status).toBe('good');
      });
    });

    it('should return all modules when no filters', () => {
      const modules = generateAllModules();
      const filtered = filterModules(modules, '', []);

      expect(filtered.length).toBe(modules.length);
    });
  });
});
