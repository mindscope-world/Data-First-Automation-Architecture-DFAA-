import React, { useState } from 'react';
import { 
  Loader2, Sparkles, CheckCircle2, Circle, ArrowRight, User, Mail, Lock, Database
} from 'lucide-react';
import { generateAssessmentReport } from '../services/geminiService';
import { AssessmentQuestion, AssessmentData } from '../types';

// --- Configuration & Data ---

const questions: AssessmentQuestion[] = [
  {
    id: "q1",
    question: "Where does your critical business data live?",
    options: [
      { value: 20, label: "Scattered spreadsheets & emails" },
      { value: 40, label: "Siloed SaaS tools without sync" },
      { value: 60, label: "Partially connected via Zapier" },
      { value: 80, label: "Centralized Data Warehouse" },
      { value: 100, label: "Real-time unified schema" }
    ]
  },
  {
    id: "q2",
    question: "How reliable is your data reporting?",
    options: [
      { value: 20, label: "We guess based on intuition" },
      { value: 40, label: "Manual Excel reports (days)" },
      { value: 60, label: "Dashboards exist but break" },
      { value: 80, label: "Automated daily KPIs" },
      { value: 100, label: "Predictive real-time analytics" }
    ]
  },
  {
    id: "q3",
    question: "How do you handle data governance?",
    options: [
      { value: 20, label: "What is data governance?" },
      { value: 40, label: "Ad-hoc fixes when broken" },
      { value: 60, label: "Outdated documentation" },
      { value: 80, label: "Defined naming conventions" },
      { value: 100, label: "Automated validation pipelines" }
    ]
  },
  {
    id: "q4",
    question: "Current state of automation?",
    options: [
      { value: 20, label: "100% Manual" },
      { value: 40, label: "Basic email auto-responders" },
      { value: 60, label: "Some Zaps for data entry" },
      { value: 80, label: "Core workflows automated" },
      { value: 100, label: "Autonomous AI Agents" }
    ]
  },
  {
    id: "q5",
    question: "Team Data Capability?",
    options: [
      { value: 20, label: "Non-technical" },
      { value: 40, label: "One 'Excel Wizard'" },
      { value: 60, label: "Slow IT support requests" },
      { value: 80, label: "Dedicated Data Analyst" },
      { value: 100, label: "Cross-functional data literacy" }
    ]
  }
];

interface AssessmentProps {
  onComplete: (data: AssessmentData) => void;
}

