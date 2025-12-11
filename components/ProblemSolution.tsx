import React from 'react';
import { AlertTriangle, CheckCircle, Database, FileSpreadsheet, Server, GitMerge } from 'lucide-react';

const ProblemSolution: React.FC = () => {
  return (
    <section className="py-24 bg-white dark:bg-slate-900 transition-colors duration-300" id="problem">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">The Industry Blind Spot</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Most companies are trying to build skyscrapers on quicksand. 
            <br className="hidden md:block" />
            AI amplifies speed. If your process is broken, AI just breaks it faster.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* The Problem */}
          <div className="bg-rose-50 dark:bg-rose-900/10 p-8 lg:p-10 rounded-[2rem] border border-rose-100 dark:border-rose-900/30 relative overflow-hidden group hover:shadow-lg transition-shadow">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <AlertTriangle size={160} className="text-rose-500" />
             </div>
             <div className="relative z-10">
                <h3 className="text-2xl font-bold text-rose-900 dark:text-rose-200 mb-8 flex items-center gap-3">
                    <span className="p-2.5 bg-rose-200 dark:bg-rose-800 rounded-xl"><AlertTriangle size={20} className="text-rose-700 dark:text-rose-100"/></span>
                    The Current Reality
                </h3>
                <ul className="space-y-5">
                    {[
                        { icon: FileSpreadsheet, text: "Messy, versioned spreadsheets" },
                        { icon: Database, text: "Fragmented Data Silos (CRM, ERP)" },
                        { icon: GitMerge, text: "Inconsistent schemas & logic gaps" },
                        { icon: Server, text: "Manual patches & brittle connections" }
                    ].map((item, idx) => (
                        <li key={idx} className="flex items-center gap-4 text-rose-800 dark:text-rose-200/80 font-medium">
                            <div className="p-2 bg-white dark:bg-rose-950/50 rounded-lg shadow-sm">
                                <item.icon size={18} className="opacity-80" />
                            </div>
                            {item.text}
                        </li>
                    ))}
                </ul>
                <div className="mt-10 pt-6 border-t border-rose-200 dark:border-rose-800/50">
                    <p className="text-rose-700 dark:text-rose-300 font-semibold italic flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                        Result: Unreliable outputs, rising costs.
                    </p>
                </div>
             </div>
          </div>

          {/* The Solution */}
          <div className="bg-slate-900 dark:bg-slate-800 p-8 lg:p-10 rounded-[2rem] border border-slate-800 dark:border-slate-700 relative overflow-hidden text-white shadow-2xl transform md:-translate-x-6 md:translate-y-6 md:hover:translate-y-4 transition-transform duration-300">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <CheckCircle size={160} className="text-datova-400" />
             </div>
             <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                    <span className="p-2.5 bg-slate-800 dark:bg-slate-700 rounded-xl border border-slate-700"><CheckCircle size={20} className="text-datova-400"/></span>
                    The Datova Way (DFAA)
                </h3>
                <ul className="space-y-5">
                    {[
                        { text: "Unified Business Data Model (UBDM)" },
                        { text: "Single Source of Truth Warehouse" },
                        { text: "Automated Validation Pipelines" },
                        { text: "Governed Context for Agents" }
                    ].map((item, idx) => (
                        <li key={idx} className="flex items-center gap-4 text-slate-300 font-medium">
                            <div className="h-8 w-8 rounded-lg bg-datova-500/10 flex items-center justify-center border border-datova-500/20">
                                <div className="h-2 w-2 rounded-full bg-datova-400"></div>
                            </div>
                            {item.text}
                        </li>
                    ))}
                </ul>
                <div className="mt-10 pt-6 border-t border-slate-800 dark:border-slate-700">
                    <p className="text-datova-300 font-semibold italic flex items-center gap-2">
                         <span className="h-1.5 w-1.5 rounded-full bg-datova-400"></span>
                         Result: AI that thinks with structured data.
                    </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;