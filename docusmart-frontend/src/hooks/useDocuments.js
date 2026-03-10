import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

function getAuthHeaders() {
  const token = localStorage.getItem('docusmart_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── useDocuments — list all documents ───
export function useDocuments(filters = {}) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/documents`, {
        headers: getAuthHeaders(),
        params: filters,
      });
      setData(res.data.documents || []);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, refetch };
}

// ─── useDocument — single document detail ───
export function useDocument(id) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/documents/${id}`, {
        headers: getAuthHeaders(),
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  return { data, isLoading, refetch };
}

// ─── useUploadDocument — upload with progress ───
export function useUploadDocument() {
  const [isLoading, setIsLoading] = useState(false);

  // mutate({ file, onProgress }, { onSuccess, onError })
  const mutate = useCallback(({ file, onProgress }, callbacks = {}) => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    axios.post(`${API_BASE}/documents/upload`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) onProgress(progressEvent);
      },
    })
      .then((res) => {
        setIsLoading(false);
        if (callbacks.onSuccess) callbacks.onSuccess(res.data);
      })
      .catch((err) => {
        setIsLoading(false);
        if (callbacks.onError) callbacks.onError(err);
      });
  }, []);

  return { mutate, isLoading };
}

// ─── useDeleteDocument ───
export function useDeleteDocument() {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(async (id, callbacks = {}) => {
    setIsLoading(true);
    try {
      await axios.delete(`${API_BASE}/documents/${id}`, {
        headers: getAuthHeaders(),
      });
      if (callbacks.onSuccess) callbacks.onSuccess();
    } catch (err) {
      if (callbacks.onError) callbacks.onError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading };
}

// ─── useAnalyticsOverview ───
export function useAnalyticsOverview() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/analytics/overview`, {
        headers: getAuthHeaders(),
      });
      setData(res.data);
    } catch (err) {
      console.error('Analytics error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, refetch };
}