const Assessment: React.FC<AssessmentProps> = ({ onComplete }) => {
  // State
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadData, setLeadData] = useState({ name: '', email: '' });

  // Handlers
  const handleSelect = (qId: string, val: number) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
    if (activeQuestion < questions.length - 1) {
        setTimeout(() => setActiveQuestion(prev => prev + 1), 300);
    }
  };

  const calculateScore = () => {
    const values = Object.values(answers) as number[];
    if (values.length === 0) return 0;
    const total = values.reduce((a, b) => a + b, 0);
    return Math.round(total / questions.length);
  };

  const handleNext = () => {
    if (activeQuestion < questions.length - 1) {
      setActiveQuestion(prev => prev + 1);
    } else {
      setShowLeadForm(true);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadData.email || !leadData.name) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate Report
    const score = calculateScore();
    const reportText = await generateAssessmentReport(answers, score);
    
    setIsSubmitting(false);
    
    // Trigger completion
    onComplete({
        answers,
        score,
        report: reportText,
        user: leadData
    });
  };

  // View Renders
  const renderQuiz = () => (
    <div className="max-w-2xl w-full mx-auto flex flex-col h-full justify-center animate-fade-in p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Question {activeQuestion + 1} of {questions.length}
          </span>
        </div>
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 leading-tight">
          {questions[activeQuestion].question}
        </h3>
        
        <div className="space-y-3">
          {questions[activeQuestion].options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(questions[activeQuestion].id, opt.value)}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group ${
                answers[questions[activeQuestion].id] === opt.value
                ? 'border-datova-500 bg-datova-50 dark:bg-datova-900/20 text-datova-700 dark:text-datova-300'
                : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-datova-200 dark:hover:border-slate-700'
              }`}
            >
              <span className="font-medium text-slate-700 dark:text-slate-200">{opt.label}</span>
              {answers[questions[activeQuestion].id] === opt.value && (
                <CheckCircle2 className="text-datova-500" size={20} />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mt-auto pt-8">
        <button 
          onClick={() => setActiveQuestion(prev => Math.max(0, prev - 1))}
          disabled={activeQuestion === 0}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30 font-medium px-4 py-2 transition-colors"
        >
          Back
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-3 bg-datova-500 text-white rounded-xl font-bold shadow-lg shadow-datova-500/25 hover:bg-datova-600 transition-colors"
        >
          {activeQuestion === questions.length - 1 ? 'Analyze Results' : 'Next'} <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );

  const renderLeadForm = () => (
    <div className="max-w-md w-full mx-auto flex flex-col h-full justify-center animate-fade-in p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600 dark:text-indigo-400">
          <Lock size={32} />
        </div>
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Unlock Your Dashboard</h3>
        <p className="text-slate-500 dark:text-slate-400">
          Enter your details to generate your personalized Readiness Report and access the Datova OS Demo.
        </p>
      </div>

      <form onSubmit={handleLeadSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              required
              value={leadData.name}
              onChange={(e) => setLeadData(prev => ({...prev, name: e.target.value}))}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-datova-500 outline-none transition-all dark:text-white"
              placeholder="John Doe"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Business Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="email" 
              required
              value={leadData.email}
              onChange={(e) => setLeadData(prev => ({...prev, email: e.target.value}))}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-datova-500 outline-none transition-all dark:text-white"
              placeholder="john@company.com"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-4 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-lg hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
          {isSubmitting ? 'Building Dashboard...' : 'Generate My Report'}
        </button>
        
        <button 
          type="button"
          onClick={() => setShowLeadForm(false)}
          className="w-full text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 py-2"
        >
          Back to questions
        </button>
      </form>
    </div>
  );

  return (
    <section id="assessment" className="py-24 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 scroll-mt-32">
      <div className="container mx-auto px-6">
        
        {/* Main Application Container */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-200 dark:shadow-black/50 overflow-hidden border border-slate-200 dark:border-slate-800 min-h-[700px] flex flex-col md:flex-row transition-all duration-500">
            
            {/* Sidebar / Menu */}
            <div className={`w-full md:w-80 bg-slate-50 dark:bg-slate-950/50 border-r border-slate-100 dark:border-slate-800 p-8 flex flex-col transition-all duration-300 md:w-80`}>
                <div className="mb-10 flex items-center gap-3">
                    <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">My Activity</h3>
                    <p className="text-xs text-slate-500">Assessment Progress</p>
                    </div>
                </div>

                <div className="space-y-2 mb-auto overflow-y-auto max-h-[400px] no-scrollbar">
                    {questions.map((q, idx) => {
                            const isAnswered = answers[q.id] !== undefined;
                            const isActive = activeQuestion === idx && !showLeadForm;
                            return (
                            <button 
                                key={q.id}
                                onClick={() => {
                                    if (!showLeadForm) setActiveQuestion(idx);
                                }}
                                disabled={showLeadForm}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                                    isActive 
                                    ? 'bg-slate-900 text-white shadow-lg dark:bg-white dark:text-slate-900' 
                                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                {isAnswered ? <CheckCircle2 size={16} className={isActive ? 'text-datova-400 dark:text-datova-600' : 'text-green-500'} /> : <Circle size={16} />}
                                <span className="truncate">Question {idx + 1}</span>
                            </button>
                            )
                    })}
                </div>

                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-datova-500 to-indigo-500 flex items-center justify-center text-white">
                            <User size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {leadData.name || 'Guest User'}
                            </div>
                            <div className="text-xs text-slate-400 truncate">
                                {leadData.email || 'Not logged in'}
                            </div>
                        </div>
                     </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8 md:p-12 bg-white dark:bg-slate-900 relative flex flex-col min-h-0">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-8 shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                          AI Readiness Assessment
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Complete the assessment to unlock your personalized architecture plan.
                        </p>
                    </div>
                </div>

                {/* Content Routing */}
                <div className="flex-1 flex flex-col min-h-0">
                  {!showLeadForm ? renderQuiz() : renderLeadForm()}
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Assessment;