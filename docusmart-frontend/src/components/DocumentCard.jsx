import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatCurrency, timeAgo } from '../utils/formatters';
import { FileText, Receipt, CreditCard, Landmark, ClipboardList, Heart, Package, Zap, Paperclip } from 'lucide-react';

const TYPE_ICONS = {
    invoice: Receipt,
    receipt: Receipt,
    contract: FileText,
    id_document: CreditCard,
    bank_statement: Landmark,
    tax_form: ClipboardList,
    medical_form: Heart,
    purchase_order: Package,
    utility_bill: Zap,
    other: Paperclip,
};

export default function DocumentCard({ document }) {
    const navigate = useNavigate();
    const fields = document.extracted_fields || {};
    const Icon = TYPE_ICONS[document.document_type] || FileText;

    return (
        <div
            onClick={() => navigate(`/documents/${document.id}`)}
            className="glass-card p-5 cursor-pointer group"
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary-600/15 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary-400" />
                    </div>
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
                    {document.extraction_confidence != null && (
                        <div className="col-span-2">
                            <p className="text-[10px] uppercase text-slate-600 tracking-wider mb-1">Confidence</p>
                            <div className="flex items-center gap-2">
                                <div className="confidence-bar flex-1">
                                    <div
                                        className={`confidence-bar-fill ${
                                            document.extraction_confidence >= 0.9 ? 'confidence-high' :
                                            document.extraction_confidence >= 0.7 ? 'confidence-medium' :
                                            'confidence-low'
                                        }`}
                                        style={{ width: `${document.extraction_confidence * 100}%` }}
                                    />
                                </div>
                                <span className="text-[11px] text-slate-400">{(document.extraction_confidence * 100).toFixed(0)}%</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Tags */}
            {document.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                    {document.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="tag">#{tag}</span>
                    ))}
                </div>
            )}
        </div>
    );
}
