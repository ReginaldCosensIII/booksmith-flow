import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

type OptimisticUpdateOptions<T> = {
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
};

export function useOptimisticUpdate<T, A extends any[]>(
  operation: (...args: A) => Promise<T>,
  options: OptimisticUpdateOptions<T> = {}
) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const executeWithOptimism = useCallback(
    async (
      optimisticUpdate: () => void,
      rollback: () => void,
      ...args: A
    ): Promise<T | null> => {
      setIsLoading(true);
      
      // Apply optimistic update immediately
      optimisticUpdate();

      try {
        const result = await operation(...args);
        
        if (options.successMessage) {
          toast({
            title: "Success",
            description: options.successMessage,
          });
        }
        
        options.onSuccess?.(result);
        return result;
      } catch (error) {
        // Rollback on error
        rollback();
        
        const errorMessage = options.errorMessage || 
          (error instanceof Error ? error.message : 'An error occurred');
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        options.onError?.(error instanceof Error ? error : new Error('Unknown error'));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [operation, options, toast]
  );

  return {
    execute: executeWithOptimism,
    isLoading
  };
}