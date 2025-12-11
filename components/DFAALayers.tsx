import React from 'react';
import { Layers, BarChart3, Bot, ChevronRight } from 'lucide-react';

const DFAALayers: React.FC = () => {
  const layers = [
    {
      id: 1,
      title: "Layer 1: Data Foundation",
      subtitle: "The Infrastructure",
      icon: Layers,
      description: "We build the infrastructure every AI system requires. Schema normalization, single source of truth, and strict governance.",
      color: "bg-blue-600",
      bgLight: "bg-blue-50",
      textDark: "text-blue-200"
    },
    {
      id: 2,
      title: "Layer 2: Intelligence",
      subtitle: "The Measurement",
      icon: BarChart3,
      description: "Clean data isn't enough. We build context. KPI hierarchies and logic encoding ensure your AI understands what matters.",
      color: "bg-indigo-600",
      bgLight: "bg-indigo-50",
      textDark: "text-indigo-200"
    },
    {
      id: 3,
      title: "Layer 3: Automation",
      subtitle: "The Execution",
      icon: Bot,
      description: "We architect sustainable automations. Agent pipelines and predictive tools that run reliably without constant oversight.",
      color: "bg-datova-600",
      bgLight: "bg-cyan-50",
      textDark: "text-cyan-200"
    }
  ];

  return (
    <section id="process" className="py-24 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <span className="text-datova-600 dark:text-datova-400 font-bold tracking-wider text-xs uppercase bg-datova-100 dark:bg-datova-900/30 px-3 py-1 rounded-full">The Architecture</span>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mt-4">Data-First Automation</h2>
        </div>

        <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-1 bg-gradient-to-r from-blue-200 via-indigo-200 to-cyan-200 dark:from-blue-900 dark:via-indigo-900 dark:to-cyan-900 -z-0 rounded-full"></div>

            <div className="grid md:grid-cols-3 gap-8">
                {layers.map((layer, index) => (
                    <div key={layer.id} className="relative z-10 group">
                        <div className={`w-24 h-24 mx-auto ${layer.color} rounded-3xl flex items-center justify-center text-white shadow-xl shadow-slate-200 dark:shadow-black/40 mb-8 border-4 border-white dark:border-slate-950 transform transition-transform group-hover:scale-110 group-hover:-rotate-3`}>
                            <layer.icon size={40} />
                        </div>
                        
                        <div className="bg-white dark:bg-slate-850 p-8 rounded-[2rem] shadow-sm hover:shadow-xl dark:shadow-black/20 border border-slate-100 dark:border-slate-800 transition-all duration-300 h-full">
                            <div className="flex items-center gap-2 mb-4">
                                <span className={`text-xs font-bold text-white px-2.5 py-1 rounded-lg ${layer.color}`}>0{layer.id}</span>
                                <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wide">{layer.subtitle}</h4>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{layer.title}</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                                {layer.description}
                            </p>
                        </div>
                        
                        {/* Mobile Connector */}
                        {index < layers.length - 1 && (
                            <div className="md:hidden flex justify-center my-6">
                                <ChevronRight className="rotate-90 text-slate-300" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
      </div>
    </section>
  );
};

export default DFAALayers;