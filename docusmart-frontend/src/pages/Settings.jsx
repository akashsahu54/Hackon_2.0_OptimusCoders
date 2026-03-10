import { useAuth } from '../hooks/useAuth';

export default function Settings() {
    const { user } = useAuth();

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-slate-500 text-sm mt-1">Manage your account and preferences</p>
            </div>

            {/* Profile */}
            <div className="glass-card p-6 space-y-4">
                <h3 className="text-sm font-semibold text-slate-300">Profile</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Full Name</label>
                        <input type="text" defaultValue={user?.full_name || ''} className="input-field" readOnly />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Email</label>
                        <input type="email" defaultValue={user?.email || ''} className="input-field" readOnly />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Role</label>
                        <input type="text" defaultValue={user?.role || 'user'} className="input-field" readOnly />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Account ID</label>
                        <input type="text" defaultValue={user?.id || ''} className="input-field font-mono text-xs" readOnly />
                    </div>
                </div>
            </div>

            {/* API Configuration */}
            <div className="glass-card p-6 space-y-4">
                <h3 className="text-sm font-semibold text-slate-300">API Configuration</h3>
                <p className="text-xs text-slate-500">
                    Configure your OCR and AI extraction settings in the backend <code className="text-primary-400">.env</code> file.
                </p>
                <div className="grid grid-cols-2 gap-4">
                    <div className="stat-card">
                        <p className="text-[10px] uppercase tracking-wider text-slate-600">OCR Engine</p>
                        <p className="text-sm font-medium text-slate-300">Tesseract / Google Vision</p>
                    </div>
                    <div className="stat-card">
                        <p className="text-[10px] uppercase tracking-wider text-slate-600">AI Provider</p>
                        <p className="text-sm font-medium text-slate-300">Anthropic Claude / OpenAI</p>
                    </div>
                </div>
            </div>

            {/* System Info */}
            <div className="glass-card p-6 space-y-3">
                <h3 className="text-sm font-semibold text-slate-300">System Info</h3>
                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    <span>Backend: FastAPI</span>
                    <span>•</span>
                    <span>Database: PostgreSQL</span>
                    <span>•</span>
                    <span>OCR: Tesseract + Google Vision</span>
                    <span>•</span>
                    <span>AI: Claude / GPT-4</span>
                </div>
            </div>
        </div>
    );
}
