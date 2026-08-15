import { Box, Grid, Card, Stack, Typography, Avatar, TextField, Button, Divider, Chip } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import SectionCard from '../components/common/SectionCard';
import { useAuth } from '../context/AuthContext';
import { activityFeed } from '../data/mockData';
import EditRoundedIcon from '@mui/icons-material/EditRounded';

export default function Profile() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <Box>
      <PageHeader title="My Profile" subtitle="Your account details and recent activity." />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Avatar sx={{ width: 84, height: 84, mx: 'auto', bgcolor: user.avatarColor, fontSize: '1.6rem', fontWeight: 700, mb: 2 }}>
              {user.initials}
            </Avatar>
            <Typography variant="h6">{user.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{user.email}</Typography>
            <Chip label={user.role} color="primary" size="small" sx={{ fontWeight: 700 }} />
            <Divider sx={{ my: 2.5 }} />
            <Button variant="outlined" startIcon={<EditRoundedIcon />} fullWidth>
              Edit Profile
            </Button>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <SectionCard title="Account Information">
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Full Name" defaultValue={user.name} fullWidth size="small" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Role" defaultValue={user.role} fullWidth size="small" disabled />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Email" defaultValue={user.email} fullWidth size="small" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Phone" defaultValue="+20 10 1234 5678" fullWidth size="small" />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Stack direction="row" spacing={1.5}>
                  <Button variant="contained">Save Changes</Button>
                  <Button variant="text">Cancel</Button>
                </Stack>
              </Grid>
            </Grid>
          </SectionCard>

          <Box sx={{ height: 20 }} />

          <SectionCard title="My Recent Activity" noPadding>
            <Stack sx={{ px: 2.5, py: 1 }} divider={<Box sx={{ borderBottom: (t) => `1px solid ${t.palette.divider}` }} />}>
              {activityFeed.filter((a) => a.actor !== 'System').map((a) => (
                <Stack key={a.id} direction="row" sx={{ justifyContent: 'space-between', py: 1.4 }}>
                  <Typography variant="body2">{a.action}</Typography>
                  <Typography variant="caption" color="text.disabled">{a.time}</Typography>
                </Stack>
              ))}
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}
