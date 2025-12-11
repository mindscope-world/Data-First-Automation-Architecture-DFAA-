import React from 'react';
import { Check } from 'lucide-react';
import { ServicePhase } from '../types';

const phases: ServicePhase[] = [
  {
    title: "Phase 1: Audit & Roadmap",
    duration: "1–3 Weeks",
    price: "$2,500 – $5,000",
    color: "border-slate-200 dark:border-slate-800",
    features: [
      "Data Maturity Assessment",
      "Schema & Stack Audit",
      "Bottleneck Analysis",
      "Implementation Roadmap"
    ]
  },
  {
    title: "Phase 2: Foundation Build",
    duration: "4–12 Weeks",
    price: "$5k – $30k (Project)",
    color: "border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10",
    features: [
      "Schema Normalization",
      "Single Source of Truth",
      "Validation Pipelines",
      "Governance Implementation",
      "Data Cleaning"
    ]
  },
  {
    title: "Phase 3: Automation & Scale",
    duration: "Ongoing",
    price: "$1.5k – $10k / mo",
    color: "border-datova-900 dark:border-datova-700 bg-slate-900 dark:bg-slate-950 text-white",
    features: [
      "AI Agent Deployment",
      "Predictive Automation",
      "Reliability Engineering",
      "Metric Evolution",
      "Data Engineering"
    ]
  }
];

const Pricing: React.FC = () => {
  return (
    <section className="py-24 bg-white dark:bg-slate-900 transition-colors duration-300" id="pricing">
      <div className="container mx-auto px-6">
         <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Engagement Model</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            A structured path from chaos to sustainable automation.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {phases.map((phase, idx) => (
                <div key={idx} className={`relative flex flex-col p-8 rounded-[2rem] border shadow-xl shadow-slate-200/50 dark:shadow-black/30 transition-all hover:-translate-y-1 ${phase.title.includes("Phase 3") ? 'bg-slate-900 dark:bg-slate-950 text-white' : 'bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100'} ${phase.color}`}>
                    {phase.title.includes("Phase 2") && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-blue-500/30">
                            Most Popular
                        </div>
                    )}
                    
                    <div className="mb-8 border-b border-slate-100 dark:border-slate-800 pb-6 border-dashed">
                        <h3 className="text-lg font-bold mb-2">{phase.title}</h3>
                        <p className={`text-xs font-bold uppercase tracking-wider ${phase.title.includes("Phase 3") ? 'text-slate-400' : 'text-slate-400'} mb-4`}>{phase.duration}</p>
                        <div className="text-2xl font-bold">{phase.price}</div>
                    </div>

                    <ul className="flex-1 space-y-4 mb-8">
                        {phase.features.map((feat, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <div className={`mt-0.5 p-0.5 rounded-full ${phase.title.includes("Phase 3") ? 'bg-datova-500 text-white' : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'}`}>
                                    <Check size={12} strokeWidth={3} />
                                </div>
                                <span className="text-sm font-medium opacity-90">{feat}</span>
                            </li>
                        ))}
                    </ul>

                    <button className={`w-full py-3.5 rounded-xl font-bold transition-all ${
                        phase.title.includes("Phase 3") 
                        ? 'bg-datova-500 text-white hover:bg-datova-600 shadow-lg shadow-datova-500/25' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}>
                        Get Started
                    </button>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;