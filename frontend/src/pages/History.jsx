import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getResumes } from '../services/api';
import toast from 'react-hot-toast';
import { 
  DocumentTextIcon, 
  ClockIcon, 
  ArrowRightIcon,
  ChartBarIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const History = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const data = await getResumes();
      setResumes(data);
    } catch (error) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-white/40">Loading your history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-4xl font-bold mb-2">
          Resume <span className="gradient-text">History</span>
        </h1>
        <p className="text-white/40">View and manage all your uploaded resumes</p>
      </motion.div>

      {resumes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-16 text-center"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
              <DocumentTextIcon className="w-10 h-10 text-white/20" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white/40">No Resumes Found</h3>
              <p className="text-white/20 mt-2">Upload your first resume to get started</p>
            </div>
            <Link to="/upload" className="btn-primary gap-2 mt-4">
              <DocumentTextIcon className="w-4 h-4" />
              Upload Resume
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {resumes.map((resume, index) => (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-6 hover:border-primary-500/30 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary-500/20 to-secondary-500/20 flex items-center justify-center flex-shrink-0">
                    <DocumentTextIcon className="w-6 h-6 text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{resume.filename}</h4>
                    <div className="flex items-center gap-3 mt-1 text-sm text-white/30">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-3.5 h-3.5" />
                        {formatDate(resume.created_at)}
                      </span>
                      {resume.has_analysis && (
                        <span className="badge badge-green text-[10px]">Analyzed</span>
                      )}
                      {resume.skills?.length > 0 && (
                        <span className="badge badge-purple text-[10px]">
                          {resume.skills.length} skills
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/analysis?resumeId=${resume.id}`}
                    className="btn-primary text-sm px-4 py-2 gap-1.5"
                  >
                    <ChartBarIcon className="w-4 h-4" />
                    Analyze
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Skills Preview */}
              {resume.skills?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <div className="flex flex-wrap gap-1.5">
                    {resume.skills.slice(0, 8).map((skill, i) => (
                      <span key={i} className="badge badge-purple text-[10px]">
                        {skill}
                      </span>
                    ))}
                    {resume.skills.length > 8 && (
                      <span className="badge text-[10px] bg-white/5 text-white/30">
                        +{resume.skills.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;