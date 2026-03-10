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

// Lucide icon names mapped to document types
export const TYPE_ICON_NAMES = {
    invoice: 'Receipt',
    receipt: 'Receipt',
    contract: 'FileText',
    id_document: 'CreditCard',
    bank_statement: 'Landmark',
    tax_form: 'ClipboardList',
    medical_form: 'Heart',
    purchase_order: 'Package',
    utility_bill: 'Zap',
    other: 'Paperclip',
};

export const STATUS_ICON_NAMES = {
    uploaded: 'Upload',
    ocr_processing: 'ScanLine',
    classifying: 'Tags',
    extracting: 'Sparkles',
    completed: 'CheckCircle2',
    failed: 'XCircle',
    review_needed: 'AlertTriangle',
};

export const CHART_COLORS = [
    '#6366f1', '#8b5cf6', '#a78bfa', '#818cf8',
    '#60a5fa', '#22d3ee', '#34d399', '#fbbf24',
    '#fb7185', '#c084fc',
];

// Demo data for when backend is not connected
export const DEMO_STATS = {
    total_documents: 1247,
    total_spend: 284650.50,
    documents_this_week: 43,
    avg_extraction_confidence: 0.946,
    documents_by_type: {
        invoice: 523, receipt: 312, contract: 145,
        bank_statement: 89, purchase_order: 67, tax_form: 56, other: 55,
    },
};

export const DEMO_RECENT_DOCS = [
    { id: 1, original_filename: 'AWS-Invoice-Mar2026.pdf', document_type: 'invoice', status: 'completed', extraction_confidence: 0.97, extracted_fields: { vendor_name: 'Amazon Web Services', total_amount: 12450.00, invoice_date: '2026-03-01' }, created_at: new Date(Date.now() - 1800000).toISOString(), tags: ['aws', 'cloud'] },
    { id: 2, original_filename: 'Office-Lease-Agreement.pdf', document_type: 'contract', status: 'completed', extraction_confidence: 0.89, extracted_fields: { vendor_name: 'WeWork', total_amount: 45000.00, invoice_date: '2026-02-28' }, created_at: new Date(Date.now() - 7200000).toISOString(), tags: ['lease'] },
    { id: 3, original_filename: 'Employee-ID-Scan.jpg', document_type: 'id_document', status: 'review_needed', extraction_confidence: 0.72, extracted_fields: {}, created_at: new Date(Date.now() - 14400000).toISOString(), tags: [] },
    { id: 4, original_filename: 'Q1-Tax-Filing.pdf', document_type: 'tax_form', status: 'extracting', extraction_confidence: null, extracted_fields: {}, created_at: new Date(Date.now() - 3600000).toISOString(), tags: ['tax', 'q1'] },
    { id: 5, original_filename: 'Stripe-Receipt-Feb.pdf', document_type: 'receipt', status: 'completed', extraction_confidence: 0.95, extracted_fields: { vendor_name: 'Stripe Inc.', total_amount: 299.00, invoice_date: '2026-02-15' }, created_at: new Date(Date.now() - 86400000).toISOString(), tags: ['stripe', 'saas'] },
];

export const DEMO_WEEKLY_VOLUME = [
    { name: 'Mon', docs: 12 }, { name: 'Tue', docs: 19 },
    { name: 'Wed', docs: 8 }, { name: 'Thu', docs: 15 },
    { name: 'Fri', docs: 23 }, { name: 'Sat', docs: 5 },
    { name: 'Sun', docs: 3 },
];

export const DEMO_ACTIVITY = [
    { id: 1, type: 'upload', message: 'AWS-Invoice-Mar2026.pdf uploaded', time: '2 min ago', icon: 'Upload' },
    { id: 2, type: 'workflow', message: 'Invoice approval triggered for $12,450', time: '5 min ago', icon: 'Zap' },
    { id: 3, type: 'extraction', message: 'AI extracted 14 fields from contract', time: '12 min ago', icon: 'Sparkles' },
    { id: 4, type: 'alert', message: 'Low confidence on Employee-ID-Scan.jpg', time: '1 hr ago', icon: 'AlertTriangle' },
    { id: 5, type: 'completed', message: 'OCR completed for Stripe-Receipt-Feb.pdf', time: '2 hrs ago', icon: 'CheckCircle2' },
];
