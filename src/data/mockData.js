// ==========================================================================
// ARRIVE Control Tower — Mock Data Layer
// Phase 1 is UI-only. Every number below is realistic sample data standing
// in for the Google Sheets-backed Apps Script API that lands in Phase 2.
// Swap this file's exports for real API calls without touching any page.
// ==========================================================================

// --- tiny seeded PRNG so numbers are stable across a session ---
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const int = (min, max) => Math.floor(min + rand() * (max - min + 1));

export const users = [
  {
    id: 'u-1001',
    name: 'Mona El-Sayed',
    role: 'Audit Manager',
    email: 'mona.elsayed@arriveexpress.com',
    password: '123456',
    avatarColor: '#12309C',
    initials: 'ME',
    status: 'active',
  },
  {
    id: 'u-1002',
    name: 'Ahmed Nabil',
    role: 'Auditor',
    email: 'ahmed.nabil@arriveexpress.com',
    password: '123456',
    avatarColor: '#1565C0',
    initials: 'AN',
    status: 'active',
  },
  {
    id: 'u-1003',
    name: 'Sara Kamal',
    role: 'Auditor',
    email: 'sara.kamal@arriveexpress.com',
    password: '123456',
    avatarColor: '#2E7D32',
    initials: 'SK',
    status: 'active',
  },
  {
    id: 'u-1004',
    name: 'Youssef Adel',
    role: 'Branch Manager',
    email: 'youssef.adel@arriveexpress.com',
    password: '123456',
    avatarColor: '#ED6C02',
    initials: 'YA',
    status: 'active',
  },
];

export const branches = [
  'Cairo HQ',
  'Giza',
  'Alexandria',
  'Mansoura',
  '6th of October',
  'Tanta',
  'Ismailia',
  'Assiut',
  'Zagazig',
  'Hurghada',
  'Sohag',
  'Damietta',
].map((name, i) => {
  const today = int(80, 420);
  const missing = int(0, 14);
  const repeated = int(0, 9);
  const open = int(2, 26);
  const closed = today - open - int(0, 5);
  const compliance = Math.max(62, 100 - missing * 2.4 - repeated * 1.6 - int(0, 6));
  const health = Math.round(Math.max(50, Math.min(99, compliance - missing * 0.8 + int(-4, 4))));
  return {
    id: `br-${i + 1}`,
    name,
    region: i < 4 ? 'Greater Cairo' : i < 8 ? 'Delta' : 'Upper Egypt & Red Sea',
    manager: pick(['Ahmed Nabil', 'Sara Kamal', 'Youssef Adel', 'Nour Hassan', 'Karim Fathy', 'Laila Mostafa']),
    todayShipments: today,
    open,
    missing,
    repeated,
    closed: Math.max(closed, 0),
    compliance: Math.round(compliance),
    healthScore: health,
    trend: pick(['up', 'up', 'down', 'flat']),
    trendValue: int(1, 9),
  };
});

export const executiveSummary = {
  todayShipments: branches.reduce((a, b) => a + b.todayShipments, 0),
  openCases: branches.reduce((a, b) => a + b.open, 0),
  missing: branches.reduce((a, b) => a + b.missing, 0),
  repeated: branches.reduce((a, b) => a + b.repeated, 0),
  criticalShipments: 17,
  closedToday: branches.reduce((a, b) => a + b.closed, 0),
  slaPercent: 96.4,
  compliancePercent: Math.round(branches.reduce((a, b) => a + b.compliance, 0) / branches.length),
  healthScore: Math.round(branches.reduce((a, b) => a + b.healthScore, 0) / branches.length),
  lastUpdate: '2 minutes ago',
  backendConnected: true,
  databaseConnected: true,
};

export const liveAlerts = [
  { id: 1, severity: 'critical', branch: 'Alexandria', message: '12 missing shipments flagged', time: '6m ago' },
  { id: 2, severity: 'high', branch: 'Tanta', message: '8 open cases exceeding 15 days', time: '22m ago' },
  { id: 3, severity: 'medium', branch: 'Cairo HQ', message: 'Repeated shipments trending up', time: '41m ago' },
  { id: 4, severity: 'medium', branch: 'Hurghada', message: 'Compliance dropped below 80%', time: '1h ago' },
  { id: 5, severity: 'low', branch: 'Giza', message: 'All cases closed ahead of SLA', time: '2h ago' },
];

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const weeklyTrend = days.map((d) => ({
  day: d,
  shipments: int(1600, 2400),
  closed: int(1400, 2200),
  slaBreaches: int(10, 60),
}));

export const monthlyTrend = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
  shipments: int(38000, 58000),
  closedOnTime: int(34000, 55000),
  compliance: int(88, 98),
}));

export const caseStatusBreakdown = [
  { name: 'Closed', value: 68, color: '#1AA971' },
  { name: 'Open', value: 19, color: '#12C6D3' },
  { name: 'Missing', value: 8, color: '#E8A317' },
  { name: 'Repeated', value: 5, color: '#E0473F' },
];

const caseTypes = ['Missing Scan', 'Delivery Delay', 'Duplicate Entry', 'Address Mismatch', 'Recipient Unavailable', 'Damaged Package', 'Weight Discrepancy'];
const statuses = ['Open', 'Pending Branch', 'Escalated', 'Closed', 'Missing'];
const priorities = ['Critical', 'High', 'Medium', 'Low'];

export const operationsCases = Array.from({ length: 86 }, (_, i) => {
  const branch = pick(branches);
  const opened = int(0, 6);
  return {
    id: `AWB-${100000 + i}`,
    branch: branch.name,
    type: pick(caseTypes),
    status: pick(statuses),
    priority: pick(priorities),
    openedDaysAgo: opened,
    assignedTo: pick(['Ahmed Nabil', 'Sara Kamal', 'Youssef Adel', 'Nour Hassan', 'Unassigned']),
    lastUpdate: opened === 0 ? 'Today' : `${opened}d ago`,
    slaHours: int(-12, 48),
  };
});

export const auditCases = Array.from({ length: 54 }, (_, i) => {
  const branch = pick(branches);
  return {
    id: `AUD-${5000 + i}`,
    branch: branch.name,
    auditor: pick(['Mona El-Sayed', 'Tarek Fahmy', 'Hend Sabry', 'Omar Rady']),
    caseType: pick(caseTypes),
    status: pick(['Open', 'Awaiting Reply', 'Under Review', 'Closed', 'Escalated']),
    branchReplied: rand() > 0.4,
    daysOpen: int(0, 12),
    compliance: pick(['Compliant', 'Non-Compliant', 'Partial']),
  };
});

export const auditorPerformance = ['Mona El-Sayed', 'Tarek Fahmy', 'Hend Sabry', 'Omar Rady'].map((name) => ({
  name,
  casesHandled: int(80, 210),
  avgResolutionHrs: int(6, 30),
  complianceScore: int(84, 99),
}));

export const activityFeed = [
  { id: 1, time: '2m ago', actor: 'System', action: 'Daily sheet generated for all branches', type: 'system' },
  { id: 2, time: '14m ago', actor: 'Sara Kamal', action: 'Closed 6 open cases in Giza branch', type: 'success' },
  { id: 3, time: '28m ago', actor: 'System', action: 'SLA breach detected — Alexandria, AWB-100042', type: 'warning' },
  { id: 4, time: '41m ago', actor: 'Ahmed Nabil', action: 'Replied to audit case AUD-5012', type: 'info' },
  { id: 5, time: '1h ago', actor: 'System', action: 'Missing shipments report rebuilt (14 flagged)', type: 'warning' },
  { id: 6, time: '2h ago', actor: 'Tarek Fahmy', action: 'Escalated AUD-5033 to branch management', type: 'critical' },
  { id: 7, time: '3h ago', actor: 'System', action: 'Backup completed successfully', type: 'system' },
  { id: 8, time: '4h ago', actor: 'Youssef Adel', action: 'Marked 12 repeated cases resolved in Tanta', type: 'success' },
];

