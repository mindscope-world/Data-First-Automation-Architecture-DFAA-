import React from 'react';
import { ArrowRight, Activity, Database, Zap, PieChart } from 'lucide-react';

const Hero: React.FC = () => {
  const scrollToAssessment = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById('assessment');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-datova-200 dark:bg-datova-900/30 rounded-full blur-[120px] opacity-40"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-200 dark:bg-indigo-900/30 rounded-full blur-[100px] opacity-40"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Text Content */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-datova-600 dark:text-datova-300 text-xs font-semibold uppercase tracking-wider mb-8 shadow-sm animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-datova-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-datova-500"></span>
              </span>
              Sustainable AI Starts Here
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1] text-slate-900 dark:text-white">
              Stop Building AI on <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-datova-500 to-indigo-500">
                Broken Data
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              We fix your data infrastructure so your AI systems actually work. <strong className="text-slate-900 dark:text-slate-200">Data-First Automation Architecture (DFAA)</strong> turns messy spreadsheets into high-ROI intelligence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
              <a 
                href="#assessment"
                onClick={scrollToAssessment}
                className="px-8 py-4 bg-datova-600 hover:bg-datova-700 text-white rounded-2xl font-semibold transition-all flex items-center gap-2 shadow-xl shadow-datova-500/20 hover:translate-y-[-2px] cursor-pointer"
              >
                Assess Your AI Readiness <ArrowRight size={20} />
              </a>
              <a 
                href="#process"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-semibold transition-all shadow-sm hover:shadow-md cursor-pointer"
              >
                How It Works
              </a>
            </div>
          </div>

          {/* Abstract Dashboard Visual */}
          <div className="lg:w-1/2 relative">
             <div className="relative z-10 bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 backdrop-blur-sm">
                
                {/* Header Mock */}
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Activity className="text-datova-500" size={20} />
                      </div>
                      <div>
                        <div className="h-2 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-1"></div>
                        <div className="h-2 w-16 bg-slate-100 dark:bg-slate-800 rounded"></div>
                      </div>
                   </div>
                   <div className="flex gap-2">
                     <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800"></div>
                     <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800"></div>
                   </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                   <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                      <div className="flex justify-between items-start mb-2">
                         <Database className="text-indigo-500" size={20} />
                         <span className="text-xs font-bold text-indigo-600 bg-indigo-200/50 px-2 py-0.5 rounded-full">+24%</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">98.2%</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Schema Consistency</div>
                   </div>
                   <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                      <div className="flex justify-between items-start mb-2">
                         <Zap className="text-emerald-500" size={20} />
                         <span className="text-xs font-bold text-emerald-600 bg-emerald-200/50 px-2 py-0.5 rounded-full">Active</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">12</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Running Agents</div>
                   </div>
                </div>

                {/* Big Chart Area Mock */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                   <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Automation ROI</h3>
                      <PieChart className="text-slate-400" size={16} />
                   </div>
                   <div className="flex items-end gap-2 h-24 justify-between px-2">
                      {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                        <div key={i} className="w-full bg-datova-500/20 rounded-t-lg relative group">
                           <div style={{height: `${h}%`}} className="absolute bottom-0 w-full bg-datova-500 rounded-t-lg transition-all duration-1000"></div>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Floaters */}
                <div className="absolute -right-6 top-20 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 animate-bounce delay-700">
                   <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Data Clean</span>
                   </div>
                </div>
                <div className="absolute -left-6 bottom-32 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 animate-bounce">
                   <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Sync Complete</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;