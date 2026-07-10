import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRightIcon, SparklesIcon, DocumentTextIcon, ChartBarIcon,
  BriefcaseIcon, AcademicCapIcon, BoltIcon, ShieldCheckIcon, RocketLaunchIcon, ClockIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const features = [
    { icon: DocumentTextIcon, title: 'AI Resume Analysis', desc: 'Get instant AI-powered insights and ATS scoring' },
    { icon: ChartBarIcon, title: 'Skill Heatmap', desc: 'Visualize your skills and identify improvement areas' },
    { icon: BriefcaseIcon, title: 'Job Matching', desc: 'Find the perfect job match with intelligent algorithms' },
    { icon: AcademicCapIcon, title: 'Learning Roadmap', desc: 'Get personalized learning paths for career growth' },
  ];

  const stats = [
    { value: '98%', label: 'Accuracy Rate' },
    { value: '10K+', label: 'Resumes Analyzed' },
    { value: '4.9', label: 'User Rating' },
    { value: '50+', label: 'Industries' },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 relative z-10">
      <div className="max-w-6xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center">
          
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
            <BoltIcon className="w-4 h-4 text-accent-500" />
            <span className="text-sm font-medium text-white/70">AI-Powered Career Tool</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-sm font-medium text-primary-400">v2.0</span>
          </motion.div>

          {/* Fixed text to be white! */}
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-6">
            Land Your <span className="gradient-text">Dream Job</span><br />with AI Precision
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-xl text-white/60 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Upload your resume and get instant AI-powered analysis, ATS scoring, job matching, and personalized career recommendations in seconds.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link to="/upload" className="btn-primary gap-3 text-lg px-10">
              <RocketLaunchIcon className="w-5 h-5" />
              Get Started Free
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <Link to="/history" className="btn-secondary gap-3 text-lg px-10">
              <ClockIcon className="w-5 h-5" />
              View History
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-20">
            {stats.map((stat, i) => (
              <div key={i} className="glass-card p-6 text-center">
                <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-white/40 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 + i * 0.1 }} className="glass-card p-6 text-left group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary-500/20 to-secondary-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
};

export default Home;