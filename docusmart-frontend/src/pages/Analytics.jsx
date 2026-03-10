import { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, LineChart, Line,
} from 'recharts';
import { CHART_COLORS } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';
import {
    BarChart3, TrendingUp, Target, DollarSign,
    Calendar, Filter,
} from 'lucide-react';

const tooltipStyle = {
    background: '#1e293b',
    border: '1px solid rgba(100,116,139,0.3)',
    borderRadius: '12px',
    color: '#f1f5f9',
    fontSize: '12px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
};

// Demo analytics data
const vendorSpendData = [
    { name: 'AWS', spend: 45200 },
    { name: 'Google Cloud', spend: 32100 },
    { name: 'WeWork', spend: 28500 },
    { name: 'Stripe', spend: 15800 },
    { name: 'Slack', spend: 8400 },
    { name: 'Notion', spend: 6200 },
    { name: 'GitHub', spend: 4800 },
];

const monthlyVolumeData = [
    { month: 'Sep', docs: 156 }, { month: 'Oct', docs: 203 },
    { month: 'Nov', docs: 189 }, { month: 'Dec', docs: 245 },
    { month: 'Jan', docs: 278 }, { month: 'Feb', docs: 312 },
    { month: 'Mar', docs: 287 },
];

const typeDistribution = [
    { name: 'Invoice', value: 523 },
    { name: 'Receipt', value: 312 },
    { name: 'Contract', value: 145 },
    { name: 'Bank Statement', value: 89 },
    { name: 'Purchase Order', value: 67 },
    { name: 'Tax Form', value: 56 },
    { name: 'Other', value: 55 },
];

const accuracyTrendData = [
    { month: 'Sep', accuracy: 91.2 }, { month: 'Oct', accuracy: 92.5 },
    { month: 'Nov', accuracy: 93.1 }, { month: 'Dec', accuracy: 93.8 },
    { month: 'Jan', accuracy: 94.2 }, { month: 'Feb', accuracy: 94.6 },
    { month: 'Mar', accuracy: 95.1 },
];

const workflowPerformance = [
    { name: 'Invoice Approval', success: 96, runs: 245 },
    { name: 'Auto-Tag', success: 99, runs: 1204 },
    { name: 'Expense Report', success: 92, runs: 52 },
    { name: 'Slack Notify', success: 100, runs: 389 },
];

const PERIODS = ['7d', '30d', '90d', 'Custom'];

export default function Analytics() {
    const [period, setPeriod] = useState('30d');

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="page-header mb-0">
                    <h1 className="page-title">Analytics</h1>
                    <p className="page-subtitle">Document processing insights and trends</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex gap-1 p-1 glass-card-static rounded-xl">
                        {PERIODS.map(p => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                    period === p ? 'bg-primary-600/20 text-white' : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 1: Vendor Spend + Document Types */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Vendor Spend - Horizontal Bar */}
                <div className="glass-card-static p-6 lg:col-span-2">
                    <h3 className="section-title">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        Vendor Spend Breakdown
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={vendorSpendData} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,41,59,0.8)" horizontal={false} />
                            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}
                                   tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                            <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
                            <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(v)} />
                            <Bar dataKey="spend" fill="#34d399" radius={[0, 6, 6, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Document Types Distribution */}
                <div className="glass-card-static p-6">
                    <h3 className="section-title">
                        <Target className="w-4 h-4 text-primary-400" />
                        Type Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={typeDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                                 paddingAngle={3} dataKey="value">
                                {typeDistribution.map((_, i) => (
                                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={tooltipStyle} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1.5 mt-2">
                        {typeDistribution.slice(0, 5).map((item, i) => (
                            <div key={item.name} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i] }} />
                                    <span className="text-slate-400">{item.name}</span>
                                </div>
                                <span className="text-slate-300 font-medium">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 2: Monthly Volume + Accuracy Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Volume */}
                <div className="glass-card-static p-6">
                    <h3 className="section-title">
                        <BarChart3 className="w-4 h-4 text-cyan-400" />
                        Monthly Processing Volume
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={monthlyVolumeData}>
                            <defs>
                                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.2} />
                                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,41,59,0.8)" />
                            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Area type="monotone" dataKey="docs" stroke="#22d3ee" strokeWidth={2.5} fill="url(#volumeGradient)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Accuracy Trend */}
                <div className="glass-card-static p-6">
                    <h3 className="section-title">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        Extraction Accuracy Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={accuracyTrendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,41,59,0.8)" />
                            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}
                                   domain={[88, 96]} tickFormatter={(v) => `${v}%`} />
                            <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
                            <Line type="monotone" dataKey="accuracy" stroke="#34d399" strokeWidth={2.5}
                                  dot={{ fill: '#34d399', r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Row 3: Workflow Performance */}
            <div className="glass-card-static p-6">
                <h3 className="section-title">
                    <BarChart3 className="w-4 h-4 text-primary-400" />
                    Workflow Performance
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {workflowPerformance.map((wf) => (
                        <div key={wf.name} className="p-4 rounded-xl bg-surface-800/30 border border-surface-700/20">
                            <p className="text-sm font-medium text-white">{wf.name}</p>
                            <div className="flex items-end justify-between mt-3">
                                <div>
                                    <p className="text-2xl font-bold text-emerald-400">{wf.success}%</p>
                                    <p className="text-[11px] text-slate-500">success rate</p>
                                </div>
                                <p className="text-xs text-slate-500">{wf.runs} runs</p>
                            </div>
                            <div className="mt-2 confidence-bar">
                                <div
                                    className={`confidence-bar-fill ${wf.success >= 95 ? 'confidence-high' : wf.success >= 90 ? 'confidence-medium' : 'confidence-low'}`}
                                    style={{ width: `${wf.success}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
