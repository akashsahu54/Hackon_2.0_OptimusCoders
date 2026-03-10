import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sparkles, FileText, Zap, Shield, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const features = [
    { icon: FileText, title: 'Smart OCR', desc: 'Extract text from any document format' },
    { icon: Sparkles, title: 'AI Extraction', desc: 'Structured data extraction with AI' },
    { icon: Zap, title: 'Auto Workflows', desc: 'Automate document-based actions' },
    { icon: Shield, title: 'Enterprise Ready', desc: 'SOC2 compliant & secure' },
];

export default function Login() {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
        <div className="min-h-screen flex bg-surface-950">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-600/[0.07] rounded-full blur-[128px] animate-float" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-600/[0.05] rounded-full blur-[100px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/[0.03] rounded-full blur-[150px]" />
            </div>

            {/* Left: Hero Panel */}
            <div className="hidden lg:flex flex-1 items-center justify-center relative p-12">
                <div className="max-w-md space-y-8 relative z-10">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary-600/20 flex items-center justify-center border border-primary-500/20">
                            <Sparkles className="w-6 h-6 text-primary-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold gradient-text-glow">DocuSmart AI</h1>
                            <p className="text-xs text-slate-500">Smart Document Management</p>
                        </div>
                    </div>

                    {/* Tagline */}
                    <div>
                        <h2 className="text-4xl font-extrabold text-white leading-tight">
                            Transform documents<br />
                            into <span className="gradient-text">structured data</span>
                        </h2>
                        <p className="text-slate-400 mt-4 leading-relaxed">
                            AI-powered OCR, extraction, classification, and automated workflows for enterprise document processing.
                        </p>
                    </div>

                    {/* Feature Grid */}
                    <div className="grid grid-cols-2 gap-4 stagger-children">
                        {features.map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="glass-card-static p-4 rounded-xl">
                                <Icon className="w-5 h-5 text-primary-400 mb-2" />
                                <p className="text-sm font-medium text-white">{title}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Form */}
            <div className="flex-1 flex items-center justify-center p-6 relative z-10">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-primary-600/20 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-primary-400" />
                            </div>
                            <h1 className="text-2xl font-bold gradient-text">DocuSmart AI</h1>
                        </div>
                        <p className="text-slate-500 text-sm">Smart Document Management System</p>
                    </div>

                    {/* Form Card */}
                    <div className="glass-card-static p-8 gradient-border rounded-2xl">
                        <h2 className="text-xl font-semibold text-white mb-1">
                            {isRegister ? 'Create your account' : 'Welcome back'}
                        </h2>
                        <p className="text-sm text-slate-500 mb-8">
                            {isRegister ? 'Start processing documents with AI' : 'Sign in to your DocuSmart workspace'}
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {isRegister && (
                                <div>
                                    <label className="input-label">Full Name</label>
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
                                <label className="input-label">Email</label>
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
                                <label className="input-label">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input-field pr-11"
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-3 disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {isRegister ? 'Create Account' : 'Sign In'}
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
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

                    <p className="text-center text-[11px] text-slate-600 mt-6">
                        By signing in, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    );
}
