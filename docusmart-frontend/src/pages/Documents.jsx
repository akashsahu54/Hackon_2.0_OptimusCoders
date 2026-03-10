import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '../hooks/useDocuments';
import StatusBadge from '../components/StatusBadge';
import SearchBar from '../components/SearchBar';
import { DOCUMENT_TYPES, STATUSES, DEMO_RECENT_DOCS } from '../utils/constants';
import { formatCurrency, formatDate, formatConfidence, timeAgo } from '../utils/formatters';
import {
    FileText, Filter, ChevronDown, ChevronUp, ArrowUpDown,
    MoreHorizontal, Trash2, Tag, Download, CheckSquare, Square,
} from 'lucide-react';

export default function Documents() {
    const navigate = useNavigate();
    const [params, setParams] = useState({ page: 1, limit: 20 });
    const [sortField, setSortField] = useState(null);
    const [sortDir, setSortDir] = useState('desc');
    const [selected, setSelected] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const { data, isLoading } = useDocuments(params);

    const documents = data?.documents?.length > 0 ? data.documents : DEMO_RECENT_DOCS;
    const total = data?.total || documents.length;

    const handleSearch = (query) => {
        setParams((prev) => ({ ...prev, search: query || undefined, page: 1 }));
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('desc');
        }
    };

    const toggleSelect = (id) => {
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const toggleAll = () => {
        setSelected(selected.length === documents.length ? [] : documents.map(d => d.id));
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
        return sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="page-header mb-0">
                    <h1 className="page-title">Documents</h1>
                    <p className="page-subtitle">{total} documents total</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowFilters(!showFilters)} className="btn-ghost text-sm">
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                    <button onClick={() => navigate('/upload')} className="btn-primary text-sm">
                        <FileText className="w-4 h-4" />
                        Upload
                    </button>
                </div>
            </div>

            {/* Search + Filters */}
            <div className="space-y-3">
                <SearchBar onSearch={handleSearch} />
                {showFilters && (
                    <div className="flex flex-wrap gap-3 animate-fade-in-down">
                        <select
                            onChange={(e) => setParams(p => ({ ...p, type: e.target.value || undefined, page: 1 }))}
                            className="input-field w-auto min-w-[150px] text-sm"
                        >
                            <option value="">All Types</option>
                            {DOCUMENT_TYPES.map((t) => (
                                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                        <select
                            onChange={(e) => setParams(p => ({ ...p, status: e.target.value || undefined, page: 1 }))}
                            className="input-field w-auto min-w-[150px] text-sm"
                        >
                            <option value="">All Statuses</option>
                            {STATUSES.map((s) => (
                                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Bulk Actions */}
            {selected.length > 0 && (
                <div className="glass-card-static px-4396 py-2.5 flex items-center gap-4 animate-slide-up px-4">
                    <span className="text-sm text-slate-300 font-medium">{selected.length} selected</span>
                    <div className="h-4 w-px bg-surface-700" />
                    <button className="btn-ghost text-xs"><Tag className="w-3.5 h-3.5" /> Tag</button>
                    <button className="btn-ghost text-xs"><Download className="w-3.5 h-3.5" /> Export</button>
                    <button className="btn-ghost text-xs text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                </div>
            )}

            {/* Data Table */}
            <div className="glass-card-static overflow-hidden">
                {isLoading ? (
                    <div className="p-6 space-y-3">
                        {[1,2,3,4,5].map(i => (
                            <div key={i} className="flex gap-4">
                                <div className="skeleton h-4 w-6" />
                                <div className="skeleton h-4 flex-1" />
                                <div className="skeleton h-4 w-20" />
                                <div className="skeleton h-4 w-16" />
                                <div className="skeleton h-4 w-24" />
                            </div>
                        ))}
                    </div>
                ) : documents.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th className="w-10">
                                        <button onClick={toggleAll} className="text-slate-500 hover:text-white transition-colors">
                                            {selected.length === documents.length
                                                ? <CheckSquare className="w-4 h-4" />
                                                : <Square className="w-4 h-4" />}
                                        </button>
                                    </th>
                                    <th className="sortable" onClick={() => handleSort('name')}>
                                        <span className="flex items-center gap-1">Document <SortIcon field="name" /></span>
                                    </th>
                                    <th>Type</th>
                                    <th>Vendor</th>
                                    <th className="sortable text-right" onClick={() => handleSort('amount')}>
                                        <span className="flex items-center gap-1 justify-end">Amount <SortIcon field="amount" /></span>
                                    </th>
                                    <th>Confidence</th>
                                    <th>Status</th>
                                    <th>Tags</th>
                                    <th className="sortable" onClick={() => handleSort('date')}>
                                        <span className="flex items-center gap-1">Date <SortIcon field="date" /></span>
                                    </th>
                                    <th className="w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map((doc) => {
                                    const fields = doc.extracted_fields || {};
                                    return (
                                        <tr
                                            key={doc.id}
                                            className="cursor-pointer group"
                                            onClick={() => navigate(`/documents/${doc.id}`)}
                                        >
                                            <td onClick={e => e.stopPropagation()}>
                                                <button onClick={() => toggleSelect(doc.id)} className="text-slate-500 hover:text-white transition-colors">
                                                    {selected.includes(doc.id) ? <CheckSquare className="w-4 h-4 text-primary-400" /> : <Square className="w-4 h-4" />}
                                                </button>
                                            </td>
                                            <td>
                                                <p className="text-sm font-medium text-white group-hover:text-primary-300 transition-colors truncate max-w-[220px]">
                                                    {doc.original_filename}
                                                </p>
                                            </td>
                                            <td>
                                                <span className="text-xs text-slate-400 capitalize">{doc.document_type?.replace(/_/g, ' ')}</span>
                                            </td>
                                            <td>
                                                <span className="text-sm text-slate-300">{fields.vendor_name || '—'}</span>
                                            </td>
                                            <td className="text-right">
                                                <span className="text-sm text-emerald-400 font-medium">
                                                    {fields.total_amount != null ? formatCurrency(fields.total_amount) : '—'}
                                                </span>
                                            </td>
                                            <td>
                                                {doc.extraction_confidence != null ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="confidence-bar w-16">
                                                            <div
                                                                className={`confidence-bar-fill ${
                                                                    doc.extraction_confidence >= 0.9 ? 'confidence-high' :
                                                                    doc.extraction_confidence >= 0.7 ? 'confidence-medium' :
                                                                    'confidence-low'
                                                                }`}
                                                                style={{ width: `${doc.extraction_confidence * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-slate-400">
                                                            {(doc.extraction_confidence * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                ) : <span className="text-xs text-slate-600">—</span>}
                                            </td>
                                            <td><StatusBadge status={doc.status} /></td>
                                            <td>
                                                <div className="flex gap-1">
                                                    {doc.tags?.slice(0, 2).map(tag => (
                                                        <span key={tag} className="tag">#{tag}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="text-xs text-slate-500">{timeAgo(doc.created_at)}</td>
                                            <td onClick={e => e.stopPropagation()}>
                                                <button className="btn-icon w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-16 text-center">
                        <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-400 font-medium">No documents found</p>
                        <p className="text-slate-600 text-sm mt-1">Upload a document to get started</p>
                        <button onClick={() => navigate('/upload')} className="btn-primary text-sm mt-4">
                            Upload Document
                        </button>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {total > 20 && (
                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                        Showing {((params.page - 1) * 20) + 1}-{Math.min(params.page * 20, total)} of {total}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setParams(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                            disabled={params.page <= 1}
                            className="btn-secondary text-sm disabled:opacity-30"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setParams(p => ({ ...p, page: p.page + 1 }))}
                            disabled={params.page >= Math.ceil(total / 20)}
                            className="btn-secondary text-sm disabled:opacity-30"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
