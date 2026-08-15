import { useState } from 'react';
import { Box, Grid, Tabs, Tab, useTheme } from '@mui/material';
import {
  ResponsiveContainer,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
  ComposedChart,
} from 'recharts';
import PageHeader from '../components/common/PageHeader';
import SectionCard from '../components/common/SectionCard';
import KpiCard from '../components/common/KpiCard';
import { weeklyTrend, monthlyTrend, kpiDaily } from '../data/mockData';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';

const yearlyTrend = Array.from({ length: 5 }, (_, i) => ({
  year: 2021 + i,
  shipments: 320000 + i * 48000,
  compliance: 88 + i * 2,
}));

export default function KPI() {
  const theme = useTheme();
  const [tab, setTab] = useState(1);

  return (
    <Box>
      <PageHeader title="KPI Dashboard" subtitle="Track performance across daily, weekly, monthly, and yearly horizons." />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="Avg. SLA (30d)" value={96.1} suffix="%" decimals={1} icon={<PercentRoundedIcon />} color="success" trend="up" trendValue={1.2} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="Avg. Resolution" value={13.4} suffix="h" decimals={1} icon={<ScheduleRoundedIcon />} color="info" trend="down" trendValue={0.9} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="YoY Growth" value={14.8} suffix="%" decimals={1} icon={<TrendingUpRoundedIcon />} color="primary" trend="up" trendValue={14.8} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="Best Branch Score" value={98} icon={<EmojiEventsRoundedIcon />} color="warning" subtitle="Giza" />
        </Grid>
      </Grid>

      <SectionCard
        title="Performance Comparison"
        subtitle="Toggle timeframe to compare shipment volume and SLA compliance"
        action={
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ minHeight: 'auto' }}>
            {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((l) => (
              <Tab key={l} label={l} sx={{ minHeight: 'auto', py: 1, fontSize: '0.8rem' }} />
            ))}
          </Tabs>
        }
      >
        <Box sx={{ height: 340, mt: 2 }}>
          <ResponsiveContainer>
            {tab === 0 ? (
              <LineChart data={kpiDaily} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} stroke={theme.palette.text.secondary} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} stroke={theme.palette.text.secondary} />
                <RTooltip contentStyle={{ borderRadius: 10, border: `1px solid ${theme.palette.divider}` }} />
                <Legend />
                <Line type="monotone" dataKey="sla" name="SLA %" stroke={theme.palette.primary.main} strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="compliance" name="Compliance %" stroke={theme.palette.secondary.main} strokeWidth={2.5} dot={false} />
              </LineChart>
            ) : tab === 1 ? (
              <ComposedChart data={weeklyTrend} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} stroke={theme.palette.text.secondary} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} stroke={theme.palette.text.secondary} />
                <RTooltip contentStyle={{ borderRadius: 10, border: `1px solid ${theme.palette.divider}` }} />
                <Legend />
                <Bar dataKey="shipments" name="Shipments" fill={theme.palette.primary.main} radius={[6, 6, 0, 0]} barSize={26} />
                <Bar dataKey="closed" name="Closed" fill={theme.palette.secondary.main} radius={[6, 6, 0, 0]} barSize={26} />
                <Line type="monotone" dataKey="slaBreaches" name="SLA Breaches" stroke={theme.palette.error.main} strokeWidth={2} dot={false} />
              </ComposedChart>
            ) : tab === 2 ? (
              <ComposedChart data={monthlyTrend} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} stroke={theme.palette.text.secondary} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} stroke={theme.palette.text.secondary} />
                <RTooltip contentStyle={{ borderRadius: 10, border: `1px solid ${theme.palette.divider}` }} />
                <Legend />
                <Bar dataKey="shipments" name="Shipments" fill={theme.palette.primary.main} radius={[6, 6, 0, 0]} />
                <Bar dataKey="closedOnTime" name="Closed On Time" fill={theme.palette.secondary.main} radius={[6, 6, 0, 0]} />
              </ComposedChart>
            ) : (
              <LineChart data={yearlyTrend} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                <XAxis dataKey="year" fontSize={12} tickLine={false} axisLine={false} stroke={theme.palette.text.secondary} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} stroke={theme.palette.text.secondary} />
                <RTooltip contentStyle={{ borderRadius: 10, border: `1px solid ${theme.palette.divider}` }} />
                <Legend />
                <Line type="monotone" dataKey="shipments" name="Annual Shipments" stroke={theme.palette.primary.main} strokeWidth={3} />
                <Line type="monotone" dataKey="compliance" name="Compliance %" stroke={theme.palette.secondary.main} strokeWidth={3} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </Box>
      </SectionCard>
    </Box>
  );
}
