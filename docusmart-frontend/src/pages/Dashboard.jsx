import { useNavigate } from 'react-router-dom';
import { useAnalyticsOverview } from '../hooks/useDocuments';
import { formatCurrency, formatConfidence, timeAgo } from '../utils/formatters';
import { DEMO_STATS, DEMO_RECENT_DOCS, DEMO_WEEKLY_VOLUME, DEMO_ACTIVITY, CHART_COLORS } from '../utils/constants';
import StatusBadge from '../components/StatusBadge';
import UploadDropzone from '../components/UploadDropzone';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
} from 'recharts';
import {
    FileText, DollarSign, TrendingUp, Target,
    ArrowUpRight, ArrowDownRight, Upload, Sparkles,
    CheckCircle2, AlertTriangle, Zap, Clock,
} from 'lucide-react';

const iconMap = {
    Upload, Zap, Sparkles, AlertTriangle, CheckCircle2,
};

const tooltipStyle = {
    background: '#1e293b',
    border: '1px solid rgba(100,116,139,0.3)',
    borderRadius: '12px',
    color: '#f1f5f9',
    fontSize: '12px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
};

export default function Dashboard() {
    const navigate = useNavigate();
    const { data: apiAnalytics, isLoading } = useAnalyticsOverview();

    // Use API data if available, otherwise demo data
    const analytics = apiAnalytics?.total_documents ? apiAnalytics : DEMO_STATS;
    const recentDocs = DEMO_RECENT_DOCS;
    const weeklyData = DEMO_WEEKLY_VOLUME;
    const activity = DEMO_ACTIVITY;

    const typeData = analytics?.documents_by_type
        ? Object.entries(analytics.documents_by_type).map(([name, value]) => ({
            name: name.replace(/_/g, ' '),
            value,
        }))
        : [];

    const stats = [
        {
            label: 'Total Documents',
            value: analytics?.total_documents?.toLocaleString() || '0',
            icon: FileText,
            trend: '+12%',
            trendUp: true,
            color: 'text-primary-400',
            cardClass: 'stat-card-primary',
        },
        {
            label: 'Total Spend',
            value: formatCurrency(analytics?.total_spend || 0),
            icon: DollarSign,
            trend: '+8.2%',
            trendUp: true,
            color: 'text-emerald-400',
            cardClass: 'stat-card-emerald',
        },
        {
            label: 'This Week',
            value: analytics?.documents_this_week?.toString() || '0',
            icon: TrendingUp,
            trend: '-3',
            trendUp: false,
            color: 'text-cyan-400',
            cardClass: 'stat-card-cyan',
        },
        {
            label: 'Avg Confidence',
            value: formatConfidence(analytics?.avg_extraction_confidence || 0),
            icon: Target,
            trend: '+1.2%',
            trendUp: true,
            color: 'text-amber-400',
            cardClass: 'stat-card-amber',
        },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="page-header flex items-center justify-between">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Overview of your document processing pipeline</p>
                </div>
                <button onClick={() => navigate('/upload')} className="btn-primary text-sm">
                    <Upload className="w-4 h-4" />
                    Upload Document
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
                {stats.map(({ label, value, icon: Icon, trend, trendUp, color, cardClass }) => (
                    <div key={label} className={`stat-card ${cardClass}`}>
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">{label}</p>
                            <div className={`w-8 h-8 rounded-lg bg-surface-800/60 flex items-center justify-center ${color}`}>
                                <Icon className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="flex items-end justify-between mt-1">
                            {isLoading ? (
                                <span className="skeleton w-20 h-8 block" />
                            ) : (
                                <p className="text-2xl font-bold text-white">{value}</p>
                            )}
                            <span className={`text-xs font-medium flex items-center gap-0.5 ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
                                {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {trend}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Weekly Volume - Line Chart */}
                <div className="glass-card-static p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="section-title mb-0">
                            <TrendingUp className="w-4 h-4 text-primary-400" />
                            Weekly Document Volume
                        </h3>
                        <span className="text-xs text-slate-500">Last 7 days</span>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={weeklyData}>
                            <defs>
                                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,41,59,0.8)" />
                            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Area type="monotone" dataKey="docs" stroke="#6366f1" strokeWidth={2.5} fill="url(#areaGradient)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Type Distribution - Donut Chart */}
                <div className="glass-card-static p-6">
                    <h3 className="section-title">
                        <Target className="w-4 h-4 text-primary-400" />
                        Document Types
                    </h3>
                    {typeData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={typeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={85}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {typeData.map((_, index) => (
                                            <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={tooltipStyle} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-1.5 mt-2">
                                {typeData.slice(0, 4).map((item, i) => (
                                    <div key={item.name} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i] }} />
                                            <span className="text-slate-400 capitalize">{item.name}</span>
                                        </div>
                                        <span className="text-slate-300 font-medium">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-[200px] flex items-center justify-center text-slate-600 text-sm">
                            No data yet
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Row: Recent Docs + Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Documents Table */}
                <div className="glass-card-static p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="section-title mb-0">
                            <FileText className="w-4 h-4 text-primary-400" />
                            Recent Documents
                        </h3>
                        <button onClick={() => navigate('/documents')} className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                            View all →
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Document</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th className="text-right">Amount</th>
                                    <th className="text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentDocs.map((doc) => (
                                    <tr
                                        key={doc.id}
                                        className="cursor-pointer"
                                        onClick={() => navigate(`/documents/${doc.id}`)}
                                    >
                                        <td>
                                            <p className="text-sm font-medium text-white truncate max-w-[200px]">
                                                {doc.original_filename}
                                            </p>
                                        </td>
                                        <td>
                                            <span className="text-xs text-slate-400 capitalize">
                                                {doc.document_type?.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td><StatusBadge status={doc.status} /></td>
                                        <td className="text-right">
                                            <span className="text-sm text-emerald-400 font-medium">
                                                {doc.extracted_fields?.total_amount
                                                    ? formatCurrency(doc.extracted_fields.total_amount)
                                                    : '—'}
                                            </span>
                                        </td>
                                        <td className="text-right text-xs text-slate-500">
                                            {timeAgo(doc.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="glass-card-static p-6">
                    <h3 className="section-title">
                        <Clock className="w-4 h-4 text-primary-400" />
                        Activity Feed
                    </h3>
                    <div className="space-y-4">
                        {activity.map((item) => {
                            const Icon = iconMap[item.icon] || Zap;
                            return (
                                <div key={item.id} className="flex items-start gap-3">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                        item.type === 'alert' ? 'bg-amber-500/10 text-amber-400' :
                                        item.type === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                                        'bg-primary-500/10 text-primary-400'
                                    }`}>
                                        <Icon className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-slate-300 leading-relaxed">{item.message}</p>
                                        <p className="text-[11px] text-slate-600 mt-0.5">{item.time}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Quick Upload */}
            <div>
                <h3 className="section-title">
                    <Upload className="w-4 h-4 text-primary-400" />
                    Quick Upload
                </h3>
                <UploadDropzone />
            </div>
        </div>
    );
}
