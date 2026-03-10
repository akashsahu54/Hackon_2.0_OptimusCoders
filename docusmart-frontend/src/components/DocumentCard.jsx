import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { TYPE_ICONS } from '../utils/constants';
import { formatDate, formatCurrency, timeAgo } from '../utils/formatters';

export default function DocumentCard({ document }) {
    const navigate = useNavigate();
    const fields = document.extracted_fields || {};
    const icon = TYPE_ICONS[document.document_type] || '📎';

    return (
        <div
            onClick={() => navigate(`/documents/${document.id}`)}
            className="glass-card p-5 cursor-pointer group"
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{icon}</span>
                    <div>
                        <h3 className="text-sm font-semibold text-white group-hover:text-primary-300 transition-colors truncate max-w-[200px]">
                            {document.original_filename}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {document.document_type?.replace(/_/g, ' ') || 'Unclassified'} · {timeAgo(document.created_at)}
                        </p>
                    </div>
                </div>
                <StatusBadge status={document.status} />
            </div>

            {/* Extracted info preview */}
            {document.status === 'completed' && (
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-surface-700/30">
                    {fields.vendor_name && (
                        <div>
                            <p className="text-[10px] uppercase text-slate-600 tracking-wider">Vendor</p>
                            <p className="text-xs text-slate-300 truncate">{fields.vendor_name}</p>
                        </div>
                    )}
                    {fields.total_amount != null && (
                        <div>
                            <p className="text-[10px] uppercase text-slate-600 tracking-wider">Amount</p>
                            <p className="text-xs text-emerald-400 font-medium">{formatCurrency(fields.total_amount)}</p>
                        </div>
                    )}
                    {fields.invoice_date && (
                        <div>
                            <p className="text-[10px] uppercase text-slate-600 tracking-wider">Date</p>
                            <p className="text-xs text-slate-300">{formatDate(fields.invoice_date)}</p>
                        </div>
                    )}
                    {document.extraction_confidence != null && (
                        <div>
                            <p className="text-[10px] uppercase text-slate-600 tracking-wider">Confidence</p>
                            <p className="text-xs text-slate-300">{(document.extraction_confidence * 100).toFixed(0)}%</p>
                        </div>
                    )}
                </div>
            )}

            {/* Tags */}
            {document.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                    {document.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 text-[10px] rounded-full bg-primary-600/15 text-primary-400">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
