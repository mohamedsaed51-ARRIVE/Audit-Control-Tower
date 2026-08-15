import { Box, Grid, Stack, Typography, Switch, Divider, Select, MenuItem, Button, TextField, alpha } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import SectionCard from '../components/common/SectionCard';
import { useColorMode } from '../context/ColorModeContext';
import { useState } from 'react';

function SettingRow({ label, description, control }) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', py: 1.75 }}>
      <Box sx={{ pr: 2 }}>
        <Typography variant="body2" fontWeight={600}>{label}</Typography>
        {description && <Typography variant="caption" color="text.secondary">{description}</Typography>}
      </Box>
      {control}
    </Stack>
  );
}

export default function Settings() {
  const { mode, toggleMode } = useColorMode();
  const [notifs, setNotifs] = useState({ critical: true, audit: true, digest: false, sla: true });

  return (
    <Box>
      <PageHeader title="Settings" subtitle="Configure your Control Tower experience." />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <SectionCard title="Appearance">
            <Stack divider={<Divider />}>
              <SettingRow
                label="Dark mode"
                description="Switch between light and dark interface themes"
                control={<Switch checked={mode === 'dark'} onChange={toggleMode} />}
              />
              <SettingRow
                label="Density"
                description="Adjust spacing across tables and cards"
                control={
                  <Select size="small" defaultValue="comfortable" sx={{ minWidth: 150 }}>
                    <MenuItem value="comfortable">Comfortable</MenuItem>
                    <MenuItem value="compact">Compact</MenuItem>
                  </Select>
                }
              />
              <SettingRow
                label="Default landing page"
                description="Page shown right after sign-in"
                control={
                  <Select size="small" defaultValue="executive" sx={{ minWidth: 190 }}>
                    <MenuItem value="executive">Executive Dashboard</MenuItem>
                    <MenuItem value="operations">Operations</MenuItem>
                    <MenuItem value="audit">Audit Dashboard</MenuItem>
                  </Select>
                }
              />
            </Stack>
          </SectionCard>

          <Box sx={{ height: 20 }} />

          <SectionCard title="Notifications">
            <Stack divider={<Divider />}>
              <SettingRow
                label="Critical SLA breaches"
                description="Get notified immediately when a case breaches SLA"
                control={<Switch checked={notifs.critical} onChange={(e) => setNotifs((n) => ({ ...n, critical: e.target.checked }))} />}
              />
              <SettingRow
                label="Audit case replies"
                description="Notify when a branch replies to an audit case"
                control={<Switch checked={notifs.audit} onChange={(e) => setNotifs((n) => ({ ...n, audit: e.target.checked }))} />}
              />
              <SettingRow
                label="SLA risk warnings"
                description="Notify before a case is at risk of breaching SLA"
                control={<Switch checked={notifs.sla} onChange={(e) => setNotifs((n) => ({ ...n, sla: e.target.checked }))} />}
              />
              <SettingRow
                label="Daily digest email"
                description="A daily summary sent every morning at 8:00 AM"
                control={<Switch checked={notifs.digest} onChange={(e) => setNotifs((n) => ({ ...n, digest: e.target.checked }))} />}
              />
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <SectionCard title="Regional">
            <Stack spacing={2.25}>
              <TextField label="Time zone" size="small" select defaultValue="cairo" fullWidth>
                <MenuItem value="cairo">Africa/Cairo (GMT+2)</MenuItem>
                <MenuItem value="dubai">Asia/Dubai (GMT+4)</MenuItem>
                <MenuItem value="riyadh">Asia/Riyadh (GMT+3)</MenuItem>
              </TextField>
              <TextField label="Language" size="small" select defaultValue="en" fullWidth>
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="ar">العربية</MenuItem>
              </TextField>
              <TextField label="Date format" size="small" select defaultValue="dmy" fullWidth>
                <MenuItem value="dmy">DD/MM/YYYY</MenuItem>
                <MenuItem value="mdy">MM/DD/YYYY</MenuItem>
              </TextField>
            </Stack>
          </SectionCard>

          <Box sx={{ height: 20 }} />

          <SectionCard title="Platform Roadmap" subtitle="ARRIVE Control Tower is one growing ecosystem">
            <Stack spacing={1.25}>
              {[
                'Task Management',
                'User Permissions & Roles',
                'Live Notifications (push/email)',
                'AI Assistant',
                'Google Sheets Integration',
                'Apps Script Backend Connection',
              ].map((f) => (
                <Stack key={f} direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">{f}</Typography>
                  <Box
                    component="span"
                    sx={{
                      fontSize: '0.68rem', fontWeight: 700, px: 1, py: 0.25, borderRadius: 1,
                      bgcolor: (t) => alpha(t.palette.secondary.main, 0.14), color: 'secondary.dark',
                    }}
                  >
                    PLANNED
                  </Box>
                </Stack>
              ))}
            </Stack>
          </SectionCard>

          <Box sx={{ height: 20 }} />

          <SectionCard title="Danger Zone">
            <Stack spacing={1.5}>
              <Typography variant="body2" color="text.secondary">
                These actions are disabled in this Phase 1 preview.
              </Typography>
              <Button variant="outlined" color="error" disabled>
                Clear cached data
              </Button>
              <Button variant="outlined" color="error" disabled>
                Deactivate account
              </Button>
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}
