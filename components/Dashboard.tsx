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
  ArrowDown, GitCommit, Calendar, Thermometer, StopCircle, DollarSign, Gauge, UserCheck, FileJson, FileBadge, Scale3D, ShieldQuestion,
  Loader2, Check, Coins, Calculator, Receipt, PieChart as PieChartIcon, FileCode, Webhook, Copy, EyeOff
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

const mockGovernanceStats = {
    riskLevel: 'High-Risk',
    riskScore: 85,
    frameworks: [
        { name: 'EU AI Act', status: 'Compliant', progress: 100, color: 'bg-emerald-500' },
        { name: 'ISO 42001', status: 'In Progress', progress: 75, color: 'bg-blue-500' },
        { name: 'GDPR', status: 'Compliant', progress: 98, color: 'bg-indigo-500' },
    ],
    postMarket: [
        { date: 'Oct 01', incidents: 0, interventions: 12 },
        { date: 'Oct 05', incidents: 1, interventions: 15 },
        { date: 'Oct 10', incidents: 0, interventions: 8 },
        { date: 'Oct 15', incidents: 0, interventions: 22 }, // Spike
        { date: 'Oct 20', incidents: 2, interventions: 18 },
        { date: 'Oct 25', incidents: 0, interventions: 10 },
    ]
};

