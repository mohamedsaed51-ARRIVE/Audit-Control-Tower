import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import SummarizeRoundedIcon from '@mui/icons-material/SummarizeRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import MonitorHeartRoundedIcon from '@mui/icons-material/MonitorHeartRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

export const navSections = [
  {
    heading: 'Overview',
    items: [
      { label: 'Executive Dashboard', path: '/', icon: SpaceDashboardRoundedIcon },
    ],
  },
  {
    heading: 'Operations',
    items: [
      { label: 'Operations', path: '/operations', icon: LocalShippingRoundedIcon },
      { label: 'Audit', path: '/audit', icon: FactCheckRoundedIcon },
      { label: 'Branch Performance', path: '/branches', icon: AccountTreeRoundedIcon },
    ],
  },
  {
    heading: 'Intelligence',
    items: [
      { label: 'KPI Dashboard', path: '/kpi', icon: InsightsRoundedIcon },
      { label: 'Reports', path: '/reports', icon: SummarizeRoundedIcon },
      { label: 'AI Insights', path: '/ai-insights', icon: AutoAwesomeRoundedIcon, badge: 'New' },
    ],
  },
  {
    heading: 'System',
    items: [
      { label: 'System Health', path: '/system-health', icon: MonitorHeartRoundedIcon },
      { label: 'Settings', path: '/settings', icon: SettingsRoundedIcon },
    ],
  },
];

export const flatNavItems = navSections.flatMap((s) => s.items);
