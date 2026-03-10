import { formatCurrency, formatDate, formatConfidence, confidenceColor } from '../utils/formatters';

export default function ExtractedFieldsPanel({ fields, confidence }) {
    if (!fields || Object.keys(fields).length === 0) {
        return (
            <div className="glass-card p-6 text-center text-slate-500 text-sm">
                No extracted fields available yet.
            </div>
        );
    }

    const renderValue = (key, value) => {
        if (value == null) return <span className="text-slate-600">—</span>;
        if (typeof value === 'number') {
            if (key.includes('amount') || key.includes('total') || key.includes('subtotal') || key.includes('price')) {
                return <span className="text-emerald-400 font-medium">{formatCurrency(value)}</span>;
            }
            return <span>{value}</span>;
        }
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
            return <span>{formatDate(value)}</span>;
        }
        if (Array.isArray(value)) {
            return (
                <div className="space-y-1">
                    {value.map((item, i) => (
                        <div key={i} className="text-xs bg-surface-800/60 rounded-lg p-2">
                            {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                        </div>
                    ))}
                </div>
            );
        }
        return <span>{String(value)}</span>;
    };

    // Separate line_items from scalar fields
    const lineItems = fields.line_items;
    const scalarFields = Object.entries(fields).filter(
        ([key]) => key !== 'line_items' && key !== 'confidence_score'
    );

    return (
        <div className="space-y-4">
            {/* Confidence Banner */}
            {confidence != null && (
                <div className="glass-card p-4 flex items-center justify-between">
                    <span className="text-sm text-slate-400">Extraction Confidence</span>
                    <span className={`text-lg font-bold ${confidenceColor(confidence)}`}>
                        {formatConfidence(confidence)}
                    </span>
                </div>
            )}

            {/* Scalar Fields */}
            <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">Extracted Fields</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scalarFields.map(([key, value]) => (
                        <div key={key} className="space-y-1">
                            <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                {key.replace(/_/g, ' ')}
                            </p>
                            <div className="text-sm text-slate-200">
                                {renderValue(key, value)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Line Items Table */}
            {lineItems && lineItems.length > 0 && (
                <div className="glass-card p-5">
                    <h3 className="text-sm font-semibold text-slate-300 mb-4">Line Items</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-surface-700/50">
                                    <th className="text-left py-2 text-xs text-slate-500 font-medium">Description</th>
                                    <th className="text-right py-2 text-xs text-slate-500 font-medium">Qty</th>
                                    <th className="text-right py-2 text-xs text-slate-500 font-medium">Unit Price</th>
                                    <th className="text-right py-2 text-xs text-slate-500 font-medium">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lineItems.map((item, i) => (
                                    <tr key={i} className="border-b border-surface-700/20">
                                        <td className="py-2 text-slate-300">{item.description}</td>
                                        <td className="py-2 text-right text-slate-400">{item.quantity}</td>
                                        <td className="py-2 text-right text-slate-400">{formatCurrency(item.unit_price)}</td>
                                        <td className="py-2 text-right text-emerald-400 font-medium">{formatCurrency(item.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
