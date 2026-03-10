/** Utilities — constants and formatters */

export const DOCUMENT_TYPES = [
    'invoice', 'receipt', 'contract', 'id_document',
    'bank_statement', 'tax_form', 'medical_form',
    'purchase_order', 'utility_bill', 'other',
];

export const STATUSES = [
    'uploaded', 'ocr_processing', 'classifying',
    'extracting', 'completed', 'failed', 'review_needed',
];

export const STATUS_COLORS = {
    uploaded: 'bg-blue-500/20 text-blue-400',
    ocr_processing: 'bg-amber-500/20 text-amber-400',
    classifying: 'bg-purple-500/20 text-purple-400',
    extracting: 'bg-cyan-500/20 text-cyan-400',
    completed: 'bg-emerald-500/20 text-emerald-400',
    failed: 'bg-red-500/20 text-red-400',
    review_needed: 'bg-orange-500/20 text-orange-400',
};

export const TYPE_ICONS = {
    invoice: '🧾',
    receipt: '🧾',
    contract: '📄',
    id_document: '🪪',
    bank_statement: '🏦',
    tax_form: '📋',
    medical_form: '🏥',
    purchase_order: '📦',
    utility_bill: '💡',
    other: '📎',
};
