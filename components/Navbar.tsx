import React, { useState, useEffect } from 'react';
import { Database, Moon, Sun } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ darkMode, toggleTheme }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToAssessment = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById('assessment');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 border-b ${
        scrolled 
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200 dark:border-slate-800 py-3 shadow-sm' 
          : 'bg-transparent border-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900 dark:text-white">
          <div className="bg-gradient-to-tr from-datova-600 to-datova-400 p-2 rounded-xl text-white shadow-lg shadow-datova-500/20">
             <Database size={20} />
          </div>
          Datova AI
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#problem" onClick={(e) => { e.preventDefault(); document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth'}); }} className="hover:text-datova-500 dark:hover:text-white transition-colors cursor-pointer">The Problem</a>
            <a href="#process" onClick={(e) => { e.preventDefault(); document.getElementById('process')?.scrollIntoView({ behavior: 'smooth'}); }} className="hover:text-datova-500 dark:hover:text-white transition-colors cursor-pointer">DFAA Process</a>
            <a href="#pricing" onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth'}); }} className="hover:text-datova-500 dark:hover:text-white transition-colors cursor-pointer">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <a 
              href="#assessment" 
              onClick={scrollToAssessment}
              className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full hover:opacity-90 transition-all font-semibold text-sm shadow-lg shadow-slate-900/10 dark:shadow-white/5 cursor-pointer"
            >
              Free Audit
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;