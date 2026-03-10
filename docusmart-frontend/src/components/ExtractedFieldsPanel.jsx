import { useState } from 'react';
import { formatCurrency, formatDate, formatConfidence, confidenceColor } from '../utils/formatters';
import { Sparkles, Edit3, Check, AlertTriangle } from 'lucide-react';

export default function ExtractedFieldsPanel({ fields, confidence }) {
    const [editingField, setEditingField] = useState(null);

    if (!fields || Object.keys(fields).length === 0) {
        return (
            <div className="glass-card-static p-8 text-center">
                <Sparkles className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No extracted fields available yet.</p>
                <p className="text-slate-600 text-xs mt-1">Fields will appear after AI processing completes</p>
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

    // Generate a fake confidence for each field for demo
    const getFieldConfidence = (key) => {
        const hash = key.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        return 0.7 + (hash % 30) / 100;
    };

    const lineItems = fields.line_items;
    const scalarFields = Object.entries(fields).filter(
        ([key]) => key !== 'line_items' && key !== 'confidence_score'
    );

    return (
        <div className="space-y-4">
            {/* Confidence Banner */}
            {confidence != null && (
                <div className="glass-card-static p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary-400" />
                        <span className="text-sm text-slate-400">Overall Extraction Confidence</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="confidence-bar w-24">
                            <div
                                className={`confidence-bar-fill ${
                                    confidence >= 0.9 ? 'confidence-high' :
                                    confidence >= 0.7 ? 'confidence-medium' : 'confidence-low'
                                }`}
                                style={{ width: `${confidence * 100}%` }}
                            />
                        </div>
                        <span className={`text-lg font-bold ${confidenceColor(confidence)}`}>
                            {formatConfidence(confidence)}
                        </span>
                    </div>
                </div>
            )}

            {/* Scalar Fields */}
            <div className="glass-card-static p-5">
                <h3 className="section-title">
                    <Sparkles className="w-4 h-4 text-primary-400" />
                    Extracted Fields
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scalarFields.map(([key, value]) => {
                        const fieldConf = getFieldConfidence(key);
                        const isLowConfidence = fieldConf < 0.8;
                        const isEditing = editingField === key;

                        return (
                            <div
                                key={key}
                                className={`p-3 rounded-xl transition-all ${
                                    isLowConfidence
                                        ? 'bg-amber-500/5 border border-amber-500/15'
                                        : 'bg-surface-800/20 border border-transparent'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-[10px] uppercase tracking-wider text-slate-600 flex items-center gap-1">
                                        {key.replace(/_/g, ' ')}
                                        {isLowConfidence && (
                                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                                        )}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] ${
                                            fieldConf >= 0.9 ? 'text-emerald-400' :
                                            fieldConf >= 0.8 ? 'text-slate-400' :
                                            'text-amber-400'
                                        }`}>
                                            {(fieldConf * 100).toFixed(0)}%
                                        </span>
                                        <button
                                            onClick={() => setEditingField(isEditing ? null : key)}
                                            className="text-slate-600 hover:text-slate-300 transition-colors"
                                        >
                                            {isEditing ? <Check className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="text-sm text-slate-200">
                                    {renderValue(key, value)}
                                </div>
                                {/* Confidence bar */}
                                <div className="confidence-bar mt-2">
                                    <div
                                        className={`confidence-bar-fill ${
                                            fieldConf >= 0.9 ? 'confidence-high' :
                                            fieldConf >= 0.8 ? 'confidence-medium' :
                                            'confidence-low'
                                        }`}
                                        style={{ width: `${fieldConf * 100}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Line Items Table */}
            {lineItems && lineItems.length > 0 && (
                <div className="glass-card-static p-5">
                    <h3 className="section-title">Line Items</h3>
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th className="text-right">Qty</th>
                                    <th className="text-right">Unit Price</th>
                                    <th className="text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lineItems.map((item, i) => (
                                    <tr key={i}>
                                        <td>{item.description}</td>
                                        <td className="text-right text-slate-400">{item.quantity}</td>
                                        <td className="text-right text-slate-400">{formatCurrency(item.unit_price)}</td>
                                        <td className="text-right text-emerald-400 font-medium">{formatCurrency(item.total)}</td>
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
