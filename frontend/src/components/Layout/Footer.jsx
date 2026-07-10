import { SparklesIcon } from '@heroicons/react/24/solid';

const Footer = () => (
  <footer className="border-t border-white/5 mt-auto">
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-3">
      <div className="flex items-center gap-2">
        <SparklesIcon className="w-4 h-4 text-primary-400" />
        <span className="text-white/30 text-sm font-jakarta">
          © {new Date().getFullYear()} ResumeAI — Powered by Gemini
        </span>
      </div>
      <span className="text-white/20 text-xs">Built with FastAPI + React</span>
    </div>
  </footer>
);

export default Footer;