import { useState } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Stack,
  Typography,
  Divider,
  Button,
  alpha,
} from '@mui/material';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import { notifications as initialNotifications } from '../../data/mockData';

const severityColor = {
  critical: 'error.main',
  warning: 'warning.main',
  success: 'success.main',
  info: 'secondary.main',
};

export default function NotificationsMenu() {
  const [anchor, setAnchor] = useState(null);
  const [items, setItems] = useState(initialNotifications);
  const unread = items.filter((n) => !n.read).length;

  return (
    <>
      <IconButton onClick={(e) => setAnchor(e.currentTarget)}>
        <Badge badgeContent={unread} color="error">
          <NotificationsRoundedIcon />
        </Badge>
      </IconButton>
      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 380, borderRadius: 3, mt: 1 } } }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}>
          <Typography variant="subtitle1">Notifications</Typography>
          <Button size="small" onClick={() => setItems((its) => its.map((i) => ({ ...i, read: true })))}>
            Mark all read
          </Button>
        </Stack>
        <Divider />
        <Box sx={{ maxHeight: 380, overflowY: 'auto' }}>
          {items.map((n) => (
            <Box
              key={n.id}
              sx={{
                px: 2,
                py: 1.5,
                display: 'flex',
                gap: 1.5,
                bgcolor: n.read ? 'transparent' : (t) => alpha(t.palette.secondary.main, 0.06),
                borderBottom: (t) => `1px solid ${t.palette.divider}`,
                '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.06) },
              }}
            >
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: severityColor[n.severity], mt: 0.7, flexShrink: 0 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {n.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                  {n.body}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {n.time}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
        <Divider />
        <Button fullWidth sx={{ borderRadius: 0, py: 1.25 }} href="/notifications" component="a">
          View all notifications
        </Button>
      </Popover>
    </>
  );
}
