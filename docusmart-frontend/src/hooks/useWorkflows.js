import { useState, useCallback } from 'react';

// Placeholder hooks — these will connect to the real backend API later

export function useWorkflows() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  return { data, isLoading, refetch: () => {} };
}

export function useCreateWorkflow() {
  const [isLoading, setIsLoading] = useState(false);
  const mutate = useCallback(async (workflow) => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  }, []);
  return { mutate, isLoading };
}

export function useDeleteWorkflow() {
  const [isLoading, setIsLoading] = useState(false);
  const mutate = useCallback(async (id) => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  }, []);
  return { mutate, isLoading };
}
