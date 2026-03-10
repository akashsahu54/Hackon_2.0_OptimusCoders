import { useState } from 'react';
import { useWorkflows, useCreateWorkflow, useDeleteWorkflow } from '../hooks/useWorkflows';
import toast from 'react-hot-toast';

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

    const handleCreate = (e) => {
        e.preventDefault();
        createMutation.mutate(form, {
            onSuccess: () => {
                toast.success('Workflow created!');
                setShowCreate(false);
                setForm({ name: '', trigger_type: 'document_uploaded', action_type: 'send_email', trigger_condition: {}, action_config: {} });
            },
            onError: (err) => toast.error(err.response?.data?.detail || 'Failed to create workflow'),
        });
    };

    const handleDelete = (id) => {
        if (confirm('Delete this workflow?')) {
            deleteMutation.mutate(id, {
                onSuccess: () => toast.success('Workflow deleted'),
            });
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Workflows</h1>
                    <p className="text-slate-500 text-sm mt-1">Automate actions based on document events</p>
                </div>
                <button onClick={() => setShowCreate(!showCreate)} className="btn-primary text-sm">
                    {showCreate ? 'Cancel' : '+ New Workflow'}
                </button>
            </div>

            {/* Create Form */}
            {showCreate && (
                <form onSubmit={handleCreate} className="glass-card p-6 space-y-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Workflow Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="input-field"
                            placeholder="e.g., Invoice Due Date Alert"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1.5">Trigger</label>
                            <select
                                value={form.trigger_type}
                                onChange={(e) => setForm({ ...form, trigger_type: e.target.value })}
                                className="input-field"
                            >
                                <option value="document_uploaded">Document Uploaded</option>
                                <option value="field_value">Field Value Match</option>
                                <option value="schedule">Schedule</option>
                                <option value="manual">Manual</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1.5">Action</label>
                            <select
                                value={form.action_type}
                                onChange={(e) => setForm({ ...form, action_type: e.target.value })}
                                className="input-field"
                            >
                                <option value="send_email">Send Email</option>
                                <option value="create_tag">Create Tag</option>
                                <option value="generate_report">Generate Report</option>
                                <option value="webhook">Webhook</option>
                                <option value="slack">Slack Notification</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" className="btn-primary text-sm">
                        Create Workflow
                    </button>
                </form>
            )}

            {/* Workflow List */}
            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="glass-card p-5">
                            <div className="skeleton h-4 w-48 mb-2" />
                            <div className="skeleton h-3 w-32" />
                        </div>
                    ))}
                </div>
            ) : workflows?.length > 0 ? (
                <div className="space-y-3">
                    {workflows.map((wf) => (
                        <div key={wf.id} className="glass-card p-5 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-semibold text-white">{wf.name}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs text-slate-500">
                                        Trigger: <span className="text-slate-400">{wf.trigger_type.replace(/_/g, ' ')}</span>
                                    </span>
                                    <span className="text-xs text-slate-600">→</span>
                                    <span className="text-xs text-slate-500">
                                        Action: <span className="text-slate-400">{wf.action_type.replace(/_/g, ' ')}</span>
                                    </span>
                                    <span className="text-xs text-slate-600">•</span>
                                    <span className="text-xs text-slate-500">{wf.run_count} runs</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs px-2 py-1 rounded-full ${wf.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-500'}`}>
                                    {wf.is_active ? 'Active' : 'Inactive'}
                                </span>
                                <button
                                    onClick={() => handleDelete(wf.id)}
                                    className="text-xs text-red-400 hover:text-red-300"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-card p-12 text-center">
                    <p className="text-4xl mb-4">⚡</p>
                    <p className="text-slate-400">No workflows yet</p>
                    <p className="text-slate-600 text-sm mt-1">Create a workflow to automate document actions</p>
                </div>
            )}
        </div>
    );
}
