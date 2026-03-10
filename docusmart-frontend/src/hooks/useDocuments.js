/** Document React Query hooks */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi, analyticsApi } from '../api/documents';

export function useDocuments(params = {}) {
    return useQuery({
        queryKey: ['documents', params],
        queryFn: () => documentsApi.list(params).then((r) => r.data),
    });
}

export function useDocument(id) {
    return useQuery({
        queryKey: ['document', id],
        queryFn: () => documentsApi.get(id).then((r) => r.data),
        enabled: !!id,
    });
}

export function useDocumentStatus(id, enabled = false) {
    return useQuery({
        queryKey: ['document-status', id],
        queryFn: () => documentsApi.getStatus(id).then((r) => r.data),
        enabled: !!id && enabled,
        refetchInterval: enabled ? 2000 : false,
    });
}

export function useUploadDocument() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ file, onProgress }) => documentsApi.upload(file, onProgress).then((r) => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
    });
}

export function useDeleteDocument() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => documentsApi.delete(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
    });
}

export function useAnalyticsOverview() {
    return useQuery({
        queryKey: ['analytics-overview'],
        queryFn: () => analyticsApi.overview().then((r) => r.data),
    });
}
