import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, LineChart, Line, Legend, PieChart, Pie, Cell } from 'recharts';
import { 
  LayoutDashboard, Database, Zap, Shield, MessageSquare, User, 
  CheckCircle2, AlertCircle, Sparkles, Bot, FileText, Store, 
  Server, Activity, Send, Search, Settings, ArrowLeft, ArrowRight, BarChart3, RefreshCw,
  Plus, X, Cloud, FileSpreadsheet, Globe, HardDrive, Clock,
  Wand2, AlertOctagon, GitMerge, Type, ScanSearch,
  Play, Pause, MoreHorizontal, Cpu, Timer, History, XCircle, Key, Link,
  Brain, Sliders, ShieldCheck, TrendingUp, TrendingDown, Code2, Terminal, Siren, Construction, Lock,
  MousePointer2, Trash2, Move, Save, CornerDownRight, GitBranch, AlertTriangle, Plug, Scale, BookOpen, Eye, FileCheck,
  Binary, Network, ToggleRight
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
  { name: 'Mon', revenue: 4000, efficiency: 2400, cost: 1200, forecast: 4100 },
  { name: 'Tue', revenue: 3000, efficiency: 1398, cost: 1100, forecast: 3200 },
  { name: 'Wed', revenue: 5000, efficiency: 9800, cost: 1150, forecast: 5200 },
  { name: 'Thu', revenue: 4780, efficiency: 3908, cost: 1250, forecast: 5100 },
  { name: 'Fri', revenue: 5890, efficiency: 4800, cost: 1300, forecast: 6300 },
  { name: 'Sat', revenue: 4390, efficiency: 3800, cost: 1100, forecast: 4800 },
  { name: 'Sun', revenue: 6490, efficiency: 4300, cost: 1400, forecast: 7000 },
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

const mockGovernanceRisks = [
  { name: 'Unacceptable Risk', value: 0, color: '#ef4444' },
  { name: 'High Risk', value: 2, color: '#f97316' },
  { name: 'Limited Risk', value: 5, color: '#eab308' },
  { name: 'Minimal Risk', value: 12, color: '#22c55e' },
];

const mockComplianceDocs = [
  { id: '1', name: 'Technical Documentation (Annex IV)', status: 'Ready', type: 'PDF', date: 'Oct 24, 2023' },
  { id: '2', name: 'Conformity Assessment', status: 'Review', type: 'DOCX', date: 'Oct 23, 2023' },
  { id: '3', name: 'EU Database Registration', status: 'Pending', type: 'Form', date: '-' },
  { id: '4', name: 'Bias Audit Report', status: 'Ready', type: 'PDF', date: 'Oct 22, 2023' },
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
    <div className="flex-1 relative">
        {children}
    </div>
  </div>
);

interface Node {
    id: string;
    type: 'trigger' | 'action' | 'decision' | 'agent' | 'db';
    label: string;
    x: number;
    y: number;
}

interface Edge {
    id: string;
    source: string;
    target: string;
    label?: string;
}

interface DashboardProps {
  data: AssessmentData;
  onBack: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onBack }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab | 'governance'>('overview');
  
  // Data State
  const [ingestionData, setIngestionData] = useState(mockIngestionData);

  // Integration Modal State
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectStep, setConnectStep] = useState(1);
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [syncMode, setSyncMode] = useState<'webhook' | 'schedule'>('webhook');
  const [activeSchemaModel, setActiveSchemaModel] = useState<'ubdm' | 'salesforce'>('ubdm');
  const [configForm, setConfigForm] = useState({
      name: '',
      apiKey: '',
      endpoint: ''
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);

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
  
  // Compliance Generator State
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [complianceStep, setComplianceStep] = useState(1);

  // Intelligence Tab State
  const [showForecast, setShowForecast] = useState(false);

  // Schema Explorer State
  const [selectedSchemaTable, setSelectedSchemaTable] = useState<string | null>(null);
  const [schemaSearch, setSchemaSearch] = useState('');

  useEffect(() => {
      if (mockSchemaData[activeSchemaModel]?.length > 0) {
          setSelectedSchemaTable(mockSchemaData[activeSchemaModel][0].name);
      }
  }, [activeSchemaModel]);

  // Agent Fleet State
  const [agents, setAgents] = useState([
      { name: 'Research Agent', role: 'Enrichment', load: 85, status: 'busy' },
      { name: 'Support Agent', role: 'L1 Triage', load: 45, status: 'idle' },
      { name: 'DocuSign Agent', role: 'Ops', load: 12, status: 'idle' },
      { name: 'Data Steward', role: 'Governance', load: 60, status: 'active' }
  ]);

  // Validation Rules State
  const [validationRules, setValidationRules] = useState([
    { id: 1, name: 'Email Format Check', field: 'email', condition: 'Regex Match', value: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$', active: true },
    { id: 2, name: 'Positive Order Value', field: 'total_amount', condition: 'Greater Than', value: '0', active: true },
    { id: 3, name: 'No Future Dates', field: 'created_at', condition: 'Less Than', value: 'NOW()', active: true },
  ]);
  const [validationAlerts, setValidationAlerts] = useState([
      { id: 101, time: '10:42 AM', field: 'total_amount', error: 'Value -250.00 violated "> 0"', status: 'Blocked' },
      { id: 102, time: '10:38 AM', field: 'email', error: 'Invalid format "john.doe"', status: 'Warning' },
  ]);
  const [newRule, setNewRule] = useState({ name: '', field: '', condition: 'Equals', value: '' });
  const [showRuleForm, setShowRuleForm] = useState(false);

  // Workflow Builder State
  const [workflowNodes, setWorkflowNodes] = useState<Node[]>([
    { id: '1', type: 'trigger', label: 'New Lead (HubSpot)', x: 50, y: 150 },
    { id: '2', type: 'action', label: 'Validate Email', x: 280, y: 150 },
    { id: '3', type: 'decision', label: 'Score > 50?', x: 500, y: 150 },
    { id: '4', type: 'agent', label: 'AI Outreach Agent', x: 750, y: 80 },
    { id: '5', type: 'db', label: 'Update CRM', x: 750, y: 250 },
  ]);
  const [workflowEdges, setWorkflowEdges] = useState<Edge[]>([
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
    { id: 'e3-4', source: '3', target: '4', label: 'Yes' },
    { id: 'e3-5', source: '3', target: '5', label: 'No' },
  ]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [linkingSourceId, setLinkingSourceId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string, startX: number, startY: number, initialX: number, initialY: number } | null>(null);

  // Notifications
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // --- Connection Logic ---
  const handleOpenConnect = () => {
    setConnectStep(1);
    setSelectedIntegration(null);
    setConfigForm({ name: '', apiKey: '', endpoint: '' });
    setShowConnectModal(true);
  };

  const handleSelectIntegration = (integration: any) => {
    setSelectedIntegration(integration);
    setConfigForm({ ...configForm, name: `${integration.name} Prod` });
    setConnectStep(2);
  };

  const handleTestConnection = async () => {
      setIsTestingConnection(true);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Mock delay
      setIsTestingConnection(false);
      setNotification({ message: 'Connection verified successfully!', type: 'success' });
  };

  const handleCreatePipeline = () => {
      if (!selectedIntegration) return;
      
      const newSource = {
          source: configForm.name || selectedIntegration.name,
          status: 'Active',
          type: syncMode === 'webhook' ? 'Webhook' : 'API Stream',
          latency: 'Pending',
          records: '0'
      };
      
      setIngestionData(prev => [...prev, newSource]);
      setShowConnectModal(false);
      setNotification({ message: `Pipeline for ${selectedIntegration.name} created successfully.`, type: 'success' });
  };

  // --- Validation Logic ---
  const handleAddRule = () => {
      if(newRule.name && newRule.field) {
          setValidationRules([...validationRules, { ...newRule, id: Date.now(), active: true }]);
          setNewRule({ name: '', field: '', condition: 'Equals', value: '' });
          setShowRuleForm(false);
          setNotification({ message: 'Validation rule added successfully.', type: 'success' });
      }
  };

  const toggleRule = (id: number) => {
      setValidationRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  // --- Workflow Builder Logic ---

  const handleDragStart = (e: React.DragEvent, type: Node['type'], label: string) => {
    e.dataTransfer.setData('nodeType', type);
    e.dataTransfer.setData('nodeLabel', label);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!canvasRef.current) return;

    const type = e.dataTransfer.getData('nodeType') as Node['type'];
    const label = e.dataTransfer.getData('nodeLabel');
    
    if (type) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - 80; // Center offset
        const y = e.clientY - rect.top - 30;

        const newNode: Node = {
            id: `n-${Date.now()}`,
            type,
            label,
            x,
            y
        };
        setWorkflowNodes(prev => [...prev, newNode]);
    }
  };

  const handleNodeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (linkingSourceId) {
        // We are connecting nodes
        if (linkingSourceId !== id) {
            // Check if edge exists
            const exists = workflowEdges.find(edge => edge.source === linkingSourceId && edge.target === id);
            if (!exists) {
                setWorkflowEdges(prev => [...prev, {
                    id: `e-${Date.now()}`,
                    source: linkingSourceId,
                    target: id
                }]);
                setNotification({ message: 'Nodes connected successfully', type: 'success' });
            }
        }
        setLinkingSourceId(null);
        return;
    }

    // Normal Selection / Dragging
    setSelectedNodeId(id);
    const node = workflowNodes.find(n => n.id === id);
    if (node) {
        dragRef.current = {
            id,
            startX: e.clientX,
            startY: e.clientY,
            initialX: node.x,
            initialY: node.y
        };
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragRef.current) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        
        setWorkflowNodes(prev => prev.map(n => {
            if (n.id === dragRef.current?.id) {
                return {
                    ...n,
                    x: dragRef.current.initialX + dx,
                    y: dragRef.current.initialY + dy
                };
            }
            return n;
        }));
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const deleteSelected = () => {
      if (selectedNodeId) {
          setWorkflowNodes(prev => prev.filter(n => n.id !== selectedNodeId));
          setWorkflowEdges(prev => prev.filter(e => e.source !== selectedNodeId && e.target !== selectedNodeId));
          setSelectedNodeId(null);
      }
  };

  const startLinking = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setLinkingSourceId(id);
      setNotification({ message: 'Select a target node to connect', type: 'info' });
  };

  // --- End Workflow Builder Logic ---

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
        'analyst': 'Reporting',
        'steward': 'Governance'
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
        { id: 'analyst', name: 'Data Analyst', icon: BarChart3, desc: 'Generates reports and finds insights.' },
        { id: 'steward', name: 'Data Steward', icon: ShieldCheck, desc: 'Enforces governance, monitors quality & compliance.' }
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {agentTypes.map(type => (
                                    <button 
                                        key={type.id}
                                        onClick={() => {
                                            setAgentConfig({
                                                ...agentConfig, 
                                                role: type.id,
                                                // Auto-configure capabilities for Data Steward
                                                capabilities: type.id === 'steward' 
                                                    ? { read: true, write: false, humanApproval: true } 
                                                    : agentConfig.capabilities
                                            });
                                        }}
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
                                    placeholder={agentConfig.role === 'steward' ? "e.g., Compliance Auditor" : "e.g., EU Support Lead"}
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

                                <div className={`flex items-center justify-between p-4 rounded-xl border ${agentConfig.role === 'steward' ? 'border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800' : 'border-slate-200 dark:border-slate-700'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${agentConfig.role === 'steward' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30'}`}>
                                            {agentConfig.role === 'steward' ? <Lock size={18} /> : <Zap size={18}/>}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-900 dark:text-white">Write Access</div>
                                            <div className="text-xs text-slate-500">
                                                {agentConfig.role === 'steward' ? 'Restricted for Governance Roles' : 'Can modify database records'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${agentConfig.capabilities.write ? 'bg-datova-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${agentConfig.capabilities.write ? 'translate-x-6' : 'translate-x-1'}`}/>
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

  const renderComplianceModal = () => {
    if (!showComplianceModal) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowComplianceModal(false)}></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-fade-in-up flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500 rounded-lg text-white">
                            <FileCheck size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Compliance Generator</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">EU AI Act • ISO 42001 • GDPR</p>
                        </div>
                    </div>
                    <button onClick={() => setShowComplianceModal(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"><X size={20}/></button>
                </div>

                {/* Body */}
                <div className="flex-1 p-8 overflow-y-auto">
                    {/* Stepper */}
                    <div className="flex items-center justify-between mb-8 px-12">
                        {[
                            { id: 1, label: 'Evidence Collection' },
                            { id: 2, label: 'Traceability Check' },
                            { id: 3, label: 'Document Generation' }
                        ].map((s, i) => (
                            <React.Fragment key={s.id}>
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                        complianceStep >= s.id ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                                    }`}>
                                        {complianceStep > s.id ? <CheckCircle2 size={16} /> : s.id}
                                    </div>
                                    <span className={`text-xs font-bold ${complianceStep >= s.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>{s.label}</span>
                                </div>
                                {i < 2 && <div className={`flex-1 h-0.5 mx-4 ${complianceStep > s.id ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}></div>}
                            </React.Fragment>
                        ))}
                    </div>

                    {complianceStep === 1 && (
                        <div className="space-y-6 animate-fade-in">
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Pulling Audit Evidence</h4>
                            <p className="text-sm text-slate-500">Connecting to development platforms to gather raw evidence for Annex IV technical documentation.</p>
                            
                            <div className="space-y-4 mt-4">
                                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg"><GitBranch size={20} className="text-slate-600 dark:text-slate-400"/></div>
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white">Version Control (GitHub)</div>
                                            <div className="text-xs text-slate-500">Scanning commit history & releases...</div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1"><RefreshCw size={12} className="animate-spin"/> Syncing</span>
                                </div>
                                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg"><Database size={20} className="text-slate-600 dark:text-slate-400"/></div>
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white">Data Lineage (Warehouse)</div>
                                            <div className="text-xs text-slate-500">Verifying training data checksums...</div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1"><RefreshCw size={12} className="animate-spin"/> Verifying</span>
                                </div>
                                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg"><Shield size={20} className="text-slate-600 dark:text-slate-400"/></div>
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white">Risk Logs (Jira)</div>
                                            <div className="text-xs text-slate-500">Importing mitigation tickets...</div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-400">Waiting</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {complianceStep === 2 && (
                        <div className="space-y-6 animate-fade-in">
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Traceability Verification</h4>
                            <p className="text-sm text-slate-500">Verify the lineage from training data to deployment. This form maps directly to Section 2.3 of the Technical Documentation.</p>

                            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-8 relative">
                                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-700 -z-0"></div>
                                    
                                    <div className="relative z-10 flex flex-col items-center gap-2 bg-slate-50 dark:bg-slate-900 px-2">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                                            <Database size={20} />
                                        </div>
                                        <span className="text-xs font-bold">Training Data</span>
                                    </div>
                                    
                                    <div className="relative z-10 flex flex-col items-center gap-2 bg-slate-50 dark:bg-slate-900 px-2">
                                        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center border border-purple-200 dark:border-purple-800">
                                            <Brain size={20} />
                                        </div>
                                        <span className="text-xs font-bold">Model Training</span>
                                    </div>

                                    <div className="relative z-10 flex flex-col items-center gap-2 bg-slate-50 dark:bg-slate-900 px-2">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                                            <CheckCircle2 size={20} />
                                        </div>
                                        <span className="text-xs font-bold">Validation</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer">
                                        <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 text-datova-500 rounded border-slate-300 focus:ring-datova-500" />
                                        <div>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white block">Confirm Dataset Integrity</span>
                                            <span className="text-xs text-slate-500">Hash: e7a...89b matches sourcing logs. No PII detected.</span>
                                        </div>
                                    </label>
                                    <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer">
                                        <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 text-datova-500 rounded border-slate-300 focus:ring-datova-500" />
                                        <div>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white block">Verify Bias Testing</span>
                                            <span className="text-xs text-slate-500">Test Suite #492 passed. Gender/Race variance &lt; 2%.</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {complianceStep === 3 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="text-center py-8">
                                <div className="inline-block p-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 mb-4 animate-bounce">
                                    <FileCheck size={48} />
                                </div>
                                <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Audit Ready</h4>
                                <p className="text-slate-500 dark:text-slate-400 mb-8">All documentation has been compiled, signed, and encrypted.</p>
                                
                                <div className="max-w-lg mx-auto space-y-3 text-left">
                                    <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <FileText className="text-datova-500" size={20} />
                                            <div>
                                                <div className="text-sm font-bold text-slate-900 dark:text-white">Technical Documentation (Annex IV)</div>
                                                <div className="text-[10px] text-slate-500">PDF • 2.4 MB • Generated just now</div>
                                            </div>
                                        </div>
                                        <button className="text-xs font-bold text-datova-600 hover:underline">Download</button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <FileText className="text-datova-500" size={20} />
                                            <div>
                                                <div className="text-sm font-bold text-slate-900 dark:text-white">Conformity Assessment Declaration</div>
                                                <div className="text-[10px] text-slate-500">PDF • 0.8 MB • Signed</div>
                                            </div>
                                        </div>
                                        <button className="text-xs font-bold text-datova-600 hover:underline">Download</button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <Server className="text-datova-500" size={20} />
                                            <div>
                                                <div className="text-sm font-bold text-slate-900 dark:text-white">EU Database Registration (XML)</div>
                                                <div className="text-[10px] text-slate-500">XML • Ready for Upload</div>
                                            </div>
                                        </div>
                                        <button className="text-xs font-bold text-datova-600 hover:underline">Download</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-between shrink-0">
                    <button 
                        onClick={() => {
                            if (complianceStep === 1) setShowComplianceModal(false);
                            else setComplianceStep(prev => prev - 1);
                        }}
                        className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                    >
                        {complianceStep === 1 ? 'Cancel' : 'Back'}
                    </button>
                    <button 
                        onClick={() => {
                            if (complianceStep < 3) {
                                setComplianceStep(prev => prev + 1);
                            } else {
                                setShowComplianceModal(false);
                                setComplianceStep(1);
                            }
                        }}
                        className="px-8 py-3 bg-datova-500 hover:bg-datova-600 text-white rounded-xl font-bold shadow-lg shadow-datova-500/20 transition-all"
                    >
                        {complianceStep === 1 ? 'Proceed to Traceability' : complianceStep === 2 ? 'Generate Documents' : 'Finish'}
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
                   <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-slate-900 dark:text-white">Pipeline Settings</h4>
                        <div className="flex items-center gap-2 text-xs text-datova-600 bg-datova-100 dark:bg-datova-900/30 px-2 py-1 rounded-lg">
                            <Plug size={12} /> API Integration
                        </div>
                   </div>
                   
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
                           Batch processing (API polling) at set intervals. Best for Reporting and Large datasets.
                         </p>
                      </button>
                   </div>

                   {/* Conditional Fields based on Source */}
                   <div className="mt-6 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Connection Name</label>
                        <input 
                            type="text" 
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-datova-500 dark:text-white" 
                            value={configForm.name}
                            onChange={(e) => setConfigForm({...configForm, name: e.target.value})}
                        />
                      </div>
                      
                      {selectedIntegration?.id === 'hubspot' || selectedIntegration?.id === 'salesforce' ? (
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                {selectedIntegration.id === 'hubspot' ? 'Private App Access Token' : 'OAuth Client ID'}
                            </label>
                            <input 
                                type="password" 
                                placeholder="••••••••••••••••" 
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-datova-500 dark:text-white" 
                                value={configForm.apiKey}
                                onChange={(e) => setConfigForm({...configForm, apiKey: e.target.value})}
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                                {selectedIntegration.id === 'hubspot' ? 'Found in HubSpot Settings > Integrations > Private Apps.' : 'Found in Salesforce Setup > App Manager.'}
                            </p>
                          </div>
                      ) : selectedIntegration?.id === 'notion' || selectedIntegration?.id === 'airtable' ? (
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Integration Token</label>
                            <input 
                                type="password" 
                                placeholder="secret_..." 
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-datova-500 dark:text-white"
                                value={configForm.apiKey}
                                onChange={(e) => setConfigForm({...configForm, apiKey: e.target.value})} 
                            />
                          </div>
                      ) : selectedIntegration?.id === 'csv' ? (
                         <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center bg-slate-50 dark:bg-slate-900">
                            <FileSpreadsheet className="mx-auto text-slate-400 mb-2" size={32} />
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Drag and drop CSV/Excel here</p>
                            <p className="text-xs text-slate-400 mt-1">or click to browse</p>
                         </div>
                      ) : (
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">API Key / Connection String</label>
                            <input 
                                type="password" 
                                placeholder="••••••••••••••••" 
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-datova-500 dark:text-white"
                                value={configForm.apiKey}
                                onChange={(e) => setConfigForm({...configForm, apiKey: e.target.value})}
                            />
                         </div>
                      )}

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
                      
                      {selectedIntegration?.id !== 'csv' && (
                          <div className="flex justify-end mt-2">
                              <button 
                                onClick={handleTestConnection}
                                disabled={isTestingConnection}
                                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors disabled:opacity-50"
                              >
                                  {isTestingConnection ? <RefreshCw size={12} className="animate-spin"/> : <CheckCircle2 size={12} />}
                                  {isTestingConnection ? 'Verifying...' : 'Test Connection'}
                              </button>
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
               <button onClick={handleCreatePipeline} className="px-8 py-3 bg-datova-500 hover:bg-datova-600 text-white rounded-xl font-bold shadow-lg shadow-datova-500/20 transition-all">
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
              {ingestionData.map((row, i) => (
                <tr key={i} className="group hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                     <div className="p-1 rounded bg-slate-100 dark:bg-slate-800">
                        {row.source.includes('Salesforce') ? <Cloud size={14}/> : 
                         row.source.includes('Shopify') ? <Store size={14}/> :
                         row.source.includes('HubSpot') ? <Database size={14}/> :
                         row.source.includes('Notion') ? <FileText size={14}/> :
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

      {/* NEW MODULE: Data Cleaning & Standardization Studio */}
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

       {/* NEW: Data Validation & Quality Rules */}
       <FeatureCard title="Data Validation & Quality Rules" className="col-span-1 md:col-span-2">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Rules List */}
              <div>
                 <div className="flex justify-between items-center mb-4">
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">Active Rules</h5>
                    <button onClick={() => setShowRuleForm(!showRuleForm)} className="text-xs flex items-center gap-1 bg-datova-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-datova-600 transition shadow-sm">
                       <Plus size={14} /> Add Rule
                    </button>
                 </div>
                 
                 {/* New Rule Form */}
                 {showRuleForm && (
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl mb-4 text-xs animate-fade-in border border-slate-200 dark:border-slate-700">
                       <div className="grid grid-cols-2 gap-3 mb-3">
                           <div>
                               <label className="block text-slate-500 mb-1">Rule Name</label>
                               <input type="text" className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white" value={newRule.name} onChange={e => setNewRule({...newRule, name: e.target.value})} placeholder="e.g. Email Check" />
                           </div>
                           <div>
                               <label className="block text-slate-500 mb-1">Field</label>
                               <input type="text" className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white" value={newRule.field} onChange={e => setNewRule({...newRule, field: e.target.value})} placeholder="e.g. email" />
                           </div>
                           <div>
                               <label className="block text-slate-500 mb-1">Condition</label>
                               <select className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white" value={newRule.condition} onChange={e => setNewRule({...newRule, condition: e.target.value})}>
                                   <option>Equals</option>
                                   <option>Greater Than</option>
                                   <option>Less Than</option>
                                   <option>Regex Match</option>
                               </select>
                           </div>
                           <div>
                               <label className="block text-slate-500 mb-1">Value</label>
                               <input type="text" className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white" value={newRule.value} onChange={e => setNewRule({...newRule, value: e.target.value})} placeholder="Value" />
                           </div>
                       </div>
                       <div className="flex justify-end gap-2">
                           <button onClick={() => setShowRuleForm(false)} className="px-3 py-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Cancel</button>
                           <button onClick={handleAddRule} className="px-3 py-1.5 bg-datova-500 text-white rounded-lg font-bold hover:bg-datova-600">Save Rule</button>
                       </div>
                    </div>
                 )}

                 <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {validationRules.map(rule => (
                       <div key={rule.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl transition-all hover:border-datova-300 dark:hover:border-datova-700">
                          <div>
                             <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">{rule.name}</div>
                             <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                <span className="text-indigo-500">{rule.field}</span> <span className="text-slate-400">{rule.condition}</span> <span className="text-emerald-600 dark:text-emerald-400">{rule.value}</span>
                             </div>
                          </div>
                          <div onClick={() => toggleRule(rule.id)} className={`w-9 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${rule.active ? 'bg-datova-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                             <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${rule.active ? 'translate-x-4' : 'translate-x-0'}`}></div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Real-time Alerts */}
              <div>
                 <h5 className="font-bold text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                    <Siren size={16} className="text-rose-500 animate-pulse" /> Real-time Quality Alerts
                 </h5>
                 <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {validationAlerts.map(alert => (
                       <div key={alert.id} className="flex gap-3 p-3 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-xl">
                          <div className="mt-0.5 p-1 bg-white dark:bg-rose-950 rounded-full h-fit"><XCircle size={14} className="text-rose-500"/></div>
                          <div className="flex-1">
                             <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-slate-900 dark:text-white text-xs font-mono">{alert.field}</span>
                                <span className="text-[10px] text-slate-400">{alert.time}</span>
                             </div>
                             <p className="text-xs text-rose-700 dark:text-rose-300 leading-tight mb-2">{alert.error}</p>
                             <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                 alert.status === 'Blocked' 
                                 ? 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800' 
                                 : 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800'
                             }`}>
                                {alert.status}
                             </span>
                          </div>
                       </div>
                    ))}
                    <div className="text-center pt-2">
                        <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                            <Activity size={10} /> Live Monitoring Active
                        </span>
                    </div>
                 </div>
              </div>
           </div>
       </FeatureCard>

      {/* NEW: Visual Schema Explorer (Upgraded) */}
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col md:flex-row h-[500px]">
            {/* Sidebar List */}
            <div className="w-full md:w-1/3 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                            type="text" 
                            placeholder="Search entities..." 
                            value={schemaSearch}
                            onChange={(e) => setSchemaSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-datova-500 dark:text-white"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {mockSchemaData[activeSchemaModel]
                        .filter(t => t.name.toLowerCase().includes(schemaSearch.toLowerCase()))
                        .map((table) => (
                        <button
                            key={table.name}
                            onClick={() => setSelectedSchemaTable(table.name)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-all ${
                                selectedSchemaTable === table.name
                                ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-datova-600 dark:text-datova-400 font-bold'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Database size={14} className={selectedSchemaTable === table.name ? 'text-datova-500' : 'text-slate-400'} />
                                {table.name}
                            </div>
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-slate-400">
                                {table.fields.length}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Details Pane */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
                {selectedSchemaTable && (() => {
                    const table = mockSchemaData[activeSchemaModel].find(t => t.name === selectedSchemaTable);
                    if (!table) return null;
                    return (
                        <>
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        {table.name}
                                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-normal text-slate-500 border border-slate-200 dark:border-slate-700">Table</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {activeSchemaModel === 'ubdm' 
                                            ? 'Canonical entity for business domain.' 
                                            : 'Raw ingestion table from source system.'}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors" title="View Data Sample">
                                        <FileText size={16} />
                                    </button>
                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors" title="Settings">
                                        <Settings size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-0">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 border-b border-slate-100 dark:border-slate-800 sticky top-0">
                                        <tr>
                                            <th className="px-6 py-3 font-medium text-xs uppercase tracking-wider">Field Name</th>
                                            <th className="px-6 py-3 font-medium text-xs uppercase tracking-wider">Data Type</th>
                                            <th className="px-6 py-3 font-medium text-xs uppercase tracking-wider">Attributes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {table.fields.map((field, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                                <td className="px-6 py-3 font-mono text-xs text-slate-700 dark:text-slate-300 font-medium">
                                                    {field.name}
                                                </td>
                                                <td className="px-6 py-3 text-slate-500 text-xs">
                                                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                                                        {field.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex gap-2">
                                                        {field.key === 'PK' && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                                                <Key size={10} /> PK
                                                            </span>
                                                        )}
                                                        {field.key === 'FK' && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                                                <Link size={10} /> FK
                                                            </span>
                                                        )}
                                                        {field.key === 'IDX' && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                                <Search size={10} /> IDX
                                                            </span>
                                                        )}
                                                        {!field.key && <span className="text-slate-300 dark:text-slate-600 text-[10px]">-</span>}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    );
                })()}
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

  const renderOverviewTab = () => (
    <div className="animate-fade-in grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <FeatureCard title="Executive AI Analysis">
          <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
             {data.report ? (
                <div className="space-y-4">
                  {renderFormattedText(data.report)}
                </div>
             ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                   <div className="animate-spin mb-4"><RefreshCw size={24}/></div>
                   <p>Analyzing data points...</p>
                </div>
             )}
          </div>
        </FeatureCard>
        
        <div className="grid grid-cols-2 gap-4">
             <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-[1.5rem] border border-indigo-100 dark:border-indigo-800">
                <h3 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mb-1">Reactive</h3>
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Current Phase</p>
             </div>
             <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-[1.5rem] border border-emerald-100 dark:border-emerald-800">
                <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mb-1">Defined</h3>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Target Phase (3mo)</p>
             </div>
        </div>
      </div>

      <div className="md:col-span-1">
        <FeatureCard title="Maturity Radar" className="h-full min-h-[300px]">
          <div className="h-full w-full flex items-center justify-center">
             <ResponsiveContainer width="100%" height={300}>
               <RadarChart cx="50%" cy="50%" outerRadius="70%" data={getRadarData()}>
                 <PolarGrid stroke="#e2e8f0" />
                 <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                 <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                 <Radar
                   name="You"
                   dataKey="A"
                   stroke="#6366f1"
                   strokeWidth={3}
                   fill="#6366f1"
                   fillOpacity={0.2}
                 />
                 <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#6366f1', fontWeight: 'bold' }}
                 />
               </RadarChart>
             </ResponsiveContainer>
          </div>
        </FeatureCard>
      </div>
    </div>
  );

  const renderIntelligenceTab = () => (
    <div className="animate-fade-in space-y-6 h-full pb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard title="ROI & Value Measurement" className="md:col-span-2" action={
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Forecasting</span>
                    <button 
                        onClick={() => setShowForecast(!showForecast)}
                        className={`w-10 h-5 rounded-full p-0.5 transition-colors ${showForecast ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${showForecast ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </button>
                </div>
            }>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={mockMetricData}>
                        <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <Tooltip contentStyle={{ borderRadius: '12px' }} />
                        <Area type="monotone" dataKey="revenue" name="Actual Revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                        <Area type="monotone" dataKey="cost" name="Cost" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
                        {showForecast && (
                            <Line type="monotone" dataKey="forecast" name="Projected Revenue" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                        )}
                    </AreaChart>
                </ResponsiveContainer>
                {showForecast && (
                    <div className="absolute top-20 right-8 bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg border border-indigo-100 dark:border-indigo-800 text-xs text-indigo-600 dark:text-indigo-300 font-bold animate-fade-in">
                        +18% projected growth with automation
                    </div>
                )}
            </FeatureCard>
            
            <FeatureCard title="Efficiency Gain">
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockMetricData}>
                        <XAxis dataKey="name" hide />
                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px' }} />
                        <Bar dataKey="efficiency" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
            </FeatureCard>
        </div>

        {/* Module 5: Intelligence Layer (Context Encoding) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FeatureCard title="Semantic Layer Definition (UBDM)">
                <div className="space-y-4">
                    <p className="text-xs text-slate-500 mb-2">Encode business logic to prevent AI hallucination and logic drift.</p>
                    <div className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-4 py-2">Business Term</th>
                                    <th className="px-4 py-2">Formal Definition (SQL/Logic)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">Active Customer</td>
                                    <td className="px-4 py-3 font-mono text-xs text-slate-500">orders &gt; 0 AND last_login &lt; 30_days</td>
                                </tr>
                                <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">Churn Risk</td>
                                    <td className="px-4 py-3 font-mono text-xs text-slate-500">usage_drop &gt; 20% OR support_tickets &gt; 3</td>
                                </tr>
                                <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">Gross Revenue</td>
                                    <td className="px-4 py-3 font-mono text-xs text-slate-500">sum(order_total) - sum(refunds) - sum(tax)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <button className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                        <Plus size={14} /> Add Definition
                    </button>
                </div>
            </FeatureCard>

            <FeatureCard title="Decision Context Engine">
                <div className="space-y-4">
                    <p className="text-xs text-slate-500 mb-2">Define autonomous boundaries. What can the AI decide without a human?</p>
                    
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-white dark:bg-emerald-950 rounded-lg text-emerald-600"><CheckCircle2 size={16}/></div>
                                <div>
                                    <div className="text-sm font-bold text-slate-900 dark:text-white">Auto-Refund Approval</div>
                                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">IF amount &lt; $50 AND fraud_score &lt; 10</div>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-emerald-950 text-emerald-600 px-2 py-1 rounded">Autonomous</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-white dark:bg-emerald-950 rounded-lg text-emerald-600"><CheckCircle2 size={16}/></div>
                                <div>
                                    <div className="text-sm font-bold text-slate-900 dark:text-white">L1 Support Response</div>
                                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">IF confidence &gt; 95% AND sentiment != 'angry'</div>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-emerald-950 text-emerald-600 px-2 py-1 rounded">Autonomous</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-white dark:bg-amber-950 rounded-lg text-amber-600"><User size={16}/></div>
                                <div>
                                    <div className="text-sm font-bold text-slate-900 dark:text-white">Contract Generation</div>
                                    <div className="text-xs text-amber-600 dark:text-amber-400 font-mono">ALWAYS require approval</div>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-amber-950 text-amber-600 px-2 py-1 rounded">Human Loop</span>
                        </div>
                    </div>
                </div>
            </FeatureCard>
        </div>
    </div>
  );

  const renderAutomationTab = () => (
    <div className="animate-fade-in h-full flex flex-col gap-6">
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {agents.map((agent, i) => (
               <div key={i} className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                   <div className={`p-3 rounded-xl ${agent.status === 'busy' ? 'bg-amber-100 text-amber-600' : agent.status === 'offline' ? 'bg-slate-100 text-slate-400' : 'bg-emerald-100 text-emerald-600'}`}>
                       {agent.role === 'Governance' ? <ShieldCheck size={20} /> : <Bot size={20} />}
                   </div>
                   <div>
                       <div className="font-bold text-sm text-slate-900 dark:text-white">{agent.name}</div>
                       <div className="text-xs text-slate-500">{agent.role}</div>
                   </div>
                   <div className="ml-auto text-xs font-bold text-slate-400">{agent.load}%</div>
               </div>
           ))}
           <button onClick={handleOpenAgentModal} className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:text-datova-500 hover:border-datova-300 transition-colors p-4">
               <Plus size={24} className="mb-1" />
               <span className="text-xs font-bold">Deploy Agent</span>
           </button>
       </div>

       <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 relative overflow-hidden flex flex-col md:flex-row">
           {/* Canvas Sidebar */}
           <div className="w-full md:w-48 bg-white dark:bg-slate-850 border-r border-slate-200 dark:border-slate-800 p-4 z-10">
               <h5 className="text-xs font-bold uppercase text-slate-400 mb-4">Workflow Nodes</h5>
               <div className="space-y-2">
                   {['trigger', 'action', 'decision', 'agent', 'db'].map(type => (
                       <div 
                           key={type}
                           draggable
                           onDragStart={(e) => handleDragStart(e, type as any, type.charAt(0).toUpperCase() + type.slice(1))}
                           className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-move hover:shadow-md transition-shadow flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300"
                       >
                           <div className={`w-2 h-2 rounded-full ${
                               type === 'trigger' ? 'bg-emerald-500' : 
                               type === 'decision' ? 'bg-amber-500' : 
                               type === 'agent' ? 'bg-indigo-500' : 'bg-slate-500'
                           }`}></div>
                           {type.charAt(0).toUpperCase() + type.slice(1)}
                       </div>
                   ))}
               </div>
               <div className="mt-8">
                   <p className="text-xs text-slate-400 text-center">Drag nodes to canvas</p>
               </div>
           </div>

           {/* Canvas Area */}
           <div 
               ref={canvasRef}
               className="flex-1 relative bg-grid-slate-200 dark:bg-grid-slate-800/20"
               onDrop={handleDrop}
               onDragOver={e => e.preventDefault()}
               onClick={() => { setSelectedNodeId(null); setLinkingSourceId(null); }}
           >
               {/* Edges Layer */}
               <svg className="absolute inset-0 pointer-events-none overflow-visible w-full h-full z-0">
                   {workflowEdges.map(edge => {
                       const source = workflowNodes.find(n => n.id === edge.source);
                       const target = workflowNodes.find(n => n.id === edge.target);
                       if(!source || !target) return null;
                       return (
                           <g key={edge.id}>
                               <path 
                                   d={`M ${source.x + 160} ${source.y + 28} C ${source.x + 200} ${source.y + 28}, ${target.x - 40} ${target.y + 28}, ${target.x} ${target.y + 28}`} 
                                   stroke="#94a3b8" 
                                   strokeWidth="2" 
                                   fill="none" 
                               />
                               {edge.label && (
                                   <text x={(source.x + target.x)/2 + 60} y={(source.y + target.y)/2 + 20} className="text-xs fill-slate-500 font-bold bg-white">{edge.label}</text>
                               )}
                           </g>
                       )
                   })}
                   {linkingSourceId && (
                       <defs>
                           <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
                               <path d="M0,0 L0,6 L9,3 z" fill="#cbd5e1" />
                           </marker>
                       </defs>
                   )}
               </svg>

               {/* Nodes Layer */}
               {workflowNodes.map(node => (
                   <div 
                       key={node.id}
                       style={{ left: node.x, top: node.y }}
                       className={`absolute w-40 bg-white dark:bg-slate-800 p-3 rounded-xl border-2 shadow-lg cursor-grab active:cursor-grabbing z-10 group ${
                           selectedNodeId === node.id ? 'border-datova-500 ring-2 ring-datova-500/20' : 'border-slate-200 dark:border-slate-700'
                       }`}
                       onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                   >
                       <div className="flex items-center gap-2 mb-1">
                           <div className={`p-1.5 rounded-lg text-white ${
                               node.type === 'trigger' ? 'bg-emerald-500' : 
                               node.type === 'decision' ? 'bg-amber-500' : 
                               node.type === 'agent' ? 'bg-indigo-500' : 'bg-slate-500'
                           }`}>
                               {node.type === 'agent' ? <Bot size={12}/> : <Activity size={12}/>}
                           </div>
                           <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{node.type}</span>
                       </div>
                       <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{node.label}</div>

                       {/* Connector Handle */}
                       <div 
                           className={`absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-full flex items-center justify-center cursor-crosshair hover:scale-110 hover:border-datova-500 transition-all ${linkingSourceId === node.id ? 'bg-datova-500 border-datova-500' : ''}`}
                           onClick={(e) => startLinking(e, node.id)}
                           title="Link Node"
                       >
                           <Plus size={10} className={linkingSourceId === node.id ? 'text-white' : 'text-slate-400'} />
                       </div>
                       
                       {selectedNodeId === node.id && (
                           <button onClick={deleteSelected} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-md hover:scale-110 transition-transform">
                               <X size={10} />
                           </button>
                       )}
                   </div>
               ))}
           </div>
       </div>
    </div>
  );

  const renderGovernanceTab = () => (
    <div className="animate-fade-in space-y-6 h-full pb-6">
        {/* Top KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Compliance Score</span>
                    <span className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg"><Scale size={16} /></span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">92%</div>
                <div className="text-[10px] text-slate-400 mt-1">Ready for EU AI Act</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Risk Assessment</span>
                    <span className="p-1.5 bg-amber-100 text-amber-600 rounded-lg"><AlertTriangle size={16} /></span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">2 High</div>
                <div className="text-[10px] text-slate-400 mt-1">System Tiers Identified</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Docs Generated</span>
                    <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><FileText size={16} /></span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">14/16</div>
                <div className="text-[10px] text-slate-400 mt-1">Audit-ready artifacts</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Human Oversight</span>
                    <span className="p-1.5 bg-purple-100 text-purple-600 rounded-lg"><Eye size={16} /></span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">Active</div>
                <div className="text-[10px] text-slate-400 mt-1">Post-market monitoring</div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Risk Assessment Tools */}
            <FeatureCard title="EU AI Act Risk Classification" className="lg:col-span-1">
                <div className="h-64 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={mockGovernanceRisks}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {mockGovernanceRisks.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '12px' }} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center -mt-4">
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">19</div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Systems</div>
                    </div>
                </div>
                <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-xl flex gap-3 items-start">
                    <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={16} />
                    <div>
                        <div className="text-xs font-bold text-rose-700 dark:text-rose-300">Action Required</div>
                        <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1">2 systems flagged as "High Risk" require immediate Conformity Assessment updates.</p>
                    </div>
                </div>
            </FeatureCard>

            {/* Compliance Documentation */}
            <FeatureCard title="Automated Compliance Docs" className="lg:col-span-2">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="text-slate-400 border-b border-slate-200 dark:border-slate-800">
                                <th className="pb-3 font-medium">Document Name</th>
                                <th className="pb-3 font-medium">Status</th>
                                <th className="pb-3 font-medium">Last Updated</th>
                                <th className="pb-3 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {mockComplianceDocs.map((doc) => (
                                <tr key={doc.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="py-3 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                        <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">
                                            {doc.type === 'PDF' ? <FileText size={14} /> : <FileCheck size={14} />}
                                        </div>
                                        {doc.name}
                                    </td>
                                    <td className="py-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                            doc.status === 'Ready' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' :
                                            doc.status === 'Review' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' :
                                            'bg-slate-100 text-slate-500 dark:bg-slate-800'
                                        }`}>
                                            {doc.status}
                                        </span>
                                    </td>
                                    <td className="py-3 text-slate-500 text-xs">{doc.date}</td>
                                    <td className="py-3 text-right">
                                        <button className="text-xs font-bold text-datova-500 hover:underline">Download</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 flex gap-2">
                    <button 
                        onClick={() => {
                            setComplianceStep(1);
                            setShowComplianceModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
                    >
                        <RefreshCw size={14} /> Generate All Artifacts
                    </button>
                </div>
            </FeatureCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Post-Market Monitoring */}
            <FeatureCard title="Post-Market Monitoring & Oversight">
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Model Accuracy Drift</span>
                                <span className="text-xs font-mono text-emerald-500">-0.2%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[98%]"></div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Bias Detection (Gender)</span>
                                <span className="text-xs font-mono text-amber-500">1.4%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 w-[12%]"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        <h5 className="text-xs font-bold text-slate-400 uppercase mb-3">Recent Human Oversight Logs</h5>
                        <div className="space-y-2">
                            {[
                                { user: 'D. Steward', action: 'Overrode Agent Decision #4921', reason: 'Context Mismatch', time: '2h ago' },
                                { user: 'Compliance Lead', action: 'Flagged Dataset V4', reason: 'PII Detected', time: '5h ago' }
                            ].map((log, i) => (
                                <div key={i} className="flex justify-between text-xs p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <User size={12} className="text-slate-400" />
                                        <span className="font-medium text-slate-900 dark:text-white">{log.action}</span>
                                    </div>
                                    <span className="text-slate-400">{log.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </FeatureCard>

            {/* Governance Framework */}
            <FeatureCard title="Policy & ISO Framework">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30">
                        <div className="flex items-center gap-2 mb-2">
                            <BookOpen size={16} className="text-indigo-500" />
                            <span className="text-sm font-bold text-slate-900 dark:text-white">ISO 42001</span>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">AI Management System framework alignment.</p>
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 w-[65%]"></div>
                        </div>
                        <div className="text-right text-[10px] font-bold text-indigo-500 mt-1">65% Aligned</div>
                    </div>
                    
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield size={16} className="text-emerald-500" />
                            <span className="text-sm font-bold text-slate-900 dark:text-white">GDPR Mapping</span>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">Data privacy cross-mapping status.</p>
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[92%]"></div>
                        </div>
                        <div className="text-right text-[10px] font-bold text-emerald-500 mt-1">92% Compliant</div>
                    </div>
                </div>
                
                <div className="mt-4 p-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900">
                    <div className="flex justify-between items-center">
                        <div>
                            <h5 className="font-bold text-sm">AI Literacy Training</h5>
                            <p className="text-xs opacity-70">Mandatory for all staff interacting with AI.</p>
                        </div>
                        <button className="px-3 py-1.5 bg-white/10 dark:bg-slate-900/10 rounded-lg text-xs font-bold backdrop-blur-sm">View Modules</button>
                    </div>
                </div>
            </FeatureCard>
        </div>
    </div>
  );

  const renderReliabilityTab = () => (
      <div className="animate-fade-in grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          <FeatureCard title="System Latency (P99)" className="md:col-span-2">
              <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockLatencyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px' }} />
                      <Line type="monotone" dataKey="latency" stroke="#f59e0b" strokeWidth={3} dot={{r: 4, fill: '#f59e0b'}} activeDot={{r: 6}} />
                  </LineChart>
              </ResponsiveContainer>
          </FeatureCard>

          <FeatureCard title="Reliability Log" className="md:col-span-1">
              <div className="space-y-4">
                  {mockReliabilityEvents.map(event => (
                      <div key={event.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2 mb-1">
                             <div className={`h-2 w-2 rounded-full ${
                                 event.type === 'success' ? 'bg-emerald-500' :
                                 event.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                             }`}></div>
                             <span className="text-xs font-bold text-slate-900 dark:text-white">{event.title}</span>
                             <span className="ml-auto text-[10px] text-slate-400">{event.time}</span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">{event.desc}</p>
                      </div>
                  ))}
              </div>
          </FeatureCard>
      </div>
  );

  const renderAIConsoleTab = () => (
      <div className="animate-fade-in flex flex-col h-full bg-slate-50 dark:bg-slate-850 rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-2xl ${
                          msg.role === 'user' 
                          ? 'bg-datova-500 text-white rounded-br-sm' 
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-700'
                      }`}>
                          {msg.role === 'ai' && (
                              <div className="flex items-center gap-2 mb-2 text-datova-500 dark:text-datova-400 text-xs font-bold uppercase tracking-wider">
                                  <Sparkles size={12} /> Datova Intelligence
                              </div>
                          )}
                          <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
                      </div>
                  </div>
              ))}
              {isChatTyping && (
                  <div className="flex justify-start">
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-2">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                      </div>
                  </div>
              )}
              <div ref={chatEndRef} />
          </div>
          
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              <form onSubmit={handleChatSubmit} className="relative">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about your data, anomalies, or agent performance..." 
                    className="w-full pl-6 pr-14 py-4 bg-slate-100 dark:bg-slate-950 rounded-2xl border-none focus:ring-2 focus:ring-datova-500 outline-none dark:text-white placeholder-slate-400"
                  />
                  <button 
                    type="submit" 
                    disabled={!chatInput.trim() || isChatTyping}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-datova-500 text-white rounded-xl hover:bg-datova-600 disabled:opacity-50 disabled:hover:bg-datova-500 transition-all"
                  >
                      <Send size={18} />
                  </button>
              </form>
          </div>
      </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
        
        {/* Navigation Sidebar */}
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 transition-colors duration-300">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                <div className="bg-gradient-to-tr from-datova-600 to-datova-400 p-1.5 rounded-lg text-white shadow-lg shadow-datova-500/20">
                    <Database size={18} />
                </div>
                Datova AI
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div>
                    <h3 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Platform</h3>
                    <NavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={LayoutDashboard} label="Overview" />
                    <NavItem active={activeTab === 'ai_console'} onClick={() => setActiveTab('ai_console')} icon={Bot} label="AI Console" badge="Beta" />
                </div>
                
                <div>
                    <h3 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">DFAA Layers</h3>
                    <NavItem active={activeTab === 'foundation'} onClick={() => setActiveTab('foundation')} icon={Database} label="Layer 1: Foundation" />
                    <NavItem active={activeTab === 'intelligence'} onClick={() => setActiveTab('intelligence')} icon={BarChart3} label="Layer 2: Intelligence" />
                    <NavItem active={activeTab === 'automation'} onClick={() => setActiveTab('automation')} icon={Zap} label="Layer 3: Automation" />
                    <NavItem active={activeTab === 'governance'} onClick={() => setActiveTab('governance')} icon={ShieldCheck} label="Layer 4: Governance" badge="EU AI" />
                </div>

                <div>
                    <h3 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">System</h3>
                    <NavItem active={activeTab === 'reliability'} onClick={() => setActiveTab('reliability')} icon={Shield} label="Reliability" />
                </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <button onClick={onBack} className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                    <ArrowLeft size={16} /> Exit Demo
                </button>
            </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            
            {/* Header */}
            <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 z-10 transition-colors duration-300">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <span>Dashboard</span>
                    <span className="text-slate-300 dark:text-slate-600">/</span>
                    <span className="font-bold text-slate-900 dark:text-white capitalize">{activeTab.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold border border-emerald-100 dark:border-emerald-800">
                         <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                         </span>
                         System Operational
                     </div>
                     <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                         {data.user.name.charAt(0)}
                     </div>
                </div>
            </header>

            {/* Notification Toast */}
            {notification && (
                <div className={`absolute top-20 right-8 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in-up ${notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-white'}`}>
                    {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span className="font-medium text-sm">{notification.message}</span>
                </div>
            )}

            {/* Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
                {activeTab === 'overview' && renderOverviewTab()}
                {activeTab === 'foundation' && renderFoundationTab()}
                {activeTab === 'intelligence' && renderIntelligenceTab()}
                {activeTab === 'automation' && renderAutomationTab()}
                {activeTab === 'governance' && renderGovernanceTab()}
                {activeTab === 'reliability' && renderReliabilityTab()}
                {activeTab === 'ai_console' && renderAIConsoleTab()}
            </div>
        </main>

        {/* Modals */}
        {renderConnectModal()}
        {renderAgentModal()}
        {renderComplianceModal()}
    </div>
  );
};

export default Dashboard;