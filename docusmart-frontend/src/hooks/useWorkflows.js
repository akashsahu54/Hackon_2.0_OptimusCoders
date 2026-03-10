/** Workflow React Query hooks */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowsApi } from '../api/workflows';

export function useWorkflows() {
    return useQuery({
        queryKey: ['workflows'],
        queryFn: () => workflowsApi.list().then((r) => r.data),
    });
}

export function useCreateWorkflow() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => workflowsApi.create(data).then((r) => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['workflows'] }),
    });
}

export function useDeleteWorkflow() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => workflowsApi.delete(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['workflows'] }),
    });
}

export function useTriggerWorkflow() {
    return useMutation({
        mutationFn: ({ workflowId, documentId }) =>
            workflowsApi.trigger(workflowId, documentId).then((r) => r.data),
    });
}
