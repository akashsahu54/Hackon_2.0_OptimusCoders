import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useUploadDocument } from '../hooks/useDocuments';
import toast from 'react-hot-toast';

export default function UploadDropzone() {
    const upload = useUploadDocument();
    const [uploadProgress, setUploadProgress] = useState(null);

    const onDrop = useCallback(
        (acceptedFiles) => {
            acceptedFiles.forEach((file) => {
                setUploadProgress(0);
                upload.mutate(
                    {
                        file,
                        onProgress: (e) => {
                            const pct = Math.round((e.loaded * 100) / e.total);
                            setUploadProgress(pct);
                        },
                    },
                    {
                        onSuccess: (data) => {
                            toast.success(`Uploaded: ${file.name}`);
                            setUploadProgress(null);
                        },
                        onError: (err) => {
                            toast.error(`Upload failed: ${err.response?.data?.detail || err.message}`);
                            setUploadProgress(null);
                        },
                    }
                );
            });
        },
        [upload]
    );

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

    return (
        <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'active' : ''}`}
        >
            <input {...getInputProps()} />

            {uploadProgress !== null ? (
                <div className="space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-primary-600/20 flex items-center justify-center animate-pulse-soft">
                        <span className="text-xl">⬆️</span>
                    </div>
                    <p className="text-sm text-slate-300">Uploading... {uploadProgress}%</p>
                    <div className="w-48 mx-auto h-1.5 bg-surface-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary-500 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-600/10 flex items-center justify-center">
                        <span className="text-3xl">📤</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-200">
                            {isDragActive ? 'Drop your document here...' : 'Drag & drop documents here'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            PDF, PNG, JPG, TIFF — max 50MB
                        </p>
                    </div>
                    <button className="btn-primary text-sm mx-auto">
                        Browse Files
                    </button>
                </div>
            )}
        </div>
    );
}
