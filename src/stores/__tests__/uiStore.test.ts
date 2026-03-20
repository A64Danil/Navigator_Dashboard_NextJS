import { renderHook, act } from '@testing-library/react';
import { useUIStore } from '../uiStore';

describe('uiStore', () => {
  beforeEach(() => {
    // Сбрасываем состояние перед каждым тестом
    useUIStore.setState({
      searchQuery: '',
      selectedStatuses: [],
    });
  });

  it('should set search query', () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
      result.current.setSearchQuery('auth');
    });

    expect(result.current.searchQuery).toBe('auth');
  });

  it('should toggle status - add status', () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
      result.current.toggleStatus('excellent');
    });

    expect(result.current.selectedStatuses).toContain('excellent');
  });

  it('should toggle status - remove status', () => {
    const { result } = renderHook(() => useUIStore());

    // Сначала добавляем
    act(() => {
      result.current.toggleStatus('excellent');
    });
    expect(result.current.selectedStatuses).toContain('excellent');

    // Потом удаляем
    act(() => {
      result.current.toggleStatus('excellent');
    });
    expect(result.current.selectedStatuses).not.toContain('excellent');
  });

  it('should reset filters', () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
      result.current.setSearchQuery('test');
      result.current.toggleStatus('excellent');
      result.current.toggleStatus('warning');
    });

    // Проверяем что установилось
    expect(result.current.searchQuery).toBe('test');
    expect(result.current.selectedStatuses).toContain('excellent');
    expect(result.current.selectedStatuses).toContain('warning');

    // Сбрасываем
    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.searchQuery).toBe('');
    expect(result.current.selectedStatuses).toEqual([]);
  });

  it('should handle multiple statuses', () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
      result.current.toggleStatus('excellent');
      result.current.toggleStatus('good');
      result.current.toggleStatus('warning');
    });

    expect(result.current.selectedStatuses).toEqual(['excellent', 'good', 'warning']);
  });
});
