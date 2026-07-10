import { useState } from 'react';
import { generateCoverLetter } from '../../services/api';
import toast from 'react-hot-toast';
import { DocumentTextIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';

const CoverLetterGenerator = ({ resumeId }) => {
  const [form, setForm]           = useState({ jobTitle: '', company: '', jobDescription: '' });
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading]     = useState(false);

  const handleGenerate = async () => {
    if (!form.jobTitle || !form.company || !form.jobDescription) { toast.error('Fill all fields'); return; }
    setLoading(true);
    try {
      const res = await generateCoverLetter({ resume_id: parseInt(resumeId), job_title: form.jobTitle, company: form.company, job_description: form.jobDescription });
      setCoverLetter(res.cover_letter);
      toast.success('Cover letter generated!');
    } catch { toast.error('Failed to generate cover letter'); }
    finally { setLoading(false); }
  };

  return (
    <div className="card space-y-5">
      <h3 className="font-grotesk font-semibold text-lg flex items-center gap-2">
        <DocumentTextIcon className="w-5 h-5 text-primary-400" />
        Cover Letter Generator
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white/50 text-sm mb-1.5">Job Title</label>
          <input type="text" value={form.jobTitle} onChange={e => setForm({...form, jobTitle: e.target.value})} className="input-field" placeholder="e.g., Software Engineer" />
        </div>
        <div>
          <label className="block text-white/50 text-sm mb-1.5">Company</label>
          <input type="text" value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="input-field" placeholder="e.g., Google" />
        </div>
      </div>

      <div>
        <label className="block text-white/50 text-sm mb-1.5">Job Description</label>
        <textarea value={form.jobDescription} onChange={e => setForm({...form, jobDescription: e.target.value})} rows={4} className="input-field resize-none" placeholder="Paste job description..." />
      </div>

      <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full justify-center gap-2 disabled:opacity-50">
        {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Generating...</> : <><DocumentTextIcon className="w-4 h-4" />Generate Cover Letter</>}
      </button>

      {coverLetter && (
        <div className="p-5 rounded-xl border border-white/10 bg-white/3">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-white text-sm">Generated Cover Letter</h4>
            <button onClick={() => { navigator.clipboard.writeText(coverLetter); toast.success('Copied!'); }} className="btn-ghost text-xs gap-1.5">
              <ClipboardDocumentIcon className="w-4 h-4" /> Copy
            </button>
          </div>
          <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">{coverLetter}</p>
        </div>
      )}
    </div>
  );
};

export default CoverLetterGenerator;