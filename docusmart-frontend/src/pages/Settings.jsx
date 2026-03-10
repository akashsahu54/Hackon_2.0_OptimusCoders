import { useAuth } from '../hooks/useAuth';
import {
    User, Mail, Shield, Key, Globe, Bell,
    Zap, Database, Cpu, Server, ExternalLink,
    AlertTriangle,
} from 'lucide-react';

export default function Settings() {
    const { user } = useAuth();

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl">
            <div className="page-header">
                <h1 className="page-title">Settings</h1>
                <p className="page-subtitle">Manage your account and system preferences</p>
            </div>

            {/* Profile */}
            <div className="glass-card-static p-6">
                <h3 className="section-title">
                    <User className="w-4 h-4 text-primary-400" />
                    Profile
                </h3>
                <div className="flex items-center gap-6 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-2xl font-bold text-white">
                        {user?.full_name?.[0] || user?.email?.[0] || '?'}
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-white">{user?.full_name || 'User'}</p>
                        <p className="text-sm text-slate-400">{user?.email || 'user@company.com'}</p>
                        <span className="badge bg-primary-500/15 text-primary-400 mt-1">
                            <Shield className="w-3 h-3" />
                            {user?.role || 'Admin'}
                        </span>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="input-label">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input type="text" defaultValue={user?.full_name || ''} className="input-field pl-10" readOnly />
                        </div>
                    </div>
                    <div>
                        <label className="input-label">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input type="email" defaultValue={user?.email || ''} className="input-field pl-10" readOnly />
                        </div>
                    </div>
                    <div>
                        <label className="input-label">Role</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input type="text" defaultValue={user?.role || 'admin'} className="input-field pl-10" readOnly />
                        </div>
                    </div>
                    <div>
                        <label className="input-label">Account ID</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input type="text" defaultValue={user?.id || 'usr_1a2b3c4d'} className="input-field pl-10 font-mono text-xs" readOnly />
                        </div>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div className="glass-card-static p-6">
                <h3 className="section-title">
                    <Bell className="w-4 h-4 text-primary-400" />
                    Notifications
                </h3>
                <div className="space-y-4">
                    {[
                        { label: 'Document processed', desc: 'Get notified when a document finishes processing', enabled: true },
                        { label: 'Workflow completed', desc: 'Get notified when a workflow action completes', enabled: true },
                        { label: 'Low confidence alerts', desc: 'Alert when extraction confidence is below threshold', enabled: true },
                        { label: 'Weekly digest', desc: 'Receive weekly summary of document activity', enabled: false },
                    ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between py-2">
                            <div>
                                <p className="text-sm font-medium text-slate-200">{item.label}</p>
                                <p className="text-xs text-slate-500">{item.desc}</p>
                            </div>
                            <button className={`w-10 h-6 rounded-full transition-all relative ${
                                item.enabled ? 'bg-primary-600' : 'bg-surface-700'
                            }`}>
                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                                    item.enabled ? 'right-1' : 'left-1'
                                }`} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* API Configuration */}
            <div className="glass-card-static p-6">
                <h3 className="section-title">
                    <Cpu className="w-4 h-4 text-primary-400" />
                    API Configuration
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                    Configure your OCR and AI extraction settings in the backend <code className="text-primary-400 bg-primary-500/10 px-1.5 py-0.5 rounded">.env</code> file.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-surface-800/30 border border-surface-700/20">
                        <div className="flex items-center gap-3 mb-2">
                            <Globe className="w-4 h-4 text-slate-500" />
                            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">OCR Engine</p>
                        </div>
                        <p className="text-sm font-medium text-slate-200">Tesseract / Google Vision</p>
                        <p className="text-xs text-slate-500 mt-1">Configured via TESSERACT_PATH</p>
                    </div>
                    <div className="p-4 rounded-xl bg-surface-800/30 border border-surface-700/20">
                        <div className="flex items-center gap-3 mb-2">
                            <Zap className="w-4 h-4 text-slate-500" />
                            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">AI Provider</p>
                        </div>
                        <p className="text-sm font-medium text-slate-200">Anthropic Claude / OpenAI</p>
                        <p className="text-xs text-slate-500 mt-1">Configured via API keys</p>
                    </div>
                </div>
            </div>

            {/* System Info */}
            <div className="glass-card-static p-6">
                <h3 className="section-title">
                    <Server className="w-4 h-4 text-primary-400" />
                    System Info
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'Backend', value: 'FastAPI', icon: Server },
                        { label: 'Database', value: 'PostgreSQL', icon: Database },
                        { label: 'OCR', value: 'Tesseract + Vision', icon: Globe },
                        { label: 'AI', value: 'Claude / GPT-4', icon: Cpu },
                    ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="flex items-center gap-2 p-3 rounded-xl bg-surface-800/20">
                            <Icon className="w-4 h-4 text-slate-500" />
                            <div>
                                <p className="text-[10px] text-slate-600 uppercase tracking-wider">{label}</p>
                                <p className="text-xs text-slate-300 font-medium">{value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="glass-card-static p-6 border border-red-500/10">
                <h3 className="section-title text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    Danger Zone
                </h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-300">Delete all documents</p>
                        <p className="text-xs text-slate-500">This action cannot be undone</p>
                    </div>
                    <button className="btn-danger text-sm">Delete All</button>
                </div>
            </div>
        </div>
    );
}