const mockComplianceDocs = [
  { id: '1', name: 'Technical Documentation (Annex IV)', status: 'Ready', type: 'PDF', date: 'Oct 24, 2023', size: '2.4 MB' },
  { id: '2', name: 'Conformity Assessment', status: 'Review', type: 'DOCX', date: 'Oct 23, 2023', size: '0.8 MB' },
  { id: '3', name: 'EU Database Registration', status: 'Pending', type: 'Form', date: '-', size: 'XML' },
  { id: '4', name: 'Bias Audit Report', status: 'Ready', type: 'PDF', date: 'Oct 22, 2023', size: '1.2 MB' },
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

// ROI Data
const mockRoiData = {
    cumulative: [
        { month: 'Jan', manualCost: 50000, automationCost: 5000, savings: 0 },
        { month: 'Feb', manualCost: 102000, automationCost: 12000, savings: 40000 },
        { month: 'Mar', manualCost: 155000, automationCost: 18000, savings: 87000 },
        { month: 'Apr', manualCost: 210000, automationCost: 24000, savings: 136000 },
        { month: 'May', manualCost: 265000, automationCost: 30000, savings: 185000 },
        { month: 'Jun', manualCost: 320000, automationCost: 36000, savings: 234000 },
    ],
    agentBreakdown: [
        { name: "Support Triage Agent", manualCostPerTask: 12.50, aiCostPerTask: 0.45, volume: 4500, savings: 54225, errorReduction: '95%', cycleTime: '-98%' },
        { name: "Invoice Processor", manualCostPerTask: 8.00, aiCostPerTask: 0.12, volume: 1200, savings: 9456, errorReduction: '99%', cycleTime: '-99%' },
        { name: "Lead Enricher", manualCostPerTask: 3.50, aiCostPerTask: 0.05, volume: 8000, savings: 27600, errorReduction: '80%', cycleTime: '-85%' },
    ],
    summary: {
        totalSaved: 142500,
        hoursSaved: 2450,
        roiMultiplier: 12.4
    }
};

// Security Data
const mockAccessPolicies = [
    { role: 'Support Agent', resource: 'Customer PII', permission: 'Masked', status: 'Active' },
    { role: 'Support Agent', resource: 'Order History', permission: 'Read-Only', status: 'Active' },
    { role: 'Ops Manager', resource: 'Refund Processing', permission: 'Write (Limit $500)', status: 'Active' },
    { role: 'Admin', resource: 'System Config', permission: 'Full Access', status: 'Active' },
];

const mockAuditLogs = [
    { id: 'tx-2910', timestamp: '10:45:22', actor: 'System', event: 'Schema Drift Auto-Correction', hash: 'e3b0c442...', verified: true },
    { id: 'tx-2909', timestamp: '10:42:15', actor: 'jane@datova.ai', event: 'Policy Update: Limit $500', hash: '4a1b9c2d...', verified: true },
    { id: 'tx-2908', timestamp: '10:15:00', actor: 'agent-01', event: 'Bulk Operation: 150 Records', hash: '9f8e7d6c...', verified: true },
];

// Developer Data
const mockApiKeys = [
    { id: 'key_live_...', name: 'Production Key', created: '2023-10-01', lastUsed: 'Just now' },
    { id: 'key_test_...', name: 'Staging Key', created: '2023-10-15', lastUsed: '5m ago' },
];

const mockWebhooks = [
    { url: 'https://api.acme.com/hooks/orders', events: ['order.created', 'order.updated'], status: 'Active', successRate: '99.8%' },
    { url: 'https://api.acme.com/hooks/alerts', events: ['anomaly.detected'], status: 'Active', successRate: '100%' },
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
      { name: 'customer_id', type: 'UUID', key: 'FK', origin: 'System', definition: 'Link to Master Customer', lineage: 'Map(Customer.id)' },
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

const mockAgentRegistry = [
    { id: 'ag-01', name: 'Refund Handler', type: 'Transactional', risk: 'Low', inputs: 'Order ID', outputs: 'Refund Status', status: 'Active' },
    { id: 'ag-02', name: 'Contract Analyzer', type: 'Analysis', risk: 'High', inputs: 'PDF Document', outputs: 'Risk Report', status: 'Active' },
    { id: 'ag-03', name: 'Email Outreach', type: 'Generative', risk: 'Medium', inputs: 'Lead Context', outputs: 'Draft Email', status: 'Paused' },
];

const mockApprovalQueue = [
    { id: 'task-992', agent: 'Contract Analyzer', task: 'Approve High-Value Contract', confidence: '89%', time: '10m ago' },
    { id: 'task-998', agent: 'Refund Handler', task: 'Refund > $500 (Policy Limit)', confidence: '100%', time: '1h ago' },
];

const mockPipelineSteps = [
    { id: 1, name: 'Ingest Ticket', type: 'Deterministic', icon: Database, status: 'complete', desc: 'SQL: Fetch context' },
    { id: 2, name: 'Classify Intent', type: 'Probabilistic', icon: Brain, status: 'complete', desc: 'AI: Label triage' },
    { id: 3, name: 'Check Policy', type: 'Deterministic', icon: Scale, status: 'complete', desc: 'Logic: Refund < $50?' }, // Business Logic
    { id: 4, name: 'Draft Response', type: 'Probabilistic', icon: Sparkles, status: 'waiting', desc: 'AI: Gen email' }, // GenAI
    { id: 5, name: 'Human Review', type: 'Human', icon: UserCheck, status: 'pending', desc: 'Approval Gate' },
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

// ... (Sub-components NavItem, FeatureCard, Node, Edge definitions remain the same) ...

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
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  
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
  
  // Forecasting State
  const [forecastInput, setForecastInput] = useState({
      volume: 1000,
      complexity: 'Medium'
  });

  // Compliance Generator State
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [complianceStep, setComplianceStep] = useState(1);

  // Intelligence Tab State
  const [showForecast, setShowForecast] = useState(false);

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
      await new Promise(resolve => setTimeout(resolve, 1500)); 
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

  // --- Workflow Logic ---
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
        const x = e.clientX - rect.left - 80;
        const y = e.clientY - rect.top - 30;
        setWorkflowNodes(prev => [...prev, { id: `n-${Date.now()}`, type, label, x, y }]);
    }
  };

  const handleNodeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (linkingSourceId) {
        if (linkingSourceId !== id) {
            const exists = workflowEdges.find(edge => edge.source === linkingSourceId && edge.target === id);
            if (!exists) {
                setWorkflowEdges(prev => [...prev, { id: `e-${Date.now()}`, source: linkingSourceId, target: id }]);
                setNotification({ message: 'Nodes connected successfully', type: 'success' });
            }
        }
        setLinkingSourceId(null);
        return;
    }
    setSelectedNodeId(id);
    const node = workflowNodes.find(n => n.id === id);
    if (node) {
        dragRef.current = { id, startX: e.clientX, startY: e.clientY, initialX: node.x, initialY: node.y };
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragRef.current) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        setWorkflowNodes(prev => prev.map(n => {
            if (n.id === dragRef.current?.id) return { ...n, x: dragRef.current.initialX + dx, y: dragRef.current.initialY + dy };
            return n;
        }));
    }
  }, []);

  const handleMouseUp = useCallback(() => { dragRef.current = null; }, []);

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
    setAgentConfig({ name: '', role: 'support', models: [], creativity: 0.5, capabilities: { read: true, write: false, humanApproval: true } });
    setShowAgentModal(true);
  };

  const handleDeployAgent = () => {
    const roleMap: Record<string, string> = { 'support': 'Customer Service', 'ops': 'Operations', 'analyst': 'Reporting', 'steward': 'Governance' };
    const newAgent = { name: agentConfig.name || 'New Agent', role: roleMap[agentConfig.role] || 'Generalist', load: 0, status: 'idle' };
    setAgents(prev => [...prev, newAgent]);
    setNotification({ message: `${newAgent.name} successfully deployed to Automation Layer.`, type: 'success' });
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

  // --- Render Functions ---

  const renderSecurityTab = () => (
    <div className="animate-fade-in space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <FeatureCard title="Trust Center" className="lg:col-span-1 bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-0">
                <div className="flex flex-col h-full justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-20"><ShieldCheck size={120} /></div>
                    <div className="relative z-10">
                        <div className="text-sm font-bold text-indigo-200 mb-1">Security Status</div>
                        <div className="text-3xl font-bold flex items-center gap-3">
                            <span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></span> Protected
                        </div>
                    </div>
                    <div className="space-y-4 mt-8 relative z-10">
                        <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                            <Lock size={18} className="text-emerald-400"/>
                            <div className="text-sm">
                                <div className="font-bold">Encryption Active</div>
                                <div className="text-xs text-indigo-200">AES-256 (At Rest) & TLS 1.3</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                            <FileCode size={18} className="text-emerald-400"/>
                            <div className="text-sm">
                                <div className="font-bold">SOC 2 Type II</div>
                                <div className="text-xs text-indigo-200">Controls verified</div>
                            </div>
                        </div>
                    </div>
                </div>
            </FeatureCard>

            <FeatureCard title="RBAC Policy Matrix" className="lg:col-span-2">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Role</th>
                                <th className="px-4 py-3">Resource</th>
                                <th className="px-4 py-3">Permission Level</th>
                                <th className="px-4 py-3 rounded-r-lg text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {mockAccessPolicies.map((policy, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <User size={14} className="text-indigo-500" /> {policy.role}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 rounded inline-block my-2 mx-4">{policy.resource}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                                            policy.permission.includes('Masked') ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                            policy.permission.includes('Write') ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                            {policy.permission}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className="text-emerald-500 text-xs font-bold flex justify-end items-center gap-1"><CheckCircle2 size={12}/> {policy.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </FeatureCard>
        </div>

        <FeatureCard title="Immutable Audit Log">
            <div className="space-y-1">
                {mockAuditLogs.map((log, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl group hover:border-indigo-300 transition-all">
                        <div className="font-mono text-xs text-slate-400 w-24">{log.timestamp}</div>
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                            {log.actor.includes('agent') ? <Bot size={16} /> : <User size={16} />}
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                {log.event}
                                <span className="text-[10px] font-normal text-slate-400 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">{log.actor}</span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 mt-0.5 flex items-center gap-1">
                                <Hash size={10} /> {log.hash}
                            </div>
                        </div>
                        <div className="text-emerald-500" title="Hash Verified"><Fingerprint size={20} /></div>
                    </div>
                ))}
            </div>
        </FeatureCard>
    </div>
  );

  const renderDeveloperTab = () => (
    <div className="animate-fade-in space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FeatureCard title="API Keys" action={<button className="text-xs bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600 transition">Generate New Key</button>}>
                <div className="space-y-3">
                    {mockApiKeys.map((key, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                            <div>
                                <div className="font-bold text-slate-900 dark:text-white text-sm">{key.name}</div>
                                <div className="font-mono text-xs text-slate-500 mt-1">{key.id}</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] text-slate-400">Last used: {key.lastUsed}</span>
                                <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500"><Copy size={16} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </FeatureCard>

            <FeatureCard title="Webhooks">
                <div className="space-y-3">
                    {mockWebhooks.map((hook, i) => (
                        <div key={i} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                            <div className="flex justify-between items-start mb-2">
                                <div className="font-mono text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded truncate max-w-[200px]">{hook.url}</div>
                                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">{hook.status}</span>
                            </div>
                            <div className="flex gap-2 mb-2">
                                {hook.events.map(ev => (
                                    <span key={ev} className="text-[10px] text-slate-500 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded">{ev}</span>
                                ))}
                            </div>
                            <div className="text-[10px] text-slate-400 text-right">Success Rate: {hook.successRate}</div>
                        </div>
                    ))}
                </div>
            </FeatureCard>
        </div>

        <FeatureCard title="SDK & Integration">
            <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-sm overflow-x-auto">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-700">
                    <span className="text-xs text-slate-500">BASH</span>
                    <button className="text-slate-500 hover:text-white"><Copy size={14}/></button>
                </div>
                <div className="text-emerald-400">npm install @datova/sdk</div>
            </div>
            <div className="mt-4 bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-sm overflow-x-auto">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-700">
                    <span className="text-xs text-slate-500">TYPESCRIPT</span>
                    <button className="text-slate-500 hover:text-white"><Copy size={14}/></button>
                </div>
                <div className="text-indigo-300">import</div> <div className="inline text-white">{`{ DatovaClient }`}</div> <div className="inline text-indigo-300">from</div> <div className="inline text-amber-300">'@datova/sdk'</div>;
                <br/><br/>
                <div className="text-purple-300">const</div> client = <div className="text-purple-300">new</div> DatovaClient({`{`} apiKey: process.env.DATOVA_KEY {`}`});
                <br/>
                <div className="text-purple-300">await</div> client.agents.trigger(<div className="text-amber-300">'refund_handler'</div>, {`{`} orderId: <div className="text-amber-300">'123'</div> {`}`});
            </div>
        </FeatureCard>
    </div>
  );

  const renderOverviewTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        {/* Score Card */}
        <div className="lg:col-span-1 bg-slate-900 dark:bg-white rounded-[2rem] p-8 text-white dark:text-slate-900 relative overflow-hidden flex flex-col justify-between shadow-2xl">
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                <Activity size={200} />
            </div>
            <div>
                <div className="flex items-center gap-2 mb-4 opacity-80">
                    <Zap size={18} />
                    <span className="text-sm font-bold uppercase tracking-wider">Readiness Score</span>
                </div>
                <div className="text-7xl font-bold mb-2">{data.score}</div>
                <div className="text-lg opacity-80 font-medium">/ 100 Points</div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/10 dark:border-slate-900/10">
                <div className="flex items-center gap-2 mb-2">
                    <div className={`h-3 w-3 rounded-full ${data.score > 70 ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
                    <span className="font-bold">Status: {data.score > 70 ? 'AI Ready' : 'Needs Optimization'}</span>
                </div>
                <p className="text-sm opacity-70">
                    Your infrastructure maturity analysis is complete.
                </p>
            </div>
        </div>

        {/* Live System Map - Replacing standard text analysis for improved UX */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2rem] p-0 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col">
             <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                        <Activity size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Live System Map</h3>
                </div>
                <div className="flex gap-2">
                    <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live</span>
                </div>
             </div>
             
             <div className="flex-1 relative bg-slate-50 dark:bg-slate-950/50 p-8 flex items-center justify-around">
                {/* Visual Nodes */}
                <div className="flex flex-col items-center gap-2 z-10">
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-lg relative">
                        <Database className="text-blue-500" size={32} />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                    </div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Sources</span>
                </div>

                {/* Animated Stream */}
                <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-800 relative mx-4 rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 w-1/3 h-full bg-indigo-500 animate-[shimmer_2s_infinite]"></div>
                </div>

                <div className="flex flex-col items-center gap-2 z-10">
                    <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl border-2 border-indigo-500 flex items-center justify-center shadow-xl shadow-indigo-500/20 relative">
                        <Brain className="text-indigo-600 dark:text-indigo-400" size={40} />
                    </div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Datova Engine</span>
                </div>

                {/* Animated Stream */}
                <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-800 relative mx-4 rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 w-1/3 h-full bg-indigo-500 animate-[shimmer_2s_infinite_0.5s]"></div>
                </div>

                <div className="flex flex-col items-center gap-2 z-10">
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-lg">
                        <BarChart3 className="text-purple-500" size={32} />
                    </div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Insights</span>
                </div>
             </div>
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { label: 'Data Sources', val: ingestionData.length, icon: Database, color: 'text-blue-500' },
                { label: 'Active Agents', val: agents.length, icon: Bot, color: 'text-purple-500' },
                { label: 'Anomalies', val: mockAnomalies.length, icon: AlertCircle, color: 'text-rose-500' },
                { label: 'Security Score', val: 'A+', icon: ShieldCheck, color: 'text-emerald-500' }
            ].map((stat, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-850 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm">
                    <stat.icon className={`${stat.color} mb-3`} size={24} />
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{stat.val}</div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">{stat.label}</div>
                </div>
            ))}
        </div>
    </div>
  );

  const renderFoundationTab = () => (
    <div className="animate-fade-in space-y-6">
        {/* UBDM Visualizer */}
        <FeatureCard title="Unified Business Data Model (UBDM)" className="lg:col-span-3">
            <div className="relative w-full overflow-x-auto pb-4">
               <div className="min-w-[800px] p-4 flex justify-between items-start gap-8 relative">
                  {/* SVG Layer for connectors */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                      {/* Customer to Transaction */}
                      <path d="M 280 140 C 350 140, 350 140, 420 140" fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="4 4" className="opacity-50" />
                      <circle cx="280" cy="140" r="3" fill="#6366f1" />
                      <circle cx="420" cy="140" r="3" fill="#6366f1" />
                      
                      {/* Customer to Agent (Logic) */}
                      <path d="M 280 180 C 350 180, 500 280, 680 180" fill="none" stroke="#e2e8f0" strokeWidth="2" className="dark:stroke-slate-700 opacity-50" />
                  </svg>

                  {mockUBDMEntities.map((entity, i) => (
                      <div key={entity.id} className="w-72 flex-shrink-0 z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm flex flex-col relative group hover:shadow-md transition-shadow">
                          {/* Entity Header */}
                          <div className={`p-3 border-b border-slate-100 dark:border-slate-800 rounded-t-xl flex justify-between items-center ${
                              entity.type === 'Master' ? 'bg-indigo-50 dark:bg-indigo-900/20' : 
                              entity.type === 'Event' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 
                              'bg-slate-50 dark:bg-slate-800'
                          }`}>
                              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                  {entity.type === 'Master' ? <User size={14} className="text-indigo-500" /> : 
                                   entity.type === 'Event' ? <Receipt size={14} className="text-emerald-500" /> : 
                                   <Bot size={14} className="text-slate-500" />}
                                  {entity.name}
                              </div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{entity.type}</span>
                          </div>
                          
                          {/* Fields List */}
                          <div className="p-3 space-y-2">
                              {entity.fields.map((field, j) => (
                                  <div key={j} className="flex justify-between items-center text-xs group/field relative cursor-help">
                                      <div className="flex items-center gap-2">
                                          {field.key === 'PK' && <Key size={10} className="text-amber-500" />}
                                          {field.key === 'FK' && <Link size={10} className="text-blue-500" />}
                                          <span className={`font-mono ${field.key ? 'font-bold text-slate-700 dark:text-slate-200' : 'text-slate-500'}`}>{field.name}</span>
                                      </div>
                                      <span className="text-slate-400">{field.type}</span>
                                      
                                      {/* Tooltip */}
                                      <div className="absolute left-0 bottom-full mb-2 w-48 bg-slate-900 text-white p-2 rounded-lg text-[10px] opacity-0 group-hover/field:opacity-100 pointer-events-none transition-opacity z-20 shadow-xl">
                                          <div className="font-bold mb-1">Origin: {field.origin}</div>
                                          <div className="opacity-80">{field.definition}</div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                          
                          {/* Footer Stats */}
                          <div className="mt-auto p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 rounded-b-xl flex justify-between items-center text-[10px]">
                              <span className="text-slate-500">Confidence</span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">{entity.identityStats.confidence}</span>
                          </div>
                      </div>
                  ))}
               </div>
            </div>
        </FeatureCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <FeatureCard title="Ingestion Pipelines" className="lg:col-span-2" action={
                <button onClick={handleOpenConnect} className="text-xs font-bold text-datova-500 hover:text-datova-600 flex items-center gap-1">
                    <Plus size={14} /> Add Source
                </button>
            }>
                <div className="space-y-3">
                    {ingestionData.map((source, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-md transition-all group">
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg ${source.status === 'Active' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30'}`}>
                                    <Database size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white">{source.source}</div>
                                    <div className="text-xs text-slate-500 flex items-center gap-2">
                                        <span>{source.type}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                        <span>{source.latency} latency</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">{source.records}</div>
                                <div className="text-[10px] text-slate-400 uppercase">Records</div>
                            </div>
                        </div>
                    ))}
                </div>
            </FeatureCard>

            <FeatureCard title="Warehouse Health">
                <div className="flex flex-col h-full justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Schema Consistency</span>
                            <span className="font-bold text-emerald-500">98.2%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[98.2%]"></div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Freshness (SLO)</span>
                            <span className="font-bold text-blue-500">100%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-full"></div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Cost Optimization</span>
                            <span className="font-bold text-amber-500">Fair</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 w-[65%]"></div>
                        </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-900 rounded-xl">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2">
                            <AlertOctagon size={14} /> Recent Anomaly
                        </div>
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            {mockAnomalies[0].desc}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">{mockAnomalies[0].time}</div>
                    </div>
                </div>
            </FeatureCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FeatureCard title="Data Cleaning Log">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Field</th>
                                <th className="px-4 py-3">Issue</th>
                                <th className="px-4 py-3">Action</th>
                                <th className="px-4 py-3 rounded-r-lg text-right">Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockCleaningLog.map((log, i) => (
                                <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">{log.field}</td>
                                    <td className="px-4 py-3 text-amber-600 dark:text-amber-400">{log.issue}</td>
                                    <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400">{log.action}</td>
                                    <td className="px-4 py-3 text-right font-bold">{log.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </FeatureCard>

            <FeatureCard title="Audit Stream">
                 <div className="space-y-4">
                    {mockWarehouseAudit.map((evt, i) => (
                        <div key={i} className="flex gap-4 items-start">
                            <div className="mt-1">
                                <div className={`w-2 h-2 rounded-full ${evt.status === 'Success' ? 'bg-emerald-500' : evt.status === 'Warning' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                            </div>
                            <div className="flex-1 border-b border-slate-50 dark:border-slate-800 pb-4 last:border-0 last:pb-0">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{evt.action}</span>
                                    <span className="text-[10px] font-mono text-slate-400">{evt.timestamp}</span>
                                </div>
                                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">{evt.details}</div>
                                <div className="flex gap-2">
                                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">{evt.source}</span>
                                    <span className="text-[10px] font-mono text-slate-400">{evt.hash}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>
            </FeatureCard>
        </div>
    </div>
  );

  const renderIntelligenceTab = () => (
    <div className="animate-fade-in space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <FeatureCard title="KPI Hierarchy" className="lg:col-span-1">
                <div className="space-y-6">
                    {mockKPIHierarchy.map((kpi, i) => (
                        <div key={i}>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm text-slate-500">{kpi.title}</span>
                                <span className={`text-xs font-bold ${kpi.trend.includes('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{kpi.trend}</span>
                            </div>
                            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{kpi.value}</div>
                            <div className="pl-4 border-l-2 border-slate-100 dark:border-slate-800 space-y-3">
                                {kpi.children.map((child, j) => (
                                    <div key={j} className="flex justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">{child.title}</span>
                                        <span className="font-mono font-bold text-slate-900 dark:text-white">{child.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </FeatureCard>

            <FeatureCard title="Forecasting & Metrics" className="lg:col-span-3" action={
                <button onClick={() => setShowForecast(!showForecast)} className="text-xs font-bold text-datova-500 flex items-center gap-1">
                    {showForecast ? <Eye size={14} /> : <BarChart3 size={14} />} {showForecast ? 'Hide Forecast' : 'Show Forecast'}
                </button>
            }>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={mockMetricData}>
                        <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorFc" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                        {showForecast && (
                            <Area type="monotone" dataKey="forecast" stroke="#10b981" strokeDasharray="5 5" fillOpacity={1} fill="url(#colorFc)" strokeWidth={2} />
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </FeatureCard>
        </div>

        <FeatureCard title="Explainability & Logic">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {mockLogicRules.map((rule) => (
                     <div key={rule.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-2 opacity-10">
                            {rule.type === 'Constraint' ? <Lock size={40} /> : <GitBranch size={40} />}
                         </div>
                         <div className="flex items-center gap-2 mb-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                rule.type === 'Constraint' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                            }`}>{rule.type}</span>
                         </div>
                         <div className="font-bold text-slate-900 dark:text-white mb-2">{rule.name}</div>
                         <div className="text-xs font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded text-slate-600 dark:text-slate-300 mb-2">
                             {rule.condition}
                         </div>
                         <div className="flex items-center gap-2 text-xs text-slate-500">
                             <ArrowRight size={12} /> {rule.action}
                         </div>
                         <button className="absolute bottom-2 right-2 text-[10px] text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold">Why?</button>
                     </div>
                 ))}
             </div>
        </FeatureCard>
    </div>
  );

  const renderAutomationTab = () => (
    <div className="animate-fade-in space-y-6 h-full flex flex-col">
        {/* Agent Fleet */}
        <FeatureCard title="Active Agent Fleet" action={
            <button onClick={handleOpenAgentModal} className="text-xs font-bold bg-datova-500 text-white px-3 py-1.5 rounded-lg hover:bg-datova-600 transition-colors flex items-center gap-1">
                <Plus size={14} /> Deploy Agent
            </button>
        }>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {agents.map((agent, i) => (
                    <div key={i} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                <Bot size={20} />
                            </div>
                            <span className={`h-2 w-2 rounded-full ${agent.status === 'active' || agent.status === 'busy' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                        </div>
                        <div className="font-bold text-slate-900 dark:text-white">{agent.name}</div>
                        <div className="text-xs text-slate-500 mb-4">{agent.role}</div>
                        
                        <div className="mt-auto">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-400">Load</span>
                                <span className="font-bold">{agent.load}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full ${agent.load > 80 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${agent.load}%` }}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </FeatureCard>

        {/* Workflow Canvas */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 relative overflow-hidden flex flex-col">
             <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center z-10">
                 <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Workflow size={16} /> Workflow Builder
                 </h4>
                 <div className="flex gap-2">
                     <button onClick={deleteSelected} disabled={!selectedNodeId} className="p-2 text-slate-400 hover:text-rose-500 disabled:opacity-30 transition-colors"><Trash2 size={18} /></button>
                     <button className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-xs font-bold hover:bg-indigo-600 transition-colors">Save Workflow</button>
                 </div>
             </div>
             
             <div className="flex flex-1 relative">
                 {/* Sidebar Tools */}
                 <div className="w-48 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 space-y-4 z-10">
                    <div className="text-xs font-bold text-slate-400 mb-2">Triggers</div>
                    <div draggable onDragStart={(e) => handleDragStart(e, 'trigger', 'New Trigger')} className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-move text-xs font-bold flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <Zap size={14} className="text-amber-500" /> Trigger
                    </div>
                    
                    <div className="text-xs font-bold text-slate-400 mb-2 mt-4">Logic</div>
                    <div draggable onDragStart={(e) => handleDragStart(e, 'decision', 'Decision')} className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-move text-xs font-bold flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <GitMerge size={14} className="text-blue-500" /> Decision
                    </div>
                    <div draggable onDragStart={(e) => handleDragStart(e, 'agent', 'Agent Task')} className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-move text-xs font-bold flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <Bot size={14} className="text-purple-500" /> AI Agent
                    </div>

                    <div className="text-xs font-bold text-slate-400 mb-2 mt-4">Actions</div>
                    <div draggable onDragStart={(e) => handleDragStart(e, 'action', 'Action')} className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-move text-xs font-bold flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <Play size={14} className="text-emerald-500" /> Action
                    </div>
                    <div draggable onDragStart={(e) => handleDragStart(e, 'db', 'DB Update')} className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-move text-xs font-bold flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <Database size={14} className="text-slate-500" /> Database
                    </div>
                 </div>

                 {/* Canvas Area */}
                 <div 
                    ref={canvasRef} 
                    className="flex-1 relative bg-grid-slate-200 dark:bg-grid-slate-800/20" 
                    onDrop={handleDrop} 
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => { setSelectedNodeId(null); setLinkingSourceId(null); }}
                 >
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {workflowEdges.map(edge => {
                            const source = workflowNodes.find(n => n.id === edge.source);
                            const target = workflowNodes.find(n => n.id === edge.target);
                            if (!source || !target) return null;
                            const path = `M ${source.x + 80} ${source.y + 30} C ${source.x + 120} ${source.y + 30}, ${target.x - 40} ${target.y + 30}, ${target.x} ${target.y + 30}`;
                            return (
                                <g key={edge.id}>
                                    <path d={path} stroke="#94a3b8" strokeWidth="2" fill="none" />
                                </g>
                            );
                        })}
                    </svg>

                    {workflowNodes.map(node => (
                        <div
                            key={node.id}
                            style={{ left: node.x, top: node.y }}
                            onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                            className={`absolute w-40 p-3 rounded-xl border-2 shadow-sm cursor-pointer transition-colors bg-white dark:bg-slate-900 group ${
                                selectedNodeId === node.id ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                {node.type === 'trigger' && <Zap size={14} className="text-amber-500" />}
                                {node.type === 'decision' && <GitMerge size={14} className="text-blue-500" />}
                                {node.type === 'agent' && <Bot size={14} className="text-purple-500" />}
                                {node.type === 'action' && <Play size={14} className="text-emerald-500" />}
                                {node.type === 'db' && <Database size={14} className="text-slate-500" />}
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{node.type}</span>
                            </div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{node.label}</div>
                            
                            <div 
                                onClick={(e) => startLinking(e, node.id)}
                                className={`absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-full flex items-center justify-center hover:border-indigo-500 hover:scale-110 transition-all ${linkingSourceId === node.id ? 'bg-indigo-500 border-indigo-500' : ''}`}
                            >
                                <Plus size={12} className={linkingSourceId === node.id ? 'text-white' : 'text-slate-400'} />
                            </div>
                        </div>
                    ))}
                 </div>
             </div>
        </div>
    </div>
  );

  const renderGovernanceTab = () => (
      <div className="animate-fade-in space-y-6 h-full pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard title="Risk Classification Engine" className="lg:col-span-1">
                <div className="h-full flex flex-col items-center justify-center py-4">
                    <div className="relative w-48 h-48 flex items-center justify-center">
                        <div className="absolute inset-0 border-[16px] border-slate-100 dark:border-slate-800 rounded-full"></div>
                        <div className="absolute inset-0 border-[16px] border-transparent border-t-rose-500 border-r-rose-500 rounded-full rotate-45"></div>
                        <div className="absolute inset-2 border-[1px] border-slate-200 dark:border-slate-700 rounded-full border-dashed"></div>
                        <div className="text-center z-10">
                            <div className="text-3xl font-bold text-rose-600 dark:text-rose-500">{mockGovernanceStats.riskLevel}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">EU AI Act Class</div>
                        </div>
                    </div>
                    <div className="mt-6 space-y-2 w-full">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">System Capability</span>
                            <span className="font-bold text-slate-900 dark:text-white">Autonomous Decisioning</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">Data Sensitivity</span>
                            <span className="font-bold text-slate-900 dark:text-white">PII / Financial</span>
                        </div>
                    </div>
                </div>
            </FeatureCard>

            <FeatureCard title="Governance Framework Mapper" className="lg:col-span-2">
                <div className="space-y-6">
                    {mockGovernanceStats.frameworks.map((fw, idx) => (
                        <div key={idx} className="space-y-2">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${fw.color}`}></div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{fw.name}</span>
                                </div>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                    fw.status === 'Compliant' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}>{fw.status}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full ${fw.color}`} style={{ width: `${fw.progress}%` }}></div>
                            </div>
                        </div>
                    ))}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <CheckCircle2 size={14} className="text-emerald-500"/> RBAC Enforced
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <CheckCircle2 size={14} className="text-emerald-500"/> Audit Logging Active
                        </div>
                    </div>
                </div>
            </FeatureCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FeatureCard title="Compliance Documentation Hub">
                <div className="flex flex-col h-full">
                    <p className="text-xs text-slate-500 mb-4">Auto-generated technical documentation based on live system metadata.</p>
                    <div className="space-y-2 mb-6">
                        {mockComplianceDocs.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-sm transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400">
                                        {doc.type === 'PDF' ? <FileText size={18}/> : <FileBadge size={18}/>}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-900 dark:text-white">{doc.name}</div>
                                        <div className="text-[10px] text-slate-400">{doc.date} • {doc.size}</div>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-600 rounded">{doc.status}</span>
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={() => setShowComplianceModal(true)}
                        className="mt-auto w-full py-3 bg-datova-500 hover:bg-datova-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-datova-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        <ShieldCheck size={16}/> Generate New Audit Pack
                    </button>
                </div>
            </FeatureCard>

            <FeatureCard title="Post-Market Monitoring">
                <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-xs text-slate-500">Incident vs Human Intervention tracking</p>
                        <div className="flex gap-3">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                <div className="w-2 h-2 rounded-full bg-rose-500"></div> Incidents
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Human
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 min-h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockGovernanceStats.postMarket}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                <Bar dataKey="incidents" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={12} />
                                <Bar dataKey="interventions" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={12} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </FeatureCard>
        </div>
      </div>
  );

  const renderValueTab = () => (
      <div className="animate-fade-in space-y-6 h-full pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-[1.5rem] flex flex-col justify-center">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold mb-1">
                    <DollarSign size={18} /> Total Saved
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">${mockRoiData.summary.totalSaved.toLocaleString()}</div>
                <div className="text-xs text-slate-500">YTD (Year to Date)</div>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-[1.5rem] flex flex-col justify-center">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold mb-1">
                    <Clock size={18} /> Time Saved
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{mockRoiData.summary.hoursSaved.toLocaleString()}h</div>
                <div className="text-xs text-slate-500">Man-hours redirected</div>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800 rounded-[1.5rem] flex flex-col justify-center">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold mb-1">
                    <TrendingUp size={18} /> ROI Multiplier
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{mockRoiData.summary.roiMultiplier}x</div>
                <div className="text-xs text-slate-500">Return on Tech Spend</div>
            </div>
            <button className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[1.5rem] flex flex-col justify-center items-center text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={() => setNotification({ message: 'CFO Report generated and sent to email.', type: 'success' })}>
                <FileText size={24} className="text-slate-400 mb-2" />
                <div className="font-bold text-slate-900 dark:text-white text-sm">Generate CFO Report</div>
                <div className="text-[10px] text-slate-500">Download PDF Executive Summary</div>
            </button>
        </div>

        <FeatureCard title="Cost Comparison: Manual vs. Automated">
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockRoiData.cumulative}>
                    <defs>
                        <linearGradient id="colorManual" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorAuto" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                    <Area type="monotone" dataKey="manualCost" name="Projected Manual Cost" stroke="#94a3b8" strokeDasharray="5 5" fillOpacity={1} fill="url(#colorManual)" strokeWidth={2} />
                    <Area type="monotone" dataKey="automationCost" name="Actual Automation Cost" stroke="#10b981" fillOpacity={1} fill="url(#colorAuto)" strokeWidth={3} />
                </AreaChart>
            </ResponsiveContainer>
        </FeatureCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FeatureCard title="ROI by Agent">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Agent</th>
                                <th className="px-4 py-3 text-right">Vol/Mo</th>
                                <th className="px-4 py-3 text-right">Cycle Time</th>
                                <th className="px-4 py-3 rounded-r-lg text-right">Net Savings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {mockRoiData.agentBreakdown.map((agent, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Bot size={14} className="text-datova-500" /> {agent.name}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono text-slate-500">{agent.volume.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right text-blue-500 font-bold">{agent.cycleTime}</td>
                                    <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                        +${agent.savings.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </FeatureCard>

            <FeatureCard title="Opportunity Simulator" className="bg-indigo-50 dark:bg-slate-900 border-indigo-100 dark:border-slate-800">
                <div className="flex flex-col h-full justify-between">
                    <div className="space-y-6">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Estimate savings for a new process automation.</p>
                        <div>
                            <div className="flex justify-between mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                <label>Monthly Volume</label>
                                <span className="text-datova-600">{forecastInput.volume.toLocaleString()} tasks</span>
                            </div>
                            <input 
                                type="range" 
                                min="100" max="10000" step="100"
                                value={forecastInput.volume}
                                onChange={(e) => setForecastInput({...forecastInput, volume: parseInt(e.target.value)})}
                                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-datova-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Process Complexity</label>
                            <div className="flex gap-2">
                                {['Low', 'Medium', 'High'].map(level => (
                                    <button 
                                        key={level}
                                        onClick={() => setForecastInput({...forecastInput, complexity: level})}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                                            forecastInput.complexity === level 
                                            ? 'bg-indigo-500 text-white border-indigo-500 shadow-md' 
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                                        }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-slate-500">Projected Monthly Savings</span>
                            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                ${ (forecastInput.volume * (forecastInput.complexity === 'Low' ? 5 : forecastInput.complexity === 'Medium' ? 12 : 25) * 0.8).toLocaleString() }
                            </span>
                        </div>
                        <div className="text-right text-[10px] text-slate-400">Based on avg manual cost vs. token usage</div>
                    </div>
                </div>
            </FeatureCard>
        </div>
      </div>
  );

  const renderReliabilityTab = () => (
    <div className="animate-fade-in space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard title="System Health">
                <div className="flex items-center gap-4 mb-6">
                     <div className="h-16 w-16 rounded-full border-4 border-emerald-500 flex items-center justify-center">
                         <Activity className="text-emerald-500" size={32} />
                     </div>
                     <div>
                         <div className="text-2xl font-bold text-slate-900 dark:text-white">Healthy</div>
                         <div className="text-sm text-slate-500">All systems operational</div>
                     </div>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Global Uptime</span>
                        <span className="font-mono font-bold">{dashboardContext.systemHealth.uptime}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Avg Latency</span>
                        <span className="font-mono font-bold">{dashboardContext.systemHealth.latency}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Error Rate</span>
                        <span className="font-mono font-bold text-emerald-500">{dashboardContext.systemHealth.errors}</span>
                    </div>
                </div>
            </FeatureCard>
            
            <FeatureCard title="Latency Trend" className="md:col-span-2">
                 <ResponsiveContainer width="100%" height={200}>
                     <LineChart data={mockLatencyData}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                         <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                         <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                         <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                         />
                         <Line type="monotone" dataKey="latency" stroke="#f59e0b" strokeWidth={2} dot={false} />
                     </LineChart>
                 </ResponsiveContainer>
            </FeatureCard>
        </div>

        <FeatureCard title="Failure Traces">
             <div className="space-y-2">
                 {mockFailureTraces.map((trace, i) => (
                     <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                         <div className="flex items-center gap-4">
                             <div className="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-lg">
                                 <AlertTriangle size={20} />
                             </div>
                             <div>
                                 <div className="font-bold text-slate-900 dark:text-white text-sm">{trace.error}</div>
                                 <div className="text-xs text-slate-500 flex items-center gap-2">
                                     <span className="font-mono">{trace.id}</span>
                                     <span>•</span>
                                     <span>{trace.rootCause}</span>
                                 </div>
                             </div>
                         </div>
                         <div className="text-right">
                             <span className={`text-xs font-bold px-2 py-1 rounded ${
                                 trace.status === 'Remediated' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                             }`}>{trace.status}</span>
                             <div className="text-[10px] text-slate-400 mt-1">{trace.time}</div>
                         </div>
                     </div>
                 ))}
             </div>
        </FeatureCard>
    </div>
  );

  const renderAIConsoleTab = () => (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-950 rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800 relative">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
             {chatMessages.map((msg, idx) => (
                 <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[80%] p-4 rounded-2xl ${
                         msg.role === 'user' 
                         ? 'bg-datova-500 text-white rounded-br-none' 
                         : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-sm rounded-bl-none border border-slate-200 dark:border-slate-800'
                     }`}>
                         {msg.role === 'ai' && (
                             <div className="flex items-center gap-2 mb-2 text-xs font-bold text-datova-500">
                                 <Sparkles size={12} /> Datova AI
                             </div>
                         )}
                         <div className="whitespace-pre-wrap text-sm leading-relaxed">
                            {renderFormattedText(msg.text)}
                         </div>
                     </div>
                 </div>
             ))}
             {isChatTyping && (
                 <div className="flex justify-start">
                     <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl rounded-bl-none shadow-sm border border-slate-200 dark:border-slate-800 flex gap-1">
                         <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                         <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                         <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                     </div>
                 </div>
             )}
             <div ref={chatEndRef}></div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-10">
             <form onSubmit={handleChatSubmit} className="relative">
                 <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about your data anomalies, revenue trends, or system health..."
                    className="w-full pl-6 pr-14 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-datova-500 outline-none transition-all dark:text-white"
                 />
                 <button 
                    type="submit" 
                    disabled={!chatInput.trim() || isChatTyping}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-datova-500 text-white rounded-lg disabled:opacity-50 hover:bg-datova-600 transition-colors"
                 >
                     <Send size={18} />
                 </button>
             </form>
             <div className="text-center mt-2">
                 <p className="text-[10px] text-slate-400">
                     AI Analyst has read-only access to your dashboard metrics. It cannot modify data.
                 </p>
             </div>
        </div>
    </div>
  );

  const renderConnectModal = () => {
    if (!showConnectModal) return null;

    const integrations = [
        { name: 'Salesforce', icon: Cloud, type: 'CRM' },
        { name: 'Shopify', icon: Store, type: 'E-commerce' },
        { name: 'PostgreSQL', icon: Database, type: 'Database' },
        { name: 'HubSpot', icon: Globe, type: 'CRM' },
        { name: 'Google Sheets', icon: FileSpreadsheet, type: 'Spreadsheet' },
        { name: 'BigQuery', icon: HardDrive, type: 'Data Warehouse' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Connect Data Source</h3>
                        <p className="text-sm text-slate-500">Step {connectStep} of 2</p>
                    </div>
                    <button onClick={() => setShowConnectModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    {connectStep === 1 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {integrations.map((int, i) => (
                                <button 
                                    key={i}
                                    onClick={() => handleSelectIntegration(int)}
                                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex flex-col items-center gap-3 group text-center"
                                >
                                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 group-hover:text-indigo-500 transition-colors">
                                        <int.icon size={24} />
                                    </div>
                                    <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{int.name}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                                <div className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm">
                                    {selectedIntegration?.icon && <selectedIntegration.icon size={24} className="text-indigo-500" />}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white">{selectedIntegration?.name}</div>
                                    <div className="text-xs text-slate-500">Configure connection settings</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Pipeline Name</label>
                                    <input 
                                        type="text" 
                                        value={configForm.name}
                                        onChange={(e) => setConfigForm({...configForm, name: e.target.value})}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Sync Method</label>
                                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                            <button 
                                                onClick={() => setSyncMode('webhook')}
                                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${syncMode === 'webhook' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
                                            >
                                                Webhook
                                            </button>
                                            <button 
                                                onClick={() => setSyncMode('schedule')}
                                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${syncMode === 'schedule' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
                                            >
                                                Polled
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Environment</label>
                                        <select className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none dark:text-white text-sm">
                                            <option>Production</option>
                                            <option>Staging</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">API Key / Token</label>
                                    <div className="relative">
                                        <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input 
                                            type="password" 
                                            value="sk_live_xxxxxxxxxxxx"
                                            readOnly
                                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 font-mono text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between bg-slate-50 dark:bg-slate-900/50">
                    {connectStep === 2 ? (
                        <button 
                            onClick={() => setConnectStep(1)}
                            className="px-4 py-2 text-slate-500 font-bold hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                        >
                            Back
                        </button>
                    ) : (
                        <div></div>
                    )}
                    
                    {connectStep === 2 ? (
                         <div className="flex gap-3">
                             <button 
                                onClick={handleTestConnection}
                                disabled={isTestingConnection}
                                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                             >
                                {isTestingConnection ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                                Test
                             </button>
                             <button 
                                onClick={handleCreatePipeline}
                                className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-bold shadow-lg shadow-indigo-500/20 transition-all"
                             >
                                Create Pipeline
                             </button>
                         </div>
                    ) : (
                         <div className="text-xs text-slate-400">Select a source to continue</div>
                    )}
                </div>
            </div>
        </div>
    );
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
                    <button onClick={() => setShowAgentModal(false)}><X size={20} className="text-slate-400" /></button>
                </div>
                
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Agent Name</label>
                        <input 
                            type="text" 
                            value={agentConfig.name}
                            onChange={(e) => setAgentConfig({...agentConfig, name: e.target.value})}
                            placeholder="e.g., Returns Specialist"
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Role / Archetype</label>
                        <select 
                            value={agentConfig.role}
                            onChange={(e) => setAgentConfig({...agentConfig, role: e.target.value})}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white"
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
                            <label className="flex items-center gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                                <input 
                                    type="checkbox" 
                                    checked={agentConfig.capabilities.read}
                                    onChange={(e) => setAgentConfig({...agentConfig, capabilities: {...agentConfig.capabilities, read: e.target.checked}})}
                                    className="rounded border-slate-300 text-datova-500 focus:ring-datova-500"
                                />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Read Access (Knowledge Base)</span>
                            </label>
                            <label className="flex items-center gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                                <input 
                                    type="checkbox" 
                                    checked={agentConfig.capabilities.write}
                                    onChange={(e) => setAgentConfig({...agentConfig, capabilities: {...agentConfig.capabilities, write: e.target.checked}})}
                                    className="rounded border-slate-300 text-datova-500 focus:ring-datova-500"
                                />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Write Access (Perform Actions)</span>
                            </label>
                            <label className="flex items-center gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                                <input 
                                    type="checkbox" 
                                    checked={agentConfig.capabilities.humanApproval}
                                    onChange={(e) => setAgentConfig({...agentConfig, capabilities: {...agentConfig.capabilities, humanApproval: e.target.checked}})}
                                    className="rounded border-slate-300 text-datova-500 focus:ring-datova-500"
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

  const renderComplianceModal = () => {
    if (!showComplianceModal) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 text-center p-8">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Generating Audit Pack</h3>
                <p className="text-slate-500 mb-8">
                    Datova is compiling technical documentation, bias reports, and risk assessments for your AI systems.
                </p>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <span>Progress</span>
                        <span>{complianceStep === 1 ? '35%' : '100%'}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full bg-emerald-500 transition-all duration-1000 ${complianceStep === 1 ? 'w-1/3' : 'w-full'}`}></div>
                    </div>
                    <div className="text-xs text-slate-400">
                        {complianceStep === 1 ? 'Scanning Model Registry...' : 'Finalizing PDF...'}
                    </div>
                </div>

                {complianceStep === 1 ? (
                    <button 
                        onClick={() => {
                            setComplianceStep(2);
                            setTimeout(() => {
                                setShowComplianceModal(false);
                                setComplianceStep(1);
                                setNotification({ message: 'Audit Pack downloaded successfully.', type: 'success' });
                            }, 1500);
                        }}
                        className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold"
                    >
                        Start Generation
                    </button>
                ) : (
                    <button disabled className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                        <Loader2 size={18} className="animate-spin" /> Processing
                    </button>
                )}
            </div>
        </div>
    );
  };

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
                    <NavItem active={activeTab === 'value'} onClick={() => setActiveTab('value')} icon={TrendingUp} label="Layer 5: Value" />
                </div>

                <div>
                    <h3 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">System</h3>
                    <NavItem active={activeTab === 'reliability'} onClick={() => setActiveTab('reliability')} icon={Shield} label="Reliability" />
                    <NavItem active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={Lock} label="Security" />
                    <NavItem active={activeTab === 'developer'} onClick={() => setActiveTab('developer')} icon={Terminal} label="Developer" />
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
                {activeTab === 'value' && renderValueTab()}
                {activeTab === 'reliability' && renderReliabilityTab()}
                {activeTab === 'security' && renderSecurityTab()}
                {activeTab === 'developer' && renderDeveloperTab()}
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