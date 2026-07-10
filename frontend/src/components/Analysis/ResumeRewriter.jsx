import { useState } from 'react';
import { rewriteSection } from '../../services/api';
import toast from 'react-hot-toast';
import { SparklesIcon, ClipboardDocumentIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const sectionTypes = ['experience', 'summary', 'skills', 'education', 'projects'];
const styles = [
  { value: 'professional', label: '💼 Professional', desc: 'Formal & polished' },
  { value: 'creative', label: '🎨 Creative', desc: 'Unique & memorable' },
  { value: 'technical', label: '⚙️ Technical', desc: 'Precise & detailed' },
  { value: 'executive', label: '👔 Executive', desc: 'Strategic & leadership' },
];

const ResumeRewriter = ({ resumeId }) => {
  const [sectionText, setSectionText] = useState('');
  const [sectionType, setSectionType] = useState('experience');
  const [style, setStyle] = useState('professional');
  const [rewritten, setRewritten] = useState('');
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const handleTextChange = (e) => {
    const text = e.target.value;
    setSectionText(text);
    setCharCount(text.length);
  };

  const handleRewrite = async () => {
    if (!sectionText.trim()) { 
      toast.error('Please enter text to rewrite');
      return;
    }
    if (sectionText.length < 20) {
      toast.error('Please enter at least 20 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await rewriteSection({ 
        resume_id: parseInt(resumeId), 
        section_text: sectionText, 
        section_type: sectionType, 
        style 
      });
      setRewritten(res.rewritten_text);
      toast.success('✨ Rewritten successfully!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to rewrite');
    } finally { 
      setLoading(false); 
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rewritten);
    toast.success('📋 Copied to clipboard!');
  };

  const handleClear = () => {
    setSectionText('');
    setRewritten('');
    setCharCount(0);
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-grotesk font-semibold text-lg flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-primary-400" />
            AI Resume Rewriter
          </h3>
          <span className="text-xs text-white/30">
            {charCount} characters
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-white/40 text-sm font-medium mb-1.5">Section Type</label>
            <select value={sectionType} onChange={e => setSectionType(e.target.value)} className="select-field">
              {sectionTypes.map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-white/40 text-sm font-medium mb-1.5">Writing Style</label>
            <select value={style} onChange={e => setStyle(e.target.value)} className="select-field">
              {styles.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Style Preview */}
        <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/5">
          <p className="text-xs text-white/30">
            <span className="text-primary-400">Style:</span> {styles.find(s => s.value === style)?.desc}
          </p>
        </div>

        <div>
          <label className="block text-white/40 text-sm font-medium mb-1.5">Original Text</label>
          <textarea 
            value={sectionText} 
            onChange={handleTextChange}
            rows={6} 
            className="input-field resize-none font-mono text-sm" 
            placeholder="Paste the section you want to rewrite..."
          />
        </div>

        <div className="flex gap-3 mt-4">
          <button 
            onClick={handleRewrite} 
            disabled={loading || !sectionText.trim()} 
            className="btn-primary flex-1 justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Rewriting...
              </>
            ) : (
              <>
                <SparklesIcon className="w-4 h-4" />
                Rewrite with AI
              </>
            )}
          </button>
          {sectionText && (
            <button 
              onClick={handleClear}
              className="btn-secondary px-6"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Result */}
      {rewritten && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 border border-primary-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                <SparklesIcon className="w-4 h-4 text-primary-400" />
              </div>
              <h4 className="font-semibold text-primary-300">✨ Rewritten Version</h4>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleCopy}
                className="btn-secondary text-xs gap-1.5 px-4 py-2"
              >
                <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                Copy
              </button>
              <button 
                onClick={() => setRewritten('')}
                className="btn-secondary text-xs px-4 py-2"
              >
                Close
              </button>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
              {rewritten}
            </p>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-white/20">
            <ArrowPathIcon className="w-3 h-3" />
            <span>Generated with {styles.find(s => s.value === style)?.label} style</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ResumeRewriter;