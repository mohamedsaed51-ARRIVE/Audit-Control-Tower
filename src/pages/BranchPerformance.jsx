import { Box, Typography, LinearProgress, Stack } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import SectionCard from '../components/common/SectionCard';
import EnterpriseTable from '../components/common/EnterpriseTable';
import TrendChip from '../components/common/TrendChip';
import { branches } from '../data/mockData';

export default function BranchPerformance() {
  const columns = [
    { field: 'name', label: 'Branch', minWidth: 160, render: (r) => (
      <Box>
        <Typography variant="body2" fontWeight={700}>{r.name}</Typography>
        <Typography variant="caption" color="text.secondary">{r.region}</Typography>
      </Box>
    ) },
    { field: 'todayShipments', label: "Today's Shipments", minWidth: 130 },
    { field: 'open', label: 'Open', minWidth: 80 },
    { field: 'missing', label: 'Missing', minWidth: 90, render: (r) => (
      <Typography variant="body2" fontWeight={700} color={r.missing > 8 ? 'error.main' : r.missing > 3 ? 'warning.main' : 'text.primary'}>{r.missing}</Typography>
    ) },
    { field: 'repeated', label: 'Repeated', minWidth: 90 },
    { field: 'closed', label: 'Closed', minWidth: 90 },
    {
      field: 'compliance', label: 'Compliance %', minWidth: 160, render: (r) => (
        <Stack sx={{ width: 130 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="caption" fontWeight={700}>{r.compliance}%</Typography>
          </Stack>
          <LinearProgress variant="determinate" value={r.compliance} color={r.compliance > 90 ? 'success' : r.compliance > 75 ? 'warning' : 'error'} sx={{ mt: 0.4 }} />
        </Stack>
      ),
    },
    { field: 'healthScore', label: 'Health Score', minWidth: 110, render: (r) => (
      <Typography variant="body2" fontWeight={700}>{r.healthScore}</Typography>
    ) },
    { field: 'trend', label: 'Trend', minWidth: 100, sortable: false, render: (r) => <TrendChip direction={r.trend} value={r.trendValue} /> },
  ];

  return (
    <Box>
      <PageHeader title="Branch Performance" subtitle="Compare every branch on volume, compliance, and health." />
      <SectionCard title="All Branches" subtitle={`${branches.length} branches across 3 regions`}>
        <EnterpriseTable
          title="branches"
          columns={columns}
          rows={branches}
          searchKeys={['name', 'region', 'manager']}
          exportFilename="branch-performance.csv"
          defaultSort="healthScore"
        />
      </SectionCard>
    </Box>
  );
}
