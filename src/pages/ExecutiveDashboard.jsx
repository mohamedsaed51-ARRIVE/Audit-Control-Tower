import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  Stack,
  Typography,
  Chip,
  alpha,
  useTheme,
  LinearProgress,
  Tabs,
  Tab,
  Divider,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';

import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import PriorityHighRoundedIcon from '@mui/icons-material/PriorityHighRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import DnsRoundedIcon from '@mui/icons-material/DnsRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { Link } from 'react-router-dom';

import PageHeader from '../components/common/PageHeader';
import KpiCard from '../components/common/KpiCard';
import SectionCard from '../components/common/SectionCard';
import HealthGauge from '../components/common/HealthGauge';
import LiveDot from '../components/common/LiveDot';

import { kpiColor } from '../theme/tokens';
import { fetchExecutiveDashboard } from '../services/dashboardApi';


/* ============================================================
   COLORS
============================================================ */

const STATUS_COLORS = {
  Closed: '#1AA971',
  Open: '#12C6D3',
  Missing: '#E8A317',
  Repeated: '#E0473F',
};


/* ============================================================
   ALERT STYLE
============================================================ */

const alertSeverityStyle = {
  critical: {
    color: '#E0473F',
    label: 'Critical',
  },
  high: {
    color: '#E8720C',
    label: 'High',
  },
  medium: {
    color: '#E8A317',
    label: 'Medium',
  },
  low: {
    color: '#1AA971',
    label: 'Resolved',
  },
};


/* ============================================================
   SAFE NUMBER
============================================================ */

function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}


/* ============================================================
   DATE
============================================================ */

function getTodayLabel() {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}


/* ============================================================
   MAIN DASHBOARD
============================================================ */

