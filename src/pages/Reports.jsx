import { useState } from 'react';
import { Box, Grid, Card, Stack, Typography, Button, Select, MenuItem, alpha, Chip } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import SectionCard from '../components/common/SectionCard';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ScheduleSendRoundedIcon from '@mui/icons-material/ScheduleSendRounded';

const reportTemplates = [
  { id: 1, name: 'Daily Operations Summary', desc: 'Shipments, open/closed cases, and SLA snapshot for the day.', freq: 'Daily', format: 'PDF' },
  { id: 2, name: 'Weekly Branch Scorecard', desc: 'Per-branch compliance, health score, and trend versus last week.', freq: 'Weekly', format: 'XLSX' },
  { id: 3, name: 'Monthly Audit Report', desc: 'Full audit case log with auditor performance and compliance outcomes.', freq: 'Monthly', format: 'PDF' },
  { id: 4, name: 'Missing Shipments Report', desc: 'All shipments flagged missing, grouped by branch and case age.', freq: 'On demand', format: 'XLSX' },
  { id: 5, name: 'Executive KPI Pack', desc: 'Board-ready summary of network KPIs with charts.', freq: 'Monthly', format: 'PDF' },
  { id: 6, name: 'Repeated Case Analysis', desc: 'Root-cause grouping of repeated cases across branches.', freq: 'Weekly', format: 'XLSX' },
];

const recentReports = [
  { name: 'Weekly Branch Scorecard — Wk 30', date: 'Jul 28, 2026', size: '1.2 MB' },
  { name: 'Daily Operations Summary — Jul 30', date: 'Jul 30, 2026', size: '340 KB' },
  { name: 'Monthly Audit Report — June', date: 'Jul 01, 2026', size: '2.8 MB' },
];

export default function Reports() {
  const [range, setRange] = useState('7d');

  return (
    <Box>
      <PageHeader
        title="Reports"
        subtitle="Generate, schedule, and download operational reports."
        actions={
          <Select size="small" value={range} onChange={(e) => setRange(e.target.value)} sx={{ minWidth: 160 }}>
            <MenuItem value="7d">Last 7 days</MenuItem>
            <MenuItem value="30d">Last 30 days</MenuItem>
            <MenuItem value="qtr">This quarter</MenuItem>
            <MenuItem value="ytd">Year to date</MenuItem>
          </Select>
        }
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {reportTemplates.map((r) => (
          <Grid key={r.id} size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', mb: 1.5 }}>
                <Box
                  sx={{
                    width: 40, height: 40, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.12), color: 'primary.main', flexShrink: 0,
                  }}
                >
                  <DescriptionRoundedIcon />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2">{r.name}</Typography>
                  <Stack direction="row" spacing={0.75} sx={{ mt: 0.5 }}>
                    <Chip size="small" label={r.freq} variant="outlined" />
                    <Chip size="small" label={r.format} variant="outlined" />
                  </Stack>
                </Box>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ flex: 1, mb: 2 }}>
                {r.desc}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="contained" startIcon={<DownloadRoundedIcon />} fullWidth>
                  Generate
                </Button>
                <Button size="small" variant="outlined" sx={{ minWidth: 0, px: 1.25 }}>
                  <ScheduleSendRoundedIcon fontSize="small" />
                </Button>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      <SectionCard title="Recently Generated" subtitle="Your last 3 report exports" noPadding>
        <Stack divider={<Box sx={{ borderBottom: (t) => `1px solid ${t.palette.divider}` }} />}>
          {recentReports.map((r) => (
            <Stack key={r.name} direction="row" spacing={2} sx={{ alignItems: 'center', px: 2.5, py: 1.6 }}>
              <DescriptionRoundedIcon sx={{ color: 'text.secondary' }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap>{r.name}</Typography>
                <Typography variant="caption" color="text.secondary">{r.date} · {r.size}</Typography>
              </Box>
              <Button size="small" startIcon={<DownloadRoundedIcon />}>Download</Button>
            </Stack>
          ))}
        </Stack>
      </SectionCard>
    </Box>
  );
}
