import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  let mockOnSave: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSave = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call onSave when Ctrl+S is pressed', () => {
    renderHook(() => useKeyboardShortcuts({ onSave: mockOnSave }));

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true,
    });

    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

    document.dispatchEvent(event);

    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it('should call onSave when Cmd+S is pressed', () => {
    renderHook(() => useKeyboardShortcuts({ onSave: mockOnSave }));

    const event = new KeyboardEvent('keydown', {
      key: 's',
      metaKey: true,
      bubbles: true,
    });

    document.dispatchEvent(event);

    expect(mockOnSave).toHaveBeenCalledTimes(1);
  });

  it('should not call onSave when disabled', () => {
    renderHook(() => useKeyboardShortcuts({ onSave: mockOnSave, enabled: false }));

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true,
    });

    document.dispatchEvent(event);

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should not call onSave for other key combinations', () => {
    renderHook(() => useKeyboardShortcuts({ onSave: mockOnSave }));

    const event = new KeyboardEvent('keydown', {
      key: 'a',
      ctrlKey: true,
      bubbles: true,
    });

    document.dispatchEvent(event);

    expect(mockOnSave).not.toHaveBeenCalled();
  });
});