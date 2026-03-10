import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEMO_RECENT_DOCS } from '../utils/constants';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, timeAgo } from '../utils/formatters';
import {
    Search as SearchIcon, Sparkles, Clock, FileText,
    DollarSign, Building2, Hash, ArrowRight, X,
} from 'lucide-react';

const CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: 'documents', label: 'Documents' },
    { id: 'vendors', label: 'Vendors' },
    { id: 'invoices', label: 'Invoices' },
];

const AI_SUGGESTIONS = [
    'How much did we spend on AWS invoices this quarter?',
    'Show all invoices over $10,000',
    'Find contracts expiring in March',
    'Total spend by vendor last month',
];

const RECENT_SEARCHES = [
    'AWS invoices', 'Q4 receipts', 'WeWork contract', 'tax forms 2025',
];

export default function Search() {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('all');
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = (q) => {
        const searchQuery = q || query;
        if (!searchQuery.trim()) return;
        setQuery(searchQuery);
        setHasSearched(true);
    };

    // Filter demo docs based on query
    const results = hasSearched
        ? DEMO_RECENT_DOCS.filter(d =>
            d.original_filename.toLowerCase().includes(query.toLowerCase()) ||
            d.extracted_fields?.vendor_name?.toLowerCase().includes(query.toLowerCase()) ||
            d.document_type?.toLowerCase().includes(query.toLowerCase()) ||
            d.tags?.some(t => t.toLowerCase().includes(query.toLowerCase()))
        )
        : [];

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            {/* Header */}
            <div className="page-header text-center">
                <h1 className="page-title">
                    <Sparkles className="w-6 h-6 text-primary-400 inline mr-2" />
                    Smart Search
                </h1>
                <p className="page-subtitle">Search documents, extracted fields, vendors, and more</p>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search documents, vendors, invoice numbers..."
                    className="w-full px-14 py-4 bg-surface-800/60 border border-surface-700/50 rounded-2xl
                               text-white placeholder-slate-500 outline-none text-lg
                               focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20
                               transition-all duration-300"
                    autoFocus
                />
                {query && (
                    <button
                        onClick={() => { setQuery(''); setHasSearched(false); }}
                        className="absolute right-14 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
                <button
                    onClick={() => handleSearch()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 btn-primary py-2 px-4 text-sm"
                >
                    Search
                </button>
            </div>

            {/* Categories */}
            <div className="flex items-center justify-center gap-2">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            category === cat.id
                                ? 'bg-primary-600/20 text-white'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-surface-800/40'
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Before Search: Suggestions */}
            {!hasSearched && (
                <div className="space-y-8">
                    {/* AI Suggestions */}
                    <div>
                        <h3 className="section-title justify-center">
                            <Sparkles className="w-4 h-4 text-primary-400" />
                            AI-Powered Search Suggestions
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger-children">
                            {AI_SUGGESTIONS.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => handleSearch(suggestion)}
                                    className="glass-card p-4 text-left group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Sparkles className="w-4 h-4 text-primary-400/60 group-hover:text-primary-400 transition-colors flex-shrink-0" />
                                        <span className="text-sm text-slate-400 group-hover:text-white transition-colors">
                                            "{suggestion}"
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Recent Searches */}
                    <div>
                        <h3 className="section-title justify-center">
                            <Clock className="w-4 h-4 text-slate-500" />
                            Recent Searches
                        </h3>
                        <div className="flex items-center justify-center flex-wrap gap-2">
                            {RECENT_SEARCHES.map((search) => (
                                <button
                                    key={search}
                                    onClick={() => handleSearch(search)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-800/30 border border-surface-700/20
                                               text-sm text-slate-400 hover:text-white hover:border-primary-500/20 transition-all"
                                >
                                    <Clock className="w-3.5 h-3.5" />
                                    {search}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Search Results */}
            {hasSearched && (
                <div className="space-y-4 animate-fade-in-up">
                    <p className="text-sm text-slate-500">
                        {results.length} result{results.length !== 1 ? 's' : ''} for "<span className="text-white">{query}</span>"
                    </p>
                    {results.length > 0 ? (
                        results.map((doc) => {
                            const fields = doc.extracted_fields || {};
                            return (
                                <div
                                    key={doc.id}
                                    onClick={() => navigate(`/documents/${doc.id}`)}
                                    className="glass-card p-5 cursor-pointer group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary-600/15 flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-primary-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-white group-hover:text-primary-300 transition-colors">
                                                    {doc.original_filename}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs text-slate-500 capitalize">{doc.document_type?.replace(/_/g, ' ')}</span>
                                                    {fields.vendor_name && (
                                                        <>
                                                            <span className="text-xs text-slate-600">•</span>
                                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                                <Building2 className="w-3 h-3" /> {fields.vendor_name}
                                                            </span>
                                                        </>
                                                    )}
                                                    {fields.total_amount != null && (
                                                        <>
                                                            <span className="text-xs text-slate-600">•</span>
                                                            <span className="text-xs text-emerald-400 flex items-center gap-1">
                                                                <DollarSign className="w-3 h-3" /> {formatCurrency(fields.total_amount)}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <StatusBadge status={doc.status} />
                                            <ArrowRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="glass-card-static p-12 text-center">
                            <SearchIcon className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-400">No results found for "{query}"</p>
                            <p className="text-sm text-slate-600 mt-1">Try different keywords or use AI suggestions</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
