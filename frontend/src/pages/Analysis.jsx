import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  analyzeResume, generateHeatmap, chatWithResume,
  getResumeVersions, saveResumeVersion, generateReport
} from '../services/api';
import toast from 'react-hot-toast';
import Heatmap from '../components/Analysis/Heatmap';
import ResumeRewriter from '../components/Analysis/ResumeRewriter';
import CoverLetterGenerator from '../components/Analysis/CoverLetterGenerator';
import InterviewQuestions from '../components/Analysis/InterviewQuestions';
import JobSearch from '../components/JobRecommendations/JobSearch'; // ✅ NEW
import {
  SparklesIcon, ChatBubbleLeftRightIcon, DocumentArrowDownIcon,
  BookmarkIcon, FireIcon, PencilSquareIcon, DocumentTextIcon,
  QuestionMarkCircleIcon, ClockIcon, ArrowPathIcon,
  BriefcaseIcon, // ✅ NEW
} from '@heroicons/react/24/outline';

const TABS = [
  { id: 'overview', label: 'Overview', icon: SparklesIcon },
  { id: 'heatmap', label: 'Heatmap', icon: FireIcon },
  { id: 'rewrite', label: 'Rewrite', icon: PencilSquareIcon },
  { id: 'cover-letter', label: 'Cover Letter', icon: DocumentTextIcon },
  { id: 'interview', label: 'Interview', icon: QuestionMarkCircleIcon },
  { id: 'jobs', label: 'Find Jobs', icon: BriefcaseIcon }, // ✅ NEW
  { id: 'chat', label: 'AI Chat', icon: ChatBubbleLeftRightIcon },
  { id: 'versions', label: 'Versions', icon: ClockIcon },
];

