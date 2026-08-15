import { useState, useMemo } from 'react';
import { Box, Grid, MenuItem, Select, Stack, Typography } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import SectionCard from '../components/common/SectionCard';
import KpiCard from '../components/common/KpiCard';
import EnterpriseTable from '../components/common/EnterpriseTable';
import StatusChip from '../components/common/StatusChip';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import { operationsCases, branches } from '../data/mockData';

export default function Operations() {
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRows = useMemo(
    () =>
      operationsCases.filter(
        (r) => (branchFilter === 'all' || r.branch === branchFilter) && (statusFilter === 'all' || r.status === statusFilter)
      ),
    [branchFilter, statusFilter]
  );

  const breaches = operationsCases.filter((c) => c.slaHours < 0).length;
  const unassigned = operationsCases.filter((c) => c.assignedTo === 'Unassigned').length;

  const columns = [
    { field: 'id', label: 'AWB / Case ID', minWidth: 120 },
    { field: 'branch', label: 'Branch', minWidth: 140 },
    { field: 'type', label: 'Case Type', minWidth: 160 },
    { field: 'priority', label: 'Priority', minWidth: 100, render: (r) => <StatusChip label={r.priority} /> },
    { field: 'status', label: 'Status', minWidth: 130, render: (r) => <StatusChip label={r.status} /> },
    { field: 'assignedTo', label: 'Assigned To', minWidth: 140 },
    {
      field: 'slaHours',
      label: 'SLA',
      minWidth: 110,
      render: (r) => (
        <Typography variant="body2" fontWeight={700} color={r.slaHours < 0 ? 'error.main' : r.slaHours < 6 ? 'warning.main' : 'success.main'}>
          {r.slaHours < 0 ? `${Math.abs(r.slaHours)}h over` : `${r.slaHours}h left`}
        </Typography>
      ),
    },
    { field: 'lastUpdate', label: 'Last Update', minWidth: 110 },
  ];

  return (
    <Box>
      <PageHeader title="Operations" subtitle="Live operational case management across every branch." />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="Total Cases" value={operationsCases.length} icon={<LocalShippingRoundedIcon />} color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="Unassigned" value={unassigned} icon={<PendingActionsRoundedIcon />} color="warning" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="SLA Breaches" value={breaches} icon={<WarningAmberRoundedIcon />} color="error" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="Avg. Resolution" value={14.6} suffix="h" decimals={1} icon={<SpeedRoundedIcon />} color="info" />
        </Grid>
      </Grid>

      <SectionCard title="Operational Cases" subtitle="Search, filter, sort, and export any slice of the network">
        <EnterpriseTable
          title="cases"
          columns={columns}
          rows={filteredRows}
          searchKeys={['id', 'branch', 'assignedTo', 'type']}
          exportFilename="operations-cases.csv"
          defaultSort="openedDaysAgo"
          filters={
            <Stack direction="row" spacing={1.5}>
              <Select size="small" value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} sx={{ minWidth: 160 }}>
                <MenuItem value="all">All Branches</MenuItem>
                {branches.map((b) => (
                  <MenuItem key={b.id} value={b.name}>
                    {b.name}
                  </MenuItem>
                ))}
              </Select>
              <Select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 150 }}>
                <MenuItem value="all">All Statuses</MenuItem>
                {['Open', 'Pending Branch', 'Escalated', 'Closed', 'Missing'].map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
          }
        />
      </SectionCard>
    </Box>
  );
}
