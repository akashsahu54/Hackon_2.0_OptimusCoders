import { useAnalyticsOverview } from '../hooks/useDocuments';
import { formatCurrency, formatConfidence } from '../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import UploadDropzone from '../components/UploadDropzone';

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#818cf8', '#c4b5fd', '#60a5fa', '#34d399', '#fbbf24', '#f87171'];

export default function Dashboard() {
    const { data: analytics, isLoading } = useAnalyticsOverview();

    const typeData = analytics?.documents_by_type
        ? Object.entries(analytics.documents_by_type).map(([name, value]) => ({
            name: name.replace(/_/g, ' '),
            value,
        }))
        : [];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-500 text-sm mt-1">Overview of your document processing pipeline</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat-card">
                    <p className="text-xs uppercase tracking-wider text-slate-500">Total Documents</p>
                    <p className="text-3xl font-bold text-white">
                        {isLoading ? <span className="skeleton w-16 h-8 block" /> : analytics?.total_documents || 0}
                    </p>
                </div>
                <div className="stat-card">
                    <p className="text-xs uppercase tracking-wider text-slate-500">Total Spend Extracted</p>
                    <p className="text-3xl font-bold text-emerald-400">
                        {isLoading ? <span className="skeleton w-20 h-8 block" /> : formatCurrency(analytics?.total_spend || 0)}
                    </p>
                </div>
                <div className="stat-card">
                    <p className="text-xs uppercase tracking-wider text-slate-500">This Week</p>
                    <p className="text-3xl font-bold text-primary-400">
                        {isLoading ? <span className="skeleton w-12 h-8 block" /> : analytics?.documents_this_week || 0}
                    </p>
                </div>
                <div className="stat-card">
                    <p className="text-xs uppercase tracking-wider text-slate-500">Avg Confidence</p>
                    <p className="text-3xl font-bold text-amber-400">
                        {isLoading ? <span className="skeleton w-16 h-8 block" /> : formatConfidence(analytics?.avg_extraction_confidence || 0)}
                    </p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div className="glass-card p-6">
                    <h3 className="text-sm font-semibold text-slate-300 mb-4">Documents by Type</h3>
                    {typeData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={typeData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }}
                                />
                                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[250px] flex items-center justify-center text-slate-600 text-sm">
                            Upload documents to see analytics
                        </div>
                    )}
                </div>

                {/* Pie Chart */}
                <div className="glass-card p-6">
                    <h3 className="text-sm font-semibold text-slate-300 mb-4">Type Distribution</h3>
                    {typeData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={typeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {typeData.map((_, index) => (
                                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[250px] flex items-center justify-center text-slate-600 text-sm">
                            No data yet
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Upload */}
            <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Quick Upload</h3>
                <UploadDropzone />
            </div>
        </div>
    );
}
