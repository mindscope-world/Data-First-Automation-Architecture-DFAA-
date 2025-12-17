import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, Database, Brain, Bot, Terminal, 
  ArrowLeft, Send, X, Plus, AlertCircle, CheckCircle,
  Shield, Zap, User, Menu, Sparkles
} from 'lucide-react';
import { AssessmentData, DashboardTab } from '../types';
import { chatWithData } from '../services/geminiService';

interface DashboardProps {
  data: AssessmentData;
  onBack: () => void;
}

// Mock operational data for the chat context
const MOCK_DASHBOARD_CONTEXT = {
  active_agents: 12,
  total_automations_run: 14502,
  uptime: "99.98%",
  pending_anomalies: 3,
  revenue_impact: "$12,450 / mo",
  recent_events: [
    "Schema drift detected in ERP_SYNC_V2",
    "Agent 'Returns_Bot' requires approval for refund > $500",
    "Daily warehouse sync completed in 45s"
  ]
};

const Dashboard: React.FC<DashboardProps> = ({ data, onBack }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: "Hello! I'm your Datova AI Console. I've analyzed your assessment results. You can ask me about your data maturity, recommended next steps, or simulate querying your future data warehouse." }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Agent Modal State
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [agentConfig, setAgentConfig] = useState({
      name: '',
      role: 'support',
      capabilities: { read: true, write: false, humanApproval: true }
  });
  const [deployedAgents, setDeployedAgents] = useState([
    { id: 1, name: 'Invoice_Parser_V1', status: 'active', type: 'ops' },
    { id: 2, name: 'Customer_Triage_Bot', status: 'paused', type: 'support' }
  ]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    // Combine Assessment Data with Operational Context for the AI
    const context = {
        assessment_results: data,
        operational_metrics: MOCK_DASHBOARD_CONTEXT
    };

    const response = await chatWithData(userMsg, context);
    
    setChatHistory(prev => [...prev, { role: 'ai', text: response }]);
    setIsChatLoading(false);
  };

  const handleDeployAgent = () => {
      // Mock deployment
      const newAgent = {
          id: Date.now(),
          name: agentConfig.name || 'Untitled Agent',
          status: 'active',
          type: agentConfig.role
      };
      setDeployedAgents([...deployedAgents, newAgent]);
      setShowAgentModal(false);
      setAgentConfig({
          name: '',
          role: 'support',
          capabilities: { read: true, write: false, humanApproval: true }
      });
  };

  const renderAgentModal = () => {
      if (!showAgentModal) return null;
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Bot size={24} className="text-datova-500" /> Deploy AI Agent
                    </h3>
                    <button onClick={() => setShowAgentModal(false)}><X size={20} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" /></button>
                </div>
                
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Agent Name</label>
                        <input 
                            type="text" 
                            value={agentConfig.name}
                            onChange={(e) => setAgentConfig({...agentConfig, name: e.target.value})}
                            placeholder="e.g., Returns Specialist"
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-datova-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Role / Archetype</label>
                        <select 
                            value={agentConfig.role}
                            onChange={(e) => setAgentConfig({...agentConfig, role: e.target.value})}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-datova-500 outline-none transition-all"
                        >
                            <option value="support">Customer Support (L1)</option>
                            <option value="ops">Operations Manager</option>
                            <option value="analyst">Data Analyst</option>
                            <option value="steward">Governance Steward</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Capabilities</label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <input 
                                    type="checkbox" 
                                    checked={agentConfig.capabilities.read}
                                    onChange={(e) => setAgentConfig({...agentConfig, capabilities: {...agentConfig.capabilities, read: e.target.checked}})}
                                    className="w-5 h-5 rounded border-slate-300 text-datova-500 focus:ring-datova-500 cursor-pointer accent-datova-500"
                                />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Read Access (Knowledge Base)</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <input 
                                    type="checkbox" 
                                    checked={agentConfig.capabilities.write}
                                    onChange={(e) => setAgentConfig({...agentConfig, capabilities: {...agentConfig.capabilities, write: e.target.checked}})}
                                    className="w-5 h-5 rounded border-slate-300 text-datova-500 focus:ring-datova-500 cursor-pointer accent-datova-500"
                                />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Write Access (Perform Actions)</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <input 
                                    type="checkbox" 
                                    checked={agentConfig.capabilities.humanApproval}
                                    onChange={(e) => setAgentConfig({...agentConfig, capabilities: {...agentConfig.capabilities, humanApproval: e.target.checked}})}
                                    className="w-5 h-5 rounded border-slate-300 text-datova-500 focus:ring-datova-500 cursor-pointer accent-datova-500"
                                />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Require Human Approval (High Risk)</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
                    <button 
                        onClick={handleDeployAgent}
                        className="px-6 py-2 bg-datova-500 hover:bg-datova-600 text-white rounded-lg font-bold shadow-lg shadow-datova-500/20 transition-all flex items-center gap-2"
                    >
                        <Bot size={18} /> Deploy Agent
                    </button>
                </div>
            </div>
        </div>
      );
  };

  // Helper to render the scorecard bars
  const renderScoreBars = () => {
    return (
        <div className="space-y-4">
            {[
                { label: 'Centralization', key: 'q1', icon: Database },
                { label: 'Reliability', key: 'q2', icon: Activity },
                { label: 'Governance', key: 'q3', icon: Shield },
                { label: 'Automation', key: 'q4', icon: Zap },
                { label: 'Skills', key: 'q5', icon: User },
            ].map((metric) => (
                <div key={metric.key} className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-medium text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                            <metric.icon size={14} className="opacity-70" />
                            {metric.label}
                        </div>
                        <span>{data.answers[metric.key] || 0}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-datova-500 rounded-full transition-all duration-1000" 
                            style={{ width: `${data.answers[metric.key] || 0}%` }}
                        ></div>
                    </div>
                </div>
            ))}
        </div>
    );
  };

  // Main Render
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 z-20`}>
        <div className="p-6 flex items-center gap-3 font-bold text-xl text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 h-20">
            <div className="bg-gradient-to-tr from-datova-600 to-datova-400 p-2 rounded-lg text-white shrink-0">
                <Database size={20} />
            </div>
            {isSidebarOpen && <span className="animate-fade-in">Datova OS</span>}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'overview' ? 'bg-datova-50 dark:bg-datova-900/20 text-datova-600 dark:text-datova-300 font-semibold' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
                <LayoutDashboard size={20} />
                {isSidebarOpen && <span>Overview</span>}
            </button>
            
            <button 
                onClick={() => setActiveTab('ai_console')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'ai_console' ? 'bg-datova-50 dark:bg-datova-900/20 text-datova-600 dark:text-datova-300 font-semibold' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
                <Terminal size={20} />
                {isSidebarOpen && <span>AI Console</span>}
            </button>

            <div className="pt-4 pb-2">
                {isSidebarOpen && <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Modules</p>}
                <button 
                    onClick={() => setActiveTab('automation')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'automation' ? 'bg-datova-50 dark:bg-datova-900/20 text-datova-600 dark:text-datova-300 font-semibold' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                    <Bot size={20} />
                    {isSidebarOpen && <span>Automation</span>}
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors opacity-50 cursor-not-allowed">
                    <Brain size={20} />
                    {isSidebarOpen && <span>Intelligence (Pro)</span>}
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors opacity-50 cursor-not-allowed">
                    <Shield size={20} />
                    {isSidebarOpen && <span>Governance (Pro)</span>}
                </button>
            </div>
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
             <button onClick={onBack} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                <ArrowLeft size={20} />
                {isSidebarOpen && <span>Exit Demo</span>}
             </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950/50">
        
        {/* Header */}
        <header className="h-20 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-8">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                    <Menu size={20} />
                </button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
                    {activeTab.replace('_', ' ')}
                </h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">System Operational</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-datova-100 dark:bg-datova-900/30 text-datova-600 dark:text-datova-400 flex items-center justify-center font-bold">
                    {data.user.name.charAt(0)}
                </div>
            </div>
        </header>

        {/* Tab Views */}
        <div className="flex-1 overflow-y-auto p-8">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <div className="max-w-6xl mx-auto animate-fade-in">
                    <div className="grid lg:grid-cols-3 gap-8 mb-8">
                        {/* Score Card */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                            <div className="relative mb-4">
                                <svg className="h-32 w-32 transform -rotate-90">
                                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={351} strokeDashoffset={351 - (351 * data.score) / 100} className="text-datova-500 transition-all duration-1000" />
                                </svg>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-slate-900 dark:text-white">
                                    {data.score}
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Maturity Score</h3>
                            <p className="text-sm text-slate-500">Based on DFAA Standards</p>
                        </div>

                        {/* Breakdown */}
                        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Readiness Breakdown</h3>
                            <div className="grid sm:grid-cols-2 gap-8">
                                {renderScoreBars()}
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                        <Sparkles size={14} className="text-datova-500" /> 
                                        Quick Win
                                    </h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Implementing a basic schema validation pipeline for your primary CRM could improve your 'Reliability' score by 15% within 2 weeks.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Report */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-datova-50 to-white dark:from-datova-900/10 dark:to-slate-900">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Bot size={20} className="text-datova-500" /> Executive Analysis
                            </h3>
                        </div>
                        <div className="p-8 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {data.report || "Generating analysis..."}
                        </div>
                    </div>
                </div>
            )}

            {/* AI CONSOLE TAB */}
            {activeTab === 'ai_console' && (
                <div className="max-w-4xl mx-auto h-[calc(100vh-180px)] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {chatHistory.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-4 rounded-2xl ${
                                    msg.role === 'user' 
                                    ? 'bg-datova-500 text-white rounded-br-none' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                                }`}>
                                    <div className="text-sm whitespace-pre-wrap">{msg.text}</div>
                                </div>
                            </div>
                        ))}
                        {isChatLoading && (
                             <div className="flex justify-start">
                                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl rounded-bl-none flex items-center gap-2">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    <form onSubmit={handleChatSubmit} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                        <div className="relative flex items-center">
                            <input 
                                type="text" 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Ask about your data (e.g., 'What is the error rate trend?')"
                                className="w-full pl-6 pr-14 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-datova-500 outline-none shadow-sm"
                            />
                            <button 
                                type="submit" 
                                disabled={!chatInput.trim() || isChatLoading}
                                className="absolute right-3 p-2 bg-datova-500 text-white rounded-lg hover:bg-datova-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* AUTOMATION TAB */}
            {activeTab === 'automation' && (
                <div className="max-w-6xl mx-auto animate-fade-in">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Active Agents</h2>
                            <p className="text-slate-500">Manage your autonomous workflows</p>
                        </div>
                        <button 
                            onClick={() => setShowAgentModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-datova-500 text-white rounded-xl font-bold hover:bg-datova-600 transition-colors shadow-lg shadow-datova-500/20"
                        >
                            <Plus size={20} /> Deploy Agent
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {deployedAgents.map(agent => (
                            <div key={agent.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${agent.status === 'active' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'}`}>
                                        <Bot size={24} />
                                    </div>
                                    <div className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${agent.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                                        {agent.status}
                                    </div>
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{agent.name}</h3>
                                <p className="text-sm text-slate-500 mb-6 capitalize">{agent.type} Agent</p>
                                
                                <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                                    <button className="flex-1 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">Logs</button>
                                    <button className="flex-1 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">Settings</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </main>

      {renderAgentModal()}
    </div>
  );
};

export default Dashboard;