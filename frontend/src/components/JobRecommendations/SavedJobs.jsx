import { useState, useEffect } from 'react';
import { getSavedJobs } from '../../services/api';
import toast from 'react-hot-toast';
import { BookmarkIcon, BuildingOfficeIcon, MapPinIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

const SavedJobs = ({ resumeId }) => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedJobs();
  }, [resumeId]);

  const loadSavedJobs = async () => {
    try {
      const response = await getSavedJobs(parseInt(resumeId));
      setSavedJobs(response.jobs || []);
    } catch (error) {
      console.error('Failed to load saved jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="flex justify-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="font-grotesk font-semibold text-lg mb-6 flex items-center gap-2">
        <BookmarkIcon className="w-5 h-5 text-primary-400" />
        Saved Jobs ({savedJobs.length})
      </h3>

      {savedJobs.length === 0 ? (
        <div className="text-center py-8 text-white/20">
          <BookmarkIcon className="w-12 h-12 mx-auto mb-3" />
          <p>No saved jobs yet</p>
          <p className="text-xs mt-1">Save jobs you're interested in</p>
        </div>
      ) : (
        <div className="space-y-3">
          {savedJobs.map((job, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/5 hover:border-primary-500/30 transition-colors">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white truncate">{job.job_title}</h4>
                <div className="flex items-center gap-3 mt-1 text-sm text-white/40">
                  <span className="flex items-center gap-1">
                    <BuildingOfficeIcon className="w-3.5 h-3.5" />
                    {job.company}
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="w-3.5 h-3.5" />
                    {job.location || 'Remote'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge badge-green text-xs">
                  {job.match_score}% match
                </span>
                <a
                  href={job.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-xs px-3 py-1.5 gap-1"
                >
                  <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                  Apply
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;import { useState, useEffect } from 'react';
import { getSavedJobs } from '../../services/api';
import toast from 'react-hot-toast';
import { BookmarkIcon, BuildingOfficeIcon, MapPinIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

const SavedJobs = ({ resumeId }) => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedJobs();
  }, [resumeId]);

  const loadSavedJobs = async () => {
    try {
      const response = await getSavedJobs(parseInt(resumeId));
      setSavedJobs(response.jobs || []);
    } catch (error) {
      console.error('Failed to load saved jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="flex justify-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="font-grotesk font-semibold text-lg mb-6 flex items-center gap-2">
        <BookmarkIcon className="w-5 h-5 text-primary-400" />
        Saved Jobs ({savedJobs.length})
      </h3>

      {savedJobs.length === 0 ? (
        <div className="text-center py-8 text-white/20">
          <BookmarkIcon className="w-12 h-12 mx-auto mb-3" />
          <p>No saved jobs yet</p>
          <p className="text-xs mt-1">Save jobs you're interested in</p>
        </div>
      ) : (
        <div className="space-y-3">
          {savedJobs.map((job, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/5 hover:border-primary-500/30 transition-colors">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white truncate">{job.job_title}</h4>
                <div className="flex items-center gap-3 mt-1 text-sm text-white/40">
                  <span className="flex items-center gap-1">
                    <BuildingOfficeIcon className="w-3.5 h-3.5" />
                    {job.company}
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="w-3.5 h-3.5" />
                    {job.location || 'Remote'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge badge-green text-xs">
                  {job.match_score}% match
                </span>
                <a
                  href={job.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-xs px-3 py-1.5 gap-1"
                >
                  <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                  Apply
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;