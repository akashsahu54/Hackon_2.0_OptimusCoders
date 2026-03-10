import { useParams, useNavigate } from 'react-router-dom';
import { useDocument, useDeleteDocument } from '../hooks/useDocuments';
import StatusBadge from '../components/StatusBadge';
import ExtractedFieldsPanel from '../components/ExtractedFieldsPanel';
import { formatDate, formatFileSize, formatConfidence, timeAgo } from '../utils/formatters';
import { TYPE_ICONS } from '../utils/constants';
import toast from 'react-hot-toast';

export default function DocumentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: doc, isLoading, error } = useDocument(id);
    const deleteMutation = useDeleteDocument();

    const handleDelete = () => {
        if (confirm('Delete this document?')) {
            deleteMutation.mutate(id, {
                onSuccess: () => {
                    toast.success('Document deleted');
                    navigate('/documents');
                },
            });
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="skeleton h-8 w-48" />
                <div className="skeleton h-64 w-full" />
            </div>
        );
    }

    if (error || !doc) {
        return (
            <div className="glass-card p-12 text-center">
                <p className="text-4xl mb-4">❌</p>
                <p className="text-slate-400">Document not found</p>
                <button onClick={() => navigate('/documents')} className="btn-primary mt-4 text-sm">
                    Back to Documents
                </button>
            </div>
        );
    }

    const icon = TYPE_ICONS[doc.document_type] || '📎';

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Back Button */}
            <button
                onClick={() => navigate('/documents')}
                className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
                ← Back to Documents
            </button>

            {/* Header */}
            <div className="glass-card p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-4xl">{icon}</span>
                        <div>
                            <h1 className="text-xl font-bold text-white">{doc.original_filename}</h1>
                            <div className="flex items-center gap-3 mt-2">
                                <StatusBadge status={doc.status} />
                                <span className="text-xs text-slate-500">
                                    {doc.document_type?.replace(/_/g, ' ') || 'Unclassified'}
                                </span>
                                <span className="text-xs text-slate-600">•</span>
                                <span className="text-xs text-slate-500">{timeAgo(doc.created_at)}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={handleDelete} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                        🗑 Delete
                    </button>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-surface-700/30">
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-600">File Size</p>
                        <p className="text-sm text-slate-300 mt-1">{formatFileSize(doc.file_size_bytes)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-600">Pages</p>
                        <p className="text-sm text-slate-300 mt-1">{doc.page_count}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-600">OCR Confidence</p>
                        <p className="text-sm text-slate-300 mt-1">{formatConfidence(doc.ocr_confidence)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-600">Processing Time</p>
                        <p className="text-sm text-slate-300 mt-1">{doc.processing_time_ms ? `${doc.processing_time_ms}ms` : '—'}</p>
                    </div>
                </div>

                {/* Tags */}
                {doc.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {doc.tags.map((tag) => (
                            <span key={tag} className="px-3 py-1 text-xs rounded-full bg-primary-600/15 text-primary-400">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Extracted Fields */}
                <div>
                    <h2 className="text-sm font-semibold text-slate-300 mb-3">Extracted Data</h2>
                    <ExtractedFieldsPanel
                        fields={doc.extracted_fields}
                        confidence={doc.extraction_confidence}
                    />
                </div>

                {/* OCR Text */}
                <div>
                    <h2 className="text-sm font-semibold text-slate-300 mb-3">OCR Text</h2>
                    <div className="glass-card p-5 max-h-[600px] overflow-y-auto">
                        {doc.ocr_text ? (
                            <pre className="text-xs text-slate-400 whitespace-pre-wrap font-mono leading-relaxed">
                                {doc.ocr_text}
                            </pre>
                        ) : (
                            <p className="text-sm text-slate-600">No OCR text available</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
