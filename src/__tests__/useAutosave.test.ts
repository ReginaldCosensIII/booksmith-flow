import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutosave } from '@/hooks/useAutosave';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe('useAutosave', () => {
  let mockOnSave: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSave = vi.fn().mockResolvedValue(undefined);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should start with saved status', () => {
    const { result } = renderHook(() =>
      useAutosave('initial content', { onSave: mockOnSave })
    );

    expect(result.current.saveStatus).toBe('saved');
  });

  it('should debounce save calls', async () => {
    const { result, rerender } = renderHook(
      ({ content }) => useAutosave(content, { onSave: mockOnSave, delay: 1000 }),
      { initialProps: { content: 'initial' } }
    );

    // Change content
    rerender({ content: 'updated content' });

    expect(result.current.saveStatus).toBe('unsaved');
    expect(mockOnSave).not.toHaveBeenCalled();

    // Fast forward time
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockOnSave).toHaveBeenCalledWith('updated content');
    expect(result.current.saveStatus).toBe('saved');
  });

  it('should handle save errors', async () => {
    const mockError = new Error('Save failed');
    mockOnSave.mockRejectedValue(mockError);

    const { result, rerender } = renderHook(
      ({ content }) => useAutosave(content, { onSave: mockOnSave }),
      { initialProps: { content: 'initial' } }
    );

    rerender({ content: 'updated' });

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.saveStatus).toBe('error');
  });

  it('should allow manual save', async () => {
    const { result, rerender } = renderHook(
      ({ content }) => useAutosave(content, { onSave: mockOnSave }),
      { initialProps: { content: 'initial' } }
    );

    rerender({ content: 'updated' });

    await act(async () => {
      await result.current.save();
    });

    expect(mockOnSave).toHaveBeenCalledWith('updated');
    expect(result.current.saveStatus).toBe('saved');
  });
});