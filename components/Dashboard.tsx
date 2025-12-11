import React, { useState, useRef, useEffect } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { 
  LayoutDashboard, Database, Zap, Shield, MessageSquare, User, 
  CheckCircle2, AlertCircle, Sparkles, Bot, FileText, Store, 
  Server, Activity, Send, Search, Settings, ArrowLeft, BarChart3, RefreshCw
} from 'lucide-react';
import { chatWithData } from '../services/geminiService';
import { DashboardTab, AssessmentData } from '../types';

// --- Mock Data ---

const mockIngestionData = [
  { source: "Salesforce CRM", status: "Active", type: "API Stream", latency: "24ms", records: "1.2M" },
  { source: "Shopify Store", status: "Active", type: "Webhook", latency: "120ms", records: "850k" },
  { source: "Google Sheets (Legacy)", status: "Warning", type: "Polled", latency: "5s", records: "45k" },
  { source: "PostgreSQL DW", status: "Active", type: "Direct Connect", latency: "12ms", records: "12.5M" },
];

const mockMetricData = [
  { name: 'Mon', revenue: 4000, efficiency: 2400 },
  { name: 'Tue', revenue: 3000, efficiency: 1398 },
  { name: 'Wed', revenue: 2000, efficiency: 9800 },
  { name: 'Thu', revenue: 2780, efficiency: 3908 },
  { name: 'Fri', revenue: 1890, efficiency: 4800 },
  { name: 'Sat', revenue: 2390, efficiency: 3800 },
  { name: 'Sun', revenue: 3490, efficiency: 4300 },
];

const mockWorkflowSteps = [
  { id: 1, type: "trigger", name: "New Lead (HubSpot)", status: "success" },
  { id: 2, type: "action", name: "Validate Email API", status: "success" },
  { id: 3, type: "decision", name: "Score > 50?", status: "success" },
  { id: 4, type: "agent", name: "AI Outreach Agent", status: "processing" },
  { id: 5, type: "db", name: "Update CRM", status: "pending" },
];

const dashboardContext = {
  ingestion: mockIngestionData,
  metrics: mockMetricData,
  workflows: mockWorkflowSteps,
  activeAgents: [
      { name: "Customer Support L1", status: "Processing", lastActive: "2m ago" },
      { name: "Invoice Extractor", status: "Idle", lastActive: "15m ago" }
  ],
  systemHealth: { uptime: "99.99%", latency: "42ms", errors: "0.02%" }
};

// --- Sub-Components ---

const NavItem = ({ 
  active, 
  onClick, 
  icon: Icon, 
  label,
  badge
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: any; 
  label: string;
  badge?: string;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 mb-1 group ${
      active
        ? 'bg-slate-900 text-white shadow-lg dark:bg-white dark:text-slate-900'
        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400'
    }`}
  >
    <div className="flex items-center gap-3">
        <Icon size={18} className={active ? 'text-datova-400 dark:text-datova-600' : 'opacity-70 group-hover:opacity-100 transition-opacity'} />
        <span className="truncate">{label}</span>
    </div>
    {badge && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            active 
            ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900' 
            : 'bg-datova-100 text-datova-600 dark:bg-datova-900/30 dark:text-datova-400'
        }`}>
            {badge}
        </span>
    )}
  </button>
);

const FeatureCard = ({ title, children, className = "", action }: { title: string; children?: React.ReactNode; className?: string, action?: React.ReactNode }) => (
  <div className={`bg-slate-50 dark:bg-slate-850 rounded-[1.5rem] p-6 border border-slate-100 dark:border-slate-800 flex flex-col ${className}`}>
    <div className="flex justify-between items-center mb-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</h4>
        {action}
    </div>
    <div className="flex-1">
        {children}
    </div>
  </div>
);

