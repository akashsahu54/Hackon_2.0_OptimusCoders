import { useState } from 'react';

export default function SearchBar({ onSearch, placeholder = 'Search documents...' }) {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSubmit} className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="input-field pl-11 pr-20"
            />
            <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-medium bg-primary-600/30 text-primary-300 rounded-lg hover:bg-primary-600/50 transition-colors"
            >
                Search
            </button>
        </form>
    );
}
