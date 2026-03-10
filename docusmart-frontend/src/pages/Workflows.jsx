import { useState } from 'react';
import { useWorkflows, useCreateWorkflow, useDeleteWorkflow } from '../hooks/useWorkflows';
import {
    Zap, Plus, X, Trash2, Play, Pause,
    FileText, DollarSign, Mail, Tag, Globe,
    MessageSquare, FileBarChart, ArrowRight,
    CheckCircle2, Settings, ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';

const TRIGGERS = [
    { value: 'document_uploaded', label: 'Document Uploaded', icon: FileText, desc: 'When a new document is uploaded' },
    { value: 'field_value', label: 'Field Value Match', icon: DollarSign, desc: 'When extracted field matches a condition' },
    { value: 'schedule', label: 'Schedule', icon: Settings, desc: 'Run on a time-based schedule' },
    { value: 'manual', label: 'Manual Trigger', icon: Play, desc: 'Triggered manually by user' },
];

const ACTIONS = [
    { value: 'send_email', label: 'Send Email', icon: Mail, desc: 'Send notification email' },
    { value: 'create_tag', label: 'Create Tag', icon: Tag, desc: 'Auto-tag the document' },
    { value: 'generate_report', label: 'Generate Report', icon: FileBarChart, desc: 'Create a report' },
    { value: 'webhook', label: 'Webhook', icon: Globe, desc: 'Send data to external service' },
    { value: 'slack', label: 'Slack Notification', icon: MessageSquare, desc: 'Post to Slack channel' },
];

export default function Workflows() {
    const { data: workflows, isLoading } = useWorkflows();
    const createMutation = useCreateWorkflow();
    const deleteMutation = useDeleteWorkflow();
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({
        name: '',
        trigger_type: 'document_uploaded',
        action_type: 'send_email',
        trigger_condition: {},
        action_config: {},
    });
    const [showCondition, setShowCondition] = useState(false);

    const demoWorkflows = [
        { id: 1, name: 'High-value Invoice Approval', trigger_type: 'field_value', action_type: 'send_email', is_active: true, run_count: 24 },
        { id: 2, name: 'Auto-tag AWS Documents', trigger_type: 'document_uploaded', action_type: 'create_tag', is_active: true, run_count: 156 },
        { id: 3, name: 'Weekly Expense Report', trigger_type: 'schedule', action_type: 'generate_report', is_active: false, run_count: 8 },
    ];

    const displayWorkflows = workflows?.length > 0 ? workflows : demoWorkflows;

    const handleCreate = (e) => {
        e.preventDefault();
        createMutation.mutate(form, {
            onSuccess: () => {
                toast.success('Workflow created!');
                setShowCreate(false);
                setForm({ name: '', trigger_type: 'document_uploaded', action_type: 'send_email', trigger_condition: {}, action_config: {} });
            },
            onError: (err) => toast.error(err.response?.data?.detail || 'Failed'),
        });
    };

    const handleDelete = (id) => {
        if (confirm('Delete this workflow?')) {
            deleteMutation.mutate(id, { onSuccess: () => toast.success('Deleted') });
        }
    };

    const selectedTrigger = TRIGGERS.find(t => t.value === form.trigger_type);
    const selectedAction = ACTIONS.find(a => a.value === form.action_type);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div className="page-header mb-0">
                    <h1 className="page-title">Workflows</h1>
                    <p className="page-subtitle">Automate actions based on document events</p>
                </div>
                <button onClick={() => setShowCreate(!showCreate)} className={showCreate ? 'btn-ghost text-sm' : 'btn-primary text-sm'}>
                    {showCreate ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> New Workflow</>}
                </button>
            </div>

            {/* Create Form - Visual Builder */}
            {showCreate && (
                <form onSubmit={handleCreate} className="glass-card-static p-6 space-y-6 animate-fade-in-down">
                    <div>
                        <label className="input-label">Workflow Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="input-field"
                            placeholder="e.g., High-value Invoice Approval"
                            required
                        />
                    </div>

                    {/* Visual Flow: Trigger → Condition → Action */}
                    <div className="flex items-start gap-4 flex-wrap">
                        {/* Trigger Card */}
                        <div className="flex-1 min-w-[250px]">
                            <label className="input-label">When (Trigger)</label>
                            <div className="space-y-2">
                                {TRIGGERS.map(({ value, label, icon: Icon, desc }) => (
                                    <label
                                        key={value}
                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                                            form.trigger_type === value
                                                ? 'bg-primary-600/15 border border-primary-500/30'
                                                : 'bg-surface-800/30 border border-surface-700/20 hover:border-surface-600/40'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="trigger"
                                            value={value}
                                            checked={form.trigger_type === value}
                                            onChange={(e) => setForm({ ...form, trigger_type: e.target.value })}
                                            className="hidden"
                                        />
                                        <Icon className={`w-4 h-4 flex-shrink-0 ${form.trigger_type === value ? 'text-primary-400' : 'text-slate-500'}`} />
                                        <div>
                                            <p className="text-sm font-medium text-slate-200">{label}</p>
                                            <p className="text-[11px] text-slate-500">{desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex items-center self-center pt-8">
                            <ArrowRight className="w-6 h-6 text-primary-500/40" />
                        </div>

                        {/* Condition */}
                        <div className="flex-1 min-w-[250px]">
                            <label className="input-label">Condition (Optional)</label>
                            <button
                                type="button"
                                onClick={() => setShowCondition(!showCondition)}
                                className="w-full p-3 rounded-xl bg-surface-800/30 border border-surface-700/20 hover:border-surface-600/40 transition-all text-left"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Settings className="w-4 h-4 text-slate-500" />
                                        <span className="text-sm text-slate-400">
                                            {showCondition ? 'Hide conditions' : 'Add conditions'}
                                        </span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showCondition ? 'rotate-180' : ''}`} />
                                </div>
                            </button>
                            {showCondition && (
                                <div className="mt-3 p-4 rounded-xl bg-surface-800/20 border border-surface-700/20 space-y-3 animate-fade-in-down">
                                    <p className="text-xs text-slate-500 font-medium">IF</p>
                                    <div className="flex gap-2">
                                        <select className="input-field text-xs flex-1">
                                            <option>document_type</option>
                                            <option>total_amount</option>
                                            <option>vendor_name</option>
                                        </select>
                                        <select className="input-field text-xs w-20">
                                            <option>=</option>
                                            <option>{'>'}</option>
                                            <option>{'<'}</option>
                                            <option>contains</option>
                                        </select>
                                        <input className="input-field text-xs flex-1" placeholder="invoice" />
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium">AND</p>
                                    <div className="flex gap-2">
                                        <select className="input-field text-xs flex-1">
                                            <option>total_amount</option>
                                            <option>document_type</option>
                                        </select>
                                        <select className="input-field text-xs w-20">
                                            <option>{'>'}</option>
                                            <option>=</option>
                                            <option>{'<'}</option>
                                        </select>
                                        <input className="input-field text-xs flex-1" placeholder="10000" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Arrow */}
                        <div className="flex items-center self-center pt-8">
                            <ArrowRight className="w-6 h-6 text-primary-500/40" />
                        </div>

                        {/* Action Card */}
                        <div className="flex-1 min-w-[250px]">
                            <label className="input-label">Then (Action)</label>
                            <div className="space-y-2">
                                {ACTIONS.map(({ value, label, icon: Icon, desc }) => (
                                    <label
                                        key={value}
                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                                            form.action_type === value
                                                ? 'bg-emerald-600/15 border border-emerald-500/30'
                                                : 'bg-surface-800/30 border border-surface-700/20 hover:border-surface-600/40'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="action"
                                            value={value}
                                            checked={form.action_type === value}
                                            onChange={(e) => setForm({ ...form, action_type: e.target.value })}
                                            className="hidden"
                                        />
                                        <Icon className={`w-4 h-4 flex-shrink-0 ${form.action_type === value ? 'text-emerald-400' : 'text-slate-500'}`} />
                                        <div>
                                            <p className="text-sm font-medium text-slate-200">{label}</p>
                                            <p className="text-[11px] text-slate-500">{desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        {/* Preview */}
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="px-2 py-1 rounded-lg bg-primary-500/10 text-primary-400">{selectedTrigger?.label}</span>
                            <ArrowRight className="w-3 h-3" />
                            <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400">{selectedAction?.label}</span>
                        </div>
                        <button type="submit" className="btn-primary text-sm">
                            <Zap className="w-4 h-4" /> Create Workflow
                        </button>
                    </div>
                </form>
            )}

            {/* Workflow List */}
            {isLoading ? (
                <div className="space-y-3">
                    {[1,2,3].map(i => (
                        <div key={i} className="glass-card-static p-5">
                            <div className="skeleton h-4 w-48 mb-2" />
                            <div className="skeleton h-3 w-32" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-3 stagger-children">
                    {displayWorkflows.map((wf) => {
                        const trigger = TRIGGERS.find(t => t.value === wf.trigger_type);
                        const action = ACTIONS.find(a => a.value === wf.action_type);
                        const TriggerIcon = trigger?.icon || Zap;
                        const ActionIcon = action?.icon || Mail;
                        return (
                            <div key={wf.id} className="glass-card p-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary-600/15 flex items-center justify-center">
                                            <Zap className="w-5 h-5 text-primary-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-white">{wf.name}</h3>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-surface-800/50 text-xs text-slate-400">
                                                    <TriggerIcon className="w-3 h-3" /> {trigger?.label || wf.trigger_type}
                                                </span>
                                                <ArrowRight className="w-3 h-3 text-slate-600" />
                                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-surface-800/50 text-xs text-slate-400">
                                                    <ActionIcon className="w-3 h-3" /> {action?.label || wf.action_type}
                                                </span>
                                                <span className="text-xs text-slate-600 ml-2">{wf.run_count} runs</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`badge ${wf.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-500/15 text-slate-500'}`}>
                                            {wf.is_active ? <><CheckCircle2 className="w-3 h-3" /> Active</> : <><Pause className="w-3 h-3" /> Inactive</>}
                                        </span>
                                        <button onClick={() => handleDelete(wf.id)} className="btn-icon w-8 h-8 text-red-400/50 hover:text-red-400">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
