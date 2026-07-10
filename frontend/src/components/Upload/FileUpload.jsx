import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  XMarkIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { uploadResume } from '../../services/api';
import toast from 'react-hot-toast';

const FileUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const onDrop = useCallback((accepted) => {
    const f = accepted[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { toast.error('File must be less than 10MB'); return; }
    setFile(f);
    setUploaded(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadResume(file);
      setUploaded(true);
      toast.success('Resume uploaded successfully!');
      if (onUploadSuccess) onUploadSuccess(result);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            {...getRootProps()}
            className={`relative border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? 'border-primary-500 bg-primary-500/10 shadow-glow'
                : 'border-white/10 bg-white/3 hover:border-primary-500/50 hover:bg-primary-500/5'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-purple flex items-center justify-center shadow-glow transition-transform duration-300 ${isDragActive ? 'scale-110' : ''}`}>
                <CloudArrowUpIcon className="w-10 h-10 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-lg mb-1">
                  {isDragActive ? 'Drop it here!' : 'Drop your resume here'}
                </p>
                <p className="text-white/40 text-sm">or click to browse files</p>
                <p className="text-white/20 text-xs mt-2">PDF, DOCX, TXT — Max 10MB</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="file"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="card-glass rounded-2xl border border-white/10"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-purple flex items-center justify-center flex-shrink-0">
                {uploaded ? (
                  <CheckCircleIcon className="w-6 h-6 text-white" />
                ) : (
                  <DocumentIcon className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{file.name}</p>
                <p className="text-white/40 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              {!uploading && !uploaded && (
                <button
                  onClick={() => setFile(null)}
                  className="text-white/30 hover:text-red-400 transition-colors p-1"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>

            {uploading && (
              <div className="mt-4">
                <div className="progress-bar h-1.5">
                  <div className="progress-fill h-1.5 animate-pulse w-full" />
                </div>
                <p className="text-white/40 text-xs mt-2 text-center">Parsing and analyzing...</p>
              </div>
            )}

            {!uploading && !uploaded && (
              <button onClick={handleUpload} className="btn-primary w-full mt-4 justify-center">
                Analyze Resume
              </button>
            )}

            {uploaded && (
              <div className="mt-4 flex items-center justify-center gap-2 text-emerald-400 text-sm font-medium">
                <CheckCircleIcon className="w-5 h-5" />
                Redirecting to analysis...
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;