import { useState } from 'react';
import { generateInterviewQuestions } from '../../services/api';
import toast from 'react-hot-toast';
import { QuestionMarkCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const categoryColors = {
  technical:    'badge-blue',
  behavioral:   'badge-green',
  situational:  'badge-yellow',
  'culture-fit':'badge-purple',
};
const difficultyColors = {
  easy:   'badge-green',
  medium: 'badge-yellow',
  hard:   'badge-red',
};

const InterviewQuestions = ({ resumeId }) => {
  const [form, setForm]         = useState({ jobTitle: '', jobDescription: '' });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [open, setOpen]         = useState(null);

  const handleGenerate = async () => {
    if (!form.jobTitle || !form.jobDescription) { toast.error('Fill all fields'); return; }
    setLoading(true);
    try {
      const res = await generateInterviewQuestions({ resume_id: parseInt(resumeId), job_title: form.jobTitle, job_description: form.jobDescription });
      setQuestions(res.questions);
      toast.success('Questions generated!');
    } catch { toast.error('Failed to generate questions'); }
    finally { setLoading(false); }
  };

  return (
    <div className="card space-y-5">
      <h3 className="font-grotesk font-semibold text-lg flex items-center gap-2">
        <QuestionMarkCircleIcon className="w-5 h-5 text-primary-400" />
        Interview Questions Generator
      </h3>

      <div>
        <label className="block text-white/50 text-sm mb-1.5">Job Title</label>
        <input type="text" value={form.jobTitle} onChange={e => setForm({...form, jobTitle: e.target.value})} className="input-field" placeholder="e.g., Software Engineer" />
      </div>
      <div>
        <label className="block text-white/50 text-sm mb-1.5">Job Description</label>
        <textarea value={form.jobDescription} onChange={e => setForm({...form, jobDescription: e.target.value})} rows={4} className="input-field resize-none" placeholder="Paste job description..." />
      </div>

      <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full justify-center gap-2 disabled:opacity-50">
        {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Generating...</> : <><QuestionMarkCircleIcon className="w-4 h-4" />Generate Questions</>}
      </button>

      {questions.length > 0 && (
        <div className="space-y-3 mt-2">
          {questions.map((q, i) => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/3 overflow-hidden">
              <button className="w-full flex items-center justify-between p-4 text-left" onClick={() => setOpen(open === i ? null : i)}>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className={`badge text-xs ${categoryColors[q.category] || 'badge-purple'}`}>{q.category}</span>
                    <span className={`badge text-xs ${difficultyColors[q.difficulty] || 'badge-yellow'}`}>{q.difficulty}</span>
                  </div>
                  <p className="text-white/80 text-sm font-medium">{q.question}</p>
                </div>
                <ChevronDownIcon className={`w-4 h-4 text-white/30 flex-shrink-0 ml-3 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && q.sample_answer && (
                <div className="px-4 pb-4 border-t border-white/5">
                  <p className="text-white/50 text-xs mt-3 mb-1">Sample Answer</p>
                  <p className="text-white/60 text-sm leading-relaxed">{q.sample_answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewQuestions;