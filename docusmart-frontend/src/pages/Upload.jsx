import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useUploadDocument } from '../hooks/useDocuments';
import {
    Upload as UploadIcon, FileText, ScanLine, Sparkles, Tags,
    CheckCircle2, Cloud, X, File, Image, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const PIPELINE_STEPS = [
    { id: 'upload', label: 'Upload', icon: Cloud },
    { id: 'ocr', label: 'OCR', icon: ScanLine },
    { id: 'extract', label: 'AI Extraction', icon: Sparkles },
    { id: 'classify', label: 'Classification', icon: Tags },
    { id: 'complete', label: 'Complete', icon: CheckCircle2 },
];

const FILE_TYPES = [
    { ext: 'PDF', icon: FileText, color: 'text-red-400' },
    { ext: 'PNG', icon: Image, color: 'text-blue-400' },
    { ext: 'JPG', icon: Image, color: 'text-green-400' },
    { ext: 'TIFF', icon: Image, color: 'text-purple-400' },
];

export default function Upload() {
    const upload = useUploadDocument();
    const [files, setFiles] = useState([]);
    const [pipelineStage, setPipelineStage] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        const newFiles = acceptedFiles.map(file => ({
            file,
            id: Math.random().toString(36).slice(2),
            progress: 0,
            status: 'queued',
            stage: 0,
        }));
        setFiles(prev => [...prev, ...newFiles]);

        // Simulate processing for each file
        newFiles.forEach((fileObj) => {
            setPipelineStage(0);
            upload.mutate(
                {
                    file: fileObj.file,
                    onProgress: (e) => {
                        const pct = Math.round((e.loaded * 100) / e.total);
                        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, progress: pct, status: 'uploading' } : f));
                    },
                },
                {
                    onSuccess: () => {
                        toast.success(`Processed: ${fileObj.file.name}`);
                        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, progress: 100, status: 'completed', stage: 4 } : f));
                        // Animate pipeline
                        [1, 2, 3, 4].forEach((stage, i) => {
                            setTimeout(() => setPipelineStage(stage), (i + 1) * 800);
                        });
                    },
                    onError: (err) => {
                        toast.error(`Failed: ${err.response?.data?.detail || err.message}`);
                        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'failed' } : f));
                    },
                }
            );
        });
    }, [upload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/png': ['.png'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/tiff': ['.tiff', '.tif'],
        },
        maxSize: 50 * 1024 * 1024,
    });

    const removeFile = (id) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            {/* Header */}
            <div className="page-header text-center">
                <h1 className="page-title">Upload Documents</h1>
                <p className="page-subtitle">Drag and drop files to process with AI</p>
            </div>

            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`dropzone py-16 ${isDragActive ? 'active' : ''}`}
            >
                <input {...getInputProps()} />
                <div className="space-y-4">
                    <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center transition-all duration-300 ${
                        isDragActive
                            ? 'bg-primary-500/20 scale-110 animate-bounce-subtle'
                            : 'bg-primary-600/10'
                    }`}>
                        <UploadIcon className={`w-8 h-8 transition-colors ${isDragActive ? 'text-primary-400' : 'text-primary-500/60'}`} />
                    </div>
                    <div>
                        <p className="text-lg font-medium text-slate-200">
                            {isDragActive ? 'Drop your documents here...' : 'Drag & drop documents'}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            or click to browse files
                        </p>
                    </div>

                    {/* File Type Badges */}
                    <div className="flex items-center justify-center gap-3">
                        {FILE_TYPES.map(({ ext, icon: Icon, color }) => (
                            <span key={ext} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-800/40 border border-surface-700/30">
                                <Icon className={`w-3.5 h-3.5 ${color}`} />
                                <span className="text-xs text-slate-400">{ext}</span>
                            </span>
                        ))}
                    </div>
                    <p className="text-xs text-slate-600">Maximum file size: 50MB</p>
                </div>
            </div>

            {/* Processing Pipeline */}
            {pipelineStage !== null && (
                <div className="glass-card-static p-8 animate-fade-in-up">
                    <h3 className="section-title justify-center">
                        <Sparkles className="w-4 h-4 text-primary-400" />
                        Processing Pipeline
                    </h3>
                    <div className="flex items-center justify-between mt-6">
                        {PIPELINE_STEPS.map((step, i) => {
                            const Icon = step.icon;
                            const isCompleted = i < pipelineStage;
                            const isActive = i === pipelineStage;
                            const isPending = i > pipelineStage;
                            return (
                                <div key={step.id} className="flex items-center flex-1 last:flex-none">
                                    <div className="pipeline-step">
                                        <div className={`pipeline-step-dot ${isCompleted ? 'completed' : isActive ? 'active' : 'pending'}`}>
                                            {isCompleted ? (
                                                <CheckCircle2 className="w-5 h-5" />
                                            ) : (
                                                <Icon className="w-5 h-5" />
                                            )}
                                        </div>
                                        <span className={`text-xs font-medium ${
                                            isCompleted ? 'text-emerald-400' : isActive ? 'text-primary-400' : 'text-slate-600'
                                        }`}>
                                            {step.label}
                                        </span>
                                    </div>
                                    {i < PIPELINE_STEPS.length - 1 && (
                                        <div className={`pipeline-connector ${isCompleted ? 'bg-emerald-500/40' : 'bg-surface-700'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* File Queue */}
            {files.length > 0 && (
                <div className="space-y-3">
                    <h3 className="section-title">
                        <File className="w-4 h-4 text-primary-400" />
                        Upload Queue
                    </h3>
                    {files.map((fileObj) => (
                        <div key={fileObj.id} className="glass-card-static p-4 flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                fileObj.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' :
                                fileObj.status === 'failed' ? 'bg-red-500/15 text-red-400' :
                                'bg-primary-500/15 text-primary-400'
                            }`}>
                                {fileObj.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> :
                                 fileObj.status === 'failed' ? <AlertCircle className="w-5 h-5" /> :
                                 <FileText className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{fileObj.file.name}</p>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs text-slate-500">
                                        {(fileObj.file.size / 1024).toFixed(1)} KB
                                    </span>
                                    {fileObj.status === 'uploading' && (
                                        <>
                                            <div className="flex-1 h-1 bg-surface-700 rounded-full overflow-hidden max-w-[200px]">
                                                <div
                                                    className="h-full bg-primary-500 rounded-full transition-all duration-300"
                                                    style={{ width: `${fileObj.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-primary-400">{fileObj.progress}%</span>
                                        </>
                                    )}
                                    {fileObj.status === 'completed' && (
                                        <span className="text-xs text-emerald-400">✓ Processed</span>
                                    )}
                                    {fileObj.status === 'failed' && (
                                        <span className="text-xs text-red-400">Failed</span>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => removeFile(fileObj.id)} className="btn-icon w-8 h-8">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
