import { useEffect } from 'react';

interface UseKeyboardShortcutsOptions {
  onSave?: () => void;
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({
  onSave,
  enabled = true,
}: UseKeyboardShortcutsOptions) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+S or Cmd+S
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        event.stopPropagation();
        
        if (onSave) {
          onSave();
        }
        
        return false;
      }
    };

    // Add event listener to document to catch all save attempts
    document.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [onSave, enabled]);
};