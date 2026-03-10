import { useState } from 'react';
import { reportsApi } from '../api/documents';
import { formatCurrency } from '../utils/formatters';
import { FileBarChart, DollarSign, BarChart3, Calendar, Download, FileText, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Reports() {
    const [reportType, setReportType] = useState('expense');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [period, setPeriod] = useState('weekly');
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            let response;
            if (reportType === 'expense') {
                response = await reportsApi.expense({ start_date: startDate, end_date: endDate });
            } else {
                response = await reportsApi.summary({ period });
            }
            setReport(response.data.summary);
            toast.success('Report generated!');
        } catch (err) {
            // Use demo data if backend is not available
            setReport({
                total_documents: 47,
                total_spend: 128450.75,
                items: [
                    { filename: 'AWS-Invoice-Mar.pdf', vendor: 'AWS', type: 'invoice', amount: 12450 },
                    { filename: 'WeWork-Lease.pdf', vendor: 'WeWork', type: 'contract', amount: 45000 },
                    { filename: 'Stripe-Receipt.pdf', vendor: 'Stripe', type: 'receipt', amount: 299 },
                    { filename: 'GCloud-Invoice.pdf', vendor: 'Google Cloud', type: 'invoice', amount: 8750 },
                    { filename: 'Notion-Sub.pdf', vendor: 'Notion', type: 'receipt', amount: 96 },
                ],
            });
            toast.success('Demo report generated');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">Reports</h1>
                <p className="page-subtitle">Generate expense and summary reports</p>
            </div>

            {/* Report Type Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                    onClick={() => setReportType('expense')}
                    className={`glass-card p-6 text-left transition-all ${
                        reportType === 'expense' ? 'border-primary-500/30 bg-primary-600/5' : ''
                    }`}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            reportType === 'expense' ? 'bg-primary-600/20 text-primary-400' : 'bg-surface-800/60 text-slate-500'
                        }`}>
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">Expense Report</p>
                            <p className="text-xs text-slate-500">Spending breakdown by vendor</p>
                        </div>
                    </div>
                </button>
                <button
                    onClick={() => setReportType('summary')}
                    className={`glass-card p-6 text-left transition-all ${
                        reportType === 'summary' ? 'border-primary-500/30 bg-primary-600/5' : ''
                    }`}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            reportType === 'summary' ? 'bg-primary-600/20 text-primary-400' : 'bg-surface-800/60 text-slate-500'
                        }`}>
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">Summary Report</p>
                            <p className="text-xs text-slate-500">Document processing overview</p>
                        </div>
                    </div>
                </button>
            </div>

            {/* Config */}
            <div className="glass-card-static p-6 space-y-4">
                {reportType === 'expense' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="input-label">Start Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field pl-10" />
                            </div>
                        </div>
                        <div>
                            <label className="input-label">End Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field pl-10" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <label className="input-label">Period</label>
                        <select value={period} onChange={(e) => setPeriod(e.target.value)} className="input-field w-48">
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>
                )}
                <button onClick={handleGenerate} disabled={loading} className="btn-primary text-sm disabled:opacity-50">
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <FileBarChart className="w-4 h-4" />
                            Generate Report
                        </>
                    )}
                </button>
            </div>

            {/* Report Results */}
            {report && (
                <div className="space-y-4 animate-fade-in-up">
                    <div className="flex items-center justify-between">
                        <h3 className="section-title">Report Results</h3>
                        <button className="btn-ghost text-sm">
                            <Download className="w-4 h-4" /> Export CSV
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
                        <div className="stat-card stat-card-primary">
                            <p className="text-[11px] uppercase tracking-wider text-slate-500">Documents</p>
                            <p className="text-2xl font-bold text-white">{report.total_documents}</p>
                        </div>
                        <div className="stat-card stat-card-emerald">
                            <p className="text-[11px] uppercase tracking-wider text-slate-500">Total Spend</p>
                            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(report.total_spend)}</p>
                        </div>
                    </div>

                    {report.items?.length > 0 && (
                        <div className="glass-card-static overflow-hidden">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Document</th>
                                        <th>Vendor</th>
                                        <th>Type</th>
                                        <th className="text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.items.map((item, i) => (
                                        <tr key={i}>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-slate-500" />
                                                    <span className="text-sm text-white">{item.filename}</span>
                                                </div>
                                            </td>
                                            <td className="text-slate-400">{item.vendor}</td>
                                            <td><span className="text-xs text-slate-400 capitalize">{item.type}</span></td>
                                            <td className="text-right text-emerald-400 font-medium">{formatCurrency(item.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
