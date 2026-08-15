import { Box, Grid, Card, Stack, Typography, alpha } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import SectionCard from '../components/common/SectionCard';
import StatusChip from '../components/common/StatusChip';
import LiveDot from '../components/common/LiveDot';
import HealthGauge from '../components/common/HealthGauge';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { systemHealth } from '../data/mockData';

export default function SystemHealth() {
  return (
    <Box>
      <PageHeader title="System Health" subtitle="Operational status of the platform's automated services." />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1 }}>
            <HealthGauge value={systemHealth.overall} label="SYSTEM UPTIME" sublabel={systemHealth.uptime} />
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <SectionCard title="Service Status" subtitle={`Last sync ${systemHealth.lastSync}`} noPadding sx={{ height: '100%' }}>
            <Stack divider={<Box sx={{ borderBottom: (t) => `1px solid ${t.palette.divider}` }} />}>
              {systemHealth.services.map((s) => (
                <Stack key={s.name} direction="row" spacing={2} sx={{ alignItems: 'center', px: 2.5, py: 1.6 }}>
                  <LiveDot color={s.status === 'operational' ? '#1AA971' : '#E8A317'} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={600}>{s.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{s.latencyMs} ms average latency</Typography>
                  </Box>
                  <StatusChip label={s.status} />
                </Stack>
              ))}
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>

      <SectionCard title="Data Pipeline" subtitle="Google Sheets ↔ Apps Script ↔ Control Tower">
        <Grid container spacing={2}>
          {['Google Sheets (Source of Truth)', 'Apps Script Business Logic', 'Daily Sheet Builder', 'Control Tower UI'].map((step) => (
            <Grid key={step} size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack spacing={1} sx={{ alignItems: 'center', textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: (t) => alpha(t.palette.success.main, 0.14), color: 'success.main',
                  }}
                >
                  <CheckCircleRoundedIcon />
                </Box>
                <Typography variant="body2" fontWeight={600}>{step}</Typography>
                <Typography variant="caption" color="text.secondary">Connected</Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </SectionCard>
    </Box>
  );
}
