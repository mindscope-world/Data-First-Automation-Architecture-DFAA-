import React from 'react';
import { Database } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 py-12 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xl tracking-tight mb-4 md:mb-0">
                <div className="bg-gradient-to-tr from-datova-600 to-datova-400 p-2 rounded-lg text-white">
                    <Database size={20} />
                </div>
                Datova AI
            </div>
            <div className="flex gap-6 text-sm font-medium">
                <a href="#" className="hover:text-datova-500 transition-colors">Privacy</a>
                <a href="#" className="hover:text-datova-500 transition-colors">Terms</a>
                <a href="#" className="hover:text-datova-500 transition-colors">Twitter</a>
                <a href="#" className="hover:text-datova-500 transition-colors">LinkedIn</a>
            </div>
        </div>
        <div className="text-center md:text-left text-sm opacity-60">
            <p>&copy; {new Date().getFullYear()} Datova AI. Built with Data-First Automation Architecture.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;