import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocument, useDeleteDocument } from '../hooks/useDocuments';
import StatusBadge from '../components/StatusBadge';
import ExtractedFieldsPanel from '../components/ExtractedFieldsPanel';
import { formatDate, formatFileSize, formatConfidence, timeAgo } from '../utils/formatters';
import {
    ArrowLeft, Trash2, RefreshCw, FileText, Clock,
    HardDrive, Layers, Gauge, Download,
    FileSearch, History, ClipboardList, ScanLine,
} from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = [
    { id: 'extracted', label: 'Extracted Data', icon: ClipboardList },
    { id: 'ocr', label: 'OCR Text', icon: ScanLine },
    { id: 'history', label: 'Workflow History', icon: History },
    { id: 'audit', label: 'Audit Log', icon: FileSearch },
];

export default function DocumentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: doc, isLoading, error } = useDocument(id);
    const deleteMutation = useDeleteDocument();
    const [activeTab, setActiveTab] = useState('extracted');

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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="skeleton h-[500px] rounded-2xl" />
                    <div className="skeleton h-[500px] rounded-2xl" />
                </div>
            </div>
        );
    }

    if (error || !doc) {
        return (
            <div className="glass-card-static p-16 text-center">
                <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">Document not found</p>
                <button onClick={() => navigate('/documents')} className="btn-primary mt-4 text-sm">
                    <ArrowLeft className="w-4 h-4" /> Back to Documents
                </button>
            </div>
        );
    }

    const metaItems = [
        { label: 'File Size', value: formatFileSize(doc.file_size_bytes), icon: HardDrive },
        { label: 'Pages', value: doc.page_count || '—', icon: Layers },
        { label: 'OCR Confidence', value: formatConfidence(doc.ocr_confidence), icon: Gauge },
        { label: 'Processing Time', value: doc.processing_time_ms ? `${doc.processing_time_ms}ms` : '—', icon: Clock },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Back + Actions */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/documents')}
                    className="btn-ghost text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Documents
                </button>
                <div className="flex items-center gap-2">
                    <button className="btn-ghost text-sm">
                        <Download className="w-4 h-4" /> Download
                    </button>
                    <button className="btn-ghost text-sm">
                        <RefreshCw className="w-4 h-4" /> Reprocess
                    </button>
                    <button onClick={handleDelete} className="btn-danger text-sm">
                        <Trash2 className="w-4 h-4" /> Delete
                    </button>
                </div>
            </div>

            {/* Header Card */}
            <div className="glass-card-static p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary-600/15 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-primary-400" />
                        </div>
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
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-surface-700/30">
                    {metaItems.map(({ label, value, icon: Icon }) => (
                        <div key={label} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-surface-800/60 flex items-center justify-center">
                                <Icon className="w-3.5 h-3.5 text-slate-500" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-600">{label}</p>
                                <p className="text-sm text-slate-300">{value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tags */}
                {doc.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {doc.tags.map((tag) => (
                            <span key={tag} className="tag">#{tag}</span>
                        ))}
                    </div>
                )}
            </div>

            {/* Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Document Preview */}
                <div className="glass-card-static p-6">
                    <h2 className="section-title">
                        <FileText className="w-4 h-4 text-primary-400" />
                        Document Preview
                    </h2>
                    <div className="bg-surface-900/50 rounded-xl h-[500px] flex items-center justify-center border border-surface-700/30">
                        <div className="text-center">
                            <FileText className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                            <p className="text-sm text-slate-500">Document preview</p>
                            <p className="text-xs text-slate-600 mt-1">{doc.original_filename}</p>
                        </div>
                    </div>
                </div>

                {/* Right: Tabbed Content */}
                <div className="space-y-4">
                    {/* Tabs */}
                    <div className="tab-list">
                        {TABS.map(({ id: tabId, label, icon: Icon }) => (
                            <button
                                key={tabId}
                                onClick={() => setActiveTab(tabId)}
                                className={`tab-item flex items-center gap-2 ${activeTab === tabId ? 'active' : ''}`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="animate-fade-in">
                        {activeTab === 'extracted' && (
                            <ExtractedFieldsPanel
                                fields={doc.extracted_fields}
                                confidence={doc.extraction_confidence}
                            />
                        )}

                        {activeTab === 'ocr' && (
                            <div className="glass-card-static p-6 max-h-[550px] overflow-y-auto thin-scrollbar">
                                {doc.ocr_text ? (
                                    <pre className="text-xs text-slate-400 whitespace-pre-wrap font-mono leading-relaxed">
                                        {doc.ocr_text}
                                    </pre>
                                ) : (
                                    <p className="text-sm text-slate-600 text-center py-12">No OCR text available</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="glass-card-static p-6">
                                <div className="space-y-4">
                                    {[
                                        { action: 'Document uploaded', time: timeAgo(doc.created_at), status: 'completed' },
                                        { action: 'OCR processing completed', time: timeAgo(doc.created_at), status: 'completed' },
                                        { action: 'AI extraction completed', time: timeAgo(doc.created_at), status: doc.status === 'completed' ? 'completed' : 'pending' },
                                        { action: 'Classification assigned', time: timeAgo(doc.created_at), status: doc.status === 'completed' ? 'completed' : 'pending' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${item.status === 'completed' ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                                            <span className="text-sm text-slate-300 flex-1">{item.action}</span>
                                            <span className="text-xs text-slate-500">{item.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'audit' && (
                            <div className="glass-card-static p-6">
                                <div className="space-y-3">
                                    {[
                                        { user: 'System', action: 'Document created', time: timeAgo(doc.created_at) },
                                        { user: 'AI Engine', action: 'Fields extracted', time: timeAgo(doc.created_at) },
                                        { user: 'AI Engine', action: 'Document classified', time: timeAgo(doc.created_at) },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 py-2 border-b border-surface-700/20 last:border-0">
                                            <div className="w-7 h-7 rounded-full bg-surface-800 flex items-center justify-center">
                                                <span className="text-[10px] font-bold text-slate-400">{item.user[0]}</span>
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-sm text-slate-300">{item.action}</span>
                                                <span className="text-xs text-slate-600 ml-2">by {item.user}</span>
                                            </div>
                                            <span className="text-xs text-slate-500">{item.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