const Analysis = () => {
  const [params] = useSearchParams();
  const resumeId = params.get('resumeId');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [heatmap, setHeatmap] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatting, setIsChatting] = useState(false);
  const [versions, setVersions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!resumeId) { setLoading(false); return; }
    setLoading(true);
    try {
      const [analysisRes, heatmapRes, versionsRes] = await Promise.all([
        analyzeResume(parseInt(resumeId)),
        generateHeatmap(parseInt(resumeId)).catch(() => null),
        getResumeVersions(parseInt(resumeId)).catch(() => ({ versions: [] })),
      ]);
      setData(analysisRes.analysis);
      setHeatmap(heatmapRes?.heatmap || null);
      setVersions(versionsRes.versions || []);
    } catch (error) {
      toast.error('Failed to load analysis data');
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [resumeId]);

  const handleChat = async () => {
    if (!chatMessage.trim()) return;
    setIsChatting(true);
    try {
      const res = await chatWithResume({ resume_id: parseInt(resumeId), message: chatMessage });
      setChatHistory(prev => [...prev, { user: chatMessage, ai: res.response }]);
      setChatMessage('');
    } catch (error) {
      toast.error('Chat failed');
    } finally {
      setIsChatting(false);
    }
  };

  const handleSaveVersion = async () => {
    try {
      await saveResumeVersion({ 
        resume_id: parseInt(resumeId), 
        content: JSON.stringify(data), 
        changes: { type: 'manual_save', timestamp: new Date().toISOString() } 
      });
      toast.success('Version saved!');
      const res = await getResumeVersions(parseInt(resumeId));
      setVersions(res.versions || []);
    } catch (error) {
      toast.error('Failed to save version');
    }
  };

  const handleDownloadReport = async () => {
    try {
      const blob = await generateReport(parseInt(resumeId));
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume_report_${resumeId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Report downloaded!');
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success('Data refreshed!');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-primary-400 animate-pulse" />
          </div>
        </div>
        <p className="text-white/40 animate-pulse font-medium">Analyzing with AI...</p>
      </div>
    );
  }

  if (!resumeId || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
          <DocumentTextIcon className="w-10 h-10 text-white/20" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white/40">No Resume Selected</h3>
          <p className="text-white/20 mt-2">Upload a resume to start the analysis</p>
        </div>
        <Link to="/upload" className="btn-primary gap-2">
          <DocumentTextIcon className="w-4 h-4" />
          Upload Resume
        </Link>
      </div>
    );
  }

  const scoreColor = data.ats_score >= 80 ? '#34D399' : data.ats_score >= 60 ? '#FBBF24' : '#F87171';
  const circumference = 2 * Math.PI * 50;

  return (
    <div className="relative max-w-7xl mx-auto px-4 py-8">
      {/* Background Orbs */}
      <div className="orb orb-primary w-96 h-96 -top-48 -right-48" />
      <div className="orb orb-secondary w-80 h-80 bottom-0 -left-40" />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex flex-wrap justify-between items-start gap-4 mb-8"
      >
        <div>
          <h1 className="font-grotesk text-3xl font-bold mb-1">
            Analysis <span className="gradient-text">Results</span>
          </h1>
          <p className="text-white/40 text-sm">AI-powered resume insights at a glance</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="btn-secondary gap-2 text-sm disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={handleSaveVersion} 
            className="btn-secondary gap-2 text-sm"
          >
            <BookmarkIcon className="w-4 h-4" />
            Save Version
          </button>
          <button 
            onClick={handleDownloadReport} 
            className="btn-primary gap-2 text-sm"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === tab.id ? 'tab-active' : 'tab-inactive'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="space-y-6"
        >
          {/* Score Card */}
          <div className="grid md:grid-cols-3 gap-5">
            <div className="glass-card flex flex-col items-center justify-center py-8 md:col-span-1">
              <p className="text-white/40 text-sm mb-4 font-medium">ATS Score</p>
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 120 120" className="w-36 h-36 -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke={scoreColor}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - (circumference * data.ats_score) / 100}
                    strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 8px ${scoreColor})` }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-grotesk text-3xl font-bold text-white">
                    {Math.round(data.ats_score)}
                  </span>
                  <span className="text-white/30 text-xs">/ 100</span>
                </div>
              </div>
              <div className={`mt-4 badge text-xs font-semibold ${
                data.ats_score >= 80 ? 'badge-green' : 
                data.ats_score >= 60 ? 'badge-yellow' : 'badge-red'
              }`}>
                {data.ats_score >= 80 ? '🌟 Excellent' : 
                 data.ats_score >= 60 ? '📈 Good' : '💪 Needs Work'}
              </div>
            </div>

            {/* Strengths */}
            <div className="glass-card md:col-span-1">
              <h3 className="font-grotesk font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                Strengths
              </h3>
              <ul className="space-y-2.5">
                {data.strengths?.map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                    <span className="text-white/70">{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="glass-card md:col-span-1">
              <h3 className="font-grotesk font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                Improvements
              </h3>
              <ul className="space-y-2.5">
                {data.improvements?.map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <span className="text-yellow-500 mt-0.5 flex-shrink-0">→</span>
                    <span className="text-white/70">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section Scores */}
          {data.section_scores && (
            <div className="glass-card p-6">
              <h3 className="font-grotesk font-semibold mb-5">Section Scores</h3>
              <div className="space-y-4">
                {Object.entries(data.section_scores).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="capitalize text-white/60 font-medium">{key}</span>
                      <span className="font-semibold text-white">{value}%</span>
                    </div>
                    <div className="progress-bar h-2">
                      <motion.div
                        className="progress-fill h-2"
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="grid md:grid-cols-2 gap-5">
            {data.rewritten_summary && (
              <div className="glass-card p-6 border border-primary-500/20 bg-primary-500/5">
                <h3 className="font-grotesk font-semibold text-primary-300 mb-3 flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4" />
                  AI Improved Summary
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">{data.rewritten_summary}</p>
              </div>
            )}
            {data.suggested_roles && (
              <div className="glass-card p-6">
                <h3 className="font-grotesk font-semibold mb-4">🎯 Suggested Roles</h3>
                <div className="flex flex-wrap gap-2">
                  {data.suggested_roles.map((role, i) => (
                    <span key={i} className="badge badge-purple">{role}</span>
                  ))}
                </div>
                {data.detailed_feedback && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-2 text-sm text-white/40">
                    {data.detailed_feedback.content && (
                      <p><span className="text-white/60">Content:</span> {data.detailed_feedback.content}</p>
                    )}
                    {data.detailed_feedback.formatting && (
                      <p><span className="text-white/60">Format:</span> {data.detailed_feedback.formatting}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === 'heatmap' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
        >
          <Heatmap data={heatmap} />
        </motion.div>
      )}

      {activeTab === 'rewrite' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
        >
          <ResumeRewriter resumeId={resumeId} />
        </motion.div>
      )}

      {activeTab === 'cover-letter' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
        >
          <CoverLetterGenerator resumeId={resumeId} />
        </motion.div>
      )}

      {activeTab === 'interview' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
        >
          <InterviewQuestions resumeId={resumeId} />
        </motion.div>
      )}

      {/* ✅ NEW - Job Search Tab */}
      {activeTab === 'jobs' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
        >
          <JobSearch resumeId={resumeId} />
        </motion.div>
      )}

      {/* Chat */}
      {activeTab === 'chat' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="glass-card p-6"
        >
          <h3 className="font-grotesk font-semibold mb-6 flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="w-5 h-5 text-primary-400" />
            Chat with Your Resume
          </h3>
          <div className="h-96 overflow-y-auto space-y-4 mb-4 rounded-xl bg-white/3 border border-white/5 p-4">
            {chatHistory.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-white/20 gap-2">
                <ChatBubbleLeftRightIcon className="w-10 h-10" />
                <p className="text-sm">Ask anything about your resume...</p>
              </div>
            )}
            {chatHistory.map((msg, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-end">
                  <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[80%] text-sm shadow-lg">
                    {msg.user}
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 text-white/80 px-4 py-2.5 rounded-2xl rounded-tl-sm max-w-[80%] text-sm">
                    {msg.ai}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={chatMessage}
              onChange={e => setChatMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !isChatting && handleChat()}
              placeholder="Ask about your resume..."
              className="input-field flex-1"
              disabled={isChatting}
            />
            <button 
              onClick={handleChat} 
              disabled={isChatting || !chatMessage.trim()}
              className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChatting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Send'
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Versions */}
      {activeTab === 'versions' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="glass-card p-6"
        >
          <h3 className="font-grotesk font-semibold mb-6 flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-primary-400" />
            Version History
          </h3>
          {versions.length === 0 ? (
            <div className="text-center py-12 text-white/20">
              <ClockIcon className="w-12 h-12 mx-auto mb-3" />
              <p>No versions saved. Click "Save Version" to save one.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map(v => (
                <div key={v.version} className="flex items-center gap-4 p-4 rounded-xl bg-white/3 border border-white/5 hover:border-primary-500/30 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500/20 to-secondary-500/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    v{v.version}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Version {v.version}</p>
                    <p className="text-white/30 text-xs">{new Date(v.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Analysis;