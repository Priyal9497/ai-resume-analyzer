import { motion } from 'framer-motion';
import { FireIcon, ChartBarSquareIcon } from '@heroicons/react/24/outline';

const getGradient = (value) => {
  if (value >= 80) return 'from-emerald-500 to-teal-400';
  if (value >= 60) return 'from-blue-500 to-indigo-400';
  if (value >= 40) return 'from-yellow-500 to-orange-400';
  return 'from-red-500 to-pink-400';
};

const getColor = (value) => {
  if (value >= 80) return 'text-emerald-400';
  if (value >= 60) return 'text-blue-400';
  if (value >= 40) return 'text-yellow-400';
  return 'text-red-400';
};

const Heatmap = ({ data }) => {
  // Check if we have data in either format
  const hasData = data && (data.overall_heatmap?.length > 0 || data.skill_frequency);
  
  // Transform data if needed
  const getHeatmapData = () => {
    if (data?.overall_heatmap?.length > 0) {
      return data.overall_heatmap;
    }
    if (data?.skill_frequency) {
      return Object.entries(data.skill_frequency).map(([skill, frequency]) => ({
        skill,
        frequency: typeof frequency === 'number' ? frequency : parseInt(frequency) || 50
      }));
    }
    return [];
  };

  const heatmapData = getHeatmapData();
  const sectionData = data?.section_strength || {};

  if (!hasData || heatmapData.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
            <FireIcon className="w-8 h-8 text-white/20" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white/40">No Heatmap Data</h4>
            <p className="text-sm text-white/20 mt-1">Generate a heatmap by analyzing your resume first</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Heatmap */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-grotesk font-semibold text-lg flex items-center gap-2">
            <FireIcon className="w-5 h-5 text-primary-400" />
            Skill Heatmap
          </h3>
          <span className="text-xs text-white/30">
            {heatmapData.length} skills analyzed
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {heatmapData.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, type: 'spring', bounce: 0.3 }}
              className="heatmap-item group"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/70 text-sm font-medium capitalize truncate flex-1">
                  {item.skill}
                </span>
                <span className={`font-bold text-sm ml-2 ${getColor(item.frequency)}`}>
                  {item.frequency}%
                </span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`h-2 rounded-full bg-gradient-to-r ${getGradient(item.frequency)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.frequency}%` }}
                  transition={{ duration: 0.8, delay: i * 0.05, ease: 'easeOut' }}
                />
              </div>
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-primary-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Section Strength */}
      {Object.keys(sectionData).length > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-grotesk font-semibold text-lg mb-6 flex items-center gap-2">
            <ChartBarSquareIcon className="w-5 h-5 text-primary-400" />
            Section Strength Analysis
          </h3>
          <div className="space-y-4">
            {Object.entries(sectionData).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="capitalize text-white/60 font-medium">{key.replace('_', ' ')}</span>
                  <span className={`font-bold ${getColor(value)}`}>{value}%</span>
                </div>
                <div className="progress-bar h-2">
                  <motion.div
                    className={`h-2 rounded-full bg-gradient-to-r ${getGradient(value)}`}
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

      {/* Insight Card */}
      <div className="glass-card p-6 border border-primary-500/20 bg-primary-500/5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
            <FireIcon className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-primary-300 mb-1">AI Insight</h4>
            <p className="text-sm text-white/50 leading-relaxed">
              {heatmapData.length > 0 
                ? `Your strongest skill is "${heatmapData.reduce((a, b) => a.frequency > b.frequency ? a : b).skill}" with ${heatmapData.reduce((a, b) => a.frequency > b.frequency ? a : b).frequency}% proficiency. Focus on improving your weaker areas to become a more well-rounded candidate.`
                : 'Upload and analyze your resume to get detailed insights about your skills.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;