import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { findJobs, getJobSearchHistory } from '../../services/api';
import toast from 'react-hot-toast';
import {
  BriefcaseIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  LinkIcon,
  ClockIcon,
  StarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
  AdjustmentsHorizontalIcon,  // ✅ Changed from FilterIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const JobSearch = ({ resumeId }) => {
  const [form, setForm] = useState({
    jobTitle: '',
    location: '',
    source: 'all',
    limit: 10
  });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedJob, setExpandedJob] = useState(null);

  const sources = [
    { value: 'all', label: 'All Sources' },
    { value: 'github', label: 'GitHub Jobs' },
    { value: 'indeed', label: 'Indeed' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'remote', label: 'Remote OK' },
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!form.jobTitle && !form.location) {
      toast.error('Please enter a job title or location');
      return;
    }

    setLoading(true);
    setSearchPerformed(true);
    try {
      const response = await findJobs({
        resume_id: parseInt(resumeId),
        job_title: form.jobTitle,
        location: form.location,
        source: form.source,
        limit: form.limit
      });
      
      setJobs(response.jobs || []);
      toast.success(`Found ${response.jobs?.length || 0} job matches!`);
      
      // Load history
      loadHistory();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to search jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await getJobSearchHistory(parseInt(resumeId));
      setHistory(response.history || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const getMatchColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getMatchBadge = (score) => {
    if (score >= 80) return 'badge-green';
    if (score >= 60) return 'badge-blue';
    if (score >= 40) return 'badge-yellow';
    return 'badge-red';
  };

  const getMatchLabel = (score) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Possible Match';
    return 'Low Match';
  };

  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-grotesk font-semibold text-lg flex items-center gap-2">
            <BriefcaseIcon className="w-5 h-5 text-primary-400" />
            Find Jobs
          </h3>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="btn-secondary text-xs px-4 py-2 gap-1.5"
          >
            <ClockIcon className="w-3.5 h-3.5" />
            {showHistory ? 'Hide History' : 'Search History'}
          </button>
        </div>

        {/* History Panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <h4 className="text-sm font-semibold text-white/40 mb-3">Recent Searches</h4>
                {history.length === 0 ? (
                  <p className="text-white/20 text-sm">No search history yet</p>
                ) : (
                  <div className="space-y-2">
                    {history.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-white/60">{item.query}</span>
                        <span className="text-white/30 text-xs">
                          {item.results_count} results • {formatDate(item.created_at)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/40 text-sm font-medium mb-1.5">
                Job Title / Skills
              </label>
              <input
                type="text"
                value={form.jobTitle}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                className="input-field"
                placeholder="e.g., Software Engineer, Python Developer"
              />
            </div>
            <div>
              <label className="block text-white/40 text-sm font-medium mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="input-field"
                placeholder="e.g., New York, Remote, US"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/40 text-sm font-medium mb-1.5">
                Job Source
              </label>
              <select
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="select-field"
              >
                {sources.map((source) => (
                  <option key={source.value} value={source.value}>
                    {source.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white/40 text-sm font-medium mb-1.5">
                Results Limit
              </label>
              <select
                value={form.limit}
                onChange={(e) => setForm({ ...form, limit: parseInt(e.target.value) })}
                className="select-field"
              >
                {[5, 10, 15, 20, 30].map((num) => (
                  <option key={num} value={num}>{num} jobs</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Searching Jobs...
              </>
            ) : (
              <>
                <MagnifyingGlassIcon className="w-4 h-4" />
                Find Matching Jobs
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results */}
      {searchPerformed && !loading && (
        <>
          {jobs.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                  <BriefcaseIcon className="w-8 h-8 text-white/20" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white/40">No Jobs Found</h4>
                  <p className="text-white/20 text-sm mt-1">
                    Try adjusting your search criteria or choose a different source
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Results Summary */}
              <div className="glass-card p-4 flex items-center justify-between">
                <div>
                  <span className="text-white/40 text-sm">
                    Found <span className="text-white font-semibold">{jobs.length}</span> matching jobs
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/30">
                  <AdjustmentsHorizontalIcon className="w-3.5 h-3.5" />  {/* ✅ Changed here too */}
                  <span>Sorted by match score</span>
                </div>
              </div>

              {/* Job Cards */}
              <div className="space-y-4">
                {jobs.map((job, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card p-6 hover:border-primary-500/30 transition-all group"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary-500/20 to-secondary-500/20 flex items-center justify-center flex-shrink-0">
                            <BuildingOfficeIcon className="w-6 h-6 text-primary-400" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-white truncate">
                              {job.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm">
                              <span className="text-white/50 flex items-center gap-1">
                                <BuildingOfficeIcon className="w-3.5 h-3.5" />
                                {job.company}
                              </span>
                              <span className="text-white/30">•</span>
                              <span className="text-white/40 flex items-center gap-1">
                                <MapPinIcon className="w-3.5 h-3.5" />
                                {job.location || 'Various'}
                              </span>
                              <span className="text-white/30">•</span>
                              <span className="text-white/30 text-xs">
                                {job.source}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Match Score */}
                      {job.match_score && (
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className={`text-2xl font-bold ${getMatchColor(job.match_score)}`}>
                            {job.match_score}%
                          </div>
                          <span className={`badge text-xs ${getMatchBadge(job.match_score)} mt-1`}>
                            {getMatchLabel(job.match_score)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="mt-4">
                      <button
                        onClick={() => setExpandedJob(expandedJob === index ? null : index)}
                        className="flex items-center gap-1 text-xs text-white/30 hover:text-white/50 transition-colors"
                      >
                        {expandedJob === index ? (
                          <>
                            <ChevronUpIcon className="w-3.5 h-3.5" />
                            Show less
                          </>
                        ) : (
                          <>
                            <ChevronDownIcon className="w-3.5 h-3.5" />
                            Show description
                          </>
                        )}
                      </button>
                      
                      <AnimatePresence>
                        {expandedJob === index && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 p-4 rounded-xl bg-white/5 border border-white/5">
                              <p className="text-white/50 text-sm leading-relaxed whitespace-pre-wrap">
                                {job.description || 'No description available'}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-3 text-xs text-white/30">
                        <ClockIcon className="w-3.5 h-3.5" />
                        {job.posted_at || 'Posted recently'}
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={job.apply_url || job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary text-sm px-4 py-2 gap-1.5"
                        >
                          <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                          Apply Now
                        </a>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(job.apply_url || job.url);
                            toast.success('Link copied!');
                          }}
                          className="btn-secondary text-sm px-4 py-2"
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Loading State */}
      {loading && (
        <div className="glass-card p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <BriefcaseIcon className="w-6 h-6 text-primary-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white/40">Searching for Jobs</h4>
              <p className="text-white/20 text-sm mt-1">Finding the best matches for you...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobSearch;