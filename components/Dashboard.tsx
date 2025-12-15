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
  Loader2, Check, Coins, Calculator, Receipt, PieChart as PieChartIcon
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

const mockSeasonalityData = [
  { month: 'Jan', current: 4000, lastYear: 3200, seasonality: 'Low' },
  { month: 'Feb', current: 4200, lastYear: 3400, seasonality: 'Low' },
  { month: 'Mar', current: 5800, lastYear: 4500, seasonality: 'High' }, // Spike
  { month: 'Apr', current: 5100, lastYear: 4100, seasonality: 'Medium' },
  { month: 'May', current: 5300, lastYear: 4300, seasonality: 'Medium' },
  { month: 'Jun', current: 6100, lastYear: 4800, seasonality: 'High' },
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
        { name: "Support Triage Agent", manualCostPerTask: 12.50, aiCostPerTask: 0.45, volume: 4500, savings: 54225, errorReduction: '95%' },
        { name: "Invoice Processor", manualCostPerTask: 8.00, aiCostPerTask: 0.12, volume: 1200, savings: 9456, errorReduction: '99%' },
        { name: "Lead Enricher", manualCostPerTask: 3.50, aiCostPerTask: 0.05, volume: 8000, savings: 27600, errorReduction: '80%' },
    ],
    summary: {
        totalSaved: 142500,
        hoursSaved: 2450,
        roiMultiplier: 12.4
    }
};

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
  const [activeTab, setActiveTab] = useState<DashboardTab | 'governance' | 'value'>('overview');
  
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

  // Orchestration & Controls State
  const [executionControls, setExecutionControls] = useState({
    globalKillSwitch: false,
    maxDailyCost: 50,
    rateLimit: 100 // req/min
  });

  // Compliance Generator State
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [complianceStep, setComplianceStep] = useState(1);

  // Forecasting State
  const [forecastInput, setForecastInput] = useState({
      volume: 1000,
      complexity: 'Medium'
  });

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

  const renderValueTab = () => (
      <div className="animate-fade-in space-y-6 h-full pb-6">
        {/* Top KPI Cards */}
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
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[1.5rem] flex flex-col justify-center items-center text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <FileText size={24} className="text-slate-400 mb-2" />
                <div className="font-bold text-slate-900 dark:text-white text-sm">Generate CFO Report</div>
                <div className="text-[10px] text-slate-500">Download PDF Executive Summary</div>
            </div>
        </div>

        {/* Cost Analysis Chart */}
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
                    <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [`$${value.toLocaleString()}`, "Cost"]}
                    />
                    <Legend verticalAlign="top" iconType="circle" wrapperStyle={{ fontSize: '12px', paddingBottom: '20px' }} />
                    <Area type="monotone" dataKey="manualCost" name="Projected Manual Cost" stroke="#94a3b8" strokeDasharray="5 5" fillOpacity={1} fill="url(#colorManual)" strokeWidth={2} />
                    <Area type="monotone" dataKey="automationCost" name="Actual Automation Cost" stroke="#10b981" fillOpacity={1} fill="url(#colorAuto)" strokeWidth={3} />
                </AreaChart>
            </ResponsiveContainer>
        </FeatureCard>

        {/* Agent Breakdown & Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Agent ROI Table */}
            <FeatureCard title="ROI by Agent">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Agent</th>
                                <th className="px-4 py-3 text-right">Vol/Mo</th>
                                <th className="px-4 py-3 text-right">Manual Cost</th>
                                <th className="px-4 py-3 text-right">AI Cost</th>
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
                                    <td className="px-4 py-3 text-right text-slate-500">${agent.manualCostPerTask}</td>
                                    <td className="px-4 py-3 text-right text-slate-500">${agent.aiCostPerTask}</td>
                                    <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                        +${agent.savings.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </FeatureCard>

            {/* Forecasting Simulator */}
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
                        <div className="text-right text-[10px] text-slate-400">
                            Based on avg manual cost vs. token usage
                        </div>
                        <button className="w-full mt-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2">
                            <Calculator size={16} /> Add to Roadmap
                        </button>
                    </div>
                </div>
            </FeatureCard>
        </div>
      </div>
  );

  // ... (Other render functions) ...

  const renderComplianceModal = () => {
    // ... (Existing Implementation) ...
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
                {activeTab === 'value' && renderValueTab()}
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