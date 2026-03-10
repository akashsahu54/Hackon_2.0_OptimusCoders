import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function Login() {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isRegister) {
                await register(email, password, fullName);
                toast.success('Account created!');
            } else {
                await login(email, password);
                toast.success('Welcome back!');
            }
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-surface-950">
            {/* Background glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary-600/8 rounded-full blur-[128px]" />
                <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-purple-600/6 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold gradient-text mb-2">DocuSmart AI</h1>
                    <p className="text-slate-500 text-sm">Smart Document Management System</p>
                    <p className="text-slate-600 text-xs mt-1">OCR + AI Extraction + Automated Workflows</p>
                </div>

                {/* Form Card */}
                <div className="glass-card p-8">
                    <h2 className="text-lg font-semibold text-white mb-6">
                        {isRegister ? 'Create Account' : 'Sign In'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegister && (
                            <div>
                                <label className="block text-xs text-slate-400 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="input-field"
                                    placeholder="John Smith"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs text-slate-400 mb-1.5">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                placeholder="you@company.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-slate-400 mb-1.5">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full disabled:opacity-50"
                        >
                            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button
                            onClick={() => setIsRegister(!isRegister)}
                            className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
                        >
                            {isRegister ? 'Sign In' : 'Create one'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
