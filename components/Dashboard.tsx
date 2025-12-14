import React, { useState, useRef, useEffect } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, LineChart, Line, Legend } from 'recharts';
import { 
  LayoutDashboard, Database, Zap, Shield, MessageSquare, User, 
  CheckCircle2, AlertCircle, Sparkles, Bot, FileText, Store, 
  Server, Activity, Send, Search, Settings, ArrowLeft, ArrowRight, BarChart3, RefreshCw,
  Plus, X, Cloud, FileSpreadsheet, Globe, HardDrive, Clock,
  Wand2, AlertOctagon, GitMerge, Type, ScanSearch,
  Play, Pause, MoreHorizontal, Cpu, Timer, History, XCircle, Key, Link,
  Brain, Sliders, ShieldCheck, TrendingUp, TrendingDown, Code2, Terminal, Siren, Construction, Lock
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

const mockCleaningLog = [
  { field: 'phone_num', issue: 'Format Inconsistency', action: 'Normalized to E.164', count: 452 },
  { field: 'cust_email', issue: 'Duplicate Records', action: 'Merged 12 sets', count: 12 },
  { field: 'order_val', issue: 'Type Mismatch (String)', action: 'Cast to Float', count: 85 },
  { field: 'region_code', issue: 'Missing Values', action: 'Imputed Default (US)', count: 23 },
];

const mockAnomalies = [
  { id: 1, type: 'Schema Drift', desc: 'New field "loyalty_score" detected in Shopify stream.', severity: 'medium', time: '10m ago' },
  { id: 2, type: 'Value Outlier', desc: 'Order value $99,999 exceeds 3-sigma threshold.', severity: 'high', time: '1h ago' },
];

const mockMetricData = [
  { name: 'Mon', revenue: 4000, efficiency: 2400, cost: 1200 },
  { name: 'Tue', revenue: 3000, efficiency: 1398, cost: 1100 },
  { name: 'Wed', revenue: 5000, efficiency: 9800, cost: 1150 },
  { name: 'Thu', revenue: 4780, efficiency: 3908, cost: 1250 },
  { name: 'Fri', revenue: 5890, efficiency: 4800, cost: 1300 },
  { name: 'Sat', revenue: 4390, efficiency: 3800, cost: 1100 },
  { name: 'Sun', revenue: 6490, efficiency: 4300, cost: 1400 },
];

const mockLatencyData = [
    { time: '00:00', latency: 45 }, { time: '04:00', latency: 42 },
    { time: '08:00', latency: 120 }, { time: '12:00', latency: 55 },
    { time: '16:00', latency: 48 }, { time: '20:00', latency: 44 },
    { time: '23:59', latency: 40 },
];

const mockReliabilityEvents = [
    { id: 1, title: 'Auto-Scaling Triggered', desc: 'Throughput spike detected. Scaled Agent pods to 5.', type: 'info', time: '15m ago' },
    { id: 2, title: 'Schema Drift Remediation', desc: 'Shopify webhook schema changed. Field "tax_id" auto-mapped to "tax_code".', type: 'success', time: '2h ago' },
    { id: 3, title: 'API Rate Limit Warning', desc: 'Approaching Salesforce API daily limit (85%).', type: 'warning', time: '5h ago' }
];

const mockWorkflowSteps = [
  { id: 1, type: "trigger", name: "New Lead (HubSpot)", status: "success" },
  { id: 2, type: "action", name: "Validate Email API", status: "success" },
  { id: 3, type: "decision", name: "Score > 50?", status: "success" },
  { id: 4, type: "agent", name: "AI Outreach Agent", status: "processing" },
  { id: 5, type: "db", name: "Update CRM", status: "pending" },
];

const mockSchemaData: Record<string, { name: string; fields: { name: string; type: string; key: string }[] }[]> = {
  ubdm: [
    { name: 'Customers', fields: [
        { name: 'customer_id', type: 'UUID', key: 'PK' },
        { name: 'email', type: 'VARCHAR(255)', key: 'IDX' },
        { name: 'tier_status', type: 'ENUM', key: '' },
        { name: 'lifetime_val', type: 'DECIMAL', key: '' },
        { name: 'created_at', type: 'TIMESTAMP', key: '' }
    ]},
    { name: 'Orders', fields: [
        { name: 'order_id', type: 'UUID', key: 'PK' },
        { name: 'customer_id', type: 'UUID', key: 'FK' },
        { name: 'total_amount', type: 'DECIMAL', key: '' },
        { name: 'currency', type: 'VARCHAR(3)', key: '' },
        { name: 'status', type: 'VARCHAR(20)', key: '' }
    ]},
    { name: 'Interactions', fields: [
        { name: 'event_id', type: 'UUID', key: 'PK' },
        { name: 'customer_id', type: 'UUID', key: 'FK' },
        { name: 'channel', type: 'VARCHAR(50)', key: '' },
        { name: 'duration_sec', type: 'INT', key: '' },
        { name: 'metadata', type: 'JSONB', key: '' }
    ]}
  ],
  salesforce: [
    { name: 'Lead', fields: [
        { name: 'Id', type: 'ID', key: 'PK' }, 
        { name: 'Email', type: 'STRING', key: 'IDX' }, 
        { name: 'Status', type: 'PICKLIST', key: '' },
        { name: 'Company', type: 'STRING', key: '' },
        { name: 'LeadSource', type: 'PICKLIST', key: '' }
    ]},
    { name: 'Opportunity', fields: [
        { name: 'Id', type: 'ID', key: 'PK' }, 
        { name: 'AccountId', type: 'ID', key: 'FK' },
        { name: 'Amount', type: 'CURRENCY', key: '' }, 
        { name: 'StageName', type: 'PICKLIST', key: '' },
        { name: 'CloseDate', type: 'DATE', key: '' }
    ]}
  ]
};

const dashboardContext = {
  ingestion: mockIngestionData,
  cleaning: {
      log: mockCleaningLog,
      anomalies: mockAnomalies
  },
  metrics: mockMetricData,
  workflows: mockWorkflowSteps,
  systemHealth: { uptime: "99.99%", latency: "42ms", errors: "0.02%" }
};

const integrationOptions = {
  saas: [
    { id: 'hubspot', name: 'HubSpot', icon: Database, desc: 'CRM & Marketing' },
    { id: 'salesforce', name: 'Salesforce', icon: Cloud, desc: 'Enterprise CRM' },
    { id: 'notion', name: 'Notion', icon: FileText, desc: 'Knowledge Base' },
    { id: 'airtable', name: 'Airtable', icon: Database, desc: 'Low-code DB' },
  ],
  db: [
    { id: 'postgres', name: 'PostgreSQL', icon: Database, desc: 'Relational DB' },
    { id: 'mysql', name: 'MySQL', icon: Database, desc: 'Relational DB' },
    { id: 'mongo', name: 'MongoDB', icon: Server, desc: 'NoSQL Document DB' },
  ],
  other: [
    { id: 'rest', name: 'REST API', icon: Globe, desc: 'Custom Endpoints' },
    { id: 'csv', name: 'CSV / Excel', icon: FileSpreadsheet, desc: 'File Upload' },
  ]
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
  
  // Integration Modal State
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectStep, setConnectStep] = useState(1);
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [syncMode, setSyncMode] = useState<'webhook' | 'schedule'>('webhook');
  const [activeSchemaModel, setActiveSchemaModel] = useState<'ubdm' | 'salesforce'>('ubdm');

  // Agent Deployment State
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [agentStep, setAgentStep] = useState(1);
  const [agentConfig, setAgentConfig] = useState({
    name: '',
    role: 'support',
    models: [] as string[],
    creativity: 0.5,
    capabilities: {
        read: true,
        write: false,
        humanApproval: true
    }
  });
  
  // Agent Fleet State
  const [agents, setAgents] = useState([
      { name: 'Research Agent', role: 'Enrichment', load: 85, status: 'busy' },
      { name: 'Support Agent', role: 'L1 Triage', load: 45, status: 'idle' },
      { name: 'DocuSign Agent', role: 'Ops', load: 12, status: 'idle' },
      { name: 'Analyst Agent', role: 'Reporting', load: 0, status: 'offline' }
  ]);

  // Notifications
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

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

      const response = await chatWithData(userMsg, { ...dashboardContext, activeAgents: agents });
      
      setChatMessages(prev => [...prev, { role: 'ai', text: response }]);
      setIsChatTyping(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleOpenConnect = () => {
    setConnectStep(1);
    setSelectedIntegration(null);
    setShowConnectModal(true);
  };

  const handleSelectIntegration = (integration: any) => {
    setSelectedIntegration(integration);
    setConnectStep(2);
  };

  const handleOpenAgentModal = () => {
    setAgentStep(1);
    setAgentConfig({
      name: '',
      role: 'support',
      models: [],
      creativity: 0.5,
      capabilities: { read: true, write: false, humanApproval: true }
    });
    setShowAgentModal(true);
  };

  const handleDeployAgent = () => {
    const roleMap: Record<string, string> = {
        'support': 'Customer Service',
        'ops': 'Operations',
        'analyst': 'Reporting'
    };
    
    const newAgent = {
        name: agentConfig.name || 'New Agent',
        role: roleMap[agentConfig.role] || 'Generalist',
        load: 0,
        status: 'idle'
    };

    setAgents(prev => [...prev, newAgent]);
    setNotification({
        message: `${newAgent.name} successfully deployed to Automation Layer.`,
        type: 'success'
    });
    setShowAgentModal(false);
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

  const renderAgentModal = () => {
    if (!showAgentModal) return null;

    const agentTypes = [
        { id: 'support', name: 'Customer Service', icon: MessageSquare, desc: 'Handles tickets & inquiries via email/chat.' },
        { id: 'ops', name: 'Operations Manager', icon: Settings, desc: 'Monitors workflows and triggers remediation.' },
        { id: 'analyst', name: 'Data Analyst', icon: BarChart3, desc: 'Generates reports and finds insights.' }
    ];

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowAgentModal(false)}></div>
        <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-fade-in-up flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-datova-500 rounded-lg text-white">
                        <Bot size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Deploy Intelligent Agent</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Configure AI worker behavior and permissions.</p>
                    </div>
                </div>
                <button onClick={() => setShowAgentModal(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"><X size={20}/></button>
            </div>

            {/* Content with Sidebar */}
            <div className="flex flex-1 min-h-0">
                {/* Sidebar Stepper */}
                <div className="w-64 border-r border-slate-100 dark:border-slate-800 p-6 bg-slate-50 dark:bg-slate-950/30 hidden md:block overflow-y-auto">
                    {[
                        { step: 1, label: 'Agent Identity', icon: User },
                        { step: 2, label: 'Grounding Context', icon: Database },
                        { step: 3, label: 'Parameters', icon: Sliders }
                    ].map((s) => (
                        <div key={s.step} className={`flex items-center gap-3 p-3 rounded-xl mb-2 transition-colors cursor-pointer ${
                            agentStep === s.step 
                            ? 'bg-white dark:bg-slate-800 shadow-sm text-datova-600 dark:text-datova-400 font-bold' 
                            : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                        }`} onClick={() => setAgentStep(s.step)}>
                            <s.icon size={18} />
                            <span className="text-sm">{s.label}</span>
                        </div>
                    ))}
                </div>

                {/* Main Form Area */}
                <div className="flex-1 p-8 overflow-y-auto">
                    {agentStep === 1 && (
                        <div className="space-y-6 animate-fade-in">
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Select Agent Role</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {agentTypes.map(type => (
                                    <button 
                                        key={type.id}
                                        onClick={() => setAgentConfig({...agentConfig, role: type.id})}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                                            agentConfig.role === type.id 
                                            ? 'border-datova-500 bg-datova-50 dark:bg-datova-900/20' 
                                            : 'border-slate-200 dark:border-slate-700 hover:border-datova-300'
                                        }`}
                                    >
                                        <type.icon className={`mb-3 ${agentConfig.role === type.id ? 'text-datova-600' : 'text-slate-400'}`} size={24} />
                                        <div className="font-bold text-sm text-slate-900 dark:text-white">{type.name}</div>
                                        <p className="text-xs text-slate-500 mt-1">{type.desc}</p>
                                    </button>
                                ))}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Agent Name</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-datova-500 outline-none dark:text-white transition-all"
                                    placeholder="e.g., EU Support Lead"
                                    value={agentConfig.name}
                                    onChange={e => setAgentConfig({...agentConfig, name: e.target.value})}
                                />
                            </div>
                        </div>
                    )}

                    {agentStep === 2 && (
                         <div className="space-y-6 animate-fade-in">
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 flex gap-3">
                                <Brain className="text-indigo-600 dark:text-indigo-400 shrink-0" size={20} />
                                <div>
                                    <h5 className="font-bold text-indigo-900 dark:text-indigo-200 text-sm">Semantic Grounding</h5>
                                    <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">Select the UBDM (Unified Business Data Model) entities this agent can access to prevent hallucinations.</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Data Models</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {mockSchemaData.ubdm.map((table) => (
                                        <label key={table.name} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            <input 
                                                type="checkbox" 
                                                checked={agentConfig.models.includes(table.name)}
                                                onChange={(e) => {
                                                    const newModels = e.target.checked 
                                                        ? [...agentConfig.models, table.name]
                                                        : agentConfig.models.filter(m => m !== table.name);
                                                    setAgentConfig({...agentConfig, models: newModels});
                                                }}
                                                className="w-4 h-4 rounded text-datova-500 focus:ring-datova-500 border-slate-300"
                                            />
                                            <div>
                                                <span className="text-sm font-bold text-slate-900 dark:text-white block">{table.name}</span>
                                                <span className="text-xs text-slate-500">{table.fields.length} fields</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {agentStep === 3 && (
                        <div className="space-y-8 animate-fade-in">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Temperature (Creativity)</label>
                                    <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded dark:text-white">{agentConfig.creativity}</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" max="1" step="0.1"
                                    value={agentConfig.creativity}
                                    onChange={e => setAgentConfig({...agentConfig, creativity: parseFloat(e.target.value)})}
                                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-datova-500"
                                />
                                <div className="flex justify-between text-xs text-slate-400 mt-1">
                                    <span>Precise (Fact-based)</span>
                                    <span>Creative (Conversational)</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Capabilities & Safety</label>
                                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg"><CheckCircle2 size={18}/></div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-900 dark:text-white">Read Access</div>
                                            <div className="text-xs text-slate-500">Can query selected models</div>
                                        </div>
                                    </div>
                                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-datova-500">
                                        <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition"/>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg"><ShieldCheck size={18}/></div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-900 dark:text-white">Human-in-the-Loop</div>
                                            <div className="text-xs text-slate-500">Require approval for write actions</div>
                                        </div>
                                    </div>
                                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-datova-500">
                                        <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-between shrink-0">
                <button 
                    onClick={() => setAgentStep(Math.max(1, agentStep - 1))}
                    className={`px-6 py-3 rounded-xl font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors ${agentStep === 1 ? 'invisible' : ''}`}
                >
                    Back
                </button>
                <button 
                    onClick={() => {
                        if (agentStep < 3) setAgentStep(agentStep + 1);
                        else handleDeployAgent();
                    }}
                    className="px-8 py-3 bg-datova-500 hover:bg-datova-600 text-white rounded-xl font-bold shadow-lg shadow-datova-500/20 transition-all flex items-center gap-2"
                >
                    {agentStep === 3 ? 'Deploy Agent' : 'Continue'} <ArrowRight size={16} />
                </button>
            </div>
        </div>
      </div>
    );
  };

  const renderConnectModal = () => {
    if (!showConnectModal) return null;

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowConnectModal(false)}></div>
        <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-fade-in-up">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
             <div>
               <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                 {connectStep === 1 ? 'Connect Data Source' : `Configure ${selectedIntegration?.name}`}
               </h3>
               <p className="text-sm text-slate-500 dark:text-slate-400">
                 {connectStep === 1 ? 'Select a platform to ingest data from.' : 'Set up your synchronization pipeline.'}
               </p>
             </div>
             <button onClick={() => setShowConnectModal(false)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors">
               <X size={20} />
             </button>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[60vh] overflow-y-auto no-scrollbar">
            {connectStep === 1 ? (
              <div className="space-y-8">
                {/* SaaS Section */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                    <Cloud size={14} /> SaaS Platforms
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {integrationOptions.saas.map((item) => (
                      <button key={item.id} onClick={() => handleSelectIntegration(item)} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-datova-500 dark:hover:border-datova-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left group">
                        <item.icon className="text-slate-400 group-hover:text-datova-500 mb-3" size={24} />
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</div>
                        <div className="text-[10px] text-slate-500">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* DB Section */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                    <HardDrive size={14} /> Databases
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {integrationOptions.db.map((item) => (
                      <button key={item.id} onClick={() => handleSelectIntegration(item)} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-datova-500 dark:hover:border-datova-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left group">
                        <item.icon className="text-slate-400 group-hover:text-datova-500 mb-3" size={24} />
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</div>
                        <div className="text-[10px] text-slate-500">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Files & API Section */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                    <Globe size={14} /> Files & Custom API
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {integrationOptions.other.map((item) => (
                      <button key={item.id} onClick={() => handleSelectIntegration(item)} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-datova-500 dark:hover:border-datova-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left group">
                        <item.icon className="text-slate-400 group-hover:text-datova-500 mb-3" size={24} />
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</div>
                        <div className="text-[10px] text-slate-500">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Configuration Step */}
                <div className="bg-slate-50 dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                   <h4 className="font-bold text-slate-900 dark:text-white mb-4">Pipeline Settings</h4>
                   
                   <div className="grid md:grid-cols-2 gap-4">
                      {/* Sync Mode Selection */}
                      <button 
                        onClick={() => setSyncMode('webhook')}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${syncMode === 'webhook' ? 'border-datova-500 bg-datova-50 dark:bg-datova-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'}`}
                      >
                         <div className="flex items-center gap-2 mb-2">
                            <Zap size={18} className={syncMode === 'webhook' ? 'text-datova-500' : 'text-slate-400'} />
                            <span className="font-bold text-sm text-slate-900 dark:text-white">Real-time Webhook</span>
                         </div>
                         <p className="text-xs text-slate-500">
                           Instant data ingestion triggered by events. Best for CRMs and Transactional data.
                         </p>
                      </button>

                      <button 
                        onClick={() => setSyncMode('schedule')}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${syncMode === 'schedule' ? 'border-datova-500 bg-datova-50 dark:bg-datova-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'}`}
                      >
                         <div className="flex items-center gap-2 mb-2">
                            <Clock size={18} className={syncMode === 'schedule' ? 'text-datova-500' : 'text-slate-400'} />
                            <span className="font-bold text-sm text-slate-900 dark:text-white">Scheduled Sync</span>
                         </div>
                         <p className="text-xs text-slate-500">
                           Batch processing at set intervals (e.g. hourly). Best for Reporting and Large datasets.
                         </p>
                      </button>
                   </div>

                   {/* Conditional Fields based on Source */}
                   <div className="mt-6 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Connection Name</label>
                        <input type="text" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-datova-500 dark:text-white" defaultValue={`${selectedIntegration?.name} Prod`} />
                      </div>
                      
                      {syncMode === 'schedule' && (
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sync Frequency</label>
                          <select className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-datova-500 dark:text-white">
                             <option>Every 15 minutes</option>
                             <option>Hourly</option>
                             <option>Daily (Midnight UTC)</option>
                             <option>Weekly</option>
                          </select>
                        </div>
                      )}

                      {selectedIntegration?.id === 'csv' ? (
                         <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center bg-slate-50 dark:bg-slate-900">
                            <FileSpreadsheet className="mx-auto text-slate-400 mb-2" size={32} />
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Drag and drop CSV/Excel here</p>
                            <p className="text-xs text-slate-400 mt-1">or click to browse</p>
                         </div>
                      ) : (
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">API Key / Connection String</label>
                            <input type="password" placeholder="••••••••••••••••" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-datova-500 dark:text-white" />
                         </div>
                      )}
                   </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-between">
             {connectStep === 2 ? (
                <button onClick={() => setConnectStep(1)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                   Back
                </button>
             ) : (
                <div></div>
             )}
             
             {connectStep === 2 ? (
               <button onClick={() => setShowConnectModal(false)} className="px-8 py-3 bg-datova-500 hover:bg-datova-600 text-white rounded-xl font-bold shadow-lg shadow-datova-500/20 transition-all">
                  Create Pipeline
               </button>
             ) : (
               <button disabled className="px-6 py-3 text-slate-300 dark:text-slate-700 font-bold text-sm italic cursor-not-allowed">Select a source to continue</button>
             )}
          </div>
        </div>
      </div>
    );
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
    <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-y-auto no-scrollbar pb-10">
      <FeatureCard title="Data Ingestion & Pipelines" className="col-span-1 md:col-span-2">
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="pb-3 font-medium">Source</th>
                <th className="pb-3 font-medium">Connection Type</th>
                <th className="pb-3 font-medium">Sync Method</th>
                <th className="pb-3 font-medium">Records</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockIngestionData.map((row, i) => (
                <tr key={i} className="group hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                     <div className="p-1 rounded bg-slate-100 dark:bg-slate-800">
                        {row.source.includes('Salesforce') ? <Cloud size={14}/> : 
                         row.source.includes('Shopify') ? <Store size={14}/> :
                         row.source.includes('Google Sheets') ? <FileSpreadsheet size={14}/> : <Database size={14}/>}
                     </div>
                     {row.source}
                  </td>
                  <td className="py-3 text-slate-500">{row.type}</td>
                  <td className="py-3 text-slate-500 text-xs">
                     {row.type.includes('Webhook') ? (
                        <span className="flex items-center gap-1 text-purple-500 font-medium"><Zap size={12}/> Real-time</span>
                     ) : (
                        <span className="flex items-center gap-1 text-slate-400"><Clock size={12}/> Scheduled</span>
                     )}
                  </td>
                  <td className="py-3 text-slate-500 font-mono text-xs">{row.records}</td>
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
        <div className="flex gap-4">
             <button 
                onClick={handleOpenConnect}
                className="text-sm bg-datova-500 text-white hover:bg-datova-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md shadow-datova-500/20"
             >
                <Plus size={16} /> Connect Data Source
             </button>
             <button 
                onClick={handleOpenConnect}
                className="text-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
             >
                <FileSpreadsheet size={16} /> Import CSV
             </button>
        </div>
      </FeatureCard>

      {/* NEW MODULE: Data Cleaning & Standardization */}
      <FeatureCard title="Data Cleaning & Standardization Studio" className="col-span-1 md:col-span-2">
           <div className="grid lg:grid-cols-3 gap-6">
               
               {/* Column 1: Pipeline Status & Controls */}
               <div className="lg:col-span-1 space-y-4">
                  <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                      <h5 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                         <Wand2 size={16} className="text-datova-500" /> Auto-Normalization
                      </h5>
                      <div className="space-y-3">
                         <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-300">Naming Convention</span>
                            <span className="font-mono text-xs bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">snake_case</span>
                         </div>
                         <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-300">Date Format</span>
                            <span className="font-mono text-xs bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">ISO-8601</span>
                         </div>
                         <div className="flex items-center justify-between text-sm">
                             <span className="text-slate-600 dark:text-slate-300">Deduplication</span>
                             <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Active
                             </div>
                         </div>
                      </div>
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl">
                      <h5 className="font-bold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2 text-sm">
                          <AlertOctagon size={16} /> Incoming Anomalies
                      </h5>
                      <div className="space-y-2">
                          {mockAnomalies.map(a => (
                              <div key={a.id} className="text-xs p-2 bg-white dark:bg-slate-900 rounded border border-amber-100 dark:border-amber-900/50 shadow-sm">
                                  <div className="flex justify-between mb-1">
                                      <span className="font-bold text-slate-700 dark:text-slate-300">{a.type}</span>
                                      <span className="text-slate-400">{a.time}</span>
                                  </div>
                                  <p className="text-slate-600 dark:text-slate-400 leading-tight">{a.desc}</p>
                              </div>
                          ))}
                      </div>
                  </div>
               </div>

               {/* Column 2 & 3: Real-time Activity Log */}
               <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                      <h5 className="font-bold text-slate-900 dark:text-white text-sm">Live Transformation Log</h5>
                      <div className="flex gap-2 text-xs">
                          <span className="px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold">Processed: 1.2M</span>
                          <span className="px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold">Cleaned: 98%</span>
                      </div>
                  </div>
                  <div className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl">
                      <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
                              <tr>
                                  <th className="px-4 py-3">Field Detected</th>
                                  <th className="px-4 py-3">Issue Type</th>
                                  <th className="px-4 py-3">Automated Action</th>
                                  <th className="px-4 py-3 text-right">Count</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {mockCleaningLog.map((log, i) => (
                                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                      <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{log.field}</td>
                                      <td className="px-4 py-3">
                                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                              log.issue.includes('Missing') ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                                              log.issue.includes('Type') ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                              'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                          }`}>
                                              {log.issue}
                                          </span>
                                      </td>
                                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                          <ArrowRight size={12} className="text-slate-400" /> {log.action}
                                      </td>
                                      <td className="px-4 py-3 text-right font-mono text-slate-500">{log.count}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
               </div>
           </div>
       </FeatureCard>

      {/* NEW: Visual Schema Explorer */}
      <FeatureCard title="Visual Schema Explorer" className="col-span-1 md:col-span-2" action={
       <div className="flex gap-2">
          <button 
            onClick={() => setActiveSchemaModel('ubdm')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSchemaModel === 'ubdm' 
                ? 'bg-datova-500 text-white shadow-md shadow-datova-500/20' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            UBDM Core (Target)
          </button>
          <button 
            onClick={() => setActiveSchemaModel('salesforce')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSchemaModel === 'salesforce' 
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Salesforce (Source)
          </button>
       </div>
      }>
        <div className="bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 overflow-x-auto relative">
            <div className="absolute top-4 left-4 flex gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                    Model: {activeSchemaModel === 'ubdm' ? 'Unified Business Data Model' : 'Salesforce CRM Source'}
                </span>
            </div>

            <div className="flex gap-6 min-w-max py-8">
                {mockSchemaData[activeSchemaModel].map((table, i) => (
                    <div key={i} className="w-64 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm flex flex-col transition-transform hover:-translate-y-1 hover:shadow-md">
                        <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-t-xl flex justify-between items-center">
                            <span className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <Database size={14} className={activeSchemaModel === 'ubdm' ? 'text-datova-500' : 'text-blue-500'} />
                                {table.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{table.fields.length} fields</span>
                        </div>
                        <div className="p-3 space-y-2">
                            {table.fields.map((field, j) => (
                                <div key={j} className="flex justify-between items-center text-xs group/field">
                                    <div className="flex items-center gap-2">
                                        {field.key === 'PK' && <Key size={10} className="text-amber-500" />}
                                        {field.key === 'FK' && <Link size={10} className="text-indigo-500" />}
                                        {field.key === 'IDX' && <Search size={10} className="text-emerald-500" />}
                                        <span className={`font-medium transition-colors ${field.key ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 group-hover/field:text-slate-900 dark:group-hover/field:text-slate-200'}`}>
                                            {field.name}
                                        </span>
                                    </div>
                                    <span className="text-slate-400 font-mono text-[10px] opacity-70 group-hover/field:opacity-100">{field.type}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </FeatureCard>

      <FeatureCard title="Data Quality Score" className="col-span-1 md:col-span-2">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 p-2">
          <div className="relative h-32 w-32 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200 dark:text-slate-700" />
              <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-datova-500" strokeDasharray={351} strokeDashoffset={351 - (351 * 0.85)} />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">85</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Excellent</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Validation</h5>
                <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Schema Validated</span>
                </div>
                <p className="text-xs text-slate-500">All incoming records match UBDM v2.4 definitions.</p>
            </div>
            <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Uniqueness</h5>
                <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Deduplicated</span>
                </div>
                <p className="text-xs text-slate-500">99.9% unique customer records identified.</p>
            </div>
            <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Completeness</h5>
                <div className="flex items-center gap-2 mb-1">
                    <Activity size={16} className="text-amber-500" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">3 Anomalies</span>
                </div>
                <p className="text-xs text-slate-500">Missing 'Region' in 23 records from Legacy Sheets.</p>
            </div>
          </div>
        </div>
      </FeatureCard>
    </div>
  );

  const renderAutomationTab = () => (
    <div className="animate-fade-in space-y-6 h-full overflow-y-auto no-scrollbar pb-6">
       {/* KPI Stats Row */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 flex items-center gap-4">
             <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500">
                <GitMerge size={24} />
             </div>
             <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Active Flows</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">14</p>
             </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 flex items-center gap-4">
             <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500">
                <CheckCircle2 size={24} />
             </div>
             <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Success Rate</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">99.8%</p>
             </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 flex items-center gap-4">
             <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-500">
                <Timer size={24} />
             </div>
             <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Time Saved (Mo)</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">420h</p>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Visual Editor */}
          <FeatureCard title="Workflow Orchestrator" className="lg:col-span-2 min-h-[400px]" action={
             <div className="flex gap-2">
                <button className="flex items-center gap-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                   <Play size={12} fill="currentColor" /> Run Test
                </button>
                <button className="flex items-center gap-1 text-xs font-bold bg-datova-500 text-white px-3 py-1.5 rounded-lg hover:bg-datova-600 transition-colors">
                   <Plus size={14} /> New Flow
                </button>
             </div>
          }>
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 relative h-full flex flex-col">
                  <div className="absolute top-4 left-4 flex gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">Active: Lead Enrichment V2</span>
                  </div>
                  
                  {/* Node Graph */}
                  <div className="flex-1 flex items-center justify-center overflow-x-auto py-8">
                      <div className="flex items-center gap-4 min-w-max">
                          {mockWorkflowSteps.map((step, i) => (
                              <React.Fragment key={step.id}>
                                  <div className={`relative w-40 p-4 rounded-xl border-2 flex flex-col items-center text-center gap-3 shadow-sm z-10 transition-all cursor-pointer hover:scale-105 ${
                                      step.status === 'success' ? 'bg-white dark:bg-slate-800 border-emerald-500/50 shadow-emerald-500/10' :
                                      step.status === 'processing' ? 'bg-white dark:bg-slate-800 border-indigo-500 animate-pulse shadow-indigo-500/20' :
                                      'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-70'
                                  }`}>
                                      <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-inner ${
                                          step.type === 'trigger' ? 'bg-amber-100 text-amber-600' :
                                          step.type === 'action' ? 'bg-blue-100 text-blue-600' :
                                          step.type === 'decision' ? 'bg-purple-100 text-purple-600' :
                                          step.type === 'agent' ? 'bg-datova-100 text-datova-600' : 'bg-slate-200'
                                      }`}>
                                          {step.type === 'trigger' ? <Zap size={18}/> : step.type === 'agent' ? <Bot size={18}/> : <Activity size={18}/>}
                                      </div>
                                      <div>
                                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">{step.name}</span>
                                          <span className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">{step.type}</span>
                                      </div>
                                      {step.status === 'processing' && (
                                         <div className="absolute -top-1 -right-1 h-3 w-3 bg-indigo-500 rounded-full border-2 border-white dark:border-slate-900 animate-bounce"></div>
                                      )}
                                  </div>
                                  {i < mockWorkflowSteps.length - 1 && (
                                      <div className="h-0.5 w-12 bg-slate-300 dark:bg-slate-700 shrink-0 relative">
                                         <div className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1/2">
                                            <ArrowRight size={12} className="text-slate-300 dark:text-slate-700" />
                                         </div>
                                      </div>
                                  )}
                              </React.Fragment>
                          ))}
                      </div>
                  </div>

                  {/* Canvas Controls */}
                  <div className="absolute bottom-4 right-4 flex gap-2">
                     <button className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-datova-500 shadow-sm">+</button>
                     <button className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-datova-500 shadow-sm">-</button>
                  </div>
              </div>
          </FeatureCard>

          {/* Agent Fleet */}
          <FeatureCard title="Agent Fleet Health">
              <div className="space-y-6">
                  {agents.map((agent, i) => (
                      <div key={i} className="group animate-fade-in">
                          <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-3">
                                  <div className={`relative h-8 w-8 rounded-lg flex items-center justify-center ${
                                      agent.status === 'busy' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                      agent.status === 'offline' ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500' :
                                      'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                                  }`}>
                                      <Bot size={16} />
                                      {agent.status !== 'offline' && <div className={`absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-900 ${agent.status === 'busy' ? 'bg-indigo-500' : 'bg-emerald-500'}`}></div>}
                                  </div>
                                  <div>
                                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{agent.name}</p>
                                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{agent.role}</p>
                                  </div>
                              </div>
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                  agent.status === 'busy' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30' :
                                  agent.status === 'offline' ? 'bg-slate-100 text-slate-400 dark:bg-slate-800' :
                                  'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                              }`}>{agent.status}</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-500 ${
                                  agent.load > 80 ? 'bg-rose-500' : 
                                  agent.load > 40 ? 'bg-indigo-500' : 'bg-emerald-500'
                              }`} style={{ width: `${agent.load}%` }}></div>
                          </div>
                          <div className="flex justify-between mt-1">
                             <span className="text-[10px] text-slate-400">Load</span>
                             <span className="text-[10px] font-mono text-slate-500">{agent.load}%</span>
                          </div>
                      </div>
                  ))}
                  <button 
                    onClick={handleOpenAgentModal}
                    className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-500 hover:text-datova-500 hover:border-datova-500 transition-all flex items-center justify-center gap-2"
                  >
                      <Plus size={14} /> Deploy New Agent
                  </button>
              </div>
          </FeatureCard>
       </div>

       {/* Execution Log */}
       <FeatureCard title="Execution History">
          <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
                 <thead>
                     <tr className="text-slate-400 border-b border-slate-200 dark:border-slate-800">
                         <th className="pb-3 pl-2 font-medium">Flow Name</th>
                         <th className="pb-3 font-medium">Trigger</th>
                         <th className="pb-3 font-medium">Status</th>
                         <th className="pb-3 font-medium">Duration</th>
                         <th className="pb-3 font-medium text-right pr-2">Time</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                     {[
                        { id: '1', flow: 'Lead Enrichment', trigger: 'HubSpot Webhook', status: 'Running', duration: '2s', time: 'Just now' },
                        { id: '2', flow: 'Invoice Processing', trigger: 'Gmail Attachment', status: 'Success', duration: '45s', time: '5m ago' },
                        { id: '3', flow: 'Weekly Report', trigger: 'Schedule (Cron)', status: 'Success', duration: '12s', time: '1h ago' },
                        { id: '4', flow: 'Slack Notification', trigger: 'System Alert', status: 'Failed', duration: '1s', time: '3h ago' },
                     ].map((row, i) => (
                         <tr key={i} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                             <td className="py-3 pl-2 font-bold text-slate-900 dark:text-white">{row.flow}</td>
                             <td className="py-3 text-slate-500 text-xs flex items-center gap-1">
                                 {row.trigger.includes('Webhook') ? <Zap size={12}/> : row.trigger.includes('Schedule') ? <Timer size={12}/> : <MessageSquare size={12}/>}
                                 {row.trigger}
                             </td>
                             <td className="py-3">
                                 <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                     row.status === 'Success' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                     row.status === 'Running' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 animate-pulse' :
                                     'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                 }`}>
                                     {row.status === 'Success' && <CheckCircle2 size={10} />}
                                     {row.status === 'Failed' && <XCircle size={10} />}
                                     {row.status}
                                 </span>
                             </td>
                             <td className="py-3 text-slate-500 font-mono text-xs">{row.duration}</td>
                             <td className="py-3 text-right pr-2 text-slate-400 text-xs">{row.time}</td>
                         </tr>
                     ))}
                 </tbody>
             </table>
          </div>
       </FeatureCard>
    </div>
  );

  const renderIntelligenceTab = () => (
    <div className="animate-fade-in space-y-6 h-full overflow-y-auto no-scrollbar pb-6">
        {/* Metric Pulse */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Monthly Revenue</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">$124,500</p>
                </div>
                <div className="text-right">
                     <span className="flex items-center gap-1 text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded text-sm mb-1">
                        <TrendingUp size={14} /> +12%
                     </span>
                     <p className="text-[10px] text-slate-400">vs last month</p>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Op Efficiency</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">94.2%</p>
                </div>
                 <div className="text-right">
                     <span className="flex items-center gap-1 text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded text-sm mb-1">
                        <TrendingUp size={14} /> +4%
                     </span>
                     <p className="text-[10px] text-slate-400">vs last month</p>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Cost Per Lead</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">$42.50</p>
                </div>
                 <div className="text-right">
                     <span className="flex items-center gap-1 text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded text-sm mb-1">
                        <TrendingDown size={14} /> -8%
                     </span>
                     <p className="text-[10px] text-slate-400">Lower is better</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <FeatureCard title="Business Metric Forecast" className="lg:col-span-2 min-h-[400px]">
                <div className="h-full w-full">
                    <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={mockMetricData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis dataKey="name" tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                            <YAxis tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                            <Tooltip 
                                contentStyle={{backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff'}}
                                itemStyle={{color: '#fff'}}
                            />
                            <Legend />
                            <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                            <Area type="monotone" dataKey="efficiency" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorEff)" name="Efficiency Index" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </FeatureCard>

            <FeatureCard title="AI Analyst Insights">
                <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                        <div className="flex gap-3">
                            <Sparkles className="text-indigo-500 shrink-0" size={18} />
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Churn Risk Detected</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">Customer segment "Enterprise V1" shows a 15% drop in engagement. Recommend initiating automated check-in campaign.</p>
                            </div>
                        </div>
                        <button className="mt-3 w-full py-1.5 bg-white dark:bg-indigo-900 text-indigo-600 dark:text-indigo-200 text-xs font-bold rounded-lg shadow-sm">View Segment</button>
                    </div>

                     <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                        <div className="flex gap-3">
                            <TrendingUp className="text-emerald-500 shrink-0" size={18} />
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Revenue Forecast</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">Based on current pipeline velocity, Q4 revenue is projected to exceed targets by 8.5%.</p>
                            </div>
                        </div>
                    </div>

                     <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <div className="flex gap-3">
                            <Database className="text-slate-500 shrink-0" size={18} />
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Data Completeness</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">98.5% of lead records now have valid phone numbers thanks to the new cleaning pipeline.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </FeatureCard>
        </div>

        <FeatureCard title="Semantic Layer Definition (Metric Logic)">
            <div className="bg-slate-900 rounded-xl p-6 font-mono text-xs text-slate-300 overflow-x-auto">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
                    <Code2 size={14} className="text-datova-400" />
                    <span className="text-slate-400">models/metrics.yaml</span>
                </div>
                <pre>
{`- name: customer_acquisition_cost
  label: "CAC"
  description: "Total marketing spend divided by new customers acquired"
  type: ratio
  numerator:
    metric: marketing_spend_total
    filter: channel != 'organic'
  denominator:
    metric: new_customers_count
  
- name: net_dollar_retention
  label: "NDR" 
  calculation: |
    (starting_arr + expansion_arr - churned_arr) / starting_arr`}
                </pre>
            </div>
        </FeatureCard>
    </div>
  );

  const renderReliabilityTab = () => (
    <div className="animate-fade-in space-y-6 h-full overflow-y-auto no-scrollbar pb-6">
         {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             {[
                 { name: 'API Gateway', status: 'Operational', uptime: '99.99%' },
                 { name: 'Transformation Engine', status: 'Operational', uptime: '99.95%' },
                 { name: 'Vector DB', status: 'Degraded', uptime: '98.50%' },
                 { name: 'Agent Runtime', status: 'Operational', uptime: '99.90%' }
             ].map((sys, i) => (
                 <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-28">
                     <div className="flex justify-between items-start">
                         <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{sys.name}</span>
                         <div className={`h-2.5 w-2.5 rounded-full ${sys.status === 'Operational' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                     </div>
                     <div>
                         <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                             sys.status === 'Operational' 
                             ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' 
                             : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                         }`}>{sys.status}</span>
                         <p className="text-[10px] text-slate-400 mt-2">Uptime: {sys.uptime}</p>
                     </div>
                 </div>
             ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <FeatureCard title="System Latency (ms)" className="lg:col-span-2">
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={mockLatencyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis dataKey="time" tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                            <YAxis tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff'}} />
                            <Line type="monotone" dataKey="latency" stroke="#f43f5e" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                         </LineChart>
                    </ResponsiveContainer>
                </div>
            </FeatureCard>

            <FeatureCard title="Error Budget (SLO)">
                 <div className="flex flex-col items-center justify-center h-full pb-4">
                     <div className="relative h-40 w-40 flex items-center justify-center mb-4">
                        <svg className="w-full h-full transform -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-emerald-500" strokeDasharray={440} strokeDashoffset={440 - (440 * 0.85)} strokeLinecap="round" />
                        </svg>
                        <div className="absolute text-center">
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">85%</span>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Budget Left</p>
                        </div>
                     </div>
                     <div className="w-full space-y-3">
                         <div className="flex justify-between text-xs">
                             <span className="text-slate-500">Total Requests</span>
                             <span className="font-mono font-bold text-slate-700 dark:text-slate-300">1.4M</span>
                         </div>
                         <div className="flex justify-between text-xs">
                             <span className="text-slate-500">Error Rate</span>
                             <span className="font-mono font-bold text-emerald-500">0.02%</span>
                         </div>
                     </div>
                 </div>
            </FeatureCard>
        </div>

        <FeatureCard title="Self-Healing & Incident Log">
            <div className="space-y-4">
                {mockReliabilityEvents.map((event) => (
                    <div key={event.id} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                         <div className={`p-3 rounded-full h-fit shrink-0 ${
                             event.type === 'info' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20' : 
                             event.type === 'success' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20' : 
                             'bg-amber-100 text-amber-600 dark:bg-amber-900/20'
                         }`}>
                             {event.type === 'info' ? <Siren size={20} /> : event.type === 'success' ? <ShieldCheck size={20} /> : <AlertOctagon size={20} />}
                         </div>
                         <div className="flex-1">
                             <div className="flex justify-between items-start mb-1">
                                 <h5 className="font-bold text-sm text-slate-900 dark:text-white">{event.title}</h5>
                                 <span className="text-xs text-slate-400">{event.time}</span>
                             </div>
                             <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{event.desc}</p>
                         </div>
                    </div>
                ))}
            </div>
        </FeatureCard>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
        {renderConnectModal()}
        {renderAgentModal()}
        
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 shadow-xl shadow-slate-200/50 dark:shadow-black/20">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="bg-gradient-to-tr from-datova-600 to-datova-400 p-2 rounded-lg text-white shadow-lg shadow-datova-500/20">
                    <Database size={20} />
                </div>
                <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">Datova OS</span>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Main Menu</div>
                <NavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={LayoutDashboard} label="Overview" />
                <NavItem active={activeTab === 'foundation'} onClick={() => setActiveTab('foundation')} icon={Database} label="Data Foundation" badge="3 Issues" />
                <NavItem active={activeTab === 'intelligence'} onClick={() => setActiveTab('intelligence')} icon={BarChart3} label="Intelligence" />
                <NavItem active={activeTab === 'automation'} onClick={() => setActiveTab('automation')} icon={Zap} label="Automation" badge="Active" />
                <NavItem active={activeTab === 'reliability'} onClick={() => setActiveTab('reliability')} icon={Shield} label="Reliability" />
                
                <div className="mt-8 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Tools</div>
                <NavItem active={activeTab === 'ai_console'} onClick={() => setActiveTab('ai_console')} icon={MessageSquare} label="AI Console" />
                <NavItem active={false} onClick={() => {}} icon={Settings} label="Settings" />
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <button onClick={onBack} className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm font-bold py-2 transition-colors">
                    <ArrowLeft size={16} /> Exit Demo
                </button>
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 relative">
            {/* Header */}
            <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 z-10">
                 <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
                        {activeTab.replace('_', ' ')}
                    </h2>
                    {activeTab === 'foundation' && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold">
                            <AlertCircle size={12} /> Needs Attention
                        </span>
                    )}
                 </div>

                 <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                         <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                         <span className="text-xs font-bold text-slate-600 dark:text-slate-300">System Operational</span>
                     </div>
                     <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-indigo-500/20">
                         {data.user.name.charAt(0)}
                     </div>
                 </div>
            </header>

            {/* Content Body */}
            <div className="flex-1 overflow-hidden p-8 relative">
                {activeTab === 'overview' && renderOverviewTab()}
                {activeTab === 'foundation' && renderFoundationTab()}
                {activeTab === 'automation' && renderAutomationTab()}
                {activeTab === 'intelligence' && renderIntelligenceTab()}
                {activeTab === 'reliability' && renderReliabilityTab()}
                {activeTab === 'ai_console' && (
                     <div className="h-full flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in">
                         <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {chatMessages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-4 rounded-2xl ${
                                        msg.role === 'user' 
                                        ? 'bg-datova-500 text-white rounded-br-none' 
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                                    }`}>
                                        <p className="text-sm leading-relaxed">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            {isChatTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl rounded-bl-none flex gap-2 items-center">
                                        <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></div>
                                        <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                                        <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef}></div>
                         </div>
                         <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                             <form onSubmit={handleChatSubmit} className="relative">
                                 <input 
                                    type="text" 
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Ask about your data anomalies, revenue trends, or agent status..."
                                    className="w-full pl-6 pr-14 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-datova-500 shadow-sm dark:text-white"
                                 />
                                 <button type="submit" className="absolute right-2 top-2 p-2 bg-datova-500 text-white rounded-lg hover:bg-datova-600 transition-colors">
                                     <Send size={18} />
                                 </button>
                             </form>
                         </div>
                     </div>
                )}
            </div>
            
            {/* Notification Toast */}
            {notification && (
                <div className="fixed bottom-6 right-6 bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-xl shadow-2xl shadow-slate-900/20 border border-slate-800 dark:border-slate-700 flex items-center gap-3 animate-fade-in-up z-[70]">
                    <CheckCircle2 className="text-emerald-500" size={20} />
                    <span className="font-bold text-sm">{notification.message}</span>
                </div>
            )}
        </main>
    </div>
  );
};

export default Dashboard;