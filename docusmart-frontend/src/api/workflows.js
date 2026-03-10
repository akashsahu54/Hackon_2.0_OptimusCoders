/** Workflow API calls */
import client from './client';

export const workflowsApi = {
    list: () =>
        client.get('/workflows'),

    create: (data) =>
        client.post('/workflows', data),

    update: (id, data) =>
        client.put(`/workflows/${id}`, data),

    delete: (id) =>
        client.delete(`/workflows/${id}`),

    trigger: (id, documentId) =>
        client.post(`/workflows/${id}/trigger`, { document_id: documentId }),
};
