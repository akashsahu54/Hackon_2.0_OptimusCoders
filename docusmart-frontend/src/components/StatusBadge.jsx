import { STATUS_COLORS } from '../utils/constants';
import {
    Upload, ScanLine, Tags, Sparkles,
    CheckCircle2, XCircle, AlertTriangle,
} from 'lucide-react';

const STATUS_ICONS = {
    uploaded: Upload,
    ocr_processing: ScanLine,
    classifying: Tags,
    extracting: Sparkles,
    completed: CheckCircle2,
    failed: XCircle,
    review_needed: AlertTriangle,
};

export default function StatusBadge({ status }) {
    const colorClass = STATUS_COLORS[status] || 'bg-slate-500/20 text-slate-400';
    const label = status?.replace(/_/g, ' ') || 'unknown';
    const Icon = STATUS_ICONS[status];
    const isProcessing = ['ocr_processing', 'extracting', 'classifying'].includes(status);

    return (
        <span className={`badge ${colorClass}`}>
            {isProcessing && (
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-soft" />
            )}
            {Icon && !isProcessing && <Icon className="w-3 h-3" />}
            {label}
        </span>
    );
}
