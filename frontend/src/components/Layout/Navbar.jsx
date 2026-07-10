import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HomeIcon, 
  CloudArrowUpIcon, 
  ChartBarIcon, 
  BriefcaseIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Upload', path: '/upload', icon: CloudArrowUpIcon },
    { name: 'Analysis', path: '/analysis', icon: ChartBarIcon },
    { name: 'Match', path: '/match', icon: BriefcaseIcon },
    { name: 'History', path: '/history', icon: ClockIcon },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}
      className="sticky top-4 z-50 mx-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="glass-card px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-11 h-11 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold gradient-text">ResumeAI</span>
              <span className="block text-[10px] text-white/30 tracking-widest uppercase">Powered by Gemini</span>
            </div>
          </Link>

          {/* Nav Items */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive(item.path)
                    ? 'text-white bg-white/5'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </span>
                {isActive(item.path) && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 rounded-xl bg-white/5 border border-white/10"
                    transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Toggle - Simplified */}
          <div className="md:hidden">
            <button className="p-2 rounded-xl hover:bg-white/5 transition-colors">
              <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;