export const notifications = [
  { id: 1, title: 'Critical SLA breach', body: 'Alexandria branch exceeded 48h resolution on 3 cases.', time: '10m ago', severity: 'critical', read: false },
  { id: 2, title: 'Audit reply received', body: 'Mansoura branch replied to AUD-5021.', time: '32m ago', severity: 'info', read: false },
  { id: 3, title: 'Daily sheet ready', body: "Today's operational sheet has been generated.", time: '1h ago', severity: 'success', read: false },
  { id: 4, title: 'Repeated case pattern', body: '6th of October shows a rising repeated-case trend.', time: '3h ago', severity: 'warning', read: true },
  { id: 5, title: 'Backup completed', body: 'Nightly backup finished with no errors.', time: 'Yesterday', severity: 'success', read: true },
];

export const aiInsights = [
  { id: 1, kind: 'best', title: 'Best Performing Branch', branch: 'Giza', detail: 'Highest compliance (98%) with zero repeated cases for 6 consecutive days.', confidence: 96, impact: 'high' },
  { id: 2, kind: 'worst', title: 'Needs Attention', branch: 'Alexandria', detail: 'Compliance dropped 6 pts this week; missing-shipment rate above network average.', confidence: 91, impact: 'high' },
  { id: 3, kind: 'risk', title: 'Operational Risk', branch: 'Hurghada', detail: 'Repeated cases up 40% week-over-week — pattern suggests a scanning process gap.', confidence: 84, impact: 'high' },
  { id: 4, kind: 'risk', title: 'Operational Risk', branch: 'Tanta', detail: '8 open cases have exceeded 15 days without branch reply, risking SLA breach.', confidence: 88, impact: 'medium' },
  { id: 5, kind: 'recommendation', title: 'Recommendation', branch: 'Network-wide', detail: 'Shift 2 auditors toward Delta region branches to reduce average resolution time.', confidence: 79, impact: 'medium' },
  { id: 6, kind: 'recommendation', title: 'Recommendation', branch: '6th of October', detail: 'Introduce a second daily scan checkpoint to curb the rising repeated-case trend.', confidence: 74, impact: 'medium' },
  { id: 7, kind: 'trend', title: 'Trend Analysis', branch: 'Network-wide', detail: 'SLA compliance has improved for 3 consecutive weeks, currently at 96.4%.', confidence: 93, impact: 'medium' },
  { id: 8, kind: 'prediction', title: 'Prediction', branch: 'Cairo HQ', detail: 'Projected to close the month above 97% compliance at current trajectory.', confidence: 82, impact: 'low' },
  { id: 9, kind: 'prediction', title: 'Prediction', branch: 'Network-wide', detail: 'At current growth, daily shipment volume will cross 2,600 within 3 weeks.', confidence: 71, impact: 'low' },
];

export const systemHealth = {
  overall: 98.2,
  uptime: '29d 14h',
  lastSync: '2 minutes ago',
  services: [
    { name: 'Google Sheets Sync', status: 'operational', latencyMs: 210 },
    { name: 'Daily Sheet Builder', status: 'operational', latencyMs: 640 },
    { name: 'Audit Import Job', status: 'operational', latencyMs: 380 },
    { name: 'Backup Service', status: 'operational', latencyMs: 1200 },
    { name: 'Notification Dispatcher', status: 'degraded', latencyMs: 2100 },
  ],
};

export const kpiDaily = Array.from({ length: 14 }, (_, i) => ({
  label: `D-${13 - i}`,
  sla: int(90, 99),
  compliance: int(85, 98),
}));
