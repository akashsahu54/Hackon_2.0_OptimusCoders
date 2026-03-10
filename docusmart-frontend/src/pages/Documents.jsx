import { useState } from 'react';
import { useDocuments } from '../hooks/useDocuments';
import DocumentCard from '../components/DocumentCard';
import UploadDropzone from '../components/UploadDropzone';
import SearchBar from '../components/SearchBar';
import { DOCUMENT_TYPES, STATUSES } from '../utils/constants';

export default function Documents() {
    const [params, setParams] = useState({ page: 1, limit: 20 });
    const { data, isLoading } = useDocuments(params);

    const handleSearch = (query) => {
        setParams((prev) => ({ ...prev, search: query || undefined, page: 1 }));
    };

    const handleTypeFilter = (type) => {
        setParams((prev) => ({ ...prev, type: type || undefined, page: 1 }));
    };

    const handleStatusFilter = (status) => {
        setParams((prev) => ({ ...prev, status: status || undefined, page: 1 }));
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Documents</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {data?.total || 0} documents total
                    </p>
                </div>
            </div>

            {/* Upload */}
            <UploadDropzone />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                    <SearchBar onSearch={handleSearch} />
                </div>
                <select
                    onChange={(e) => handleTypeFilter(e.target.value)}
                    className="input-field w-auto min-w-[150px]"
                >
                    <option value="">All Types</option>
                    {DOCUMENT_TYPES.map((t) => (
                        <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                    ))}
                </select>
                <select
                    onChange={(e) => handleStatusFilter(e.target.value)}
                    className="input-field w-auto min-w-[150px]"
                >
                    <option value="">All Statuses</option>
                    {STATUSES.map((s) => (
                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                </select>
            </div>

            {/* Document Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="glass-card p-5">
                            <div className="skeleton h-4 w-3/4 mb-3" />
                            <div className="skeleton h-3 w-1/2 mb-4" />
                            <div className="skeleton h-16 w-full" />
                        </div>
                    ))}
                </div>
            ) : data?.documents?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {data.documents.map((doc) => (
                        <DocumentCard key={doc.id} document={doc} />
                    ))}
                </div>
            ) : (
                <div className="glass-card p-12 text-center">
                    <p className="text-4xl mb-4">📭</p>
                    <p className="text-slate-400">No documents found</p>
                    <p className="text-slate-600 text-sm mt-1">Upload a document to get started</p>
                </div>
            )}

            {/* Pagination */}
            {data?.total > data?.limit && (
                <div className="flex justify-center gap-2">
                    <button
                        onClick={() => setParams((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                        disabled={params.page <= 1}
                        className="btn-secondary text-sm disabled:opacity-30"
                    >
                        ← Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-slate-500">
                        Page {params.page} of {Math.ceil(data.total / data.limit)}
                    </span>
                    <button
                        onClick={() => setParams((p) => ({ ...p, page: p.page + 1 }))}
                        disabled={params.page >= Math.ceil(data.total / data.limit)}
                        className="btn-secondary text-sm disabled:opacity-30"
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}
