import { Box, Stack, Typography, Button, Card } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import { useState } from 'react';
import { notifications as initial } from '../data/mockData';

const severityColor = { critical: 'error.main', warning: 'warning.main', success: 'success.main', info: 'secondary.main' };

export default function Notifications() {
  const [items, setItems] = useState(initial);

  return (
    <Box>
      <PageHeader
        title="Notifications"
        subtitle="Everything that needs your attention, in one place."
        actions={
          <Button variant="outlined" onClick={() => setItems((its) => its.map((i) => ({ ...i, read: true })))}>
            Mark all as read
          </Button>
        }
      />
      <Stack spacing={1.5}>
        {items.map((n) => (
          <Card
            key={n.id}
            sx={{
              p: 2,
              display: 'flex',
              gap: 2,
              alignItems: 'flex-start',
              bgcolor: n.read ? 'background.paper' : (t) => (t.palette.mode === 'dark' ? 'rgba(18,198,211,0.06)' : 'rgba(18,198,211,0.06)'),
            }}
          >
            <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: severityColor[n.severity], mt: 0.8, flexShrink: 0 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2">{n.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>{n.body}</Typography>
              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>{n.time}</Typography>
            </Box>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
