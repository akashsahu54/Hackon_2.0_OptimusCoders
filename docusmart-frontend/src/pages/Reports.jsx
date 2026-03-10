import { useState } from 'react';
import { reportsApi } from '../api/documents';
import { formatCurrency } from '../utils/formatters';
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
            toast.error(err.response?.data?.detail || 'Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-white">Reports</h1>
                <p className="text-slate-500 text-sm mt-1">Generate expense and summary reports</p>
            </div>

            {/* Report Config */}
            <div className="glass-card p-6 space-y-4">
                <div className="flex gap-3">
                    <button
                        onClick={() => setReportType('expense')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${reportType === 'expense' ? 'bg-primary-600 text-white' : 'glass text-slate-400'}`}
                    >
                        💰 Expense Report
                    </button>
                    <button
                        onClick={() => setReportType('summary')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${reportType === 'summary' ? 'bg-primary-600 text-white' : 'glass text-slate-400'}`}
                    >
                        📊 Summary Report
                    </button>
                </div>

                {reportType === 'expense' ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1.5">Start Date</label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1.5">End Date</label>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field" />
                        </div>
                    </div>
                ) : (
                    <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Period</label>
                        <select value={period} onChange={(e) => setPeriod(e.target.value)} className="input-field w-48">
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>
                )}

                <button onClick={handleGenerate} disabled={loading} className="btn-primary text-sm disabled:opacity-50">
                    {loading ? 'Generating...' : 'Generate Report'}
                </button>
            </div>

            {/* Report Results */}
            {report && (
                <div className="glass-card p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-slate-300">Report Results</h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="stat-card">
                            <p className="text-[10px] uppercase tracking-wider text-slate-600">Documents</p>
                            <p className="text-2xl font-bold text-white">{report.total_documents}</p>
                        </div>
                        <div className="stat-card">
                            <p className="text-[10px] uppercase tracking-wider text-slate-600">Total Spend</p>
                            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(report.total_spend)}</p>
                        </div>
                    </div>

                    {/* Items Table */}
                    {report.items?.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-surface-700/50">
                                        <th className="text-left py-2 text-xs text-slate-500">Filename</th>
                                        <th className="text-left py-2 text-xs text-slate-500">Vendor</th>
                                        <th className="text-left py-2 text-xs text-slate-500">Type</th>
                                        <th className="text-right py-2 text-xs text-slate-500">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.items.map((item, i) => (
                                        <tr key={i} className="border-b border-surface-700/20">
                                            <td className="py-2 text-slate-300">{item.filename}</td>
                                            <td className="py-2 text-slate-400">{item.vendor}</td>
                                            <td className="py-2 text-slate-400">{item.type}</td>
                                            <td className="py-2 text-right text-emerald-400">{formatCurrency(item.amount)}</td>
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