export default function ExecutiveDashboard() {
  const theme = useTheme();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartTab, setChartTab] = useState(0);

  // Keep hook order identical on every render. This must run before any
  // conditional return (loading/error), otherwise React can throw a
  // 'Rendered more hooks than during the previous render' error.
  const branches = useMemo(
    () => (Array.isArray(data?.branches) ? data.branches : []),
    [data] 
  );

  const rankedBranches = useMemo(() => {
    return [...branches].sort(
      (a, b) => num(b?.healthScore) - num(a?.healthScore)
    );
  }, [branches]);

  /* ----------------------------------------------------------
     LOAD API
  ---------------------------------------------------------- */

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const result = await fetchExecutiveDashboard();

      if (!result) {
        throw new Error('No dashboard data returned from Google Sheets.');
      }

      setData(result);
    } catch (err) {
      console.error('Executive Dashboard API Error:', err);

      setError(
        err?.message ||
          'Failed to load live dashboard data from Google Sheets.'
      );
    } finally {
      setLoading(false);
    }
  };


  /* ----------------------------------------------------------
     INITIAL LOAD
  ---------------------------------------------------------- */

  useEffect(() => {
    loadDashboard();
  }, []);


  /* ----------------------------------------------------------
     LOADING SCREEN
  ---------------------------------------------------------- */

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography color="text.secondary">
          Loading live data from Google Sheets...
        </Typography>
      </Box>
    );
  }


  /* ----------------------------------------------------------
     ERROR SCREEN
  ---------------------------------------------------------- */

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<RefreshRoundedIcon />}
              onClick={loadDashboard}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>

        <Typography variant="body2" color="text.secondary">
          The dashboard could not read the live Google Sheets data.
        </Typography>
      </Box>
    );
  }


  /* ----------------------------------------------------------
     SAFE DATA
  ---------------------------------------------------------- */

  const executive = data?.executive || {};
  const operations = data?.operations || {};
  const audit = data?.audit || {};
  const quality = data?.quality || {};
  const time = data?.time || {};
  const charts = data?.charts || {};


  /* ============================================================
     CHART DATA
  ============================================================ */

  const weeklyChart = [
    {
      period: 'Previous',
      shipments: num(operations?.openCaseTrend?.previous),
      closed: 0,
    },
    {
      period: 'Current',
      shipments: num(operations?.openCaseTrend?.current),
      closed: num(executive?.closedToday),
    },
  ];


  const monthlyChart = [
    {
      period: 'Shipments',
      shipments: num(executive?.totalShipments),
      closed: num(executive?.closedToday),
    },
    {
      period: 'Open',
      shipments: num(executive?.openCases),
      closed: 0,
    },
    {
      period: 'Missing',
      shipments: num(operations?.missing),
      closed: 0,
    },
    {
      period: 'Repeated',
      shipments: num(operations?.repeated),
      closed: 0,
    },
  ];


  const yearlyChart = [
    {
      period: 'Total',
      shipments: num(executive?.totalShipments),
      closed: num(executive?.closedToday),
    },
    {
      period: 'Archived',
      shipments: num(audit?.archivedCases),
      closed: 0,
    },
  ];


  const chartData =
    chartTab === 0
      ? weeklyChart
      : chartTab === 1
        ? monthlyChart
        : yearlyChart;


  /* ============================================================
     CASE STATUS
  ============================================================ */

  const caseStatusBreakdown = [
    {
      name: 'Closed Today',
      value: num(executive?.closedToday),
      color: STATUS_COLORS.Closed,
    },
    {
      name: 'Open',
      value: num(executive?.openCases),
      color: STATUS_COLORS.Open,
    },
    {
      name: 'Missing',
      value: num(operations?.missing),
      color: STATUS_COLORS.Missing,
    },
    {
      name: 'Repeated',
      value: num(operations?.repeated),
      color: STATUS_COLORS.Repeated,
    },
  ];


  /* ============================================================
     BRANCHES
  ============================================================ */

  const topBranches = rankedBranches.slice(0, 5);


  const worstBranches = [...rankedBranches]
    .reverse()
    .slice(0, 5);


  /* ============================================================
     INSIGHT
  ============================================================ */

  const mostCommonReason =
    quality?.mostCommonShipmentReason?.label ||
    'No data';

  const mostCommonAuditComment =
    audit?.mostCommonAuditComment?.label ||
    'No data';


  /* ============================================================
     HEALTH
  ============================================================ */

  const healthScore = num(executive?.healthScore);

  const healthText =
    healthScore >= 85
      ? 'Strong'
      : healthScore >= 70
        ? 'Stable'
        : 'At Risk';


  /* ============================================================
     RETURN
  ============================================================ */

  return (
    <Box>

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <PageHeader
        title="Executive Dashboard"
        subtitle="Live operational overview from Google Sheets"
        action={
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshRoundedIcon />}
            onClick={loadDashboard}
          >
            Refresh
          </Button>
        }
      />


      {/* ======================================================
          OPERATIONAL STATUS RIBBON
      ====================================================== */}

      <Card
        sx={{
          mb: 2.5,
          border: 'none',
          color: '#fff',
          overflow: 'hidden',
          background:
            theme.palette.mode === 'dark'
              ? `linear-gradient(
                  115deg,
                  ${alpha(theme.palette.primary.dark, 0.95)},
                  #0A1B5C 60%,
                  ${alpha('#061240', 0.98)}
                )`
              : `linear-gradient(
                  115deg,
                  ${theme.palette.primary.main},
                  ${theme.palette.primary.dark}
                )`,
        }}
      >

        <Grid container>

          {/* HEALTH */}

          <Grid
            size={{ xs: 12, md: 3 }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2.5,
              borderRight: {
                md: `1px solid ${alpha('#fff', 0.14)}`,
              },
            }}
          >

            <Stack
              direction="row"
              spacing={2}
              sx={{ alignItems: 'center' }}
            >

              <HealthGauge
                value={healthScore}
                size={104}
                label="HEALTH"
              />

              <Box>

                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.75,
                    fontWeight: 700,
                    letterSpacing: 0.5,
                  }}
                >
                  COMPANY HEALTH SCORE
                </Typography>

                <Typography variant="h5">
                  {healthText}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{ opacity: 0.7 }}
                >
                  Across {branches.length} branches
                </Typography>

              </Box>

            </Stack>

          </Grid>


          {/* STATUS */}

          <Grid
            size={{ xs: 12, md: 9 }}
            sx={{ p: 2.5 }}
          >

            <Grid container spacing={2}>

              <Grid size={{ xs: 6, sm: 4, md: 2.5 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center' }}
                >

                  <LiveDot color="#4ADE80" />

                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        opacity: 0.7,
                        display: 'block',
                      }}
                    >
                      System
                    </Typography>

                    <Typography
                      variant="body2"
                      fontWeight={700}
                    >
                      Live
                    </Typography>
                  </Box>

                </Stack>
              </Grid>


              <Grid size={{ xs: 6, sm: 4, md: 2.5 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center' }}
                >

                  <DnsRoundedIcon
                    sx={{
                      fontSize: 18,
                      opacity: 0.85,
                    }}
                  />

                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        opacity: 0.7,
                        display: 'block',
                      }}
                    >
                      Backend
                    </Typography>

                    <Typography
                      variant="body2"
                      fontWeight={700}
                    >
                      Connected
                    </Typography>
                  </Box>

                </Stack>
              </Grid>


              <Grid size={{ xs: 6, sm: 4, md: 2.5 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center' }}
                >

                  <StorageRoundedIcon
                    sx={{
                      fontSize: 18,
                      opacity: 0.85,
                    }}
                  />

                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        opacity: 0.7,
                        display: 'block',
                      }}
                    >
                      Database
                    </Typography>

                    <Typography
                      variant="body2"
                      fontWeight={700}
                    >
                      Google Sheets · OK
                    </Typography>
                  </Box>

                </Stack>
              </Grid>


              <Grid size={{ xs: 6, sm: 4, md: 2.5 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center' }}
                >

                  <SyncRoundedIcon
                    sx={{
                      fontSize: 18,
                      opacity: 0.85,
                    }}
                  />

                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        opacity: 0.7,
                        display: 'block',
                      }}
                    >
                      Last Sync
                    </Typography>

                    <Typography
                      variant="body2"
                      fontWeight={700}
                    >
                      {data?.generatedAt || 'Live'}
                    </Typography>
                  </Box>

                </Stack>
              </Grid>


              <Grid size={{ xs: 12, sm: 8, md: 2.5 }}>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                    display: 'block',
                  }}
                >
                  Today
                </Typography>

                <Typography
                  variant="body2"
                  fontWeight={700}
                >
                  {getTodayLabel()}
                </Typography>
              </Grid>

            </Grid>


            <Divider
              sx={{
                my: 2,
                borderColor: alpha('#fff', 0.14),
              }}
            />


            <Typography
              variant="body2"
              sx={{ opacity: 0.9 }}
            >
              <b>{num(quality?.closeRate).toFixed(1)}% Close Rate</b>
              {' · '}
              <b>{num(quality?.missingRate).toFixed(1)}% Missing</b>
              {' · '}
              <b>{num(quality?.repeatedRate).toFixed(1)}% Repeated</b>
              {' · '}
              {num(executive?.criticalShipments)} critical shipments
              {' · '}
              Health status: {executive?.healthStatus || 'Unknown'}
            </Typography>

          </Grid>

        </Grid>

      </Card>


      {/* ======================================================
          EXECUTIVE KPI STRIP
      ====================================================== */}

      <Grid
        container
        spacing={2}
        sx={{ mb: 2 }}
      >

        <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
          <KpiCard
            dense
            label="Total Shipments"
            value={num(executive?.totalShipments)}
            icon={
              <LocalShippingRoundedIcon fontSize="small" />
            }
            color={kpiColor.shipments}
            trend="flat"
          />
        </Grid>


        <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
          <KpiCard
            dense
            label="Open Cases"
            value={num(executive?.openCases)}
            icon={
              <FolderOpenRoundedIcon fontSize="small" />
            }
            color={kpiColor.open}
            trend="flat"
          />
        </Grid>


        <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
          <KpiCard
            dense
            label="Missing"
            value={num(operations?.missing)}
            icon={
              <ReportProblemRoundedIcon fontSize="small" />
            }
            color={kpiColor.missing}
            trend="flat"
          />
        </Grid>


        <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
          <KpiCard
            dense
            label="Repeated"
            value={num(operations?.repeated)}
            icon={
              <ReplayRoundedIcon fontSize="small" />
            }
            color={kpiColor.repeated}
            trend="flat"
          />
        </Grid>


        <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
          <KpiCard
            dense
            label="Critical"
            value={num(executive?.criticalShipments)}
            icon={
              <PriorityHighRoundedIcon fontSize="small" />
            }
            color={kpiColor.critical}
            trend="flat"
          />
        </Grid>


        <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
          <KpiCard
            dense
            label="Closed Today"
            value={num(executive?.closedToday)}
            icon={
              <TaskAltRoundedIcon fontSize="small" />
            }
            color={kpiColor.closed}
            trend="flat"
          />
        </Grid>

      </Grid>


      {/* ======================================================
          QUALITY / TIME KPIs
      ====================================================== */}

      <Grid
        container
        spacing={2}
        sx={{ mb: 2.5 }}
      >

        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            dense
            label="Close Rate"
            value={num(quality?.closeRate)}
            suffix="%"
            decimals={1}
            icon={
              <PercentRoundedIcon fontSize="small" />
            }
            color={kpiColor.sla}
            trend="flat"
          />
        </Grid>


        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            dense
            label="Average Shipment Age"
            value={num(time?.avgShipmentAgeDays)}
            suffix=" days"
            decimals={1}
            icon={
              <VerifiedRoundedIcon fontSize="small" />
            }
            color={kpiColor.compliance}
            trend="flat"
          />
        </Grid>


        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard
            dense
            label="Branch Response"
            value={num(time?.avgBranchResponseDays)}
            suffix=" days"
            decimals={1}
            icon={
              <FavoriteRoundedIcon fontSize="small" />
            }
            color={kpiColor.health}
            trend="flat"
          />
        </Grid>

      </Grid>


      {/* ======================================================
          ALERTS + INSIGHT
      ====================================================== */}

      <Grid
        container
        spacing={2.5}
        sx={{ mb: 2.5 }}
      >

        {/* LIVE ALERTS */}

        <Grid size={{ xs: 12, lg: 8 }}>

          <SectionCard
            title="Live Alerts"
            subtitle="What needs attention right now"
            noPadding
          >

            <Stack divider={<Divider />}>

              {num(executive?.criticalShipments) > 0 ? (

                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{
                    alignItems: 'center',
                    px: 2.5,
                    py: 1.35,
                  }}
                >

                  <Box
                    sx={{
                      width: 4,
                      alignSelf: 'stretch',
                      borderRadius: 2,
                      bgcolor: '#E0473F',
                    }}
                  />

                  <Chip
                    size="small"
                    label="Critical"
                    sx={{
                      bgcolor: alpha('#E0473F', 0.14),
                      color: '#E0473F',
                      fontWeight: 700,
                    }}
                  />

                  <Typography
                    variant="body2"
                    sx={{ flex: 1 }}
                  >
                    {executive.criticalShipments} critical shipments
                    require review.
                  </Typography>

                </Stack>

              ) : (

                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{
                    alignItems: 'center',
                    px: 2.5,
                    py: 1.35,
                  }}
                >

                  <Box
                    sx={{
                      width: 4,
                      alignSelf: 'stretch',
                      borderRadius: 2,
                      bgcolor: '#1AA971',
                    }}
                  />

                  <Chip
                    size="small"
                    label="Good"
                    sx={{
                      bgcolor: alpha('#1AA971', 0.14),
                      color: '#1AA971',
                      fontWeight: 700,
                    }}
                  />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ flex: 1 }}
                  >
                    No critical shipments currently require review.
                  </Typography>

                </Stack>

              )}


              {num(operations?.missing) > 0 && (

                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{
                    alignItems: 'center',
                    px: 2.5,
                    py: 1.35,
                  }}
                >

                  <Box
                    sx={{
                      width: 4,
                      alignSelf: 'stretch',
                      borderRadius: 2,
                      bgcolor: '#E8A317',
                    }}
                  />

                  <Chip
                    size="small"
                    label="Missing"
                    sx={{
                      bgcolor: alpha('#E8A317', 0.14),
                      color: '#E8A317',
                      fontWeight: 700,
                    }}
                  />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ flex: 1 }}
                  >
                    {operations.missing} missing shipments detected.
                  </Typography>

                </Stack>

              )}


              {num(operations?.repeated) > 0 && (

                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{
                    alignItems: 'center',
                    px: 2.5,
                    py: 1.35,
                  }}
                >

                  <Box
                    sx={{
                      width: 4,
                      alignSelf: 'stretch',
                      borderRadius: 2,
                      bgcolor: '#E0473F',
                    }}
                  />

                  <Chip
                    size="small"
                    label="Repeated"
                    sx={{
                      bgcolor: alpha('#E0473F', 0.14),
                      color: '#E0473F',
                      fontWeight: 700,
                    }}
                  />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ flex: 1 }}
                  >
                    {operations.repeated} repeated cases detected.
                  </Typography>

                </Stack>

              )}

            </Stack>

          </SectionCard>

        </Grid>


        {/* INSIGHT */}

        <Grid size={{ xs: 12, lg: 4 }}>

          <SectionCard
            sx={{
              background: (t) =>
                `linear-gradient(
                  135deg,
                  ${alpha(t.palette.secondary.main, 0.12)},
                  ${alpha(t.palette.primary.main, 0.08)}
                )`,
              border: 'none',
              height: '100%',
            }}
          >

            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', mb: 1.5 }}
            >

              <FavoriteRoundedIcon
                fontSize="small"
                color="secondary"
              />

              <Typography
                variant="overline"
                color="text.secondary"
              >
                DATA INSIGHT
              </Typography>

            </Stack>


            <Typography
              variant="subtitle1"
              sx={{ mb: 1 }}
            >
              Most Common Shipment Reason
            </Typography>


            <Typography
              variant="body1"
              fontWeight={700}
              sx={{ mb: 1.5 }}
            >
              {mostCommonReason}
            </Typography>


            <Divider sx={{ mb: 1.5 }} />


            <Typography
              variant="subtitle2"
              sx={{ mb: 0.5 }}
            >
              Most Common Audit Comment
            </Typography>


            <Typography
              variant="body2"
              color="text.secondary"
            >
              {mostCommonAuditComment}
            </Typography>

          </SectionCard>

        </Grid>

      </Grid>


      {/* ======================================================
          SHIPMENT CHART + CASE STATUS
      ====================================================== */}

      <Grid
        container
        spacing={2.5}
        sx={{ mb: 2.5 }}
      >

        {/* CHART */}

        <Grid size={{ xs: 12, lg: 8 }}>

          <SectionCard
            title="Operational Overview"
            subtitle="Live metrics from Google Sheets"
            action={
              <Tabs
                value={chartTab}
                onChange={(_, value) =>
                  setChartTab(value)
                }
                sx={{ minHeight: 'auto' }}
              >

                <Tab
                  label="Trend"
                  sx={{
                    minHeight: 'auto',
                    py: 0.75,
                    fontSize: '0.78rem',
                  }}
                />

                <Tab
                  label="Breakdown"
                  sx={{
                    minHeight: 'auto',
                    py: 0.75,
                    fontSize: '0.78rem',
                  }}
                />

                <Tab
                  label="Summary"
                  sx={{
                    minHeight: 'auto',
                    py: 0.75,
                    fontSize: '0.78rem',
                  }}
                />

              </Tabs>
            }
          >

            <Box sx={{ height: 270 }}>

              <ResponsiveContainer>

                <AreaChart
                  data={chartData}
                  margin={{
                    left: -18,
                    top: 10,
                    right: 10,
                  }}
                >

                  <defs>

                    <linearGradient
                      id="liveShipmentGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="5%"
                        stopColor={
                          theme.palette.primary.main
                        }
                        stopOpacity={0.35}
                      />

                      <stop
                        offset="95%"
                        stopColor={
                          theme.palette.primary.main
                        }
                        stopOpacity={0}
                      />

                    </linearGradient>

                    <linearGradient
                      id="liveClosedGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="5%"
                        stopColor={
                          theme.palette.secondary.main
                        }
                        stopOpacity={0.35}
                      />

                      <stop
                        offset="95%"
                        stopColor={
                          theme.palette.secondary.main
                        }
                        stopOpacity={0}
                      />

                    </linearGradient>

                  </defs>


                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={theme.palette.divider}
                  />


                  <XAxis
                    dataKey="period"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    stroke={
                      theme.palette.text.secondary
                    }
                  />


                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    stroke={
                      theme.palette.text.secondary
                    }
                  />


                  <RTooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: `1px solid ${theme.palette.divider}`,
                      background:
                        theme.palette.background.paper,
                    }}
                  />


                  <Area
                    type="monotone"
                    dataKey="shipments"
                    name="Shipments"
                    stroke={
                      theme.palette.primary.main
                    }
                    fill="url(#liveShipmentGradient)"
                    strokeWidth={2.5}
                  />


                  <Area
                    type="monotone"
                    dataKey="closed"
                    name="Closed Today"
                    stroke={
                      theme.palette.secondary.main
                    }
                    fill="url(#liveClosedGradient)"
                    strokeWidth={2.5}
                  />

                </AreaChart>

              </ResponsiveContainer>

            </Box>

          </SectionCard>

        </Grid>


        {/* CASE STATUS */}

        <Grid size={{ xs: 12, lg: 4 }}>

          <SectionCard
            title="Case Status"
            subtitle="Current live breakdown"
          >

            <Box sx={{ height: 176 }}>

              <ResponsiveContainer>

                <PieChart>

                  <Pie
                    data={caseStatusBreakdown}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={3}
                  >

                    {caseStatusBreakdown.map(
                      (entry) => (
                        <Cell
                          key={entry.name}
                          fill={entry.color}
                          stroke="none"
                        />
                      )
                    )}

                  </Pie>


                  <RTooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  />

                </PieChart>

              </ResponsiveContainer>

            </Box>


            <Stack spacing={0.85}>

              {caseStatusBreakdown.map((item) => (

                <Stack
                  key={item.name}
                  direction="row"
                  sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                >

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                  >

                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: item.color,
                      }}
                    />

                    <Typography variant="body2">
                      {item.name}
                    </Typography>

                  </Stack>


                  <Typography
                    variant="body2"
                    fontWeight={700}
                  >
                    {item.value}
                  </Typography>

                </Stack>

              ))}

            </Stack>

          </SectionCard>

        </Grid>

      </Grid>


      {/* ======================================================
          BRANCH PERFORMANCE
      ====================================================== */}

      <Grid container spacing={2.5}>

        <Grid size={{ xs: 12, lg: 6 }}>

          <BranchLeaderboard
            title="Top Performing Branches"
            icon={
              <TrendingUpRoundedIcon
                fontSize="small"
              />
            }
            accent="success"
            rows={topBranches}
          />

        </Grid>


        <Grid size={{ xs: 12, lg: 6 }}>

          <BranchLeaderboard
            title="Branches Needing Attention"
            icon={
              <TrendingDownRoundedIcon
                fontSize="small"
              />
            }
            accent="error"
            rows={worstBranches}
          />

        </Grid>

      </Grid>


      {/* ======================================================
          DATA SOURCE FOOTER
      ====================================================== */}

      <Box
        sx={{
          mt: 2.5,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >

        <Typography
          variant="caption"
          color="text.disabled"
        >
          Live source: Google Sheets · Generated:{' '}
          {data?.generatedAt || 'N/A'}
        </Typography>

      </Box>

    </Box>
  );
}


