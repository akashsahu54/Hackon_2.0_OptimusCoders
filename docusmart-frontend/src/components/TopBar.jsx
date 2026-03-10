import { useLocation } from 'react-router-dom';
import { Bell, Search, Command } from 'lucide-react';

const pageTitles = {
    '/': 'Dashboard',
    '/documents': 'Documents',
    '/upload': 'Upload',
    '/workflows': 'Workflows',
    '/analytics': 'Analytics',
    '/reports': 'Reports',
    '/search': 'Search',
    '/settings': 'Settings',
};

export default function TopBar() {
    const location = useLocation();
    const basePath = '/' + (location.pathname.split('/')[1] || '');
    const pageTitle = pageTitles[basePath] || 'DocuSmart AI';

    return (
        <header className="h-[65px] glass-panel border-b border-surface-700/30 flex items-center justify-between px-6 sticky top-0 z-30">
            {/* Left: Page Title */}
            <div className="flex items-center gap-4 pl-12 lg:pl-0">
                <div>
                    <h2 className="text-lg font-semibold text-white">{pageTitle}</h2>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                {/* Search Trigger */}
                <button
                    onClick={() => window.location.href = '/search'}
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-800/50 border border-surface-700/40 text-slate-500 hover:text-slate-300 hover:border-surface-600/60 transition-all text-sm"
                >
                    <Search className="w-3.5 h-3.5" />
                    <span className="text-xs">Search...</span>
                    <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface-700/50 text-[10px] font-mono text-slate-600">
                        <Command className="w-2.5 h-2.5" />K
                    </kbd>
                </button>

                {/* Notifications */}
                <button className="btn-icon relative">
                    <Bell className="w-[18px] h-[18px]" />
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                        3
                    </span>
                </button>
            </div>
        </header>
    );
}
