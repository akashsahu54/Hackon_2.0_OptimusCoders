import { STATUS_COLORS } from '../utils/constants';

export default function StatusBadge({ status }) {
    const colorClass = STATUS_COLORS[status] || 'bg-slate-500/20 text-slate-400';
    const label = status?.replace(/_/g, ' ') || 'unknown';

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${colorClass}`}>
            {status === 'ocr_processing' || status === 'extracting' || status === 'classifying' ? (
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-soft mr-1.5" />
            ) : null}
            {label}
        </span>
    );
}