interface DashboardProps {
  data: AssessmentData;
  onBack: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onBack }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  
  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
      { role: 'ai', text: `Hello ${data.user.name.split(' ')[0]}! I am your Datova AI Analyst. I have processed your assessment score of ${data.score}/100. How can I help you explore your data foundation?` }
  ]);
  const [isChatTyping, setIsChatTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleChatSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim()) return;

      const userMsg = chatInput;
      setChatInput('');
      setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
      setIsChatTyping(true);

      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

      const response = await chatWithData(userMsg, dashboardContext);
      
      setChatMessages(prev => [...prev, { role: 'ai', text: response }]);
      setIsChatTyping(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const getRadarData = () => [
    { subject: 'Centralization', A: data.answers['q1'] || 20, fullMark: 100 },
    { subject: 'Reporting', A: data.answers['q2'] || 20, fullMark: 100 },
    { subject: 'Governance', A: data.answers['q3'] || 20, fullMark: 100 },
    { subject: 'Automation', A: data.answers['q4'] || 20, fullMark: 100 },
    { subject: 'Skills', A: data.answers['q5'] || 20, fullMark: 100 },
  ];

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-slate-900 dark:text-white font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const renderOverviewTab = () => (
    <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="flex flex-col gap-6">
        <div className="p-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Sparkles size={120} />
          </div>
          <span className="relative z-10 opacity-90 text-sm font-bold uppercase tracking-wider">Maturity Score</span>
          <div className="relative z-10 text-7xl font-bold mt-2 mb-6 tracking-tight">{data.score}<span className="text-3xl opacity-60 font-medium">/100</span></div>
          <div className="relative z-10 h-2 bg-black/20 rounded-full overflow-hidden">
            <div style={{width: `${data.score}%`}} className="h-full bg-white/90 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
          </div>
          <div className="relative z-10 mt-4 text-sm font-medium opacity-90">
            {data.score < 50 ? "Foundation Phase" : data.score < 80 ? "Growth Phase" : "Optimization Phase"}
          </div>
        </div>
        
        <div className="flex-1 bg-slate-50 dark:bg-slate-850 rounded-[2rem] p-4 flex items-center justify-center border border-slate-100 dark:border-slate-800 min-h-[300px]">
          <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={getRadarData()}>
                <PolarGrid stroke="#94a3b8" strokeOpacity={0.3} />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                <Radar name="You" dataKey="A" stroke="#6366f1" strokeWidth={3} fill="#6366f1" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-850 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 overflow-y-auto max-h-[600px] no-scrollbar">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
            <LayoutDashboard size={20} className="text-indigo-500" /> Executive Summary
          </h3>
          <span className="text-xs font-bold text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded">Generated by Gemini</span>
        </div>
        
        <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
          {data.report && data.report.split('\n').map((line, i) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={i} className="h-2" />;
            
            if (trimmed.startsWith('#')) {
                return <h4 key={i} className="font-bold text-lg mt-6 mb-3 text-slate-900 dark:text-white">{trimmed.replace(/^#+\s*/, '')}</h4>
            }
            if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                return <h4 key={i} className="font-bold text-md mt-6 mb-2 text-slate-900 dark:text-white">{trimmed.replace(/\*\*/g, '')}</h4>;
            }
            if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                return (
                    <div key={i} className="flex gap-3 mb-2 ml-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></div>
                        <p className="text-slate-600 dark:text-slate-300 m-0 leading-relaxed">
                            {renderFormattedText(trimmed.substring(2))}
                        </p>
                    </div>
                );
            }
            
            return <p key={i} className="text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                {renderFormattedText(line)}
            </p>;
          })}
        </div>
      </div>
    </div>
  );

  const renderFoundationTab = () => (
    <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-y-auto no-scrollbar">
      <FeatureCard title="Data Ingestion Status" className="col-span-1 md:col-span-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="pb-3 font-medium">Source</th>
                <th className="pb-3 font-medium">Connection</th>
                <th className="pb-3 font-medium">Latency</th>
                <th className="pb-3 font-medium">Records Synced</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockIngestionData.map((row, i) => (
                <tr key={i} className="group hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 font-medium text-slate-900 dark:text-white">{row.source}</td>
                  <td className="py-3 text-slate-500">{row.type}</td>
                  <td className="py-3 text-slate-500 font-mono text-xs">{row.latency}</td>
                  <td className="py-3 text-slate-500">{row.records}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      row.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {row.status === 'Active' ? <CheckCircle2 size={12} className="mr-1"/> : <AlertCircle size={12} className="mr-1"/>}
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-4 mt-4">
             <button className="text-sm text-datova-500 font-medium flex items-center gap-1 hover:gap-2 transition-all">+ Add Connector</button>
             <button className="text-sm text-slate-400 font-medium flex items-center gap-1 hover:text-slate-600 transition-all">Import CSV/Excel</button>
        </div>
      </FeatureCard>

      <FeatureCard title="Data Quality Score">
        <div className="flex items-center gap-6">
          <div className="relative h-32 w-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200 dark:text-slate-700" />
              <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-datova-500" strokeDasharray={351} strokeDashoffset={351 - (351 * 0.85)} />
            </svg>
            <span className="absolute text-3xl font-bold text-slate-900 dark:text-white">85</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span className="text-sm text-slate-600 dark:text-slate-300">Schema Validated</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span className="text-sm text-slate-600 dark:text-slate-300">Deduplicated</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-amber-500" />
              <span className="text-sm text-slate-600 dark:text-slate-300">3 Anomalies Found</span>
            </div>
          </div>
        </div>
      </FeatureCard>

      <FeatureCard title="Data Explorer (UBDM)">
        <div className="flex items-center justify-center h-32 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
           <div className="absolute inset-0 grid grid-cols-6 gap-2 opacity-10">
              {[...Array(24)].map((_, i) => <div key={i} className="bg-datova-500/20 rounded-md"></div>)}
           </div>
           <div className="z-10 flex flex-col items-center">
              <Database size={32} className="text-datova-500 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-mono text-slate-500">v2.4.1 Production</span>
           </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button className="flex-1 py-2 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-datova-400 transition-colors">View Schema</button>
          <button className="flex-1 py-2 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-datova-400 transition-colors">API Docs</button>
        </div>
      </FeatureCard>
    </div>
  );

  const renderIntelligenceTab = () => (
    <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-y-auto no-scrollbar">
       <FeatureCard title="KPI Builder Preview" className="col-span-1 md:col-span-2 min-h-[300px]">
          <div className="flex justify-between items-center mb-6">
             <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">$124,500</h3>
                <span className="text-sm text-emerald-500 font-bold">+12.5% vs last month</span>
             </div>
             <div className="flex gap-2">
                <button className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-datova-500"><BarChart3 size={16} /></button>
                <button className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-datova-500"><RefreshCw size={16} /></button>
             </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockMetricData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
       </FeatureCard>

       <FeatureCard title="Anomaly Detection">
          <div className="space-y-4">
             <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-xl flex gap-3">
                <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
                <div>
                   <h5 className="text-sm font-bold text-slate-900 dark:text-white">Inventory Spike Detected</h5>
                   <p className="text-xs text-slate-500 mt-1">SKU-1920 showing +400% inbound volume deviation.</p>
                </div>
             </div>
             <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl flex gap-3">
                <Zap className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                <div>
                   <h5 className="text-sm font-bold text-slate-900 dark:text-white">Conversion Optimization</h5>
                   <p className="text-xs text-slate-500 mt-1">AI suggests price adjustment for Region EU.</p>
                </div>
             </div>
          </div>
       </FeatureCard>

       <FeatureCard title="Insight Generator">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 h-full">
             <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                   <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                   <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      "Based on Q3 trends, customer acquisition cost has decreased by 15% due to the new automated email workflow."
                   </p>
                   <div className="mt-3 flex gap-2">
                      <button className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 font-medium">Drill Down</button>
                      <button className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 font-medium">Export Report</button>
                   </div>
                </div>
             </div>
          </div>
       </FeatureCard>
    </div>
  );

  const renderAutomationTab = () => (
    <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-y-auto no-scrollbar">
       <FeatureCard title="Workflow Builder" className="col-span-1 md:col-span-2">
          <div className="bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 relative min-h-[200px] flex items-center justify-center">
             <div className="absolute top-4 left-4 flex gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Flow: Lead Enrichment</span>
             </div>
             
             {/* Visual Node Graph Mockup */}
             <div className="flex items-center gap-2 overflow-x-auto p-4 w-full">
                {mockWorkflowSteps.map((step, i) => (
                   <React.Fragment key={step.id}>
                      <div className={`relative shrink-0 w-32 p-3 rounded-xl border flex flex-col items-center text-center gap-2 shadow-sm z-10 ${
                         step.status === 'success' ? 'bg-white dark:bg-slate-800 border-emerald-500/50' :
                         step.status === 'processing' ? 'bg-white dark:bg-slate-800 border-indigo-500 animate-pulse' :
                         'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-70'
                      }`}>
                         <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                             step.type === 'trigger' ? 'bg-amber-100 text-amber-600' :
                             step.type === 'action' ? 'bg-blue-100 text-blue-600' :
                             step.type === 'decision' ? 'bg-purple-100 text-purple-600' :
                             step.type === 'agent' ? 'bg-datova-100 text-datova-600' : 'bg-slate-200'
                         }`}>
                             {step.type === 'trigger' ? <Zap size={14}/> : step.type === 'agent' ? <Bot size={14}/> : <Activity size={14}/>}
                         </div>
                         <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate w-full">{step.name}</span>
                      </div>
                      {i < mockWorkflowSteps.length - 1 && (
                         <div className="h-0.5 w-8 bg-slate-300 dark:bg-slate-700 shrink-0"></div>
                      )}
                   </React.Fragment>
                ))}
             </div>
          </div>
       </FeatureCard>

       <FeatureCard title="Active Agents">
          <div className="space-y-3">
             <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                 <div className="flex items-center gap-3">
                    <div className="relative">
                       <Bot size={24} className="text-datova-500" />
                       <div className="absolute -bottom-1 -right-1 h-2.5 w-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                    </div>
                    <div>
                       <h5 className="text-sm font-bold text-slate-900 dark:text-white">Customer Support L1</h5>
                       <p className="text-xs text-slate-500">Processing ticket #9281</p>
                    </div>
                 </div>
                 <div className="text-xs font-mono text-slate-400">2m ago</div>
             </div>
             <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                 <div className="flex items-center gap-3">
                    <div className="relative">
                       <FileText size={24} className="text-indigo-500" />
                       <div className="absolute -bottom-1 -right-1 h-2.5 w-2.5 bg-slate-400 rounded-full border-2 border-white dark:border-slate-900"></div>
                    </div>
                    <div>
                       <h5 className="text-sm font-bold text-slate-900 dark:text-white">Invoice Extractor</h5>
                       <p className="text-xs text-slate-500">Idle - Waiting for queue</p>
                    </div>
                 </div>
                 <div className="text-xs font-mono text-slate-400">15m ago</div>
             </div>
          </div>
       </FeatureCard>

       <FeatureCard title="Templates Marketplace" action={<button className="text-xs text-datova-500 font-bold hover:underline">View All</button>}>
           <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-datova-400 cursor-pointer transition-colors text-center group">
                 <Store size={20} className="mx-auto mb-2 text-slate-400 group-hover:text-datova-500" />
                 <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Sales Ops Pack</div>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-datova-400 cursor-pointer transition-colors text-center group">
                 <Bot size={20} className="mx-auto mb-2 text-slate-400 group-hover:text-datova-500" />
                 <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Support Agent</div>
              </div>
           </div>
       </FeatureCard>
    </div>
  );

  const renderReliabilityTab = () => (
    <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-y-auto no-scrollbar">
       <FeatureCard title="System Health" className="col-span-1 md:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl text-center">
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">API Uptime</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">99.99%</div>
             </div>
             <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                <div className="text-xs font-bold text-slate-500 mb-1">Avg Latency</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">42ms</div>
             </div>
             <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                <div className="text-xs font-bold text-slate-500 mb-1">Error Rate</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">0.02%</div>
             </div>
             <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                <div className="text-xs font-bold text-slate-500 mb-1">Active Nodes</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">12/12</div>
             </div>
          </div>
       </FeatureCard>

       <FeatureCard title="Governance & Audit">
          <ul className="space-y-4">
             {[
                { user: "System", action: "Schema Update v2.4", time: "10m ago", icon: Database },
                { user: "John D.", action: "Modified Agent Prompt", time: "1h ago", icon: User },
                { user: "System", action: "Auto-Scale Triggered", time: "3h ago", icon: Server },
                { user: "Sarah M.", action: "Exported Q3 Report", time: "5h ago", icon: FileText }
             ].map((log, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                   <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-0.5">
                      <log.icon size={12} className="text-slate-500" />
                   </div>
                   <div>
                      <p className="font-medium text-slate-900 dark:text-white">{log.action}</p>
                      <p className="text-xs text-slate-500">{log.user} • {log.time}</p>
                   </div>
                </li>
             ))}
          </ul>
       </FeatureCard>

       <FeatureCard title="Security Status">
           <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-600 dark:text-slate-300">Encryption (At Rest)</span>
                 <span className="text-emerald-500 font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Active</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-600 dark:text-slate-300">RBAC Policies</span>
                 <span className="text-emerald-500 font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Enforced</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-600 dark:text-slate-300">SOC2 Compliance</span>
                 <span className="text-emerald-500 font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Passing</span>
              </div>
           </div>
       </FeatureCard>
    </div>
  );

  const renderAIConsoleTab = () => (
      <div className="h-full flex flex-col animate-fade-in rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex justify-between items-center">
              <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Datova Intelligence Agent</span>
              </div>
              <button onClick={() => setChatMessages([])} className="text-xs text-slate-400 hover:text-slate-600">Clear Chat</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-slate-50 dark:bg-slate-950/50">
              {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          msg.role === 'user' 
                          ? 'bg-datova-500 text-white rounded-br-none' 
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-slate-700'
                      }`}>
                          {msg.role === 'ai' && <div className="text-xs font-bold mb-1 opacity-50 uppercase tracking-wider">Datova AI</div>}
                          {msg.text}
                      </div>
                  </div>
              ))}
              {isChatTyping && (
                  <div className="flex justify-start">
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-bl-none border border-slate-100 dark:border-slate-700">
                         <div className="flex gap-1">
                             <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                             <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                             <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                         </div>
                      </div>
                  </div>
              )}
              <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleChatSubmit} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              <div className="relative">
                  <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask about your data (e.g., 'Analyze my revenue trends')"
                      className="w-full pl-4 pr-12 py-4 bg-slate-100 dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-datova-500 text-slate-900 dark:text-white transition-all"
                  />
                  <button 
                      type="submit"
                      disabled={!chatInput.trim() || isChatTyping}
                      className="absolute right-2 top-2 p-2 bg-datova-500 text-white rounded-lg hover:bg-datova-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                      <Send size={18} />
                  </button>
              </div>
          </form>
      </div>
  );

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen p-4 md:p-8 transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-200 dark:shadow-black/50 overflow-hidden border border-slate-200 dark:border-slate-800 min-h-[85vh] flex flex-col md:flex-row">
            
            {/* Sidebar / Menu */}
            <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-950/50 border-r border-slate-100 dark:border-slate-800 p-8 flex flex-col">
                <div className="mb-10 flex items-center justify-between gap-3">
                   <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                      <div className="bg-datova-500 p-1.5 rounded-lg text-white"><Database size={16} /></div>
                      Datova OS
                   </div>
                   <button onClick={onBack} className="md:hidden p-2 text-slate-400 hover:text-slate-600"><ArrowLeft size={20}/></button>
                </div>

                <div className="space-y-2 mb-auto overflow-y-auto max-h-[calc(100vh-300px)] no-scrollbar">
                   <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-4 mt-2">Core Platform</div>
                   <NavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={LayoutDashboard} label="Overview" />
                   <NavItem active={activeTab === 'foundation'} onClick={() => setActiveTab('foundation')} icon={Database} label="Data Foundation" />
                   <NavItem active={activeTab === 'intelligence'} onClick={() => setActiveTab('intelligence')} icon={BarChart3} label="Intelligence" />
                   <NavItem active={activeTab === 'automation'} onClick={() => setActiveTab('automation')} icon={Zap} label="Automation" badge="3 Active" />
                   <NavItem active={activeTab === 'reliability'} onClick={() => setActiveTab('reliability')} icon={Shield} label="Reliability" />
                   
                   <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-4 mt-6">AI Tools</div>
                   <NavItem active={activeTab === 'ai_console'} onClick={() => setActiveTab('ai_console')} icon={MessageSquare} label="AI Console" badge="Beta" />
                </div>

                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-datova-500 to-indigo-500 flex items-center justify-center text-white">
                            <User size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {data.user.name || 'Guest User'}
                            </div>
                            <div className="text-xs text-slate-400 truncate">
                                {data.user.email || 'Not logged in'}
                            </div>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 px-2">
                         <div className="flex -space-x-2">
                            {[1,2,3].map(i => (
                                <div key={i} className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-slate-50 dark:border-slate-900"></div>
                            ))}
                         </div>
                         <span className="text-xs text-slate-500 font-medium">+4 Online</span>
                    </div>
                    <button onClick={onBack} className="mt-6 flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors w-full px-2">
                        <ArrowLeft size={14} /> Back to Home
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8 md:p-12 bg-white dark:bg-slate-900 relative flex flex-col min-h-0">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-8 shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                          {activeTab === 'overview' ? 'Executive Dashboard' :
                           activeTab === 'foundation' ? 'Data Foundation Layer' :
                           activeTab === 'intelligence' ? 'Intelligence Layer' :
                           activeTab === 'automation' ? 'Automation Layer' : 
                           activeTab === 'reliability' ? 'System Reliability' : 'AI Data Console'}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Live Preview Environment
                        </p>
                    </div>
                    <div className="flex gap-2">
                       <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold border border-emerald-100 dark:border-emerald-800 animate-pulse">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          System Online
                       </div>
                       <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><Search size={20}/></button>
                       <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><Settings size={20}/></button>
                    </div>
                </div>

                {/* Content Routing */}
                <div className="flex-1 flex flex-col min-h-0">
                  {activeTab === 'overview' ? renderOverviewTab() :
                   activeTab === 'foundation' ? renderFoundationTab() :
                   activeTab === 'intelligence' ? renderIntelligenceTab() :
                   activeTab === 'automation' ? renderAutomationTab() :
                   activeTab === 'reliability' ? renderReliabilityTab() : renderAIConsoleTab()}
                </div>
            </div>
        </div>
    </div>
  );
};

export default Dashboard;