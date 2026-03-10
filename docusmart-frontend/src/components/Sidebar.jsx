import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/documents', label: 'Documents', icon: '📁' },
    { path: '/workflows', label: 'Workflows', icon: '⚡' },
    { path: '/reports', label: 'Reports', icon: '📈' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="w-64 h-screen glass border-r border-surface-700/30 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-surface-700/30">
                <h1 className="text-xl font-bold gradient-text">DocuSmart AI</h1>
                <p className="text-xs text-slate-500 mt-1">Smart Document Management</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map(({ path, label, icon }) => (
                    <NavLink
                        key={path}
                        to={path}
                        end={path === '/'}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? 'active' : ''}`
                        }
                    >
                        <span className="text-lg">{icon}</span>
                        <span className="text-sm font-medium">{label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-surface-700/30">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-primary-600/30 flex items-center justify-center text-sm font-bold text-primary-300">
                        {user?.full_name?.[0] || user?.email?.[0] || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user?.full_name || 'User'}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full text-left text-sm text-slate-500 hover:text-red-400 transition-colors px-2 py-1"
                >
                    ← Sign Out
                </button>
            </div>
        </aside>
    );
}
