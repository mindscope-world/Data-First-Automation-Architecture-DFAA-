import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, LineChart, Line, Legend, PieChart, Pie, Cell, Sankey } from 'recharts';
import { 
  LayoutDashboard, Database, Zap, Shield, MessageSquare, User, 
  CheckCircle2, AlertCircle, Sparkles, Bot, FileText, Store, 
  Server, Activity, Send, Search, Settings, ArrowLeft, ArrowRight, BarChart3, RefreshCw,
  Plus, X, Cloud, FileSpreadsheet, Globe, HardDrive, Clock,
  Wand2, AlertOctagon, GitMerge, Type, ScanSearch,
  Play, Pause, MoreHorizontal, Cpu, Timer, History, XCircle, Key, Link,
  Brain, Sliders, ShieldCheck, TrendingUp, TrendingDown, Code2, Terminal, Siren, Construction, Lock,
  MousePointer2, Trash2, Move, Save, CornerDownRight, GitBranch, AlertTriangle, Plug, Scale, BookOpen, Eye, FileCheck,
  Binary, Network, ToggleRight, Layers, Workflow, Fingerprint, ArrowUpRight, Hash, ShieldAlert, GitPullRequest, PauseCircle, PlayCircle, RefreshCcw,
  ArrowDown, GitCommit, Calendar, Thermometer
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

const mockWarehouseAudit = [
    { id: 'evt-102', action: 'Constraint Check', source: 'Validation Engine', status: 'Failed', timestamp: '10:42:01 AM', hash: '0x8f...2a', details: 'NULL value in NOT NULL field "order_id"' },
    { id: 'evt-101', action: 'Schema Update', source: 'Shopify Stream', status: 'Warning', timestamp: '09:15:33 AM', hash: '0x7b...9c', details: 'Drift Detected: Field "tax_id" added' },
    { id: 'evt-100', action: 'Ingestion Batch', source: 'Salesforce CRM', status: 'Success', timestamp: '08:00:00 AM', hash: '0x3d...1f', details: '15,000 records committed' },
];

const mockEntityQuality = [
    { entity: 'Customer', completeness: 98, accuracy: 95, consistency: 99, trend: 2 },
    { entity: 'Transaction', completeness: 100, accuracy: 99, consistency: 98, trend: 0 },
    { entity: 'Product', completeness: 85, accuracy: 92, consistency: 88, trend: -1 },
    { entity: 'Agent_Log', completeness: 100, accuracy: 100, consistency: 100, trend: 5 },
];

const mockDriftData = [
  { name: '00:00', baseline: 40, current: 42 },
  { name: '04:00', baseline: 38, current: 45 },
  { name: '08:00', baseline: 42, current: 68 }, // Drift spike
  { name: '12:00', baseline: 45, current: 75 },
  { name: '16:00', baseline: 40, current: 70 },
  { name: '20:00', baseline: 35, current: 55 },
  { name: '23:59', baseline: 38, current: 48 },
];

const mockFailureTraces = [
    { id: 'err-882', time: '10:15 AM', error: 'Agent hallucination rate > 5%', rootCause: 'Schema drift in "Product_Type" field', status: 'Auto-Paused' },
    { id: 'err-881', time: '09:45 AM', error: 'Downstream API rejection', rootCause: 'Null value in required "email" field', status: 'Remediated' },
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

const mockKPIHierarchy = [
  {
    title: "Net Revenue Retention",
    value: "115%",
    trend: "+5%",
    status: "good",
    children: [
      { title: "Expansion", value: "$45k", status: "good" },
      { title: "Churn", value: "2.1%", status: "warning" }
    ]
  },
  {
    title: "Support Efficiency",
    value: "92%",
    trend: "+12%",
    status: "good",
    children: [
      { title: "Auto-Resolution", value: "65%", status: "good" },
      { title: "Escalation Rate", value: "8%", status: "stable" }
    ]
  }
];

const mockLogicRules = [
  { id: 1, name: 'Margin Protection', condition: 'IF margin < 18%', action: 'Block Transaction', type: 'Constraint' },
  { id: 2, name: 'VIP Routing', condition: 'IF LTV > $10k', action: 'Route to Priority Queue', type: 'Logic' },
  { id: 3, name: 'Inventory Safety', condition: 'IF stock < 10 units', action: 'Prevent Bulk Order', type: 'Constraint' },
];

const mockSeasonalityData = [
  { month: 'Jan', current: 4000, lastYear: 3200, seasonality: 'Low' },
  { month: 'Feb', current: 4200, lastYear: 3400, seasonality: 'Low' },
  { month: 'Mar', current: 5800, lastYear: 4500, seasonality: 'High' }, // Spike
  { month: 'Apr', current: 5100, lastYear: 4100, seasonality: 'Medium' },
  { month: 'May', current: 5300, lastYear: 4300, seasonality: 'Medium' },
  { month: 'Jun', current: 6100, lastYear: 4800, seasonality: 'High' },
];

// Enhanced UBDM Data
const mockUBDMEntities = [
  { 
    id: 'cust', 
    name: 'Customer', 
    type: 'Master',
    description: 'A unique individual or organization purchasing goods. Golden record resolved from CRM, Support, and Marketing tools.',
    fields: [
      { name: 'customer_id', type: 'UUID', key: 'PK', origin: 'System', definition: 'Unique internal identifier (UBDM-ID)', lineage: 'Generated' },
      { name: 'email', type: 'VARCHAR', key: 'IDX', origin: 'SFDC, HubSpot', definition: 'Primary contact email. Validated via Regex.', lineage: 'Coalesce(SFDC.Email, HubSpot.email)' },
      { name: 'tier_status', type: 'ENUM', key: '', origin: 'Logic', definition: 'VIP if LTV > $5000', lineage: 'Computed' },
      { name: 'lifetime_value', type: 'DECIMAL', key: '', origin: 'Calc', definition: 'Sum of all completed orders - refunds.', lineage: 'Agg(Orders.total)' },
      { name: 'risk_score', type: 'FLOAT', key: '', origin: 'AI Model', definition: 'Churn probability 0-100.', lineage: 'Inference(ChurnModel_v2)' }
    ],
    identityStats: { resolved: 45200, duplicates: 1240, confidence: '99.2%' }
  },
  { 
    id: 'ord', 
    name: 'Transaction', 
    type: 'Event',
    description: 'An immutable exchange of value for goods or services.',
    fields: [
      { name: 'order_id', type: 'UUID', key: 'PK', origin: 'Shopify', definition: 'Original order ID', lineage: 'Shopify.id' },
      { name: 'amount', type: 'DECIMAL', key: '', origin: 'Shopify', definition: 'Gross transaction value in USD.', lineage: 'Shopify.total_price' },
      { name: 'status', type: 'ENUM', key: '', origin: 'Mapped', definition: 'Normalized: PENDING | PAID | FAILED', lineage: 'Map(Shopify.financial_status)' }
    ],
    identityStats: { resolved: 1200000, duplicates: 0, confidence: '100%' }
  },
  { 
    id: 'agent', 
    name: 'Agent_Action', 
    type: 'System',
    description: 'Log of autonomous actions taken by AI workers.',
    fields: [
      { name: 'action_id', type: 'UUID', key: 'PK', origin: 'System', definition: 'Log ID', lineage: 'Generated' },
      { name: 'agent_name', type: 'VARCHAR', key: 'FK', origin: 'System', definition: 'Name of the agent', lineage: 'Context' },
      { name: 'outcome', type: 'JSONB', key: '', origin: 'System', definition: 'Result payload', lineage: 'Output' }
    ],
    identityStats: { resolved: 85000, duplicates: 0, confidence: '100%' }
  }
];

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
  
  // Reliability & Remediation State
  const [remediationConfig, setRemediationConfig] = useState({
      autoPauseOnDrift: true,
      autoRollbackOnSchemaError: true,
      alertOnFreshnessDelay: true
  });

  // Compliance Generator State
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [complianceStep, setComplianceStep] = useState(1);

  // Intelligence Tab State
  const [showForecast, setShowForecast] = useState(false);

  // UBDM Architect State
  const [selectedEntityId, setSelectedEntityId] = useState<string>(mockUBDMEntities[0].id);
  const [ubdmViewMode, setUbdmViewMode] = useState<'schema' | 'lineage' | 'identity'>('schema');

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
                                    {mockUBDMEntities.map((entity) => (
                                        <label key={entity.name} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            <input 
                                                type="checkbox" 
                                                checked={agentConfig.models.includes(entity.name)}
                                                onChange={(e) => {
                                                    const newModels = e.target.checked 
                                                        ? [...agentConfig.models, entity.name]
                                                        : agentConfig.models.filter(m => m !== entity.name);
                                                    setAgentConfig({...agentConfig, models: newModels});
                                                }}
                                                className="w-4 h-4 rounded text-datova-500 focus:ring-datova-500 border-slate-300"
                                            />
                                            <div>
                                                <span className="text-sm font-bold text-slate-900 dark:text-white block">{entity.name}</span>
                                                <span className="text-xs text-slate-500">{entity.fields.length} fields</span>
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
    // ... (Existing implementation remains the same) ...
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

      {/* Unified Business Data Model (UBDM) Studio */}
      <FeatureCard title="Unified Business Data Model (UBDM) Studio" className="col-span-1 md:col-span-2" action={
       <div className="flex gap-2">
          <button onClick={() => setUbdmViewMode('schema')} className={`p-2 rounded-lg transition-all ${ubdmViewMode === 'schema' ? 'bg-datova-500 text-white' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`} title="Schema View"><Layers size={16}/></button>
          <button onClick={() => setUbdmViewMode('lineage')} className={`p-2 rounded-lg transition-all ${ubdmViewMode === 'lineage' ? 'bg-datova-500 text-white' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`} title="Lineage View"><Workflow size={16}/></button>
          <button onClick={() => setUbdmViewMode('identity')} className={`p-2 rounded-lg transition-all ${ubdmViewMode === 'identity' ? 'bg-datova-500 text-white' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`} title="Identity Resolution"><Fingerprint size={16}/></button>
       </div>
      }>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col md:flex-row h-[600px]">
            {/* Sidebar List */}
            <div className="w-full md:w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                    <h5 className="text-xs font-bold uppercase text-slate-400 mb-2">Canonical Entities</h5>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                            type="text" 
                            placeholder="Search entities..." 
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-datova-500 dark:text-white"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {mockUBDMEntities.map((entity) => (
                        <button
                            key={entity.id}
                            onClick={() => setSelectedEntityId(entity.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm transition-all text-left group ${
                                selectedEntityId === entity.id
                                ? 'bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
                            }`}
                        >
                            <div className={`p-2 rounded-lg ${selectedEntityId === entity.id ? 'bg-datova-100 text-datova-600 dark:bg-datova-900/30 dark:text-datova-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                                {entity.type === 'Master' ? <User size={16}/> : entity.type === 'Event' ? <Activity size={16}/> : <Bot size={16}/>}
                            </div>
                            <div>
                                <div className={`font-bold ${selectedEntityId === entity.id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{entity.name}</div>
                                <div className="text-[10px] text-slate-400">{entity.fields.length} Fields • {entity.identityStats.confidence}</div>
                            </div>
                        </button>
                    ))}
                    
                    <button className="w-full flex items-center justify-center gap-2 p-3 mt-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <Plus size={14} /> New Entity
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
                {selectedEntityId && (() => {
                    const entity = mockUBDMEntities.find(e => e.id === selectedEntityId);
                    if (!entity) return null;

                    return (
                        <>
                            {/* Entity Header */}
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-white dark:bg-slate-900 z-10">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{entity.name}</h3>
                                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold uppercase border border-indigo-100 dark:border-indigo-800">{entity.type} Entity</span>
                                    </div>
                                    <p className="text-sm text-slate-500 max-w-xl">{entity.description}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all">
                                        <Code2 size={14}/> Export JSON
                                    </button>
                                    <button className="flex items-center gap-2 px-3 py-1.5 bg-datova-500 hover:bg-datova-600 rounded-lg text-xs font-bold text-white shadow-lg shadow-datova-500/20 transition-all">
                                        <Settings size={14}/> Edit Schema
                                    </button>
                                </div>
                            </div>

                            {/* View Content */}
                            <div className="flex-1 overflow-y-auto p-0 relative">
                                {ubdmViewMode === 'schema' && (
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10">
                                            <tr>
                                                <th className="px-6 py-3 font-bold text-xs uppercase tracking-wider">Field Name</th>
                                                <th className="px-6 py-3 font-bold text-xs uppercase tracking-wider">Type</th>
                                                <th className="px-6 py-3 font-bold text-xs uppercase tracking-wider">Origin / Lineage</th>
                                                <th className="px-6 py-3 font-bold text-xs uppercase tracking-wider">Business Definition (Semantic)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {entity.fields.map((field, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-700 dark:text-slate-200">
                                                            {field.key === 'PK' && <Key size={12} className="text-amber-500" />}
                                                            {field.key === 'FK' && <Link size={12} className="text-indigo-500" />}
                                                            {field.key === 'IDX' && <Search size={12} className="text-emerald-500" />}
                                                            {field.name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs">
                                                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-mono text-slate-600 dark:text-slate-400">
                                                            {field.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{field.origin}</span>
                                                                {field.lineage && <span className="text-[10px] bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-1.5 rounded border border-indigo-100 dark:border-indigo-800">Mapped</span>}
                                                            </div>
                                                            <div className="text-[10px] text-slate-400 font-mono">{field.lineage}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                                        {field.definition}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                {ubdmViewMode === 'lineage' && (
                                    <div className="p-8 h-full flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/50">
                                        <div className="flex items-center gap-8 relative">
                                            {/* Source Systems */}
                                            <div className="space-y-4">
                                                <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm w-48">
                                                    <div className="flex items-center gap-2 mb-2 font-bold text-slate-900 dark:text-white"><Cloud size={16}/> Salesforce</div>
                                                    <div className="text-xs text-slate-500">Lead.Email</div>
                                                </div>
                                                <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm w-48">
                                                    <div className="flex items-center gap-2 mb-2 font-bold text-slate-900 dark:text-white"><Database size={16}/> HubSpot</div>
                                                    <div className="text-xs text-slate-500">Contact.email</div>
                                                </div>
                                            </div>

                                            {/* Transformation */}
                                            <div className="relative">
                                                <div className="absolute top-1/2 -left-8 w-8 h-0.5 bg-slate-300 dark:bg-slate-600"></div>
                                                <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-full shadow-sm z-10 relative">
                                                    <GitMerge size={24} className="text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                                <div className="absolute top-1/2 -right-8 w-8 h-0.5 bg-slate-300 dark:bg-slate-600"></div>
                                                <div className="absolute top-10 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">Coalesce & Validate</div>
                                            </div>

                                            {/* UBDM Entity */}
                                            <div className="p-6 bg-white dark:bg-slate-800 border-2 border-datova-500 rounded-2xl shadow-xl w-64">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="p-2 bg-datova-100 dark:bg-datova-900/30 rounded-lg text-datova-600">
                                                        {entity.type === 'Master' ? <User size={20}/> : <Activity size={20}/>}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-lg text-slate-900 dark:text-white">{entity.name}</div>
                                                        <div className="text-[10px] text-slate-400 font-bold uppercase">Canonical Entity</div>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    {entity.fields.slice(0,3).map(f => (
                                                        <div key={f.name} className="flex justify-between text-xs p-2 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800">
                                                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{f.name}</span>
                                                            <span className="text-slate-400">{f.type}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {ubdmViewMode === 'identity' && (
                                    <div className="p-8 h-full">
                                        <div className="grid grid-cols-3 gap-6 mb-8">
                                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-xl text-center">
                                                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">{entity.identityStats.resolved.toLocaleString()}</div>
                                                <div className="text-xs font-bold text-emerald-700/60 dark:text-emerald-300/60 uppercase tracking-wider">Unique Identities</div>
                                            </div>
                                            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl text-center">
                                                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">{entity.identityStats.duplicates.toLocaleString()}</div>
                                                <div className="text-xs font-bold text-amber-700/60 dark:text-amber-300/60 uppercase tracking-wider">Duplicates Merged</div>
                                            </div>
                                            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl text-center">
                                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{entity.identityStats.confidence}</div>
                                                <div className="text-xs font-bold text-blue-700/60 dark:text-blue-300/60 uppercase tracking-wider">Match Confidence</div>
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                                            <h5 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                                <Fingerprint size={18} className="text-datova-500"/> Golden Record Generation
                                            </h5>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300">JD</div>
                                                        <div>
                                                            <div className="font-bold text-sm text-slate-900 dark:text-white">John Doe</div>
                                                            <div className="text-xs text-slate-500">3 Source Records Merged</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded text-[10px] text-slate-500">SFDC: 003...</div>
                                                        <ArrowRight size={12} className="text-slate-300"/>
                                                        <div className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded text-[10px] text-slate-500">HubSpot: 992...</div>
                                                        <ArrowRight size={12} className="text-slate-300"/>
                                                        <div className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded text-[10px] font-bold">UBDM: u-10293</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300">AS</div>
                                                        <div>
                                                            <div className="font-bold text-sm text-slate-900 dark:text-white">Alice Smith</div>
                                                            <div className="text-xs text-slate-500">2 Source Records Merged</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded text-[10px] text-slate-500">Shopify: 882...</div>
                                                        <ArrowRight size={12} className="text-slate-300"/>
                                                        <div className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded text-[10px] font-bold">UBDM: u-44912</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    );
                })()}
            </div>
        </div>
      </FeatureCard>

      {/* Single Source of Truth Warehouse (Validation & Integrity) */}
      <FeatureCard title="Single Source of Truth Warehouse" className="col-span-1 md:col-span-2">
          {/* ... (Existing Validation Engine Code) ... */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Validation Engine */}
              <div>
                  <h5 className="font-bold text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                      <ShieldCheck size={16} className="text-datova-500"/> Validation Engine & Drift Detection
                  </h5>
                  
                  <div className="space-y-3">
                      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                              <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                                  <Key size={14}/>
                              </div>
                              <div>
                                  <div className="text-xs font-bold text-slate-900 dark:text-white">Constraint Checks</div>
                                  <div className="text-[10px] text-slate-500">Active (Nulls, Uniqueness, FKs)</div>
                              </div>
                          </div>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">99.8% Pass</span>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                              <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                                  <AlertOctagon size={14}/>
                              </div>
                              <div>
                                  <div className="text-xs font-bold text-slate-900 dark:text-white">Schema Drift</div>
                                  <div className="text-[10px] text-slate-500">Monitoring 12 pipelines</div>
                              </div>
                          </div>
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400">1 Warning</span>
                      </div>

                      <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                          <h6 className="text-[10px] uppercase font-bold text-slate-400 mb-2">Live Validator Status</h6>
                          <div className="flex items-center gap-2 mb-1">
                              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                              <span className="text-xs text-slate-600 dark:text-slate-300">Ingesting Batch #9921...</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-datova-500 w-[65%] animate-pulse"></div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Immutable Audit Logs */}
              <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center mb-4">
                      <h5 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                          <FileText size={16} className="text-datova-500"/> Immutable Audit Logs
                      </h5>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-mono">EU AI Act Compliant</span>
                  </div>
                  
                  <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden relative">
                      <div className="absolute top-0 left-0 w-full h-full overflow-y-auto p-3 space-y-2 no-scrollbar">
                          {mockWarehouseAudit.map((log) => (
                              <div key={log.id} className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-1">
                                  <div className="flex justify-between items-center">
                                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                          log.status === 'Success' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                          log.status === 'Warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                          'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                      }`}>
                                          {log.action}
                                      </span>
                                      <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                                  </div>
                                  <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                                      {log.source}: {log.details}
                                  </div>
                                  <div className="flex items-center gap-1 text-[9px] text-slate-400 font-mono mt-1 border-t border-slate-100 dark:border-slate-800 pt-1">
                                      <Hash size={10} /> {log.hash}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      </FeatureCard>

      {/* Enhanced Data Quality Score */}
      <FeatureCard title="Granular Data Quality & Scoring" className="col-span-1 md:col-span-2">
        {/* ... (Existing Data Quality Score code remains same) ... */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 flex flex-col items-center justify-center p-4">
                <div className="relative h-40 w-40 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-emerald-500" strokeDasharray={440} strokeDashoffset={440 - (440 * 0.92)} />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-4xl font-bold text-slate-900 dark:text-white">92</span>
                        <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Quality Index</span>
                    </div>
                </div>
                <div className="text-center mt-4 space-y-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">High Trust Level</p>
                    <p className="text-xs text-slate-500">Ready for Agentic Workflows</p>
                </div>
            </div>

            <div className="lg:col-span-2 overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                        <tr>
                            <th className="px-4 py-3">Entity</th>
                            <th className="px-4 py-3 text-center">Completeness</th>
                            <th className="px-4 py-3 text-center">Accuracy</th>
                            <th className="px-4 py-3 text-center">Consistency</th>
                            <th className="px-4 py-3 text-right">Trend (7d)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {mockEntityQuality.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">{item.entity}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${item.completeness > 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {item.completeness}%
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center text-xs font-mono text-slate-600 dark:text-slate-400">{item.accuracy}%</td>
                                <td className="px-4 py-3 text-center text-xs font-mono text-slate-600 dark:text-slate-400">{item.consistency}%</td>
                                <td className="px-4 py-3 text-right">
                                    <div className={`flex items-center justify-end gap-1 text-xs font-bold ${item.trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {item.trend > 0 ? <TrendingUp size={12}/> : item.trend < 0 ? <TrendingDown size={12}/> : null}
                                        {item.trend > 0 ? '+' : ''}{item.trend}%
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
        {/* Top Row: KPI Context & Temporal Reasoning */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* KPI Hierarchy Builder */}
            <FeatureCard title="KPI Context Hierarchy" className="lg:col-span-2">
                <div className="space-y-6">
                    <p className="text-xs text-slate-500">Defining the relationships between business metrics to guide AI reasoning.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {mockKPIHierarchy.map((kpi, i) => (
                            <div key={i} className="p-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 relative overflow-hidden">
                                {/* Parent */}
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Primary Metric</div>
                                        <div className="text-lg font-bold text-slate-900 dark:text-white">{kpi.title}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-datova-600 dark:text-datova-400">{kpi.value}</div>
                                        <div className="text-xs text-emerald-500 font-bold">{kpi.trend}</div>
                                    </div>
                                </div>
                                
                                {/* Connector */}
                                <div className="absolute left-8 top-16 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800 z-0"></div>

                                {/* Children */}
                                <div className="space-y-3 relative z-10">
                                    {kpi.children.map((child, j) => (
                                        <div key={j} className="ml-6 flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                                <span className="font-medium text-slate-700 dark:text-slate-300">{child.title}</span>
                                            </div>
                                            <span className="font-mono text-slate-500">{child.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </FeatureCard>

            {/* Temporal Reasoning */}
            <FeatureCard title="Temporal Reasoning & Seasonality">
                <div className="h-full flex flex-col">
                    <p className="text-xs text-slate-500 mb-4">AI context aware of historical trends and seasonal spikes.</p>
                    <div className="flex-1 min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockSeasonalityData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                <Legend verticalAlign="top" iconType="circle" wrapperStyle={{ fontSize: '10px' }}/>
                                <Line type="monotone" dataKey="current" name="2024 (Actual)" stroke="#6366f1" strokeWidth={3} dot={false} />
                                <Line type="monotone" dataKey="lastYear" name="2023 (Historical)" stroke="#cbd5e1" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <div className="text-[10px] px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded border border-amber-100 dark:border-amber-800">
                            Detected: Q2 Seasonal Spike
                        </div>
                    </div>
                </div>
            </FeatureCard>
        </div>

        {/* Bottom Row: Logic & Decisions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Business Logic Encoding */}
            <FeatureCard title="Business Logic Engine">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-slate-500">Hard-coded rules that override probabilistic AI outputs.</p>
                        <button className="text-xs font-bold text-datova-600 bg-datova-50 dark:bg-datova-900/20 px-3 py-1.5 rounded-lg border border-datova-100 dark:border-datova-800 flex items-center gap-1">
                            <Plus size={12}/> Add Rule
                        </button>
                    </div>
                    <div className="space-y-3">
                        {mockLogicRules.map((rule) => (
                            <div key={rule.id} className="p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 flex gap-3">
                                <div className={`mt-1 p-1.5 rounded-lg ${rule.type === 'Constraint' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'}`}>
                                    {rule.type === 'Constraint' ? <Lock size={14}/> : <GitCommit size={14}/>}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">{rule.name}</span>
                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{rule.type}</span>
                                    </div>
                                    <div className="text-xs font-mono text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800">
                                        {rule.condition} <span className="text-indigo-500 font-bold">THEN</span> {rule.action}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </FeatureCard>

            {/* Decision Context Engine */}
            <FeatureCard title="Decision Context Engine">
                <div className="grid grid-cols-2 gap-4 h-full">
                    {/* Safe Zone */}
                    <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900/30">
                        <div className="flex items-center gap-2 mb-4 text-emerald-700 dark:text-emerald-400 font-bold text-sm uppercase tracking-wide">
                            <CheckCircle2 size={16}/> Autonomous
                        </div>
                        <ul className="space-y-2">
                            {['L1 Support Replies', 'Refunds < $50', 'Data Categorization', 'Meeting Scheduling'].map((item, i) => (
                                <li key={i} className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded shadow-sm border border-emerald-100 dark:border-emerald-900/20">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Human Loop */}
                    <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-100 dark:border-amber-900/30">
                        <div className="flex items-center gap-2 mb-4 text-amber-700 dark:text-amber-400 font-bold text-sm uppercase tracking-wide">
                            <User size={16}/> Human Approval
                        </div>
                        <ul className="space-y-2">
                            {['Contract Generation', 'Refunds > $50', 'System Configuration', 'Publishing Content'].map((item, i) => (
                                <li key={i} className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded shadow-sm border border-amber-100 dark:border-amber-900/20">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </FeatureCard>
        </div>
    </div>
  );

  const renderAutomationTab = () => (
    <div className="animate-fade-in space-y-6 h-full pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCard title="Active Agent Fleet" action={
                <button onClick={handleOpenAgentModal} className="text-xs bg-datova-500 text-white hover:bg-datova-600 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all shadow-md shadow-datova-500/20">
                    <Plus size={14} /> Deploy Agent
                </button>
            }>
                <div className="space-y-4">
                     {agents.map((agent, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${
                                    agent.status === 'busy' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' : 
                                    agent.status === 'active' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 
                                    'bg-slate-100 text-slate-500 dark:bg-slate-800'
                                }`}>
                                    <Bot size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white">{agent.name}</div>
                                    <div className="text-xs text-slate-500">{agent.role} • Load: {agent.load}%</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <div className="text-xs font-bold text-slate-900 dark:text-white">{agent.status === 'busy' ? 'Processing Task #922' : 'Waiting for triggers'}</div>
                                    <div className="text-[10px] text-slate-500">Uptime: 4d 12h</div>
                                </div>
                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">
                                    <MoreHorizontal size={16}/>
                                </button>
                            </div>
                        </div>
                     ))}
                </div>
            </FeatureCard>

            <FeatureCard title="Predictive Workflows">
                 <div className="h-64 flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 relative overflow-hidden group">
                     {/* Simplified Workflow Viz using nodes state */}
                     <div className="absolute inset-0 p-4" ref={canvasRef} onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                            {workflowEdges.map(edge => {
                                const source = workflowNodes.find(n => n.id === edge.source);
                                const target = workflowNodes.find(n => n.id === edge.target);
                                if (!source || !target) return null;
                                return (
                                    <line 
                                        key={edge.id} 
                                        x1={source.x + 80} y1={source.y + 30} 
                                        x2={target.x + 80} y2={target.y + 30} 
                                        stroke="#94a3b8" 
                                        strokeWidth="2" 
                                    />
                                );
                            })}
                        </svg>
                        {workflowNodes.map(node => (
                            <div 
                                key={node.id}
                                style={{ left: node.x, top: node.y }}
                                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                                onClick={(e) => startLinking(e, node.id)}
                                className={`absolute w-40 p-3 rounded-xl border shadow-sm z-10 cursor-move transition-colors flex items-center gap-2 ${
                                    selectedNodeId === node.id ? 'border-datova-500 ring-2 ring-datova-500/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                                }`}
                            >
                                <div className={`p-1.5 rounded-lg ${
                                    node.type === 'trigger' ? 'bg-amber-100 text-amber-600' :
                                    node.type === 'action' ? 'bg-blue-100 text-blue-600' :
                                    node.type === 'agent' ? 'bg-purple-100 text-purple-600' :
                                    'bg-slate-100 text-slate-500'
                                }`}>
                                    {node.type === 'trigger' ? <Zap size={14}/> : node.type === 'agent' ? <Bot size={14}/> : <Activity size={14}/>}
                                </div>
                                <span className="text-xs font-bold truncate select-none text-slate-700 dark:text-slate-200">{node.label}</span>
                            </div>
                        ))}
                     </div>
                     <div className="absolute bottom-4 right-4 flex gap-2">
                        <div className="text-[10px] text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border border-slate-200 dark:border-slate-700">
                             Drag to move • Click to link
                        </div>
                     </div>
                 </div>
            </FeatureCard>
        </div>
    </div>
  );

  const renderGovernanceTab = () => (
      <div className="animate-fade-in space-y-6 h-full pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <FeatureCard title="Validation Rules" className="lg:col-span-2" action={
                <button onClick={() => setShowRuleForm(true)} className="text-xs font-bold text-datova-600 dark:text-datova-400 hover:underline flex items-center gap-1">
                    <Plus size={14}/> Add Rule
                </button>
            }>
                <div className="space-y-3">
                    {validationRules.map(rule => (
                        <div key={rule.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <button onClick={() => toggleRule(rule.id)} className={`text-2xl ${rule.active ? 'text-emerald-500' : 'text-slate-300'}`}>
                                    {rule.active ? <ToggleRight /> : <ToggleRight className="rotate-180" />}
                                </button>
                                <div>
                                    <div className="font-bold text-sm text-slate-900 dark:text-white">{rule.name}</div>
                                    <div className="text-xs text-slate-500 font-mono">{rule.field} {rule.condition} "{rule.value}"</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">98.5% Pass</div>
                                    <div className="text-[10px] text-slate-400">Last 24h</div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {showRuleForm && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 animate-fade-in">
                            <input 
                                placeholder="Rule Name" 
                                className="w-full p-2 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                                value={newRule.name} onChange={e => setNewRule({...newRule, name: e.target.value})}
                            />
                            <div className="flex gap-2">
                                <input 
                                    placeholder="Field (e.g. email)" 
                                    className="flex-1 p-2 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                                    value={newRule.field} onChange={e => setNewRule({...newRule, field: e.target.value})}
                                />
                                <select className="p-2 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white">
                                    <option>Equals</option><option>Regex Match</option><option>Greater Than</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setShowRuleForm(false)} className="px-3 py-1.5 text-xs font-bold text-slate-500">Cancel</button>
                                <button onClick={handleAddRule} className="px-3 py-1.5 text-xs font-bold bg-datova-500 text-white rounded">Save Rule</button>
                            </div>
                        </div>
                    )}
                </div>
            </FeatureCard>

            <FeatureCard title="EU AI Act Compliance">
                <div className="flex flex-col h-full justify-between">
                    <div className="space-y-4">
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 text-center">
                            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">High Risk</div>
                            <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">System Classification</div>
                        </div>
                        <div className="space-y-2">
                            {mockComplianceDocs.map(doc => (
                                <div key={doc.id} className="flex items-center justify-between p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <FileText size={14} className="text-slate-400 shrink-0"/>
                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{doc.name}</span>
                                    </div>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                        doc.status === 'Ready' ? 'bg-emerald-100 text-emerald-600' :
                                        doc.status === 'Pending' ? 'bg-slate-100 text-slate-500' :
                                        'bg-amber-100 text-amber-600'
                                    }`}>{doc.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowComplianceModal(true)}
                        className="w-full mt-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                        <ShieldCheck size={16}/> Generate Audit Pack
                    </button>
                </div>
            </FeatureCard>
        </div>
      </div>
  );

  const renderReliabilityTab = () => (
      <div className="animate-fade-in space-y-6 h-full pb-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-indigo-900 dark:bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
            <div className="relative z-10">
                <h3 className="text-xl font-bold mb-1">Validation & Reliability Hub</h3>
                <p className="text-indigo-200 text-sm opacity-80">Automated gates ensuring clean data for AI operations.</p>
            </div>
            <div className="relative z-10 flex gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-800/50 rounded-lg border border-indigo-700/50 backdrop-blur-sm">
                    <ShieldAlert size={16} className="text-emerald-400"/>
                    <span className="text-xs font-bold">Gates Active</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-800/50 rounded-lg border border-indigo-700/50 backdrop-blur-sm">
                    <Activity size={16} className="text-indigo-400"/>
                    <span className="text-xs font-bold">Monitoring</span>
                </div>
            </div>
            {/* Decorative background element */}
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-indigo-600/20 to-transparent pointer-events-none"></div>
        </div>

        {/* Section 1: Pre-AI Validation Gates Visualizer */}
        <FeatureCard title="Pre-AI Validation Gates">
            <div className="relative h-48 w-full flex items-center justify-center overflow-x-auto no-scrollbar py-4">
                {/* Connecting Line */}
                <div className="absolute h-1 bg-slate-200 dark:bg-slate-700 w-[90%] left-[5%] top-1/2 -translate-y-1/2 z-0"></div>
                
                {/* Nodes */}
                <div className="flex items-center gap-4 sm:gap-8 md:gap-12 relative z-10 w-full min-w-[600px] px-8 justify-between">
                    {/* Node 1: Source */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-lg">
                            <Database size={20} className="text-slate-500" />
                        </div>
                        <span className="text-xs font-bold text-slate-500">Raw Data</span>
                    </div>

                    {/* Arrow */}
                    <ArrowRight size={16} className="text-slate-300 dark:text-slate-600" />

                    {/* Node 2: Validation Gate */}
                    <div className="flex flex-col items-center gap-3 group cursor-pointer">
                        <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 border-4 border-white dark:border-slate-900 transition-transform group-hover:scale-110">
                            <ShieldCheck size={24} className="text-white" />
                        </div>
                        <div className="text-center">
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">Validation Gate</span>
                            <span className="text-[10px] text-slate-400">Passing (99%)</span>
                        </div>
                    </div>

                    {/* Arrow */}
                    <ArrowRight size={16} className="text-slate-300 dark:text-slate-600" />

                    {/* Node 3: Transformation */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-lg">
                            <GitMerge size={20} className="text-indigo-500" />
                        </div>
                        <span className="text-xs font-bold text-slate-500">Normalization</span>
                    </div>

                    {/* Arrow */}
                    <ArrowRight size={16} className="text-slate-300 dark:text-slate-600" />

                    {/* Node 4: AI Model */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border-2 border-datova-500 flex items-center justify-center shadow-lg relative">
                            <Bot size={24} className="text-datova-500" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                        </div>
                        <span className="text-xs font-bold text-datova-600 dark:text-datova-400">AI Agent</span>
                    </div>

                    {/* Arrow */}
                    <ArrowRight size={16} className="text-slate-300 dark:text-slate-600" />

                    {/* Node 5: Output */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-lg">
                            <Zap size={20} className="text-amber-500" />
                        </div>
                        <span className="text-xs font-bold text-slate-500">Action</span>
                    </div>
                </div>
            </div>
        </FeatureCard>

        {/* Section 2: Continuous Monitoring */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCard title="Data Distribution Shift (Drift)">
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mockDriftData}>
                            <defs>
                                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#cbd5e1" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#cbd5e1" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '12px' }} />
                            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                            <Area type="monotone" dataKey="baseline" name="Training Baseline" stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#colorBase)" />
                            <Area type="monotone" dataKey="current" name="Live Stream" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorCurrent)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg">
                    <AlertOctagon size={14} className="text-amber-500" />
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">Drift Detected (08:00)</span>
                </div>
            </FeatureCard>

            <div className="space-y-6">
                <FeatureCard title="Freshness Monitor" className="flex-1">
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl mb-3">
                        <div className="flex items-center gap-3">
                            <Clock size={20} className="text-blue-500" />
                            <div>
                                <div className="text-sm font-bold text-slate-900 dark:text-white">Last Successful Sync</div>
                                <div className="text-xs text-slate-500">Salesforce CRM Pipeline</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">2m 4s ago</div>
                            <div className="text-[10px] text-slate-400">Threshold: 5m</div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                        <div className="flex items-center gap-3">
                            <RefreshCw size={20} className="text-purple-500" />
                            <div>
                                <div className="text-sm font-bold text-slate-900 dark:text-white">Throughput Rate</div>
                                <div className="text-xs text-slate-500">Events processed per second</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-slate-900 dark:text-white">1,240 eps</div>
                            <div className="text-[10px] text-emerald-500 flex items-center justify-end gap-1"><TrendingUp size={10}/> +12%</div>
                        </div>
                    </div>
                </FeatureCard>

                {/* Section 3: Auto-Remediation Controls */}
                <FeatureCard title="Auto-Remediation Hooks">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Auto-Pause Agent on Drift (>15%)</span>
                            <button 
                                onClick={() => setRemediationConfig(prev => ({...prev, autoPauseOnDrift: !prev.autoPauseOnDrift}))}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${remediationConfig.autoPauseOnDrift ? 'bg-datova-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${remediationConfig.autoPauseOnDrift ? 'translate-x-5' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Rollback Schema on Error</span>
                            <button 
                                onClick={() => setRemediationConfig(prev => ({...prev, autoRollbackOnSchemaError: !prev.autoRollbackOnSchemaError}))}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${remediationConfig.autoRollbackOnSchemaError ? 'bg-datova-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${remediationConfig.autoRollbackOnSchemaError ? 'translate-x-5' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Alert on Freshness Delay (>5m)</span>
                            <button 
                                onClick={() => setRemediationConfig(prev => ({...prev, alertOnFreshnessDelay: !prev.alertOnFreshnessDelay}))}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${remediationConfig.alertOnFreshnessDelay ? 'bg-datova-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${remediationConfig.alertOnFreshnessDelay ? 'translate-x-5' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                </FeatureCard>
            </div>
        </div>

        {/* Section 4: Failure Attribution Log */}
        <FeatureCard title="Failure Trace & Attribution">
            <div className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                        <tr>
                            <th className="px-4 py-3">Error Event</th>
                            <th className="px-4 py-3">Attributed Root Cause (Upstream)</th>
                            <th className="px-4 py-3">Remediation Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {mockFailureTraces.map((trace, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-rose-600 dark:text-rose-400 text-xs">{trace.error}</span>
                                        <span className="text-[10px] text-slate-400 font-mono">{trace.time} • ID: {trace.id}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <GitPullRequest size={14} className="text-slate-400"/>
                                        <span className="text-xs text-slate-700 dark:text-slate-300">{trace.rootCause}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                        trace.status === 'Auto-Paused' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    }`}>
                                        {trace.status === 'Auto-Paused' ? <PauseCircle size={10}/> : <CheckCircle2 size={10}/>}
                                        {trace.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button className="text-xs font-bold text-datova-500 hover:text-datova-600 transition-colors flex items-center justify-end gap-1 w-full">
                                        View Trace <ArrowRight size={12}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </FeatureCard>
      </div>
  );

  const renderAIConsoleTab = () => (
      <div className="animate-fade-in h-full flex flex-col pb-6">
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col relative">
             <div className="absolute top-0 w-full p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-100 dark:border-slate-800 z-10 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-datova-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-datova-500/30">
                         <Sparkles size={20} />
                     </div>
                     <div>
                         <h3 className="font-bold text-slate-900 dark:text-white">Datova Intelligence</h3>
                         <div className="flex items-center gap-2">
                             <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                             </span>
                             <span className="text-xs text-slate-500">Connected to Layer 2 (Semantic)</span>
                         </div>
                     </div>
                 </div>
                 <div className="flex gap-2">
                     <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><Settings size={18}/></button>
                     <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><History size={18}/></button>
                 </div>
             </div>

             <div className="flex-1 overflow-y-auto p-6 pt-24 space-y-6">
                 {chatMessages.map((msg, i) => (
                     <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-xl p-4 rounded-2xl text-sm leading-relaxed ${
                             msg.role === 'user' 
                             ? 'bg-datova-500 text-white rounded-br-none shadow-lg shadow-datova-500/20' 
                             : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                         }`}>
                             {msg.role === 'ai' && <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Analysis</div>}
                             {msg.text}
                         </div>
                     </div>
                 ))}
                 {isChatTyping && (
                     <div className="flex justify-start">
                         <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl rounded-bl-none flex gap-1">
                             <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                             <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                             <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                         </div>
                     </div>
                 )}
                 <div ref={chatEndRef}></div>
             </div>

             <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                 <form onSubmit={handleChatSubmit} className="relative max-w-4xl mx-auto">
                     <input 
                        type="text" 
                        placeholder="Ask about your data (e.g., 'Analyze the revenue trend from last week' or 'Why did the order error rate spike?')"
                        className="w-full pl-6 pr-14 py-4 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-datova-500 dark:text-white shadow-sm"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                     />
                     <button 
                        type="submit"
                        disabled={!chatInput.trim() || isChatTyping}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-datova-500 text-white rounded-full hover:bg-datova-600 disabled:opacity-50 disabled:hover:bg-datova-500 transition-colors shadow-md"
                     >
                         <ArrowRight size={20} />
                     </button>
                 </form>
                 <div className="text-center mt-2 text-[10px] text-slate-400">
                     Datova AI can make mistakes. Consider checking important information.
                 </div>
             </div>
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