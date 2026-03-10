import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
    LayoutDashboard, FileText, Upload, Zap, BarChart3,
    FileBarChart, Search, Settings, LogOut, ChevronLeft,
    ChevronRight, Sparkles, Menu
} from 'lucide-react';

const navSections = [
    {
        label: 'Main',
        items: [
            { path: '/', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/documents', label: 'Documents', icon: FileText },
            { path: '/upload', label: 'Upload', icon: Upload, accent: true },
        ],
    },
    {
        label: 'Intelligence',
        items: [
            { path: '/workflows', label: 'Workflows', icon: Zap },
            { path: '/analytics', label: 'Analytics', icon: BarChart3 },
            { path: '/reports', label: 'Reports', icon: FileBarChart },
            { path: '/search', label: 'Search', icon: Search },
        ],
    },
    {
        label: 'System',
        items: [
            { path: '/settings', label: 'Settings', icon: Settings },
        ],
    },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const sidebarContent = (
        <aside
            className={`h-screen glass border-r border-surface-700/30 flex flex-col transition-all duration-300 ease-in-out ${
                collapsed ? 'w-[72px]' : 'w-64'
            }`}
        >
            {/* Logo */}
            <div className="p-4 border-b border-surface-700/30 flex items-center justify-between min-h-[65px]">
                {!collapsed && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary-600/20 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-primary-400" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold gradient-text">DocuSmart AI</h1>
                            <p className="text-[10px] text-slate-600">Smart Documents</p>
                        </div>
                    </div>
                )}
                {collapsed && (
                    <div className="w-8 h-8 rounded-xl bg-primary-600/20 flex items-center justify-center mx-auto">
                        <Sparkles className="w-4 h-4 text-primary-400" />
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden lg:flex btn-icon w-7 h-7 text-slate-600 hover:text-slate-300"
                    title={collapsed ? 'Expand' : 'Collapse'}
                >
                    {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-4 overflow-y-auto thin-scrollbar">
                {navSections.map((section) => (
                    <div key={section.label}>
                        {!collapsed && (
                            <p className="sidebar-section-label mt-2 mb-2">{section.label}</p>
                        )}
                        <div className="space-y-0.5">
                            {section.items.map(({ path, label, icon: Icon, accent }) => (
                                <NavLink
                                    key={path}
                                    to={path}
                                    end={path === '/'}
                                    className={({ isActive }) =>
                                        `sidebar-link ${isActive ? 'active' : ''} ${
                                            accent && !collapsed ? 'bg-primary-600/10 border border-primary-500/20' : ''
                                        } ${collapsed ? 'justify-center px-0' : ''}`
                                    }
                                    title={collapsed ? label : ''}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${accent ? 'text-primary-400' : ''}`} />
                                    {!collapsed && (
                                        <span className="text-sm font-medium">{label}</span>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* User Info */}
            <div className="p-3 border-t border-surface-700/30">
                <div className={`flex items-center gap-3 mb-2 ${collapsed ? 'justify-center' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {user?.full_name?.[0] || user?.email?.[0] || '?'}
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-slate-200">{user?.full_name || 'User'}</p>
                            <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                        </div>
                    )}
                </div>
                {!collapsed && (
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 text-sm text-slate-500 hover:text-red-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-500/5"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                    </button>
                )}
                {collapsed && (
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors py-1.5"
                        title="Sign Out"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </aside>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 btn-icon bg-surface-800/80"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Desktop Sidebar */}
            <div className="hidden lg:block flex-shrink-0">
                {sidebarContent}
            </div>

            {/* Mobile Sidebar */}
            <div
                className={`lg:hidden fixed inset-y-0 left-0 z-50 transition-transform duration-300 ${
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {sidebarContent}
            </div>
        </>
    );
}
