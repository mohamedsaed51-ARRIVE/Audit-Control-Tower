import { Stack, Typography, Box } from '@mui/material';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';

export default function EmptyState({ icon, title = 'Nothing here yet', description = 'Try adjusting your filters or search.', action }) {
  return (
    <Stack spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'center', py: 8, px: 3, textAlign: 'center' }}>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(11,15,50,0.05)'),
          color: 'text.secondary',
        }}
      >
        {icon || <InboxRoundedIcon fontSize="medium" />}
      </Box>
      <Typography variant="subtitle1">{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
        {description}
      </Typography>
      {action}
    </Stack>
  );
}
