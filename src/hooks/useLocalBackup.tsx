import { useEffect, useCallback } from 'react';

interface UseLocalBackupOptions {
  userId?: string;
  projectId: string;
  chapterId: string;
  content: string;
  enabled?: boolean;
}

export const useLocalBackup = ({
  userId,
  projectId,
  chapterId,
  content,
  enabled = true,
}: UseLocalBackupOptions) => {
  const backupKey = `booksmith:backup:${userId}:${projectId}:${chapterId}`;

  const saveBackup = useCallback(() => {
    if (!enabled || !userId) return;

    try {
      const backup = {
        content,
        timestamp: Date.now(),
        userId,
        projectId,
        chapterId,
      };
      localStorage.setItem(backupKey, JSON.stringify(backup));
    } catch (error) {
      console.warn('Failed to save local backup:', error);
    }
  }, [backupKey, content, userId, projectId, chapterId, enabled]);

  const getBackup = useCallback(() => {
    if (!enabled || !userId) return null;

    try {
      const backup = localStorage.getItem(backupKey);
      if (!backup) return null;

      const parsed = JSON.parse(backup);
      return {
        content: parsed.content || '',
        timestamp: parsed.timestamp || 0,
        isNewer: (serverTimestamp: number) => parsed.timestamp > serverTimestamp,
      };
    } catch (error) {
      console.warn('Failed to get local backup:', error);
      return null;
    }
  }, [backupKey, userId, enabled]);

  const clearBackup = useCallback(() => {
    if (!enabled || !userId) return;

    try {
      localStorage.removeItem(backupKey);
    } catch (error) {
      console.warn('Failed to clear local backup:', error);
    }
  }, [backupKey, userId, enabled]);

  const restoreFromBackup = useCallback((serverContent: string, serverTimestamp: number) => {
    const backup = getBackup();
    
    if (!backup) return serverContent;

    // If server content is empty or backup is newer, use backup
    if (!serverContent.trim() || backup.isNewer(serverTimestamp)) {
      return backup.content;
    }

    return serverContent;
  }, [getBackup]);

  // Auto-save backup when content changes
  useEffect(() => {
    if (content.trim()) {
      const timeoutId = setTimeout(saveBackup, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [content, saveBackup]);

  return {
    saveBackup,
    getBackup,
    clearBackup,
    restoreFromBackup,
  };
};