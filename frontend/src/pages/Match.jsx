import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { matchJob, analyzeSkillGap, generateLearningRoadmap, getResumes } from '../services/api';
import toast from 'react-hot-toast';
import {
  BriefcaseIcon, MagnifyingGlassIcon, ChartBarIcon,
  AcademicCapIcon, ArrowTopRightOnSquareIcon,
  ChevronDownIcon, DocumentTextIcon,
} from '@heroicons/react/24/outline';

const Match = () => {
  const [resumes, setResumes]           = useState([]);
  const [form, setForm]                 = useState({ resume_id: '', job_title: '', company: '', job_description: '' });
  const [result, setResult]             = useState(null);
  const [skillGap, setSkillGap]         = useState(null);
  const [roadmap, setRoadmap]           = useState(null);
  const [loading, setLoading]           = useState(false);
  const [activeTab, setActiveTab]       = useState('match');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef                     = useRef(null);

  useEffect(() => {
    getResumes().then(setResumes).catch(() => toast.error('Failed to load resumes'));
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedResume = resumes.find(r => String(r.id) === String(form.resume_id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { resume_id, job_title, company, job_description } = form;
    if (!resume_id || !job_title || !company || !job_description) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const matchRes = await matchJob({ resume_id: parseInt(resume_id), job_title, company, job_description });
      // fix: backend returns matchRes.match not matchRes.match_result
      const matchData = matchRes.match;
      setResult(matchData);
      const [gapRes, roadmapRes] = await Promise.all([
        analyzeSkillGap({ resume_id: parseInt(resume_id), job_skills: matchData.missing_skills || [] }),
        generateLearningRoadmap({ resume_id: parseInt(resume_id), target_role: job_title }),
      ]);
      setSkillGap(gapRes.analysis);
      setRoadmap(roadmapRes.roadmap);
      setActiveTab('match');
      toast.success('Analysis complete!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const scoreNum   = result ? parseFloat(result.overall_match) : 0;
  const scoreColor = scoreNum >= 80 ? '#34D399' : scoreNum >= 60 ? '#FBBF24' : '#F87171';

  return (
    <div className="relative max-w-7xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="font-grotesk text-4xl font-bold mb-2">
          Job <span className="gradient-text">Match Analyzer</span>
        </h1>
        <p className="text-white/35">Compare your resume against any job description</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* ── Form ── */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6">
          <h2 className="font-grotesk font-semibold text-lg mb-6 flex items-center gap-2">
            <BriefcaseIcon className="w-5 h-5 text-primary-400" />
            Job Details
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Custom dropdown */}
            <div>
              <label className="block text-white/40 text-sm mb-1.5">Select Resume</label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: dropdownOpen
                      ? '1px solid rgba(108,60,225,0.6)'
                      : '1px solid rgba(255,255,255,0.06)',
                    boxShadow: dropdownOpen ? '0 0 0 4px rgba(108,60,225,0.1)' : 'none',
                    color: selectedResume ? 'white' : 'rgba(255,255,255,0.25)',
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {selectedResume && (
                      <DocumentTextIcon className="w-4 h-4 text-primary-400 flex-shrink-0" />
                    )}
                    <span className="truncate text-sm">
                      {selectedResume ? selectedResume.filename : 'Choose a resume...'}
                    </span>
                  </div>
                  <ChevronDownIcon
                    className="w-4 h-4 flex-shrink-0 ml-2 transition-transform duration-200"
                    style={{
                      color: 'rgba(255,255,255,0.3)',
                      transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-50 w-full mt-2 rounded-xl overflow-hidden"
                      style={{
                        background: '#0f0f1a',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                      }}
                    >
                      {resumes.length === 0 ? (
                        <div className="px-4 py-4 text-center text-white/25 text-sm">
                          No resumes found. Upload one first.
                        </div>
                      ) : (
                        <div className="max-h-56 overflow-y-auto">
                          {resumes.map((r) => (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => {
                                setForm({ ...form, resume_id: String(r.id) });
                                setDropdownOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150"
                              style={{
                                background: String(form.resume_id) === String(r.id)
                                  ? 'rgba(108,60,225,0.15)'
                                  : 'transparent',
                                borderBottom: '1px solid rgba(255,255,255,0.04)',
                              }}
                              onMouseEnter={e => {
                                if (String(form.resume_id) !== String(r.id))
                                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                              }}
                              onMouseLeave={e => {
                                if (String(form.resume_id) !== String(r.id))
                                  e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: 'rgba(108,60,225,0.2)' }}>
                                <DocumentTextIcon className="w-4 h-4 text-primary-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{r.filename}</p>
                                <p className="text-white/25 text-xs">
                                  {new Date(r.created_at).toLocaleDateString()}
                                  {r.has_analysis && (
                                    <span className="ml-2 text-emerald-400">● Analyzed</span>
                                  )}
                                </p>
                              </div>
                              {String(form.resume_id) === String(r.id) && (
                                <div className="w-2 h-2 rounded-full bg-primary-400 flex-shrink-0" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/40 text-sm mb-1.5">Job Title</label>
                <input type="text" value={form.job_title}
                  onChange={e => setForm({ ...form, job_title: e.target.value })}
                  className="input-field" placeholder="e.g., Software Engineer" required />
              </div>
              <div>
                <label className="block text-white/40 text-sm mb-1.5">Company</label>
                <input type="text" value={form.company}
                  onChange={e => setForm({ ...form, company: e.target.value })}
                  className="input-field" placeholder="e.g., Google" required />
              </div>
            </div>

            <div>
              <label className="block text-white/40 text-sm mb-1.5">Job Description</label>
              <textarea value={form.job_description}
                onChange={e => setForm({ ...form, job_description: e.target.value })}
                rows={8} className="input-field resize-none"
                placeholder="Paste the full job description..." required />
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center gap-2 disabled:opacity-50">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Analyzing...</>
                : <><MagnifyingGlassIcon className="w-4 h-4" />Analyze Match</>}
            </button>
          </form>
        </motion.div>

        {/* ── Results ── */}
        <div className="space-y-5">
          {!result && !loading && (
            <div className="glass-card p-6 flex flex-col items-center justify-center py-24 text-center"
              style={{ borderStyle: 'dashed' }}>
              <BriefcaseIcon className="w-14 h-14 text-white/10 mb-4" />
              <p className="text-white/25 text-sm">Fill in job details and click Analyze</p>
            </div>
          )}

          {loading && (
            <div className="glass-card p-6 flex flex-col items-center justify-center py-24">
              <div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-white/35 animate-pulse text-sm">Analyzing match...</p>
            </div>
          )}

          {result && (
            <>
              {/* Score */}
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-6 text-center">
                <p className="text-white/35 text-sm mb-2">Overall Match Score</p>
                <p className="font-grotesk text-6xl font-bold mb-3" style={{ color: scoreColor }}>
                  {result.match_percentage}
                </p>
                <div className="progress-bar h-2 mb-5">
                  <motion.div className="h-2 rounded-full"
                    style={{ background: `linear-gradient(90deg, ${scoreColor}88, ${scoreColor})`, width: result.match_percentage }}
                    initial={{ width: 0 }} animate={{ width: result.match_percentage }} transition={{ duration: 1 }} />
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  {[
                    { label: 'TF-IDF',    value: result.tfidf_score },
                    { label: 'Skills',    value: result.skill_overlap },
                    { label: 'Keywords',  value: result.keyword_overlap },
                  ].map((s, i) => (
                    <div key={i} className="rounded-xl p-3 border border-white/5 bg-white/3">
                      <p className="text-white/25 text-xs mb-1">{s.label}</p>
                      <p className="font-semibold text-white">{s.value}%</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Result tabs */}
              <div className="flex gap-2">
                {[
                  { id: 'match',     label: 'Skills',    icon: ChartBarIcon },
                  { id: 'skill-gap', label: 'Skill Gap', icon: BriefcaseIcon },
                  { id: 'roadmap',   label: 'Roadmap',   icon: AcademicCapIcon },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab.id ? 'tab-active' : 'tab-inactive'
                    }`}>
                    <tab.icon className="w-4 h-4" />{tab.label}
                  </button>
                ))}
              </div>

              {activeTab === 'match' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 space-y-5">
                  <div>
                    <h4 className="text-emerald-400 font-semibold text-sm mb-3">✓ Matching Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.matching_skills?.length
                        ? result.matching_skills.map((s, i) => <span key={i} className="badge badge-green">{s}</span>)
                        : <span className="text-white/25 text-sm">None found</span>}
                    </div>
                  </div>
                  <div className="section-divider" />
                  <div>
                    <h4 className="text-red-400 font-semibold text-sm mb-3">✗ Missing Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.missing_skills?.length
                        ? result.missing_skills.map((s, i) => <span key={i} className="badge badge-red">{s}</span>)
                        : <span className="text-emerald-400 text-sm">No missing skills!</span>}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'skill-gap' && skillGap && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-grotesk font-semibold">Skill Gap</h4>
                    <span className="badge badge-purple">{skillGap.overlap_percentage}% overlap</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skillGap.missing_skills?.map((s, i) => <span key={i} className="badge badge-yellow">{s}</span>)}
                  </div>
                  <div className="section-divider" />
                  <div className="space-y-2">
                    {skillGap.learning_resources?.map((res, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/3 border border-white/5">
                        <p className="text-white text-sm font-medium capitalize mb-2">{res.skill}</p>
                        <div className="flex flex-wrap gap-3">
                          {res.resources?.map((r, j) => (
                            <a key={j} href={r.url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300">
                              {r.platform} <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'roadmap' && roadmap && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-grotesk font-semibold">Learning Roadmap</h4>
                    <span className="text-white/25 text-xs">{roadmap.estimated_duration}</span>
                  </div>
                  <div className="space-y-4">
                    {roadmap.phases?.map((phase, i) => (
                      <div key={i} className="relative pl-6 border-l border-primary-500/20 pb-4 last:pb-0">
                        <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-primary-500" />
                        <h5 className="font-medium text-white text-sm">Phase {phase.phase}: {phase.title}</h5>
                        <p className="text-white/25 text-xs mb-2">{phase.duration}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {phase.skills?.map((s, j) => <span key={j} className="badge badge-purple">{s}</span>)}
                        </div>
                      </div>
                    ))}
                  </div>
                  {roadmap.milestones?.length > 0 && (
                    <div className="pt-3 border-t border-white/5">
                      <p className="text-white/25 text-xs mb-2 uppercase tracking-wider">Milestones</p>
                      <ul className="space-y-1.5">
                        {roadmap.milestones.map((m, i) => (
                          <li key={i} className="text-white/55 text-sm flex items-center gap-2">
                            <span className="text-primary-400">→</span>{m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Match;