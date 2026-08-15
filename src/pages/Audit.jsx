import { Box, Grid, Stack, Typography, LinearProgress, Avatar } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import SectionCard from '../components/common/SectionCard';
import KpiCard from '../components/common/KpiCard';
import EnterpriseTable from '../components/common/EnterpriseTable';
import StatusChip from '../components/common/StatusChip';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import { auditCases, auditorPerformance } from '../data/mockData';

export default function Audit() {
  const open = auditCases.filter((c) => c.status !== 'Closed').length;
  const replied = auditCases.filter((c) => c.branchReplied).length;
  const compliant = Math.round((auditCases.filter((c) => c.compliance === 'Compliant').length / auditCases.length) * 100);

  const columns = [
    { field: 'id', label: 'Audit ID', minWidth: 110 },
    { field: 'branch', label: 'Branch', minWidth: 140 },
    { field: 'auditor', label: 'Auditor', minWidth: 140 },
    { field: 'caseType', label: 'Case Type', minWidth: 160 },
    { field: 'status', label: 'Status', minWidth: 130, render: (r) => <StatusChip label={r.status} /> },
    {
      field: 'branchReplied',
      label: 'Branch Reply',
      minWidth: 120,
      render: (r) => (
        <Typography variant="body2" color={r.branchReplied ? 'success.main' : 'text.secondary'} fontWeight={700}>
          {r.branchReplied ? 'Replied' : 'Awaiting'}
        </Typography>
      ),
    },
    { field: 'daysOpen', label: 'Days Open', minWidth: 100 },
    { field: 'compliance', label: 'Compliance', minWidth: 130, render: (r) => <StatusChip label={r.compliance} /> },
  ];

  return (
    <Box>
      <PageHeader title="Audit Dashboard" subtitle="Audit case lifecycle, branch responsiveness, and compliance." />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="Open Audit Cases" value={open} icon={<FactCheckRoundedIcon />} color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="Awaiting Branch Reply" value={auditCases.length - replied} icon={<HourglassBottomRoundedIcon />} color="warning" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="Branch Replies" value={replied} icon={<ForumRoundedIcon />} color="info" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="Compliance Rate" value={compliant} suffix="%" icon={<VerifiedRoundedIcon />} color="success" />
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <SectionCard title="Auditor Performance" subtitle="Workload and resolution quality" noPadding>
            <Stack sx={{ px: 2.5, py: 1 }} divider={<Box sx={{ borderBottom: (t) => `1px solid ${t.palette.divider}` }} />}>
              {auditorPerformance.map((a) => (
                <Stack key={a.name} direction="row" spacing={2} sx={{ alignItems: 'center', py: 1.6 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', fontSize: '0.8rem', fontWeight: 700 }}>
                    {a.name.split(' ').map((n) => n[0]).join('')}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={700} noWrap>
                      {a.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {a.casesHandled} cases · avg {a.avgResolutionHrs}h
                    </Typography>
                  </Box>
                  <Box sx={{ width: 110 }}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.4 }}>
                      <Typography variant="caption" color="text.secondary">
                        Compliance
                      </Typography>
                      <Typography variant="caption" fontWeight={700}>
                        {a.complianceScore}%
                      </Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={a.complianceScore} color={a.complianceScore > 92 ? 'success' : 'warning'} />
                  </Box>
                </Stack>
              ))}
            </Stack>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 7 }}>
          <SectionCard title="Compliance Snapshot" subtitle="Share of audit cases by compliance outcome">
            <Stack spacing={2.25} sx={{ mt: 1 }}>
              {[
                { label: 'Compliant', value: 74, color: 'success' },
                { label: 'Partial', value: 17, color: 'warning' },
                { label: 'Non-Compliant', value: 9, color: 'error' },
              ].map((row) => (
                <Box key={row.label}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.6 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {row.label}
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {row.value}%
                    </Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={row.value} color={row.color} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
              ))}
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>

      <SectionCard title="Audit Case Log" subtitle="Every audit case across the network">
        <EnterpriseTable
          title="audit cases"
          columns={columns}
          rows={auditCases}
          searchKeys={['id', 'branch', 'auditor', 'caseType']}
          exportFilename="audit-cases.csv"
          defaultSort="daysOpen"
        />
      </SectionCard>
    </Box>
  );
}
