/** Document API calls */
import client from './client';

export const documentsApi = {
    upload: (file, onProgress) => {
        const formData = new FormData();
        formData.append('file', file);
        return client.post('/documents/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: onProgress,
        });
    },

    list: (params = {}) =>
        client.get('/documents', { params }),

    get: (id) =>
        client.get(`/documents/${id}`),

    update: (id, data) =>
        client.put(`/documents/${id}`, data),

    delete: (id) =>
        client.delete(`/documents/${id}`),

    getStatus: (id) =>
        client.get(`/documents/${id}/status`),

    reprocess: (id) =>
        client.post(`/documents/${id}/reprocess`),

    getFields: (id) =>
        client.get(`/documents/${id}/fields`),

    correctFields: (id, corrections) =>
        client.put(`/documents/${id}/fields`, { corrections }),

    extract: (text, documentType) =>
        client.post('/documents/extract', { text, document_type: documentType }),

    classify: (text) =>
        client.post('/documents/classify', { text }),
};

export const searchApi = {
    search: (params) =>
        client.get('/search', { params }),
};

export const analyticsApi = {
    overview: () =>
        client.get('/analytics/overview'),
};

export const reportsApi = {
    expense: (data) =>
        client.post('/reports/expense', data),

    summary: (data) =>
        client.post('/reports/summary', data),
};
