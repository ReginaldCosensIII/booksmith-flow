import { useEffect, useRef, useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

interface UseAutosaveOptions {
  onSave: (content: string) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export const useAutosave = (
  content: string,
  { onSave, delay = 1500, enabled = true }: UseAutosaveOptions
) => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedContentRef = useRef<string>(content);
  const isInitialMount = useRef(true);
  const { toast } = useToast();

  const save = useCallback(async () => {
    if (!enabled || content === lastSavedContentRef.current) {
      return;
    }

    setSaveStatus('saving');
    
    try {
      await onSave(content);
      lastSavedContentRef.current = content;
      setSaveStatus('saved');
    } catch (error) {
      setSaveStatus('error');
      toast({
        title: "Save Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
      console.error('Autosave error:', error);
    }
  }, [content, onSave, enabled, toast]);

  const debouncedSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!enabled || content === lastSavedContentRef.current) {
      return;
    }

    setSaveStatus('unsaved');

    timeoutRef.current = setTimeout(() => {
      save();
    }, delay);
  }, [save, delay, enabled, content]);

  // Handle content changes
  useEffect(() => {
    // Skip autosave on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      lastSavedContentRef.current = content;
      return;
    }

    debouncedSave();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [debouncedSave]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    saveStatus,
    save: () => save(),
    isPending: saveStatus === 'saving' || saveStatus === 'unsaved',
  };
};