/* ============================================================
   BRANCH LEADERBOARD
============================================================ */

function BranchLeaderboard({
  title,
  icon,
  accent,
  rows = [],
}) {
  return (
    <SectionCard
      title={
        <Box
          sx={{
            color: `${accent}.main`,
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
          }}
        >
          {icon}
          <span>{title}</span>
        </Box>
      }
      noPadding
    >

      {rows.length === 0 ? (

        <Box sx={{ p: 3 }}>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            No branch data available.
          </Typography>
        </Box>

      ) : (

        <Stack divider={<Divider />}>

          {rows.map((branch, index) => {

            const score = Math.max(
              0,
              Math.min(
                100,
                Number(branch?.healthScore) || 0
              )
            );

            const status =
              branch?.healthStatus ||
              (score >= 85
                ? 'Good'
                : score >= 70
                  ? 'Stable'
                  : 'Critical');

            return (
              <Stack
                key={`${branch?.branch || 'branch'}-${index}`}
                direction="row"
                spacing={2}
                sx={{
                  alignItems: 'center',
                  px: 2.5,
                  py: 1.3,
                }}
              >

                <Typography
                  variant="body2"
                  color="text.disabled"
                  sx={{
                    width: 18,
                    fontWeight: 700,
                  }}
                >
                  {index + 1}
                </Typography>


                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >

                  <Typography
                    variant="body2"
                    fontWeight={700}
                    noWrap
                  >
                    {branch?.branch || branch?.name || 'Unknown Branch'}
                  </Typography>


                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {num(branch?.shipments)} shipments
                    {' · '}
                    {num(branch?.openCases)} open
                    {' · '}
                    {status}
                  </Typography>

                </Box>


                <Box
                  sx={{
                    width: 96,
                    display: {
                      xs: 'none',
                      sm: 'block',
                    },
                  }}
                >

                  <LinearProgress
                    variant="determinate"
                    value={score}
                    color={
                      score >= 85
                        ? 'success'
                        : score >= 65
                          ? 'warning'
                          : 'error'
                    }
                    sx={{
                      bgcolor: (theme) =>
                        alpha(
                          theme.palette.text.primary,
                          0.08
                        ),
                    }}
                  />

                </Box>


                <Box
                  sx={{
                    width: 40,
                    textAlign: 'right',
                  }}
                >

                  <Typography
                    variant="body2"
                    fontWeight={800}
                  >
                    {score}
                  </Typography>

                </Box>

              </Stack>
            );
          })}

        </Stack>

      )}

    </SectionCard>
  );
}